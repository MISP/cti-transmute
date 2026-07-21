from flask import Blueprint, Response, abort, render_template, request
from flask_login import current_user, login_required

from website.db_class.db import Conversion
from website.lib import access

from ..account import account_core as AccountModel
from ..evaluate import evaluate_core as EvalModel

evaluate_blueprint = Blueprint("evaluate", __name__)


def _can_evaluate(conversion: Conversion) -> tuple[bool, str]:
    """Return (allowed, reason) for evaluation actions."""
    if not current_user.is_authenticated:
        return False, "Login required"
    if not access.can_see(current_user, conversion):
        return False, "Conversion is private"
    return True, ""


# ── Public API ────────────────────────────────────────────────

@evaluate_blueprint.route("/summary/<int:conversion_id>", methods=["GET"])
def get_summary(conversion_id):
    conversion = Conversion.query.get(conversion_id)
    if not conversion or not conversion.is_active:
        return {"success": False, "message": "Not found"}, 404
    if not access.can_see(current_user, conversion):
        return {"success": False, "message": "Forbidden"}, 403

    viewer_id = current_user.id if current_user.is_authenticated else None
    summary = EvalModel.get_summary(conversion_id, viewer_id)
    summary["can_evaluate"] = _can_evaluate(conversion)[0]
    summary["is_owner"] = (
        current_user.is_authenticated and current_user.id == conversion.user_id
    )
    return {"success": True, **summary}, 200


@evaluate_blueprint.route("/toggle_like", methods=["POST"])
@login_required
def toggle_like():
    data = request.get_json(silent=True) or {}
    conversion_id = data.get("conversion_id")
    if not conversion_id:
        return {"success": False, "message": "Missing conversion_id"}, 400

    conversion = Conversion.query.get(conversion_id)
    if not conversion or not conversion.is_active:
        return {"success": False, "message": "Not found"}, 404

    ok, reason = _can_evaluate(conversion)
    if not ok:
        return {"success": False, "message": reason, "toast_class": "danger"}, 403

    result = EvalModel.toggle_like(conversion_id, current_user.id)
    AccountModel.create_system_log(
        "eval_like" if result["action"] == "added" else "eval_like_removed",
        actor_id=current_user.id,
        actor_name=current_user.first_name,
        target_type="conversion",
        target_id=conversion_id,
        target_name=conversion.name,
        details=f"{'Liked' if result['action'] == 'added' else 'Removed like from'} conversion"
    )
    summary = EvalModel.get_summary(conversion_id, current_user.id)
    return {"success": True, **result, "summary": summary}, 200


@evaluate_blueprint.route("/toggle_dislike", methods=["POST"])
@login_required
def toggle_dislike():
    data = request.get_json(silent=True) or {}
    conversion_id = data.get("conversion_id")
    if not conversion_id:
        return {"success": False, "message": "Missing conversion_id"}, 400

    conversion = Conversion.query.get(conversion_id)
    if not conversion or not conversion.is_active:
        return {"success": False, "message": "Not found"}, 404

    ok, reason = _can_evaluate(conversion)
    if not ok:
        return {"success": False, "message": reason, "toast_class": "danger"}, 403

    result = EvalModel.toggle_dislike(conversion_id, current_user.id)
    AccountModel.create_system_log(
        "eval_dislike" if result["action"] == "added" else "eval_dislike_removed",
        actor_id=current_user.id,
        actor_name=current_user.first_name,
        target_type="conversion",
        target_id=conversion_id,
        target_name=conversion.name,
        details=f"{'Disliked' if result['action'] == 'added' else 'Removed dislike from'} conversion"
    )
    summary = EvalModel.get_summary(conversion_id, current_user.id)
    return {"success": True, **result, "summary": summary}, 200


@evaluate_blueprint.route("/toggle_reaction", methods=["POST"])
@login_required
def toggle_reaction():
    data = request.get_json(silent=True) or {}
    conversion_id   = data.get("conversion_id")
    reaction_key = (data.get("reaction_key") or "").strip()
    if not conversion_id or not reaction_key:
        return {"success": False, "message": "Missing conversion_id or reaction_key"}, 400

    conversion = Conversion.query.get(conversion_id)
    if not conversion or not conversion.is_active:
        return {"success": False, "message": "Not found"}, 404

    ok, reason = _can_evaluate(conversion)
    if not ok:
        return {"success": False, "message": reason, "toast_class": "danger"}, 403

    try:
        result = EvalModel.toggle_reaction(conversion_id, current_user.id, reaction_key)
    except ValueError as e:
        return {"success": False, "message": str(e)}, 400

    AccountModel.create_system_log(
        "eval_reaction" if result["action"] == "added" else "eval_reaction_removed",
        actor_id=current_user.id,
        actor_name=current_user.first_name,
        target_type="conversion",
        target_id=conversion_id,
        target_name=conversion.name,
        details=f"{'Added' if result['action'] == 'added' else 'Removed'} reaction '{reaction_key}'"
    )
    summary = EvalModel.get_summary(conversion_id, current_user.id)
    return {"success": True, **result, "summary": summary}, 200


