"""
Gallatin Continuity — Download ArcGIS Planning & Governance Layers

Downloads planning districts, city boundaries, zoning, and other
governance layers from Gallatin County and City of Bozeman ArcGIS services.

Usage:
    python download_arcgis.py

Notes:
    The ArcGIS web maps referenced by GWC use specific Feature Service layers.
    This script attempts to query those layers directly. If service URLs change,
    you may need to inspect the web maps to find updated endpoints.

    Hyalite Zoning: webmap 2026409b241f40568dcd65152550da64
    Bozeman Donut:  webmap 7b18cc10db89434c8797eefc540e6387
"""

import sys
import os
import json
import requests

sys.path.insert(0, os.path.dirname(__file__))
from utils import (
    ensure_dirs, print_header, save_geojson,
    query_arcgis_features, BBOX_BOZEMAN_CREEK
)


# ========================================================
# ArcGIS Service URLs
# ========================================================
# NOTE: These are starting points. You may need to discover
# the actual Feature Service URLs by inspecting the web maps.
# To find them:
#   1. Open the web map URL in a browser
#   2. Open Developer Tools > Network tab
#   3. Look for requests to FeatureServer or MapServer endpoints
#   4. The layer URLs will be like:
#      https://services.arcgis.com/.../FeatureServer/0

# Gallatin County GIS services (common base)
GALLATIN_CO_BASE = "https://services.arcgis.com"

# Known / likely service endpoints (THESE MAY NEED UPDATING)
SERVICES = {
    'county_boundary': {
        'description': 'Gallatin County boundary',
        'url': None,  # TODO: Find the actual Feature Service URL
        'layer_id': 0,
        'output': 'gallatin_county.geojson',
        'note': 'Try Census TIGER if county GIS service is unavailable'
    },
    'city_limits_bozeman': {
        'description': 'City of Bozeman municipal boundary',
        'url': None,  # TODO: Find the actual Feature Service URL
        'layer_id': 0,
        'output': 'bozeman_city_limits.geojson',
        'note': 'May be in city or county feature services'
    },
    'hyalite_zoning': {
        'description': 'Hyalite Zoning District',
        'url': None,  # TODO: Extract from webmap 2026409b241f40568dcd65152550da64
        'layer_id': 0,
        'output': 'hyalite_zoning.geojson',
        'note': 'Inspect the web map to find the feature service URL'
    },
    'bozeman_donut': {
        'description': 'Bozeman Donut planning area',
        'url': None,  # TODO: Extract from webmap 7b18cc10db89434c8797eefc540e6387
        'layer_id': 0,
        'output': 'bozeman_donut.geojson',
        'note': 'Inspect the web map to find the feature service URL'
    },
    'zoning_transect': {
        'description': 'Development transect zones (Urban Core → Natural)',
        'url': None,  # TODO: May be in the same service as Hyalite/Donut
        'layer_id': 0,
        'output': 'zoning_transect.geojson',
        'note': 'May need to be derived from zoning classification'
    }
}


def discover_webmap_layers(webmap_id):
    """
    Attempt to discover Feature Service URLs from an ArcGIS web map.

    This queries the web map's item data to find the operational layers
    and their source Feature Service URLs.

    Parameters:
        webmap_id: The ArcGIS Online web map item ID

    Returns:
        list: Layer information dicts with urls and titles
    """
    url = f"https://gallatinplanning.maps.arcgis.com/sharing/rest/content/items/{webmap_id}/data"
    params = {'f': 'json'}

    print(f"  Discovering layers from web map: {webmap_id}")

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()

        layers = []
        for op_layer in data.get('operationalLayers', []):
            layer_info = {
                'title': op_layer.get('title', 'Unknown'),
                'url': op_layer.get('url', ''),
                'layer_type': op_layer.get('layerType', ''),
                'id': op_layer.get('id', '')
            }
            layers.append(layer_info)
            print(f"    Found: {layer_info['title']}")
            print(f"      URL: {layer_info['url']}")

        return layers

    except Exception as e:
        print(f"  ✗ Could not discover layers: {e}")
        return []


