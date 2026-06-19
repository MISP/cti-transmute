# website/web/convert/convert_service.py
import io
import json
import random
import requests
import string
import uuid
from datetime import datetime, timedelta, timezone
from flask_login import current_user
from sqlalchemy import asc, desc, func, or_
from sqlite3 import IntegrityError
from website.db_class.db import (
    Comment, CommentReaction, Conversion, ConversionFavorite, ConversionHistory,
    ConversionReport, ConversionTagAssociation, GraphConfig)
from website.db_class.db import Tag as TagModel
from website.web import db
from website.web.utils import generate_api_key


def create_convert(user_id, input_text, output_text, convert_choice, description, name, public):
    """
    Create a new Conversion entry from API response and save history.
    input_text: original file content
    output_text: converted content
    """
    try:
        now = datetime.now(timezone.utc)
        if convert_choice == "MISP_TO_STIX":
            _name = f"STIX_{now.strftime('%Y%m%d%H%M%S')}"
        else:
            _name = f"MISP_{now.strftime('%Y%m%d%H%M%S')}"

        MAX_NAME_LEN = 100
        final_name = name or _name

        if len(final_name) > MAX_NAME_LEN:
            final_name = final_name[:MAX_NAME_LEN]

        existing = Conversion.query.filter_by(name=final_name).first()
        if existing:
            suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            final_name = f"{final_name[:MAX_NAME_LEN - 7]}_{suffix}"

        _source, _, _target = convert_choice.partition("_TO_")
        convert = Conversion(
            user_id=user_id,
            name=final_name,
            source_format=_source.lower() or None,
            target_format=_target.lower() or None,
            input_text=input_text,
            output_text=output_text,
            description=description or f"STIX conversion saved at {now.isoformat()}",
            created_at=now,
            updated_at=now,
            public=public,
            uuid=str(uuid.uuid4()),
            share_key=generate_api_key(36)
        )
        db.session.add(convert)
        db.session.commit()
        return convert

    except IntegrityError:
        db.session.rollback()
        try:
            suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            convert.name = f"{final_name[:MAX_NAME_LEN - 7]}_{suffix}"
            db.session.add(convert)
            db.session.commit()
            return convert
        except Exception:
            db.session.rollback()
            return None

    except Exception as e:
        db.session.rollback()
        print("Exception:", e)
        return None


def delete_convert(conversion_id):
    """Soft-delete a Conversion entry (sets is_active=False)."""
    convert = Conversion.query.get(conversion_id)
    if not convert:
        return False
    convert.is_active = False
    convert.deleted_at = datetime.now(timezone.utc)
    db.session.commit()
    return True


def restore_convert(conversion_id):
    """Restore a soft-deleted convert."""
    convert = Conversion.query.get(conversion_id)
    if not convert or convert.is_active:
        return False

    convert.is_active = True
    convert.deleted_at = None
    db.session.commit()
    return True


def hard_delete_convert(conversion_id):
    """Permanently remove a convert from the database."""
    convert = Conversion.query.get(conversion_id)
    if not convert:
        return False
    db.session.delete(convert)
    db.session.commit()
    return True


def get_deleted_converts(page, user_id=None, search=None):
    """Return paginated soft-deleted converts. Scoped to user_id when provided."""
    query = Conversion.query.filter(Conversion.is_active)
    if user_id:
        query = query.filter(Conversion.user_id == user_id)
    if search:
        query = query.filter(Conversion.name.ilike(f"%{search}%"))
    query = query.order_by(desc(Conversion.deleted_at))
    return query.paginate(page=page, per_page=15)


def get_convert(conversion_id, include_deleted=False):
    """Get a Conversion entry by id. Soft-deleted converts are excluded by default."""
    convert = Conversion.query.get(conversion_id)
    if convert and not include_deleted and not convert.is_active:
        return None
    return convert


def list_all():
    """Return all Conversion entries"""
    return Conversion.query.all()


