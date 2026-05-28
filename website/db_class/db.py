import datetime
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
    share_key = db.Column(db.String(36), index=True, nullable=True)
    is_active = db.Column(db.Boolean, default=True, index=True)
    deleted_at = db.Column(db.DateTime, nullable=True)

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
            "author": self.get_user_name_by_id(),
            "is_active": self.is_active,
            "deleted_at": self.deleted_at.strftime('%Y-%m-%d %H:%M') if self.deleted_at else None,
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
            "share_url": f"https://cti-transmute.org/convert/share/{self.uuid}",
            "detail_url": f"https://cti-transmute.org/convert/detail/{self.id}"
        }

class Comment(db.Model):
    __tablename__ = "comment"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    convert_id = db.Column(db.Integer, db.ForeignKey("convert.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, nullable=True)
    content = db.Column(db.Text, nullable=False)
    is_private = db.Column(db.Boolean, default=False, index=True)
    parent_id = db.Column(db.Integer, db.ForeignKey("comment.id", ondelete="CASCADE"), nullable=True)
    created_at = db.Column(db.DateTime, index=True)
    is_deleted = db.Column(db.Boolean, default=False, index=True)
    is_evaluation = db.Column(db.Boolean, default=False, nullable=False, server_default='false')

    convert = db.relationship("Convert", backref=db.backref("comments", lazy=True, cascade="all, delete-orphan"))
    replies = db.relationship(
        "Comment",
        backref=db.backref("parent", remote_side=[id]),
        lazy="dynamic",
        cascade="all, delete-orphan"
    )
    reactions = db.relationship("CommentReaction", backref="comment", lazy=True, cascade="all, delete-orphan")

    def get_author_name(self):
        if self.user_id:
            user = User.query.get(self.user_id)
            return user.first_name if user else "Deleted User"
        return "Anonymous"

    def to_json(self, current_user_id=None, is_admin=False, convert_owner_id=None):
        reactions_grouped = {}
        for r in self.reactions:
            if r.emoji not in reactions_grouped:
                reactions_grouped[r.emoji] = {"count": 0, "reacted": False}
            reactions_grouped[r.emoji]["count"] += 1
            if current_user_id and r.user_id == current_user_id:
                reactions_grouped[r.emoji]["reacted"] = True

        return {
            "id": self.id,
            "convert_id": self.convert_id,
            "user_id": self.user_id,
            "author": self.get_author_name(),
            "content": self.content if not self.is_deleted else "[deleted]",
            "is_private": self.is_private,
            "parent_id": self.parent_id,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M') if self.created_at else None,
            "is_deleted": self.is_deleted,
            "reactions": reactions_grouped,
            "can_delete": bool(current_user_id and (
                current_user_id == self.user_id or is_admin or current_user_id == convert_owner_id
            )),
            "can_toggle_private": bool(current_user_id and (
                current_user_id == self.user_id or is_admin
            )),
            "can_edit": bool(current_user_id and current_user_id == self.user_id and not self.is_deleted),
            "is_evaluation": self.is_evaluation,
        }


class CommentReaction(db.Model):
    __tablename__ = "comment_reaction"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    comment_id = db.Column(db.Integer, db.ForeignKey("comment.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    emoji = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime)

    __table_args__ = (
        db.UniqueConstraint("comment_id", "user_id", "emoji", name="uq_comment_reaction"),
    )


class Notification(db.Model):
    __tablename__ = "notification"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    # Types: "comment_reply", "new_follow_convert", "report_submitted"
    type = db.Column(db.String(50), nullable=False)
    is_read = db.Column(db.Boolean, default=False, index=True)
    related_id = db.Column(db.Integer, nullable=True)    # comment_id or convert_id
    related_type = db.Column(db.String(50), nullable=True)  # "comment" or "convert"
    actor_id = db.Column(db.Integer, nullable=True)       # who triggered it
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, index=True)

    user = db.relationship("User", backref=db.backref("notifications", lazy=True, cascade="all, delete-orphan"))

    def get_actor_name(self):
        if self.actor_id:
            user = User.query.get(self.actor_id)
            return user.first_name if user else "Someone"
        return "Someone"

    def to_json(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "type": self.type,
            "is_read": self.is_read,
            "related_id": self.related_id,
            "related_type": self.related_type,
            "actor_id": self.actor_id,
            "actor_name": self.get_actor_name(),
            "message": self.message,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M') if self.created_at else None,
        }


class UserFollow(db.Model):
    __tablename__ = "user_follow"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    follower_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    followed_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime)

    __table_args__ = (
        db.UniqueConstraint("follower_id", "followed_id", name="uq_user_follow"),
    )


class ConvertReport(db.Model):
    __tablename__ = "convert_report"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    convert_id = db.Column(db.Integer, db.ForeignKey("convert.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, nullable=True)
    reason = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default="pending", index=True)
    created_at = db.Column(db.DateTime, index=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    reviewed_by = db.Column(db.Integer, nullable=True)

    convert = db.relationship("Convert", backref=db.backref("reports", lazy=True, cascade="all, delete-orphan"))

    def to_json(self):
        convert = Convert.query.get(self.convert_id)
        reviewer = User.query.get(self.reviewed_by) if self.reviewed_by else None
        reporter = User.query.get(self.user_id) if self.user_id else None
        return {
            "id": self.id,
            "convert_id": self.convert_id,
            "convert_name": convert.name if convert else None,
            "user_id": self.user_id,
            "reporter": f"{reporter.first_name} {reporter.last_name}" if reporter else "Anonymous",
            "reason": self.reason,
            "description": self.description,
            "status": self.status,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M') if self.created_at else None,
            "reviewed_at": self.reviewed_at.strftime('%Y-%m-%d %H:%M') if self.reviewed_at else None,
            "reviewed_by": reviewer.first_name if reviewer else None,
        }


class SystemLog(db.Model):
    """Admin-only audit log for system-level events."""
    __tablename__ = "system_log"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    # e.g. convert_created, convert_deleted, comment_deleted
    event_type = db.Column(db.String(60), nullable=False, index=True)
    actor_id = db.Column(db.Integer, nullable=True)
    actor_name = db.Column(db.String(120), nullable=True)
    target_type = db.Column(db.String(50), nullable=True)   # convert | comment
    target_id = db.Column(db.Integer, nullable=True)
    target_name = db.Column(db.String(255), nullable=True)
    details = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, index=True, nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "event_type": self.event_type,
            "actor_id": self.actor_id,
            "actor_name": self.actor_name or "—",
            "target_type": self.target_type,
            "target_id": self.target_id,
            "target_name": self.target_name,
            "details": self.details,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M') if self.created_at else None,
        }


class ConvertHistory(db.Model):
    __tablename__ = "convert_history"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=True)

    convert_id = db.Column(
        db.Integer,
        db.ForeignKey("convert.id", ondelete="CASCADE"),
        nullable=False
    )

    version = db.Column(db.Integer, nullable=False)
    uuid = db.Column(db.String(36), index=True, nullable=False)
    status = db.Column(db.String(20), nullable=False) # pending , accepted , rejected
    public = db.Column(db.Boolean, default=False, index=True)   # able to share with the community

    input_text = db.Column(db.Text, nullable=True)

    old_output_text = db.Column(db.Text, nullable=True)
    new_output_text = db.Column(db.Text, nullable=True)

    # Metadata
    created_at = db.Column(db.DateTime, index=True)
    comment = db.Column(db.Text, nullable=True)

    # Relationship
    convert = db.relationship("Convert", backref=db.backref(
        "history",
        lazy=True,
        cascade="all, delete-orphan"
    ))

    def to_json(self):
        return {
            "id": self.id,
            "convert_id": self.convert_id,
            "version": self.version,
            "uuid": self.uuid,
            "input_text": self.input_text,
            "old_output_text": self.old_output_text,
            "new_output_text": self.new_output_text,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M') if self.created_at else None,
            "comment": self.comment,
            "status": self.status,
            "public": self.public
        }


class Tag(db.Model):
    __tablename__ = "tag"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, index=True)
    name = db.Column(db.Text, unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.utcnow())
    updated_at = db.Column(db.DateTime, default=lambda: datetime.datetime.utcnow())
    is_active = db.Column(db.Boolean, default=False)
    # "public" | "private"
    visibility = db.Column(db.String(255), nullable=True)
    external_id = db.Column(db.String, nullable=True)

    color = db.Column(db.String(50), nullable=True)
    icon = db.Column(db.String(50), nullable=True)
    # "Manual" | "Taxonomy" | "Vulnerability"
    source = db.Column(db.String(255), nullable=True)

    galaxy_meta = db.Column(db.JSON, nullable=True)

    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_approved_by_admin  = db.Column(db.Boolean, default=False)
    is_evaluation_tag     = db.Column(db.Boolean, default=False, nullable=False, server_default='false')

    user = db.relationship('User', backref=db.backref('tags', lazy='dynamic', cascade='all, delete-orphan'))

    def to_json(self):
        return {
            "id": self.id,
            "uuid": self.uuid,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M') if self.created_at else None,
            "updated_at": self.updated_at.strftime('%Y-%m-%d %H:%M') if self.updated_at else None,
            "is_active": self.is_active,
            "visibility": self.visibility,
            "color": self.color,
            "icon": self.icon,
            "created_by_user_id": self.created_by,
            "created_by_user_name": self.user.first_name if self.user else None,
            "is_approved_by_admin": self.is_approved_by_admin,
            "external_id": self.external_id,
            "source": self.source,
            "galaxy_meta": self.galaxy_meta if self.galaxy_meta else None,
            "is_evaluation_tag": self.is_evaluation_tag,
            # Injected by _inject_usage_counts() — falls back to 0 outside listing context
            "rule_count":   getattr(self, '_rule_count',   0),
            "bundle_count": getattr(self, '_bundle_count', 0),
        }


class GraphConfig(db.Model):
    __tablename__ = "graph_config"

    id         = db.Column(db.Integer, primary_key=True)
    uuid       = db.Column(db.String(36), unique=True, nullable=False, index=True)
    name       = db.Column(db.String(100), nullable=False)
    config_json = db.Column(db.Text, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='SET NULL'), nullable=True)
    is_active  = db.Column(db.Boolean, default=True, nullable=False)
    is_default = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    creator = db.relationship('User', backref=db.backref('graph_configs', lazy='dynamic'))

    def to_json(self, current_user_id=None, is_admin=False):
        return {
            "id":         self.id,
            "uuid":       self.uuid,
            "name":       self.name,
            "config_json": self.config_json,
            "created_by": self.created_by,
            "author":     self.creator.first_name if self.creator else "System",
            "is_default": self.is_default,
            "is_active":  self.is_active,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M') if self.created_at else None,
            "can_delete": (
                is_admin or
                (current_user_id and self.created_by == current_user_id and not self.is_default)
            ),
            "can_hard_delete": is_admin,
        }


