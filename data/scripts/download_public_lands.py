#!/usr/bin/env python3
"""Download Public Lands and Conservation data from Gallatin County."""

import os
import json
import requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.join(SCRIPT_DIR, '..', 'raw')
WEB_DATA_DIR = os.path.join(SCRIPT_DIR, '..', '..', 'web', 'data')

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(WEB_DATA_DIR, exist_ok=True)

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

print("\n=== Downloading Public Lands Data ===\n")

# Public Lands (Layer 18)
data = download_arcgis_geojson(
    "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer/18",
    name="Public Lands"
)
if data and save_geojson(data, "public_lands.geojson"):
    save_geojson(data, "public_lands.geojson", WEB_DATA_DIR)

# Conservation Easements (Layer 15)
data = download_arcgis_geojson(
    "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer/15",
    name="Conservation Easements"
)
if data and save_geojson(data, "conservation_easements.geojson"):
    save_geojson(data, "conservation_easements.geojson", WEB_DATA_DIR)

# Wildland Urban Interface (Layer 16) 
data = download_arcgis_geojson(
    "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer/16",
    name="Wildland Urban Interface"
)
if data and save_geojson(data, "wildland_urban_interface.geojson"):
    save_geojson(data, "wildland_urban_interface.geojson", WEB_DATA_DIR)

print("\n=== Done ===\n")
