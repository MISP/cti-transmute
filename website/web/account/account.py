from flask import Blueprint, jsonify, render_template, redirect, request, url_for, flash

from website.db_class.db import User
from website.web.account.account_form import AddNewUserForm, EditUserForm, LoginForm
from website.web.utils import form_to_dict, generate_api_key
from . import account_core as AccountModel
from flask_login import current_user, login_required, login_user, logout_user
from ..convert import convert_core as ConvertModel

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
            flash('You are now logged in. Welcome back!', 'success')
            return redirect( "/")
        else:
            flash('Invalid email or password.', 'error')
    return render_template('account/login.html', form=form)

@account_blueprint.route('/logout')
@login_required
def logout() -> redirect:
    "Log out an User"
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
    return render_template("access_denied.html")

@account_blueprint.route('/register', methods=['GET', 'POST'])
def add_user() -> redirect:
    """Add a new user"""
    form = AddNewUserForm()
    if form.validate_on_submit():
        form_dict = form_to_dict(form)
        form_dict["key"] = generate_api_key()
        AccountModel.add_user_core(form_dict)
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
        AccountModel.edit_user_core(form_dict, current_user.id)
        flash('Profil update with success!', 'success')
        return redirect("/account")
    else:
        form.first_name.data = current_user.first_name
        form.last_name.data = current_user.last_name
        form.email.data = current_user.email
        # form.password.data = "" # current_user.password_hash
    return render_template("account/edit_user.html", form=form)

#####################
#   Admin section   #
#####################

@account_blueprint.route("/manage_user", methods=['GET', "POST"])
@login_required
def manage_user() -> redirect:
    """Manage user section"""
    if current_user.is_admin():
        return render_template("admin/manage_user.html")
    return render_template("access_denied.html")

@account_blueprint.route("/get_users", methods=['GET'])
@login_required
def get_users():
    """History of the last convert, with optional filter and sort"""
    page = request.args.get('page', 1, type=int)
    searchQuery = request.args.get('searchQuery',  type=str) 
    filterConnection = request.args.get('filterConnection',  type=str)
    filterAdmin = request.args.get('filterAdmin',  type=str)
    if current_user.is_admin():
        pagination = AccountModel.get_users_page(page, searchQuery=searchQuery, filterConnection=filterConnection, filterAdmin=filterAdmin)
        users_list = [item.to_json() for item in pagination.items]

        return {
            "list": users_list,
            "total_page": pagination.page,
            "success": False, 
        }, 200
    else:
        return render_template("access_denied.html")

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
    return render_template("access_denied.html")

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
    return render_template("access_denied.html")