class ConvertTagAssociation(db.Model):
    __tablename__ = 'convert_tag_association'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, index=True)
    convert_id = db.Column(db.Integer, db.ForeignKey('convert.id', ondelete='CASCADE'), nullable=False, index=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tag.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='SET NULL'), nullable=True)
    added_at = db.Column(db.DateTime, default=lambda: datetime.datetime.utcnow())

    convert = db.relationship('Convert', backref=db.backref('tag_associations', lazy='dynamic', cascade='all, delete-orphan'))
    tag = db.relationship('Tag', backref=db.backref('convert_associations', lazy='dynamic'))
    user = db.relationship('User', backref=db.backref('convert_tag_associations', lazy='dynamic'))

    def to_json(self):
        tag = self.tag
        return {
            "id": self.id,
            "uuid": self.uuid,
            "convert_id": self.convert_id,
            "tag_id": self.tag_id,
            "user_id": self.user_id,
            "tag_name": tag.name if tag else None,
            "tag_color": tag.color if tag else None,
            "tag_icon": tag.icon if tag else None,
            "tag_visibility": tag.visibility if tag else None,
            "tag_description": tag.description if tag else None,
            "added_at": self.added_at.strftime('%Y-%m-%d %H:%M') if self.added_at else None,
        }


class ConvertEvaluation(db.Model):
    """Stores like/dislike/reaction evaluations on converts."""
    __tablename__ = "convert_evaluation"

    id           = db.Column(db.Integer, primary_key=True, autoincrement=True)
    convert_id   = db.Column(db.Integer, db.ForeignKey("convert.id",  ondelete="CASCADE"), nullable=False, index=True)
    user_id      = db.Column(db.Integer, db.ForeignKey("user.id",     ondelete="CASCADE"), nullable=False, index=True)
    # 'like' | 'dislike' | 'reaction'
    eval_type    = db.Column(db.String(20),  nullable=False)
    # set only when eval_type == 'reaction', e.g. 'accurate', 'quality', ...
    reaction_key = db.Column(db.String(50),  nullable=True)
    created_at   = db.Column(db.DateTime, index=True)

    convert = db.relationship("Convert", backref=db.backref("evaluations", lazy="dynamic", cascade="all, delete-orphan"))
    user    = db.relationship("User",    backref=db.backref("evaluations", lazy="dynamic"))

    def to_json(self):
        return {
            "id":           self.id,
            "convert_id":   self.convert_id,
            "user_id":      self.user_id,
            "username":     self.user.first_name if self.user else "Unknown",
            "eval_type":    self.eval_type,
            "reaction_key": self.reaction_key,
            "created_at":   self.created_at.strftime('%Y-%m-%d %H:%M') if self.created_at else None,
        }
