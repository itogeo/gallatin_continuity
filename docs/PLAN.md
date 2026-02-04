# Project Plan: Gallatin Continuity Map

## Vision

The Gallatin Continuity Map is the operational spatial hub for the Gallatin Watershed Council.
It replaces scattered ArcGIS web maps and linear story maps with a unified, interactive
explorer that answers: **"For any given location, who governs the water — and how do all
these jurisdictions overlap?"**

## Audience

- **General Public:** Residents who want to understand what rules and authorities affect
  water resources near their property or neighborhood.
- **Policy Managers:** County planners, city staff, conservation district board members,
  and GWC staff who need to see the full jurisdictional picture for coordination.

## Design Philosophy

### The Map Is the Story
Water flows continuously. Governance boundaries are artificial overlays. The map should
make this tension visible and explorable — streams always visible underneath, governance
zones as translucent overlays. Click anywhere, see every layer that applies.

### Guided but Not Linear
Unlike a story map, there is no prescribed scroll path. The interface offers categories
and context (descriptions, links, explanations) but lets the user explore freely. A
brief welcome overlay orients new visitors, then gets out of the way.

### The Transect Concept
The zones — Natural → Rural → Suburban → General Urban → Urban Center → Urban Core —
represent how the rules governing water change as the creek flows from headwaters to
downtown. The map should make this gradient legible through visual design.

---

## Phases

### Phase 1: Scaffold + Water (Current)
- [x] Repo structure and project setup
- [ ] Mapbox GL JS base map with GWC branding
- [ ] NHD stream network for Bozeman Creek watershed
- [ ] USGS gauge markers with real-time data links
- [ ] Panel UI skeleton with layer category toggles
- [ ] Welcome overlay with GWC logo and brief intro
- [ ] Click-to-query foundation (popup with location info)

### Phase 2: Governance Layers
- [ ] Pull planning district boundaries from ArcGIS REST endpoints
  - Hyalite Zoning District
  - Bozeman Donut
  - Other planning jurisdictions
- [ ] City of Bozeman limits
- [ ] Gallatin County boundary
- [ ] Zoning transect zones (Urban Core → Natural)
- [ ] Conservation district boundaries
- [ ] Feature detail cards with descriptions and source links

### Phase 3: Projects + Detail
- [ ] GWC restoration project locations
- [ ] Stream team monitoring sites
- [ ] Interpretive sign locations
- [ ] DEQ / 303(d) impaired waterway segments
- [ ] TMDL areas
- [ ] Water quality monitoring stations
- [ ] Enhanced feature popups with photos, contacts, links

### Phase 4: Scale Up
- [ ] Expand to full Lower Gallatin (East Gallatin River, Hyalite Creek)
- [ ] Add irrigation districts, water rights data
- [ ] Belgrade, Manhattan, Three Forks areas
- [ ] Full Gallatin Watershed to Three Forks
- [ ] Mobile responsive optimization
- [ ] Performance tuning (convert large layers to Mapbox tilesets)

---

## Data Sources

| Source | Layers | Format | Access |
|--------|--------|--------|--------|
| USGS NHD | Streams, flowlines | GeoJSON/Shapefile | Download via API |
| USGS NWIS | Stream gauges, flow data | JSON/API | Real-time REST API |
| Gallatin County ArcGIS | Planning districts, zoning | Feature Service | REST API query |
| City of Bozeman | City limits, zoning | Feature Service | REST API query |
| Montana DNRC/DEQ | Water rights, impaired waters | Various | State data portal |
| Montana State Library (MSDI) | Conservation districts | Shapefile | Download |
| USGS WBD | Watershed boundaries (HUC) | GeoJSON/Shapefile | Download via API |
| FEMA | Floodplains | Shapefile | NFHL download |
| GWC | Projects, monitoring sites | Manual/CSV | From client |
| Census TIGER | Municipal boundaries | Shapefile | Download |

---

## Technical Stack

- **Map Renderer:** Mapbox GL JS v3
- **Basemap:** Custom Mapbox style (terrain + water emphasis, GWC palette)
- **Data Pipeline:** Python (requests, geopandas, shapely, fiona)
- **Data Format:** GeoJSON (small layers direct, large layers → Mapbox tilesets)
- **Frontend:** Vanilla HTML/CSS/JS (no framework dependency)
- **Hosting:** Static site — Vercel, Netlify, or GWC subdomain
