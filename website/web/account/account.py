from flask import Blueprint, jsonify, render_template, redirect, request, url_for, flash

from website.db_class.db import User
from website.web.account.account_form import AddNewUserForm, EditUserForm, LoginForm
from website.web.utils import form_to_dict, generate_api_key
from . import account_core as AccountModel
from flask_login import current_user, login_required, login_user, logout_user


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
