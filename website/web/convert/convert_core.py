# website/web/convert/convert_service.py
import json
from website.db_class.db import Convert
from website.web import db
from sqlalchemy import desc, asc
import datetime



def create_convert(input_text, output_text,convert_choice, description=None):
    """
    Create a new Convert entry from API response and save history.
    input_text: original file content
    output_text: converted content
    """

    try:
        now = datetime.datetime.now(tz=datetime.timezone.utc)
        if convert_choice == "MISP to STIX":
            name = f"STIX_{now.strftime('%Y%m%d%H%M%S')}"
        else:
            name = f"MISP_{now.strftime('%Y%m%d%H%M%S')}"

        convert = Convert(
            name=name,
            conversion_type=convert_choice,
            input_text=input_text,
            output_text=output_text,
            description=description or f"STIX conversion saved at {now.isoformat()}",
            created_at=now,
            updated_at=now
        )

        db.session.add(convert)
        db.session.commit()

        return True

    except Exception as e:
        print(f"[ERROR] Could not save Convert: {e}")
        return False





def delete_convert(convert_id):
    """Delete a Convert entry"""
    convert = Convert.query.get(convert_id)
    if not convert:
        return False
    db.session.delete(convert)
    db.session.commit()
    return True


def get_convert(convert_id):
    """Get a Convert entry by id"""
    return Convert.query.get(convert_id)


def list_all():
    """Return all Convert entries"""
    return Convert.query.all()




def get_convert_page(page, filter_type, sort_order):
    """Return paginated conversion history with optional filter and sort"""
    query = Convert.query

    if filter_type != '':
        query = query.filter(Convert.conversion_type == filter_type)

    if sort_order == 'asc':
        query = query.order_by(asc(Convert.created_at))
    else:
        query = query.order_by(desc(Convert.created_at))


    return query.paginate(page=page, per_page=20)