def get_convert_page(page, filter_type=None, sort_order='desc', only_mine='false', searchQuery=None, search_scope='all', date_from=None, date_to=None, exact_match=False, tag_names=None, vis_filter=None, favorites_only=False, favorites_user_id=None):
    """
    Return paginated conversion history with optional filter, sort and ownership filtering.
    - search_scope: 'all' | 'name' | 'description' | 'content'
    - exact_match: if True, search for exact phrase instead of contains
    """

    query = Conversion.query.filter(Conversion.is_active)
    if searchQuery:
        if exact_match:
            search_pattern = searchQuery  # exact, case-sensitive via ilike = case-insensitive exact
            def make_filter(col): return col.ilike(search_pattern)
        else:
            search_pattern = f"%{searchQuery}%"
            def make_filter(col): return col.ilike(search_pattern)

        if search_scope == 'name':
            query = query.filter(make_filter(Conversion.name))
        elif search_scope == 'description':
            query = query.filter(make_filter(Conversion.description))
        elif search_scope == 'content':
            query = query.filter(
                or_(make_filter(Conversion.input_text), make_filter(Conversion.output_text))
            )
        else:  # 'all'
            query = query.filter(
                or_(
                    make_filter(Conversion.name),
                    make_filter(Conversion.description),
                    make_filter(Conversion.input_text),
                    make_filter(Conversion.output_text),
                )
            )

    # Date range filter
    if date_from:
        try:
            query = query.filter(Conversion.created_at >= datetime.strptime(date_from, '%Y-%m-%d'))
        except ValueError:
            pass
    if date_to:
        try:
            dt_to = datetime.strptime(date_to, '%Y-%m-%d') + timedelta(days=1)
            query = query.filter(Conversion.created_at < dt_to)
        except ValueError:
            pass

    # Filter by conversion type if provided
    if filter_type:
        query = query.filter(Conversion.conversion_type == filter_type)

    # Visibility filter (public / private)
    if vis_filter == 'public':
        query = query.filter(Conversion.public)
    elif vis_filter == 'private':
        query = query.filter(not Conversion.public)

    # Conversion only_mine to boolean
    only_mine_bool = str(only_mine).lower() in ['true', '1', 'yes', 'on']

    # Check if user is connected
    
    if current_user.is_admin():
        # Admin sees everything: public + private + all users
        if only_mine_bool:
            # Admin wants to see only their own conversions
            query = query.filter(Conversion.user_id == current_user.id)
        # else: no filter, show absolutely everything    
    elif current_user.is_authenticated:
        if only_mine_bool:
            # Show only current user's conversions
            query = query.filter(Conversion.user_id == current_user.id)
        else:
            # Show public conversions and the user's private conversions
            query = query.filter(Conversion.public | (Conversion.user_id == current_user.id))
    else:
        # Anonymous user: only public conversions
        query = query.filter(Conversion.public)

    # Order by created_at
    if sort_order == 'asc':
        query = query.order_by(asc(Conversion.created_at))
    else:
        query = query.order_by(desc(Conversion.created_at))

    # Tag filter: convert must have ALL selected tags (AND logic)
    if tag_names:
        for tag_name in tag_names:
            subq = (
                db.session.query(ConversionTagAssociation.conversion_id)
                .join(TagModel, ConversionTagAssociation.tag_id == TagModel.id)
                .filter(func.lower(TagModel.name) == tag_name.lower())
                .subquery()
            )
            query = query.filter(Conversion.id.in_(subq))

    # Favorites filter
    if favorites_only and favorites_user_id:
        fav_subq = (
            db.session.query(ConversionFavorite.conversion_id)
            .filter(ConversionFavorite.user_id == favorites_user_id)
            .subquery()
        )
        query = query.filter(Conversion.id.in_(fav_subq))

    # Pagination
    return query.paginate(page=page, per_page=10)


# edit

