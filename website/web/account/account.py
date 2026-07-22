from datetime import datetime, timedelta, timezone

from flask import Blueprint, abort, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required, login_user, logout_user
from sqlalchemy import func

from website.db_class.db import Comment as CommentModel
from website.db_class.db import Conversion, ConversionEvaluation, SystemLog, User
from website.db_class.db import Notification as NotifModel
from website.repos import conversions as conv_repo
from website.web import db
from website.web.account.account_form import AddNewUserForm, EditUserForm, LoginForm
from website.web.utils import form_to_dict, generate_api_key

from ..tags import tags_core as TagsModel
from . import account_core as AccountModel

account_blueprint = Blueprint(
    'account',
    __name__,
    template_folder='templates',
    static_folder='static'
)

@account_blueprint.route("/")
@login_required
def index() -> render_template:
    """Redirect to the user section"""
    return render_template("account/account_index.html", user=current_user)


@account_blueprint.route("/notifications")
@login_required
def notifications_page():
    return render_template("account/account_notifications.html")

@account_blueprint.route('/login', methods=['GET', 'POST'])
def login() -> redirect:
    """Log in an existing user."""
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user is not None and user.password_hash is not None and user.verify_password(form.password.data):
            login_user(user, form.remember_me.data)
            AccountModel.connected(current_user)
            AccountModel.create_system_log(
                'user_login', actor_id=user.id, actor_name=user.first_name, target_type='user',
                target_id=user.id, target_name=f'{user.first_name} {user.last_name}'
            )
            flash('You are now logged in. Welcome back!', 'success')
            return redirect('/')
        else:
            flash('Invalid email or password.', 'error')
    return render_template('account/login.html', form=form)

@account_blueprint.route('/logout')
@login_required
def logout() -> redirect:
    """Log out an User"""
    AccountModel.create_system_log(
        'user_logout', actor_id=current_user.id, actor_name=current_user.first_name, target_type='user',
        target_id=current_user.id, target_name=f'{current_user.first_name} {current_user.last_name}'
    )
    AccountModel.disconnected(current_user)
    logout_user()

    flash('You have been logged out.', 'info')
    return redirect(url_for('home.home'))



@account_blueprint.route("/profil")
@login_required
def profil() -> render_template:
    """Profil page"""
    return render_template("account/account_index.html", user=current_user)

@account_blueprint.route("/acces_denied")
@login_required
def acces_denied() -> render_template:
    """acces_denied page"""
    return abort(403)

@account_blueprint.route('/register', methods=['GET', 'POST'])
def add_user() -> redirect:
    """Add a new user"""
    form = AddNewUserForm()
    if form.validate_on_submit():
        form_dict = form_to_dict(form)
        form_dict["key"] = generate_api_key()
        user = AccountModel.add_user_core(form_dict)
        AccountModel.create_system_log(
            'user_registered', actor_id=user.id, actor_name=user.first_name, target_type='user',
            target_id=user.id, target_name=f'{user.first_name} {user.last_name}', details=f'email: {user.email}'
        )
        flash('You are now register. You can connect !', 'success')
        return redirect("/account/login")
    return render_template("account/register_user.html", form=form) 

@account_blueprint.route("/edit", methods=['GET', "POST"])
@login_required
def edit_user() -> redirect:
    """Edit the user"""
    form = EditUserForm()
    if form.validate_on_submit():
        form_dict = form_to_dict(form)
        changed = []
        if form_dict.get("first_name") != current_user.first_name:
            changed.append("first_name")
        if form_dict.get("last_name") != current_user.last_name:
            changed.append("last_name")
        if form_dict.get("email") != current_user.email:
            changed.append("email")
        if form_dict.get("password"):
            changed.append("password")
        AccountModel.edit_user_core(form_dict, current_user.id)
        AccountModel.create_system_log(
            "user_profile_edited", actor_id=current_user.id, actor_name=current_user.first_name, target_type="user",
            target_id=current_user.id, target_name=f"{current_user.first_name} {current_user.last_name}",
            details=f"changed: {', '.join(changed)}" if changed else "no changes"
        )
        flash('Profil update with success!', 'success')
        return redirect("/account")
    else:
        form.first_name.data = current_user.first_name
        form.last_name.data = current_user.last_name
        form.email.data = current_user.email
        # form.password.data = "" # current_user.password_hash
    return render_template("account/edit_user.html", form=form)

