# CTI-Transmute

<img src="website/web/static/image/transmute_long.png" alt="CTI-Transmute logo" width="400"/>

An online service for converting cyber threat intelligence, built to promote interoperability and seamless data exchange

## Main features (Work in Progress)

- **API**: A quick and easy-to-use API for converting between MISP and STIX formats.

## Installation

To run your own CTI-Transmute service, you will need:

- Python 3.10 or higher
- A recent version of `uv` - Installation instruction available [here](https://docs.astral.sh/uv/getting-started/installation/)

Then the process is straight-forward:

```bash
git clone https://github.com/MISP/cti-transmute.git
cd cti-transmute

uv sync
uv run start_website
```

## Query Examples

The main feature provided with the API is a seamless conversion between CTI standards.

Here are some examples:

- *Get the list of currently supported convertes*

```bash
curl -X GET https://cti-transmute.org/api/convert/list
```

- *Convert MISP data to STIX 2.1*

```bash
curl -X POST -H "Content-Type: application/json" -d "@/path/to/misp_data.json" \
https://cti-transmute.org//api/convert/misp_to_stix

# OR
curl -X POST -F "file=@/path/to/misp_data.json" https://cti-transmute.org/api/convert/misp_to_stix
```

- *Convert STIX 2.x Bundle to MISP standard format*

```bash
curl -X POST -H "Content-Type: application/json" -d "@/path/to/stix_data.json" \
https://cti-transmute.org/api/convert/stix_to_misp

# OR
curl -X POST -F "file=@/path/to/stix_data.json" https://cti-transmute.org/api/convert/stix_to_misp
```

## License

CTI-Transmute is free software released under the "GNU Affero General Public License v3.0".

~~~
Copyright (c) 2025 Computer Incident Response Center Luxembourg (CIRCL)
Copyright (c) 2025 Christian Studer - https://github.com/chrisr3d
~~~
