/**
 * Gallatin Continuity — Layer Configuration
 *
 * All layer definitions, categories, styles, and metadata.
 * Adding a new layer = adding an entry here + dropping the GeoJSON in web/data/.
 */

const CONFIG = {

    // ---- Mapbox Settings ----
    mapbox: {
        // Token loaded from token.js (gitignored for security)
        accessToken: window.MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE',

        // Mapbox style — using outdoors for terrain + water emphasis
        style: 'mapbox://styles/mapbox/outdoors-v12',

        // Initial view: Bozeman Creek corridor
        center: [-111.03, 45.64],
        zoom: 12,
        minZoom: 8,
        maxZoom: 18,
        pitch: 0,
        bearing: 0,

        // Bounding box for the initial focus area (Bozeman Creek corridor)
        bounds: [
            [-111.15, 45.55],
            [-110.90, 45.72]
        ],

        // Full Gallatin watershed bounds (for future scaling)
        fullBounds: [
            [-111.50, 45.20],
            [-110.60, 46.00]
        ]
    },


    // ---- Layer Categories ----
    categories: [
        {
            id: 'water',
            name: 'The Water',
            description: 'Streams, rivers, floodplains — the physical reality',
            icon: '💧',
            iconClass: 'water',
            defaultOpen: true,
            info: {
                title: 'Water Resources',
                description: 'The hydrological foundation of the Gallatin watershed. Streams flow continuously through zones with different rules and management approaches.',
                resources: [
                    { label: 'USGS Water Data', url: 'https://waterdata.usgs.gov/mt/nwis/' },
                    { label: 'MT DEQ Water Quality', url: 'https://deq.mt.gov/water' }
                ]
            },
            layers: [
                {
                    id: 'streams',
                    name: 'Streams & Rivers',
                    description: 'Gallatin County waterways network',
                    source: 'data/streams.geojson',
                    type: 'line',
                    defaultOn: true,
                    style: {
                        'line-color': '#2980b9',
                        'line-width': [
                            'interpolate', ['linear'], ['zoom'],
                            10, 1,
                            14, 3,
                            18, 5
                        ],
                        'line-opacity': 0.85
                    },
                    legendColor: '#2980b9',
                    popup: {
                        titleField: 'GCD_NAME',
                        fields: [
                            { key: 'COM_NAME', label: 'Common Name' },
                            { key: 'TYPE', label: 'Type' },
                            { key: 'ORIGIN', label: 'Origin' }
                        ]
                    },
                    detailPanel: {
                        title: 'Stream Information',
                        description: 'Part of the Gallatin watershed drainage network. Water flows continuously through multiple jurisdictions.',
                        actions: [
                            { label: 'View Watershed Info', url: 'https://www.gallatinwatershedcouncil.org/' }
                        ]
                    }
                },
                {
                    id: 'floodplains',
                    name: 'FEMA Flood Zones',
                    description: '100-year and 500-year flood hazard areas',
                    source: 'data/floodplains.geojson',
                    type: 'fill',
                    defaultOn: false,
                    style: {
                        'fill-color': [
                            'match', ['get', 'FLD_ZONE'],
                            'A', '#1e88e5',
                            'AE', '#1565c0',
                            'AO', '#42a5f5',
                            'AH', '#64b5f6',
                            'X', '#90caf9',
                            '#bbdefb'
                        ],
                        'fill-opacity': 0.4
                    },
                    outlineStyle: {
                        'line-color': '#0d47a1',
                        'line-width': 1,
                        'line-opacity': 0.6
                    },
                    legendColor: '#1e88e5',
                    popup: {
                        titleField: 'FLD_ZONE',
                        fields: [
                            { key: 'ZONE_SUBTY', label: 'Zone Subtype' },
                            { key: 'SFHA_TF', label: 'Special Flood Hazard' },
                            { key: 'STATIC_BFE', label: 'Base Flood Elev' }
                        ]
                    },
                    detailPanel: {
                        title: 'FEMA Flood Zone',
                        description: 'Flood zones indicate areas with varying levels of flood risk. Zone A/AE are high-risk areas requiring flood insurance for federally-backed mortgages.',
                        actions: [
                            { label: 'FEMA Flood Map Service', url: 'https://msc.fema.gov/portal/home' },
                            { label: 'Flood Insurance Info', url: 'https://www.fema.gov/flood-insurance' }
                        ]
                    }
                }
            ]
        },

        {
            id: 'governance',
            name: 'Who Governs',
            description: 'Jurisdictional and administrative boundaries',
            icon: '🏛️',
            iconClass: 'govern',
            defaultOpen: false,
            info: {
                title: 'Governance Boundaries',
                description: 'Water flows through multiple jurisdictions, each with different rules, regulations, and management approaches.',
                resources: [
                    { label: 'Gallatin County', url: 'https://gallatincomt.virtualtownhall.net/' },
                    { label: 'City of Bozeman', url: 'https://www.bozeman.net/' }
                ]
            },
            layers: [
                {
                    id: 'city-bozeman',
                    name: 'City Limits',
                    description: 'Incorporated cities and towns in Gallatin County',
                    source: 'data/bozeman_city_limits.geojson',
                    type: 'fill',
                    defaultOn: false,
                    style: {
                        'fill-color': '#a569bd',
                        'fill-opacity': 0.15
                    },
                    outlineStyle: {
                        'line-color': '#6c3483',
                        'line-width': 2,
                        'line-opacity': 0.8
                    },
                    legendColor: '#a569bd',
                    popup: {
                        titleField: 'CITY',
                        fields: []
                    },
                    detailPanel: {
                        title: 'Municipal Boundary',
                        description: 'Within city limits, the municipality has jurisdiction over land use, zoning, utilities, and stormwater management.',
                        actions: [
                            { label: 'Bozeman Planning', url: 'https://www.bozeman.net/government/planning' }
                        ]
                    }
                },
                {
                    id: 'commission-districts',
                    name: 'Commission Districts',
                    description: 'Gallatin County Commissioner districts',
                    source: 'data/commission_districts.geojson',
                    type: 'fill',
                    defaultOn: false,
                    style: {
                        'fill-color': [
                            'match', ['get', 'DISTRICT'],
                            '1', '#e57373',
                            '2', '#81c784',
                            '3', '#64b5f6',
                            '#9e9e9e'
                        ],
                        'fill-opacity': 0.2
                    },
                    outlineStyle: {
                        'line-color': '#424242',
                        'line-width': 2,
                        'line-dasharray': [4, 2],
                        'line-opacity': 0.7
                    },
                    legendColor: '#78909c',
                    popup: {
                        titleField: 'DISTRICT',
                        fields: [
                            { key: 'POP_2010_C', label: '2010 Population' }
                        ]
                    },
                    detailPanel: {
                        title: 'County Commission District',
                        description: 'County Commissioners make decisions on land use, zoning, and development in unincorporated areas.',
                        actions: [
                            { label: 'County Commission', url: 'https://gallatincomt.virtualtownhall.net/county-commission' }
                        ]
                    }
                },
                {
                    id: 'fire-districts',
                    name: 'Fire Districts',
                    description: 'Rural fire protection districts',
                    source: 'data/fire_districts.geojson',
                    type: 'fill',
                    defaultOn: false,
                    style: {
                        'fill-color': '#ef5350',
                        'fill-opacity': 0.12
                    },
                    outlineStyle: {
                        'line-color': '#c62828',
                        'line-width': 1.5,
                        'line-opacity': 0.6
                    },
                    legendColor: '#ef5350',
                    popup: {
                        titleField: 'FIRE_DIST',
                        fields: [
                            { key: 'DEF', label: 'Description' },
                            { key: 'RFD_NO', label: 'District Number' }
                        ]
                    },
                    detailPanel: {
                        title: 'Fire Protection District',
                        description: 'Fire districts provide emergency services and often have input on development standards, particularly related to water supply for firefighting.',
                        actions: []
                    }
                },
                {
                    id: 'school-districts',
                    name: 'School Districts',
                    description: 'Elementary and high school district boundaries',
                    source: 'data/school_districts.geojson',
                    type: 'fill',
                    defaultOn: false,
                    style: {
                        'fill-color': '#ffb74d',
                        'fill-opacity': 0.15
                    },
                    outlineStyle: {
                        'line-color': '#e65100',
                        'line-width': 1.5,
                        'line-opacity': 0.5
                    },
                    legendColor: '#ffb74d',
                    popup: {
                        titleField: 'Elementary',
                        fields: [
                            { key: 'High_Schoo', label: 'High School' },
                            { key: 'Acres', label: 'Area (acres)' }
                        ]
                    },
                    detailPanel: {
                        title: 'School District',
                        description: 'School districts are special taxing districts that may be affected by development patterns and population growth.',
                        actions: []
                    }
                }
            ]
        },

        {
            id: 'utilities',
            name: 'Water & Utilities',
            description: 'Water supply and sewer service districts',
            icon: '🚰',
            iconClass: 'utilities',
            defaultOpen: false,
            info: {
                title: 'Utility Districts',
                description: 'Water and sewer districts determine where municipal services are available, influencing development patterns and water resource management.',
                resources: []
            },
            layers: [
                {
                    id: 'water-sewer-districts',
                    name: 'Water & Sewer Districts',
                    description: 'Municipal water and sewer service areas',
                    source: 'data/water_sewer_districts.geojson',
                    type: 'fill',
                    defaultOn: false,
                    style: {
                        'fill-color': [
                            'match', ['get', 'TYPE'],
                            'WATER', '#4fc3f7',
                            'SEWER', '#8d6e63',
                            'WATER & SEWER', '#26a69a',
                            '#78909c'
                        ],
                        'fill-opacity': 0.25
                    },
                    outlineStyle: {
                        'line-color': '#00695c',
                        'line-width': 2,
                        'line-opacity': 0.7
                    },
                    legendColor: '#26a69a',
                    popup: {
                        titleField: 'NAME',
                        fields: [
                            { key: 'TYPE', label: 'Service Type' },
                            { key: 'DIST_NO', label: 'District Number' }
                        ]
                    },
                    detailPanel: {
                        title: 'Water/Sewer District',
                        description: 'These districts provide treated water supply and wastewater collection. Service availability affects development potential and groundwater impacts.',
                        actions: []
                    }
                }
            ]
        },

        {
            id: 'zoning',
            name: 'Zoning & Development',
            description: 'The transect: Natural to Urban Core',
            icon: '🏘️',
            iconClass: 'zoning',
            defaultOpen: false,
            info: {
                title: 'Development Patterns',
                description: 'Zoning determines allowed uses, density, and development standards. Water flows through zones with very different impacts on the watershed.',
                resources: [
                    { label: 'Bozeman Zoning', url: 'https://www.bozeman.net/government/planning/zoning' },
                    { label: 'County Planning', url: 'https://gallatinplanning.com/' }
                ]
            },
            layers: [
                {
                    id: 'zoning-transect',
                    name: 'Zoning Districts',
                    description: 'Land use and zoning classifications',
                    source: 'data/zoning_transect.geojson',
                    type: 'fill',
                    defaultOn: false,
                    style: {
                        'fill-color': [
                            'match', ['get', 'LANDUSE'],
                            'RESIDENTIAL', '#a5d6a7',
                            'COMMERCIAL', '#ef9a9a',
                            'INDUSTRIAL', '#b0bec5',
                            'AGRICULTURAL', '#dce775',
                            'PUBLIC', '#ce93d8',
                            '#e0e0e0'
                        ],
                        'fill-opacity': 0.35
                    },
                    outlineStyle: {
                        'line-color': '#616161',
                        'line-width': 0.5,
                        'line-opacity': 0.5
                    },
                    legendColor: '#a5d6a7',
                    popup: {
                        titleField: 'DISTRICT_N',
                        fields: [
                            { key: 'INNERZONE', label: 'Zone Code' },
                            { key: 'LANDUSE', label: 'Land Use' },
                            { key: 'ZONED', label: 'Zoning' }
                        ]
                    },
                    detailPanel: {
                        title: 'Zoning District',
                        description: 'Zoning controls what can be built and how land can be used. Different zones have different impervious surface limits and stormwater requirements.',
                        actions: [
                            { label: 'Gallatin County GIS', url: 'https://gis.gallatin.mt.gov/' }
                        ]
                    }
                }
            ]
        }
    ]
};