###########################
#   Public user profile   #
###########################

@account_blueprint.route("/public/<int:user_id>")
def public_profile(user_id):
    """Public profile page — no login required, shows only public data."""
    user = AccountModel.get_user(user_id)
    if not user:
        abort(404)
    is_auth     = current_user.is_authenticated
    is_own      = is_auth and current_user.id == user_id
    is_following = AccountModel.is_following(current_user.id, user_id) if is_auth and not is_own else False
    return render_template(
        "account/public_user.html",
        profile_user=user,
        is_auth=is_auth,
        is_own=is_own,
        is_following_init=is_following,
    )


@account_blueprint.route("/public_conversions/<int:user_id>")
def public_conversions(user_id):
    """Paginated public conversions for a user profile page."""

    page        = request.args.get('page', 1, type=int)
    filter_type = request.args.get('filter_type', type=str)
    sort_order  = request.args.get('sort_order', 'desc', type=str)
    search      = request.args.get('search', type=str)

    user = AccountModel.get_user(user_id)
    if not user:
        return {"success": False, "message": "User not found"}, 404

    pagination = conv_repo.list_by_user(
        page, user_id, filter_type, sort_order, search, filter_public="PUBLIC"
    )

    total = Conversion.query.filter_by(user_id=user_id, is_active=True, public=True).count()
    m2s   = Conversion.query.filter_by(user_id=user_id, is_active=True, public=True).filter(Conversion.conversion_type == 'MISP_TO_STIX').count()
    s2m   = Conversion.query.filter_by(user_id=user_id, is_active=True, public=True).filter(Conversion.conversion_type == 'STIX_TO_MISP').count()

    items = []
    if pagination:
        ids = [c.id for c in pagination.items]
        tags_by_conversion = TagsModel.get_conversion_tags_batch(ids)
        for c in pagination.items:
            entry = c.to_json_list()
            entry['tags'] = [a.to_json() for a in tags_by_conversion.get(c.id, [])]
            items.append(entry)

    return {
        "success": True,
        "list": items,
        "total_page": pagination.pages if pagination else 1,
        "stats": {"total": total, "misp_to_stix": m2s, "stix_to_misp": s2m},
    }, 200


#####################
#   Admin section   #
#####################

@account_blueprint.route("/manage_user", methods=['GET', "POST"])
@login_required
def manage_user() -> redirect:
    """Manage user section"""
    if current_user.is_admin():
        return render_template("admin/manage_user.html")
    return abort(403)

@account_blueprint.route("/get_users", methods=['GET'])
@login_required
def get_users():
    """History of the last conversion, with optional filter and sort"""
    page = request.args.get('page', 1, type=int)
    searchQuery = request.args.get('searchQuery',  type=str) 
    filterConnection = request.args.get('filterConnection',  type=str)
    filterAdmin = request.args.get('filterAdmin',  type=str)
    if current_user.is_admin():
        pagination , total_admin, total_connected = AccountModel.get_users_page(
            page, searchQuery=searchQuery, filterConnection=filterConnection, filterAdmin=filterAdmin
        )
        users_list = [item.to_json() for item in pagination.items]

        return {
            "list": users_list,
            "total_page": pagination.pages,
            "success": True,
            "total_users": pagination.total,
            "admin": total_admin,
            "connected": total_connected
        }, 200
    else:
        return abort(403)

@account_blueprint.route("/detail_user/<int:id>", methods=['GET', "POST"])
@login_required
def detail_user(id) -> redirect:
    """Manage user section"""
    if current_user.is_admin():
        user = AccountModel.get_user(id)
        if user:
            return render_template("admin/detail_user.html" , user=user)
        else:
            flash('No user with this id !', 'danger')
            return redirect("/admin/manage_user")
    return abort(403)

