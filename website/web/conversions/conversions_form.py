from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, TextAreaField
from wtforms.validators import DataRequired, Optional


class editConversionForm(FlaskForm):
    name = StringField(
        "Name of the conversion",
        validators=[DataRequired()],
        description="Name of the conversion"
    )

    description = TextAreaField(
        "Description of the conversion",
        validators=[Optional()],
        description="Description of the conversion"
    )

    edit = SubmitField("Edit")
