from pymisp import PyMISP

misp_url = 'https://misppriv.circl.lu/'
misp_key = 'CbwOlt61pGCvaXjVBNwVtRZmm9WJKJ7jSlW49ZXn'
misp_verifycert = False
relative_path = 'events/restSearch'
body = {
    "returnFormat": "json",
    "page": "1",
    "limit": "2",
    "tags": "tlp:clear"
}

misp = PyMISP(misp_url, misp_key, misp_verifycert)
query = misp.direct_call(relative_path, body)