@account_blueprint.route("/get_user", methods=['GET', "POST"])
@login_required
def get_user() -> redirect:
    """Manage user section"""
    id = request.args.get('user_id', type=int)
    if current_user.is_admin():
        user = AccountModel.get_user(id)
        if user:
            return {
                "success": True,
                "user": user.to_json(),
                "Message": "All good"
            }, 200
           
        else:
            return {
                "success": False,
                "user": None,
                "Message": " No user found with this id "
            }, 404
    return abort(403)


@account_blueprint.route("/get_user_conversions", methods=['GET', "POST"])
@login_required
def get_user_conversions() -> redirect:
    """Manage user section"""
    id = request.args.get('user_id', type=int)
    page = request.args.get('page', 1, type=int)
    filter_type = request.args.get('filter_type',  type=str)  
    sort_order = request.args.get('sort_order',  type=str) 
    searchQuery = request.args.get('searchQuery',  type=str) 
    filter_public = request.args.get('filter_public',  type=str)  
    if current_user.is_admin():
        user = AccountModel.get_user(id)
        if user:
            user_conversions = conv_repo.list_by_user(page, user.id , filter_type, sort_order, searchQuery , filter_public)
            if user_conversions:
                user_conversion_list = [item.to_json() for item in user_conversions.items]
                return {
                    "success": True,
                    "list": user_conversion_list,
                    "total_page": user_conversions.pages,
                    "Message": "All good"
                }, 200
            return {
                "success": False,
                "user": None,
                "Message": " Error to access to db"
            }, 500
        else:
            return {
                "success": False,
                "user": None,
                "Message": " No user found with this id "
            }, 404
    return abort(403)




@account_blueprint.route("/delete/<int:id>", methods=['GET', "POST"])
@login_required
def delete_user(id) -> redirect:
    """Delete the user"""
    if current_user.is_admin():
        user = AccountModel.get_user(id)
        if user:
            if user.id == current_user.id:
                flash("You can't delete you account because you are admin!", 'danger')
                return redirect(f"/account/detail_user/{id}")
            else:
                _success = AccountModel.get_all_conversions_own_by_user_id(id)
                if _success:
                    _deleted_name = f"{user.first_name} {user.last_name}"
                    _deleted_id = user.id
                    success = AccountModel.delete(user.id)
                    if success:
                        AccountModel.create_system_log(
                            "user_deleted", actor_id=current_user.id, actor_name=current_user.first_name,
                            target_type="user", target_id=_deleted_id, target_name=_deleted_name
                        )
                        flash(f"User {user.last_name} {user.first_name} deleted with success", 'success')
                        return redirect("/account/manage_user")
                    else:
                        flash(f"Enable to delete User: {user.last_name} {user.first_name}!", 'danger')
                        return redirect(f"/account/detail_user/{id}")
                else:
                    flash(f"Enable to delete User: {user.last_name} {user.first_name}!", 'danger')
                    return redirect(f"/account/detail_user/{id}")

        flash(f"Enable to delete User: {user.last_name} {user.first_name}!", 'danger')
        return redirect(f"/account/detail_user/{id}")
    return abort(403)



###########################
#   Follow / Unfollow     #
###########################

@account_blueprint.route("/follow", methods=['GET'])
@login_required
def follow_user():
    """Follow or unfollow a user."""
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return {"success": False, "message": "Missing user_id", "toast_class": "danger"}, 400
    if user_id == current_user.id:
        return {"success": False, "message": "You cannot follow yourself", "toast_class": "warning"}, 400

    target = AccountModel.get_user(user_id)
    if not target:
        return {"success": False, "message": "User not found", "toast_class": "danger"}, 404

    already = AccountModel.is_following(current_user.id, user_id)
    if already:
        AccountModel.unfollow_user(current_user.id, user_id)
        AccountModel.create_system_log(
            'user_unfollowed', actor_id=current_user.id, actor_name=current_user.first_name,
            target_type="user", target_id=user_id, target_name=target.first_name
        )
        return {"success": True, "following": False, "message": f"You unfollowed {target.first_name}", "toast_class": "info"}, 200
    else:
        AccountModel.follow_user(current_user.id, user_id)
        AccountModel.create_system_log(
            'user_followed', actor_id=current_user.id, actor_name=current_user.first_name,
            target_type="user", target_id=user_id, target_name=target.first_name
        )
        return {"success": True, "following": True, "message": f"You are now following {target.first_name}", "toast_class": "success"}, 200


