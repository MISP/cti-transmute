import datetime
import re
from collections import Counter

from website.db_class.db import Comment, Conversion, ConversionEvaluation, Tag
from website.web import db

VALUE_ORDER = ['very-low', 'low', 'moderate', 'high', 'very-high']


def _parse_eval_tag(name: str):
    """Parse 'ns:category="value"' → (ns, category, value) or (None, None, None)."""
    m = re.match(r'^([\w-]+):([\w.-]+)="([\w.-]+)"$', name or '')
    if m:
        return m.group(1), m.group(2), m.group(3)
    return None, None, None


def get_tlp_tags() -> list[dict]:
    tags = (Tag.query
            .filter(Tag.is_evaluation_tag, Tag.is_active)
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
            .filter(Tag.is_evaluation_tag, Tag.is_active,
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


def get_summary(conversion_id: int, viewer_id: int | None = None) -> dict:
    rows = ConversionEvaluation.query.filter_by(conversion_id=conversion_id).all()

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
        conversion_id=conversion_id, is_evaluation=True, is_deleted=False
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


def toggle_like(conversion_id: int, user_id: int) -> dict:
    existing_like    = ConversionEvaluation.query.filter_by(conversion_id=conversion_id, user_id=user_id, eval_type='like').first()
    existing_dislike = ConversionEvaluation.query.filter_by(conversion_id=conversion_id, user_id=user_id, eval_type='dislike').first()

    if existing_dislike:
        db.session.delete(existing_dislike)

    if existing_like:
        db.session.delete(existing_like)
        db.session.commit()
        return {'action': 'removed', 'type': 'like'}

    db.session.add(ConversionEvaluation(
        conversion_id=conversion_id, user_id=user_id, eval_type='like',
        created_at=datetime.datetime.utcnow()
    ))
    db.session.commit()
    return {'action': 'added', 'type': 'like'}


def toggle_dislike(conversion_id: int, user_id: int) -> dict:
    existing_like    = ConversionEvaluation.query.filter_by(conversion_id=conversion_id, user_id=user_id, eval_type='like').first()
    existing_dislike = ConversionEvaluation.query.filter_by(conversion_id=conversion_id, user_id=user_id, eval_type='dislike').first()

    if existing_like:
        db.session.delete(existing_like)

    if existing_dislike:
        db.session.delete(existing_dislike)
        db.session.commit()
        return {'action': 'removed', 'type': 'dislike'}

    db.session.add(ConversionEvaluation(
        conversion_id=conversion_id, user_id=user_id, eval_type='dislike',
        created_at=datetime.datetime.utcnow()
    ))
    db.session.commit()
    return {'action': 'added', 'type': 'dislike'}


def toggle_reaction(conversion_id: int, user_id: int, reaction_key: str) -> dict:
    tag = Tag.query.filter(
        Tag.name == reaction_key, Tag.is_evaluation_tag, Tag.is_active
    ).first()
    if not tag:
        raise ValueError(f"Unknown reaction key: {reaction_key}")

    ns, cat, val = _parse_eval_tag(reaction_key)

    existing = ConversionEvaluation.query.filter_by(
        conversion_id=conversion_id, user_id=user_id,
        eval_type='reaction', reaction_key=reaction_key
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return {'action': 'removed', 'type': 'reaction', 'key': reaction_key}

    # For cti-evaluation: radio semantics — replace any prior pick in the same category
    if ns == 'cti-evaluation' and cat:
        prior_rows = ConversionEvaluation.query.filter_by(
            conversion_id=conversion_id, user_id=user_id, eval_type='reaction'
        ).all()
        for old in prior_rows:
            old_ns, old_cat, _ = _parse_eval_tag(old.reaction_key or '')
            if old_ns == 'cti-evaluation' and old_cat == cat:
                db.session.delete(old)

    db.session.add(ConversionEvaluation(
        conversion_id=conversion_id, user_id=user_id,
        eval_type='reaction', reaction_key=reaction_key,
        created_at=datetime.datetime.utcnow()
    ))
    db.session.commit()
    return {'action': 'added', 'type': 'reaction', 'key': reaction_key}


def get_admin_list(page: int = 1, per_page: int = 50,
                   filter_type: str = None, filter_conversion: str = None) -> dict:
    q = (ConversionEvaluation.query
         .join(ConversionEvaluation.user)
         .join(ConversionEvaluation.conversion))

    if filter_type:
        q = q.filter(ConversionEvaluation.eval_type == filter_type)
    if filter_conversion:
        q = q.filter(ConversionEvaluation.conversion_id == int(filter_conversion))

    q = q.order_by(ConversionEvaluation.created_at.desc())
    paginated = q.paginate(page=page, per_page=per_page, error_out=False)

    return {
        'items':    [e.to_json() for e in paginated.items],
        'total':    paginated.total,
        'pages':    paginated.pages,
        'page':     page,
        'per_page': per_page,
    }


def get_misp_push_tags(conversion_id: int) -> list[str]:
    """
    Return evaluation tag names to inject into a MISP event on push.
    Includes each cti-evaluation reaction_key voted on this conversion,
    plus a computed cti-evaluation:overall-score="<level>" tag when votes exist.
    """
    rows = ConversionEvaluation.query.filter_by(conversion_id=conversion_id).all()

    reaction_keys: set[str] = {
        row.reaction_key for row in rows
        if row.eval_type == 'reaction' and row.reaction_key
    }

    # Count votes per level across all reaction tags
    level_votes: Counter = Counter()
    for row in rows:
        if row.eval_type != 'reaction' or not row.reaction_key:
            continue
        _, _, val = _parse_eval_tag(row.reaction_key)
        if val in VALUE_ORDER:
            level_votes[val] += 1

    if level_votes:
        max_votes = max(level_votes.values())
        # Among all levels tied for most votes, pick the lowest (most pessimistic)
        # VALUE_ORDER is already sorted lowest→highest, so first match = lowest
        candidates = [v for v in VALUE_ORDER if level_votes.get(v, 0) == max_votes]
        reaction_keys.add(f'cti-evaluation:overall-score="{candidates[0]}"')

    return list(reaction_keys)


def get_consensus_tags(conversion_id: int, threshold: int = 3) -> list[dict]:
    """
    Return evaluation tag objects that meet the vote threshold.
    For each category (overall-score, accuracy, quality…):
      - count votes per level
      - if max votes >= threshold, pick the winning level
      - on tie: pick the lowest level (VALUE_ORDER sorted lowest→highest)
    Returns full tag objects (color, icon, description from DB when found).
    """
    rows = ConversionEvaluation.query.filter_by(conversion_id=conversion_id).all()

    category_votes: dict[str, Counter] = {}
    for row in rows:
        if row.eval_type != 'reaction' or not row.reaction_key:
            continue
        _, cat, val = _parse_eval_tag(row.reaction_key)
        if not cat or not val:
            continue
        if cat not in category_votes:
            category_votes[cat] = Counter()
        category_votes[cat][val] += 1

    consensus = []
    for cat, votes in sorted(category_votes.items()):
        if not votes:
            continue
        max_votes = max(votes.values())
        if max_votes < threshold:
            continue
        # Tie-break: among all levels with max_votes, pick the lowest (most pessimistic)
        tied = [v for v in VALUE_ORDER if votes.get(v, 0) == max_votes]
        if not tied:
            tied = [k for k, v in votes.items() if v == max_votes]
        winning_level = tied[0]
        tag_name = f'cti-evaluation:{cat}="{winning_level}"'

        tag_obj = Tag.query.filter_by(name=tag_name, is_evaluation_tag=True).first()
        consensus.append({
            'id':          tag_obj.id if tag_obj else None,
            'name':        tag_name,
            'category':    cat,
            'level':       winning_level,
            'votes':       max_votes,
            'color':       tag_obj.color if tag_obj else None,
            'icon':        tag_obj.icon if tag_obj else None,
            'description': tag_obj.description if tag_obj else None,
            'visibility':  'public',
        })

    return consensus


def delete_evaluation(eval_id: int) -> bool:
    row = ConversionEvaluation.query.get(eval_id)
    if not row:
        return False
    db.session.delete(row)
    db.session.commit()
    return True


def get_global_stats() -> dict:
    """Platform-wide evaluation stats. Only public, active conversions."""
    pub_ids = {c.id for c in Conversion.query.filter_by(public=True, is_active=True).with_entities(Conversion.id).all()}
    rows = ConversionEvaluation.query.filter(ConversionEvaluation.conversion_id.in_(pub_ids)).all()

    total_likes     = sum(1 for r in rows if r.eval_type == 'like')
    total_dislikes  = sum(1 for r in rows if r.eval_type == 'dislike')
    total_reactions = sum(1 for r in rows if r.eval_type == 'reaction')
    like_total      = total_likes + total_dislikes
    like_ratio      = round(total_likes / like_total * 100) if like_total else None
    conversions_evaluated = len({r.conversion_id for r in rows})

    tag_counts = Counter(r.reaction_key for r in rows if r.eval_type == 'reaction' and r.reaction_key)
    top_tag_names = [n for n, _ in tag_counts.most_common(10)]
    tag_objs = {t.name: t for t in Tag.query.filter(Tag.name.in_(top_tag_names)).all()}
    top_tags = []
    for name, count in tag_counts.most_common(10):
        t = tag_objs.get(name)
        _, cat, val = _parse_eval_tag(name)
        top_tags.append({
            "name":  name,
            "count": count,
            "color": t.color if t else None,
            "label": f"{cat}: {val}" if cat and val else name,
        })

    category_breakdown = {}
    for r in rows:
        if r.eval_type != 'reaction' or not r.reaction_key:
            continue
        _, cat, val = _parse_eval_tag(r.reaction_key)
        if not cat or not val:
            continue
        if cat not in category_breakdown:
            category_breakdown[cat] = {v: 0 for v in VALUE_ORDER}
        if val in category_breakdown[cat]:
            category_breakdown[cat][val] += 1

    value_score_map = {'very-low': 0, 'low': 25, 'moderate': 50, 'high': 75, 'very-high': 100}
    all_scores = []
    for r in rows:
        if r.eval_type != 'reaction' or not r.reaction_key:
            continue
        ns, _, val = _parse_eval_tag(r.reaction_key)
        if ns == 'cti-evaluation' and val in value_score_map:
            all_scores.append(value_score_map[val])
    avg_score = round(sum(all_scores) / len(all_scores)) if all_scores else None

    return {
        "total_evaluations":  len(rows),
        "total_likes":        total_likes,
        "total_dislikes":     total_dislikes,
        "total_reactions":    total_reactions,
        "conversions_evaluated": conversions_evaluated,
        "like_ratio":         like_ratio,
        "top_tags":           top_tags,
        "category_breakdown": category_breakdown,
        "avg_score":          avg_score,
    }


def submit_platform_review(user_id: int, rating: int, comment: str) -> dict:
    from website.db_class.db import PlatformReview
    if not (1 <= rating <= 5):
        raise ValueError("Rating must be between 1 and 5")
    rev = PlatformReview(
        user_id=user_id,
        rating=rating,
        comment=comment.strip() if comment else None,
        created_at=datetime.datetime.utcnow(),
    )
    db.session.add(rev)
    db.session.commit()
    return rev.to_json()


def get_platform_reviews(page: int = 1, per_page: int = 10) -> dict:
    from website.db_class.db import PlatformReview
    paginated = PlatformReview.query.order_by(PlatformReview.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return {
        "items": [r.to_json() for r in paginated.items],
        "total": paginated.total,
        "pages": paginated.pages,
        "page":  page,
    }


def get_activity_timeline(days: int = 30) -> list:
    """Returns evaluation count per day for the last N days (public conversions only)."""
    from collections import defaultdict
    pub_ids = {c.id for c in Conversion.query.filter_by(public=True, is_active=True).with_entities(Conversion.id).all()}
    since = datetime.datetime.utcnow() - datetime.timedelta(days=days)
    rows = ConversionEvaluation.query.filter(
        ConversionEvaluation.conversion_id.in_(pub_ids),
        ConversionEvaluation.created_at >= since
    ).all()
    daily = defaultdict(int)
    for r in rows:
        if r.created_at:
            daily[r.created_at.strftime('%Y-%m-%d')] += 1
    result = []
    for i in range(days):
        day = (datetime.datetime.utcnow() - datetime.timedelta(days=days - 1 - i)).strftime('%Y-%m-%d')
        result.append({"date": day, "count": daily.get(day, 0)})
    return result


SCORE_MAP = {'very-low': 0, 'low': 25, 'moderate': 50, 'high': 75, 'very-high': 100}

DIMENSION_LABELS = {
    'accuracy':           'Accuracy',
    'clarity':            'Clarity',
    'confidence':         'Confidence',
    'conversion-fidelity':'Conversion Fidelity',
    'evidence-strength':  'Evidence Strength',
    'format-validity':    'Format Validity',
    'relevance':          'Relevance',
    'source-reliability': 'Source Reliability',
    'specificity':        'Specificity',
    'timeliness':         'Timeliness',
    'usefulness':         'Usefulness',
}

DIMENSION_DESCRIPTIONS = {
    'accuracy':           'Whether assertions are based on reliable, verified, and corroborated data.',
    'clarity':            'Whether the CTI is understandable, unambiguous, and actionable for its intended audience.',
    'confidence':         'Analyst or reviewer confidence in the CTI judgments.',
    'conversion-fidelity':'How faithfully intelligence survives format conversion (e.g. MISP ↔ STIX).',
    'evidence-strength':  'Strength and sufficiency of supporting evidence for the claims.',
    'format-validity':    'Conformance of CTI artifacts to expected schema/syntax (STIX, MISP).',
    'relevance':          'Whether the CTI pertains directly to the user mission and decision-making needs.',
    'source-reliability': 'Reliability of primary and secondary sources underpinning the CTI.',
    'specificity':        'Whether CTI contains concrete details (what, where, when, who, how) needed to act.',
    'timeliness':         'Whether CTI is delivered with enough lead time for effective action.',
    'usefulness':         'Practical utility of CTI for operations, detection, response, or strategic decisions.',
}


def build_evaluation_report(conversion_id: int) -> dict | None:
    """
    Assemble all data needed to render an evaluation report (Markdown or PDF).

    Returns a structured dict or None if the conversion does not exist.
    Fields:
      conversion        – basic conversion metadata
      generated_at   – UTC timestamp string
      overall        – {level, score, total_votes, likes, dislikes, like_ratio}
      dimensions     – list of {key, label, description, level, score, votes, distribution}
      consensus_tags – list of {name, category, level, votes}
      all_tags       – sorted list of tag name strings
      eval_comments  – list of {author, content, created_at}
    """
    conversion = Conversion.query.get(conversion_id)
    if not conversion:
        return None

    summary        = get_summary(conversion_id)
    consensus_tags = get_consensus_tags(conversion_id, threshold=2)
    push_tags      = get_misp_push_tags(conversion_id)

    # Overall level from push tags
    overall_level = None
    for t in push_tags:
        _, cat, val = _parse_eval_tag(t)
        if cat == 'overall-score':
            overall_level = val
            break

    like_total  = summary['likes'] + summary['dislikes']
    like_ratio  = round(summary['likes'] / like_total * 100) if like_total else None

    # Build per-dimension rows (only categories that received at least one vote)
    dimensions = []
    for key, data in sorted(summary['cti_categories'].items()):
        if data['total'] == 0:
            continue
        # Dominant level = highest vote count; on tie, most pessimistic (lowest in VALUE_ORDER)
        max_votes = max(data['counts'].values())
        dominant  = next(v for v in VALUE_ORDER if data['counts'].get(v, 0) == max_votes)
        dimensions.append({
            'key':         key,
            'label':       DIMENSION_LABELS.get(key, key.replace('-', ' ').title()),
            'description': DIMENSION_DESCRIPTIONS.get(key, ''),
            'level':       dominant,
            'score':       SCORE_MAP.get(dominant, 0),
            'votes':       data['total'],
            'distribution': {
                v: {'count': data['counts'].get(v, 0), 'pct': data['percentages'].get(v, 0)}
                for v in VALUE_ORDER
            },
        })

    # Evaluation comments
    eval_comments_raw = (
        Comment.query
        .filter_by(conversion_id=conversion_id, is_evaluation=True, is_deleted=False)
        .order_by(Comment.created_at.asc())
        .all()
    )
    from website.db_class.db import User
    eval_comments = []
    for c in eval_comments_raw:
        u = User.query.get(c.user_id)
        eval_comments.append({
            'author':     u.first_name if u else 'Anonymous',
            'content':    c.content,
            'created_at': c.created_at.strftime('%Y-%m-%d %H:%M') if c.created_at else '',
        })

    source_fmt = 'MISP'     if conversion.conversion_type == 'MISP_TO_STIX' else 'STIX 2.1'
    target_fmt = 'STIX 2.1' if conversion.conversion_type == 'MISP_TO_STIX' else 'MISP'

    return {
        'conversion': {
            'id':          conversion.id,
            'name':        conversion.name,
            'uuid':        conversion.uuid,
            'description': conversion.description or '',
            'type':        conversion.conversion_type,
            'source_fmt':  source_fmt,
            'target_fmt':  target_fmt,
            'created_at':  conversion.created_at.strftime('%Y-%m-%d %H:%M') if conversion.created_at else '',
            'public':      conversion.public,
        },
        'generated_at': datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'),
        'overall': {
            'level':       overall_level,
            'score':       summary.get('approval_score'),
            'total_votes': sum(d['total'] for d in summary['cti_categories'].values()),
            'likes':       summary['likes'],
            'dislikes':    summary['dislikes'],
            'like_ratio':  like_ratio,
        },
        'dimensions':     dimensions,
        'consensus_tags': consensus_tags,
        'all_tags':       sorted(push_tags),
        'eval_comments':  eval_comments,
    }


def render_evaluation_markdown(report: dict) -> str:
    """
    Render a report dict (from build_evaluation_report) as a Markdown string.
    """
    c   = report['conversion']
    ov  = report['overall']
    now = report['generated_at']

    SCORE_EMOJI = {'very-low': '🔴', 'low': '🟠', 'moderate': '🟡', 'high': '🟢', 'very-high': '🔵'}

    lines = []

    # ── Header ───────────────────────────────────────────────────
    lines += [
        '# CTI Evaluation Report',
        '',
        f'## {c["name"]}',
        '',
        '| Field | Value |',
        '|---|---|',
        f'| **Conversion type** | {c["source_fmt"]} → {c["target_fmt"]} |',
        f'| **Conversion date** | {c["created_at"]} |',
        f'| **Report generated** | {now} |',
        f'| **UUID** | `{c["uuid"]}` |',
        f'| **Visibility** | {"Public" if c["public"] else "Private"} |',
        '',
    ]

    if c['description']:
        lines += [f'> {c["description"]}', '']

    lines += ['---', '']

    # ── Overall score ─────────────────────────────────────────────
    emoji = SCORE_EMOJI.get(ov['level'], '⚪') if ov['level'] else '⚪'
    score_str = f'{ov["score"]}/100' if ov['score'] is not None else 'N/A'
    level_str = ov['level'].upper() if ov['level'] else 'No data'

    lines += [
        f'## Overall Score: {emoji} {level_str} ({score_str})',
        '',
        f'Community assessment based on **{ov["total_votes"]} vote(s)** '
        f'from the CTI-Transmute platform.',
        '',
        f'- 👍 **{ov["likes"]} like(s)**'
        + (f' · 👎 **{ov["dislikes"]} dislike(s)**' if ov['dislikes'] else ''),
    ]
    if ov['like_ratio'] is not None:
        lines.append(f'- Approval ratio: **{ov["like_ratio"]}%**')
    lines += ['', '---', '']

    # ── Dimension breakdown ───────────────────────────────────────
    if report['dimensions']:
        lines += ['## Dimension Scores', '']
        lines += [
            '| Dimension | Level | Score | Votes | Description |',
            '|---|---|---|---|---|',
        ]
        for d in report['dimensions']:
            emoji_d = SCORE_EMOJI.get(d['level'], '⚪')
            lines.append(
                f'| **{d["label"]}** | {emoji_d} {d["level"]} '
                f'| {d["score"]}/100 | {d["votes"]} | {d["description"]} |'
            )
        lines += ['', '---', '']

        # Detail bars per dimension
        lines += ['## Vote Distribution per Dimension', '']
        for d in report['dimensions']:
            lines.append(f'### {d["label"]}')
            lines.append(f'*{d["description"]}*')
            lines.append('')
            for level in VALUE_ORDER:
                dist  = d['distribution'][level]
                count = dist['count']
                pct   = dist['pct']
                bar   = '█' * (pct // 10) + '░' * (10 - pct // 10)
                em    = SCORE_EMOJI.get(level, '⚪')
                lines.append(f'- {em} `{level:10}` {bar} {pct:3}% ({count} vote(s))')
            lines.append('')
        lines += ['---', '']

    # ── Consensus tags ────────────────────────────────────────────
    if report['consensus_tags']:
        lines += ['## Consensus Tags (≥ 2 votes)', '']
        for t in report['consensus_tags']:
            emoji_t = SCORE_EMOJI.get(t['level'], '⚪')
            lines.append(f'- {emoji_t} `cti-evaluation:{t["category"]}="{t["level"]}"` — {t["votes"]} vote(s)')
        lines += ['', '---', '']

    # ── All applied tags ──────────────────────────────────────────
    if report['all_tags']:
        lines += ['## Applied MISP Taxonomy Tags', '']
        for tag in report['all_tags']:
            lines.append(f'- `{tag}`')
        lines += ['', '---', '']

    # ── Evaluation comments ───────────────────────────────────────
    if report['eval_comments']:
        lines += ['## Evaluation Comments', '']
        for cm in report['eval_comments']:
            lines.append(f'**{cm["author"]}** — *{cm["created_at"]}*')
            lines.append(f'> {cm["content"]}')
            lines.append('')
        lines += ['---', '']

    # ── Methodology note ──────────────────────────────────────────
    lines += [
        '## Methodology',
        '',
        'Scores are derived from community votes on the **CTI-Transmute** platform '
        'using the [MISP cti-evaluation taxonomy]'
        '(https://github.com/MISP/misp-taxonomies/blob/main/cti-evaluation/machinetag.json).',
        '',
        '| Level | Numeric score |',
        '|---|---|',
        '| very-low | 0/100 |',
        '| low | 25/100 |',
        '| moderate | 50/100 |',
        '| high | 75/100 |',
        '| very-high | 100/100 |',
        '',
        'The **overall score** is the mean of all dimension votes.',
        'The **consensus level** for a dimension requires at least 2 votes on the same level.',
        '',
        '---',
        '',
        f'*Generated by [CTI-Transmute](https://cti-transmute.org) — {now}*',
    ]

    return '\n'.join(lines)


def render_evaluation_pdf(report: dict) -> bytes:
    """
    Render a report dict as a PDF byte string using WeasyPrint.
    Converts the Markdown to HTML first, then applies an embedded CSS stylesheet.
    """
    import markdown as md
    from weasyprint import HTML as WP_HTML

    md_text  = render_evaluation_markdown(report)
    html_body = md.markdown(md_text, extensions=['tables', 'fenced_code'])

    SCORE_COLORS = {
        'very-low':  '#e05555',
        'low':       '#d97706',
        'moderate':  '#c9a900',
        'high':      '#18a34a',
        'very-high': '#2b6fe8',
    }

    # Build small colored level badges via inline style in the CSS
    level_css = '\n'.join(
        f'.lvl-{lvl} {{ background:{color}22; color:{color}; padding:2px 8px; border-radius:4px; font-weight:600; font-size:.82em; }}'
        for lvl, color in SCORE_COLORS.items()
    )

    css = f"""
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @page {{
        margin: 2cm 2.2cm;
        @bottom-right {{ content: "Page " counter(page) " / " counter(pages); font-size: 9pt; color: #94a3b8; }}
        @bottom-left  {{ content: "CTI-Transmute — Evaluation Report"; font-size: 9pt; color: #94a3b8; }}
    }}
    body   {{ font-family: 'Inter', Arial, sans-serif; font-size: 10.5pt; color: #1e293b; line-height: 1.65; }}
    h1     {{ font-size: 20pt; color: #0f172a; border-bottom: 3px solid #2563eb; padding-bottom: .3em; margin-top: 0; }}
    h2     {{ font-size: 14pt; color: #1e3a5f; border-bottom: 1px solid #e2e8f0; padding-bottom: .2em; margin-top: 1.6em; }}
    h3     {{ font-size: 11pt; color: #334155; margin-top: 1.2em; margin-bottom: .3em; }}
    table  {{ width: 100%; border-collapse: collapse; margin: .8em 0; font-size: 9.5pt; }}
    th     {{ background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; font-weight: 600; color: #334155; }}
    td     {{ border: 1px solid #e2e8f0; padding: 5px 10px; vertical-align: top; }}
    tr:nth-child(even) td {{ background: #f8fafc; }}
    code   {{ background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: .88em; color: #334155; }}
    pre    {{ background: #f1f5f9; padding: .7em 1em; border-radius: 6px; font-size: .82em; overflow-x: auto; }}
    blockquote {{ border-left: 4px solid #2563eb; margin: .8em 0; padding: .4em 1em; background: #eff6ff; color: #1e3a5f; border-radius: 0 6px 6px 0; }}
    hr     {{ border: none; border-top: 1px solid #e2e8f0; margin: 1.4em 0; }}
    a      {{ color: #2563eb; }}
    ul li  {{ margin-bottom: .2em; }}
    {level_css}
    """

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>{css}</style>
</head>
<body>
{html_body}
</body>
</html>"""

    return WP_HTML(string=full_html).write_pdf()


def get_recent_to_evaluate(viewer_id=None, limit=8) -> list:
    """Recent public conversions, with their evaluation summary."""
    conversions = (Conversion.query
                .filter_by(public=True, is_active=True)
                .order_by(Conversion.created_at.desc())
                .limit(limit).all())
    result = []
    for c in conversions:
        summary = get_summary(c.id, viewer_id)
        result.append({
            "id":              c.id,
            "name":            c.name,
            "description":     c.description,
            "conversion_type": c.conversion_type,
            "created_at":      c.created_at.strftime('%Y-%m-%d') if c.created_at else None,
            "eval_summary":    summary,
        })
    return result
