# Gallatin Continuity

**Interactive Map of Water Resource Management Continuity**

Built for the [Gallatin Watershed Council](https://www.gallatinwatershedcouncil.org/) by [Ito Geospatial LLC](https://itogeo.com).

## Overview

An interactive Mapbox GL JS map explorer that reveals the overlapping layers of governance, planning, zoning, and natural systems affecting water resources in the Gallatin watershed. Starting with the Bozeman Creek corridor, the map shows how water flows continuously through zones with different rules, authorities, and management approaches — from Natural forest headwaters through Rural, Suburban, General Urban, Urban Center, and Urban Core.

**Key Features:**
- Waterway network as the always-on visual spine
- Toggleable governance/zoning/planning layers organized by category
- Click-to-query: "What applies at this location?"
- USGS gauge links with real-time flow data
- Restoration project locations and details
- GWC-branded design matching the Watershed Council's identity

## Getting Started

### Prerequisites
- Python 3.9+
- A [Mapbox](https://www.mapbox.com/) access token
- Node.js (optional, for local dev server)

### Setup

1. **Clone the repo:**
   ```bash
   git clone <repo-url>
   cd gallatin_continuity
   ```

2. **Install Python dependencies (for data pipeline):**
   ```bash
   pip install -r requirements.txt
   ```

3. **Add your Mapbox token:**
   - Open `web/js/config.js`
   - Replace `YOUR_MAPBOX_TOKEN_HERE` with your token

4. **Download and process data:**
   ```bash
   cd data/scripts
   python download_nhd.py
   python download_arcgis.py
   python download_usgs_gauges.py
   ```

5. **Serve the web app:**
   ```bash
   # From the project root:
   cd web
   python -m http.server 8000
   # Open http://localhost:8000
   ```

## Project Structure

```
gallatin_continuity/
├── README.md
├── requirements.txt
├── .gitignore
├── data/
│   ├── raw/              # Downloaded source files (git-ignored)
│   ├── processed/         # Cleaned GeoJSON for the map (git-ignored)
│   └── scripts/           # Python ETL pipeline
│       ├── download_nhd.py
│       ├── download_arcgis.py
│       ├── download_usgs_gauges.py
│       └── utils.py
├── web/
│   ├── index.html         # Main application
│   ├── css/
│   │   └── style.css      # GWC-branded styles
│   ├── js/
│   │   ├── app.js         # Mapbox GL JS application logic
│   │   └── config.js      # Layer definitions and configuration
│   ├── assets/            # Logo, images, icons
│   └── data/              # GeoJSON served to the frontend
└── docs/
    ├── PLAN.md            # Detailed project plan and phases
    └── LAYERS.md          # Layer inventory and data sources
```

## Scaling

The project is designed to scale outward:
1. **Phase 1:** Bozeman Creek corridor (current focus)
2. **Phase 2:** Full Lower Gallatin (East Gallatin, Hyalite Creek, tributaries)
3. **Phase 3:** Complete Gallatin Watershed to Three Forks

Adding new layers = adding a GeoJSON file + a config entry. No code rewrite needed.

## License

Proprietary — Gallatin Watershed Council / Ito Geospatial LLC
