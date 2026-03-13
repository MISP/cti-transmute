# CTI-Transmute

<img src="website/web/static/image/transmute_long.png" alt="CTI-Transmute logo" width="400"/>

An **online service for converting cyber threat intelligence format** ([CTI-Transmute.org](https://cti-transmute.org/)), built to **promote interoperability and seamless data exchange**. This repository includes the complete source code of the online service if you want to run it locally. This service **leverages** the **misp-stix open-source library** ([misp-stix](https://github.com/misp/misp-stix)) to facilitate conversion.

## Main Features

* **API**: A quick and easy-to-use **API** for converting between the **MISP** ([MISP standard](https://misp-standard.org/)) and **STIX** formats.
* **User Management**: An **intuitive interface** to manage users of the service.
* **History**: Keeping track of all the conversions (**private and public**).
* **Diffing**: **Reviewing changes** of conversions and updates in the CTI file converted.
* **Share**: A **Share link** to allow users to share conversions with private groups.
* **Live Conversion**: Users can directly convert **rules** in the **UI or via the API**.

## Screenshots

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

## Funding 

ENSOC (101127660 — ENSOC — DIGITAL-ECCC-2022-CYBER-03) is a European project co-financed under the call DIGITAL-ECCC-2022-CYBER-03, aiming to create a Crossborder Platform with the purpose of improving the collective security of EU stakeholders and support CSIRTs and SOCs by overlapping defensive capabilities.

The ENSOC Consortium composed of seven member states, namely Austria, Luxembourg, Romania, Netherlands, Portugal, Italy and Spain have joined together to build a collaborative, interoperable and sustainable crossborder SOC platform with the aim to support the detection and prevention of cyber threats.

Co-Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or ECCC. Neither the European Union nor the granting authority can be held responsible for them.

## License

CTI-Transmute is free software released under the "GNU Affero General Public License v3.0".

~~~
Copyright (c) 2025 Computer Incident Response Center Luxembourg (CIRCL)
Copyright (c) 2025 Christian Studer - https://github.com/chrisr3d
Copyright (c) 2025 Theo Geffe - https://github.com/ecrou-exact/ 
~~~
