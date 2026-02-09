# Gallatin Continuity — Data Sources Documentation

> **Last Updated:** 2024-02-05
> **Purpose:** Track all raw data sources for replication and updates

---

## City of Bozeman Data

### 1. City Limits (Jurisdictional Boundary)
- **Source:** City of Bozeman Open Data Portal
- **Service URL:** `https://gisweb.bozeman.net/arcgis/rest/services/Open_Data/City_Limits/FeatureServer/0`
- **Format:** ArcGIS FeatureServer → GeoJSON
- **Reference:** https://public-bozeman.opendata.arcgis.com/search?tags=City%2520Limits%2Ccity_limits
- **Download Query:** `?where=1=1&outFields=*&f=geojson`
- **Local File:** `data/raw/bozeman_city_limits.geojson`

### 2. Urban Streams
- **Source:** City of Bozeman Open Data Portal
- **Service URL:** `https://gisweb.bozeman.net/arcgis/rest/services/Open_Data/Streams/FeatureServer/0`
- **Format:** ArcGIS FeatureServer → GeoJSON
- **Reference:** https://public-bozeman.opendata.arcgis.com/datasets/b8c53bf756694cc2970a4955a3b70d17_1/explore
- **Download Query:** `?where=1=1&outFields=*&f=geojson`
- **Local File:** `data/raw/bozeman_urban_streams.geojson`

### 3. City of Bozeman Zoning
- **Source:** City of Bozeman Open Data Portal
- **Service URL:** `https://gisweb.bozeman.net/arcgis/rest/services/Open_Data/Zoning/FeatureServer/0`
- **Format:** ArcGIS FeatureServer → GeoJSON
- **Download Query:** `?where=1=1&outFields=*&f=geojson`
- **Local File:** `data/raw/bozeman_zoning.geojson`

### 4. FEMA Flood Hazard Areas
- **Source:** City of Bozeman Public Services
- **Service URL:** `https://gisweb.bozeman.net/arcgis/rest/services/Public/FEMA_Flood_Hazard_Areas/MapServer/0`
- **Format:** ArcGIS MapServer → GeoJSON
- **Reference:** https://gisweb.bozeman.net/vertigisstudio/web/?app=c10d1603c3cb49a282a8ea9fa4ef1073
- **Download Query:** `?where=1=1&outFields=*&f=geojson`
- **Local File:** `data/raw/bozeman_fema_flood.geojson`

---

## Gallatin County Data

### 5. Hyalite Zoning District
- **Source:** Gallatin County Planning MapServer
- **Service URL:** `https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer/9`
- **Filter:** `DISTRICT_N = 'HYALITE'`
- **Format:** ArcGIS MapServer → GeoJSON
- **Reference:** https://gallatinplanning.maps.arcgis.com/apps/mapviewer/index.html?webmap=2026409b241f40568dcd65152550da64
- **Download Query:** `?where=DISTRICT_N='HYALITE'&outFields=*&f=geojson`
- **Local File:** `data/raw/hyalite_zoning_district.geojson`

### 6. Bozeman Donut (Gallatin County/Bozeman Area Planning)
- **Source:** Gallatin County Planning MapServer
- **Service URL:** `https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer/9`
- **Filter:** `DISTRICT_N = 'GALLATIN COUNTY / BOZEMAN AREA'`
- **Format:** ArcGIS MapServer → GeoJSON
- **Reference:** https://gallatinplanning.maps.arcgis.com/apps/mapviewer/index.html?webmap=7b18cc10db89434c8797eefc540e6387
- **Download Query:** `?where=DISTRICT_N='GALLATIN COUNTY / BOZEMAN AREA'&outFields=*&f=geojson`
- **Local File:** `data/raw/bozeman_donut.geojson`

### 7. Gallatin County Boundary
- **Source:** Gallatin County Planning MapServer
- **Service URL:** `https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer/29`
- **Format:** ArcGIS MapServer → GeoJSON
- **Download Query:** `?where=1=1&outFields=*&f=geojson`
- **Local File:** `data/raw/gallatin_county_boundary.geojson`

### 8. County Cities
- **Source:** Gallatin County Planning MapServer
- **Service URL:** `https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer/27`
- **Format:** ArcGIS MapServer → GeoJSON
- **Download Query:** `?where=1=1&outFields=*&f=geojson`
- **Local File:** `data/raw/gallatin_cities.geojson`

### 9. County Waterways (Streams)
- **Source:** Gallatin County Planning MapServer
- **Service URL:** `https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer/23`
- **Format:** ArcGIS MapServer → GeoJSON
- **Reference:** https://www.gallatinmt.gov/geographic-information-services-gis/pages/data-download
- **Download Query:** `?where=1=1&outFields=*&f=geojson`
- **Local File:** `data/raw/gallatin_streams.geojson`

---

## Branding Assets

### Gallatin Watershed Council
- **Website:** https://www.gallatinwatershedcouncil.org/
- **Logo URL:** `https://images.squarespace-cdn.com/content/v1/5db48502924a603ce089d51f/c7d38274-5ab8-41f3-a7dd-612cb84f44a4/GWC+Logo+-+Full+COLOR+TRANSPARENT+%281%29.png`
- **Tagline:** "Working together for clean water"
- **Local File:** `web/assets/gwc-logo.png`

---

## Data Download Commands

```bash
# Run the download script
cd data/scripts
python download_governance.py
```

---

## Notes

- All ArcGIS services support `f=geojson` for direct GeoJSON export
- Large datasets may need pagination (use `resultOffset` and `resultRecordCount`)
- County MapServer layers require `query` endpoint: `/MapServer/{layerId}/query`
- City FeatureServer layers work with direct `/FeatureServer/0/query`
