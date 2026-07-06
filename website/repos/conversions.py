"""Persistence for the Conversion aggregate (Conversion + ConversionHistory).

This is the single place that reads and writes ``Conversion`` and
``ConversionHistory`` rows. The conversion use-cases in
``website/lib/conversions.py`` and the web views in
``website/web/convert/`` route their Conversion persistence through here.

Transaction seam: every write takes ``commit: bool = True``. Web-CRUD callers
keep the default (each call is its own transaction). The spine use-cases pass
``commit=False`` so the row and its ``SystemLog`` audit entry commit together in
one all-or-nothing transaction owned by the use-case.
"""

import uuid as uuid_lib
from datetime import datetime, timedelta, timezone

from flask_sqlalchemy.pagination import Pagination
from sqlalchemy import asc, desc, func, or_

from website.db_class.db import (
    Conversion,  ConversionFavorite, ConversionHistory,
    ConversionTagAssociation, User)
from website.db_class.db import Tag as TagModel
from website.web import db
from website.web.utils import generate_api_key

# --- Conversion: writes ------------------------------------------------------

def create(
    *, user_id: int | None, name: str, source_format: str | None,
    target_format: str | None, input_text: str, output_text: str,
    params: dict | None, description: str | None = None, public: bool = True,
    created_at: datetime | None = None, updated_at: datetime | None = None,
    commit: bool = True) -> Conversion:
    """Build and persist a ``Conversion`` row, minting its uuid and share key.

    ``add`` + ``flush`` always run (so ``conversion.id`` is assigned); the
    commit is gated on ``commit`` so a caller can bundle this row with other
    writes (e.g. an audit log) in one transaction.
    """
    now = created_at or datetime.now(timezone.utc)
    conversion = Conversion(
        user_id=user_id,
        name=name,
        source_format=source_format,
        target_format=target_format,
        input_text=input_text,
        output_text=output_text,
        params=params,
        description=description,
        created_at=now,
        updated_at=updated_at or now,
        public=public,
        uuid=str(uuid_lib.uuid4()),
        share_key=generate_api_key(36)
    )
    db.session.add(conversion)
    db.session.flush()  # assign conversion.id within the transaction
    if commit:
        db.session.commit()
    return conversion


def create_history(
    *, conversion: Conversion, new_output_text: str, params: dict | None,
    status: str = "pending", created_at: datetime | None = None,
    commit: bool = True) -> ConversionHistory:
    """Persist a ``ConversionHistory`` row for ``conversion``'s next version.

    Ownership, visibility, and the input/old-output snapshots are copied from
    the parent Conversion; the version is the next in sequence and the uuid is
    minted here. ``commit`` gates the transaction as for :func:`create`.
    """
    history = ConversionHistory(
        user_id=conversion.user_id,  # refresh doesn't change ownership
        conversion_id=conversion.id,
        version=next_history_version(conversion.id),
        uuid=str(uuid_lib.uuid4()),
        status=status,
        public=conversion.public,
        input_text=conversion.input_text,
        old_output_text=conversion.output_text,
        new_output_text=new_output_text,
        params=params,
        created_at=created_at or datetime.now(timezone.utc)
    )
    db.session.add(history)
    db.session.flush()  # assign history.id within the transaction
    if commit:
        db.session.commit()
    return history


def set_history_status(history: ConversionHistory, status: str, *,
                       commit: bool = True) -> ConversionHistory:
    """Set a history row's workflow ``status`` ('accepted' / 'rejected' / …)."""
    history.status = status
    if commit:
        db.session.commit()
    return history


def soft_delete(conversion_id: int, *, commit: bool = True) -> bool:
    """Soft-delete a Conversion (is_active=False, stamp deleted_at). False if missing."""
    conversion = Conversion.query.get(conversion_id)
    if not conversion:
        return False
    conversion.is_active = False
    conversion.deleted_at = datetime.now(timezone.utc)
    if commit:
        db.session.commit()
    return True


