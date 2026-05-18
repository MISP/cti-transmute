from flask import url_for
from flask_login import current_user
from flask_wtf import FlaskForm
from wtforms import ValidationError
from wtforms.fields import BooleanField, PasswordField, StringField, SubmitField, EmailField
from wtforms.validators import Email, InputRequired, Length

from website.db_class.db import User



class LoginForm(FlaskForm):
    """Login form to connect"""
    email = EmailField('Email', validators=[InputRequired(), Email()])
    password = PasswordField('Password', validators=[InputRequired()])
    remember_me = BooleanField('Keep me logged in')
    submit = SubmitField('Log in')

class EditUserForm(FlaskForm):
    """Edit form to change user's informations"""
    first_name = StringField('First name', validators=[InputRequired(), Length(max=64)])
    last_name = StringField('Last name', validators=[InputRequired(), Length(max=64)])
    email = EmailField('Email', validators=[InputRequired(), Email(), Length(max=64)])
    password = PasswordField('Password', validators=[Length(min=0, max=128)])
    submit = SubmitField('Save')

    def validate_email(self, field):
        if field.data != current_user.email:
            if User.query.filter_by(email=field.data).first():
                raise ValidationError('This email address is not available.')


class AddNewUserForm(FlaskForm):
    """Creation form to create an user"""
    first_name = StringField('First name', validators=[InputRequired(), Length(max=64)])
    last_name = StringField('Last name', validators=[InputRequired(), Length(max=64)])
    email = EmailField('Email', validators=[InputRequired(), Email(message="Please enter a valid email address."), Length(max=64)])
    password = PasswordField('Password', validators=[InputRequired(), Length(min=8, max=128, message="Password must be at least 8 characters")])
    submit = SubmitField('Register')
    def validate_email(self, field):
        if User.query.filter_by(email=field.data).first():
            raise ValidationError('This email address is not available.')