def search_in_content(query_str, conversion_id, scope='all', context_chars=120):
    """
    Search for query_str in a single convert's texts and return snippets with match positions.
    Returns list of { field, snippet, match_start, match_end }
    """
    if not query_str:
        return []

    convert = get_convert(conversion_id)
    if not convert:
        return []

    results = []
    q_lower = query_str.lower()

    fields = []
    if scope in ('all', 'name'):
        fields.append(('name', convert.name or ''))
    if scope in ('all', 'description'):
        fields.append(('description', convert.description or ''))
    if scope in ('all', 'content'):
        fields.append(('input', convert.input_text or ''))
        fields.append(('output', convert.output_text or ''))

    for field_name, text in fields:
        text_lower = text.lower()
        start = 0
        seen_snippets = set()
        while True:
            idx = text_lower.find(q_lower, start)
            if idx == -1:
                break
            # Extract context around match
            snip_start = max(0, idx - context_chars)
            snip_end   = min(len(text), idx + len(query_str) + context_chars)
            snippet = ('…' if snip_start > 0 else '') + text[snip_start:snip_end] + ('…' if snip_end < len(text) else '')
            match_in_snip = idx - snip_start + (3 if snip_start > 0 else 0)  # offset for leading '…'

            key = (field_name, snip_start)
            if key not in seen_snippets:
                seen_snippets.add(key)
                results.append({
                    'field': field_name,
                    'snippet': snippet,
                    'match_start': match_in_snip,
                    'match_end': match_in_snip + len(query_str),
                })
            start = idx + 1
            if len(results) >= 10:  # cap per convert
                break

    return results


# edit

def edit_public(id):
    """Edit the public section"""
    convert = get_convert(id)
    if convert:
        p = convert.public
        convert.public = not convert.public
        db.session.commit()
        return True , not p
    return False , False

def edit_convert(id, data):
    """
    Edit the title (name) and description of a convert.
    Args:
        id (int): ID of the convert
        data (dict): Dictionary containing 'name' and/or 'description'
    Returns:
        bool: True if updated successfully, False if convert not found
    """
    convert = get_convert(id)
    if not convert:
        return False , 'no convert with this id'
    
    if convert.name != data.get('name', convert.name):
        existing = Conversion.query.filter_by(name=data.get('name', convert.name)).first()
        if existing:
            return False , 'Name already existe'

    # Update fields if provided
    convert.name = data.get('name', convert.name)
    convert.description = data.get('description', convert.description)

    # Commit changes
    db.session.commit()
    return True , ''

def get_convert_by_user(page, user_id, filter_type=None, sort_order='desc', searchQuery=None, filter_public=None):
    """
    Return paginated conversions created by a specific user.
    """
    if not user_id:
        return None

    query = Conversion.query.filter(Conversion.user_id == user_id, Conversion.is_active)

    if searchQuery:
        search_lower = f"%{searchQuery.lower()}%"
        query = query.filter(
            or_(
                Conversion.name.ilike(search_lower),
                Conversion.description.ilike(search_lower),
            )
        )

    if filter_type:
        query = query.filter(Conversion.conversion_type == filter_type)

    if sort_order == 'asc':
        query = query.order_by(asc(Conversion.created_at))
    else:
        query = query.order_by(desc(Conversion.created_at))

    if filter_public is not None:
        if isinstance(filter_public, str):
            if filter_public.upper() == "PUBLIC":
                filter_public = True
            elif filter_public.upper() == "PRIVATE":
                filter_public = False
            else:
                filter_public = None

        if filter_public is not None:
            query = query.filter(Conversion.public == filter_public)

    return query.paginate(page=page, per_page=10)

def get_convert_by_uuid(uuid):
    return Conversion.query.filter_by(uuid=uuid).first()

def regenerate_share_key_convert(conversion_id):
    """Regenerate the share key for a Conversion entry"""
    convert = get_convert(conversion_id)
    if not convert:
        return False , None
    convert.share_key = generate_api_key(36)
    db.session.commit()
    return True, convert.share_key


# convert/convert_core.py
def reconvert_conversion(convert_obj, form):
    """
    Dispatcher: call the right reconversion depending on the type.
    """
    if convert_obj.conversion_type == "MISP_TO_STIX":
        return reconvert_misp_to_stix(convert_obj, form)

    elif convert_obj.conversion_type == "STIX_TO_MISP":
        return reconvert_stix_to_misp(convert_obj, form)

    else:
        return None, None, "Unsupported conversion type"
    

