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
    print(f"🔐 {YELLOW}Password    :{RESET} {"cdatalmqiadsfuaqqcelnppmalv"}   (⚠️ Change it after first login)")         #raw_password
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
        password="cdatalmqiadsfuaqqcelnppmalv", #raw_password,  
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
    print("=== Parsing STIX JSON for reports/groupings ===")
    try:
        data = json.loads(json_text)
        print("JSON loaded successfully.")
    except json.JSONDecodeError as e:
        print("❌ JSON decode error:", e)
        return []

    results = []

    # If STIX bundle structure: {"type": "bundle", "objects": [...]}
    if isinstance(data, dict):
        if data.get("type") == "bundle" and "objects" in data:
            print("Detected STIX bundle with", len(data["objects"]), "objects.")
            objects = data["objects"]
        else:
            # Maybe it's a single object or non-bundle dict
            print("Detected single STIX object or unknown dict structure.")
            objects = [data]
    elif isinstance(data, list):
        print("Detected a list of STIX objects.")
        objects = data
    else:
        print("❌ Unsupported JSON structure:", type(data))
        return []

    # Traverse all objects
    for obj in objects:
        if not isinstance(obj, dict):
            continue

        obj_type = obj.get("type")
        if obj_type in ("report", "grouping"):
            name = obj.get("name", "").strip()
            description = obj.get("description", None)
            print(f"✅ Found {obj_type}: name='{name}', description='{description}'")
            results.append((name, description))
        else:
            # Debug non-report/grouping objects
            print(f"Skipping object of type '{obj_type}'")

    print(f"=== Finished parsing. Found {len(results)} report/grouping objects ===")
    return results
