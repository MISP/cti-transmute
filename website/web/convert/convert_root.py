# website/web/convert/views.py
import json
from flask import Blueprint, jsonify, redirect, render_template, request, flash, url_for
from flask_login import current_user, login_required
from website.web.convert.convert_form import mispToStixParamForm, stixToMispParamForm
from website.web.utils import form_to_dict, parse_stix_reports
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
                        name= form.name.data,
                        description= form.description.data or f"MISP to STIX conversion, version {form.version.data}",
                        public=form.public.data
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

                # Parse the STIX file for report/grouping info
                parsed_reports = parse_stix_reports(file_content)
                parsed_name = None
                parsed_description = None

                if parsed_reports:
                    # Take the first (name, description)
                    parsed_name, parsed_description = parsed_reports[0]

                if response.status_code == 200 and data and not data.get("error"):
                    result = data
                    flash("Converted to MISP successfully!", "success")

                    _user_id = None if current_user.is_anonymous() else current_user.id

                    # Choose best name/description source
                    name_to_use = (
                        form.name.data.strip()
                        or (parsed_name.strip() if parsed_name else None)
                    )
                    description_to_use = (
                        form.description.data.strip()
                        or (parsed_description.strip() if parsed_description else None)
                        or "STIX to MISP conversion"
                    )

                    output_text = json.dumps(data, indent=2)

                    success = ConvertModel.create_convert(
                        user_id=_user_id,
                        input_text=file_content,
                        output_text=output_text,
                        convert_choice="STIX_TO_MISP",
                        name=name_to_use,
                        description=description_to_use,
                        public=form.public.data
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
    only_mine = request.args.get('only_mine', 'false' , type=str)
    searchQuery = request.args.get('searchQuery',  type=str) 

    pagination = ConvertModel.get_convert_page(page, filter_type=filter_type, sort_order=sort_order, only_mine=only_mine , searchQuery=searchQuery)
    convert_list = [item.to_json() for item in pagination.items]

    return {
        "list": convert_list,
        "total_page": pagination.pages,
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


@convert_blueprint.route("/detail/<int:id>", methods=['GET'])
def detail(id):
    """Detail page of the convert"""
    convert = ConvertModel.get_convert(id)

    if not convert:
        flash("The convert id is unknown", "danger")
        return redirect(url_for("convert.history"))

    if convert.public:
        return render_template("convert/detail.html", convert=convert)

    if not current_user.is_authenticated:
        flash("You must be logged in to view this convert if you are the owner of this convert.", "warning")
        return redirect(url_for("account.login"))  

    if current_user.id == convert.user_id or current_user.is_admin():
        return render_template("convert/detail.html", convert=convert)

    flash("You do not have permission to view this convert.", "danger")
    return redirect(url_for("convert.history"))

#############################
#   Feature on the convert  #
#############################

@convert_blueprint.route("/get_convert", methods=['GET'])
def get_convert():
    """Get the convert thanks to the id to the interface (vue-js)"""
    id = request.args.get('id', 1, type=int)
    if id:
        convert = ConvertModel.get_convert(id)
        if convert:
            return {
                "success": True, 
                "convert": convert.to_json(),
                "message": "Convert found", 
                "toast_class" : "success"
                }, 200
        return {
            "success": False, 
            "message": "No convert history for this id", 
            "toast_class" : "danger"
            }, 500
    return {
        "success": False, 
        "message": "No id provided", 
        "toast_class" : "danger"
        }, 500

@convert_blueprint.route("/edit_public", methods=['GET'])
@login_required
def edit_public():
    """Change the public/private section"""
    id = request.args.get('id', 1, type=int)
    if id:
        convert = ConvertModel.get_convert(id)
        if convert:
            if convert.user_id == current_user.id or current_user.is_admin():
                success , _bool = ConvertModel.edit_public(id)
                if success:
                    if _bool == True:
                        message="This convert are public now"
                    else:
                        message="This convert are private now"
                    return {
                        "success": True, 
                        "convert_public": convert.public,
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

@convert_blueprint.route('/edit/<int:id>', methods=['POST'])
@login_required
def edit_convert_route(id):
    print(id)
    convert = ConvertModel.get_convert(id)
    if not convert:
        return jsonify({'success': False, 'error': 'Convert not found' ,"toast_class": "danger"}), 404

    if convert.user_id != current_user.id and not getattr(current_user, 'is_admin', False):
        return jsonify({'success': False, 'error': 'Not authorized' , "toast_class": "danger"}), 403

    data = request.get_json()
    print(data)
    success = ConvertModel.edit_convert(id, data)
    if success:
        return {
            "success": True, 
            "message": "Edit with success", 
            "toast_class" : "success"
        }, 200
    return {
            "success": False, 
            "message": "Error during edit the convert", 
            "toast_class" : "danger"
            }, 500

