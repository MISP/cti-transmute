# website/web/convert/views.py
import io
import json
from flask import Blueprint, jsonify, redirect, render_template, request, flash, url_for
from flask_login import current_user, login_required
from website.web.convert.convert_form import  editConvertForm, mispToStixParamForm, stixToMispParamForm
from website.web.utils import extract_name_from_misp_json, form_to_dict, parse_stix_reports, sanitazed_params
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

                    auto_name = extract_name_from_misp_json(file_content)

                    if not form.name.data:
                        if  auto_name:
                            form.name.data = auto_name
                        
                    if not form.description.data:
                        if  auto_name:
                            form.description.data = f"MISP to STIX conversion, version {form.version.data} -"+f" {auto_name}" 

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

            # Instead of sending all form fields blindly:
            raw_params = form_to_dict(form)

            # Remove empty values AND remove booleans that are false
            params = {
                key: value
                for key, value in raw_params.items()
                if value not in [None, "", False, "False"]
            }

            # Add boolean flags only when True
            if form.galaxies_as_tags.data:
                params["galaxies_as_tags"] = ""

            if form.no_force_contextual_data.data:
                params["no_force_contextual_data"] = ""

            if form.single_event.data:
                params["single_event"] = ""

            #print(params)

            try:
                response = requests.post(
                    "http://0.0.0.0:6868/api/convert/stix_to_misp",
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
    convert_list = [item.to_json_list() for item in pagination.items]

    return {
        "list": convert_list,
        "total_page": pagination.pages,
    }, 200

@convert_blueprint.route("/delete_item", methods=['GET'])
@login_required
def delete_rule() -> jsonify:
    """Delete an item"""
    item_id  = request.args.get("id")
    convert = ConvertModel.get_convert(item_id) 
    if convert:
        if current_user.id == convert.user_id or current_user.is_admin():
            success = ConvertModel.delete_convert(item_id)
            if success:
                return {"success": True, "message": "Conversion history deleted!" , "toast_class" : "success"}, 200
            else:
                return {"success": False, "message": "Error during deleting the item !" , "toast_class" : "danger"}, 500
        return render_template("access_denied.html")
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

@convert_blueprint.route("/edit/<int:id>", methods=['GET', 'POST'])
@login_required
def edit(id):
    """Detail page of the convert"""

    form = editConvertForm()  
    convert = ConvertModel.get_convert(id)
    if convert.user_id == current_user.id or current_user.is_admin():
        if form.validate_on_submit():
            form_dict = form_to_dict(form)
            
            success, message = ConvertModel.edit_convert(id, form_dict)
            if success:
                flash(f"{convert.name} edit successfully","success")
                return redirect(f"/convert/detail/{id}")
            else:
                flash(f"Error : {message}", "danger")
                return render_template("convert/edit.html", form=form, convert_id=id )
            
        else:
            form.name.data = convert.name
            form.description.data = convert.description

            return render_template("convert/edit.html", form=form, convert_id=id )
    else:
            return render_template("access_denied.html")
        
        

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

#########################
#   Share the convert   #
#########################

@convert_blueprint.route("/get_share_key", methods=['GET'])
@login_required
def get_share_key():
    """Get the share key of a convert"""
    id = request.args.get('id', 1, type=int)
    if id:
        convert = ConvertModel.get_convert(id)
        if convert:
            if convert.user_id == current_user.id or current_user.is_admin():
                return {
                    "success": True, 
                    "share_key": convert.share_key,
                    "message": "Share key found", 
                    "toast_class" : "success"
                    }, 200
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
        }, 500


@convert_blueprint.route("/regenerate_share_key", methods=['GET'])
@login_required
def regenerate_share_key():
    """Regenerate the share key of a convert"""
    id = request.args.get('id', 1, type=int)
    if id:
        convert = ConvertModel.get_convert(id)
        if convert:
            if convert.user_id == current_user.id or current_user.is_admin():
                success , new_share_key = ConvertModel.regenerate_share_key_convert(id)
                if success:
                    return {
                        "success": True, 
                        "share_key": new_share_key,
                        "message": "Share key regenerated", 
                        "toast_class" : "success"
                        }, 200
                return {
                    "success": False, 
                    "message": "Error during the regeneration of the share key", 
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
        }, 500
    
