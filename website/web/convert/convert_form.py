from flask_wtf import FlaskForm
from wtforms import BooleanField, IntegerField, SelectField, StringField, SubmitField
from wtforms.validators import DataRequired , Optional, NumberRange

class mispToStixParamForm(FlaskForm):
    version = SelectField(
        'STIX Version',
        choices=[('2.0', '2.0'), ('2.1', '2.1')],
        default='2.1',
        validators=[DataRequired()]
    )
    file = SubmitField('Upload File')
    convert = SubmitField('Convert')


class stixToMispParamForm(FlaskForm):
    distribution = IntegerField(
        "Distribution",
        validators=[Optional(), NumberRange(min=0, max=4, message="Value must be between 0 and 4")],
        default=0,
        description="Distribution level for the imported MISP content (0-4)"
    )

    sharing_group_id = IntegerField(
        "Sharing Group ID",
        validators=[Optional()],
        description="Sharing group ID when distribution is 4"
    )

    galaxies_as_tags = BooleanField(
        "Galaxies as Tags",
        description="Import MISP Galaxies as tag names instead of the standard Galaxy format"
    )

    no_force_contextual_data = BooleanField(
        "No Force Contextual Data",
        description="Do not force the creation of custom Galaxy clusters when ambiguous"
    )

    cluster_distribution = IntegerField(
        "Cluster Distribution",
        validators=[Optional(), NumberRange(min=0, max=4, message="Value must be between 0 and 4")],
        default=0,
        description="Galaxy Clusters distribution level (0-4) for external STIX 2 content"
    )

    cluster_sharing_group_id = IntegerField(
        "Cluster Sharing Group ID",
        validators=[Optional()],
        description="Galaxy Clusters sharing group ID when distribution is 4"
    )

    organisation_uuid = StringField(
        "Organisation UUID",
        validators=[Optional()],
        description="Organisation UUID to use when creating custom Galaxy Clusters"
    )

    single_event = BooleanField(
        "Single Event",
        description="Convert STIX data to a single MISP event if multiple reports/groupings exist"
    )

    producer = StringField(
        "Producer",
        validators=[Optional()],
        description="Producer of the STIX data"
    )

    title = StringField(
        "Title",
        validators=[Optional()],
        description="Title used to set the MISP Event `info` field"
    )

    convert = SubmitField("Convert")