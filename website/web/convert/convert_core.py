# website/web/convert/convert_service.py
import json
from sqlite3 import IntegrityError
import uuid
from flask_login import AnonymousUserMixin, current_user
from website.db_class.db import Convert, ConvertHistory
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


        final_name = name or _name

        existing = Convert.query.filter_by(name=final_name).first()

        MAX_NAME_LEN = 100

        if existing:
            suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            base_length = MAX_NAME_LEN - (len(suffix) + 1)
            final_name = f"{final_name[:base_length]}_{suffix}"

        if len(final_name) > MAX_NAME_LEN:
            final_name = final_name[:MAX_NAME_LEN]

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

        return True

    except Exception as e:
        print("Exception:", e)
        return False





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


def get_convert_page(page, filter_type=None, sort_order='desc', only_mine='false', searchQuery=None):
    """
    Return paginated conversion history with optional filter, sort and ownership filtering.
    - page: int
    - filter_type: 'MISP_TO_STIX' | 'STIX_TO_MISP' | ''
    - sort_order: 'asc' or 'desc'
    - only_mine: 'true' | 'false' (string)
    """

    query = Convert.query
    if searchQuery:
        search_lower = f"%{searchQuery.lower()}%"
        query = query.filter(
            or_(
                Convert.name.ilike(search_lower),
                Convert.description.ilike(search_lower),
            )
        )

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