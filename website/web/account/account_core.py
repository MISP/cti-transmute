import datetime
from flask_login import current_user
from sqlalchemy import desc, or_
from website.db_class.db import Comment, Convert, Notification, SystemLog, User, UserFollow
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

def get_user(id) -> User:
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



def edit_admin(id):
    """Edit the admin right"""
    user = get_user(id)
    if user:
        p = user.admin
        user.admin = not user.admin
        db.session.commit()
        return True , not p
    return False , False


def get_all_convert_own_by_user_id(id):
    """Change the owner of all the user's converts to the current user."""
    convert_list = []
    user = get_user(id)
    if user:
        converts = Convert.query.filter_by(user_id=id).all()

        for convert in converts:
            convert.user_id = current_user.id
            convert_list.append(convert)

        db.session.commit()

        return True
    else:
        return False
    

def delete(id):
    """Delete a user by ID."""
    user = get_user(id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return True
    else:
        return False


###################################
#   Follow service functions      #
###################################

def follow_user(follower_id, followed_id):
    """Follow a user. Returns (success, already_following)."""
    if follower_id == followed_id:
        return False, False
    existing = UserFollow.query.filter_by(follower_id=follower_id, followed_id=followed_id).first()
    if existing:
        return True, True
    try:
        follow = UserFollow(
            follower_id=follower_id,
            followed_id=followed_id,
            created_at=datetime.datetime.now(tz=datetime.timezone.utc)
        )
        db.session.add(follow)
        db.session.commit()
        return True, False
    except Exception as e:
        db.session.rollback()
        print("follow_user error:", e)
        return False, False


def unfollow_user(follower_id, followed_id):
    """Unfollow a user."""
    existing = UserFollow.query.filter_by(follower_id=follower_id, followed_id=followed_id).first()
    if not existing:
        return False
    db.session.delete(existing)
    db.session.commit()
    return True


def is_following(follower_id, followed_id):
    if not follower_id or not followed_id:
        return False
    return UserFollow.query.filter_by(follower_id=follower_id, followed_id=followed_id).first() is not None


def get_following(user_id, page=1, search=None):
    """Return paginated list of users that user_id follows."""
    if search:
        matched_ids = [
            u.id for u in User.query.filter(
                (User.first_name.ilike(f"%{search}%")) | (User.last_name.ilike(f"%{search}%"))
            ).all()
        ]
        return (
            UserFollow.query
            .filter_by(follower_id=user_id)
            .filter(UserFollow.followed_id.in_(matched_ids))
            .order_by(UserFollow.created_at.desc())
            .paginate(page=page, per_page=20)
        )
    return (
        UserFollow.query
        .filter_by(follower_id=user_id)
        .order_by(UserFollow.created_at.desc())
        .paginate(page=page, per_page=20)
    )


def get_followers_ids(user_id):
    """Return list of user_ids that follow user_id."""
    rows = UserFollow.query.filter_by(followed_id=user_id).all()
    return [r.follower_id for r in rows]


###################################
#   Notification service          #
###################################

def create_notification(user_id, notif_type, message, related_id=None, related_type=None, actor_id=None):
    """Create a notification for a user."""
    try:
        notif = Notification(
            user_id=user_id,
            type=notif_type,
            is_read=False,
            related_id=related_id,
            related_type=related_type,
            actor_id=actor_id,
            message=message,
            created_at=datetime.datetime.now(tz=datetime.timezone.utc)
        )
        db.session.add(notif)
        db.session.commit()
        return notif
    except Exception as e:
        db.session.rollback()
        print("create_notification error:", e)
        return None


def get_notifications(user_id, page=1, only_unread=False, search=None):
    """Return paginated notifications for a user."""
    query = Notification.query.filter_by(user_id=user_id)
    if only_unread:
        query = query.filter_by(is_read=False)
    if search:
        query = query.filter(Notification.message.ilike(f"%{search}%"))
    return query.order_by(Notification.created_at.desc()).paginate(page=page, per_page=20)


def get_all_notifications_admin(page=1, search=None):
    """Admin: all notifications across all users."""
    query = Notification.query
    if search:
        query = query.filter(Notification.message.ilike(f"%{search}%"))
    return query.order_by(Notification.created_at.desc()).paginate(page=page, per_page=20)


def delete_notification(notification_id, user_id, is_admin=False):
    """Delete a notification. Only owner or admin."""
    notif = Notification.query.get(notification_id)
    if not notif:
        return False
    if not is_admin and notif.user_id != user_id:
        return False
    db.session.delete(notif)
    db.session.commit()
    return True


def mark_notification_read(notification_id, user_id, is_admin=False):
    notif = Notification.query.get(notification_id)
    if not notif:
        return False
    if not is_admin and notif.user_id != user_id:
        return False
    notif.is_read = True
    db.session.commit()
    return True


def mark_all_read(user_id):
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()


def get_unread_count(user_id):
    return Notification.query.filter_by(user_id=user_id, is_read=False).count()


def notify_followers_new_convert(convert, actor_id):
    """Notify all followers of actor_id that a new public convert was created."""
    follower_ids = get_followers_ids(actor_id)
    actor = get_user(actor_id)
    actor_name = actor.first_name if actor else "Someone"
    for fid in follower_ids:
        create_notification(
            user_id=fid,
            notif_type="new_follow_convert",
            message=f"{actor_name} published a new conversion: {convert.name}",
            related_id=convert.id,
            related_type="convert",
            actor_id=actor_id
        )


def notify_admins_new_report(convert, reporter_id):
    """Notify all admin users that a new report was submitted."""
    admins = User.query.filter_by(admin=True).all()
    reporter = get_user(reporter_id)
    reporter_name = reporter.first_name if reporter else "Someone"
    convert_name = convert.name if convert else "Unknown"
    for admin in admins:
        create_notification(
            user_id=admin.id,
            notif_type="report_submitted",
            message=f"{reporter_name} reported convert: {convert_name}",
            related_id=convert.id,
            related_type="convert",
            actor_id=reporter_id
        )


def notify_comment_reply(parent_comment, reply_comment, actor_id):
    """Notify original comment author that their comment received a reply."""
    if not parent_comment.user_id or parent_comment.user_id == actor_id:
        return
    actor = get_user(actor_id)
    actor_name = actor.first_name if actor else "Someone"
    create_notification(
        user_id=parent_comment.user_id,
        notif_type="comment_reply",
        message=f"{actor_name} replied to your comment.",
        related_id=reply_comment.convert_id,
        related_type="convert",
        actor_id=actor_id
    )


###################################
#   User comments for profile     #
###################################

def get_user_comments(user_id, page=1, search=None):
    """Return paginated comments made by a user, with their convert info."""
    query = Comment.query.filter_by(user_id=user_id, is_deleted=False)
    if search:
        query = query.filter(Comment.content.ilike(f"%{search}%"))
    return query.order_by(Comment.created_at.desc()).paginate(page=page, per_page=20)


###################################
#   System log                    #
###################################

def create_system_log(event_type, actor_id=None, actor_name=None, target_type=None, target_id=None, target_name=None, details=None):
    try:
        log = SystemLog(
            event_type=event_type,
            actor_id=actor_id,
            actor_name=actor_name,
            target_type=target_type,
            target_id=target_id,
            target_name=target_name,
            details=details,
            created_at=datetime.datetime.now(tz=datetime.timezone.utc),
        )
        db.session.add(log)
        db.session.commit()
        return log
    except Exception as e:
        db.session.rollback()
        print("create_system_log error:", e)
        return None


def get_system_logs(page=1, search=None):
    query = SystemLog.query
    if search:
        query = query.filter(
            SystemLog.event_type.ilike(f"%{search}%") |
            SystemLog.actor_name.ilike(f"%{search}%") |
            SystemLog.target_name.ilike(f"%{search}%") |
            SystemLog.details.ilike(f"%{search}%")
        )
    return query.order_by(SystemLog.created_at.desc()).paginate(page=page, per_page=20)


def delete_system_log(log_id):
    log = SystemLog.query.get(log_id)
    if not log:
        return False
    db.session.delete(log)
    db.session.commit()
    return True
