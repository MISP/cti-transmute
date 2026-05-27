import re
import datetime
from website.web import db
from website.db_class.db import ConvertEvaluation, Comment, Convert, Tag

VALUE_ORDER = ['very-low', 'low', 'moderate', 'high', 'very-high']


def _parse_eval_tag(name: str):
    """Parse 'ns:category="value"' → (ns, category, value) or (None, None, None)."""
    m = re.match(r'^([\w-]+):([\w.-]+)="([\w.-]+)"$', name or '')
    if m:
        return m.group(1), m.group(2), m.group(3)
    return None, None, None


def get_tlp_tags() -> list[dict]:
    tags = (Tag.query
            .filter(Tag.is_evaluation_tag == True, Tag.is_active == True)
            .order_by(Tag.name)
            .all())
    result = []
    for t in tags:
        d = t.to_json()
        d['key'] = t.name
        d['label'] = t.name
        result.append(d)
    return result


def _build_cti_categories(rows, viewer_id=None) -> dict:
    """
    Returns { category: { values, counts, percentages, total, viewer_value } }
    for all active cti-evaluation:* tags.
    """
    tags = (Tag.query
            .filter(Tag.is_evaluation_tag == True,
                    Tag.is_active == True,
                    Tag.name.like('cti-evaluation:%'))
            .all())

    cats = {}
    for t in tags:
        _, cat, val = _parse_eval_tag(t.name)
        if not cat or not val:
            continue
        if cat not in cats:
            cats[cat] = {'values': [], 'counts': {}, 'percentages': {}, 'total': 0, 'viewer_value': None}
        if val not in cats[cat]['values']:
            cats[cat]['values'].append(val)
        cats[cat]['counts'][val] = 0

    for cat_data in cats.values():
        cat_data['values'].sort(key=lambda v: VALUE_ORDER.index(v) if v in VALUE_ORDER else 99)

    for row in rows:
        if row.eval_type != 'reaction' or not row.reaction_key:
            continue
        _, cat, val = _parse_eval_tag(row.reaction_key)
        if not cat or cat not in cats or val not in cats[cat]['counts']:
            continue
        cats[cat]['counts'][val] += 1
        cats[cat]['total'] += 1
        if viewer_id and row.user_id == viewer_id:
            cats[cat]['viewer_value'] = val

    for cat_data in cats.values():
        total = cat_data['total']
        cat_data['percentages'] = {
            v: (round(cat_data['counts'][v] / total * 100) if total else 0)
            for v in cat_data['counts']
        }

    return cats


def get_summary(convert_id: int, viewer_id: int | None = None) -> dict:
    rows = ConvertEvaluation.query.filter_by(convert_id=convert_id).all()

    likes    = sum(1 for r in rows if r.eval_type == 'like')
    dislikes = sum(1 for r in rows if r.eval_type == 'dislike')

    viewer_like      = False
    viewer_dislike   = False
    if viewer_id:
        for row in rows:
            if row.user_id != viewer_id:
                continue
            if row.eval_type == 'like':
                viewer_like = True
            elif row.eval_type == 'dislike':
                viewer_dislike = True

    eval_comments = Comment.query.filter_by(
        convert_id=convert_id, is_evaluation=True, is_deleted=False
    ).count()

    cti_categories = _build_cti_categories(rows, viewer_id)

    # Approval score = average of all cti-evaluation votes mapped to 0-100
    value_score_map = {'very-low': 0, 'low': 25, 'moderate': 50, 'high': 75, 'very-high': 100}
    all_scores = []
    for row in rows:
        if row.eval_type != 'reaction' or not row.reaction_key:
            continue
        ns, _, val = _parse_eval_tag(row.reaction_key)
        if ns == 'cti-evaluation' and val in value_score_map:
            all_scores.append(value_score_map[val])
    approval_score = round(sum(all_scores) / len(all_scores)) if all_scores else None

    return {
        'likes':          likes,
        'dislikes':       dislikes,
        'viewer_like':    viewer_like,
        'viewer_dislike': viewer_dislike,
        'cti_categories': cti_categories,
        'eval_comments':  eval_comments,
        'approval_score': approval_score,
    }


