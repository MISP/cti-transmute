import datetime
from website.web import db
from website.db_class.db import ConvertEvaluation, Comment, Convert, Tag


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


def get_summary(convert_id: int, viewer_id: int | None = None) -> dict:
    tlp_tags = get_tlp_tags()
    rows = ConvertEvaluation.query.filter_by(convert_id=convert_id).all()

    likes    = sum(1 for r in rows if r.eval_type == 'like')
    dislikes = sum(1 for r in rows if r.eval_type == 'dislike')

    reaction_counts = {t['key']: 0 for t in tlp_tags}
    for row in rows:
        if row.eval_type == 'reaction' and row.reaction_key in reaction_counts:
            reaction_counts[row.reaction_key] += 1

    viewer_like      = False
    viewer_dislike   = False
    viewer_reactions: list[str] = []
    if viewer_id:
        for row in rows:
            if row.user_id != viewer_id:
                continue
            if row.eval_type == 'like':
                viewer_like = True
            elif row.eval_type == 'dislike':
                viewer_dislike = True
            elif row.eval_type == 'reaction' and row.reaction_key:
                viewer_reactions.append(row.reaction_key)

    eval_comments = Comment.query.filter_by(
        convert_id=convert_id, is_evaluation=True, is_deleted=False
    ).count()

    return {
        'likes':            likes,
        'dislikes':         dislikes,
        'reactions':        reaction_counts,
        'viewer_like':      viewer_like,
        'viewer_dislike':   viewer_dislike,
        'viewer_reactions': viewer_reactions,
        'reaction_defs':    tlp_tags,
        'eval_comments':    eval_comments,
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

    existing = ConvertEvaluation.query.filter_by(
        convert_id=convert_id, user_id=user_id,
        eval_type='reaction', reaction_key=reaction_key
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return {'action': 'removed', 'type': 'reaction', 'key': reaction_key}

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
