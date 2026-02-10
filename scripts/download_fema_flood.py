#!/usr/bin/env python3
"""
Download FEMA flood data for Gallatin County from the National Flood Hazard Layer
"""
import requests
import json
import sys

# FEMA NFHL MapServer base URL
BASE_URL = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer"

# Layers to download
LAYERS = {
    28: "flood_hazard_zones",
    27: "flood_hazard_boundaries",
    16: "base_flood_elevations",
}

# Gallatin County, Montana identifier
# Using where clause to filter for Gallatin County
COUNTY_FILTER = "DFIRM_ID = '30031C'"  # Gallatin County DFIRM ID

def download_layer(layer_id, layer_name, where_clause):
    """Download a layer from the FEMA NFHL service"""
    print(f"\nDownloading layer {layer_id}: {layer_name}...")

    # Query parameters for ArcGIS REST API
    params = {
        'where': where_clause,
        'outFields': '*',
        'f': 'geojson',
        'returnGeometry': 'true',
        'spatialRel': 'esriSpatialRelIntersects',
        'geometryType': 'esriGeometryEnvelope',
        # Bounding box for Gallatin County (approximate)
        'geometry': '-111.5,45.0,-110.5,46.0',
    }

    url = f"{BASE_URL}/{layer_id}/query"

    try:
        response = requests.get(url, params=params, timeout=60)
        response.raise_for_status()

        data = response.json()

        if 'features' in data and len(data['features']) > 0:
            output_file = f"../data/fema_{layer_name}.geojson"

            # Write to file
            with open(output_file, 'w') as f:
                json.dump(data, f)

            feature_count = len(data['features'])
            file_size = len(json.dumps(data)) / (1024 * 1024)  # MB

            print(f"✓ Downloaded {feature_count} features ({file_size:.2f} MB)")
            print(f"  Saved to: {output_file}")

            return True
        else:
            print(f"✗ No features found for {layer_name}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"✗ Error downloading {layer_name}: {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"✗ Error parsing JSON for {layer_name}: {e}")
        return False

def main():
    print("=" * 60)
    print("FEMA Flood Data Downloader for Gallatin County, Montana")
    print("=" * 60)

    success_count = 0

    for layer_id, layer_name in LAYERS.items():
        if download_layer(layer_id, layer_name, COUNTY_FILTER):
            success_count += 1

    print("\n" + "=" * 60)
    print(f"Download complete: {success_count}/{len(LAYERS)} layers successful")
    print("=" * 60)

    if success_count < len(LAYERS):
        sys.exit(1)

if __name__ == "__main__":
    main()
