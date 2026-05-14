# website/web/convert/convert_service.py
import json
from sqlite3 import IntegrityError
import uuid
from flask_login import AnonymousUserMixin, current_user
from website.db_class.db import Comment, CommentReaction, Convert, ConvertHistory, ConvertReport
from website.web import db
from sqlalchemy import desc, asc, or_
import datetime
import random
import string

from website.web.utils import generate_api_key
def create_convert(user_id, input_text, output_text, convert_choice, description, name, public):
    """
    Create a new Convert entry from API response and save history.
    input_text: original file content
    output_text: converted content
    """
    try:
        now = datetime.datetime.now(tz=datetime.timezone.utc)
        if convert_choice == "MISP_TO_STIX":
            _name = f"STIX_{now.strftime('%Y%m%d%H%M%S')}"
        else:
            _name = f"MISP_{now.strftime('%Y%m%d%H%M%S')}"

        MAX_NAME_LEN = 100
        final_name = name or _name

        if len(final_name) > MAX_NAME_LEN:
            final_name = final_name[:MAX_NAME_LEN]

        existing = Convert.query.filter_by(name=final_name).first()
        if existing:
            suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            final_name = f"{final_name[:MAX_NAME_LEN - 7]}_{suffix}"

        convert = Convert(
            user_id=user_id,
            name=final_name,
            conversion_type=convert_choice,
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





def delete_convert(convert_id):
    """Delete a Convert entry"""
    convert = Convert.query.get(convert_id)
    if not convert:
        return False
    db.session.delete(convert)
    db.session.commit()
    return True


def get_convert(convert_id):
    """Get a Convert entry by id"""
    return Convert.query.get(convert_id)


def list_all():
    """Return all Convert entries"""
    return Convert.query.all()


def get_convert_page(page, filter_type=None, sort_order='desc', only_mine='false', searchQuery=None, search_scope='all', date_from=None, date_to=None, exact_match=False):
    """
    Return paginated conversion history with optional filter, sort and ownership filtering.
    - search_scope: 'all' | 'name' | 'description' | 'content'
    - exact_match: if True, search for exact phrase instead of contains
    """

    query = Convert.query
    if searchQuery:
        if exact_match:
            search_pattern = searchQuery  # exact, case-sensitive via ilike = case-insensitive exact
            def make_filter(col): return col.ilike(search_pattern)
        else:
            search_pattern = f"%{searchQuery}%"
            def make_filter(col): return col.ilike(search_pattern)

        if search_scope == 'name':
            query = query.filter(make_filter(Convert.name))
        elif search_scope == 'description':
            query = query.filter(make_filter(Convert.description))
        elif search_scope == 'content':
            query = query.filter(
                or_(make_filter(Convert.input_text), make_filter(Convert.output_text))
            )
        else:  # 'all'
            query = query.filter(
                or_(
                    make_filter(Convert.name),
                    make_filter(Convert.description),
                    make_filter(Convert.input_text),
                    make_filter(Convert.output_text),
                )
            )

    # Date range filter
    if date_from:
        try:
            query = query.filter(Convert.created_at >= datetime.datetime.strptime(date_from, '%Y-%m-%d'))
        except ValueError:
            pass
    if date_to:
        try:
            dt_to = datetime.datetime.strptime(date_to, '%Y-%m-%d') + datetime.timedelta(days=1)
            query = query.filter(Convert.created_at < dt_to)
        except ValueError:
            pass

    # Filter by conversion type if provided
    if filter_type:
        query = query.filter(Convert.conversion_type == filter_type)

    # Convert only_mine to boolean
    only_mine_bool = str(only_mine).lower() in ['true', '1', 'yes', 'on']

    # Check if user is connected
    
    if current_user.is_admin():
        # Admin sees everything: public + private + all users
        if only_mine_bool:
            # Admin wants to see only their own conversions
            query = query.filter(Convert.user_id == current_user.id)
        # else: no filter, show absolutely everything    
    elif current_user.is_authenticated:
        if only_mine_bool:
            # Show only current user's conversions
            query = query.filter(Convert.user_id == current_user.id)
        else:
            # Show public conversions and the user's private conversions
            query = query.filter((Convert.public == True) | (Convert.user_id == current_user.id))
    else:
        # Anonymous user: only public conversions
        query = query.filter(Convert.public == True)

    # Order by created_at
    if sort_order == 'asc':
        query = query.order_by(asc(Convert.created_at))
    else:
        query = query.order_by(desc(Convert.created_at))

    # Pagination
    return query.paginate(page=page, per_page=10)


# edit

def search_in_content(query_str, convert_id, scope='all', context_chars=120):
    """
    Search for query_str in a single convert's texts and return snippets with match positions.
    Returns list of { field, snippet, match_start, match_end }
    """
    if not query_str:
        return []

    convert = get_convert(convert_id)
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
        existing = Convert.query.filter_by(name=data.get('name', convert.name)).first()
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

    query = Convert.query.filter_by(user_id=user_id)

    if searchQuery:
        search_lower = f"%{searchQuery.lower()}%"
        query = query.filter(
            or_(
                Convert.name.ilike(search_lower),
                Convert.description.ilike(search_lower),
            )
        )

    if filter_type:
        query = query.filter(Convert.conversion_type == filter_type)

    if sort_order == 'asc':
        query = query.order_by(asc(Convert.created_at))
    else:
        query = query.order_by(desc(Convert.created_at))

    if filter_public is not None:
        if isinstance(filter_public, str):
            if filter_public.upper() == "PUBLIC":
                filter_public = True
            elif filter_public.upper() == "PRIVATE":
                filter_public = False
            else:
                filter_public = None

        if filter_public is not None:
            query = query.filter(Convert.public == filter_public)

    return query.paginate(page=page, per_page=10)

def get_convert_by_uuid(uuid):
    return Convert.query.filter_by(uuid=uuid).first()

def regenerate_share_key_convert(convert_id):
    """Regenerate the share key for a Convert entry"""
    convert = get_convert(convert_id)
    if not convert:
        return False , None
    convert.share_key = generate_api_key(36)
    db.session.commit()
    return True, convert.share_key


# convert/convert_core.py

import io
import json
import requests

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

    # Convert stored input text into a simulated uploaded file
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

    now = datetime.datetime.now(tz=datetime.timezone.utc)

    try:
        # 1) Get the last version and check for potential duplicate
        last_entry = (
            ConvertHistory.query
            .filter_by(convert_id=convert_obj.id, status='accepted')  
            .order_by(ConvertHistory.version.desc())
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
            is_duplicate = (
                last_input == current_input and
                last_output == current_output
            )
            
            if is_duplicate:
                # If duplicate, return True without creating a new entry
                return True, last_entry

        # 2) UUID unique
        history_uuid = str(uuid.uuid4())

        # 3) Create history entry
        history = ConvertHistory(
            user_id=user_id,
            convert_id=convert_obj.id,
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


def get_latest_history(convert_id):
    return ConvertHistory.query.filter_by(convert_id=convert_id).order_by(ConvertHistory.version.desc()).first()

def get_latest_history_list(convert_id):
    return ConvertHistory.query.filter_by(convert_id=convert_id).order_by(ConvertHistory.version.desc()).all()

def get_history_list(convert_id):
    return (
        ConvertHistory.query
        .filter_by(convert_id=convert_id, status="accepted")
        .order_by(ConvertHistory.version.asc())
        .all()
    )


def accept_history(history_id):
    history = ConvertHistory.query.get(history_id)
    if history is None:
        return False
    history.status = "accepted"

    # Update the main Convert entry with the new output
    convert = history.convert
    convert.output_text = history.new_output_text
    convert.updated_at = datetime.datetime.now(tz=datetime.timezone.utc)


    db.session.commit()
    return True

def reject_history(history_id):
    history = ConvertHistory.query.get(history_id)
    if history is None:
        return False
    history.status = "rejected"

    db.session.commit()
    return True

def get_convert_history_by_id(convert_history_id):
     return (
        ConvertHistory.query
        .filter_by(id=convert_history_id)
        .order_by(ConvertHistory.version.desc())
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


def create_comment(convert_id, user_id, content, is_private=False, parent_id=None):
    """Create a new comment or reply on a convert."""
    try:
        now = datetime.datetime.now(tz=datetime.timezone.utc)
        comment = Comment(
            convert_id=convert_id,
            user_id=user_id,
            content=content.strip(),
            is_private=is_private,
            parent_id=parent_id,
            created_at=now,
            is_deleted=False
        )
        db.session.add(comment)
        db.session.commit()
        return comment
    except Exception as e:
        db.session.rollback()
        print("create_comment error:", e)
        return None


def get_comments(convert_id, current_user_id=None, is_admin=False, convert_owner_id=None):
    """Return visible top-level comments and their visible replies for a convert."""
    convert = get_convert(convert_id)
    if not convert:
        return []

    convert_is_public = convert.public

    top_level = (
        Comment.query
        .filter_by(convert_id=convert_id, parent_id=None)
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
            .filter_by(convert_id=convert_id, parent_id=c.id)
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
    convert = get_convert(comment.convert_id)
    if not convert:
        return False, "Convert not found"
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
            created_at=datetime.datetime.now(tz=datetime.timezone.utc)
        )
        db.session.add(reaction)
        db.session.commit()
        return True, True  # success, added=True
    except Exception as e:
        db.session.rollback()
        print("react_to_comment error:", e)
        return False, False


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


def create_report(convert_id, user_id, reason, description=None):
    """Submit a report on a convert."""
    try:
        report = ConvertReport(
            convert_id=convert_id,
            user_id=user_id,
            reason=reason,
            description=description,
            status="pending",
            created_at=datetime.datetime.now(tz=datetime.timezone.utc)
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
    query = ConvertReport.query
    if status:
        query = query.filter_by(status=status)
    if search:
        query = query.filter(
            ConvertReport.reason.ilike(f"%{search}%") |
            ConvertReport.description.ilike(f"%{search}%")
        )
    return query.order_by(ConvertReport.created_at.desc()).paginate(page=page, per_page=20)


def review_report(report_id, new_status, reviewed_by_id):
    """Admin: update report status (reviewed / dismissed)."""
    report = ConvertReport.query.get(report_id)
    if not report:
        return False
    report.status = new_status
    report.reviewed_at = datetime.datetime.now(tz=datetime.timezone.utc)
    report.reviewed_by = reviewed_by_id
    db.session.commit()
    return True