def restore(conversion_id: int, *, commit: bool = True) -> bool:
    """Restore a soft-deleted Conversion. False if missing or already active."""
    conversion = Conversion.query.get(conversion_id)
    if not conversion or conversion.is_active:
        return False
    conversion.is_active = True
    conversion.deleted_at = None
    if commit:
        db.session.commit()
    return True


def hard_delete(conversion_id: int, *, commit: bool = True) -> bool:
    """Permanently remove a Conversion row. False if missing."""
    conversion = Conversion.query.get(conversion_id)
    if not conversion:
        return False
    db.session.delete(conversion)
    if commit:
        db.session.commit()
    return True


def toggle_visibility(conversion_id: int, *, commit: bool = True) -> tuple[bool, bool]:
    """Flip a Conversion's public flag. Returns (found, new_public_value)."""
    conversion = get(conversion_id)
    if not conversion:
        return False, False
    conversion.public = not conversion.public
    new_value = conversion.public
    if commit:
        db.session.commit()
    return True, new_value


def edit(conversion_id: int, data: dict, *, commit: bool = True) -> tuple[bool, str]:
    """Update a Conversion's name and/or description.

    Rejects a name that collides with an existing Conversion. Returns
    (ok, message) — matching the web layer's existing contract.
    """
    conversion = get(conversion_id)
    if not conversion:
        return False, "no convert with this id"

    if conversion.name != data.get("name", conversion.name):
        existing = Conversion.query.filter_by(
            name=data.get("name", conversion.name)).first()
        if existing:
            return False, "Name already existe"

    conversion.name = data.get("name", conversion.name)
    conversion.description = data.get("description", conversion.description)
    if commit:
        db.session.commit()
    return True, ""


def regenerate_share_key(
        conversion_id: int, *, commit: bool = True) -> tuple[bool, str | None]:
    """Mint a fresh share key for a Conversion. Returns (found, new_key)."""
    conversion = get(conversion_id)
    if not conversion:
        return False, None
    conversion.share_key = generate_api_key(36)
    if commit:
        db.session.commit()
    return True, conversion.share_key


def next_history_version(conversion_id: int) -> int:
    """Next history version number; the base Conversion is treated as version 1."""
    last = (
        ConversionHistory.query
        .filter_by(conversion_id=conversion_id)
        .order_by(ConversionHistory.version.desc())
        .first()
    )
    return 2 if last is None else last.version + 1


# --- Conversion: single-row reads --------------------------------------------

def get(conversion_id: int, include_deleted: bool = False) -> Conversion | None:
    """Fetch a Conversion by id; soft-deleted rows are hidden unless requested."""
    conversion = Conversion.query.get(conversion_id)
    if conversion and not include_deleted and not conversion.is_active:
        return None
    return conversion


def get_by_uuid(uuid: str) -> Conversion | None:
    """Fetch a Conversion by its uuid."""
    return Conversion.query.filter_by(uuid=uuid).first()


# --- ConversionHistory: reads ------------------------------------------------

def get_history(history_id: int) -> ConversionHistory | None:
    """Fetch a single ConversionHistory row by its id."""
    return ConversionHistory.query.filter_by(id=history_id).first()


def latest_history(conversion_id: int) -> ConversionHistory | None:
    """The highest-version history row for a conversion."""
    return (
        ConversionHistory.query
        .filter_by(conversion_id=conversion_id)
        .order_by(ConversionHistory.version.desc())
        .first()
    )


def latest_history_list(conversion_id: int) -> list[ConversionHistory]:
    """All history rows for a conversion, newest version first."""
    return (
        ConversionHistory.query
        .filter_by(conversion_id=conversion_id)
        .order_by(ConversionHistory.version.desc())
        .all()
    )


def accepted_history_list(conversion_id: int) -> list[ConversionHistory]:
    """Accepted history rows for a conversion, oldest version first."""
    return (
        ConversionHistory.query
        .filter_by(conversion_id=conversion_id, status="accepted")
        .order_by(ConversionHistory.version.asc())
        .all()
    )


# --- Conversion: listing / search --------------------------------------------

