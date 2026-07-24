#!/usr/bin/env python3

"""Read-only public API for the Conversion catalogue and history.

A sibling transport over the same ``conv_repo`` reads and ``access`` scoping
the web UI reaches through its own session routes: list Conversions, fetch one,
read a Conversion's accepted history timeline. API-key authed via ``@api_actor``
(anonymous sees public only, exact parity with a logged-out browser); a wrong
key is 403, a Conversion the caller cannot see is 404 (so a private row's
existence is not confirmed to strangers).

Reads call ``conv_repo`` directly - they are not mutations, so they earn no
``website/lib/`` use-case (that would be a pass-through facade). Serialization
reuses the models' own ``to_json``/``to_json_list``; the list is enriched with
tags, the one UI affordance dropped is ``is_favorite`` (per-user browser state,
not catalogue data).
"""

from flask import g, request
from flask_restx import Namespace, Resource

from website.lib import access
from website.lib.auth import api_actor
from website.repos import conversions as conv_repo
from website.web.tags import tags_core as TagsModel

conversions_ns = Namespace(
    'conversions', description='Read the Conversion catalogue and history.'
)

_TRUE = {'true', '1', 'yes', 'on'}


def _actor():
    """The API actor resolved by ``@api_actor`` onto ``flask.g`` (``User | None``)."""
    return getattr(g, 'api_user', None)


def _bool_arg(name):
    return request.args.get(name, '', type=str).lower() in _TRUE


def _tags_arg():
    """The ``tags`` query param as a name list (comma-separated), or ``None``."""
    raw = request.args.get('tags', '', type=str)
    names = [t.strip() for t in raw.split(',') if t.strip()]
    return names or None


def _tags_by_id(conversion_ids):
    """``{conversion_id: [tag_json, ...]}`` for the given Conversions."""
    batch = TagsModel.get_conversion_tags_batch(conversion_ids)
    return {cid: [a.to_json() for a in assocs] for cid, assocs in batch.items()}


def _resolve_visible(conversion_id):
    """Fetch a Conversion the caller may see, or ``None``.

    Collapses missing and not-visible to one outcome so the API never confirms
    a private row's existence to a stranger; the caller maps ``None`` to 404.
    """
    conversion = conv_repo.get(conversion_id)
    if conversion is None or not access.can_see(_actor(), conversion):
        return None
    return conversion


_NOT_FOUND = ({'message': 'Conversion not found'}, 404)


@conversions_ns.route('', strict_slashes=False)
@conversions_ns.doc(description='List Conversions visible to the caller.')
class ConversionList(Resource):
    @api_actor
    def get(self):
        """Paginated catalogue, access-scoped to the API actor.

        Query params (all optional): ``page``, ``q`` (search), ``search_scope``,
        ``exact_match``, ``tags`` (comma-separated), ``date_from``/``date_to``,
        ``sort`` (asc/desc), ``visibility`` (public/private), ``mine``, ``type``.
        Page size is fixed by the repository.
        """
        pagination = conv_repo.list_for_user(
            _actor(),
            request.args.get('page', 1, type=int),
            searchQuery=request.args.get('q', type=str),
            search_scope=request.args.get('search_scope', 'all', type=str),
            exact_match=_bool_arg('exact_match'),
            tag_names=_tags_arg(),
            date_from=request.args.get('date_from', type=str),
            date_to=request.args.get('date_to', type=str),
            sort_order=request.args.get('sort', 'desc', type=str),
            vis_filter=request.args.get('visibility', type=str),
            only_mine=request.args.get('mine', 'false', type=str),
            filter_type=request.args.get('type', type=str)
        )
        tags_by_id = _tags_by_id([c.id for c in pagination.items])
        data = []
        for conversion in pagination.items:
            entry = conversion.to_json_list()
            entry['tags'] = tags_by_id.get(conversion.id, [])
            data.append(entry)
        return {
            'data': data,
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'total_pages': pagination.pages
        }, 200


@conversions_ns.route('/<int:conversion_id>')
@conversions_ns.doc(description='Fetch one Conversion, including its input/output.')
class ConversionItem(Resource):
    @api_actor
    def get(self, conversion_id):
        conversion = _resolve_visible(conversion_id)
        if conversion is None:
            return _NOT_FOUND
        entry = conversion.to_json()
        entry['tags'] = _tags_by_id([conversion.id]).get(conversion.id, [])
        return entry, 200


@conversions_ns.route('/<int:conversion_id>/history')
@conversions_ns.doc(description="A Conversion's accepted re-run history, oldest first.")
class ConversionHistoryList(Resource):
    @api_actor
    def get(self, conversion_id):
        conversion = _resolve_visible(conversion_id)
        if conversion is None:
            return _NOT_FOUND
        history = conv_repo.accepted_history_list(conversion.id)
        return {'data': [entry.to_json() for entry in history]}, 200
