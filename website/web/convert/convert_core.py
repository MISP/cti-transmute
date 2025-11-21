# website/web/convert/convert_service.py
import json
import uuid
from flask_login import AnonymousUserMixin, current_user
from website.db_class.db import Convert
from website.web import db
from sqlalchemy import desc, asc, or_
import datetime
import random
import string

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
        if existing:
            suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            final_name = f"{final_name}_{suffix}"

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
        )

        db.session.add(convert)
        db.session.commit()

        return True

    except Exception as e:
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