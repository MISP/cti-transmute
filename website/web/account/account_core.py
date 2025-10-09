from flask_login import current_user
from sqlalchemy import or_
from website.db_class.db import User
from website.web.utils import generate_api_key
from .. import db


# CRUD

# Create

def add_user_core(form_dict) -> User :
    """Add a user to the DB"""
    user = User(
        first_name=form_dict["first_name"],
        last_name=form_dict["last_name"],
        email=form_dict["email"],
        password=form_dict["password"],
        api_key = form_dict["key"] or generate_api_key()
    )
    db.session.add(user)
    db.session.commit()

    return user

# Update

def edit_user_core(form_dict, id) -> None:
    """Edit the user in the DB and optionally update password"""
    user = get_user(id)
    user.first_name = form_dict["first_name"]
    user.last_name = form_dict["last_name"]
    user.email = form_dict["email"]

    if form_dict.get("password"):  
        user.password = form_dict["password"] 
        # send_password_change_email(user.email, user.first_name)

    db.session.commit()

def connected(user) -> bool:
    """connected an user"""
    if not user.is_connected:
        user.is_connected = True
        db.session.commit()
    return user.is_connected

def disconnected(user) -> bool:
    """disconnected an user"""
    if user.is_connected:
        user.is_connected = False
        db.session.commit()
    return not user.is_connected

# Read

def get_admin_user()-> id:
    """Return the default user"""
    return User.query.filter_by(email='admin@admin.admin').first()

def get_user(id) -> id:
    """Return the user"""
    return User.query.get(id)

def get_user_by_lastname(lastname) -> str:
    """Return user's lastname"""
    return User.query.filter_by(last_name=lastname).all()

def get_username_by_id(user_id) -> str:
    """Return user's firstname """
    user = get_user(user_id)
    return user.first_name 

def get_users_page(page, searchQuery=None, filterConnection=None, filterAdmin=None):
    """Return paginated users with optional search and filters."""
    if not current_user.is_admin():
        return None

    query = User.query

    # Search filter
    if searchQuery:
        search_lower = f"%{searchQuery.lower()}%"
        query = query.filter(
            or_(
                User.first_name.ilike(search_lower),
                User.last_name.ilike(search_lower),
                User.email.ilike(search_lower)
            )
        )

    # Connection filter
    if filterConnection == "connected":
        query = query.filter(User.is_connected.is_(True))
    elif filterConnection == "disconnected":
        query = query.filter(User.is_connected.is_(False))

    # Admin filter
    if filterAdmin == "admin":
        query = query.filter(User.admin.is_(True))
    elif filterAdmin == "user":
        query = query.filter(User.admin.is_(False))

    # Pagination
    return query.paginate(page=page, per_page=10)