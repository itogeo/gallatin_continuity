/**
 * Gallatin Continuity — Layer Configuration
 *
 * All layer definitions, categories, styles, and metadata.
 * Data sources documented in data/DATA_SOURCES.md
 */

const CONFIG = {

    // ---- Mapbox Settings ----
    mapbox: {
        accessToken: 'pk.eyJ1IjoiaXRvZ2VvIiwiYSI6ImNta3ByZTZpNjBsbzMzZm9vb3BxeGFoNmoifQ.pHK8DdvZh5QHAkP4iRd1yw',
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [-111.03, 45.67],
        zoom: 11,
        minZoom: 8,
        maxZoom: 18,
        pitch: 0,
        bearing: 0,
        bounds: [
            [-111.25, 45.50],
            [-110.85, 45.80]
        ]
    },

    // ---- Layer Categories ----
    categories: [
        // =========================================================
        // THE WATER - Physical hydrology
        // =========================================================
        {
            id: 'water',
            name: 'The Water',
            description: 'Streams, rivers, floodplains — the physical reality',
            icon: '💧',
            iconClass: 'water',
            defaultOpen: true,
            info: {
                title: 'Water Resources',
                description: 'The hydrological foundation of the Gallatin watershed. Water flows continuously through zones with different rules and management approaches.',
                resources: [
                    { label: 'USGS Water Data', url: 'https://waterdata.usgs.gov/mt/nwis/' },
                    { label: 'MT DEQ Water Quality', url: 'https://deq.mt.gov/water' },
                    { label: 'Gallatin Watershed Council', url: 'https://www.gallatinwatershedcouncil.org/' }
                ]
            },
            layers: [
                {
                    id: 'gallatin-streams',
                    name: 'County Waterways',
                    description: 'Gallatin County streams and rivers',
                    source: 'data/gallatin_streams.geojson',
                    type: 'line',
                    defaultOn: true,
                    style: {
                        'line-color': '#2980b9',
                        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 14, 2.5, 18, 4],
                        'line-opacity': 0.85
                    },
                    legendColor: '#2980b9',
                    popup: {
                        titleField: 'GCD_NAME',
                        fields: [
                            { key: 'COM_NAME', label: 'Common Name' },
                            { key: 'TYPE', label: 'Type' }
                        ]
                    },
                    detailPanel: {
                        title: 'Waterway Information',
                        description: 'Part of the Gallatin watershed drainage network. Source: Gallatin County GIS Planning MapServer.',
                        actions: [
                            { label: 'County GIS Data', url: 'https://www.gallatinmt.gov/geographic-information-services-gis/pages/data-download' }
                        ]
                    }
                },
                {
                    id: 'floodplains',
                    name: 'FEMA Flood Zones',
                    description: 'Flood hazard areas',
                    source: 'data/floodplains.geojson',
                    type: 'fill',
                    defaultOn: true,
                    style: {
                        'fill-color': [
                            'match', ['get', 'FLD_ZONE'],
                            'A', '#7c4dff',
                            'AE', '#651fff',
                            'AO', '#b388ff',
                            'AH', '#d1c4e9',
                            'X', '#e8eaf6',
                            '#7c4dff'
                        ],
                        'fill-opacity': 0.4
                    },
                    outlineStyle: {
                        'line-color': '#4527a0',
                        'line-width': 0.5,
                        'line-opacity': 0.5
                    },
                    legendColor: '#7c4dff',
                    popup: {
                        titleField: 'FLD_ZONE',
                        fields: [
                            { key: 'ZONE_SUBTY', label: 'Zone Subtype' },
                            { key: 'SFHA_TF', label: 'Special Flood Hazard' }
                        ]
                    },
                    detailPanel: {
                        title: 'FEMA Flood Zone',
                        description: 'Zone A/AE are high-risk areas (1% annual flood chance). Zone X is moderate-to-low risk. Flood insurance required for federally-backed mortgages in high-risk zones.',
                        actions: [
                            { label: 'FEMA Flood Map Service', url: 'https://msc.fema.gov/portal/home' }
                        ]
                    }
                }
            ]
        },

        // =========================================================
        // PUBLIC LANDS & CONSERVATION
        // =========================================================
        {
            id: 'public-lands',
            name: 'Public Lands & Conservation',
            description: 'Federal, state, and protected lands',
            icon: '🏔️',
            iconClass: 'land',
            defaultOpen: false,
            info: {
                title: 'Public Lands & Conservation',
                description: 'Public lands including National Forest, state lands, and conservation easements that protect watershed headwaters and riparian corridors.',
                resources: [
                    { label: 'Custer Gallatin NF', url: 'https://www.fs.usda.gov/custergallatin' },
                    { label: 'Montana Land Trust', url: 'https://www.montanalandtrust.org/' }
                ]
            },
            layers: [
                {
                    id: 'public-lands',
                    name: 'Public Lands',
                    description: 'Federal, state, and local public lands',
                    source: 'data/public_lands.geojson',
                    type: 'fill',
                    defaultOn: false,
                    transectZone: 'natural',
                    style: {
                        'fill-color': [
                            'match', ['get', 'OWNER'],
                            'USFS', '#1e4d2b',
                            'BLM', '#8b7355',
                            'STATE', '#52b788',
                            'FWP', '#2d6a4f',
                            'COUNTY', '#95d5b2',
                            'CITY', '#a5d6a7',
                            '#1e4d2b'
                        ],
                        'fill-opacity': 0.4
                    },
                    outlineStyle: {
                        'line-color': '#1e4d2b',
                        'line-width': 1.5,
                        'line-opacity': 0.7
                    },
                    legendColor: '#1e4d2b',
                    popup: {
                        titleField: 'NAME',
                        fields: [
                            { key: 'OWNER', label: 'Owner' },
                            { key: 'ACRES', label: 'Acres' },
                            { key: 'MANAGER', label: 'Manager' }
                        ]
                    },
                    detailPanel: {
                        title: 'Public Land',
                        description: 'Public lands provide watershed protection, recreation, and habitat. These areas typically have the strongest stream protections and no development pressure.',
                        actions: [
                            { label: 'Custer Gallatin NF', url: 'https://www.fs.usda.gov/custergallatin' }
                        ]
                    }
                },
                {
                    id: 'conservation-easements',
                    name: 'Conservation Easements',
                    description: 'Private lands with permanent protection',
                    source: 'data/conservation_easements.geojson',
                    type: 'fill',
                    defaultOn: false,
                    transectZone: 'rural',
                    style: {
                        'fill-color': '#52b788',
                        'fill-opacity': 0.3
                    },
                    outlineStyle: {
                        'line-color': '#2d6a4f',
                        'line-width': 1.5,
                        'line-dasharray': [4, 2],
                        'line-opacity': 0.8
                    },
                    legendColor: '#52b788',
                    popup: {
                        titleField: 'NAME',
                        fields: [
                            { key: 'HOLDER', label: 'Easement Holder' },
                            { key: 'ACRES', label: 'Acres' },
                            { key: 'YR_REC', label: 'Year Recorded' }
                        ]
                    },
                    detailPanel: {
                        title: 'Conservation Easement',
                        description: 'Voluntary legal agreements that permanently limit development to protect agricultural, natural, or scenic values. Critical for protecting riparian corridors on private land.',
                        actions: [
                            { label: 'Montana Land Trust', url: 'https://www.montanalandtrust.org/' }
                        ]
                    }
                },
                {
                    id: 'bozeman-parks',
                    name: 'Bozeman Parks & Open Space',
                    description: 'City parks and natural areas',
                    source: 'data/bozeman_parks.geojson',
                    type: 'fill',
                    defaultOn: false,
                    transectZone: 'suburban',
                    style: {
                        'fill-color': '#66bb6a',
                        'fill-opacity': 0.5
                    },
                    outlineStyle: {
                        'line-color': '#2e7d32',
                        'line-width': 1.5,
                        'line-opacity': 0.8
                    },
                    legendColor: '#66bb6a',
                    popup: {
                        titleField: 'PARK_NAME',
                        fields: [
                            { key: 'TYPE', label: 'Type' },
                            { key: 'ACRES', label: 'Acres' },
                            { key: 'PTMD_CLASS', label: 'Classification' },
                            { key: 'ACCESS', label: 'Access' }
                        ]
                    },
                    detailPanel: {
                        title: 'Bozeman Park',
                        description: 'City parks provide recreational access to streams and help buffer waterways from urban development. Many parks include trail connections along stream corridors.',
                        actions: [
                            { label: 'Bozeman Parks', url: 'https://www.bozeman.net/departments/parks' }
                        ]
                    }
                }
            ]
        },

        // =========================================================
        // CITY OF BOZEMAN - Municipal governance
        // =========================================================
        {
            id: 'city-governance',
            name: 'City of Bozeman',
            description: 'Municipal boundaries, zoning, and planning',
            icon: '🏛️',
            iconClass: 'govern',
            defaultOpen: true,
            info: {
                title: 'City of Bozeman Governance',
                description: 'Within city limits, Bozeman has jurisdiction over land use, zoning, utilities, and stormwater management. The city manages urban streams and enforces development standards.',
                resources: [
                    { label: 'City of Bozeman', url: 'https://www.bozeman.net/' },
                    { label: 'Bozeman Planning', url: 'https://www.bozeman.net/government/planning' },
                    { label: 'City Open Data', url: 'https://public-bozeman.opendata.arcgis.com/' }
                ]
            },
            layers: [
                {
                    id: 'bozeman-city-limits',
                    name: 'City Limits',
                    description: 'Bozeman municipal boundary',
                    source: 'data/bozeman_city_limits.geojson',
                    type: 'fill',
                    defaultOn: true,
                    style: {
                        'fill-color': '#9c27b0',
                        'fill-opacity': 0.08
                    },
                    outlineStyle: {
                        'line-color': '#6a1b9a',
                        'line-width': 3,
                        'line-opacity': 0.9
                    },
                    legendColor: '#9c27b0',
                    popup: {
                        titleField: 'OBJECTID',
                        fields: []
                    },
                    detailPanel: {
                        title: 'City of Bozeman Limits',
                        description: 'Within city limits, Bozeman has full municipal authority over land use, zoning, building codes, and utilities. The City manages stormwater and urban streams.',
                        actions: [
                            { label: 'City Jurisdictional Boundary', url: 'https://public-bozeman.opendata.arcgis.com/search?tags=City%2520Limits' }
                        ]
                    }
                },
                {
                    id: 'bozeman-zoning',
                    name: 'City Zoning',
                    description: 'Bozeman municipal zoning districts',
                    source: 'data/bozeman_zoning.geojson',
                    type: 'fill',
                    defaultOn: false,
                    style: {
                        'fill-color': [
                            'match', ['get', 'ZONING'],
                            'R-1', '#c8e6c9', 'R-2', '#a5d6a7', 'R-3', '#81c784', 'R-4', '#66bb6a', 'R-5', '#4caf50',
                            'R-S', '#e8f5e9', 'RMH', '#dcedc8', 'R-O', '#aed581',
                            'B-1', '#ffcdd2', 'B-2', '#ef9a9a', 'B-2M', '#e57373', 'B-3', '#f44336',
                            'M-1', '#cfd8dc', 'M-2', '#90a4ae',
                            'PLI', '#e1bee7', 'NEHMU', '#ce93d8', 'REMU', '#ba68c8',
                            '#e0e0e0'
                        ],
                        'fill-opacity': 0.5
                    },
                    outlineStyle: {
                        'line-color': '#424242',
                        'line-width': 0.5,
                        'line-opacity': 0.4
                    },
                    legendColor: '#81c784',
                    popup: {
                        titleField: 'ZONING',
                        fields: [
                            { key: 'STR_TYPE_1', label: 'Street Type 1' },
                            { key: 'STR_TYPE_2', label: 'Street Type 2' }
                        ]
                    },
                    detailPanel: {
                        title: 'Bozeman Zoning District',
                        description: 'City zoning determines allowed uses, building heights, setbacks, and density. Different zones have different impervious surface limits affecting stormwater runoff.',
                        actions: [
                            { label: 'Bozeman Zoning Code', url: 'https://www.bozeman.net/government/planning/zoning' }
                        ]
                    }
                }
            ]
        },

        // =========================================================
        // GALLATIN COUNTY - County governance
        // =========================================================
        {
            id: 'county-governance',
            name: 'Gallatin County',
            description: 'County planning districts and jurisdictions',
            icon: '🗺️',
            iconClass: 'county',
            defaultOpen: true,
            info: {
                title: 'Gallatin County Governance',
                description: 'Outside city limits, Gallatin County manages land use through planning districts. The Hyalite and Bozeman Donut areas have specific zoning regulations.',
                resources: [
                    { label: 'Gallatin County', url: 'https://gallatincomt.virtualtownhall.net/' },
                    { label: 'County Planning', url: 'https://gallatinplanning.com/' },
                    { label: 'County GIS', url: 'https://gis.gallatin.mt.gov/' }
                ]
            },
            layers: [
                {
                    id: 'gallatin-county-boundary',
                    name: 'County Boundary',
                    description: 'Gallatin County outline',
                    source: 'data/gallatin_county_boundary.geojson',
                    type: 'line',
                    defaultOn: false,
                    style: {
                        'line-color': '#5d4037',
                        'line-width': 3,
                        'line-dasharray': [8, 4],
                        'line-opacity': 0.7
                    },
                    legendColor: '#5d4037',
                    popup: { titleField: 'OBJECTID', fields: [] },
                    detailPanel: {
                        title: 'Gallatin County',
                        description: 'Gallatin County encompasses the entire Gallatin watershed from Yellowstone National Park to Three Forks.',
                        actions: [
                            { label: 'County Website', url: 'https://gallatincomt.virtualtownhall.net/' }
                        ]
                    }
                },
                {
                    id: 'gallatin-cities',
                    name: 'Incorporated Cities',
                    description: 'Cities and towns in Gallatin County',
                    source: 'data/gallatin_cities.geojson',
                    type: 'fill',
                    defaultOn: false,
                    style: {
                        'fill-color': '#7e57c2',
                        'fill-opacity': 0.15
                    },
                    outlineStyle: {
                        'line-color': '#512da8',
                        'line-width': 2,
                        'line-opacity': 0.8
                    },
                    legendColor: '#7e57c2',
                    popup: {
                        titleField: 'CITY',
                        fields: []
                    },
                    detailPanel: {
                        title: 'Incorporated City',
                        description: 'Incorporated cities have their own municipal government and land use authority.',
                        actions: []
                    }
                },
                {
                    id: 'hyalite-zoning',
                    name: 'Hyalite Zoning District',
                    description: 'County planning district south of Bozeman',
                    source: 'data/hyalite_zoning_district.geojson',
                    type: 'fill',
                    defaultOn: false,
                    style: {
                        'fill-color': '#43a047',
                        'fill-opacity': 0.2
                    },
                    outlineStyle: {
                        'line-color': '#2e7d32',
                        'line-width': 2.5,
                        'line-dasharray': [6, 3],
                        'line-opacity': 0.8
                    },
                    legendColor: '#43a047',
                    popup: {
                        titleField: 'DISTRICT_N',
                        fields: [
                            { key: 'INNERZONE', label: 'Zone' },
                            { key: 'LANDUSE', label: 'Land Use' }
                        ]
                    },
                    detailPanel: {
                        title: 'Hyalite Zoning District',
                        description: 'County planning jurisdiction covering the Hyalite Canyon area. Has specific zoning for watershed protection and rural development.',
                        actions: [
                            { label: 'View Hyalite Map', url: 'https://gallatinplanning.maps.arcgis.com/apps/mapviewer/index.html?webmap=2026409b241f40568dcd65152550da64' }
                        ]
                    }
                },
                {
                    id: 'bozeman-donut',
                    name: 'Bozeman Donut',
                    description: 'County planning area around city limits',
                    source: 'data/bozeman_donut.geojson',
                    type: 'fill',
                    defaultOn: false,
                    style: {
                        'fill-color': [
                            'match', ['get', 'LANDUSE'],
                            'RESIDENTIAL', '#a5d6a7',
                            'AGRICULTURAL', '#dce775',
                            'COMMERCIAL', '#ffab91',
                            'INDUSTRIAL', '#b0bec5',
                            '#e0e0e0'
                        ],
                        'fill-opacity': 0.35
                    },
                    outlineStyle: {
                        'line-color': '#6d4c41',
                        'line-width': 0.5,
                        'line-opacity': 0.5
                    },
                    legendColor: '#8d6e63',
                    popup: {
                        titleField: 'DISTRICT_N',
                        fields: [
                            { key: 'INNERZONE', label: 'Zone Code' },
                            { key: 'LANDUSE', label: 'Land Use' },
                            { key: 'ZONED', label: 'Zoning' }
                        ]
                    },
                    detailPanel: {
                        title: 'Bozeman Donut Planning Area',
                        description: 'The "donut" is unincorporated county land surrounding Bozeman city limits. County has planning jurisdiction but coordinates with the city on growth and development.',
                        actions: [
                            { label: 'View Donut Map', url: 'https://gallatinplanning.maps.arcgis.com/apps/mapviewer/index.html?webmap=7b18cc10db89434c8797eefc540e6387' }
                        ]
                    }
                }
            ]
        },

        // =========================================================
        // SETBACKS & POLICY - Watercourse protection zones
        // =========================================================
        {
            id: 'setbacks-policy',
            name: 'Setbacks & Policy',
            description: 'Watercourse setback regulations by jurisdiction',
            icon: '📏',
            iconClass: 'policy',
            defaultOpen: true,
            info: {
                title: 'Watercourse Setbacks',
                description: 'Different jurisdictions have different setback requirements for development near streams. These buffers protect water quality, reduce flood damage, and preserve habitat.',
                resources: [
                    { label: 'Bozeman UDC', url: 'https://www.bozeman.net/government/planning' },
                    { label: 'County Zoning Reform', url: 'https://gallatinplanning.com/' }
                ]
            },
            layers: [
                {
                    id: 'setback-city-75',
                    name: 'City Setback (75ft)',
                    description: 'Bozeman UDC: 75ft setback, 45ft native vegetation',
                    source: 'data/gallatin_streams.geojson',
                    type: 'setback',
                    setbackDistance: 75,
                    defaultOn: false,
                    style: {
                        'line-color': '#e91e63',
                        'line-opacity': 0.25
                    },
                    legendColor: '#e91e63',
                    detailPanel: {
                        title: 'City of Bozeman Setback',
                        description: 'The Unified Development Code requires a 75-foot setback from watercourses, with 45 feet of native vegetation maintained. Part of the Bozeman Creek Vision Plan for flood mitigation, water quality, and ecological restoration.',
                        actions: [
                            { label: 'Bozeman Creek Vision', url: 'https://www.bozeman.net/government/planning' }
                        ]
                    }
                },
                {
                    id: 'setback-county-150',
                    name: 'County Setback (150ft)',
                    description: 'Gallatin County: Current 150ft requirement',
                    source: 'data/gallatin_streams.geojson',
                    type: 'setback',
                    setbackDistance: 150,
                    defaultOn: false,
                    style: {
                        'line-color': '#ff9800',
                        'line-opacity': 0.2
                    },
                    legendColor: '#ff9800',
                    detailPanel: {
                        title: 'Gallatin County Current Setback',
                        description: 'County Subdivision Regulations currently require 150-foot setbacks from watercourses. This applies in the Bozeman Area Donut and Hyalite District.',
                        actions: [
                            { label: 'County Regulations', url: 'https://gallatinplanning.com/' }
                        ]
                    }
                },
                {
                    id: 'setback-proposed-300',
                    name: 'Proposed Setback (300ft)',
                    description: 'Zoning Reform: 300ft structures / 150ft disturbance',
                    source: 'data/gallatin_streams.geojson',
                    type: 'setback',
                    setbackDistance: 300,
                    defaultOn: false,
                    style: {
                        'line-color': '#4caf50',
                        'line-opacity': 0.15
                    },
                    legendColor: '#4caf50',
                    detailPanel: {
                        title: 'Proposed County Setback',
                        description: 'Gallatin County Zoning Reform proposes aligning setbacks with the Future Land Use Map: 300ft for structures and 150ft for ground disturbance in the Natural Subsection. This would significantly expand riparian protection.',
                        actions: [
                            { label: 'Zoning Reform Info', url: 'https://gallatinplanning.com/' }
                        ]
                    }
                }
            ]
        },

        // =========================================================
        // SPECIAL DISTRICTS - Other governance
        // =========================================================
        {
            id: 'special-districts',
            name: 'Special Districts',
            description: 'Fire, water, sewer, and school districts',
            icon: '🚒',
            iconClass: 'special',
            defaultOpen: false,
            info: {
                title: 'Special Districts',
                description: 'Special taxing districts provide specific services like fire protection, water supply, and education. These cross city/county boundaries.',
                resources: []
            },
            layers: [
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
                            { key: 'DEF', label: 'Description' }
                        ]
                    },
                    detailPanel: {
                        title: 'Fire Protection District',
                        description: 'Fire districts provide emergency services and have input on development standards, particularly water supply for firefighting.',
                        actions: []
                    }
                },
                {
                    id: 'water-sewer-districts',
                    name: 'Water & Sewer Districts',
                    description: 'Municipal utility service areas',
                    source: 'data/water_sewer_districts.geojson',
                    type: 'fill',
                    defaultOn: false,
                    style: {
                        'fill-color': '#26a69a',
                        'fill-opacity': 0.2
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
                            { key: 'TYPE', label: 'Service Type' }
                        ]
                    },
                    detailPanel: {
                        title: 'Water/Sewer District',
                        description: 'These districts provide treated water and wastewater collection. Service availability affects development potential and groundwater impacts.',
                        actions: []
                    }
                },
                {
                    id: 'school-districts',
                    name: 'School Districts',
                    description: 'Elementary and high school boundaries',
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
                            { key: 'High_Schoo', label: 'High School' }
                        ]
                    },
                    detailPanel: {
                        title: 'School District',
                        description: 'School districts are special taxing districts affected by development patterns and population growth.',
                        actions: []
                    }
                },
                {
                    id: 'commission-districts',
                    name: 'Commission Districts',
                    description: 'County Commissioner districts',
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
                        fields: []
                    },
                    detailPanel: {
                        title: 'County Commission District',
                        description: 'County Commissioners make decisions on land use, zoning, and development in unincorporated areas.',
                        actions: [
                            { label: 'County Commission', url: 'https://gallatincomt.virtualtownhall.net/county-commission' }
                        ]
                    }
                }
            ]
        }
    ]
};
