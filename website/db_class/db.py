from website.web import db 

class Convert(db.Model):
    __tablename__ = "convert"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)

    def __repr__(self):
        return f"<Convert {self.name}>"
