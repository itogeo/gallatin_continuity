#!/usr/bin/env python3
"""
Simplify GeoJSON files by reducing coordinate precision.
This can reduce file sizes by 50-70% with no visible change on web maps.
"""

import json
import os
import sys

def round_coords(coords, precision=5):
    """Recursively round coordinates to specified precision."""
    if isinstance(coords, (int, float)):
        return round(coords, precision)
    elif isinstance(coords, list):
        return [round_coords(c, precision) for c in coords]
    return coords

def simplify_geojson(input_path, output_path=None, precision=5):
    """Simplify a GeoJSON file by reducing coordinate precision."""
    if output_path is None:
        output_path = input_path  # Overwrite

    print(f"Processing: {os.path.basename(input_path)}")
    original_size = os.path.getsize(input_path)

    with open(input_path, 'r') as f:
        data = json.load(f)

    # Process each feature's geometry
    if 'features' in data:
        for feature in data['features']:
            if feature.get('geometry') and feature['geometry'].get('coordinates'):
                feature['geometry']['coordinates'] = round_coords(
                    feature['geometry']['coordinates'],
                    precision
                )
    elif 'geometry' in data and data['geometry'].get('coordinates'):
        data['geometry']['coordinates'] = round_coords(
            data['geometry']['coordinates'],
            precision
        )

    # Write with minimal whitespace
    with open(output_path, 'w') as f:
        json.dump(data, f, separators=(',', ':'))

    new_size = os.path.getsize(output_path)
    reduction = (1 - new_size / original_size) * 100

    print(f"  {original_size / 1024 / 1024:.1f}MB → {new_size / 1024 / 1024:.1f}MB ({reduction:.0f}% reduction)")
    return new_size

if __name__ == '__main__':
    # If a specific file is provided, simplify just that file
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
        if os.path.exists(filepath):
            print(f"Simplifying {filepath}...\n")
            simplify_geojson(filepath, precision=5)
            print("\nDone!")
        else:
            print(f"Error: File not found: {filepath}")
            sys.exit(1)
    else:
        # Otherwise, simplify all the standard files
        data_dir = os.path.join(os.path.dirname(__file__), '..', 'web', 'data')

        # Files to simplify (the large ones)
        large_files = [
            'floodplains.geojson',
            'streams.geojson',
            'gallatin_streams.geojson',
            'zoning_transect.geojson',
            'fire_districts.geojson',
            'public_lands.geojson',
            'bozeman_donut.geojson',
            'bozeman_fema_flood.geojson',
        ]

        print("Simplifying GeoJSON files (reducing coordinate precision to 5 decimals)...\n")

        for filename in large_files:
            filepath = os.path.join(data_dir, filename)
            if os.path.exists(filepath):
                simplify_geojson(filepath, precision=5)
            else:
                print(f"Skipping (not found): {filename}")

        print("\nDone! Files have been simplified in place.")
