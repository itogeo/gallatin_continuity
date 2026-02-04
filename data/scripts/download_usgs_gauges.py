"""
Gallatin Continuity — Download USGS Stream Gauge Data

Downloads stream gauge station locations and metadata from the
USGS NWIS (National Water Information System) for the Bozeman Creek
corridor and surrounding area.

Usage:
    python download_usgs_gauges.py

The script creates a GeoJSON of gauge locations with:
  - Station ID
  - Station name
  - Coordinates
  - Drainage area
  - Link to USGS waterdata page
"""

import sys
import os
import json
import requests

sys.path.insert(0, os.path.dirname(__file__))
from utils import (
    ensure_dirs, print_header, save_geojson,
    BBOX_BOZEMAN_CREEK, BBOX_LOWER_GALLATIN
)


# USGS NWIS REST API
NWIS_BASE = "https://waterservices.usgs.gov/nwis"

# Known gauges in the Bozeman Creek area
KNOWN_GAUGES = [
    '06048650',  # Bozeman Creek at Bozeman, MT (near Lyman Creek)
    '06047500',  # Gallatin River at Logan, MT (downstream reference)
    '06043500',  # Gallatin River near Gallatin Gateway, MT
    '06048000',  # Gallatin River at Bozeman, MT
]


def download_gauge_sites(bbox=None):
    """
    Download gauge site locations from USGS NWIS.

    Parameters:
        bbox: Optional bounding box dict. If None, uses known station IDs.

    Returns:
        dict: GeoJSON FeatureCollection of gauge locations
    """
    print_header("Downloading USGS Stream Gauge Stations")

    # Try bounding box query first for broader coverage
    if bbox:
        url = f"{NWIS_BASE}/site/"
        params = {
            'format': 'rdb',
            'bBox': f"{bbox['xmin']},{bbox['ymin']},{bbox['xmax']},{bbox['ymax']}",
            'siteType': 'ST',  # Stream sites
            'siteStatus': 'all',
            'hasDataTypeCd': 'iv',  # Sites with instantaneous values
        }
        print(f"  Querying NWIS by bounding box...")
    else:
        url = f"{NWIS_BASE}/site/"
        params = {
            'format': 'rdb',
            'sites': ','.join(KNOWN_GAUGES),
            'siteType': 'ST',
            'siteStatus': 'all',
        }
        print(f"  Querying NWIS for known gauge stations...")

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()

        # Parse RDB format (tab-delimited with comment lines)
        lines = response.text.strip().split('\n')
        header = None
        data_lines = []

        for line in lines:
            if line.startswith('#'):
                continue
            if header is None:
                header = line.split('\t')
                continue
            # Skip the format line (second non-comment line)
            if line.startswith('5s') or all(c in '0123456789sd' for c in line.replace('\t', '')):
                continue
            if '\t' in line:
                data_lines.append(line.split('\t'))

        print(f"  Found {len(data_lines)} gauge stations")

        # Convert to GeoJSON
        features = []
        for row in data_lines:
            if len(row) < len(header):
                continue

            record = dict(zip(header, row))

            site_no = record.get('site_no', '').strip()
            station_name = record.get('station_nm', '').strip()
            lat = record.get('dec_lat_va', '').strip()
            lng = record.get('dec_long_va', '').strip()
            drain_area = record.get('drain_area_va', '').strip()

            if not lat or not lng:
                continue

            try:
                lat = float(lat)
                lng = float(lng)
            except ValueError:
                continue

            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [lng, lat]
                },
                'properties': {
                    'site_no': site_no,
                    'station_name': station_name,
                    'drainage_area': f"{drain_area} sq mi" if drain_area else 'N/A',
                    'url': f"https://waterdata.usgs.gov/nwis/uv?site_no={site_no}",
                    'url_realtime': f"https://waterdata.usgs.gov/monitoring-location/{site_no}/",
                    'source': 'USGS NWIS'
                }
            }
            features.append(feature)
            print(f"    {site_no}: {station_name} ({lat:.4f}, {lng:.4f})")

        geojson = {
            'type': 'FeatureCollection',
            'features': features
        }

        return geojson

    except Exception as e:
        print(f"  ✗ Error querying NWIS: {e}")
        return None


def get_current_conditions(site_no):
    """
    Get current streamflow conditions for a gauge.

    This is a utility function for later — could be used to add
    real-time data to popups or a dashboard panel.

    Parameters:
        site_no: USGS station number

    Returns:
        dict: Current flow data or None
    """
    url = f"{NWIS_BASE}/iv/"
    params = {
        'format': 'json',
        'sites': site_no,
        'parameterCd': '00060,00065',  # Discharge (cfs) and gage height (ft)
        'siteStatus': 'active'
    }

    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()

        timeseries = data.get('value', {}).get('timeSeries', [])
        results = {}

        for ts in timeseries:
            param = ts.get('variable', {}).get('variableCode', [{}])[0].get('value', '')
            values = ts.get('values', [{}])[0].get('value', [])
            if values:
                latest = values[-1]
                results[param] = {
                    'value': latest.get('value'),
                    'datetime': latest.get('dateTime'),
                    'unit': ts.get('variable', {}).get('unit', {}).get('unitCode', '')
                }

        return results

    except Exception:
        return None


def main():
    ensure_dirs()

    # Download using bounding box (broader coverage)
    geojson = download_gauge_sites(bbox=BBOX_LOWER_GALLATIN)

    # If bounding box returns nothing, fall back to known stations
    if not geojson or not geojson.get('features'):
        print("\n  Falling back to known station IDs...")
        geojson = download_gauge_sites(bbox=None)

    if geojson and geojson.get('features'):
        save_geojson(geojson, 'usgs_gauges.geojson')

        # Optionally fetch current conditions for each gauge
        print_header("Current Conditions (optional)")
        for feature in geojson['features']:
            site_no = feature['properties']['site_no']
            station = feature['properties']['station_name']
            conditions = get_current_conditions(site_no)

            if conditions:
                for param, data in conditions.items():
                    print(f"  {station}: {param} = {data['value']} {data['unit']}")
            else:
                print(f"  {station}: No current data available")

        print(f"\n  ✓ Gauge data saved successfully")
    else:
        print(f"\n  ✗ No gauge data could be retrieved")

    print(f"\n{'='*60}")
    print(f"  Done!")
    print(f"{'='*60}")


if __name__ == '__main__':
    main()
