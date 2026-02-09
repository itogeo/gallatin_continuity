#!/usr/bin/env python3
"""Download Bozeman Parks data."""

import os
import json
import requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.join(SCRIPT_DIR, '..', 'raw')
WEB_DATA_DIR = os.path.join(SCRIPT_DIR, '..', '..', 'web', 'data')

def download_arcgis_geojson(url, params=None, name="data"):
    query_url = f"{url}/query"
    default_params = {
        'where': '1=1',
        'outFields': '*',
        'f': 'geojson',
        'returnGeometry': 'true'
    }
    if params:
        default_params.update(params)
    
    print(f"  Downloading {name}...")
    try:
        response = requests.get(query_url, params=default_params, timeout=180)
        response.raise_for_status()
        data = response.json()
        if 'error' in data:
            print(f"    ✗ API Error: {data['error'].get('message', 'Unknown')}")
            return None
        feature_count = len(data.get('features', []))
        print(f"    ✓ Downloaded {feature_count} features")
        return data
    except Exception as e:
        print(f"    ✗ Failed: {e}")
        return None

def save_geojson(data, filename, directory=RAW_DIR):
    if not data:
        return False
    filepath = os.path.join(directory, filename)
    with open(filepath, 'w') as f:
        json.dump(data, f)
    size_mb = os.path.getsize(filepath) / (1024 * 1024)
    print(f"    Saved: {filename} ({size_mb:.2f} MB)")
    return True

print("\n=== Downloading Bozeman Parks ===\n")

# Bozeman Parks
data = download_arcgis_geojson(
    "https://gisweb.bozeman.net/arcgis/rest/services/Open_Data/Parks/FeatureServer/0",
    name="Bozeman Parks"
)
if data and save_geojson(data, "bozeman_parks.geojson"):
    save_geojson(data, "bozeman_parks.geojson", WEB_DATA_DIR)

print("\n=== Done ===\n")
