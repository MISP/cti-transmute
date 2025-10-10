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



@account_blueprint.route("/edit_admin", methods=['GET'])
@login_required
def edit_admin():
    """Manage admin right for user"""
    id = request.args.get('id', 1, type=int)
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
                if current_user.is_admin():
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
                return redirect(url_for("access_denied"))
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