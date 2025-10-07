import random
import string
from website.db_class.db import User , db

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
    print(f"🔐 {YELLOW}Password    :{RESET} {raw_password}   (⚠️ Change it after first login)")
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
        password= raw_password,  
        admin=True,
        api_key = generate_api_key() 
    )
    db.session.add(user)
    db.session.commit()
    return user , raw_password


def generate_api_key(length=60):
    return ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(length))