"""
Gallatin Continuity — Download NHD Stream Network

Downloads flowlines from the USGS National Hydrography Dataset
for the Bozeman Creek corridor area.

Usage:
    python download_nhd.py
"""

import sys
import os
import requests
import json

# Add parent dir to path for imports
sys.path.insert(0, os.path.dirname(__file__))
from utils import (
    ensure_dirs, print_header, save_geojson,
    query_arcgis_features, BBOX_BOZEMAN_CREEK
)


# NHD Feature Service (USGS)
NHD_SERVICE_URL = "https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer"

# Layer IDs within the NHD service:
#   2 = NHDFlowline (streams/rivers)
#   6 = NHDWaterbody (lakes/ponds)
#   3 = NHDArea (large water features)
FLOWLINE_LAYER = 2
WATERBODY_LAYER = 6


def download_flowlines():
    """Download NHD flowlines (streams and rivers) for the focus area."""
    print_header("Downloading NHD Flowlines")

    try:
        geojson = query_arcgis_features(
            service_url=NHD_SERVICE_URL,
            layer_id=FLOWLINE_LAYER,
            bbox=BBOX_BOZEMAN_CREEK,
            out_fields="GNIS_Name,FType,FCode,LengthKM,StreamOrde,ReachCode",
            max_records=10000
        )

        # Filter to keep only named streams and significant unnamed ones
        features = geojson.get('features', [])
        print(f"\n  Total flowlines: {len(features)}")

        # Categorize features
        named = [f for f in features if f['properties'].get('GNIS_Name')]
        unnamed = [f for f in features if not f['properties'].get('GNIS_Name')]

        print(f"  Named streams: {len(named)}")
        print(f"  Unnamed flowlines: {len(unnamed)}")

        # List unique named streams
        names = sorted(set(f['properties']['GNIS_Name'] for f in named))
        print(f"\n  Named streams found:")
        for name in names:
            print(f"    - {name}")

        # Save all flowlines
        save_geojson(geojson, 'streams.geojson')

        # Also save a "named only" version for cleaner display
        named_geojson = {
            'type': 'FeatureCollection',
            'features': named
        }
        save_geojson(named_geojson, 'streams_named.geojson')

        print(f"\n  ✓ Flowlines downloaded successfully")
        return True

    except Exception as e:
        print(f"\n  ✗ Error downloading flowlines: {e}")
        print(f"    You may need to check the NHD service status or adjust the bounding box.")
        return False


def download_waterbodies():
    """Download NHD waterbodies (lakes, ponds, reservoirs) for the focus area."""
    print_header("Downloading NHD Waterbodies")

    try:
        geojson = query_arcgis_features(
            service_url=NHD_SERVICE_URL,
            layer_id=WATERBODY_LAYER,
            bbox=BBOX_BOZEMAN_CREEK,
            out_fields="GNIS_Name,FType,FCode,AreaSqKm",
            max_records=5000
        )

        features = geojson.get('features', [])
        print(f"\n  Total waterbodies: {len(features)}")

        if features:
            save_geojson(geojson, 'waterbodies.geojson')
            print(f"  ✓ Waterbodies downloaded successfully")
        else:
            print(f"  ℹ No waterbodies found in this area")

        return True

    except Exception as e:
        print(f"\n  ✗ Error downloading waterbodies: {e}")
        return False


if __name__ == '__main__':
    ensure_dirs()
    download_flowlines()
    download_waterbodies()
    print(f"\n{'='*60}")
    print(f"  Done! Check data/processed/ and web/data/ for outputs.")
    print(f"{'='*60}")