def list_for_user(
        user: User | None, page: int, *, filter_type: str | None = None,
        sort_order: str = 'desc', only_mine: str = 'false',
        searchQuery: str | None = None, search_scope: str = 'all',
        date_from: str | None = None, date_to: str | None = None,
        exact_match: bool = False, tag_names: list[str] | None = None,
        vis_filter: str | None = None, favorites_only: bool = False,
        favorites_user_id: int | None = None) -> Pagination:
    """Paginated Conversion listing, access-scoped to ``user``.

    ``user`` is the actor, lifted out of ``flask_login.current_user`` by the
    caller (``current_user._get_current_object()`` when authenticated, else
    ``None``) so the repo carries no request-context dependency:

    - an **admin** sees every Conversion (public + private, all owners);
    - an **authenticated** non-admin sees public rows plus their own private ones;
    - an **anonymous** actor (``user is None``) sees public rows only.

    - search_scope: 'all' | 'name' | 'description' | 'content'
    - exact_match: if True, search for exact phrase instead of contains
    """

    query = Conversion.query.filter(Conversion.is_active)
    if searchQuery:
        if exact_match:
            search_pattern = searchQuery  # exact, case-sensitive via ilike = case-insensitive exact
            def make_filter(col): return col.ilike(search_pattern)
        else:
            search_pattern = f"%{searchQuery}%"
            def make_filter(col): return col.ilike(search_pattern)

        if search_scope == 'name':
            query = query.filter(make_filter(Conversion.name))
        elif search_scope == 'description':
            query = query.filter(make_filter(Conversion.description))
        elif search_scope == 'content':
            query = query.filter(
                or_(make_filter(Conversion.input_text), make_filter(Conversion.output_text))
            )
        else:  # 'all'
            query = query.filter(
                or_(
                    make_filter(Conversion.name),
                    make_filter(Conversion.description),
                    make_filter(Conversion.input_text),
                    make_filter(Conversion.output_text),
                )
            )

    # Date range filter
    if date_from:
        try:
            query = query.filter(Conversion.created_at >= datetime.strptime(date_from, '%Y-%m-%d'))
        except ValueError:
            pass
    if date_to:
        try:
            dt_to = datetime.strptime(date_to, '%Y-%m-%d') + timedelta(days=1)
            query = query.filter(Conversion.created_at < dt_to)
        except ValueError:
            pass

    # Filter by conversion type if provided
    if filter_type:
        query = query.filter(Conversion.conversion_type == filter_type)

    # Visibility filter (public / private)
    if vis_filter == 'public':
        query = query.filter(Conversion.public)
    elif vis_filter == 'private':
        query = query.filter(not Conversion.public)

    # Conversion only_mine to boolean
    only_mine_bool = str(only_mine).lower() in ['true', '1', 'yes', 'on']

    # Access scoping, from the actor passed in by the caller
    if user is not None and user.is_admin():
        # Admin sees everything: public + private + all users
        if only_mine_bool:
            # Admin wants to see only their own conversions
            query = query.filter(Conversion.user_id == user.id)
        # else: no filter, show absolutely everything
    elif user is not None:
        if only_mine_bool:
            # Show only current user's conversions
            query = query.filter(Conversion.user_id == user.id)
        else:
            # Show public conversions and the user's private conversions
            query = query.filter(Conversion.public | (Conversion.user_id == user.id))
    else:
        # Anonymous user: only public conversions
        query = query.filter(Conversion.public)

    # Order by created_at
    if sort_order == 'asc':
        query = query.order_by(asc(Conversion.created_at))
    else:
        query = query.order_by(desc(Conversion.created_at))

    # Tag filter: a conversion must have ALL selected tags (AND logic)
    if tag_names:
        for tag_name in tag_names:
            subq = (
                db.session.query(ConversionTagAssociation.conversion_id)
                .join(TagModel, ConversionTagAssociation.tag_id == TagModel.id)
                .filter(func.lower(TagModel.name) == tag_name.lower())
                .subquery()
            )
            query = query.filter(Conversion.id.in_(subq))

    # Favorites filter
    if favorites_only and favorites_user_id:
        fav_subq = (
            db.session.query(ConversionFavorite.conversion_id)
            .filter(ConversionFavorite.user_id == favorites_user_id)
            .subquery()
        )
        query = query.filter(Conversion.id.in_(fav_subq))

    # Pagination
    return query.paginate(page=page, per_page=10)