# ---------------------------------------------------------
# MISP → STIX
# ---------------------------------------------------------
def reconvert_misp_to_stix(convert_obj, form):
    old_input = convert_obj.input_text
    old_output = convert_obj.output_text

    file_stream = io.BytesIO(old_input.encode("utf-8"))
    file_stream.name = "input.json"

    files = {"file": ("input.json", file_stream, "application/json")}
    params = {"version": form.version.data}

    try:
        response = requests.post(
            "http://127.0.0.1:6868/api/convert/misp_to_stix",
            files=files,
            params=params
        )

        new_data = response.json() if response.ok else None

        if not new_data or new_data.get("error"):
            return None, None, new_data.get("error", "Unknown error")

        new_output_json = json.dumps(new_data, indent=2)
        is_identical = (old_output.strip() == new_output_json.strip())

        if not is_identical:
            # create an history entry
            success, history_entry = create_history(
                convert_obj,
                user_id=current_user.id,
                comment="Reconversion triggered from history",
                new_output_text=new_output_json
            )
            if not success:
                return None, None, "Failed to create history entry"
        
        # create history entry
        

        return new_output_json, is_identical, None

    except Exception as e:
        return None, None, f"Conversion failed: {e}"


# ---------------------------------------------------------
# STIX → MISP
# ---------------------------------------------------------
def reconvert_stix_to_misp(convert_obj, form):
    """
    Re-run a STIX → MISP conversion using the original stored STIX input.
    """

    old_input = convert_obj.input_text
    old_output = convert_obj.output_text

    # Conversion stored input text into a simulated uploaded file
    file_stream = io.BytesIO(old_input.encode("utf-8"))
    file_stream.name = "input.json"

    files = {"file": ("input.json", file_stream, "application/json")}

    # Build parameters exactly like the macro template fields
    params = {
        "distribution": form.distribution.data,
        "sharing_group_id": form.sharing_group_id.data,
        "galaxies_as_tags": form.galaxies_as_tags.data,
        "no_force_contextual_data": form.no_force_contextual_data.data,
        "cluster_distribution": form.cluster_distribution.data,
        "cluster_sharing_group_id": form.cluster_sharing_group_id.data,
        "organisation_uuid": form.organisation_uuid.data,
        "single_event": form.single_event.data,
        "producer": form.producer.data,
        "title": form.title.data,
    }

    # Remove None values to avoid sending them as strings
    params = {k: v for k, v in params.items() if v not in [None, ""]}
    raw_params = params.copy()
    # Remove empty values AND remove booleans that are false
    params = {
        key: value
        for key, value in raw_params.items()
        if value not in [None, "", False, "False"]
    }

    # Add boolean flags only when True
    if form.galaxies_as_tags.data:
        params["galaxies_as_tags"] = ""

    if form.no_force_contextual_data.data:
        params["no_force_contextual_data"] = ""

    if form.single_event.data:
        params["single_event"] = ""

    try:
        response = requests.post(
            "http://127.0.0.1:6868/api/convert/stix_to_misp",
            files=files,
            params=params
        )

        if not response.ok:
            return None, None, f"Conversion HTTP error: {response.status_code}"

        try:
            new_data = response.json()
        except Exception:
            return None, None, "Invalid JSON returned from conversion API"

        if new_data.get("error"):
            return None, None, new_data["error"]

        # Prepare formatted output JSON
        new_output_json = json.dumps(new_data, indent=2)

        # Compare with old result
        is_identical = (old_output.strip() == new_output_json.strip())

        if not is_identical:
            # create an history entry
            success, history_entry = create_history(
                convert_obj,
                user_id=current_user.id,
                comment="Reconversion triggered from history",
                new_output_text=new_output_json
            )
            if not success:
                return None, None, "Failed to create history entry"
        

        # Update DB
        # convert_obj.output_text = new_output_json
        # convert_obj.description = form.description.data
        # convert_obj.public = form.public.data
        # convert_obj.updated_at = now

        # db.session.commit()

        return new_output_json, is_identical, None

    except Exception as e:
        return None, None, f"Conversion failed: {str(e)}"


#################################
#   History saving functions    #
#################################

