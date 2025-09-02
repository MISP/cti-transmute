#!/usr/bin/env python3

from flask import Blueprint, render_template
from flask_restx import Api

from cti_transmute.default import get_config
from website.web import application, csrf


api_blueprint = Blueprint('transmute_api', __name__, url_prefix='/api')
csrf.exempt(api_blueprint)


def setup_api(application) -> Api:
    api = Api(
        api_blueprint,
        title='CTI Transmute API',
        version='0.1.0',
        description="<a href='https://github.com/misp/cti-transmute' "
        "rel='noreferrer' target='_blank'>CTI Transmute</a>",
        license="GNU Affero General Public License version 3",
        license_url="https://www.gnu.org/licenses/agpl-3.0.html",
        doc="/",
        contact_email=application.config.get("ADMIN_EMAIL", "info@circl.lu"),
        contact_url=application.config.get(
            "ADMIN_WEBSITE", "https://www.circl.lu"
        )
    )

    @api.documentation
    def custom_ui() -> str:
        http_schema = 'http' if application.debug else 'https'
        url = get_config('generic', 'public_domain')
        return render_template(
            'swagger-ui.html',
            title=api.title,
            specs_url=f"{http_schema}://{url}/api/swagger.json"
        )
    
    from .convert import convert_ns

    api.add_namespace(convert_ns, path='/convert')

    return api

api = setup_api(application)
