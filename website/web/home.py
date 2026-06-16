import requests
from flask import Blueprint, abort, jsonify, render_template
from flask_login import current_user
from sqlalchemy import and_, or_

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

@home_blueprint.route("/why")
def why():
    """Why CTI-Transmute page"""
    return render_template("why.html")

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

@home_blueprint.route("/get_public_activity")
def get_public_activity():
    """Public activity feed for the homepage, based on system logs for public converts."""
    from website.db_class.db import Convert, SystemLog

    PUBLIC_EVENTS = [
        'convert_created', 'eval_like', 'eval_dislike',
        'eval_reaction', 'convert_edited', 'convert_visibility_changed',
        'convert_favorited',
    ]
    try:
        from website.db_class.db import User
        logs = (
            SystemLog.query
            .join(Convert, and_(
                SystemLog.target_id == Convert.id,
                SystemLog.target_type == 'convert'
            ))
            .filter(
                SystemLog.event_type.in_(PUBLIC_EVENTS),
                Convert.public == True,
                Convert.is_active == True,
                SystemLog.actor_name.isnot(None),
                or_(
                    SystemLog.event_type != 'convert_visibility_changed',
                    SystemLog.details == 'public'
                )
            )
            .order_by(SystemLog.created_at.desc())
            .limit(20)
            .all()
        )
        result = []
        for log in logs:
            data = log.to_json()
            if log.actor_id:
                user = User.query.get(log.actor_id)
                if user:
                    data['actor_name'] = user.first_name
            result.append(data)
        return jsonify({"success": True, "list": result}), 200
    except Exception as e:
        return jsonify({"success": False, "list": [], "message": str(e)}), 500


@home_blueprint.route("/docs")
def docs():
    """Developer documentation page"""
    return render_template("docs/index.html")

@home_blueprint.route("/access_denied", methods=['GET'])
def access_denied() -> jsonify:
    """Access denied page"""
    return abort(403)
