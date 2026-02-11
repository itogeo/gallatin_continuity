/**
 * Story Mode Module
 * Handles narrative chapters, story panel, and guided tours
 */

export const StoryManager = {
    storyIndex: 0,
    storyOpen: false,
    preStoryLayers: new Set(),

    /**
     * Setup story panel navigation
     * @param {Array} chapters - STORY_CHAPTERS array
     * @param {Function} renderCallback - Callback to render chapter
     */
    setupStoryPanel(chapters, renderCallback) {
        // Navigation buttons
        document.getElementById('story-prev')?.addEventListener('click', () => {
            if (this.storyIndex > 0) {
                this.storyIndex--;
                renderCallback(this.storyIndex);
            }
        });

        document.getElementById('story-next')?.addEventListener('click', () => {
            if (this.storyIndex < chapters.length - 1) {
                this.storyIndex++;
                renderCallback(this.storyIndex);
            }
        });

        // Mobile: tap story header to collapse/expand
        const storyHeader = document.querySelector('.story-header');
        const storyPanel = document.getElementById('story-panel');
        let isCollapsed = false;

        if (storyHeader && window.innerWidth <= 768) {
            storyHeader.addEventListener('click', (e) => {
                // Don't collapse if clicking navigation buttons
                if (e.target.closest('.story-nav-btn')) return;

                isCollapsed = !isCollapsed;
                if (isCollapsed) {
                    storyPanel.style.maxHeight = '60px';
                    storyPanel.style.overflow = 'hidden';
                } else {
                    storyPanel.style.maxHeight = '60vh';
                    storyPanel.style.overflow = 'auto';
                }
            });
        }

        // Re-check on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                storyPanel.style.maxHeight = '';
                storyPanel.style.overflow = '';
                isCollapsed = false;
            }
        });
    },

    /**
     * Show story panel
     * @param {Set} activeLayers - Current active layers
     */
    showStoryPanel(activeLayers) {
        this.storyOpen = true;
        this.storyIndex = 0;
        // Save current layer state
        this.preStoryLayers = new Set(activeLayers);
    },

    /**
     * Render story chapter
     * @param {number} index - Chapter index
     * @param {Array} chapters - STORY_CHAPTERS array
     * @param {Object} map - Mapbox map instance
     * @param {Function} setLayersCallback - Callback to set story layers
     * @param {Function} highlightZoneCallback - Callback to highlight zone
     * @param {Function} clearHighlightCallback - Callback to clear highlight
     * @param {Function} updateSliderCallback - Callback to update slider
     */
    renderStoryChapter(index, chapters, map, setLayersCallback, highlightZoneCallback, clearHighlightCallback, updateSliderCallback) {
        const chapter = chapters[index];
        if (!chapter) return;

        // Update title
        const titleEl = document.getElementById('story-title');
        if (titleEl) titleEl.textContent = chapter.title;

        // Update content
        const contentEl = document.getElementById('story-content');
        if (contentEl) contentEl.innerHTML = chapter.content;

        // Update progress
        const progressEl = document.getElementById('story-progress');
        if (progressEl) progressEl.textContent = `${index + 1} / ${chapters.length}`;

        // Update navigation buttons
        const prevBtn = document.getElementById('story-prev');
        const nextBtn = document.getElementById('story-next');
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === chapters.length - 1;

        // Update transect slider position
        if (updateSliderCallback) updateSliderCallback(index);

        // Set the story layers
        if (chapter.layers && setLayersCallback) {
            setLayersCallback(chapter.layers);
        }

        // Fly to location if specified
        if (chapter.flyTo && map) {
            map.flyTo({
                ...chapter.flyTo,
                duration: 2000,
                essential: true
            });
        }

        // Highlight transect zone
        if (chapter.zone && highlightZoneCallback) {
            highlightZoneCallback(chapter.zone);
        } else if (clearHighlightCallback) {
            clearHighlightCallback();
        }
    },

    /**
     * Set story-specific layers
     * @param {Array} layerIds - Array of layer IDs to show
     * @param {Set} activeLayers - Set of active layer IDs
     * @param {Function} getConfigCallback - Callback to get layer config
     * @param {Function} addLayerCallback - Callback to add layer
     * @param {Function} removeLayerCallback - Callback to remove layer
     * @param {Function} updateCheckboxCallback - Callback to update checkbox
     * @param {Function} updateLegendCallback - Callback to update legend
     */
    setStoryLayers(layerIds, activeLayers, getConfigCallback, addLayerCallback, removeLayerCallback, updateCheckboxCallback, updateLegendCallback) {
        if (!layerIds) return;

        // Turn off layers not in the story chapter
        const currentLayers = new Set(activeLayers);
        currentLayers.forEach(layerId => {
            if (!layerIds.includes(layerId)) {
                const config = getConfigCallback(layerId);
                if (config) {
                    removeLayerCallback(config.layer);
                    updateCheckboxCallback(layerId, false);
                }
            }
        });

        // Turn on story layers
        layerIds.forEach(layerId => {
            const config = getConfigCallback(layerId);
            if (config && !activeLayers.has(layerId)) {
                addLayerCallback(config.layer);
                updateCheckboxCallback(layerId, true);
            }
        });

        if (updateLegendCallback) updateLegendCallback();
    },

    /**
     * Restore pre-story layer state
     * @param {Set} activeLayers - Current active layers
     * @param {Function} getConfigCallback - Callback to get layer config
     * @param {Function} addLayerCallback - Callback to add layer
     * @param {Function} removeLayerCallback - Callback to remove layer
     * @param {Function} updateCheckboxCallback - Callback to update checkbox
     * @param {Function} updateLegendCallback - Callback to update legend
     */
    restorePreStoryLayers(activeLayers, getConfigCallback, addLayerCallback, removeLayerCallback, updateCheckboxCallback, updateLegendCallback) {
        // Turn off all current layers
        const currentLayers = new Set(activeLayers);
        currentLayers.forEach(layerId => {
            const config = getConfigCallback(layerId);
            if (config) {
                removeLayerCallback(config.layer);
                updateCheckboxCallback(layerId, false);
            }
        });

        // Turn on pre-story layers
        this.preStoryLayers.forEach(layerId => {
            const config = getConfigCallback(layerId);
            if (config) {
                addLayerCallback(config.layer);
                updateCheckboxCallback(layerId, true);
            }
        });

        if (updateLegendCallback) updateLegendCallback();
    }
};
