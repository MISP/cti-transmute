#!/usr/bin/env python3

from cti_transmute.default import get_config
from website.api import api_blueprint
from website.web import application



def main():
    ip = get_config('generic', 'website_listen_ip')
    port = get_config('generic', 'website_listen_port')


    from website.web.home import home_blueprint
    from website.web.convert.convert_root import convert_blueprint
    

    application.register_blueprint(home_blueprint, url_prefix="/")
    application.register_blueprint(convert_blueprint, url_prefix="/convert")



    with application.app_context():
        application.register_blueprint(api_blueprint)
    application.run(host=ip, port=port, debug=True)






if __name__ == '__main__':
    main()

