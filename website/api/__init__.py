#!/usr/bin/env python3

from importlib.metadata import version as _dist_version

from flask import Blueprint, render_template
from flask_restx import Api

from website.web import application, csrf

from .docs import AUTHORIZATIONS

api_blueprint = Blueprint('transmute_api', __name__, url_prefix='/api')
csrf.exempt(api_blueprint)


def setup_api(application) -> Api:
    api = Api(
        api_blueprint,
        title='CTI Transmute API',
        version=_dist_version("cti-transmute"),
        # Markdown, which both Swagger UI and Vitrine's <vt-openapi> render.
        description="[CTI Transmute](https://github.com/misp/cti-transmute): "
        "convert threat intelligence between MISP and STIX.",
        license="GNU Affero General Public License version 3",
        license_url="https://www.gnu.org/licenses/agpl-3.0.html",
        doc="/",
        contact_email=application.config.get("ADMIN_EMAIL", "info@circl.lu"),
        contact_url=application.config.get(
            "ADMIN_WEBSITE", "https://www.circl.lu"
        ),
        # The optional X-API-KEY header, shown on every route (see api/docs.py).
        authorizations=AUTHORIZATIONS,
        security='apikey',
    )

    @api.documentation
    def custom_ui() -> str:
        return render_template(
            'swagger-ui.html', title=api.title, specs_url="/api/swagger.json"
        )
    
    from .conversions import conversions_ns
    from .convert import convert_ns

    api.add_namespace(convert_ns, path='/convert')
    api.add_namespace(conversions_ns, path='/conversions')

    return api

api = setup_api(application)
