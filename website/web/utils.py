import random
import string
from website.db_class.db import User , db
import json
from typing import List, Optional, Tuple, Union

def form_to_dict(form):
    """Parse a form into a dict"""
    loc_dict = dict()
    for field in form._fields:
        if field == "files_upload":
            loc_dict[field] = dict()
            loc_dict[field]["data"] = form._fields[field].data
            loc_dict[field]["name"] = form._fields[field].name
        elif not field == "submit" and not field == "csrf_token":
            loc_dict[field] = form._fields[field].data
    return loc_dict




############
############

def show_admin_first_connection(admin , raw_password):
    """Show the admin element"""
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RESET = "\033[0m"
    NUMBER = 120
    print("\n" + "=" * NUMBER)
    print(f"{GREEN}✅ Admin account created successfully!{RESET}")
    print(f"🔑 {YELLOW}API Key     :{RESET} {admin.api_key} ( Unique secret key )")
    print(f"👤 {YELLOW}Username    :{RESET} admin@admin.admin")
    print(f"🔐 {YELLOW}Password    :{RESET} {raw_password}   (⚠️ Change it after first login)")         #
    print("=" * NUMBER + "\n")
    print(f"{YELLOW}🚀 You can now launch the application using:{RESET} uv run start_website\n")
    print("=" * NUMBER + "\n")
    
#############################
#   For the reel web site   #
#############################

def create_admin():
    # Admin user
    raw_password = generate_api_key()
    user = User(
        first_name="admin",
        last_name="admin",
        email="admin@admin.admin",
        password=raw_password,  
        admin=True,
        api_key = generate_api_key() 
    )
    db.session.add(user)
    db.session.commit()
    return user , raw_password


def generate_api_key(length=60):
    import secrets
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


#######################################
#   Parser for name and description   #
#######################################

import json
from typing import List, Tuple, Optional

def parse_stix_reports(json_text: str) -> List[Tuple[str, Optional[str]]]:
    """
    Parse a STIX JSON string and extract all objects of type 'report' or 'grouping'.
    Always extract 'name' and optionally 'description'.
    Works with both bundles and raw object lists.
    """
    try:
        data = json.loads(json_text)
    except json.JSONDecodeError as e:
        return []

    results = []

    # If STIX bundle structure: {"type": "bundle", "objects": [...]}
    if isinstance(data, dict):
        if data.get("type") == "bundle" and "objects" in data:
            objects = data["objects"]
        else:
            # Maybe it's a single object or non-bundle dict
            objects = [data]
    elif isinstance(data, list):
        objects = data
    else:
        return []

    # Traverse all objects
    for obj in objects:
        if not isinstance(obj, dict):
            continue

        obj_type = obj.get("type")
        if obj_type in ("report", "grouping"):
            name = obj.get("name", "").strip()
            description = obj.get("description", None)
            results.append((name, description))
    return results




def parse_misp_reports(file_content):
    """
    Extract 'name' and 'description' from a MISP JSON file content.
    """
    try:
        data = json.loads(file_content)
    except json.JSONDecodeError:
        return None, None

    event = data.get("event")
    if not event:
        return None, None

    name = event.get("info", "Unnamed MISP Event")
    description = event.get("description", f"MISP event: {name}")

    return name, description



import json

def extract_name_from_misp_json(json_text: str) -> str | None:
    """
    Extrait la valeur de 'info' depuis un JSON MISP.
    Fonctionne si 'info' est à la racine ou dans 'Event'.
    """
    try:
        data = json.loads(json_text)

        info_value = data.get("info")

        if not info_value and isinstance(data.get("Event"), dict):
            info_value = data["Event"].get("info")

        if isinstance(info_value, str) and info_value.strip():
            return info_value.strip()

    except (ValueError, TypeError):
        pass

    return None


def _collect_tags_from_event(event: dict, names: set) -> None:
    """Collect all tag names from a single MISP event dict into `names`."""
    if not isinstance(event, dict):
        return
    for tag in event.get("Tag", []):
        if isinstance(tag, dict) and tag.get("name"):
            names.add(tag["name"].strip())
    for attr in event.get("Attribute", []):
        if not isinstance(attr, dict):
            continue
        for tag in attr.get("Tag", []):
            if isinstance(tag, dict) and tag.get("name"):
                names.add(tag["name"].strip())
    for obj in event.get("Object", []):
        if not isinstance(obj, dict):
            continue
        for attr in obj.get("Attribute", []):
            if not isinstance(attr, dict):
                continue
            for tag in attr.get("Tag", []):
                if isinstance(tag, dict) and tag.get("name"):
                    names.add(tag["name"].strip())


def extract_tag_names_from_misp_json(json_text: str) -> list[str]:
    """
    Extract all unique tag names from a MISP JSON payload.

    Handles all common MISP formats:
      - Single event with wrapper:    {"Event": {...}}
      - Single event without wrapper: {"Tag": [...], "Attribute": [...], ...}
      - Multiple events:              {"response": [{"Event": {...}}, ...]}
      - Array at root:                [{"Event": {...}}, ...]
    """
    try:
        data = json.loads(json_text)
    except (ValueError, TypeError):
        return []

    names: set[str] = set()

    if isinstance(data, list):
        # Root is an array of events
        for item in data:
            event = item.get("Event", item) if isinstance(item, dict) else item
            _collect_tags_from_event(event, names)

    elif isinstance(data, dict):
        if "response" in data:
            # {"response": [{"Event": {...}}, ...]}
            for item in (data["response"] if isinstance(data["response"], list) else []):
                event = item.get("Event", item) if isinstance(item, dict) else item
                _collect_tags_from_event(event, names)
        elif "Event" in data:
            event = data["Event"]
            if isinstance(event, list):
                # {"Event": [{...}, {...}]}  (unusual but possible)
                for ev in event:
                    _collect_tags_from_event(ev, names)
            else:
                _collect_tags_from_event(event, names)
        else:
            # Raw event dict without wrapper
            _collect_tags_from_event(data, names)

    return list(names)


def sanitazed_params(params):
    """
    Sanitize the params dictionary by changing values.

    Args:
        params (dict): The dictionary to sanitize.

    Returns:
        dict: The sanitized dictionary.

    """
    for key, value in params.items():
        if isinstance(value, str):
            params[key] = value.strip()
    return params
    