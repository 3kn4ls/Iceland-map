/**
 * Map Component for Iceland Geoportal
 * Handles Leaflet map initialization, markers, and route visualization
 */

import { categories, getCategoryById } from '../data/pois.js';

// Iceland center coordinates and bounds
const ICELAND_CENTER = [64.9631, -19.0208];
const ICELAND_BOUNDS = [
    [63.2, -24.6], // Southwest
    [66.6, -13.2]  // Northeast
];
const DEFAULT_ZOOM = 7;

// Base layer definitions
const baseLayers = {
    osm: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        name: 'OpenStreetMap'
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        name: 'Satélite'
    },
    terrain: {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
        name: 'Terreno'
    }
};

/**
 * Map Manager Class
 */
export class MapManager {
    constructor(containerId) {
        this.containerId = containerId;
        this.map = null;
        this.markers = new Map();
        this.waypointMarkers = [];
        this.routeLine = null;
        this.currentBaseLayer = null;
        this.selectedMarkerId = null;

        // Event callbacks
        this.onMarkerClick = null;
        this.onMapClick = null;
        this.onWaypointAdd = null;
    }

    /**
     * Initialize the map
     */
    init() {
        // Create map instance
        this.map = L.map(this.containerId, {
            center: ICELAND_CENTER,
            zoom: DEFAULT_ZOOM,
            minZoom: 5,
            maxZoom: 18,
            zoomControl: false, // Using custom controls
            attributionControl: true
        });

        // Set max bounds to keep focus on Iceland region
        this.map.setMaxBounds([
            [60, -30],
            [70, -8]
        ]);

        // Add default base layer
        this.setBaseLayer('osm');

        // Add scale control
        L.control.scale({
            metric: true,
            imperial: false,
            position: 'bottomleft'
        }).addTo(this.map);

        // Setup event listeners
        this._setupEventListeners();

        return this;
    }

    /**
     * Set base layer
     */
    setBaseLayer(layerId) {
        const layerConfig = baseLayers[layerId];
        if (!layerConfig) return;

        // Remove current base layer
        if (this.currentBaseLayer) {
            this.map.removeLayer(this.currentBaseLayer);
        }

        // Add new base layer
        this.currentBaseLayer = L.tileLayer(layerConfig.url, {
            attribution: layerConfig.attribution,
            maxZoom: 19
        }).addTo(this.map);
    }

    /**
     * Setup event listeners
     */
    _setupEventListeners() {
        // Map click for adding waypoints
        this.map.on('click', (e) => {
            if (this.onMapClick) {
                this.onMapClick(e.latlng);
            }
        });

        // Zoom events
        this.map.on('zoomend', () => {
            this._updateMarkerVisibility();
        });
    }

    /**
     * Add POI markers to the map
     */
    addPOIMarkers(pois, options = {}) {
        pois.forEach(poi => {
            this.addPOIMarker(poi, options);
        });
    }