def create_history(convert_obj, user_id=None, comment=None, new_output_text=None):
    if convert_obj is None:
        return False, None

    now = datetime.now(timezone.utc)

    try:
        # 1) Get the last version and check for potential duplicate
        last_entry = (
            ConversionHistory.query
            .filter_by(conversion_id=convert_obj.id, status='accepted')
            .order_by(ConversionHistory.version.desc())
            .first()
        )

        next_version = 2 if last_entry is None else last_entry.version + 1


        # Check for duplication (comparing input_text and new_output_text with the last entry)
        if last_entry:
            # Normalize texts for comparison (strip whitespace, etc., if necessary, but keep it simple here)
            last_input = last_entry.input_text.strip() if last_entry.input_text else None
            current_input = convert_obj.input_text.strip() if convert_obj.input_text else None

            last_output = last_entry.new_output_text.strip() if last_entry.new_output_text else None
            current_output = new_output_text.strip() if new_output_text else None
            
            # If the input text is identical AND the output text (new_output_text) is identical to the last recorded output
            # We assume a duplicate run.
            is_duplicate = (last_input == current_input and last_output == current_output)
            
            if is_duplicate:
                # If duplicate, return True without creating a new entry
                return True, last_entry

        # 2) UUID unique
        history_uuid = str(uuid.uuid4())

        # 3) Create history entry
        history = ConversionHistory(
            user_id=user_id,
            conversion_id=convert_obj.id,
            version=next_version,
            uuid=history_uuid,

            status="pending",
            public=convert_obj.public,

            input_text=convert_obj.input_text,

            old_output_text=convert_obj.output_text,
            new_output_text=new_output_text,

            created_at=now,
            comment=comment
        )

        db.session.add(history)
        db.session.commit()
        return True, history

    except Exception:
        db.session.rollback()
        return False, None


def get_latest_history(conversion_id):
    return ConversionHistory.query.filter_by(conversion_id=conversion_id).order_by(ConversionHistory.version.desc()).first()

def get_latest_history_list(conversion_id):
    return ConversionHistory.query.filter_by(conversion_id=conversion_id).order_by(ConversionHistory.version.desc()).all()

def get_history_list(conversion_id):
    return (
        ConversionHistory.query
        .filter_by(conversion_id=conversion_id, status="accepted")
        .order_by(ConversionHistory.version.asc())
        .all()
    )


def accept_history(history_id):
    history = ConversionHistory.query.get(history_id)
    if history is None:
        return False
    history.status = "accepted"

    # Update the main Conversion entry with the new output
    convert = history.convert
    convert.output_text = history.new_output_text
    convert.updated_at = datetime.now(timezone.utc)


    db.session.commit()
    return True

def reject_history(history_id):
    history = ConversionHistory.query.get(history_id)
    if history is None:
        return False
    history.status = "rejected"

    db.session.commit()
    return True

def get_convert_history_by_id(convert_history_id):
     return (
        ConversionHistory.query
        .filter_by(id=convert_history_id)
        .order_by(ConversionHistory.version.desc())
        .first()
    )


###################################
#   Comment service functions     #
###################################

def _can_see_comment(comment, convert_is_public, current_user_id, is_admin, convert_owner_id):
    """Determine if a user can see a specific comment."""
    if is_admin:
        return True
    if not convert_is_public:
        # Private convert: only its owner can see
        return current_user_id is not None and current_user_id == convert_owner_id
    if not comment.is_private:
        return True
    # Private comment on public convert: owner or comment author only
    if current_user_id is None:
        return False
    return current_user_id == convert_owner_id or current_user_id == comment.user_id


def create_comment(conversion_id, user_id, content, is_private=False, parent_id=None, is_evaluation=False):
    """Create a new comment or reply on a convert."""
    try:
        now = datetime.now(timezone.utc)
        comment = Comment(
            conversion_id=conversion_id,
            user_id=user_id,
            content=content.strip(),
            is_private=is_private,
            parent_id=parent_id,
            created_at=now,
            is_deleted=False,
            is_evaluation=bool(is_evaluation) if not parent_id else False,
        )
        db.session.add(comment)
        db.session.commit()
        return comment
    except Exception as e:
        db.session.rollback()
        print("create_comment error:", e)
        return None


