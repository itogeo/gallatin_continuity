"""
Gallatin Continuity — Data Pipeline Utilities

Shared helpers for downloading and processing geospatial data.
"""

import os
import json
import requests
import geopandas as gpd
from shapely.geometry import shape, mapping

# --- Paths ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.join(SCRIPT_DIR, '..', 'raw')
PROCESSED_DIR = os.path.join(SCRIPT_DIR, '..', 'processed')
WEB_DATA_DIR = os.path.join(SCRIPT_DIR, '..', '..', 'web', 'data')

# --- Bounding Box ---
# Bozeman Creek corridor focus area
BBOX_BOZEMAN_CREEK = {
    'xmin': -111.15,
    'ymin': 45.55,
    'xmax': -110.90,
    'ymax': 45.72
}

# Full Lower Gallatin (for later expansion)
BBOX_LOWER_GALLATIN = {
    'xmin': -111.50,
    'ymin': 45.20,
    'xmax': -110.60,
    'ymax': 46.00
}


def ensure_dirs():
    """Create output directories if they don't exist."""
    for d in [RAW_DIR, PROCESSED_DIR, WEB_DATA_DIR]:
        os.makedirs(d, exist_ok=True)
    print(f"  Directories ready:")
    print(f"    Raw:       {os.path.abspath(RAW_DIR)}")
    print(f"    Processed: {os.path.abspath(PROCESSED_DIR)}")
    print(f"    Web data:  {os.path.abspath(WEB_DATA_DIR)}")


def bbox_to_esri(bbox):
    """Convert bounding box dict to Esri REST API format string."""
    return f"{bbox['xmin']},{bbox['ymin']},{bbox['xmax']},{bbox['ymax']}"


def query_arcgis_features(service_url, layer_id=0, bbox=None, where="1=1",
                           out_fields="*", out_sr=4326, max_records=5000):
    """
    Query an ArcGIS REST Feature Service and return GeoJSON.

    Parameters:
        service_url: Base URL of the feature service (e.g., .../MapServer or .../FeatureServer)
        layer_id: Layer index within the service
        bbox: Optional bounding box dict with xmin, ymin, xmax, ymax
        where: SQL WHERE clause for filtering
        out_fields: Fields to return (* for all)
        out_sr: Output spatial reference (4326 = WGS84)
        max_records: Maximum features to request

    Returns:
        dict: GeoJSON FeatureCollection
    """
    url = f"{service_url}/{layer_id}/query"
    params = {
        'where': where,
        'outFields': out_fields,
        'outSR': out_sr,
        'f': 'geojson',
        'returnGeometry': 'true',
        'resultRecordCount': max_records
    }

    if bbox:
        params['geometry'] = bbox_to_esri(bbox)
        params['geometryType'] = 'esriGeometryEnvelope'
        params['inSR'] = 4326
        params['spatialRel'] = 'esriSpatialRelIntersects'

    print(f"  Querying: {url}")
    print(f"  Where: {where}")
    if bbox:
        print(f"  Bbox: {bbox_to_esri(bbox)}")

    response = requests.get(url, params=params, timeout=60)
    response.raise_for_status()

    data = response.json()

    if 'error' in data:
        raise Exception(f"ArcGIS Error: {data['error']}")

    feature_count = len(data.get('features', []))
    print(f"  → Retrieved {feature_count} features")
    return data


def save_geojson(data, filename, directory=None):
    """
    Save GeoJSON data to file(s).

    Saves to both the processed directory and the web data directory.

    Parameters:
        data: GeoJSON dict or GeoDataFrame
        filename: Output filename (should end in .geojson)
        directory: Optional override directory (otherwise saves to processed + web)
    """
    if isinstance(data, gpd.GeoDataFrame):
        geojson_str = data.to_json()
        data = json.loads(geojson_str)

    if directory:
        path = os.path.join(directory, filename)
        with open(path, 'w') as f:
            json.dump(data, f)
        print(f"  Saved: {path}")
    else:
        # Save to processed
        proc_path = os.path.join(PROCESSED_DIR, filename)
        with open(proc_path, 'w') as f:
            json.dump(data, f)
        print(f"  Saved: {proc_path}")

        # Copy to web/data for serving
        web_path = os.path.join(WEB_DATA_DIR, filename)
        with open(web_path, 'w') as f:
            json.dump(data, f)
        print(f"  Copied to: {web_path}")


def simplify_geometries(gdf, tolerance=0.0001):
    """Simplify geometries to reduce file size for web display."""
    simplified = gdf.copy()
    simplified['geometry'] = simplified['geometry'].simplify(tolerance, preserve_topology=True)
    return simplified


def clip_to_bbox(gdf, bbox):
    """Clip a GeoDataFrame to a bounding box."""
    from shapely.geometry import box
    clip_geom = box(bbox['xmin'], bbox['ymin'], bbox['xmax'], bbox['ymax'])
    return gpd.clip(gdf, clip_geom)


def print_header(title):
    """Print a formatted section header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")
