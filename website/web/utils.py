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
    print(f"🔐 {YELLOW}Password    :{RESET} {"raw_password"}   (⚠️ Change it after first login)")         #
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
    return ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(length))


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

