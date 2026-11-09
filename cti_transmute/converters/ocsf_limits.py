"""Bound JSON output without allocating a serialized copy of that output."""

import json

from cti_transmute.exceptions import InvalidPayload

MAX_MISP_OUTPUT_BYTES = 16 * 1024 * 1024


def json_size(value, limit=None):
    """Size of json.dumps(value), including ASCII escaping and separators.

    Encode strings in bounded chunks so an escaped source string cannot
    allocate a response-sized temporary string just to check its size.
    """
    if limit is None:
        limit = MAX_MISP_OUTPUT_BYTES
    size = 0

    def add(count):
        nonlocal size
        size += count
        if size > limit:
            raise InvalidPayload("MISP to OCSF output exceeds the 16 MiB size limit; split the input.")

    def visit(item):
        if isinstance(item, str):
            add(len(item) + 2)
            for offset in range(0, len(item), 16384):
                chunk = item[offset:offset + 16384]
                add(len(json.dumps(chunk)) - len(chunk) - 2)
        elif isinstance(item, dict):
            add(2 + max(0, len(item) - 1) * 2)
            for key, val in item.items():
                visit(key)
                add(2)
                visit(val)
        elif isinstance(item, (list, tuple)):
            add(2 + max(0, len(item) - 1) * 2)
            for val in item:
                visit(val)
        else:
            add(len(json.dumps(item, allow_nan=False)))

    visit(value)
    return size


class MispOutputBudget:
    def __init__(self):
        self.used = 2  # The output array's brackets.

    def check(self, size):
        if size > MAX_MISP_OUTPUT_BYTES:
            raise InvalidPayload("MISP to OCSF output exceeds the 16 MiB size limit; split the input.")

    def reserve(self, size):
        self.check(self.used + size)
        self.used += size

    def add_indicator(self, item):
        self.reserve(json_size(item) + 2)

    def finish_event(self, item, start):
        # Replace the incremental reservations with the exact event size,
        # including metadata, the source record and object enrichments.
        size = json_size(item) + 2
        self.check(start + size)
        self.used = start + size