# https://cti-transmute.org/convert/share?uuid=${convert?.uuid || ''}&share_key=${share_key}`
@convert_blueprint.route("/share", methods=['GET'])
def share_convert():
    """Share a convert using uuid and share_key"""
    uuid = request.args.get('uuid', type=str)
    share_key = request.args.get('share_key', type=str)

    if not uuid or not share_key:
        flash("Please provide a valid UUID and Share Key", "danger")
        return redirect(url_for("convert.history"))
    print(f"UUID: {uuid}, Share Key: {share_key}")
    convert = ConvertModel.get_convert_by_uuid(uuid)
    if not convert:
        flash("No convert found for the provided UUID", "danger")
        return redirect(url_for("convert.history"))

    if convert.share_key != share_key:
        flash("The provided Share Key is invalid", "danger")
        return redirect(url_for("convert.history"))

    return render_template("convert/detail.html", convert=convert)



###########################
#   Refresh a conversion  #
###########################

@convert_blueprint.route("/refresh/<string:uuid>", methods=['GET', 'POST'])
def refresh(uuid):

    convert_obj = ConvertModel.get_convert_by_uuid(uuid)

    if not convert_obj:
        flash("Conversion not found.", "danger")
        return redirect(url_for("convert.history"))

    # Choose which WTForm to use
    if convert_obj.conversion_type == "MISP_TO_STIX":
        print("Using MISP to STIX form")
        form = mispToStixParamForm()
    elif convert_obj.conversion_type == "STIX_TO_MISP":
        print("Using STIX to MISP form")
        form = stixToMispParamForm()
    else:
        flash("Unsupported conversion type.", "danger")
        return redirect(url_for("convert.history"))

    # Prefill form (GET)
    if request.method == "GET":
        form.name.data = convert_obj.name
        form.description.data = convert_obj.description
        form.public.data = convert_obj.public

    result = None
    diff = None
    error = None

    if form.validate_on_submit():

        # Call the generic dispatcher
        new_output, is_identical, error_msg = ConvertModel.reconvert_conversion(convert_obj, form)

        if error_msg:
            error = error_msg
            flash(error_msg, "danger")
        else:
            if not is_identical:
                flash("Conversion re-executed successfully! Changes detected.", "success")
                result = new_output
                diff = "The new conversion result is DIFFERENT from the previous one."
            else:
                flash("Conversion re-executed successfully! No changes detected.", "success")
                result = new_output
                diff = "The new conversion result is IDENTICAL to the previous one."

    return render_template(
        "convert/refresh.html",
        form=form,
        convert_obj=convert_obj,
        result=result,
        diff=diff,
        error=error,
        filename=f"{convert_obj.name}_refresh.json"
    )


# get_history

@convert_blueprint.route("/get_history", methods=['GET'])
def get_history():
    id = request.args.get('id', 1, type=int)
    if id:
        convert_obj = ConvertModel.get_convert(id)
        if convert_obj:
            latest_history = ConvertModel.get_history_list(convert_obj.id)
            if latest_history:
                return {
                    "success": True, 
                    "history_convert": [h.to_json() for h in latest_history],
                    "message": "New convert found", 
                    "toast_class" : "success"
                    }, 200
            return {
                "success": True, 
                "message": "No conversion history found for this convert", 
                "toast_class" : "danger"
                }, 200
        return {
            "success": False, 
            "message": "No convert found for this id", 
            "toast_class" : "danger"
            }, 500
    return {
        "success": False, 
        "message": "No id provided", 
        "toast_class" : "danger"
        }, 500