# ── Admin ─────────────────────────────────────────────────────

@evaluate_blueprint.route("/admin/", methods=["GET"])
@login_required
def admin_evaluations():
    if not current_user.is_admin():
        return abort(403)
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
    filter_conversion  = request.args.get("conversion_id", "").strip() or None

    data = EvalModel.get_admin_list(
        page=page, per_page=per_page,
        filter_type=filter_type, filter_conversion=filter_conversion
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


@evaluate_blueprint.route("/consensus_tags/<int:conversion_id>", methods=["GET"])
def consensus_tags(conversion_id):
    """Return evaluation tags that have reached the 3-vote threshold.
    Public conversions are accessible to everyone; private ones require auth."""
    conversion = Conversion.query.get(conversion_id)
    if not conversion:
        return {"success": False, "message": "Not found"}, 404
    if not access.can_see(current_user, conversion):
        return {"success": False, "message": "Forbidden"}, 403
    threshold = request.args.get("threshold", 3, type=int)
    tags = EvalModel.get_consensus_tags(conversion_id, threshold=threshold)
    return {"success": True, "tags": tags}, 200

@evaluate_blueprint.route("/overview")
def overview():
    """Public overview page: platform-wide evaluation stats + platform reviews."""
    return render_template("evaluate/overview.html")


@evaluate_blueprint.route("/global_stats")
def global_stats():
    data = EvalModel.get_global_stats()
    return {"success": True, **data}, 200


@evaluate_blueprint.route("/platform_review", methods=["POST"])
@login_required
def submit_platform_review():
    data    = request.get_json(silent=True) or {}
    rating  = data.get("rating")
    comment = data.get("comment", "")
    if not rating or not isinstance(rating, int):
        return {"success": False, "message": "Rating required (1–5)"}, 400
    try:
        rev = EvalModel.submit_platform_review(current_user.id, rating, comment)
    except ValueError as e:
        return {"success": False, "message": str(e)}, 400
    return {"success": True, "review": rev}, 200


@evaluate_blueprint.route("/platform_reviews")
def platform_reviews():
    page = request.args.get("page", 1, type=int)
    data = EvalModel.get_platform_reviews(page=page)
    return {"success": True, **data}, 200


@evaluate_blueprint.route("/recent_to_evaluate")
def recent_to_evaluate():
    viewer_id = current_user.id if current_user.is_authenticated else None
    items = EvalModel.get_recent_to_evaluate(viewer_id=viewer_id)
    return {"success": True, "list": items}, 200


@evaluate_blueprint.route("/activity_timeline")
def activity_timeline():
    days = request.args.get("days", 30, type=int)
    days = max(1, min(days, 1095))  # Max 3 years (unauthenticated route)
    data = EvalModel.get_activity_timeline(days=days)
    return {"success": True, "timeline": data}, 200



# ── Evaluation report exports ─────────────────────────────────

@evaluate_blueprint.route("/export/<int:conversion_id>/markdown")
def export_evaluation_markdown(conversion_id):
    """Download the evaluation report as a .md file."""
    conversion = Conversion.query.get(conversion_id)
    if not conversion or not conversion.is_active:
        return {"success": False, "message": "Not found"}, 404
    if not access.can_see(current_user, conversion):
        return {"success": False, "message": "Forbidden"}, 403

    report = EvalModel.build_evaluation_report(conversion_id)
    if not report:
        return {"success": False, "message": "No evaluation data"}, 404

    md_text  = EvalModel.render_evaluation_markdown(report)
    filename = f"cti-evaluation-{conversion_id}.md"
    return Response(
        md_text,
        mimetype="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@evaluate_blueprint.route("/export/<int:conversion_id>/pdf")
def export_evaluation_pdf(conversion_id):
    """Download the evaluation report as a .pdf file."""
    conversion = Conversion.query.get(conversion_id)
    if not conversion or not conversion.is_active:
        return {"success": False, "message": "Not found"}, 404
    if not access.can_see(current_user, conversion):
        return {"success": False, "message": "Forbidden"}, 403

    report = EvalModel.build_evaluation_report(conversion_id)
    if not report:
        return {"success": False, "message": "No evaluation data"}, 404

    pdf_bytes = EvalModel.render_evaluation_pdf(report)
    filename  = f"cti-evaluation-{conversion_id}.pdf"
    return Response(
        pdf_bytes,
        mimetype="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
