#!/usr/bin/env python3
"""
gen_graph_fixtures.py
Generate large, realistic MISP events (and their STIX conversion) to exercise
the Graph tab at scale.

The events look like real threat reports, not random noise, so that grouping
and the views have something to find:

- many standalone attributes of a few types (ip-dst, domain, sha256, url...),
  the shape Simplify's neighbour rule folds;
- `file` objects (filename + md5/sha1/sha256), `domain-ip`, `url`,
  `email` and `network-connection` objects, with ObjectReferences between
  them (`drops`, `connects-to`, `resolves-to`...), the chains rule's shape;
- TLP and PAP tags, MITRE ATT&CK / threat-actor / malpedia galaxy clusters
  taken from the misp-galaxy submodule, sightings on some attributes;
- a share of values reused across the events of a set, so that local pivots
  ("which other event has this IP?") have answers.

The STIX side is produced by the real MISP -> STIX Converter
(`cti_transmute.transmute`), so it is exactly what a Conversion would store.

    uv run python bin/gen_graph_fixtures.py               # 1k, 5k, 10k
    uv run python bin/gen_graph_fixtures.py --sizes 2000 --seed 7

Output goes to `tests/fixtures/large/` (ignored by git): for each size N,
`misp_<N>.json` (one event of about N nodes) and `stix_<N>.json`, plus
`misp_multi.json`, a list of 5 events sharing indicators.
"""

from __future__ import annotations

import argparse
import json
import random
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "tests" / "fixtures" / "large"
GALAXY = ROOT / "submodules" / "misp-galaxy" / "clusters"

# Standalone attribute mix: (type, category, to_ids, weight)
ATTRIBUTE_MIX = [
    ("ip-dst", "Network activity", True, 22),
    ("ip-src", "Network activity", True, 6),
    ("domain", "Network activity", True, 16),
    ("hostname", "Network activity", True, 5),
    ("url", "Network activity", True, 10),
    ("sha256", "Payload delivery", True, 12),
    ("md5", "Payload delivery", True, 6),
    ("filename", "Payload delivery", False, 4),
    ("email-src", "Payload delivery", True, 4),
    ("email-subject", "Payload delivery", False, 2),
    ("user-agent", "Network activity", False, 2),
    ("vulnerability", "External analysis", False, 2),
    ("link", "External analysis", False, 3),
    ("text", "Other", False, 1),
]

TLP = ["tlp:clear", "tlp:green", "tlp:amber", "tlp:amber+strict", "tlp:red"]
TAG_COLOURS = {
    "tlp:clear": "#ffffff", "tlp:green": "#33ff00", "tlp:amber": "#ffc000",
    "tlp:amber+strict": "#ffc000", "tlp:red": "#ff2b2b",
    "PAP:GREEN": "#009900", "PAP:AMBER": "#ffa800",
    "admiralty-scale:source-reliability=\"b\"": "#2b4ca2",
    "estimative-language:likelihood-probability=\"likely\"": "#4a90e2",
}
EXTRA_TAGS = ["PAP:GREEN", "PAP:AMBER", "admiralty-scale:source-reliability=\"b\"",
              "estimative-language:likelihood-probability=\"likely\""]
TLDS = ["com", "net", "org", "info", "xyz", "top", "ru", "io", "biz", "online"]
WORDS = ["update", "secure", "login", "cdn", "mail", "portal", "cloud", "sync", "api",
         "office", "drive", "verify", "account", "static", "files", "share", "track"]
EXTS = ["exe", "dll", "docm", "xlsm", "js", "ps1", "zip", "lnk", "iso", "hta"]


def _now() -> datetime:
    return datetime(2026, 10, 1, tzinfo=timezone.utc)