@convert_blueprint.route("/get_new_convert", methods=['GET'])
def get_new_convert():
    """Get the new convert after a refresh to show the difference"""
    id = request.args.get('id', 1, type=int)
    if id:
        convert_obj = ConvertModel.get_convert(id)
        if convert_obj:
            latest_history = ConvertModel.get_latest_history_list(convert_obj.id)
            if latest_history:
                return {
                    "success": True, 
                    "history_convert": [h.to_json() for h in latest_history],
                    "message": "New convert found", 
                    "toast_class" : "success"
                    }, 200
            return {
                "success": True, 
                "message": "No conversion history found for this convert", 
                "toast_class" : "danger"
                }, 200
        return {
            "success": False, 
            "message": "No convert found for this id", 
            "toast_class" : "danger"
            }, 500
    return {
        "success": False, 
        "message": "No id provided", 
        "toast_class" : "danger"
        }, 500


@convert_blueprint.route("/history_action", methods=['GET'])
def history_action():
    """Handle actions related to conversion history"""
    action = request.args.get('action')
    history_id = request.args.get('history_id', type=int)
    convert_id = request.args.get('convert_id', type=int)

    if current_user.is_anonymous():
        return {
            "success": False,
            "message": "You must be logged in to perform this action.",
            "toast_class": "danger"
        }, 401
    if not current_user.is_admin() and current_user.id != ConvertModel.get_convert(convert_id).user_id:
        return {
            "success": False,
            "message": "You do not have permission to perform this action.",
            "toast_class": "danger"
        }, 403
    else:
        # --- Handle Conversion History Actions (Accept/Reject) ---
        if history_id and action in ["accept", "reject"]:
            
            if action == "accept":
                success = ConvertModel.accept_history(history_id)
            elif action == "reject":
                success = ConvertModel.reject_history(history_id)
            success = True # Replace with actual database call
            
            if success:
                flash("Convert history updated", "success")
                return {
                    "success": True,
                    "message": f"History entry {history_id} {action}ed successfully.",
                    "toast_class": "success"
                }, 200
            return {
                "success": False,
                "message": f"Failed to {action} history entry {history_id}.",
                "toast_class": "danger"
            }, 500

    # --- Default Error ---
    return {
        "success": False,
        "message": "Invalid action or missing parameters (history_id or convert_id).",
        "toast_class": "danger"
    }, 400


@convert_blueprint.route("/difference/<int:id>", methods=['GET'])
def difference(id):
    """Show the difference between two convert versions"""
    convert_obj_history = ConvertModel.get_convert_history_by_id(id)
    if not convert_obj_history:
        flash("Conversion not found.", "danger")
        return redirect(url_for("convert.history"))

    convert_obj = ConvertModel.get_convert(convert_obj_history.convert_id)
    if not convert_obj:
        flash("Conversion not found.", "danger")
        return redirect(url_for("convert.history"))
    
    if convert_obj.public == False:
        if current_user.is_anonymous():
            flash("You must be logged in to view this convert if you are the owner of this convert.", "warning")
            return redirect(url_for("account.login"))  

        if current_user.id != convert_obj.user_id and not current_user.is_admin():
            flash("You do not have permission to view this convert.", "danger")
            return redirect(url_for("convert.history"))
        
        return render_template(
            "convert/compare_version/difference.html",
            old_result=convert_obj_history.old_output_text,
            new_result=convert_obj_history.new_output_text,
            convert_obj=convert_obj,
            history_id=convert_obj_history.id
        )
    else:
        return render_template(
            "convert/compare_version/difference.html",
            old_result=convert_obj_history.old_output_text,
            new_result=convert_obj_history.new_output_text,
            convert_obj=convert_obj,
            history_id=convert_obj_history.id
        )

# get_history_details
@convert_blueprint.route("/get_history_details", methods=['GET'])
def get_history_details():
    """Get the details of a convert history entry"""
    history_id = request.args.get('history_id', type=int)
    if history_id:
        convert_history = ConvertModel.get_convert_history_by_id(history_id)
        if convert_history:
            return {
                "success": True, 
                "history": convert_history.to_json(),
                "message": "Convert history found", 
                "toast_class" : "success"
                }, 200
        return {
            "success": False, 
            "message": "No convert history found for this id", 
            "toast_class" : "danger"
            }, 500
    return {
        "success": False, 
        "message": "No history_id provided", 
        "toast_class" : "danger"
        }, 500