@account_blueprint.route("/is_following", methods=['GET'])
@login_required
def is_following():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return {"success": False}, 400
    return {"success": True, "following": AccountModel.is_following(current_user.id, user_id)}, 200


@account_blueprint.route("/get_followers", methods=['GET'])
@login_required
def get_followers():
    page   = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str) or None
    pagination = AccountModel.get_followers(current_user.id, page=page, search=search)
    items = []
    for f in pagination.items:
        user = AccountModel.get_user(f.follower_id)
        if user:
            items.append({
                "user_id": user.id,
                "name":    f"{user.first_name} {user.last_name}",
                "since":   f.created_at.strftime('%Y-%m-%d') if f.created_at else None,
            })
    return {"success": True, "list": items, "total_page": pagination.pages}, 200


@account_blueprint.route("/search_users", methods=['GET'])
@login_required
def search_users():
    query = (request.args.get('q', '', type=str) or '').strip()
    page  = request.args.get('page', 1, type=int)
    pagination = AccountModel.search_users_for_follow(query, current_user.id, page=page)
    result = []
    for u in pagination.items:
        public_count = conv_repo.list_by_user(1, u.id, filter_public="PUBLIC")
        result.append({
            "user_id":      u.id,
            "name":         f"{u.first_name} {u.last_name}",
            "is_following": AccountModel.is_following(current_user.id, u.id),
            "public_count": public_count.total if public_count else 0,
        })
    return {"success": True, "list": result, "total_page": pagination.pages}, 200


@account_blueprint.route("/get_following", methods=['GET'])
@login_required
def get_following():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str) or None
    pagination = AccountModel.get_following(current_user.id, page=page, search=search)
    items = []
    for f in pagination.items:
        user = AccountModel.get_user(f.followed_id)
        if user:
            items.append({
                "user_id": user.id,
                "name": f"{user.first_name} {user.last_name}",
                "since": f.created_at.strftime('%Y-%m-%d') if f.created_at else None
            })
    return {"success": True, "list": items, "total_page": pagination.pages}, 200


###########################
#   Notifications         #
###########################

@account_blueprint.route("/get_notification_count", methods=['GET'])
@login_required
def get_notification_count():
    count = AccountModel.get_unread_count(current_user.id)
    return {"success": True, "count": count}, 200


@account_blueprint.route("/get_notifications", methods=['GET'])
@login_required
def get_notifications():
    page = request.args.get('page', 1, type=int)
    only_unread = request.args.get('only_unread', 'false').lower() == 'true'
    search = request.args.get('search', '', type=str) or None
    pagination = AccountModel.get_notifications(current_user.id, page=page, only_unread=only_unread, search=search)
    return {
        "success": True,
        "list": [n.to_json() for n in pagination.items],
        "total_page": pagination.pages
    }, 200


@account_blueprint.route("/delete_notification", methods=['GET'])
@login_required
def delete_notification():
    notification_id = request.args.get('notification_id', type=int)
    if not notification_id:
        return {"success": False, "message": "Missing notification_id", "toast_class": "danger"}, 400
    success = AccountModel.delete_notification(notification_id, current_user.id, current_user.is_admin())
    if success:
        return {"success": True, "message": "Notification deleted", "toast_class": "success"}, 200
    return {"success": False, "message": "Not found or forbidden", "toast_class": "danger"}, 403


@account_blueprint.route("/mark_notification_read", methods=['GET'])
@login_required
def mark_notification_read():
    notification_id = request.args.get('notification_id', type=int)
    if not notification_id:
        return {"success": False, "message": "Missing notification_id"}, 400
    success = AccountModel.mark_notification_read(notification_id, current_user.id, current_user.is_admin())
    return {"success": success}, 200


@account_blueprint.route("/mark_all_read", methods=['GET'])
@login_required
def mark_all_read():
    AccountModel.mark_all_read(current_user.id)
    return {"success": True, "message": "All notifications marked as read", "toast_class": "success"}, 200


###########################
#   My Comments (profile) #
###########################