class Gen:
    def __init__(self, seed: int, shared: dict[str, list[str]] | None = None) -> None:
        self.r = random.Random(seed)
        self.shared = shared if shared is not None else {}
        self.galaxies = self._load_galaxies()

    # -- values -------------------------------------------------------------
    def ip(self) -> str:
        r = self.r
        return f"{r.choice([45, 91, 103, 141, 185, 193, 194, 198, 203, 212])}.{r.randint(0, 255)}.{r.randint(0, 255)}.{r.randint(1, 254)}"

    def domain(self) -> str:
        r = self.r
        return f"{r.choice(WORDS)}-{r.choice(WORDS)}{r.randint(0, 99)}.{r.choice(TLDS)}"

    def hexs(self, n: int) -> str:
        return "".join(self.r.choice("0123456789abcdef") for _ in range(n))

    def filename(self) -> str:
        return f"{self.r.choice(WORDS)}_{self.r.randint(100, 9999)}.{self.r.choice(EXTS)}"

    def value(self, t: str) -> str:
        r = self.r
        # Reuse values across events of one set (correlations).
        pool = self.shared.setdefault(t, [])
        if pool and r.random() < 0.08:
            return r.choice(pool)
        v = {
            "ip-dst": self.ip, "ip-src": self.ip,
            "domain": self.domain,
            "hostname": lambda: f"{r.choice(WORDS)}.{self.domain()}",
            "url": lambda: f"https://{self.domain()}/{r.choice(WORDS)}/{self.hexs(8)}",
            "sha256": lambda: self.hexs(64), "md5": lambda: self.hexs(32),
            "sha1": lambda: self.hexs(40),
            "filename": self.filename,
            "email-src": lambda: f"{r.choice(WORDS)}@{self.domain()}",
            "email-dst": lambda: f"{r.choice(WORDS)}@victim-corp.example",
            "email-subject": lambda: r.choice(["Invoice overdue", "Password expires today",
                                               "Shared document", "Delivery failed"]),
            "user-agent": lambda: f"Mozilla/5.0 (Windows NT 10.0; Win64; x64) {self.hexs(6)}",
            "vulnerability": lambda: f"CVE-{r.randint(2019, 2026)}-{r.randint(1000, 49999)}",
            "link": lambda: f"https://reports.example.org/{self.hexs(10)}",
            "text": lambda: "Analyst note: infrastructure rotates weekly.",
            "port": lambda: str(r.choice([80, 443, 8080, 4444, 8443, 53])),
            "size-in-bytes": lambda: str(r.randint(10_000, 9_000_000)),
        }[t]()
        if len(pool) < 500:
            pool.append(v)
        return v

    # -- galaxies -----------------------------------------------------------
    def _load_galaxies(self) -> dict[str, list[dict]]:
        out = {}
        for name in ("mitre-attack-pattern", "threat-actor", "malpedia"):
            path = GALAXY / f"{name}.json"
            if path.exists():
                data = json.loads(path.read_text())
                out[name] = [{"type": name, "name": data.get("name", name),
                              "uuid": data.get("uuid"), "cluster": c}
                             for c in data.get("values", [])[:400]]
        return out

    def galaxy_block(self, n_ttp: int) -> list[dict]:
        blocks = []
        for name, count in (("mitre-attack-pattern", n_ttp), ("threat-actor", 1), ("malpedia", 2)):
            values = self.galaxies.get(name)
            if not values:
                continue
            picked = self.r.sample(values, min(count, len(values)))
            g = picked[0]
            blocks.append({
                "uuid": g["uuid"], "name": g["name"], "type": name,
                "GalaxyCluster": [{
                    "uuid": p["cluster"].get("uuid"), "type": name,
                    "value": p["cluster"].get("value"),
                    "tag_name": f'misp-galaxy:{name}="{p["cluster"].get("value")}"',
                    "description": (p["cluster"].get("description") or "")[:400],
                    "meta": {k: v for k, v in (p["cluster"].get("meta") or {}).items()
                             if k in ("external_id", "refs", "synonyms", "country")},
                } for p in picked],
            })
        return blocks

    # -- building blocks ----------------------------------------------------
    def tag(self, name: str) -> dict:
        return {"name": name, "colour": TAG_COLOURS.get(name, "#64748b"), "exportable": True}

    def attribute(self, t: str, category: str, to_ids: bool, relation: str | None = None) -> dict:
        r = self.r
        seen = _now() - timedelta(days=r.randint(1, 200))
        a = {
            "uuid": str(uuid.UUID(int=r.getrandbits(128), version=4)),
            "type": t, "category": category, "value": self.value(t),
            "to_ids": to_ids, "distribution": "5", "comment": "",
            "timestamp": str(int(seen.timestamp())),
            "first_seen": seen.isoformat(),
            "last_seen": (seen + timedelta(days=r.randint(0, 30))).isoformat(),
        }
        if relation:
            a["object_relation"] = relation
        if r.random() < 0.15:
            a["Tag"] = [self.tag(r.choice(TLP))]
        if r.random() < 0.05:
            a["comment"] = r.choice(["C2 seen in sandbox", "Phishing landing page",
                                     "Dropped by first stage", "Shared hosting, low confidence"])
        if r.random() < 0.1:
            a["Sighting"] = [{"uuid": str(uuid.UUID(int=r.getrandbits(128), version=4)),
                              "Organisation": {"name": "CIRCL-test", "uuid": "55f6ea5e-2c60-40e5-964f-47a8950d210f"},
                              "type": r.choice(["0", "0", "1"]),
                              "date_sighting": str(int((seen + timedelta(days=2)).timestamp())),
                              "source": r.choice(["SOC", "Sandbox", "Partner feed"])}
                             for _ in range(r.randint(1, 4))]
        return a

    def obj(self, name: str, meta: str, attrs: list[tuple[str, str, str, bool]]) -> dict:
        return {
            "uuid": str(uuid.UUID(int=self.r.getrandbits(128), version=4)),
            "name": name, "meta-category": meta, "distribution": "5",
            "template_uuid": str(uuid.UUID(int=self.r.getrandbits(128), version=4)),
            "template_version": "1",
            "Attribute": [self.attribute(t, c, ids, rel) for rel, t, c, ids in attrs],
            "ObjectReference": [],
        }

    def file_obj(self):
        return self.obj("file", "file", [
            ("filename", "filename", "Payload delivery", False),
            ("md5", "md5", "Payload delivery", True),
            ("sha1", "sha1", "Payload delivery", True),
            ("sha256", "sha256", "Payload delivery", True),
            ("size-in-bytes", "size-in-bytes", "Other", False),
        ])

    def domain_ip_obj(self):
        return self.obj("domain-ip", "network", [
            ("domain", "domain", "Network activity", True),
            ("ip", "ip-dst", "Network activity", True),
        ])

    def url_obj(self):
        return self.obj("url", "network", [("url", "url", "Network activity", True)])

    def email_obj(self):
        return self.obj("email", "network", [
            ("from", "email-src", "Payload delivery", True),
            ("to", "email-dst", "Payload delivery", False),
            ("subject", "email-subject", "Payload delivery", False),
        ])

    def netconn_obj(self):
        return self.obj("network-connection", "network", [
            ("ip-dst", "ip-dst", "Network activity", True),
            ("dst-port", "port", "Network activity", False),
        ])

    # -- an event -----------------------------------------------------------
    def event(self, size: int, title: str) -> dict:
        r = self.r
        types = [m for m in ATTRIBUTE_MIX for _ in range(m[3])]
        # About 55 % of nodes as standalone attributes, the rest in objects.
        n_attr = int(size * 0.55)
        attributes = [self.attribute(t, c, ids) for t, c, ids, _ in
                      (r.choice(types) for _ in range(n_attr))]

        objects: list[dict] = []
        budget = size - n_attr
        while budget > 0:
            kind = r.choices(["file", "domain-ip", "url", "email", "netconn"],
                             weights=[40, 25, 15, 10, 10])[0]
            o = {"file": self.file_obj, "domain-ip": self.domain_ip_obj, "url": self.url_obj,
                 "email": self.email_obj, "netconn": self.netconn_obj}[kind]()
            objects.append(o)
            budget -= 1 + len(o["Attribute"])

        # References: email -> url/file, file -> domain-ip/netconn, url -> domain-ip.
        by_name: dict[str, list[dict]] = {}
        for o in objects:
            by_name.setdefault(o["name"], []).append(o)

        def link(src, names, rel, p):
            targets = [t for n in names for t in by_name.get(n, [])]
            if targets and r.random() < p:
                dst = r.choice(targets)
                src["ObjectReference"].append({
                    "uuid": str(uuid.UUID(int=r.getrandbits(128), version=4)),
                    "object_uuid": src["uuid"], "referenced_uuid": dst["uuid"],
                    "relationship_type": rel,
                })
        for o in objects:
            if o["name"] == "email":
                link(o, ["file"], "contains", 0.7)
                link(o, ["url"], "contains", 0.5)
            elif o["name"] == "file":
                link(o, ["domain-ip"], "connects-to", 0.35)
                link(o, ["network-connection"], "communicates-with", 0.2)
                link(o, ["file"], "drops", 0.15)
            elif o["name"] == "url":
                link(o, ["domain-ip"], "resolves-to", 0.6)
        # Some objects point at standalone attributes too.
        for o in r.sample(objects, k=min(len(objects) // 10, len(objects))):
            target = r.choice(attributes)
            o["ObjectReference"].append({
                "uuid": str(uuid.UUID(int=r.getrandbits(128), version=4)),
                "object_uuid": o["uuid"], "referenced_uuid": target["uuid"],
                "relationship_type": "related-to",
            })

        date = _now() - timedelta(days=r.randint(0, 60))
        return {"Event": {
            "uuid": str(uuid.UUID(int=r.getrandbits(128), version=4)),
            "info": title, "date": date.date().isoformat(),
            "timestamp": str(int(date.timestamp())),
            "analysis": "2", "threat_level_id": str(r.randint(1, 3)),
            "distribution": "3", "published": True,
            "Orgc": {"name": "CIRCL-test", "uuid": "55f6ea5e-2c60-40e5-964f-47a8950d210f"},
            "Org": {"name": "CIRCL-test", "uuid": "55f6ea5e-2c60-40e5-964f-47a8950d210f"},
            "Tag": [self.tag(r.choice(TLP[:3])), self.tag(r.choice(EXTRA_TAGS))],
            "Galaxy": self.galaxy_block(n_ttp=max(3, size // 250)),
            "Attribute": attributes,
            "Object": objects,
        }}


def to_stix(event: dict) -> dict | list | None:
    try:
        from cti_transmute import transmute
    except ImportError:
        return None
    return transmute.convert("misp", "stix", event).document


def node_count(event: dict) -> int:
    e = event["Event"]
    return 1 + len(e["Attribute"]) + sum(1 + len(o["Attribute"]) for o in e["Object"])


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--sizes", type=int, nargs="+", default=[1000, 5000, 10000])
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--no-stix", action="store_true", help="skip the STIX conversion")
    args = p.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)

    for size in args.sizes:
        ev = Gen(args.seed + size).event(size, f"Synthetic campaign report ({size} nodes)")
        (OUT / f"misp_{size}.json").write_text(json.dumps(ev, indent=1))
        print(f"misp_{size}.json  {node_count(ev)} MISP nodes")
        if not args.no_stix:
            stix = to_stix(ev)
            if stix is not None:
                (OUT / f"stix_{size}.json").write_text(json.dumps(stix, indent=1))
                n = len(stix.get("objects", [])) if isinstance(stix, dict) else len(stix)
                print(f"stix_{size}.json  {n} STIX objects")

    shared: dict[str, list[str]] = {}
    multi = [Gen(args.seed + i, shared).event(400, f"Wave {i + 1} of the same campaign")
             for i in range(5)]
    (OUT / "misp_multi.json").write_text(json.dumps(multi, indent=1))
    print(f"misp_multi.json  5 events, {sum(node_count(e) for e in multi)} MISP nodes")


if __name__ == "__main__":
    main()