@account_blueprint.route("/get_user_convert", methods=['GET', "POST"])
@login_required
def get_user_convert() -> redirect:
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
            user_convert = ConvertModel.get_convert_by_user(page, user.id , filter_type, sort_order, searchQuery , filter_public)
            if user_convert:
                user_convert_list = [item.to_json() for item in user_convert.items]
                return {
                    "success": True,
                    "list": user_convert_list,
                    "total_page": user_convert.pages,
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
    return render_template("access_denied.html")




@account_blueprint.route("/delete/<int:id>", methods=['GET', "POST"])
@login_required
def delete_user(id) -> redirect:
    """Delete the user"""
    if current_user.is_admin():
        user = AccountModel.get_user(id)
        if user:
            if user.id == current_user.id:
                flash(f"You can't delete you account because you are admin!", 'danger')
                return redirect(f"/account/detail_user/{id}")
            else:
                _success = AccountModel.get_all_convert_own_by_user_id(id)
                if _success:
                    success = AccountModel.delete(user.id)
                    if success:
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
    return render_template("access_denied.html")



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
        AccountModel.create_system_log("user_unfollowed", actor_id=current_user.id, actor_name=current_user.first_name, target_type="user", target_id=user_id, target_name=target.first_name)
        return {"success": True, "following": False, "message": f"You unfollowed {target.first_name}", "toast_class": "info"}, 200
    else:
        AccountModel.follow_user(current_user.id, user_id)
        AccountModel.create_system_log("user_followed", actor_id=current_user.id, actor_name=current_user.first_name, target_type="user", target_id=user_id, target_name=target.first_name)
        return {"success": True, "following": True, "message": f"You are now following {target.first_name}", "toast_class": "success"}, 200


@account_blueprint.route("/is_following", methods=['GET'])
@login_required
def is_following():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return {"success": False}, 400
    return {"success": True, "following": AccountModel.is_following(current_user.id, user_id)}, 200


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
                "email": user.email,
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
    from website.db_class.db import Convert, Comment as CommentModel
    items = []
    for c in pagination.items:
        convert = ConvertModel.get_convert(c.convert_id, include_deleted=True)
        item = c.to_json(current_user_id=current_user.id, is_admin=current_user.is_admin())
        item["convert_name"] = convert.name if convert else "Unknown"
        item["convert_id"] = c.convert_id
        item["convert_active"] = bool(convert and convert.is_active)
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
        return render_template("access_denied.html")
    return render_template("admin/admin_comments.html")


@account_blueprint.route("/admin/reports", methods=['GET'])
@login_required
def admin_reports():
    if not current_user.is_admin():
        return render_template("access_denied.html")
    return render_template("admin/admin_reports.html")


@account_blueprint.route("/admin/logs", methods=['GET'])
@login_required
def admin_logs():
    if not current_user.is_admin():
        return render_template("access_denied.html")
    return render_template("admin/admin_logs.html")


@account_blueprint.route("/admin/deleted_converts", methods=['GET'])
@login_required
def admin_deleted_converts():
    if not current_user.is_admin():
        return render_template("access_denied.html")
    return render_template("admin/deleted_converts.html")


@account_blueprint.route("/admin/get_all_notifications", methods=['GET'])
@login_required
def admin_get_all_notifications():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str) or None
    log_type = request.args.get('log_type', 'all')  # all | notifications | system

    if log_type == 'notifications':
        pagination = AccountModel.get_all_notifications_admin(page=page, search=search)
        items = [dict(n.to_json(), source='notification') for n in pagination.items]
        return {"success": True, "list": items, "total_page": pagination.pages}, 200

    if log_type == 'system':
        pagination = AccountModel.get_system_logs(page=page, search=search)
        items = [dict(l.to_json(), source='system') for l in pagination.items]
        return {"success": True, "list": items, "total_page": pagination.pages}, 200

    # Merge both, sort by date, paginate in Python
    per_page = 20
    from website.db_class.db import SystemLog, Notification as NotifModel
    notif_q = NotifModel.query
    sys_q = SystemLog.query
    if search:
        notif_q = notif_q.filter(NotifModel.message.ilike(f"%{search}%"))
        sys_q = sys_q.filter(
            SystemLog.event_type.ilike(f"%{search}%") |
            SystemLog.actor_name.ilike(f"%{search}%") |
            SystemLog.target_name.ilike(f"%{search}%") |
            SystemLog.details.ilike(f"%{search}%")
        )
    notifs = [dict(n.to_json(), source='notification') for n in notif_q.all()]
    syslogs = [dict(l.to_json(), source='system') for l in sys_q.all()]
    merged = sorted(notifs + syslogs, key=lambda x: x.get('created_at', '') or '', reverse=True)
    total = len(merged)
    total_page = max(1, (total + per_page - 1) // per_page)
    start = (page - 1) * per_page
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
                        if _bool == True:
                            message="This user has admin right now"
                        else:
                            message="This user has no more admin right now"
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
                "message": "No convert history for this id", 
                "toast_class" : "danger"
                }, 500
        return {
            "success": False, 
            "message": "No id provided", 
            "toast_class" : "danger"
            }, 404
                    
    return render_template("access_denied.html")
   