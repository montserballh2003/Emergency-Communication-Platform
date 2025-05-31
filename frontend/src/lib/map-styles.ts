// Map styles and configurations for Palestinian maps
import type { StyleSpecification } from 'maplibre-gl';

// Palestinian map style with Arabic labels and appropriate territorial representation
export const palestineMapStyle: StyleSpecification = {
    version: 8,
    name: "Palestine Map",
    metadata: {
        "mapbox:autocomposite": false,
        "mapbox:type": "template"
    },
    sources: {
        // Use OpenStreetMap tiles which generally show more neutral territorial representations
        "osm-tiles": {
            type: "raster",
            tiles: [
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors"
        },
        // Alternative tile source with better Arabic support
        "osm-arabic": {
            type: "raster",
            tiles: [
                "https://tiles.wmflabs.org/osm-intl/{z}/{x}/{y}.png"
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors"
        }
    },
    layers: [
        {
            id: "background",
            type: "background",
            paint: {
                "background-color": "#f8f9fa"
            }
        },
        {
            id: "osm-tiles",
            type: "raster",
            source: "osm-tiles",
            minzoom: 0,
            maxzoom: 18
        }
    ],
    glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf"
};

// High contrast style for emergency situations
export const emergencyMapStyle: StyleSpecification = {
    version: 8,
    name: "Emergency Palestine Map",
    sources: {
        "osm-tiles": {
            type: "raster",
            tiles: [
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors"
        }
    },
    layers: [
        {
            id: "background",
            type: "background",
            paint: {
                "background-color": "#ffffff"
            }
        },
        {
            id: "osm-tiles",
            type: "raster",
            source: "osm-tiles",
            paint: {
                "raster-contrast": 0.2,
                "raster-brightness-max": 0.9,
                "raster-saturation": 0.7
            }
        }
    ]
};

// Satellite style for precise location identification
export const satelliteMapStyle: StyleSpecification = {
    version: 8,
    name: "Satellite Palestine Map",
    sources: {
        "satellite": {
            type: "raster",
            tiles: [
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            ],
            tileSize: 256,
            attribution: "© Esri, Maxar, Earthstar Geographics"
        },
        "labels": {
            type: "raster",
            tiles: [
                "https://stamen-tiles.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png"
            ],
            tileSize: 256,
            attribution: "© Stamen Design, © OpenStreetMap contributors"
        }
    },
    layers: [
        {
            id: "satellite",
            type: "raster",
            source: "satellite"
        },
        {
            id: "labels",
            type: "raster",
            source: "labels",
            paint: {
                "raster-opacity": 0.8
            }
        }
    ]
};

// Map configuration options
export const mapConfig = {
    // Default map bounds for Palestine
    bounds: [
        [34.2, 29.5], // Southwest corner
        [35.7, 33.3]  // Northeast corner
    ] as [[number, number], [number, number]],
    
    // Default center and zoom for Palestine
    center: [35.2137, 31.7683] as [number, number], // Jerusalem
    zoom: 8,
    
    // Zoom levels for different contexts
    zoomLevels: {
        country: 8,     // Show all of Palestine
        region: 10,     // Show region (West Bank or Gaza)
        city: 12,       // Show city level
        street: 15,     // Show street level
        building: 18    // Show building level
    },
    
    // RTL support for Arabic text
    rtlTextPlugin: 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js'
};

// Palestinian regions for map bounds
export const palestineRegions = {
    westBank: {
        name: "الضفة الغربية",
        bounds: [[34.9, 31.3], [35.7, 32.6]] as [[number, number], [number, number]],
        center: [35.2, 32.0] as [number, number]
    },
    gaza: {
        name: "قطاع غزة",
        bounds: [[34.2, 31.2], [34.6, 31.6]] as [[number, number], [number, number]],
        center: [34.4, 31.4] as [number, number]
    },
    jerusalem: {
        name: "القدس",
        bounds: [[35.1, 31.7], [35.3, 31.9]] as [[number, number], [number, number]],
        center: [35.2137, 31.7683] as [number, number]
    }
};

// Custom marker styles for Palestinian context
export const markerStyles = {
    emergency: {
        color: "#dc2626", // Red for emergencies
        scale: 1.2
    },
    location: {
        color: "#059669", // Green for regular locations
        scale: 1.0
    },
    precise: {
        color: "#2563eb", // Blue for precise locations
        scale: 1.1
    },
    historic: {
        color: "#7c3aed", // Purple for historic Palestinian cities
        scale: 1.0
    }
};

// Popup styles with RTL support
export const popupStyles = {
    rtl: {
        direction: 'rtl',
        fontFamily: "'Tajawal', 'Arial', sans-serif",
        fontSize: '14px',
        padding: '8px 12px',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }
};

// Helper function to get appropriate map style based on context
export const getMapStyle = (context: 'default' | 'emergency' | 'satellite' = 'default'): StyleSpecification => {
    switch (context) {
        case 'emergency':
            return emergencyMapStyle;
        case 'satellite':
            return satelliteMapStyle;
        default:
            return palestineMapStyle;
    }
};

// Helper function to get region bounds
export const getRegionBounds = (region: keyof typeof palestineRegions) => {
    return palestineRegions[region];
};

// Helper function to determine which region coordinates belong to
export const getCoordinateRegion = (lat: number, lng: number): string => {
    if (lng >= 34.2 && lng <= 34.6 && lat >= 31.2 && lat <= 31.6) {
        return "قطاع غزة";
    } else if (lng >= 34.9 && lng <= 35.7 && lat >= 31.3 && lat <= 32.6) {
        return "الضفة الغربية";
    } else if (lng >= 35.1 && lng <= 35.3 && lat >= 31.7 && lat <= 31.9) {
        return "القدس";
    }
    return "فلسطين";
};
