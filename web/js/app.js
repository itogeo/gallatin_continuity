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
        currentPopup: null
    };


    // ================================================================
    // INITIALIZATION
    // ================================================================

    function init() {
        setupWelcome();
        setupMap();
        buildPanel();
        setupControls();
    }


    // ================================================================
    // WELCOME OVERLAY
    // ================================================================

    function setupWelcome() {
        const overlay = document.getElementById('welcome-overlay');
        const enterBtn = document.getElementById('welcome-enter');

        enterBtn.addEventListener('click', () => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.style.display = 'none';
                if (state.map) {
                    state.map.flyTo({
                        center: CONFIG.mapbox.center,
                        zoom: CONFIG.mapbox.zoom,
                        duration: 2000,
                        essential: true
                    });
                }
            }, 400);
        });
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

        // When map loads, activate default-on layers
        state.map.on('load', () => {
            console.log('Map loaded');
            activateDefaultLayers();
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

        // Layer search
        const searchInput = document.getElementById('layer-search');
        searchInput.addEventListener('input', (e) => {
            filterLayers(e.target.value.toLowerCase().trim());
        });
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
            if (layer.type === 'fill') {
                state.map.addLayer({
                    id: layerId,
                    type: 'fill',
                    source: sourceId,
                    paint: layer.style
                });

                if (layer.outlineStyle) {
                    state.map.addLayer({
                        id: `${layerId}-outline`,
                        type: 'line',
                        source: sourceId,
                        paint: layer.outlineStyle
                    });
                }
            } else if (layer.type === 'line') {
                state.map.addLayer({
                    id: layerId,
                    type: 'line',
                    source: sourceId,
                    paint: layer.style
                });
            } else if (layer.type === 'circle') {
                state.map.addLayer({
                    id: layerId,
                    type: 'circle',
                    source: sourceId,
                    paint: layer.style
                });
            }

            state.activeLayers.add(layer.id);
        } catch (err) {
            console.warn(`Could not add layer ${layer.id}:`, err.message);
        }
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
        } else {
            hideQueryPanel();
        }
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

        // About button
        document.getElementById('btn-about').addEventListener('click', () => {
            const overlay = document.getElementById('welcome-overlay');
            overlay.style.display = 'flex';
            overlay.classList.remove('fade-out');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideQueryPanel();
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