@account_blueprint.route("/my_comments", methods=['GET'])
@login_required
def my_comments():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str) or None
    pagination = AccountModel.get_user_comments(current_user.id, page=page, search=search, is_admin=current_user.is_admin())
    items = []
    for c in pagination.items:
        conversion = conv_repo.get(c.conversion_id, include_deleted=True)
        item = c.to_json(current_user_id=current_user.id, is_admin=current_user.is_admin())
        item["conversion_name"] = conversion.name if conversion else "Unknown"
        item["conversion_id"] = c.conversion_id
        item["conversion_active"] = bool(conversion and conversion.is_active)
        item["has_replies"] = c.replies.count() > 0
        item["is_reply"] = bool(c.parent_id)
        if c.parent_id:
            parent = CommentModel.query.get(c.parent_id)
            if parent:
                item["parent_author"] = parent.get_author_name()
                item["parent_preview"] = (parent.content[:120] + "…" if len(parent.content) > 120 else parent.content) if not parent.is_deleted else "[deleted]"
            else:
                item["parent_author"] = "Unknown"
                item["parent_preview"] = "[deleted]"
        items.append(item)
    return {"success": True, "list": items, "total_page": pagination.pages}, 200


#####################
#   Admin Panel     #
#####################

@account_blueprint.route("/admin/comments", methods=['GET'])
@login_required
def admin_comments():
    if not current_user.is_admin():
        return abort(403)
    return render_template("admin/admin_comments.html")


@account_blueprint.route("/admin/reports", methods=['GET'])
@login_required
def admin_reports():
    if not current_user.is_admin():
        return abort(403)
    return render_template("admin/admin_reports.html")


@account_blueprint.route("/admin/logs", methods=['GET'])
@login_required
def admin_logs():
    if not current_user.is_admin():
        return abort(403)
    return render_template("admin/admin_logs.html")


@account_blueprint.route("/admin/deleted_conversions", methods=['GET'])
@login_required
def admin_deleted_conversions():
    if not current_user.is_admin():
        return abort(403)
    return render_template("admin/deleted_conversions.html")


@account_blueprint.route("/admin/deleted_converts", methods=['GET'])
def legacy_admin_deleted_converts():
    """301 shim for the pre-rename page URL — bookmarks and ``?highlight=``
    deep links survive one release, like the ticket-04 ``/convert`` shim."""
    dest = url_for(".admin_deleted_conversions")
    query = request.query_string.decode()
    if query:
        dest += "?" + query
    return redirect(dest, code=301)