def download_from_census_tiger():
    """
    Download county and city boundaries from Census TIGER as a fallback.

    Uses the Census TIGERweb REST API.
    """
    print_header("Downloading from Census TIGER (fallback)")

    tiger_base = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb"

    # County boundary
    print("\n  Fetching Gallatin County boundary...")
    try:
        county_url = f"{tiger_base}/tigerWMS_Current/MapServer"
        geojson = query_arcgis_features(
            service_url=county_url,
            layer_id=86,  # Counties layer
            where="NAME='Gallatin' AND STATE='30'",  # Montana FIPS = 30
            out_fields="NAME,STATE,COUNTY,GEOID"
        )
        if geojson.get('features'):
            save_geojson(geojson, 'gallatin_county.geojson')
            print(f"  ✓ County boundary saved")
        else:
            print(f"  ℹ No features returned — try adjusting the query")
    except Exception as e:
        print(f"  ✗ Error: {e}")

    # City of Bozeman (Incorporated Places)
    print("\n  Fetching City of Bozeman boundary...")
    try:
        geojson = query_arcgis_features(
            service_url=county_url,
            layer_id=28,  # Incorporated Places layer
            where="NAME='Bozeman' AND STATE='30'",
            out_fields="NAME,STATE,PLACE,GEOID"
        )
        if geojson.get('features'):
            save_geojson(geojson, 'bozeman_city_limits.geojson')
            print(f"  ✓ City boundary saved")
        else:
            print(f"  ℹ No features returned — try adjusting the query")
    except Exception as e:
        print(f"  ✗ Error: {e}")


def download_service(key, config):
    """Download a single layer from its configured ArcGIS service."""
    print(f"\n  --- {config['description']} ---")

    if config['url'] is None:
        print(f"  ⚠ No service URL configured yet.")
        print(f"  Note: {config.get('note', 'URL needs to be discovered')}")
        return False

    try:
        geojson = query_arcgis_features(
            service_url=config['url'],
            layer_id=config['layer_id'],
            bbox=BBOX_BOZEMAN_CREEK
        )

        if geojson.get('features'):
            save_geojson(geojson, config['output'])
            print(f"  ✓ Saved {config['output']}")
            return True
        else:
            print(f"  ℹ No features returned")
            return False

    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False


def main():
    ensure_dirs()

    # Step 1: Try to discover layers from the known web maps
    print_header("Discovering ArcGIS Web Map Layers")

    print("\n--- Hyalite Zoning Web Map ---")
    hyalite_layers = discover_webmap_layers('2026409b241f40568dcd65152550da64')

    print("\n--- Bozeman Donut Web Map ---")
    donut_layers = discover_webmap_layers('7b18cc10db89434c8797eefc540e6387')

    # Step 2: Download configured services
    print_header("Downloading Configured Layers")

    for key, config in SERVICES.items():
        download_service(key, config)

    # Step 3: Fallback to Census TIGER for basic boundaries
    download_from_census_tiger()

    # Step 4: Summary
    print_header("Summary")
    print("""
  Next steps:
  1. Review the discovered web map layers above
  2. Update the SERVICES dict with the actual Feature Service URLs
  3. Re-run this script to download the planning district data

  To inspect a web map manually:
    - Open the web map URL in ArcGIS Map Viewer
    - Click on a layer → View properties → Source URL
    - Use that URL in the SERVICES config above

  Hyalite Zoning map:
    https://gallatinplanning.maps.arcgis.com/apps/mapviewer/index.html?webmap=2026409b241f40568dcd65152550da64

  Bozeman Donut map:
    https://gallatinplanning.maps.arcgis.com/apps/mapviewer/index.html?webmap=7b18cc10db89434c8797eefc540e6387
    """)


if __name__ == '__main__':
    main()
