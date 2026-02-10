#!/usr/bin/env python3
"""
Download planning and development data for Gallatin County
"""
import requests
import json
import sys

# Gallatin County Planning MapServer
BASE_URL = "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer"

# Layers to download
LAYERS = {
    9: "zoning_designations",
    10: "neighborhood_plans",
    12: "subdivisions",
    13: "minor_subdivisions",
}

# Bounding box for Gallatin County area around Bozeman
BBOX = '-111.5,45.0,-110.5,46.0'

def download_layer(layer_id, layer_name):
    """Download a layer from the Gallatin County Planning service"""
    print(f"\nDownloading layer {layer_id}: {layer_name}...")

    # Query parameters for ArcGIS REST API
    params = {
        'where': '1=1',  # Get all features
        'outFields': '*',
        'f': 'geojson',
        'returnGeometry': 'true',
        'outSR': '4326',  # Output in WGS84 lat/lon
    }

    url = f"{BASE_URL}/{layer_id}/query"

    try:
        response = requests.get(url, params=params, timeout=120)
        response.raise_for_status()

        data = response.json()

        if 'features' in data and len(data['features']) > 0:
            output_file = f"../data/{layer_name}.geojson"

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
    print("Gallatin County Planning Data Downloader")
    print("=" * 60)

    success_count = 0

    for layer_id, layer_name in LAYERS.items():
        if download_layer(layer_id, layer_name):
            success_count += 1

    print("\n" + "=" * 60)
    print(f"Download complete: {success_count}/{len(LAYERS)} layers successful")
    print("=" * 60)

    if success_count < len(LAYERS):
        sys.exit(1)

if __name__ == "__main__":
    main()
