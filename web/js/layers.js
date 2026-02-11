/**
 * Layer Management Module
 * Handles layer activation, removal, and configuration
 */

export const LayerManager = {
    /**
     * Add a layer to the map
     * @param {Object} layer - Layer configuration object
     * @param {Object} map - Mapbox map instance
     * @param {Set} activeLayers - Set of active layer IDs
     * @param {Set} loadedSources - Set of loaded source IDs
     */
    addLayer(layer, map, activeLayers, loadedSources) {
        if (!map || !layer) return;

        const sourceId = `source-${layer.id}`;
        const layerId = `layer-${layer.id}`;
        const outlineId = `layer-${layer.id}-outline`;

        // Add source if not already added
        if (!loadedSources.has(sourceId)) {
            map.addSource(sourceId, {
                type: 'geojson',
                data: layer.source
            });
            loadedSources.add(sourceId);
        }

        // Add the layer if not already on map
        if (!map.getLayer(layerId)) {
            const layerConfig = {
                id: layerId,
                source: sourceId,
                type: layer.type,
                paint: layer.style,
                minzoom: layer.minzoom || 0,
                maxzoom: layer.maxzoom || 22
            };

            // Add filter if specified
            if (layer.filter) {
                layerConfig.filter = layer.filter;
            }

            // Insert before Bozeman Creek highlight if it exists
            const beforeLayer = map.getLayer('bozeman-creek-outer-glow') ? 'bozeman-creek-outer-glow' : undefined;
            map.addLayer(layerConfig, beforeLayer);

            // Add outline if specified
            if (layer.outlineStyle) {
                map.addLayer({
                    id: outlineId,
                    source: sourceId,
                    type: 'line',
                    paint: layer.outlineStyle,
                    minzoom: layer.minzoom || 0,
                    maxzoom: layer.maxzoom || 22
                }, beforeLayer);
            }
        }

        activeLayers.add(layer.id);
    },

    /**
     * Remove a layer from the map
     * @param {Object} layer - Layer configuration object
     * @param {Object} map - Mapbox map instance
     * @param {Set} activeLayers - Set of active layer IDs
     */
    removeLayer(layer, map, activeLayers) {
        if (!map || !layer) return;

        const layerId = `layer-${layer.id}`;
        const outlineId = `layer-${layer.id}-outline`;

        if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
        }

        if (map.getLayer(outlineId)) {
            map.removeLayer(outlineId);
        }

        activeLayers.delete(layer.id);
    },

    /**
     * Get layer configuration by ID
     * @param {string} layerId - Layer ID
     * @param {Array} categories - CONFIG.categories array
     * @returns {Object|null} Layer config with category
     */
    getLayerConfig(layerId, categories) {
        for (const category of categories) {
            for (const layer of category.layers) {
                if (layer.id === layerId) {
                    return { layer, category };
                }
            }
        }
        return null;
    },

    /**
     * Activate default layers
     * @param {Array} categories - CONFIG.categories array
     * @param {Object} map - Mapbox map instance
     * @param {Set} activeLayers - Set of active layer IDs
     * @param {Set} loadedSources - Set of loaded source IDs
     */
    activateDefaultLayers(categories, map, activeLayers, loadedSources) {
        categories.forEach(category => {
            category.layers.forEach(layer => {
                if (layer.defaultOn) {
                    this.addLayer(layer, map, activeLayers, loadedSources);
                }
            });
        });
    },

    /**
     * Update layer checkbox state in UI
     * @param {string} layerId - Layer ID
     * @param {boolean} checked - Checked state
     */
    updateLayerCheckbox(layerId, checked) {
        const item = document.querySelector(`.layer-item[data-layer-id="${layerId}"]`);
        if (item) {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = checked;
        }
    }
};
