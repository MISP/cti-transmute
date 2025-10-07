# website/web/convert/views.py
import json
from flask import Blueprint, jsonify, render_template, request, flash, url_for
from flask_login import current_user, login_required
from website.web.convert.convert_form import mispToStixParamForm, stixToMispParamForm
from website.web.utils import form_to_dict
import requests
from ..convert import convert_core as ConvertModel

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
            file_content = file_data.read().decode('utf-8')
            file_data.seek(0)  

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

                    output_text = json.dumps(data, indent=2)

                    if current_user.is_anonymous():
                        _user_id = None
                    else:
                        _user_id = current_user.id

                    success = ConvertModel.create_convert(
                        user_id=_user_id,
                        input_text=file_content,
                        output_text=output_text,
                        convert_choice="MISP_TO_STIX",
                        description=f"MISP to STIX conversion, version {form.version.data}"
                        
                    )
                    if success:
                        flash("Convert registered successfully!", "success")
                    else:
                        flash("Error during registering the convert!", "danger")
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

            file_content = file_data.read().decode('utf-8')
            file_data.seek(0)  

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

                    if current_user.is_anonymous():
                        _user_id = None
                    else:
                        _user_id = current_user.id
 
                    output_text = json.dumps(data, indent=2)
                    success = ConvertModel.create_convert(
                        user_id=_user_id,
                        input_text=file_content,
                        output_text=output_text,
                        convert_choice="STIX_TO_MISP",
                        description=f"STIX to MISP conversion"
                        
                    )
                    if success:
                        flash("Convert registered successfully!", "success")
                    else:
                        flash("Error during registering the convert!", "danger")
                else:
                    error_msg = data.get("error") if data else f"Conversion failed with status {response.status_code}"
                    error = error_msg
                    flash(error_msg, "danger")

            except requests.RequestException as e:
                error = f"Conversion failed: {e}"
                flash(error, "danger")

    return render_template("convert/stix_to_misp.html", form=form, result=result, error=error)


@convert_blueprint.route("/history", methods=['GET'])
def history():
    """History page of the last convert"""
    return render_template("convert/history.html")


@convert_blueprint.route("/get_convert_page_history", methods=['GET'])
def get_page_history():
    """History of the last convert, with optional filter and sort"""
    page = request.args.get('page', 1, type=int)
    filter_type = request.args.get('filter_type',  type=str)  
    sort_order = request.args.get('sort_order',  type=str) 
    pagination = ConvertModel.get_convert_page(page, filter_type=filter_type, sort_order=sort_order)
    convert_list = [item.to_json() for item in pagination.items]

    return {
        "list": convert_list,
        "total_page": pagination.pages,
        "total_rules": pagination.total
    }, 200


@convert_blueprint.route("/delete_item", methods=['GET'])
def delete_rule() -> jsonify:
    """Delete an item"""
    if current_user.is_anonymous():
        return {"success": False, "message": "You are not connect, you can't delete !" , "toast_class" : "danger"}, 403
    else:
        item_id  = request.args.get("id")
        convert = ConvertModel.get_convert(item_id) 
        if convert:
            if current_user.id == convert.user_id or current_user.is_admin():
                success = ConvertModel.delete_convert(item_id)
                if success:
                    return {"success": True, "message": "Conversion history deleted!" , "toast_class" : "success"}, 200
                else:
                    return {"success": False, "message": "Error during deleting the item !" , "toast_class" : "danger"}, 500
            return {"success": False, "message": "You are not connect, you can't delete !" , "toast_class" : "danger"}, 403
        else:
            return {"success": False, "message": "No item found !" , "toast_class" : "danger"}, 500

