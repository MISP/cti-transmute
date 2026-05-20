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

from pymisp import PyMISP

misp = PyMISP(misp_url, misp_key, misp_verifycert)
print(1)
query = misp.direct_call(relative_path, body)
print(query)