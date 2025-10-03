from flask import Blueprint, render_template, request, jsonify
from flask_login import current_user
import requests



home_blueprint = Blueprint(
    "home",
    __name__,
    template_folder="templates",
    static_folder="static"
)


@home_blueprint.route("/")
def home():
    """Home page"""
    return render_template("home.html")

@home_blueprint.route("/list")
def list():
    """List page"""
    return render_template("list.html")

@home_blueprint.route("/get_features", methods=["GET"])
def get_features():
    """Get all the features of the API"""
    try:
        response = requests.get("http://127.0.0.1:6868/api/convert/list")
        response.raise_for_status()

        data = response.json()
        return jsonify({
            "status": "success",
            "features": data.get("available", {})
        }), 200

    except requests.RequestException as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "features": {}
        }), 500

@home_blueprint.route("/get_current_user", methods=['GET'])
def get_current_user() -> jsonify:
    """Is the current user admin or not for vue js"""
    return jsonify({'user': current_user.is_admin()})