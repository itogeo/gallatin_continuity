/**
 * Gallatin Continuity — Main Application
 *
 * Interactive map of water resource management continuity.
 * Built with Mapbox GL JS for the Gallatin Watershed Council.
 */

(function () {
    'use strict';

    // ---- State ----
    const state = {
        map: null,
        activeLayers: new Set(),
        loadedSources: new Set(),
        panelOpen: true,
        currentPopup: null,
        storyIndex: 0,
        storyOpen: false
    };


    // ---- Story Content with layer connections and policy visualization ----
    const STORY_CHAPTERS = [
        {
            title: "The Continuity Challenge",
            zone: null,
            flyTo: { center: [-111.03, 45.60], zoom: 10 },
            layers: ['gallatin-streams', 'bozeman-city-limits'],
            content: `
                <h4>One Creek, Many Rules</h4>
                <p>Bozeman Creek flows 14 miles from the Hyalite-Porcupine-Buffalo Horn Wilderness to its confluence with the East Gallatin River.</p>
                <p>Along its journey, the creek passes through <strong>four distinct governance zones</strong> — each with different setback requirements and management approaches.</p>
                <div class="highlight-box">
                    <strong>The challenge:</strong> Water flows continuously, but our rules change at every boundary line.
                </div>
                <p>This map reveals how policy visually affects the landscape — and where opportunities exist to create continuity.</p>
                <div class="about-section">
                    <p class="about-credit">A project of the <a href="https://www.gallatinwatershedcouncil.org/" target="_blank">Gallatin Watershed Council</a></p>
                </div>
            `
        },
        {
            title: "Hyalite Headwaters",
            zone: "natural",
            flyTo: { center: [-111.02, 45.48], zoom: 10.5 },
            layers: ['gallatin-streams', 'public-lands', 'hyalite-zoning', 'setback-proposed-300'],
            content: `
                <div class="zone-heading">
                    <div class="zone-icon natural">🏔️</div>
                    <div>
                        <span class="zone-tag natural">Natural Zone</span>
                        <h4>Hyalite/Mystic Watershed</h4>
                    </div>
                </div>
                <p>The creek begins in the <strong>Custer Gallatin National Forest</strong>, protected by federal wilderness designations.</p>

                <div class="policy-box natural">
                    <h5>Hyalite/Mystic Integrated Water Resources Plan</h5>
                    <p>Draft Water Supply Screening Criteria emphasizes <strong>Watershed Resiliency and Ecosystem Services</strong>:</p>
                    <ul>
                        <li>Flow regulation & infiltration</li>
                        <li>Groundwater recharge</li>
                        <li>Climate adaptation capacity</li>
                    </ul>
                </div>

                <div class="setback-comparison">
                    <div class="setback-item proposed">
                        <span class="setback-value">300ft</span>
                        <span class="setback-label">Proposed Buffer</span>
                    </div>
                    <div class="setback-item">
                        <span class="setback-value">No Dev</span>
                        <span class="setback-label">Federal Policy</span>
                    </div>
                </div>

                <div class="story-layer-legend">
                    <span class="layer-dot" style="background: #1e4d2b"></span> Public Lands
                    <span class="layer-dot" style="background: #4caf50"></span> 300ft Proposed
                </div>
            `
        },
        {
            title: "County Jurisdiction",
            zone: "rural",
            flyTo: { center: [-111.02, 45.62], zoom: 11 },
            layers: ['gallatin-streams', 'bozeman-donut', 'hyalite-zoning', 'setback-county-150', 'setback-proposed-300'],
            content: `
                <div class="zone-heading">
                    <div class="zone-icon rural">🌲</div>
                    <div>
                        <span class="zone-tag rural">Rural Zone</span>
                        <h4>Gallatin County Planning</h4>
                    </div>
                </div>

                <div class="policy-box county">
                    <h5>Current County Regulations</h5>
                    <p><strong>Subdivision Regulations:</strong> 150ft setback from watercourses</p>
                    <p>Applies to Bozeman Area Donut & Hyalite District</p>
                </div>

                <div class="setback-comparison">
                    <div class="setback-item current">
                        <span class="setback-value">150ft</span>
                        <span class="setback-label">Current</span>
                    </div>
                    <div class="setback-item proposed">
                        <span class="setback-value">300ft</span>
                        <span class="setback-label">Proposed</span>
                    </div>
                </div>

                <div class="highlight-box">
                    <strong>Zoning Reform Underway:</strong> County considering 300ft structure / 150ft disturbance setbacks aligned with Future Land Use Map.
                </div>

                <div class="story-layer-legend">
                    <span class="layer-dot" style="background: #8d6e63"></span> Bozeman Donut
                    <span class="layer-dot" style="background: #ff9800"></span> 150ft Current
                    <span class="layer-dot" style="background: #4caf50"></span> 300ft Proposed
                </div>
            `
        },
        {
            title: "Bozeman Creek Vision",
            zone: "suburban",
            flyTo: { center: [-111.035, 45.67], zoom: 12.5 },
            layers: ['gallatin-streams', 'bozeman-city-limits', 'bozeman-parks', 'floodplains', 'setback-city-75'],
            content: `
                <div class="zone-heading">
                    <div class="zone-icon suburban">🏡</div>
                    <div>
                        <span class="zone-tag suburban">City Zone</span>
                        <h4>Bozeman Creek Vision Plan</h4>
                    </div>
                </div>

                <div class="policy-box city">
                    <h5>UDC Watercourse Setbacks</h5>
                    <p><strong>75ft setback</strong> from watercourses</p>
                    <p><strong>45ft native vegetation</strong> required</p>
                    <p><em>Scope: Downstream of downtown core</em></p>
                </div>

                <h4 style="margin-top: 16px;">Vision Plan Goals:</h4>
                <ul style="margin: 12px 0; padding-left: 20px; color: var(--gray-600);">
                    <li><strong>Flood Mitigation</strong> — Reduce 100-year flood damage</li>
                    <li><strong>Water Quality</strong> — Filter sediment and nutrients</li>
                    <li><strong>Ecological Restoration</strong> — Reconnect habitat corridors</li>
                </ul>

                <div class="setback-comparison">
                    <div class="setback-item city">
                        <span class="setback-value">75ft</span>
                        <span class="setback-label">City Setback</span>
                    </div>
                    <div class="setback-item">
                        <span class="setback-value">45ft</span>
                        <span class="setback-label">Native Veg</span>
                    </div>
                </div>

                <div class="story-layer-legend">
                    <span class="layer-dot" style="background: #e91e63"></span> 75ft City Setback
                    <span class="layer-dot" style="background: #66bb6a"></span> Parks
                    <span class="layer-dot" style="background: #7c4dff"></span> Flood Zones
                </div>
            `
        },
        {
            title: "Urban Core",
            zone: "core",
            flyTo: { center: [-111.038, 45.679], zoom: 14 },
            layers: ['gallatin-streams', 'bozeman-city-limits', 'bozeman-zoning', 'bozeman-parks', 'setback-city-75'],
            content: `
                <div class="zone-heading">
                    <div class="zone-icon core">🏢</div>
                    <div>
                        <span class="zone-tag core">Urban Core</span>
                        <h4>Downtown Bozeman</h4>
                    </div>
                </div>

                <p>At the heart of Bozeman, the creek is most constrained — historic development patterns have encroached on the riparian corridor.</p>

                <div class="culvert-indicator">
                    <div class="culvert-icon">⬇️ Underground</div>
                    <span>Sections flow through culverts beneath streets and parking lots.</span>
                </div>

                <div class="policy-box conflict">
                    <h5>Policy vs. Reality</h5>
                    <p>While 75ft setbacks apply, existing development predates these requirements. Limited space for restoration.</p>
                </div>

                <div class="highlight-box">
                    <strong>Daylighting Opportunity:</strong> Restoring underground sections could reduce flooding and reconnect the watershed.
                </div>

                <div class="story-layer-legend">
                    <span class="layer-dot" style="background: #e91e63"></span> 75ft Setback
                    <span class="layer-dot" style="background: #81c784"></span> Zoning
                    <div class="culvert-legend-item">
                        <span class="culvert-dash"></span> Underground
                    </div>
                </div>
            `
        },
        {
            title: "Toward Continuity",
            zone: null,
            flyTo: { center: CONFIG.mapbox.center, zoom: CONFIG.mapbox.zoom },
            layers: ['gallatin-streams', 'bozeman-city-limits', 'setback-city-75', 'setback-county-150', 'setback-proposed-300'],
            content: `
                <h4>Visualizing Policy Change</h4>
                <p>This map shows how <strong>different setback policies</strong> would affect the landscape around Bozeman Creek.</p>

                <div class="setback-comparison triple">
                    <div class="setback-item city">
                        <span class="setback-value">75ft</span>
                        <span class="setback-label">City</span>
                    </div>
                    <div class="setback-item current">
                        <span class="setback-value">150ft</span>
                        <span class="setback-label">County</span>
                    </div>
                    <div class="setback-item proposed">
                        <span class="setback-value">300ft</span>
                        <span class="setback-label">Proposed</span>
                    </div>
                </div>

                <h4 style="margin-top: 16px;">The Path Forward:</h4>
                <ul style="margin: 12px 0; padding-left: 20px; color: var(--gray-600);">
                    <li><strong>Setback Harmonization</strong> — Consistent protections across jurisdictions</li>
                    <li><strong>County Zoning Reform</strong> — 300ft/150ft in Natural Subsection</li>
                    <li><strong>Vision Plan Implementation</strong> — Greenway from source to confluence</li>
                </ul>

                <div class="highlight-box">
                    <strong>Toggle the setback layers</strong> in the left panel to see how policy shapes the landscape.
                </div>
            `
        }
    ];

    // Track layers before story mode
    let preStoryLayers = new Set();


    // ================================================================
    // INITIALIZATION
    // ================================================================

    function init() {
        setupMap();
        buildPanel();
        setupControls();
        setupStoryPanel();
        setupTransectIndicator();
    }




    // ================================================================
    // MAP SETUP
    // ================================================================

    function setupMap() {
        mapboxgl.accessToken = CONFIG.mapbox.accessToken;

        state.map = new mapboxgl.Map({
            container: 'map',
            style: CONFIG.mapbox.style,
            center: CONFIG.mapbox.center,
            zoom: CONFIG.mapbox.zoom - 1,
            minZoom: CONFIG.mapbox.minZoom,
            maxZoom: CONFIG.mapbox.maxZoom,
            pitch: CONFIG.mapbox.pitch,
            bearing: CONFIG.mapbox.bearing,
            attributionControl: true
        });

        // Add scale bar
        state.map.addControl(
            new mapboxgl.ScaleControl({ maxWidth: 120 }),
            'bottom-right'
        );

        // When map loads, activate default-on layers and special features
        state.map.on('load', () => {
            console.log('Map loaded');
            activateDefaultLayers();
            // addZoneLabels();         // Zone labels along creek - DISABLED per user request
            addBozemanCreekHighlight(); // Creek on TOP (last) - THE CREEK IS THE TRANSECT

            // Auto-show the story panel
            setTimeout(() => {
                showStoryPanel();
            }, 500);
        });

        // Click handler for querying layers
        state.map.on('click', handleMapClick);

        // Cursor change on hoverable features
        state.map.on('mousemove', handleMouseMove);
        state.map.on('mouseleave', () => {
            state.map.getCanvas().style.cursor = '';
        });
    }


    // ================================================================
    // LAYER PANEL
    // ================================================================

    function buildPanel() {
        const container = document.getElementById('layer-categories');
        container.innerHTML = '';

        CONFIG.categories.forEach(category => {
            const catEl = createCategoryElement(category);
            container.appendChild(catEl);
        });

        // Layer search (optional)
        const searchInput = document.getElementById('layer-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                filterLayers(e.target.value.toLowerCase().trim());
            });
        }
    }

    function createCategoryElement(category) {
        const div = document.createElement('div');
        div.className = 'layer-category';
        div.dataset.categoryId = category.id;

        // Header
        const header = document.createElement('button');
        header.className = `category-header${category.defaultOpen ? ' expanded' : ''}`;
        header.innerHTML = `
            <span class="category-icon ${category.iconClass}">${category.icon}</span>
            <span class="category-label">
                <span class="category-name">${category.name}</span>
                <span class="category-count">${category.layers.length} layer${category.layers.length !== 1 ? 's' : ''}</span>
            </span>
            <svg class="category-chevron" viewBox="0 0 18 18" fill="none">
                <path d="M7 4l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;

        // Category info button
        if (category.info) {
            const infoBtn = document.createElement('button');
            infoBtn.className = 'category-info-btn';
            infoBtn.innerHTML = `<svg viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M9 8v4M9 6v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
            infoBtn.title = `About ${category.name}`;
            infoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showCategoryInfo(category);
            });
            header.appendChild(infoBtn);
        }

        // Layer list
        const layerList = document.createElement('div');
        layerList.className = `category-layers${category.defaultOpen ? ' open' : ''}`;

        category.layers.forEach(layer => {
            const item = createLayerItem(layer, category);
            layerList.appendChild(item);
        });

        // Toggle category
        header.addEventListener('click', (e) => {
            if (e.target.closest('.category-info-btn')) return;
            header.classList.toggle('expanded');
            layerList.classList.toggle('open');
        });

        div.appendChild(header);
        div.appendChild(layerList);
        return div;
    }

    function createLayerItem(layer, category) {
        const item = document.createElement('div');
        item.className = 'layer-item';
        item.dataset.layerId = layer.id;

        item.innerHTML = `
            <label class="layer-toggle">
                <input type="checkbox" ${layer.defaultOn ? 'checked' : ''}>
                <span class="toggle-track"></span>
                <span class="toggle-thumb"></span>
            </label>
            <div class="layer-info">
                <span class="layer-name">${layer.name}</span>
                <span class="layer-desc">${layer.description}</span>
            </div>
            <button class="layer-info-btn" title="Layer info">
                <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v3.5M8 5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
            <span class="layer-swatch" style="background: ${layer.legendColor}"></span>
        `;

        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                addLayer(layer);
            } else {
                removeLayer(layer);
            }
            updateLegend();
        });

        // Layer info button
        const infoBtn = item.querySelector('.layer-info-btn');
        infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showLayerInfo(layer, category);
        });

        return item;
    }

    function filterLayers(query) {
        document.querySelectorAll('.layer-category').forEach(catEl => {
            const items = catEl.querySelectorAll('.layer-item');
            let anyVisible = false;

            items.forEach(item => {
                const name = item.querySelector('.layer-name').textContent.toLowerCase();
                const desc = item.querySelector('.layer-desc').textContent.toLowerCase();
                const match = !query || name.includes(query) || desc.includes(query);
                item.style.display = match ? '' : 'none';
                if (match) anyVisible = true;
            });

            catEl.style.display = anyVisible ? '' : 'none';

            if (query && anyVisible) {
                catEl.querySelector('.category-header').classList.add('expanded');
                catEl.querySelector('.category-layers').classList.add('open');
            }
        });
    }


    // ================================================================
    // LAYER MANAGEMENT
    // ================================================================

    function activateDefaultLayers() {
        CONFIG.categories.forEach(category => {
            category.layers.forEach(layer => {
                if (layer.defaultOn) {
                    addLayer(layer);
                }
            });
        });
        updateLegend();
    }

    function addLayer(layer) {
        if (!state.map || state.activeLayers.has(layer.id)) return;

        const sourceId = `source-${layer.id}`;
        const layerId = `layer-${layer.id}`;

        // Add source if not already loaded
        if (!state.loadedSources.has(sourceId)) {
            try {
                state.map.addSource(sourceId, {
                    type: 'geojson',
                    data: layer.source
                });
                state.loadedSources.add(sourceId);
            } catch (err) {
                console.warn(`Could not load source for ${layer.id}:`, err.message);
                return;
            }
        }

        // Add fill/line/circle layer based on type
        try {
            const layerDef = {
                id: layerId,
                type: layer.type,
                source: sourceId,
                paint: layer.style
            };

            // Apply filter if defined
            if (layer.filter) {
                layerDef.filter = layer.filter;
            }

            if (layer.type === 'fill') {
                state.map.addLayer(layerDef);

                if (layer.outlineStyle) {
                    const outlineDef = {
                        id: `${layerId}-outline`,
                        type: 'line',
                        source: sourceId,
                        paint: layer.outlineStyle
                    };
                    if (layer.filter) {
                        outlineDef.filter = layer.filter;
                    }
                    state.map.addLayer(outlineDef);
                }
            } else if (layer.type === 'line') {
                state.map.addLayer(layerDef);
            } else if (layer.type === 'circle') {
                state.map.addLayer(layerDef);
            } else if (layer.type === 'setback') {
                // Special setback buffer visualization - renders as wide line around Bozeman Creek
                addSetbackLayer(layer, sourceId, layerId);
            }

            state.activeLayers.add(layer.id);
        } catch (err) {
            console.warn(`Could not add layer ${layer.id}:`, err.message);
        }
    }

    // Add setback buffer visualization layer
    function addSetbackLayer(layer, sourceId, layerId) {
        if (!state.map) return;

        // Convert feet to approximate pixel width based on zoom
        // At zoom 14: ~1 pixel ≈ 9.5m, so 75ft(23m) ≈ 2.4px
        // We use interpolation to scale with zoom
        const ftToPixelBase = layer.setbackDistance / 30; // Base scaling factor

        // Filter for Bozeman Creek only
        const creekFilter = ['any',
            ['==', ['get', 'GCD_NAME'], 'BOZEMAN CREEK'],
            ['==', ['get', 'COM_NAME'], 'BOZEMAN CREEK']
        ];

        // Determine which layer to insert before (if creek highlight exists)
        const beforeLayer = state.map.getLayer('bozeman-creek-outer-glow') ? 'bozeman-creek-outer-glow' : undefined;

        // Add the setback buffer as a wide line
        state.map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            filter: creekFilter,
            paint: {
                'line-color': layer.style['line-color'],
                'line-width': [
                    'interpolate', ['exponential', 2], ['zoom'],
                    10, ftToPixelBase * 0.5,
                    12, ftToPixelBase * 1.2,
                    14, ftToPixelBase * 3,
                    16, ftToPixelBase * 8,
                    18, ftToPixelBase * 25
                ],
                'line-opacity': layer.style['line-opacity'] || 0.3,
                'line-blur': 2
            }
        }, beforeLayer);

        // Add dashed outline for the setback boundary
        state.map.addLayer({
            id: `${layerId}-outline`,
            type: 'line',
            source: sourceId,
            filter: creekFilter,
            paint: {
                'line-color': layer.style['line-color'],
                'line-width': 2.5,
                'line-opacity': 0.7,
                'line-dasharray': [4, 2],
                'line-offset': [
                    'interpolate', ['exponential', 2], ['zoom'],
                    10, ftToPixelBase * 0.25,
                    12, ftToPixelBase * 0.6,
                    14, ftToPixelBase * 1.5,
                    16, ftToPixelBase * 4,
                    18, ftToPixelBase * 12
                ]
            }
        }, beforeLayer);

        // Add label for the setback
        state.map.addLayer({
            id: `${layerId}-label`,
            type: 'symbol',
            source: sourceId,
            filter: creekFilter,
            layout: {
                'symbol-placement': 'line',
                'text-field': `${layer.setbackDistance}ft`,
                'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
                'text-size': 11,
                'text-max-angle': 30,
                'text-offset': [0, -2]
            },
            paint: {
                'text-color': layer.style['line-color'],
                'text-halo-color': 'rgba(255,255,255,0.95)',
                'text-halo-width': 2
            },
            minzoom: 12
        }, beforeLayer);
    }

    function removeLayer(layer) {
        if (!state.map || !state.activeLayers.has(layer.id)) return;

        const layerId = `layer-${layer.id}`;

        try {
            if (state.map.getLayer(layerId)) {
                state.map.removeLayer(layerId);
            }
            if (state.map.getLayer(`${layerId}-outline`)) {
                state.map.removeLayer(`${layerId}-outline`);
            }
            if (state.map.getLayer(`${layerId}-label`)) {
                state.map.removeLayer(`${layerId}-label`);
            }
        } catch (err) {
            console.warn(`Could not remove layer ${layer.id}:`, err.message);
        }

        state.activeLayers.delete(layer.id);
    }

    function getLayerConfig(layerId) {
        for (const cat of CONFIG.categories) {
            for (const layer of cat.layers) {
                if (layer.id === layerId) return { layer, category: cat };
            }
        }
        return null;
    }


    // ================================================================
    // MAP INTERACTION — Click to Query
    // ================================================================

    function handleMapClick(e) {
        const lngLat = e.lngLat;
        const point = e.point;

        // Close any existing popup
        if (state.currentPopup) {
            state.currentPopup.remove();
            state.currentPopup = null;
        }

        // Query all visible layers at this point
        const activeLayerIds = [];
        state.activeLayers.forEach(id => {
            const mapLayerId = `layer-${id}`;
            if (state.map.getLayer(mapLayerId)) {
                activeLayerIds.push(mapLayerId);
            }
        });

        if (activeLayerIds.length === 0) {
            hideQueryPanel();
            return;
        }

        const features = state.map.queryRenderedFeatures(point, {
            layers: activeLayerIds
        });

        if (features.length > 0) {
            showDetailPanel(features, lngLat);
            detectZoneFromFeatures(features, lngLat);
        } else {
            hideQueryPanel();
            updateTransectFromLocation(lngLat);
        }
    }

    function detectZoneFromFeatures(features, lngLat) {
        // Try to detect zone from zoning features
        for (const feature of features) {
            const props = feature.properties;

            // Check for city zoning
            if (props.ZONING || props.Zoning || props.ZONE) {
                const zoning = (props.ZONING || props.Zoning || props.ZONE || '').toUpperCase();

                // City of Bozeman zoning codes
                if (zoning.includes('B-3') || zoning.includes('B-2A') || zoning.includes('NEHMU')) {
                    highlightTransectZone('core');
                    return;
                } else if (zoning.includes('B-2') || zoning.includes('B-1') || zoning.includes('UMU')) {
                    highlightTransectZone('center');
                    return;
                } else if (zoning.includes('R-4') || zoning.includes('R-3') || zoning.includes('R-O')) {
                    highlightTransectZone('general');
                    return;
                } else if (zoning.includes('R-2') || zoning.includes('R-1') || zoning.includes('RS')) {
                    highlightTransectZone('suburban');
                    return;
                } else if (zoning.includes('RR') || zoning.includes('A')) {
                    highlightTransectZone('rural');
                    return;
                }
            }

            // Check for county planning districts
            if (props.DISTRICT_N || props.District) {
                const district = (props.DISTRICT_N || props.District || '').toUpperCase();

                if (district.includes('HYALITE')) {
                    highlightTransectZone('natural');
                    return;
                } else if (district.includes('BOZEMAN')) {
                    highlightTransectZone('suburban');
                    return;
                }
            }
        }

        // Fallback to location-based detection
        updateTransectFromLocation(lngLat);
    }

    function showDetailPanel(features, lngLat) {
        const panel = document.getElementById('query-panel');
        const content = document.getElementById('query-content');

        // Header with coordinates
        let html = `
            <div class="query-coords">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <path d="M8 1.5v13M1.5 8h13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                ${lngLat.lat.toFixed(5)}°N, ${Math.abs(lngLat.lng).toFixed(5)}°W
            </div>
        `;

        // Group features by layer
        const grouped = {};
        features.forEach(feature => {
            const layerId = feature.layer.id.replace('layer-', '').replace('-outline', '');
            const config = getLayerConfig(layerId);
            if (!config) return;

            if (!grouped[layerId]) {
                grouped[layerId] = {
                    layer: config.layer,
                    category: config.category,
                    features: []
                };
            }
            // Avoid duplicates
            const existing = grouped[layerId].features.find(f =>
                JSON.stringify(f.properties) === JSON.stringify(feature.properties)
            );
            if (!existing) {
                grouped[layerId].features.push(feature);
            }
        });

        // Render each layer's features
        for (const [layerId, data] of Object.entries(grouped)) {
            const { layer, category, features } = data;

            html += `<div class="detail-section">`;
            html += `<div class="detail-header">
                <span class="detail-swatch" style="background: ${layer.legendColor}"></span>
                <span class="detail-layer-name">${layer.name}</span>
                <span class="detail-category">${category.name}</span>
            </div>`;

            // Show feature-specific info
            features.forEach((feature, idx) => {
                const props = feature.properties;
                const popup = layer.popup;

                if (popup) {
                    const title = props[popup.titleField] || layer.name;
                    html += `<div class="detail-feature ${idx > 0 ? 'detail-feature-border' : ''}">`;
                    html += `<div class="detail-feature-title">${title}</div>`;

                    if (popup.fields && popup.fields.length > 0) {
                        html += `<div class="detail-feature-props">`;
                        popup.fields.forEach(field => {
                            if (props[field.key] && props[field.key] !== 'null') {
                                html += `<div class="detail-prop">
                                    <span class="detail-prop-label">${field.label}</span>
                                    <span class="detail-prop-value">${props[field.key]}</span>
                                </div>`;
                            }
                        });
                        html += `</div>`;
                    }
                    html += `</div>`;
                }
            });

            // Show layer context info (detailPanel)
            if (layer.detailPanel) {
                html += `<div class="detail-context">`;
                html += `<p class="detail-context-desc">${layer.detailPanel.description}</p>`;

                if (layer.detailPanel.actions && layer.detailPanel.actions.length > 0) {
                    html += `<div class="detail-actions">`;
                    layer.detailPanel.actions.forEach(action => {
                        html += `<a href="${action.url}" target="_blank" class="detail-action-link">
                            ${action.label}
                            <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                                <path d="M5 11l6-6M5 5h6v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </a>`;
                    });
                    html += `</div>`;
                }
                html += `</div>`;
            }

            html += `</div>`;
        }

        content.innerHTML = html;
        panel.classList.remove('hidden');
    }

    function showLayerInfo(layer, category) {
        const panel = document.getElementById('query-panel');
        const content = document.getElementById('query-content');
        const header = document.querySelector('#query-panel .query-header h3');
        header.textContent = 'Layer Information';

        let html = `
            <div class="layer-info-panel">
                <div class="detail-header">
                    <span class="detail-swatch" style="background: ${layer.legendColor}"></span>
                    <span class="detail-layer-name">${layer.name}</span>
                </div>
                <p class="layer-info-desc">${layer.description}</p>
        `;

        if (layer.detailPanel) {
            html += `<div class="detail-context">
                <p class="detail-context-desc">${layer.detailPanel.description}</p>`;

            if (layer.detailPanel.actions && layer.detailPanel.actions.length > 0) {
                html += `<div class="detail-actions">`;
                layer.detailPanel.actions.forEach(action => {
                    html += `<a href="${action.url}" target="_blank" class="detail-action-link">
                        ${action.label}
                        <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                            <path d="M5 11l6-6M5 5h6v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>`;
                });
                html += `</div>`;
            }
            html += `</div>`;
        }

        if (layer.popup && layer.popup.fields) {
            html += `<div class="layer-info-fields">
                <span class="layer-info-label">Available data:</span>
                ${layer.popup.fields.map(f => f.label).join(', ')}
            </div>`;
        }

        html += `</div>`;

        content.innerHTML = html;
        panel.classList.remove('hidden');
    }

    function showCategoryInfo(category) {
        const panel = document.getElementById('query-panel');
        const content = document.getElementById('query-content');
        const header = document.querySelector('#query-panel .query-header h3');
        header.textContent = category.info.title;

        let html = `
            <div class="category-info-panel">
                <div class="category-info-header">
                    <span class="category-icon ${category.iconClass}">${category.icon}</span>
                    <span class="category-info-name">${category.name}</span>
                </div>
                <p class="category-info-desc">${category.info.description}</p>
        `;

        if (category.info.resources && category.info.resources.length > 0) {
            html += `<div class="category-resources">
                <span class="category-resources-label">Learn more:</span>
                <div class="detail-actions">`;
            category.info.resources.forEach(res => {
                html += `<a href="${res.url}" target="_blank" class="detail-action-link">
                    ${res.label}
                    <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                        <path d="M5 11l6-6M5 5h6v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>`;
            });
            html += `</div></div>`;
        }

        html += `<div class="category-layers-list">
            <span class="category-layers-label">Layers in this category:</span>
            <ul>`;
        category.layers.forEach(layer => {
            html += `<li>
                <span class="layer-swatch-small" style="background: ${layer.legendColor}"></span>
                ${layer.name}
            </li>`;
        });
        html += `</ul></div></div>`;

        content.innerHTML = html;
        panel.classList.remove('hidden');
    }

    function hideQueryPanel() {
        document.getElementById('query-panel').classList.add('hidden');
        const header = document.querySelector('#query-panel .query-header h3');
        header.textContent = 'Location Details';
    }

    function handleMouseMove(e) {
        const activeLayerIds = [];
        state.activeLayers.forEach(id => {
            activeLayerIds.push(`layer-${id}`);
        });

        if (activeLayerIds.length === 0) return;

        const features = state.map.queryRenderedFeatures(e.point, {
            layers: activeLayerIds
        });

        state.map.getCanvas().style.cursor = features.length > 0 ? 'pointer' : '';
    }


    // ================================================================
    // LEGEND
    // ================================================================

    function updateLegend() {
        const legend = document.getElementById('legend');
        const content = document.getElementById('legend-content');

        if (state.activeLayers.size === 0) {
            legend.classList.add('hidden');
            return;
        }

        let html = '';
        state.activeLayers.forEach(id => {
            const config = getLayerConfig(id);
            if (!config) return;

            const layer = config.layer;
            const swatchClass = layer.type === 'line' ? 'line' :
                                layer.type === 'fill' ? 'fill' : '';

            html += `
                <div class="legend-item">
                    <span class="legend-swatch ${swatchClass}" style="background: ${layer.legendColor}"></span>
                    <span class="legend-label">${layer.name}</span>
                </div>
            `;
        });

        content.innerHTML = html;
        legend.classList.remove('hidden');
    }


    // ================================================================
    // CONTROLS
    // ================================================================

    function setupControls() {
        // Zoom controls
        document.getElementById('btn-zoom-in').addEventListener('click', () => {
            state.map.zoomIn();
        });

        document.getElementById('btn-zoom-out').addEventListener('click', () => {
            state.map.zoomOut();
        });

        // Reset view
        document.getElementById('btn-reset-view').addEventListener('click', () => {
            state.map.flyTo({
                center: CONFIG.mapbox.center,
                zoom: CONFIG.mapbox.zoom,
                duration: 1200,
                essential: true
            });
        });

        // Panel toggle
        document.getElementById('panel-toggle').addEventListener('click', () => {
            const panel = document.getElementById('panel');
            panel.classList.toggle('collapsed');
            state.panelOpen = !state.panelOpen;
            setTimeout(() => state.map.resize(), 300);
        });

        // Query panel close
        document.getElementById('query-close').addEventListener('click', hideQueryPanel);

        // Legend close
        document.getElementById('legend-close').addEventListener('click', () => {
            document.getElementById('legend').classList.add('hidden');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideQueryPanel();
                hideStoryPanel();
            }
        });

        // Story button
        document.getElementById('btn-story').addEventListener('click', () => {
            toggleStoryPanel();
        });
    }


    // ================================================================
    // STORY PANEL
    // ================================================================

    function setupStoryPanel() {
        // Navigation buttons
        document.getElementById('story-prev').addEventListener('click', () => {
            if (state.storyIndex > 0) {
                state.storyIndex--;
                renderStoryChapter();
            }
        });

        document.getElementById('story-next').addEventListener('click', () => {
            if (state.storyIndex < STORY_CHAPTERS.length - 1) {
                state.storyIndex++;
                renderStoryChapter();
            }
        });
    }

    function toggleStoryPanel() {
        // Story panel is always visible - this just resets to beginning
        state.storyIndex = 0;
        renderStoryChapter();
    }

    function showStoryPanel() {
        state.storyOpen = true;
        state.storyIndex = 0;

        // Save current layer state
        preStoryLayers = new Set(state.activeLayers);

        renderStoryChapter();
    }

    function hideStoryPanel() {
        // Story panel is always visible now - this just clears the highlight
        clearTransectHighlight();
    }

    function restorePreStoryLayers() {
        // Turn off all current layers
        const currentLayers = new Set(state.activeLayers);
        currentLayers.forEach(layerId => {
            const config = getLayerConfig(layerId);
            if (config) {
                removeLayer(config.layer);
                updateLayerCheckbox(layerId, false);
            }
        });

        // Turn on pre-story layers
        preStoryLayers.forEach(layerId => {
            const config = getLayerConfig(layerId);
            if (config) {
                addLayer(config.layer);
                updateLayerCheckbox(layerId, true);
            }
        });

        updateLegend();
    }

    function updateLayerCheckbox(layerId, checked) {
        const item = document.querySelector(`.layer-item[data-layer-id="${layerId}"]`);
        if (item) {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = checked;
        }
    }

    function setStoryLayers(layerIds) {
        if (!layerIds || !state.map) return;

        // Get all layer configs
        const allLayers = [];
        CONFIG.categories.forEach(cat => {
            cat.layers.forEach(layer => allLayers.push(layer));
        });

        // Turn off layers not in the story chapter
        const currentLayers = new Set(state.activeLayers);
        currentLayers.forEach(layerId => {
            if (!layerIds.includes(layerId)) {
                const config = getLayerConfig(layerId);
                if (config) {
                    removeLayer(config.layer);
                    updateLayerCheckbox(layerId, false);
                }
            }
        });

        // Turn on story layers
        layerIds.forEach(layerId => {
            const config = getLayerConfig(layerId);
            if (config && !state.activeLayers.has(layerId)) {
                addLayer(config.layer);
                updateLayerCheckbox(layerId, true);
            }
        });

        updateLegend();
    }

    function renderStoryChapter() {
        const chapter = STORY_CHAPTERS[state.storyIndex];

        // Update title
        document.getElementById('story-title').textContent = chapter.title;

        // Update content
        document.getElementById('story-content').innerHTML = chapter.content;

        // Update progress
        document.getElementById('story-progress').textContent =
            `${state.storyIndex + 1} / ${STORY_CHAPTERS.length}`;

        // Update navigation buttons
        document.getElementById('story-prev').disabled = state.storyIndex === 0;
        document.getElementById('story-next').disabled = state.storyIndex === STORY_CHAPTERS.length - 1;

        // Update transect slider position
        updateTransectSlider(state.storyIndex);

        // Set the story layers
        if (chapter.layers) {
            setStoryLayers(chapter.layers);
        }

        // Fly to location if specified
        if (chapter.flyTo && state.map) {
            state.map.flyTo({
                ...chapter.flyTo,
                duration: 2000,
                essential: true
            });
        }

        // Highlight transect zone
        if (chapter.zone) {
            highlightTransectZone(chapter.zone);
        } else {
            clearTransectHighlight();
        }
    }


    // ================================================================
    // TRANSECT SLIDER
    // ================================================================

    function setupTransectIndicator() {
        // The transect zone segments
        const segments = document.querySelectorAll('.transect-zone-segment');

        segments.forEach(segment => {
            segment.addEventListener('click', () => {
                const index = parseInt(segment.dataset.index);
                // Map segment index to story chapter (skip intro chapter 0)
                const chapterIndex = index + 1;
                if (chapterIndex < STORY_CHAPTERS.length) {
                    state.storyIndex = chapterIndex;
                    if (!state.storyOpen) {
                        showStoryPanel();
                    }
                    renderStoryChapter();
                }
            });
        });
    }

    function updateTransectSlider(chapterIndex) {
        const segments = document.querySelectorAll('.transect-zone-segment');
        const thumb = document.getElementById('transect-thumb');
        const label = document.getElementById('transect-label');

        // Clear all active states
        segments.forEach(s => s.classList.remove('active'));

        // For intro (0) and conclusion (last), don't highlight a specific segment
        if (chapterIndex === 0) {
            label.textContent = 'Click a zone to explore';
            thumb.style.opacity = '0';
            return;
        }

        if (chapterIndex >= STORY_CHAPTERS.length - 1) {
            label.textContent = 'Explore the map';
            thumb.style.opacity = '0';
            return;
        }

        // Map chapter index to segment (chapter 1 = segment 0, etc)
        const segmentIndex = chapterIndex - 1;
        const activeSegment = segments[segmentIndex];

        if (activeSegment) {
            activeSegment.classList.add('active');

            // Position the thumb
            const track = document.querySelector('.transect-slider-track');
            const trackWidth = track.offsetWidth;
            const segmentWidth = trackWidth / segments.length;
            const thumbPos = (segmentIndex * segmentWidth) + (segmentWidth / 2) - 3;

            thumb.style.left = `${thumbPos}px`;
            thumb.style.opacity = '1';

            // Update label
            const chapter = STORY_CHAPTERS[chapterIndex];
            label.textContent = chapter.title;
        }
    }

    function highlightTransectZone(zoneName) {
        const segments = document.querySelectorAll('.transect-zone-segment');
        const label = document.getElementById('transect-label');

        // Map old zone names to new 4-zone system
        const zoneMapping = {
            natural: 'natural',
            rural: 'rural',
            suburban: 'suburban',
            general: 'suburban',  // Map to suburban
            center: 'core',       // Map to core
            core: 'core'
        };
        const mappedZone = zoneMapping[zoneName] || zoneName;

        segments.forEach(segment => {
            if (segment.dataset.zone === mappedZone) {
                segment.classList.add('active');
            } else {
                segment.classList.remove('active');
            }
        });

        // Update label
        const labelMap = {
            natural: 'Natural Zone — Hyalite Headwaters',
            rural: 'Rural Zone — County Jurisdiction',
            suburban: 'Suburban Zone — City',
            core: 'Urban Core — Downtown Bozeman'
        };
        label.textContent = labelMap[mappedZone] || 'Follow Bozeman Creek';
    }

    function clearTransectHighlight() {
        document.querySelectorAll('.transect-zone-segment').forEach(segment => {
            segment.classList.remove('active');
        });
        document.getElementById('transect-label').textContent = 'Click "Story" to explore';
        const thumb = document.getElementById('transect-thumb');
        if (thumb) thumb.style.opacity = '0';
    }

    // Update transect based on map location (follows Bozeman Creek from south to north)
    function updateTransectFromLocation(lngLat) {
        const lat = lngLat.lat;

        let zone;
        if (lat < 45.58) {
            zone = 'natural';     // Hyalite headwaters / wilderness area
        } else if (lat < 45.66) {
            zone = 'rural';       // Base of mountains to outer city (county jurisdiction)
        } else if (lat < 45.68) {
            zone = 'suburban';    // Sourdough/Kagy area - city annexation
        } else {
            zone = 'core';        // Downtown Bozeman
        }

        highlightTransectZone(zone);
    }


    // ================================================================
    // BOZEMAN CREEK HIGHLIGHT - Always on top in bright cyan
    // ================================================================

    function addBozemanCreekHighlight() {
        if (!state.map) return;

        // Add Bozeman Creek as a special highlighted layer
        // Use filter to show only Bozeman Creek from the streams data
        state.map.addSource('bozeman-creek-source', {
            type: 'geojson',
            data: 'data/gallatin_streams.geojson'
        });

        // Subtle outer glow - soft water blue
        state.map.addLayer({
            id: 'bozeman-creek-outer-glow',
            type: 'line',
            source: 'bozeman-creek-source',
            filter: ['any',
                ['==', ['get', 'GCD_NAME'], 'BOZEMAN CREEK'],
                ['==', ['get', 'COM_NAME'], 'BOZEMAN CREEK']
            ],
            paint: {
                'line-color': '#4a90a4',
                'line-width': ['interpolate', ['linear'], ['zoom'], 10, 6, 14, 12, 18, 20],
                'line-opacity': 0.15,
                'line-blur': 4
            }
        });

        // Main creek line - deeper blue, prominent but not glaring
        state.map.addLayer({
            id: 'bozeman-creek-highlight',
            type: 'line',
            source: 'bozeman-creek-source',
            filter: ['any',
                ['==', ['get', 'GCD_NAME'], 'BOZEMAN CREEK'],
                ['==', ['get', 'COM_NAME'], 'BOZEMAN CREEK']
            ],
            paint: {
                'line-color': '#2d6a8a',
                'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2.5, 14, 4, 18, 7],
                'line-opacity': 0.9
            }
        });

        // Light center line for definition
        state.map.addLayer({
            id: 'bozeman-creek-center',
            type: 'line',
            source: 'bozeman-creek-source',
            filter: ['any',
                ['==', ['get', 'GCD_NAME'], 'BOZEMAN CREEK'],
                ['==', ['get', 'COM_NAME'], 'BOZEMAN CREEK']
            ],
            paint: {
                'line-color': '#7ec8e3',
                'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.8, 14, 1.5, 18, 2.5],
                'line-opacity': 0.7
            }
        });

        // Creek label
        state.map.addLayer({
            id: 'bozeman-creek-label',
            type: 'symbol',
            source: 'bozeman-creek-source',
            filter: ['any',
                ['==', ['get', 'GCD_NAME'], 'BOZEMAN CREEK'],
                ['==', ['get', 'COM_NAME'], 'BOZEMAN CREEK']
            ],
            layout: {
                'symbol-placement': 'line',
                'text-field': 'Bozeman Creek',
                'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
                'text-size': 12,
                'text-letter-spacing': 0.05,
                'text-max-angle': 30,
                'text-allow-overlap': false
            },
            paint: {
                'text-color': '#1a4a5e',
                'text-halo-color': 'rgba(255,255,255,0.9)',
                'text-halo-width': 2
            },
            minzoom: 12
        });

        // Add culvert/underground section overlay (approximate downtown location)
        addCulvertOverlay();
    }

    function addCulvertOverlay() {
        if (!state.map) return;

        // Approximate culvert section coordinates in downtown Bozeman
        // These are estimated locations where Bozeman Creek goes underground
        const culvertCoords = [
            [-111.0395, 45.6795],
            [-111.0385, 45.6785],
            [-111.0378, 45.6775]
        ];

        state.map.addSource('culvert-section-source', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: culvertCoords
                }
            }
        });

        // Dashed orange line for culvert section
        state.map.addLayer({
            id: 'culvert-section',
            type: 'line',
            source: 'culvert-section-source',
            paint: {
                'line-color': '#ff6d00',
                'line-width': ['interpolate', ['linear'], ['zoom'], 14, 4, 18, 8],
                'line-dasharray': [2, 2],
                'line-opacity': 0.9
            },
            minzoom: 14
        });

        // Label for culvert section
        state.map.addLayer({
            id: 'culvert-section-label',
            type: 'symbol',
            source: 'culvert-section-source',
            layout: {
                'symbol-placement': 'line',
                'text-field': 'UNDERGROUND',
                'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
                'text-size': 10,
                'text-letter-spacing': 0.1,
                'text-max-angle': 30
            },
            paint: {
                'text-color': '#e65100',
                'text-halo-color': 'rgba(255,255,255,0.9)',
                'text-halo-width': 2
            },
            minzoom: 15
        });
    }


    // ================================================================
    // ZONE LABELS - On-map labels for governance zones
    // ================================================================

    // Zone labels positioned along Bozeman Creek (to the right of the creek)
    const ZONE_LABEL_POSITIONS = [
        { id: 'natural', text: 'NATURAL', coords: [-110.98, 45.42], color: '#1e4d2b' },
        { id: 'rural', text: 'RURAL', coords: [-110.97, 45.55], color: '#2d6a4f' },
        { id: 'suburban', text: 'SUBURBAN', coords: [-110.96, 45.64], color: '#52b788' },
        { id: 'core', text: 'URBAN CORE', coords: [-110.96, 45.69], color: '#e76f51', highlight: true }
    ];

    function addZoneLabels() {
        if (!state.map) return;

        // Create GeoJSON for zone labels
        const zoneLabelData = {
            type: 'FeatureCollection',
            features: ZONE_LABEL_POSITIONS.map(zone => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: zone.coords
                },
                properties: {
                    id: zone.id,
                    text: zone.text,
                    color: zone.color,
                    highlight: zone.highlight ? 1 : 0
                }
            }))
        };

        state.map.addSource('zone-labels-source', {
            type: 'geojson',
            data: zoneLabelData
        });

        // Zone label text with halo (like mockup - tan/beige boxes with dark text)
        state.map.addLayer({
            id: 'zone-label-text',
            type: 'symbol',
            source: 'zone-labels-source',
            layout: {
                'text-field': ['get', 'text'],
                'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
                'text-size': ['case', ['==', ['get', 'highlight'], 1], 14, 12],
                'text-anchor': 'left',
                'text-justify': 'left',
                'text-allow-overlap': true,
                'text-ignore-placement': true
            },
            paint: {
                'text-color': ['case',
                    ['==', ['get', 'highlight'], 1], '#6a1b9a',  // Purple for highlighted
                    '#5d4037'  // Brown for others
                ],
                'text-halo-color': ['case',
                    ['==', ['get', 'highlight'], 1], '#ffeb3b',  // Yellow highlight
                    '#f5deb3'  // Tan/wheat background
                ],
                'text-halo-width': 4,
                'text-halo-blur': 0
            }
        });
    }


    // ================================================================
    // BOOT
    // ================================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