@account_blueprint.route("/admin/get_all_notifications", methods=['GET'])
@login_required
def admin_get_all_notifications():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403

    page       = request.args.get('page', 1, type=int)
    search     = request.args.get('search', '', type=str) or None
    log_type   = request.args.get('log_type', 'all')
    date_from_s = request.args.get('date_from', '', type=str)
    date_to_s   = request.args.get('date_to',   '', type=str)

    try:
        date_from = datetime.strptime(date_from_s, '%Y-%m-%d') if date_from_s else None
    except ValueError:
        date_from = None
    try:
        date_to = datetime.strptime(date_to_s, '%Y-%m-%d').replace(hour=23, minute=59, second=59) if date_to_s else None
    except ValueError:
        date_to = None

    def apply_date(q, model):
        if date_from:
            q = q.filter(model.created_at >= date_from)
        if date_to:
            q = q.filter(model.created_at <= date_to)
        return q

    if log_type == 'notifications':
        q = NotifModel.query
        if search:
            q = q.filter(NotifModel.message.ilike(f"%{search}%"))
        q = apply_date(q, NotifModel)
        p = q.order_by(NotifModel.created_at.desc()).paginate(page=page, per_page=20, error_out=False)
        return {"success": True, "list": [dict(n.to_json(), source='notification') for n in p.items], "total_page": p.pages or 1}, 200

    if log_type == 'system':
        q = SystemLog.query
        if search:
            q = q.filter(
                SystemLog.event_type.ilike(f"%{search}%") |
                SystemLog.actor_name.ilike(f"%{search}%") |
                SystemLog.target_name.ilike(f"%{search}%") |
                SystemLog.details.ilike(f"%{search}%")
            )
        q = apply_date(q, SystemLog)
        p = q.order_by(SystemLog.created_at.desc()).paginate(page=page, per_page=20, error_out=False)
        return {"success": True, "list": [dict(line.to_json(), source='system') for line in p.items], "total_page": p.pages or 1}, 200

    # Merge both
    per_page = 20
    nq = apply_date(NotifModel.query, NotifModel)
    sq = apply_date(SystemLog.query, SystemLog)
    if search:
        nq = nq.filter(NotifModel.message.ilike(f"%{search}%"))
        sq = sq.filter(
            SystemLog.event_type.ilike(f"%{search}%") |
            SystemLog.actor_name.ilike(f"%{search}%") |
            SystemLog.target_name.ilike(f"%{search}%") |
            SystemLog.details.ilike(f"%{search}%")
        )
    notifs  = [dict(n.to_json(), source='notification') for n in nq.all()]
    syslogs = [dict(sl.to_json(), source='system') for sl in sq.all()]
    merged  = sorted(notifs + syslogs, key=lambda x: x.get('created_at', '') or '', reverse=True)
    total      = len(merged)
    total_page = max(1, (total + per_page - 1) // per_page)
    start      = (page - 1) * per_page
    return {"success": True, "list": merged[start:start + per_page], "total_page": total_page}, 200


@account_blueprint.route("/admin/delete_log", methods=['GET'])
@login_required
def admin_delete_log():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    log_id = request.args.get('log_id', type=int)
    source = request.args.get('source', 'notification')
    if not log_id:
        return {"success": False, "message": "Missing log_id", "toast_class": "danger"}, 400
    if source == 'system':
        success = AccountModel.delete_system_log(log_id)
    else:
        success = AccountModel.delete_notification(log_id, current_user.id, is_admin=True)
    if success:
        return {"success": True, "message": "Log deleted", "toast_class": "success"}, 200
    return {"success": False, "message": "Not found", "toast_class": "danger"}, 404


@account_blueprint.route("/admin/delete_logs_bulk", methods=['POST'])
@login_required
def admin_delete_logs_bulk():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    entries = (request.get_json(silent=True) or {}).get('entries', [])
    if not entries:
        return {"success": False, "message": "Nothing to delete", "toast_class": "warning"}, 400
    count = AccountModel.delete_logs_bulk(entries)
    return {"success": True, "message": f"{count} log(s) deleted", "toast_class": "success", "count": count}, 200


@account_blueprint.route("/admin/delete_logs_all", methods=['POST'])
@login_required
def admin_delete_logs_all():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    data       = request.get_json(silent=True) or {}
    log_type   = data.get('log_type', 'all')
    date_from_s = data.get('date_from', '')
    date_to_s   = data.get('date_to',   '')
    try:
        date_from = datetime.strptime(date_from_s, '%Y-%m-%d') if date_from_s else None
    except ValueError:
        date_from = None
    try:
        date_to = datetime.strptime(date_to_s, '%Y-%m-%d').replace(hour=23, minute=59, second=59) if date_to_s else None
    except ValueError:
        date_to = None
    count = AccountModel.delete_all_logs(log_type=log_type, date_from=date_from, date_to=date_to)
    return {"success": True, "message": f"{count} log(s) deleted", "toast_class": "success", "count": count}, 200


@account_blueprint.route("/edit_admin", methods=['POST'])
@login_required
def edit_admin():
    """Manage admin right for user"""
    if current_user.is_admin():
        id = (request.get_json(silent=True) or {}).get('id') or request.args.get('id', type=int)
        if id:
            id = int(id)
        if id:
            user = AccountModel.get_user(id)
            if user:
                if current_user.id == user.id:
                    return {
                            "success": False, 
                            "message": "You can't remove your admin right ", 
                            "admin": user.admin,
                            "toast_class" : "info"
                        }, 200
                else:
                    success , _bool = AccountModel.edit_admin(id)
                    if success:
                        if _bool:
                            message="This user has admin right now"
                            AccountModel.create_system_log("user_admin_granted", actor_id=current_user.id, actor_name=current_user.first_name, target_type="user", target_id=user.id, target_name=f"{user.first_name} {user.last_name}")
                        else:
                            message="This user has no more admin right now"
                            AccountModel.create_system_log("user_admin_revoked", actor_id=current_user.id, actor_name=current_user.first_name, target_type="user", target_id=user.id, target_name=f"{user.first_name} {user.last_name}")
                        return {
                            "success": True, 
                            "admin": user.admin,
                            "message": message, 
                            "toast_class" : "success"
                            }, 200
                    return {
                        "success": False, 
                        "message": "Error during the edit of the public/private section", 
                        "toast_class" : "danger"
                    }, 500
            return {
                "success": False, 
                "message": "No conversion history for this id",
                "toast_class" : "danger"
                }, 500
        return {
            "success": False,
            "message": "No id provided",
            "toast_class" : "danger"
            }, 404

    return abort(403)


@account_blueprint.route("/admin_edit_user", methods=['POST'])
@login_required
def admin_edit_user():
    """Admin edits a user's first name, last name, or email."""
    if not current_user.is_admin():
        return {"success": False, "message": "Access denied", "toast_class": "danger"}, 403

    data = request.get_json(silent=True) or {}
    user_id    = data.get('id')
    first_name = (data.get('first_name') or '').strip()
    last_name  = (data.get('last_name')  or '').strip()
    email      = (data.get('email')      or '').strip()

    if not user_id or not first_name or not last_name or not email:
        return {"success": False, "message": "All fields are required.", "toast_class": "danger"}, 400

    user = AccountModel.get_user(int(user_id))
    if not user:
        return {"success": False, "message": "User not found.", "toast_class": "danger"}, 404

    taken = User.query.filter_by(email=email).first()
    if taken and taken.id != user.id:
        return {"success": False, "message": "Email already in use.", "toast_class": "danger"}, 409

    AccountModel.edit_user_core(
        {"first_name": first_name, "last_name": last_name, "email": email},
        user.id
    )
    AccountModel.create_system_log(
        "user_edited",
        actor_id=current_user.id, actor_name=current_user.first_name,
        target_type="user", target_id=user.id,
        target_name=f"{first_name} {last_name}"
    )
    return {"success": True, "message": "User updated.", "toast_class": "success", "user": user.to_json()}, 200


@account_blueprint.route("/get_user_stats", methods=['GET'])
@login_required
def get_user_stats():
    """Return aggregate stats for a user (admin only)."""
    if not current_user.is_admin():
        return {"success": False}, 403

    user_id = request.args.get('user_id', type=int)
    user = AccountModel.get_user(user_id)
    if not user:
        return {"success": False}, 404

    total  = Conversion.query.filter_by(user_id=user_id, is_active=True).count()
    m2s    = Conversion.query.filter_by(user_id=user_id, is_active=True).filter(Conversion.conversion_type == 'MISP_TO_STIX').count()
    s2m    = Conversion.query.filter_by(user_id=user_id, is_active=True).filter(Conversion.conversion_type == 'STIX_TO_MISP').count()
    public = Conversion.query.filter_by(user_id=user_id, is_active=True, public=True).count()

    likes     = ConversionEvaluation.query.filter_by(user_id=user_id, eval_type='like').count()
    dislikes  = ConversionEvaluation.query.filter_by(user_id=user_id, eval_type='dislike').count()
    reactions = ConversionEvaluation.query.filter_by(user_id=user_id, eval_type='reaction').count()

    since = datetime.now(timezone.utc) - timedelta(days=29)
    rows = (
        db.session.query(func.date(Conversion.created_at).label('d'), func.count(Conversion.id).label('n'))
        .filter(Conversion.user_id == user_id, Conversion.is_active, Conversion.created_at >= since)
        .group_by(func.date(Conversion.created_at))
        .all()
    )
    activity = {str(r.d): r.n for r in rows}

    return {
        "success": True,
        "stats": {
            "total_conversions": total,
            "misp_to_stix":      m2s,
            "stix_to_misp":      s2m,
            "public":            public,
            "private":           total - public,
            "likes":             likes,
            "dislikes":          dislikes,
            "reactions":         reactions,
            "activity":          activity
        }
    }, 200
   