from website.web import db

class Convert(db.Model):
    __tablename__ = "convert"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    conversion_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)  # optional description
    input_text = db.Column(db.Text, nullable=False)    # Original text
    output_text = db.Column(db.Text, nullable=True)    # Converted text
    created_at = db.Column(db.DateTime, index=True)
    updated_at = db.Column(db.DateTime, index=True)
   


    def to_json(self):
        """Return JSON representation"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "input_text": self.input_text,
            "output_text": self.output_text,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M'),
            "updated_at": self.updated_at.strftime('%Y-%m-%d %H:%M')
        }
