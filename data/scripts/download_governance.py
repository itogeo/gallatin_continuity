#!/usr/bin/env python3
"""
Gallatin Continuity — Download Governance & Planning Data

Downloads city and county governance layers from ArcGIS services.
See DATA_SOURCES.md for full documentation of each source.

Usage:
    python download_governance.py
"""

import os
import json
import requests
from datetime import datetime

# Directories
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.join(SCRIPT_DIR, '..', 'raw')
WEB_DATA_DIR = os.path.join(SCRIPT_DIR, '..', '..', 'web', 'data')

# Ensure directories exist
os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(WEB_DATA_DIR, exist_ok=True)


def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}")


def download_arcgis_geojson(url, params=None, name="data"):
    """
    Download GeoJSON from an ArcGIS REST service.

    Parameters:
        url: Base URL of the service (MapServer or FeatureServer layer)
        params: Additional query parameters
        name: Name for logging

    Returns:
        dict: GeoJSON FeatureCollection or None on error
    """
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
    print(f"    URL: {query_url}")

    try:
        response = requests.get(query_url, params=default_params, timeout=120)
        response.raise_for_status()

        data = response.json()

        if 'error' in data:
            print(f"    ✗ API Error: {data['error'].get('message', 'Unknown')}")
            return None

        feature_count = len(data.get('features', []))
        print(f"    ✓ Downloaded {feature_count} features")

        return data

    except requests.exceptions.Timeout:
        print(f"    ✗ Request timed out")
        return None
    except requests.exceptions.RequestException as e:
        print(f"    ✗ Request failed: {e}")
        return None
    except json.JSONDecodeError:
        print(f"    ✗ Invalid JSON response")
        return None


def save_geojson(data, filename, directory=RAW_DIR):
    """Save GeoJSON data to file."""
    if not data:
        return False

    filepath = os.path.join(directory, filename)

    with open(filepath, 'w') as f:
        json.dump(data, f)

    size_mb = os.path.getsize(filepath) / (1024 * 1024)
    print(f"    Saved: {filename} ({size_mb:.2f} MB)")

    return True


def download_all():
    """Download all governance datasets."""

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"\nGallatin Continuity Data Download")
    print(f"Started: {timestamp}")

    results = {}

    # =========================================================
    # CITY OF BOZEMAN DATA
    # =========================================================
    print_header("City of Bozeman Data")

    # 1. City Limits
    data = download_arcgis_geojson(
        "https://gisweb.bozeman.net/arcgis/rest/services/Open_Data/City_Limits/FeatureServer/0",
        name="Bozeman City Limits"
    )
    if save_geojson(data, "bozeman_city_limits.geojson"):
        save_geojson(data, "bozeman_city_limits.geojson", WEB_DATA_DIR)
        results['bozeman_city_limits'] = True

    # 2. Urban Streams
    data = download_arcgis_geojson(
        "https://gisweb.bozeman.net/arcgis/rest/services/Open_Data/Streams/FeatureServer/0",
        name="Bozeman Urban Streams"
    )
    if save_geojson(data, "bozeman_urban_streams.geojson"):
        save_geojson(data, "bozeman_urban_streams.geojson", WEB_DATA_DIR)
        results['bozeman_urban_streams'] = True

    # 3. City Zoning
    data = download_arcgis_geojson(
        "https://gisweb.bozeman.net/arcgis/rest/services/Open_Data/Zoning/FeatureServer/0",
        name="Bozeman Zoning"
    )
    if save_geojson(data, "bozeman_zoning.geojson"):
        save_geojson(data, "bozeman_zoning.geojson", WEB_DATA_DIR)
        results['bozeman_zoning'] = True

    # 4. FEMA Flood Hazard Areas (try multiple endpoints)
    data = download_arcgis_geojson(
        "https://gisweb.bozeman.net/arcgis/rest/services/Public/FEMA_Flood_Hazard_Areas/MapServer/0",
        name="Bozeman FEMA Flood Zones"
    )
    if data:
        if save_geojson(data, "bozeman_fema_flood.geojson"):
            save_geojson(data, "bozeman_fema_flood.geojson", WEB_DATA_DIR)
            results['bozeman_fema_flood'] = True

    # =========================================================
    # GALLATIN COUNTY DATA
    # =========================================================
    print_header("Gallatin County Data")

    # 5. Hyalite Zoning District
    data = download_arcgis_geojson(
        "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer/9",
        params={'where': "DISTRICT_N = 'HYALITE'"},
        name="Hyalite Zoning District"
    )
    if save_geojson(data, "hyalite_zoning_district.geojson"):
        save_geojson(data, "hyalite_zoning_district.geojson", WEB_DATA_DIR)
        results['hyalite_zoning'] = True

    # 6. Bozeman Donut (County/Bozeman Area)
    data = download_arcgis_geojson(
        "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer/9",
        params={'where': "DISTRICT_N = 'GALLATIN COUNTY / BOZEMAN AREA'"},
        name="Bozeman Donut Planning Area"
    )
    if save_geojson(data, "bozeman_donut.geojson"):
        save_geojson(data, "bozeman_donut.geojson", WEB_DATA_DIR)
        results['bozeman_donut'] = True

    # 7. County Boundary
    data = download_arcgis_geojson(
        "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer/29",
        name="Gallatin County Boundary"
    )
    if save_geojson(data, "gallatin_county_boundary.geojson"):
        save_geojson(data, "gallatin_county_boundary.geojson", WEB_DATA_DIR)
        results['gallatin_county'] = True

    # 8. County Cities
    data = download_arcgis_geojson(
        "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer/27",
        name="Gallatin County Cities"
    )
    if save_geojson(data, "gallatin_cities.geojson"):
        save_geojson(data, "gallatin_cities.geojson", WEB_DATA_DIR)
        results['gallatin_cities'] = True

    # 9. County Streams
    data = download_arcgis_geojson(
        "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer/23",
        name="Gallatin County Streams"
    )
    if save_geojson(data, "gallatin_streams.geojson"):
        save_geojson(data, "gallatin_streams.geojson", WEB_DATA_DIR)
        results['gallatin_streams'] = True

    # =========================================================
    # SUMMARY
    # =========================================================
    print_header("Download Summary")

    success = sum(1 for v in results.values() if v)
    total = len(results)

    print(f"\n  Successfully downloaded: {success}/{total} datasets")
    print(f"\n  Raw data saved to: {RAW_DIR}")
    print(f"  Web data saved to: {WEB_DATA_DIR}")

    for name, status in results.items():
        icon = "✓" if status else "✗"
        print(f"    {icon} {name}")

    print(f"\n{'='*60}")
    print(f"  Done!")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    download_all()