def toggle_like(convert_id: int, user_id: int) -> dict:
    existing_like    = ConvertEvaluation.query.filter_by(convert_id=convert_id, user_id=user_id, eval_type='like').first()
    existing_dislike = ConvertEvaluation.query.filter_by(convert_id=convert_id, user_id=user_id, eval_type='dislike').first()

    if existing_dislike:
        db.session.delete(existing_dislike)

    if existing_like:
        db.session.delete(existing_like)
        db.session.commit()
        return {'action': 'removed', 'type': 'like'}

    db.session.add(ConvertEvaluation(
        convert_id=convert_id, user_id=user_id, eval_type='like',
        created_at=datetime.datetime.utcnow()
    ))
    db.session.commit()
    return {'action': 'added', 'type': 'like'}


def toggle_dislike(convert_id: int, user_id: int) -> dict:
    existing_like    = ConvertEvaluation.query.filter_by(convert_id=convert_id, user_id=user_id, eval_type='like').first()
    existing_dislike = ConvertEvaluation.query.filter_by(convert_id=convert_id, user_id=user_id, eval_type='dislike').first()

    if existing_like:
        db.session.delete(existing_like)

    if existing_dislike:
        db.session.delete(existing_dislike)
        db.session.commit()
        return {'action': 'removed', 'type': 'dislike'}

    db.session.add(ConvertEvaluation(
        convert_id=convert_id, user_id=user_id, eval_type='dislike',
        created_at=datetime.datetime.utcnow()
    ))
    db.session.commit()
    return {'action': 'added', 'type': 'dislike'}


def toggle_reaction(convert_id: int, user_id: int, reaction_key: str) -> dict:
    tag = Tag.query.filter(
        Tag.name == reaction_key,
        Tag.is_evaluation_tag == True,
        Tag.is_active == True,
    ).first()
    if not tag:
        raise ValueError(f"Unknown reaction key: {reaction_key}")

    ns, cat, val = _parse_eval_tag(reaction_key)

    existing = ConvertEvaluation.query.filter_by(
        convert_id=convert_id, user_id=user_id,
        eval_type='reaction', reaction_key=reaction_key
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return {'action': 'removed', 'type': 'reaction', 'key': reaction_key}

    # For cti-evaluation: radio semantics — replace any prior pick in the same category
    if ns == 'cti-evaluation' and cat:
        prior_rows = ConvertEvaluation.query.filter_by(
            convert_id=convert_id, user_id=user_id, eval_type='reaction'
        ).all()
        for old in prior_rows:
            old_ns, old_cat, _ = _parse_eval_tag(old.reaction_key or '')
            if old_ns == 'cti-evaluation' and old_cat == cat:
                db.session.delete(old)

    db.session.add(ConvertEvaluation(
        convert_id=convert_id, user_id=user_id,
        eval_type='reaction', reaction_key=reaction_key,
        created_at=datetime.datetime.utcnow()
    ))
    db.session.commit()
    return {'action': 'added', 'type': 'reaction', 'key': reaction_key}


def get_admin_list(page: int = 1, per_page: int = 50,
                   filter_type: str = None, filter_convert: str = None) -> dict:
    q = (ConvertEvaluation.query
         .join(ConvertEvaluation.user)
         .join(ConvertEvaluation.convert))

    if filter_type:
        q = q.filter(ConvertEvaluation.eval_type == filter_type)
    if filter_convert:
        q = q.filter(ConvertEvaluation.convert_id == int(filter_convert))

    q = q.order_by(ConvertEvaluation.created_at.desc())
    paginated = q.paginate(page=page, per_page=per_page, error_out=False)

    return {
        'items':    [e.to_json() for e in paginated.items],
        'total':    paginated.total,
        'pages':    paginated.pages,
        'page':     page,
        'per_page': per_page,
    }


def delete_evaluation(eval_id: int) -> bool:
    row = ConvertEvaluation.query.get(eval_id)
    if not row:
        return False
    db.session.delete(row)
    db.session.commit()
    return True