def get_comments(conversion_id, current_user_id=None, is_admin=False, convert_owner_id=None):
    """Return visible top-level comments and their visible replies for a convert."""
    convert = get_convert(conversion_id)
    if not convert:
        return []

    convert_is_public = convert.public

    top_level = (
        Comment.query
        .filter_by(conversion_id=conversion_id, parent_id=None)
        .filter_by(is_deleted=False)
        .order_by(Comment.created_at.asc())
        .all()
    )

    result = []
    for c in top_level:
        if not _can_see_comment(c, convert_is_public, current_user_id, is_admin, convert_owner_id):
            continue
        comment_data = c.to_json(current_user_id=current_user_id, is_admin=is_admin, convert_owner_id=convert_owner_id)
        replies = (
            Comment.query
            .filter_by(conversion_id=conversion_id, parent_id=c.id)
            .filter_by(is_deleted=False)
            .order_by(Comment.created_at.asc())
            .all()
        )
        comment_data["replies"] = [
            r.to_json(current_user_id=current_user_id, is_admin=is_admin, convert_owner_id=convert_owner_id)
            for r in replies
            if _can_see_comment(r, convert_is_public, current_user_id, is_admin, convert_owner_id)
        ]
        result.append(comment_data)
    return result


def delete_comment(comment_id, requesting_user_id, is_admin=False):
    """Soft-delete a comment. Only author, convert owner, or admin can delete."""
    comment = Comment.query.get(comment_id)
    if not comment:
        return False, "Comment not found"
    convert = get_convert(comment.conversion_id)
    if not convert:
        return False, "Conversion not found"
    allowed = (
        is_admin or
        requesting_user_id == comment.user_id or
        requesting_user_id == convert.user_id
    )
    if not allowed:
        return False, "Permission denied"
    comment.is_deleted = True
    comment.content = "[deleted]"
    db.session.commit()
    return True, "Comment deleted"


def toggle_comment_private(comment_id, requesting_user_id, is_admin=False):
    """Toggle the private/public flag of a comment. Only author or admin."""
    comment = Comment.query.get(comment_id)
    if not comment:
        return False, "Comment not found", None
    if not is_admin and requesting_user_id != comment.user_id:
        return False, "Permission denied", None
    comment.is_private = not comment.is_private
    db.session.commit()
    return True, "Visibility updated", comment.is_private


def react_to_comment(comment_id, user_id, emoji):
    """Toggle an emoji reaction on a comment. Returns (added: bool)."""
    try:
        existing = CommentReaction.query.filter_by(
            comment_id=comment_id, user_id=user_id, emoji=emoji
        ).first()
        if existing:
            db.session.delete(existing)
            db.session.commit()
            return True, False  # success, added=False (removed)
        reaction = CommentReaction(
            comment_id=comment_id,
            user_id=user_id,
            emoji=emoji,
            created_at=datetime.now(timezone.utc)
        )
        db.session.add(reaction)
        db.session.commit()
        return True, True  # success, added=True
    except Exception as e:
        db.session.rollback()
        print("react_to_comment error:", e)
        return False, False


def edit_comment(comment_id, requesting_user_id, content):
    """Edit a comment's content. Only the original author can edit."""
    comment = Comment.query.get(comment_id)
    if not comment:
        return False, "Comment not found"
    if comment.is_deleted:
        return False, "Cannot edit a deleted comment"
    if comment.user_id != requesting_user_id:
        return False, "Permission denied"
    content = content.strip()
    if not content:
        return False, "Content cannot be empty"
    comment.content = content
    db.session.commit()
    return True, "Comment updated"


def get_comment(comment_id):
    return Comment.query.get(comment_id)


def get_all_comments_admin(page=1, search=None):
    """Admin: paginated list of all non-deleted comments across all converts."""
    query = Comment.query.filter_by(is_deleted=False)
    if search:
        query = query.filter(Comment.content.ilike(f"%{search}%"))
    return query.order_by(Comment.created_at.desc()).paginate(page=page, per_page=20)


