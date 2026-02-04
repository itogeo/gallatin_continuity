# Layer Inventory

## Layer Categories and Data Sources

Each category groups related layers that tell part of the water resource governance story.

---

## 1. The Water
*The physical reality — always visible as the map's backbone.*

| Layer | Source | Status | Notes |
|-------|--------|--------|-------|
| Streams & Rivers (NHD Flowlines) | USGS NHD | To download | Bozeman Creek + tributaries |
| USGS Stream Gauges | USGS NWIS | To download | Gauge 06048650 (Lyman Ck), 06047500 (mouth) |
| Floodplains | FEMA NFHL | To download | 100-yr and 500-yr zones |
| Wetlands | NWI | To download | National Wetlands Inventory |
| Irrigation Canals/Ditches | Various | TBD | May need manual digitization |

---

## 2. The Land
*Watershed and terrain context.*

| Layer | Source | Status | Notes |
|-------|--------|--------|-------|
| Watershed Boundaries (HUC 10/12) | USGS WBD | To download | Sub-watershed delineation |
| Topography/Hillshade | Mapbox Terrain | Built-in | Via Mapbox style |
| Public Lands (USFS, BLM) | USGS PAD | To download | Forest boundary at headwaters |

---

## 3. Who Governs
*Jurisdictional and administrative boundaries.*

| Layer | Source | Status | Notes |
|-------|--------|--------|-------|
| Gallatin County Boundary | Census TIGER | To download | Context/framing |
| City of Bozeman Limits | Gallatin Co ArcGIS | To download | Municipal boundary |
| Hyalite Zoning District | Gallatin Co ArcGIS | To download | Key planning district |
| Bozeman Donut | Gallatin Co ArcGIS | To download | County planning around city |
| Other Planning Jurisdictions | Gallatin Co ArcGIS | To download | As available |
| Conservation Districts | Montana State Library | To download | Gallatin Conservation District |
| Water/Sewer Districts | TBD | To research | Special purpose districts |

---

## 4. Zoning & Development
*The transect zones showing how development intensity relates to water.*

| Layer | Source | Status | Notes |
|-------|--------|--------|-------|
| Urban Core | Gallatin Co ArcGIS / City | To download | Downtown Bozeman |
| Urban Center | Gallatin Co ArcGIS / City | To download | City core areas |
| General Urban | Gallatin Co ArcGIS | To download | Developed residential |
| Suburban | Gallatin Co ArcGIS | To download | Lower density residential |
| Rural | Gallatin Co ArcGIS | To download | Agricultural / large lot |
| Natural | Gallatin Co ArcGIS | To download | Undeveloped / protected |
| Growth Policy Future Land Use | City of Bozeman | To download | Planned development areas |

---

## 5. Active Projects
*GWC and partner projects — the "what's being done" layer.*

| Layer | Source | Status | Notes |
|-------|--------|--------|-------|
| Restoration Projects | GWC | Awaiting data | Point/polygon with descriptions |
| Stream Team Monitoring Sites | GWC | Awaiting data | Point locations |
| Interpretive Signs | GWC | Awaiting data | Point locations with photos |
| Partner Projects | GWC | Awaiting data | Other organizations' work |

---

## 6. Conditions & Data
*Water quality, impairments, and monitoring.*

| Layer | Source | Status | Notes |
|-------|--------|--------|-------|
| 303(d) Impaired Streams | MT DEQ | To download | Impairment designations |
| TMDL Areas | MT DEQ | To download | Total Maximum Daily Load areas |
| Water Quality Monitoring | MT DEQ / GWC | To research | Sampling locations |
| Stormwater Outfalls | City of Bozeman | To research | Discharge points |

---

## ArcGIS REST Endpoints

Key endpoints for data extraction:

**Gallatin County Planning:**
- Base: `https://gallatinplanning.maps.arcgis.com`
- Hyalite Zoning: webmap `2026409b241f40568dcd65152550da64`
- Bozeman Donut: webmap `7b18cc10db89434c8797eefc540e6387`

**USGS:**
- NHD: `https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer`
- WBD: `https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer`
- NWIS: `https://waterservices.usgs.gov/nwis/`

**Montana:**
- State GIS: `https://geoinfo.msl.mt.gov/`
- DEQ: `https://deq.mt.gov/water`
