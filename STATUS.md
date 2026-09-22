# STATUS — Gallatin Continuity

**Last meaningful commit:** 2026-02-11 · `d513439` "updates! satelite layer" · 22 commits on `main` · remote `itogeo/gallatin_continuity` — **PUBLIC**

## What it was for
A client deliverable for the Gallatin Watershed Council, credited to Ito Geospatial LLC.
An interactive map showing how water flows continuously through zones governed by
different rules and authorities — Natural headwaters through Rural, Suburban, General
Urban, Urban Center, Urban Core — starting with the Bozeman Creek corridor.

## Current state
Reads as delivered or near-delivered. Waterway network as the always-on spine, toggleable
governance/zoning/planning layers, click-to-query "what applies here?", USGS gauge links
with live flow, restoration project locations, GWC-branded. README documents a complete
setup path. Oldest repo in the set; untouched since February 2026.

## How to run it
```
pip install -r requirements.txt
python scripts/<downloader>.py       # 10 pipeline scripts in scripts/
# web/ is static — serve it and open index.html
```

## Blocked / missing — read this before touching it
- **It is a PUBLIC repo with a live Mapbox `pk.` token committed at `web/js/config.js:12`.**
  Publishable tokens are meant to be public, so this is low severity, but it is scrapeable
  and needs a URL restriction in the Mapbox dashboard. Note the README tells users to
  replace `YOUR_MAPBOX_TOKEN_HERE`, so the committed token was probably not intended to ship.
- ~100 MB of GeoJSON is committed **twice**, in `data/` and `web/data/` — same six files.
  An easy win if this repo is ever revisited.
- Unknown whether GWC is still using it or wants it maintained.

## To resume, start here
`README.md`. But the first question is relationship, not code: this was for a real client
and has had no attention in seven months. Ask GWC whether it is still in use before
investing in it.