    /**
     * Add a single POI marker
     */
    addPOIMarker(poi, options = {}) {
        const category = getCategoryById(poi.category);
        const icon = this._createMarkerIcon(poi.category, category?.icon || '📍');

        const marker = L.marker(poi.coordinates, {
            icon: icon,
            title: poi.name,
            riseOnHover: true
        });

        // Create popup content
        const popupContent = this._createPopupContent(poi, category);
        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
        });

        // Marker click handler
        marker.on('click', () => {
            this.selectMarker(poi.id);
            if (this.onMarkerClick) {
                this.onMarkerClick(poi);
            }
        });

        // Store marker reference
        this.markers.set(poi.id, {
            marker: marker,
            poi: poi,
            visible: true
        });

        marker.addTo(this.map);
    }

    /**
     * Create custom marker icon
     */
    _createMarkerIcon(category, emoji) {
        const categoryData = getCategoryById(category);
        const color = categoryData?.color || '#0066cc';

        return L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div class="custom-marker ${category}" style="background: ${color};">
                    <span class="custom-marker-inner">${emoji}</span>
                </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36]
        });
    }

    /**
     * Create popup content HTML
     */
    _createPopupContent(poi, category) {
        return `
            <div class="poi-popup">
                <div class="poi-popup-header">
                    <div class="poi-popup-icon" style="background: ${category?.color}20; color: ${category?.color}">
                        ${category?.icon || '📍'}
                    </div>
                    <div>
                        <div class="poi-popup-title">${poi.name}</div>
                        <div class="poi-popup-category">${category?.name || poi.category}</div>
                    </div>
                </div>
                <p class="poi-popup-description">${poi.description}</p>
                <div class="poi-popup-actions">
                    <button class="poi-popup-btn" onclick="window.geoportal.addToRoute('${poi.id}')">
                        Añadir a ruta
                    </button>
                    <button class="poi-popup-btn secondary" onclick="window.geoportal.zoomToPoi('${poi.id}')">
                        Centrar
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Select a marker
     */
    selectMarker(poiId) {
        // Deselect previous marker
        if (this.selectedMarkerId && this.markers.has(this.selectedMarkerId)) {
            const prevMarker = this.markers.get(this.selectedMarkerId);
            const prevIcon = prevMarker.marker.getIcon();
            prevMarker.marker.getElement()?.querySelector('.custom-marker')?.classList.remove('selected');
        }

        // Select new marker
        this.selectedMarkerId = poiId;
        if (this.markers.has(poiId)) {
            const markerData = this.markers.get(poiId);
            markerData.marker.getElement()?.querySelector('.custom-marker')?.classList.add('selected');
        }
    }

    /**
     * Zoom to a POI
     */
    zoomToPoi(poiId) {
        const markerData = this.markers.get(poiId);
        if (markerData) {
            this.map.flyTo(markerData.poi.coordinates, 14, {
                duration: 1
            });
            markerData.marker.openPopup();
        }
    }

    /**
     * Filter markers by category
     */
    filterByCategory(categoryId) {
        this.markers.forEach((data, id) => {
            const shouldShow = !categoryId || categoryId === 'all' || data.poi.category === categoryId;

            if (shouldShow && !data.visible) {
                data.marker.addTo(this.map);
                data.visible = true;
            } else if (!shouldShow && data.visible) {
                data.marker.remove();
                data.visible = false;
            }
        });
    }

    /**
     * Filter markers by search query
     */
    filterBySearch(query) {
        const normalizedQuery = query.toLowerCase().trim();

        this.markers.forEach((data, id) => {
            const matchesSearch = !normalizedQuery ||
                data.poi.name.toLowerCase().includes(normalizedQuery) ||
                data.poi.description.toLowerCase().includes(normalizedQuery);

            if (matchesSearch && !data.visible) {
                data.marker.addTo(this.map);
                data.visible = true;
            } else if (!matchesSearch && data.visible) {
                data.marker.remove();
                data.visible = false;
            }
        });
    }

    /**
     * Show all markers
     */
    showAllMarkers() {
        this.markers.forEach((data) => {
            if (!data.visible) {
                data.marker.addTo(this.map);
                data.visible = true;
            }
        });
    }

    /**
     * Update marker visibility based on zoom level
     */
    _updateMarkerVisibility() {
        // Can implement clustering or visibility rules here
    }

    // ==================== ROUTE METHODS ====================

    /**
     * Add waypoint marker
     */
    addWaypointMarker(coordinates, index, poiName = null) {
        const icon = L.divIcon({
            className: 'waypoint-div-icon',
            html: `<div class="waypoint-marker">${index + 1}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });

        const marker = L.marker(coordinates, {
            icon: icon,
            draggable: false,
            title: poiName || `Punto ${index + 1}`
        });

        marker.addTo(this.map);
        this.waypointMarkers.push(marker);

        return marker;
    }

    /**
     * Update all waypoint markers
     */
    updateWaypointMarkers(waypoints) {
        // Remove existing waypoint markers
        this.clearWaypointMarkers();

        // Add new markers
        waypoints.forEach((wp, index) => {
            this.addWaypointMarker(wp.coordinates, index, wp.name);
        });
    }

    /**
     * Clear all waypoint markers
     */
    clearWaypointMarkers() {
        this.waypointMarkers.forEach(marker => marker.remove());
        this.waypointMarkers = [];
    }

    /**
     * Draw route line on map
     */
    drawRoute(geometry, options = {}) {
        // Remove existing route line
        this.clearRoute();

        const defaultOptions = {
            color: '#0066cc',
            weight: 5,
            opacity: 0.8,
            lineJoin: 'round',
            lineCap: 'round'
        };

        const lineOptions = { ...defaultOptions, ...options };

        // Create route outline (white background)
        const outline = L.geoJSON(geometry, {
            style: {
                color: '#ffffff',
                weight: lineOptions.weight + 2,
                opacity: 1,
                lineJoin: lineOptions.lineJoin,
                lineCap: lineOptions.lineCap
            }
        }).addTo(this.map);

        // Create main route line
        const line = L.geoJSON(geometry, {
            style: lineOptions
        }).addTo(this.map);

        this.routeLine = L.layerGroup([outline, line]).addTo(this.map);

        // Fit map to route bounds
        const bounds = line.getBounds();
        if (bounds.isValid()) {
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    /**
     * Draw simple polyline between points
     */
    drawPolyline(coordinates, options = {}) {
        this.clearRoute();

        const defaultOptions = {
            color: '#0066cc',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10'
        };

        const lineOptions = { ...defaultOptions, ...options };

        // Draw dashed line for fallback/simple routes
        const line = L.polyline(coordinates, lineOptions).addTo(this.map);

        this.routeLine = line;

        // Fit map to line bounds
        const bounds = line.getBounds();
        if (bounds.isValid()) {
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    /**
     * Clear route line from map
     */
    clearRoute() {
        if (this.routeLine) {
            this.routeLine.remove();
            this.routeLine = null;
        }
    }

    /**
     * Clear all route elements (line + waypoint markers)
     */
    clearRouteElements() {
        this.clearRoute();
        this.clearWaypointMarkers();
    }

    // ==================== MAP CONTROLS ====================

    /**
     * Zoom in
     */
    zoomIn() {
        this.map.zoomIn();
    }

    /**
     * Zoom out
     */
    zoomOut() {
        this.map.zoomOut();
    }

    /**
     * Center on Iceland
     */
    centerOnIceland() {
        this.map.flyTo(ICELAND_CENTER, DEFAULT_ZOOM, {
            duration: 1
        });
    }

    /**
     * Fit map to markers bounds
     */
    fitToMarkers() {
        const visibleMarkers = Array.from(this.markers.values())
            .filter(data => data.visible)
            .map(data => data.marker.getLatLng());

        if (visibleMarkers.length > 0) {
            const bounds = L.latLngBounds(visibleMarkers);
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen?.() ||
                container.webkitRequestFullscreen?.() ||
                container.msRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() ||
                document.webkitExitFullscreen?.() ||
                document.msExitFullscreen?.();
        }
    }

    /**
     * Get map instance
     */
    getMap() {
        return this.map;
    }

    /**
     * Get current view state
     */
    getViewState() {
        return {
            center: this.map.getCenter(),
            zoom: this.map.getZoom()
        };
    }

    /**
     * Invalidate map size (call after container resize)
     */
    invalidateSize() {
        this.map?.invalidateSize();
    }

    /**
     * Destroy map instance
     */
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.markers.clear();
        this.waypointMarkers = [];
    }
}

export default MapManager;