###################################
#   Report service functions      #
###################################

REPORT_REASONS = ["spam", "inappropriate", "inaccurate", "other"]


def create_report(conversion_id, user_id, reason, description=None):
    """Submit a report on a convert."""
    try:
        report = ConversionReport(
            conversion_id=conversion_id,
            user_id=user_id,
            reason=reason,
            description=description,
            status="pending",
            created_at=datetime.now(timezone.utc)
        )
        db.session.add(report)
        db.session.commit()
        return report
    except Exception as e:
        db.session.rollback()
        print("create_report error:", e)
        return None


def get_reports(page=1, status=None, search=None):
    """Admin: paginated list of reports."""
    query = ConversionReport.query
    if status:
        query = query.filter_by(status=status)
    if search:
        query = query.filter(
            ConversionReport.reason.ilike(f"%{search}%") |
            ConversionReport.description.ilike(f"%{search}%")
        )
    return query.order_by(ConversionReport.created_at.desc()).paginate(page=page, per_page=20)


def review_report(report_id, new_status, reviewed_by_id):
    """Admin: update report status (reviewed / dismissed)."""
    report = ConversionReport.query.get(report_id)
    if not report:
        return False
    report.status = new_status
    report.reviewed_at = datetime.now(timezone.utc)
    report.reviewed_by = reviewed_by_id
    db.session.commit()
    return True


def get_report(report_id):
    return ConversionReport.query.get(report_id)


def delete_report(report_id):
    report = ConversionReport.query.get(report_id)
    if report:
        db.session.delete(report)
        db.session.commit()

###################################
#   Graph configs                 #
###################################

def get_graph_configs(user_id=None, is_admin=False):
    query = GraphConfig.query.filter(GraphConfig.is_active)
    if not is_admin:
        if user_id:
            query = query.filter(
                or_(GraphConfig.is_default, GraphConfig.created_by == user_id)
            )
        else:
            query = query.filter(GraphConfig.is_default)
    return query.order_by(GraphConfig.is_default.desc(), GraphConfig.created_at.desc()).all()


def save_graph_config(name, config_json, created_by):
    try:
        now = datetime.now(timezone.utc)
        cfg = GraphConfig(
            uuid=str(uuid.uuid4()),
            name=name.strip()[:100],
            config_json=config_json,
            created_by=created_by,
            is_active=True,
            is_default=False,
            created_at=now,
            updated_at=now,
        )
        db.session.add(cfg)
        db.session.commit()
        return cfg, None
    except Exception as e:
        db.session.rollback()
        return None, str(e)


def delete_graph_config(config_id, user_id, is_admin):
    cfg = GraphConfig.query.get(config_id)
    if not cfg:
        return False, "Not found"
    if cfg.is_default:
        return False, "Cannot delete system defaults"
    if not is_admin and cfg.created_by != user_id:
        return False, "Forbidden"
    try:
        if is_admin:
            db.session.delete(cfg)
        else:
            cfg.is_active = False
            cfg.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return True, None
    except Exception as e:
        db.session.rollback()
        return False, str(e)


###################################
#   Favorites                     #
###################################

def toggle_favorite(user_id: int, conversion_id: int) -> bool:
    """Toggle favorite for a user on a convert. Returns True if now favorited, False if removed."""
    existing = ConversionFavorite.query.filter_by(user_id=user_id, conversion_id=conversion_id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return False
    db.session.add(
        ConversionFavorite(
            user_id=user_id,
            conversion_id=conversion_id,
            created_at=datetime.now(timezone.utc)
        )
    )
    db.session.commit()
    return True


def get_favorite_ids(user_id: int) -> set:
    """Return the set of convert IDs favorited by this user."""
    rows = ConversionFavorite.query.filter_by(user_id=user_id).with_entities(ConversionFavorite.conversion_id).all()
    return {r.conversion_id for r in rows}


def is_favorite(user_id: int, conversion_id: int) -> bool:
    return ConversionFavorite.query.filter_by(user_id=user_id, conversion_id=conversion_id).first() is not None
