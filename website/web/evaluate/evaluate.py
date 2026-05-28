from flask import Blueprint, request, render_template
from flask_login import current_user, login_required
from website.db_class.db import Convert
from ..evaluate import evaluate_core as EvalModel
from ..account import account_core as AccountModel

evaluate_blueprint = Blueprint("evaluate", __name__)


def _can_view_convert(convert: Convert) -> bool:
    """Return True if the current viewer is allowed to see this convert."""
    if convert.public:
        return True
    if current_user.is_authenticated and (
        current_user.id == convert.user_id or current_user.is_admin()
    ):
        return True
    return False


def _can_evaluate(convert: Convert) -> tuple[bool, str]:
    """Return (allowed, reason) for evaluation actions."""
    if not current_user.is_authenticated:
        return False, "Login required"
    if not convert.public and current_user.id != convert.user_id and not current_user.is_admin():
        return False, "Convert is private"
    return True, ""


# ── Public API ────────────────────────────────────────────────

@evaluate_blueprint.route("/summary/<int:convert_id>", methods=["GET"])
def get_summary(convert_id):
    convert = Convert.query.get(convert_id)
    if not convert or not convert.is_active:
        return {"success": False, "message": "Not found"}, 404
    if not _can_view_convert(convert):
        return {"success": False, "message": "Forbidden"}, 403

    viewer_id = current_user.id if current_user.is_authenticated else None
    summary = EvalModel.get_summary(convert_id, viewer_id)
    summary["can_evaluate"] = _can_evaluate(convert)[0]
    summary["is_owner"] = (
        current_user.is_authenticated and current_user.id == convert.user_id
    )
    return {"success": True, **summary}, 200


@evaluate_blueprint.route("/toggle_like", methods=["POST"])
@login_required
def toggle_like():
    data = request.get_json(silent=True) or {}
    convert_id = data.get("convert_id")
    if not convert_id:
        return {"success": False, "message": "Missing convert_id"}, 400

    convert = Convert.query.get(convert_id)
    if not convert or not convert.is_active:
        return {"success": False, "message": "Not found"}, 404

    ok, reason = _can_evaluate(convert)
    if not ok:
        return {"success": False, "message": reason, "toast_class": "danger"}, 403

    result = EvalModel.toggle_like(convert_id, current_user.id)
    AccountModel.create_system_log(
        "eval_like" if result["action"] == "added" else "eval_like_removed",
        actor_id=current_user.id,
        actor_name=current_user.first_name,
        target_type="convert",
        target_id=convert_id,
        target_name=convert.name,
        details=f"{'Liked' if result['action'] == 'added' else 'Removed like from'} convert"
    )
    summary = EvalModel.get_summary(convert_id, current_user.id)
    return {"success": True, **result, "summary": summary}, 200


@evaluate_blueprint.route("/toggle_dislike", methods=["POST"])
@login_required
def toggle_dislike():
    data = request.get_json(silent=True) or {}
    convert_id = data.get("convert_id")
    if not convert_id:
        return {"success": False, "message": "Missing convert_id"}, 400

    convert = Convert.query.get(convert_id)
    if not convert or not convert.is_active:
        return {"success": False, "message": "Not found"}, 404

    ok, reason = _can_evaluate(convert)
    if not ok:
        return {"success": False, "message": reason, "toast_class": "danger"}, 403

    result = EvalModel.toggle_dislike(convert_id, current_user.id)
    AccountModel.create_system_log(
        "eval_dislike" if result["action"] == "added" else "eval_dislike_removed",
        actor_id=current_user.id,
        actor_name=current_user.first_name,
        target_type="convert",
        target_id=convert_id,
        target_name=convert.name,
        details=f"{'Disliked' if result['action'] == 'added' else 'Removed dislike from'} convert"
    )
    summary = EvalModel.get_summary(convert_id, current_user.id)
    return {"success": True, **result, "summary": summary}, 200


@evaluate_blueprint.route("/toggle_reaction", methods=["POST"])
@login_required
def toggle_reaction():
    data = request.get_json(silent=True) or {}
    convert_id   = data.get("convert_id")
    reaction_key = (data.get("reaction_key") or "").strip()
    if not convert_id or not reaction_key:
        return {"success": False, "message": "Missing convert_id or reaction_key"}, 400

    convert = Convert.query.get(convert_id)
    if not convert or not convert.is_active:
        return {"success": False, "message": "Not found"}, 404

    ok, reason = _can_evaluate(convert)
    if not ok:
        return {"success": False, "message": reason, "toast_class": "danger"}, 403

    try:
        result = EvalModel.toggle_reaction(convert_id, current_user.id, reaction_key)
    except ValueError as e:
        return {"success": False, "message": str(e)}, 400

    AccountModel.create_system_log(
        "eval_reaction" if result["action"] == "added" else "eval_reaction_removed",
        actor_id=current_user.id,
        actor_name=current_user.first_name,
        target_type="convert",
        target_id=convert_id,
        target_name=convert.name,
        details=f"{'Added' if result['action'] == 'added' else 'Removed'} reaction '{reaction_key}'"
    )
    summary = EvalModel.get_summary(convert_id, current_user.id)
    return {"success": True, **result, "summary": summary}, 200


# ── Admin ─────────────────────────────────────────────────────

@evaluate_blueprint.route("/admin/", methods=["GET"])
@login_required
def admin_evaluations():
    if not current_user.is_admin():
        return render_template("access_denied.html"), 403
    return render_template("evaluate/admin_evaluations.html",
                           reactions=EvalModel.get_tlp_tags())


@evaluate_blueprint.route("/admin/list", methods=["GET"])
@login_required
def admin_list():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403

    page         = request.args.get("page", 1, type=int)
    per_page     = request.args.get("per_page", 50, type=int)
    filter_type  = request.args.get("type", "").strip() or None
    filter_conv  = request.args.get("convert_id", "").strip() or None

    data = EvalModel.get_admin_list(
        page=page, per_page=per_page,
        filter_type=filter_type, filter_convert=filter_conv
    )
    return {"success": True, **data}, 200


@evaluate_blueprint.route("/admin/delete/<int:eval_id>", methods=["DELETE"])
@login_required
def admin_delete(eval_id):
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403

    ok = EvalModel.delete_evaluation(eval_id)
    if not ok:
        return {"success": False, "message": "Not found"}, 404

    AccountModel.create_system_log(
        "eval_deleted",
        actor_id=current_user.id,
        actor_name=current_user.first_name,
        target_type="evaluation",
        target_id=eval_id,
        details="Admin deleted an evaluation"
    )
    return {"success": True}, 200


@evaluate_blueprint.route("/consensus_tags/<int:convert_id>", methods=["GET"])
def consensus_tags(convert_id):
    """Return evaluation tags that have reached the 3-vote threshold.
    Public converts are accessible to everyone; private ones require auth."""
    convert = Convert.query.get(convert_id)
    if not convert:
        return {"success": False, "message": "Not found"}, 404
    if not _can_view_convert(convert):
        return {"success": False, "message": "Forbidden"}, 403
    threshold = request.args.get("threshold", 3, type=int)
    tags = EvalModel.get_consensus_tags(convert_id, threshold=threshold)
    return {"success": True, "tags": tags}, 200

@evaluate_blueprint.route("/", methods=["GET"])
@login_required
def evaluation_page():
    """Evaluation page for users to see their own evaluations across all converts."""
    return render_template("evaluate/evaluation.html")