def list_by_user(
        page: int, user_id: int | None, filter_type: str | None = None,
        sort_order: str = 'desc', searchQuery: str | None = None,
        filter_public: str | bool | None = None) -> Pagination | None:
    """Paginated Conversions created by a specific user. ``None`` if no user_id."""
    if not user_id:
        return None

    query = Conversion.query.filter(Conversion.user_id == user_id, Conversion.is_active)

    if searchQuery:
        search_lower = f"%{searchQuery.lower()}%"
        query = query.filter(
            or_(
                Conversion.name.ilike(search_lower),
                Conversion.description.ilike(search_lower),
            )
        )

    if filter_type:
        query = query.filter(Conversion.conversion_type == filter_type)

    if sort_order == 'asc':
        query = query.order_by(asc(Conversion.created_at))
    else:
        query = query.order_by(desc(Conversion.created_at))

    if filter_public is not None:
        if isinstance(filter_public, str):
            if filter_public.upper() == "PUBLIC":
                filter_public = True
            elif filter_public.upper() == "PRIVATE":
                filter_public = False
            else:
                filter_public = None

        if filter_public is not None:
            query = query.filter(Conversion.public == filter_public)

    return query.paginate(page=page, per_page=10)


def list_deleted(
        page: int, user_id: int | None = None,
        search: str | None = None) -> Pagination:
    """Paginated soft-deleted Conversions for the admin Trash view, scoped to
    ``user_id``.

    Returns rows that have been soft-deleted (``is_active=False``, ``deleted_at``
    stamped), newest deletion first. (The original ``get_deleted_converts``
    filtered ``Conversion.is_active`` by mistake, so the Trash view showed *live*
    conversions and its "Delete permanently" action could destroy them — fixed
    here to ``~Conversion.is_active``.)
    """
    query = Conversion.query.filter(~Conversion.is_active)
    if user_id:
        query = query.filter(Conversion.user_id == user_id)
    if search:
        query = query.filter(Conversion.name.ilike(f"%{search}%"))
    query = query.order_by(desc(Conversion.deleted_at))
    return query.paginate(page=page, per_page=15)


def search_in_content(
        query_str: str, conversion_id: int, scope: str = 'all',
        context_chars: int = 120) -> list[dict]:
    """Search ``query_str`` in a single Conversion's texts, returning snippets.

    Returns a list of ``{field, snippet, match_start, match_end}`` dicts (empty
    if the query is blank or the Conversion is missing).
    """
    if not query_str:
        return []

    conversion = get(conversion_id)
    if not conversion:
        return []

    results = []
    q_lower = query_str.lower()

    fields = []
    if scope in ('all', 'name'):
        fields.append(('name', conversion.name or ''))
    if scope in ('all', 'description'):
        fields.append(('description', conversion.description or ''))
    if scope in ('all', 'content'):
        fields.append(('input', conversion.input_text or ''))
        fields.append(('output', conversion.output_text or ''))

    for field_name, text in fields:
        text_lower = text.lower()
        start = 0
        seen_snippets = set()
        while True:
            idx = text_lower.find(q_lower, start)
            if idx == -1:
                break
            # Extract context around match
            snip_start = max(0, idx - context_chars)
            snip_end   = min(len(text), idx + len(query_str) + context_chars)
            snippet = ('…' if snip_start > 0 else '') + text[snip_start:snip_end] + ('…' if snip_end < len(text) else '')
            match_in_snip = idx - snip_start + (3 if snip_start > 0 else 0)  # offset for leading '…'

            key = (field_name, snip_start)
            if key not in seen_snippets:
                seen_snippets.add(key)
                results.append({
                    'field': field_name,
                    'snippet': snippet,
                    'match_start': match_in_snip,
                    'match_end': match_in_snip + len(query_str),
                })
            start = idx + 1
            if len(results) >= 10:  # cap per conversion
                break

    return results
