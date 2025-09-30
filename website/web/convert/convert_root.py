# website/web/convert/views.py
from flask import Blueprint, render_template, request, flash
from website.web.convert.convert_form import mispToStixParamForm, stixToMispParamForm
from website.web.untils import form_to_dict
import requests

convert_blueprint = Blueprint(
    "convert",
    __name__,
    template_folder="templates",
    static_folder="static"
)

@convert_blueprint.route("/misp_to_stix", methods=['GET', 'POST'])
def misp_to_stix():
    form = mispToStixParamForm()
    result = None
    error = None  

    if form.validate_on_submit():
        file_data = request.files.get('file')
        if not file_data:
            error = "Please upload a MISP file"
            flash(error, "danger")
        else:
            files = {'file': (file_data.filename, file_data.stream, file_data.mimetype)}
            params = {'version': form.version.data}

            try:
                response = requests.post(
                    "http://127.0.0.1:6868/api/convert/misp_to_stix",
                    files=files,
                    params=params
                )
                try:
                    data = response.json()
                except Exception:
                    data = None

                if response.status_code == 200 and data and not data.get("error"):
                    result = data
                    flash("Converted to STIX successfully!", "success")
                else:
                    error_msg = data.get("error") if data else f"Conversion failed with status {response.status_code}"
                    error = error_msg
                    flash(error_msg, "danger")

            except requests.RequestException as e:
                error = f"Conversion failed: {e}"
                flash(error, "danger")

    return render_template("convert/misp_to_stix.html", form=form, result=result, error=error)


@convert_blueprint.route("/stix_to_misp", methods=['GET', 'POST'])
def stix_to_misp():
    form = stixToMispParamForm() 
    result = None
    error = None

    if form.validate_on_submit():
        file_data = request.files.get('file')
        if not file_data:
            error = "Please upload a STIX file"
            flash(error, "danger")
        else:
            files = {'file': (file_data.filename, file_data.stream, file_data.mimetype)}
            params = form_to_dict(form)

            try:
                response = requests.post(
                    "http://127.0.0.1:6868/api/convert/stix_to_misp",
                    files=files,
                    params=params
                )
                try:
                    data = response.json()
                except Exception:
                    data = None

                if response.status_code == 200 and data and not data.get("error"):
                    result = data
                    flash("Converted to MISP successfully!", "success")
                else:
                    # Prefer the API error if present
                    error_msg = data.get("error") if data else f"Conversion failed with status {response.status_code}"
                    error = error_msg
                    flash(error_msg, "danger")

            except requests.RequestException as e:
                error = f"Conversion failed: {e}"
                flash(error, "danger")

    return render_template("convert/stix_to_misp.html", form=form, result=result, error=error)

