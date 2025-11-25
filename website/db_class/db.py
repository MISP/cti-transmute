from website.web import db , login_manager
from flask_login import UserMixin, AnonymousUserMixin
from werkzeug.security import check_password_hash, generate_password_hash

@login_manager.user_loader
def load_user(user_id):
    """Loads the user from the session."""
    return User.query.get(int(user_id))

class User(UserMixin, db.Model):
    """User model for authentication and authorization."""
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(64), index=True)
    last_name = db.Column(db.String(64), index=True)
    email = db.Column(db.String(64), unique=True, index=True)
    admin = db.Column(db.Boolean, default=False, index=True)
    password_hash = db.Column(db.String(165))
    api_key = db.Column(db.String(60), index=True)
    is_connected = db.Column(db.Boolean, default=False, index=True)

    def is_admin(self):
        """Check if the user has admin privileges."""
        return self.admin
    
    
    def get_first_name(self):
        return self.first_name 

    @property
    def password(self):
        raise AttributeError("Password is not a readable attribute.")

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def verify_password(self, password):
        """Check if the provided password matches the stored hash."""
        return check_password_hash(self.password_hash, password)
    
    def is_anonymous(self):
        return False

    def to_json(self):
        """Serialize the user object to JSON."""
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "admin": self.admin,
            "is_connected": self.is_connected
        }

class AnonymousUser(AnonymousUserMixin):
    """Defines behavior for anonymous users (not logged in)."""
    
    def is_admin(self):
        return False

    def is_read_only(self):
        return True
    
    def is_anonymous(self):
        return True

# Register AnonymousUser as the default for anonymous visitors
login_manager.anonymous_user = AnonymousUser

class Convert(db.Model):
    __tablename__ = "convert"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=True) # the user who made the convert
    name = db.Column(db.String(100), unique=True, nullable=False)
    conversion_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)  # optional description
    uuid = db.Column(db.String(36), index=True)
    input_text = db.Column(db.Text, nullable=False)    # Original text
    output_text = db.Column(db.Text, nullable=True)    # Converted text
    created_at = db.Column(db.DateTime, index=True)
    updated_at = db.Column(db.DateTime, index=True)
    public = db.Column(db.Boolean, default=True, index=True) #able to share with the community
    # share_key = db.Column(db.String(36), index=True, nullable=True)

    def get_user_name_by_id(self):
        user = User.query.get(self.user_id)  
        return user.first_name if user else None

    def to_json(self):
        """Return JSON representation"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "input_text": self.input_text,
            "conversion_type": self.conversion_type,
            "output_text": self.output_text,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M'),
            "updated_at": self.updated_at.strftime('%Y-%m-%d %H:%M'),
            "public": self.public,
            "uuid": self.uuid,
            "author": self.get_user_name_by_id()
        }
    def to_json_list(self):
        """Return JSON list"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "conversion_type": self.conversion_type,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M'),
            "updated_at": self.updated_at.strftime('%Y-%m-%d %H:%M'),
            "public": self.public,
            "uuid": self.uuid,
            "author": self.get_user_name_by_id()
        }
    def to_share(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "conversion_type": self.conversion_type,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M'),
            "updated_at": self.updated_at.strftime('%Y-%m-%d %H:%M'),
            "public": self.public,
            "uuid": self.uuid,
            "author": self.get_user_name_by_id(),
            "input_text": self.input_text,
            "output_text": self.output_text,
            "share_url": f"http://cti-transmute.org/convert/share/{self.uuid}",
            "detail_url": f"http://cti-transmute.org/convert/detail/{self.id}"
        }
