/**
 * Iceland Tourism Geoportal - Main Application
 * Interactive GIS web application for exploring Iceland's tourist attractions
 */

import { MapManager } from './components/Map.js';
import { pois, categories, getCategoryById, getPoiById, searchPois, getPoiCountByCategory } from './data/pois.js';
import { RouteService } from './services/database.js';
import { calculateRoute, formatDistance, formatDuration, TransportModes } from './services/routing.js';
import { exportToPDF, exportToHTML, exportToJSON } from './services/export.js';
import { showToast, debounce, formatDate, formatRelativeTime } from './utils/helpers.js';

/**
 * Main Application Class
 */
class GeoportalApp {
    constructor() {
        this.map = null;
        this.currentView = 'explore';
        this.activeFilters = new Set(['all']);
        this.currentRoute = {
            waypoints: [],
            distance: 0,
            duration: 0,
            geometry: null,
            transportMode: 'driving'
        };
        this.savedRoutes = [];
        this.selectedRouteId = null;

        // Bind methods
        this.handleSearch = debounce(this.handleSearch.bind(this), 300);
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Iceland Geoportal...');

        // Initialize map
        this.map = new MapManager('map');
        this.map.init();

        // Add POI markers
        this.map.addPOIMarkers(pois);

        // Setup map event handlers
        this.map.onMarkerClick = (poi) => this.handleMarkerClick(poi);
        this.map.onMapClick = (latlng) => this.handleMapClick(latlng);

        // Setup UI event listeners
        this.setupEventListeners();

        // Render initial state
        this.renderCategories();
        this.renderPOIList();
        await this.loadSavedRoutes();

        // Register Service Worker
        this.registerServiceWorker();

        // Expose global functions for popup actions
        window.geoportal = {
            addToRoute: (poiId) => this.addWaypointFromPOI(poiId),
            zoomToPoi: (poiId) => this.map.zoomToPoi(poiId)
        };

        console.log('Iceland Geoportal initialized successfully!');
        showToast('Bienvenido a Iceland Geoportal', 'success');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Navigation
        document.getElementById('btn-explore')?.addEventListener('click', () => this.switchView('explore'));
        document.getElementById('btn-routes')?.addEventListener('click', () => this.switchView('routes'));

        // Mobile Bottom Nav
        document.querySelectorAll('.bottom-nav-item[data-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchView(btn.dataset.view);
                // Ensure sidebar is visible when switching view
                document.getElementById('sidebar')?.classList.add('visible');
            });
        });

        // Mobile "More" / Toggle Sidebar
        document.getElementById('btn-mobile-more')?.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar?.classList.toggle('visible');
            
            // Adjust map size after transition
            setTimeout(() => this.map.invalidateSize(), 350);
        });

        // Mobile Layers Toggle
        document.getElementById('btn-mobile-layers')?.addEventListener('click', (e) => {
            const layerOptions = document.getElementById('layer-options');
            if (layerOptions) {
                layerOptions.classList.toggle('hidden');
                // Ensure it's visible on screen (css handles positioning)
            }
        });

        // Search
        document.getElementById('search-input')?.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Map controls
        document.getElementById('btn-zoom-in')?.addEventListener('click', () => this.map.zoomIn());
        document.getElementById('btn-zoom-out')?.addEventListener('click', () => this.map.zoomOut());
        document.getElementById('btn-center-iceland')?.addEventListener('click', () => this.map.centerOnIceland());
        document.getElementById('btn-fullscreen')?.addEventListener('click', () => this.map.toggleFullscreen());

        // Layer switcher
        document.getElementById('btn-layers')?.addEventListener('click', () => {
            document.getElementById('layer-options')?.classList.toggle('hidden');
        });

        document.querySelectorAll('input[name="base-layer"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.map.setBaseLayer(e.target.value);
                document.getElementById('layer-options')?.classList.add('hidden');
            });
        });

        // Route builder
        document.getElementById('btn-clear-route')?.addEventListener('click', () => this.clearRoute());
        document.getElementById('btn-save-route')?.addEventListener('click', () => this.openSaveRouteModal());

        // Transport mode buttons
        document.querySelectorAll('.transport-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setTransportMode(e.currentTarget.dataset.mode));
        });

        // Export button
        document.getElementById('btn-export')?.addEventListener('click', () => this.openExportModal());

        // Settings / Hard Reset button
        document.getElementById('btn-settings')?.addEventListener('click', async () => {
            const confirmed = confirm('¿Deseas reiniciar la aplicación y buscar actualizaciones? Esto borrará la caché local.');
            if (confirmed) {
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const registration of registrations) {
                        await registration.unregister();
                    }
                }
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
                window.location.reload(true);
            }
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-cancel, .modal-backdrop').forEach(el => {
            el.addEventListener('click', (e) => {
                e.target.closest('.modal')?.classList.add('hidden');
            });
        });

        // Save route confirm
        document.getElementById('btn-confirm-save')?.addEventListener('click', () => this.saveRoute());

        // Export confirm
        document.getElementById('btn-confirm-export')?.addEventListener('click', () => this.exportRoute());

        // Route detail modal buttons
        document.getElementById('btn-load-route')?.addEventListener('click', () => this.loadSelectedRoute());
        document.getElementById('btn-delete-route')?.addEventListener('click', () => this.deleteSelectedRoute());
        document.getElementById('btn-export-route')?.addEventListener('click', () => this.exportSelectedRoute());

        // Close layer options when clicking outside
        document.addEventListener('click', (e) => {
            const layerSwitcher = document.querySelector('.layer-switcher');
            if (!layerSwitcher?.contains(e.target)) {
                document.getElementById('layer-options')?.classList.add('hidden');
            }
        });
    }

    // ==================== VIEW MANAGEMENT ====================

    /**
     * Switch between explore and routes view
     */
    switchView(view) {
        this.currentView = view;

        // Update nav buttons (desktop)
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Update bottom nav (mobile)
        document.querySelectorAll('.bottom-nav-item').forEach(btn => {
            if (btn.dataset.view) {
                btn.classList.toggle('active', btn.dataset.view === view);
            }
        });

        // Update sidebar views
        document.getElementById('view-explore')?.classList.toggle('active', view === 'explore');
        document.getElementById('view-routes')?.classList.toggle('active', view === 'routes');
        
        // Show sidebar on mobile/tablet when switching views
        if (window.innerWidth <= 1024) {
            document.getElementById('sidebar')?.classList.add('visible');
            setTimeout(() => this.map.invalidateSize(), 350);
        }

        if (view === 'routes') {
            this.renderSavedRoutes();
        }
    }

    // ==================== CATEGORY FILTERS ====================

    /**
     * Render category filter chips
     */
    renderCategories() {
        const container = document.getElementById('category-filters');
        if (!container) return;

        const counts = getPoiCountByCategory();

        let html = `
            <button class="filter-chip active" data-category="all">
                Todos
                <span class="filter-chip-count">(${counts.all})</span>
            </button>
        `;

        categories.forEach(cat => {
            html += `
                <button class="filter-chip" data-category="${cat.id}">
                    <span class="filter-chip-icon">${cat.icon}</span>
                    ${cat.name}
                    <span class="filter-chip-count">(${counts[cat.id]})</span>
                </button>
            `;
        });

        container.innerHTML = html;

        // Add event listeners
        container.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => this.toggleCategoryFilter(chip.dataset.category));
        });
    }

    /**
     * Toggle category filter
     */
    toggleCategoryFilter(categoryId) {
        const chips = document.querySelectorAll('.filter-chip');

        if (categoryId === 'all') {
            this.activeFilters.clear();
            this.activeFilters.add('all');
            chips.forEach(chip => {
                chip.classList.toggle('active', chip.dataset.category === 'all');
            });
        } else {
            this.activeFilters.delete('all');

            if (this.activeFilters.has(categoryId)) {
                this.activeFilters.delete(categoryId);
            } else {
                this.activeFilters.add(categoryId);
            }

            // If no filters selected, revert to all
            if (this.activeFilters.size === 0) {
                this.activeFilters.add('all');
            }

            chips.forEach(chip => {
                if (chip.dataset.category === 'all') {
                    chip.classList.toggle('active', this.activeFilters.has('all'));
                } else {
                    chip.classList.toggle('active', this.activeFilters.has(chip.dataset.category));
                }
            });
        }

        // Update map and list
        this.applyFilters();
    }

    /**
     * Apply current filters to map and list
     */
    applyFilters() {
        if (this.activeFilters.has('all')) {
            this.map.showAllMarkers();
            this.renderPOIList(pois);
        } else {
            const filteredPois = pois.filter(poi => this.activeFilters.has(poi.category));
            this.activeFilters.forEach(catId => {
                this.map.filterByCategory(catId);
            });
            this.renderPOIList(filteredPois);
        }

        // Update POI count
        const visibleCount = this.activeFilters.has('all')
            ? pois.length
            : pois.filter(poi => this.activeFilters.has(poi.category)).length;
        document.getElementById('poi-count').textContent = visibleCount;
    }

    // ==================== SEARCH ====================

    /**
     * Handle search input
     */
    handleSearch(query) {
        if (!query.trim()) {
            this.applyFilters();
            return;
        }

        const results = searchPois(query);
        this.renderPOIList(results);
        this.map.filterBySearch(query);

        document.getElementById('poi-count').textContent = results.length;
    }

    // ==================== POI LIST ====================

    /**
     * Render POI list in sidebar
     */
    renderPOIList(poiList = pois) {
        const container = document.getElementById('poi-list');
        if (!container) return;

        if (poiList.length === 0) {
            container.innerHTML = `
                <li class="empty-state">
                    <p>No se encontraron lugares</p>
                </li>
            `;
            return;
        }

        container.innerHTML = poiList.map(poi => {
            const category = getCategoryById(poi.category);
            const isInRoute = this.currentRoute.waypoints.some(wp => wp.id === poi.id);

            return `
                <li class="poi-item ${poi.category} ${isInRoute ? 'selected' : ''}" data-poi-id="${poi.id}">
                    <div class="poi-item-icon">
                        <span>${category?.icon || '📍'}</span>
                    </div>
                    <div class="poi-item-content">
                        <div class="poi-item-name">${poi.name}</div>
                        <div class="poi-item-category">${category?.name || poi.category}</div>
                    </div>
                    <div class="poi-item-actions">
                        <button class="poi-action-btn" data-action="add" title="Añadir a ruta">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <button class="poi-action-btn" data-action="zoom" title="Ver en mapa">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                <line x1="11" y1="8" x2="11" y2="14"></line>
                                <line x1="8" y1="11" x2="14" y2="11"></line>
                            </svg>
                        </button>
                    </div>
                </li>
            `;
        }).join('');

        // Add event listeners
        container.querySelectorAll('.poi-item').forEach(item => {
            const poiId = item.dataset.poiId;

            item.addEventListener('click', (e) => {
                if (!e.target.closest('.poi-action-btn')) {
                    this.map.zoomToPoi(poiId);
                }
            });

            item.querySelector('[data-action="add"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.addWaypointFromPOI(poiId);
            });

            item.querySelector('[data-action="zoom"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.map.zoomToPoi(poiId);
            });
        });

        // Update count
        document.getElementById('poi-count').textContent = poiList.length;
    }

    // ==================== ROUTE MANAGEMENT ====================

    /**
     * Handle marker click
     */
    handleMarkerClick(poi) {
        // Highlight in list
        document.querySelectorAll('.poi-item').forEach(item => {
            item.classList.toggle('selected',
                item.dataset.poiId === poi.id ||
                this.currentRoute.waypoints.some(wp => wp.id === item.dataset.poiId)
            );
        });
    }

    /**
     * Handle map click (for adding custom waypoints)
     */
    handleMapClick(latlng) {
        // Can be used for adding custom points not from POI list
        // Currently disabled - only POIs can be added to routes

        // On mobile/tablet, clicking map collapses sidebar
        if (window.innerWidth <= 1024) {
            document.getElementById('sidebar')?.classList.remove('visible');
        }
    }

    /**
     * Add waypoint from POI
     */
    async addWaypointFromPOI(poiId) {
        const poi = getPoiById(poiId);
        if (!poi) return;

        // Check if already in route
        if (this.currentRoute.waypoints.some(wp => wp.id === poiId)) {
            showToast('Este punto ya está en la ruta', 'info');
            return;
        }

        const category = getCategoryById(poi.category);

        this.currentRoute.waypoints.push({
            id: poi.id,
            name: poi.name,
            coordinates: poi.coordinates,
            category: category?.name || poi.category
        });

        // Close popup
        this.map.getMap().closePopup();

        // Update UI
        this.renderWaypoints();
        this.updateRouteOnMap();

        showToast(`${poi.name} añadido a la ruta`, 'success');
    }

    /**
     * Remove waypoint from route
     */
    removeWaypoint(index) {
        this.currentRoute.waypoints.splice(index, 1);
        this.renderWaypoints();
        this.updateRouteOnMap();
    }

    /**
     * Render waypoints in route builder
     */
    renderWaypoints() {
        const container = document.getElementById('route-waypoints');
        const statsContainer = document.getElementById('route-stats');
        const saveBtn = document.getElementById('btn-save-route');

        if (this.currentRoute.waypoints.length === 0) {
            container.innerHTML = '<p class="empty-state">Selecciona puntos en el mapa para crear una ruta</p>';
            statsContainer?.classList.add('hidden');
            saveBtn.disabled = true;
            return;
        }

        container.innerHTML = this.currentRoute.waypoints.map((wp, index) => `
            <div class="waypoint-item">
                <span class="waypoint-number">${index + 1}</span>
                <span class="waypoint-name">${wp.name}</span>
                <button class="waypoint-remove" data-index="${index}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `).join('');

        // Add remove listeners
        container.querySelectorAll('.waypoint-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeWaypoint(parseInt(btn.dataset.index));
            });
        });

        // Update stats visibility
        if (this.currentRoute.waypoints.length >= 2) {
            statsContainer?.classList.remove('hidden');
            saveBtn.disabled = false;
        } else {
            statsContainer?.classList.add('hidden');
            saveBtn.disabled = true;
        }

        // Update POI list highlights
        this.renderPOIList(this.activeFilters.has('all') ? pois : pois.filter(p => this.activeFilters.has(p.category)));
    }

    /**
     * Update route visualization on map
     */
    async updateRouteOnMap() {
        const waypoints = this.currentRoute.waypoints;

        // Update waypoint markers
        this.map.updateWaypointMarkers(waypoints);

        if (waypoints.length < 2) {
            this.map.clearRoute();
            this.currentRoute.distance = 0;
            this.currentRoute.duration = 0;
            this.updateRouteStats();
            return;
        }

        // Show loading
        document.getElementById('map-loading')?.classList.remove('hidden');

        try {
            // Calculate route
            const coordinates = waypoints.map(wp => wp.coordinates);
            const routeData = await calculateRoute(coordinates, this.currentRoute.transportMode);

            this.currentRoute.distance = routeData.distance;
            this.currentRoute.duration = routeData.duration;
            this.currentRoute.geometry = routeData.geometry;

            // Draw route on map
            if (routeData.geometry) {
                this.map.drawRoute(routeData.geometry);
            } else {
                // Fallback: draw simple polyline
                this.map.drawPolyline(coordinates);
            }

            this.updateRouteStats();
        } catch (error) {
            console.error('Error calculating route:', error);
            showToast('Error al calcular la ruta', 'error');

            // Draw simple polyline as fallback
            const coordinates = waypoints.map(wp => wp.coordinates);
            this.map.drawPolyline(coordinates);
        } finally {
            document.getElementById('map-loading')?.classList.add('hidden');
        }
    }

    /**
     * Update route statistics display
     */
    updateRouteStats() {
        document.getElementById('route-distance').textContent = formatDistance(this.currentRoute.distance);
        document.getElementById('route-duration').textContent = formatDuration(this.currentRoute.duration);
    }

    /**
     * Set transport mode
     */
    setTransportMode(mode) {
        this.currentRoute.transportMode = mode;

        // Update UI
        document.querySelectorAll('.transport-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Recalculate route if waypoints exist
        if (this.currentRoute.waypoints.length >= 2) {
            this.updateRouteOnMap();
        }
    }

    /**
     * Clear current route
     */
    clearRoute() {
        this.currentRoute = {
            waypoints: [],
            distance: 0,
            duration: 0,
            geometry: null,
            transportMode: this.currentRoute.transportMode
        };

        this.map.clearRouteElements();
        this.renderWaypoints();
        this.updateRouteStats();

        showToast('Ruta limpiada', 'info');
    }

    // ==================== SAVE/LOAD ROUTES ====================

    /**
     * Open save route modal
     */
    openSaveRouteModal() {
        const modal = document.getElementById('modal-save-route');
        if (!modal) return;

        // Update summary
        document.getElementById('summary-points').textContent = this.currentRoute.waypoints.length;
        document.getElementById('summary-distance').textContent = formatDistance(this.currentRoute.distance);
        document.getElementById('summary-duration').textContent = formatDuration(this.currentRoute.duration);

        // Clear form
        document.getElementById('route-name').value = '';
        document.getElementById('route-description').value = '';

        modal.classList.remove('hidden');
        document.getElementById('route-name')?.focus();
    }

    /**
     * Save current route
     */
    async saveRoute() {
        const name = document.getElementById('route-name')?.value.trim();
        const description = document.getElementById('route-description')?.value.trim();

        if (!name) {
            showToast('Por favor, introduce un nombre para la ruta', 'error');
            return;
        }

        try {
            const routeData = {
                name,
                description,
                waypoints: this.currentRoute.waypoints,
                distance: this.currentRoute.distance,
                duration: this.currentRoute.duration,
                transportMode: this.currentRoute.transportMode,
                routeGeometry: this.currentRoute.geometry
            };

            await RouteService.create(routeData);

            // Close modal
            document.getElementById('modal-save-route')?.classList.add('hidden');

            // Reload saved routes
            await this.loadSavedRoutes();

            showToast('Ruta guardada correctamente', 'success');
        } catch (error) {
            console.error('Error saving route:', error);
            showToast('Error al guardar la ruta', 'error');
        }
    }

    /**
     * Load saved routes from database
     */
    async loadSavedRoutes() {
        try {
            this.savedRoutes = await RouteService.getAll();
            document.getElementById('routes-count').textContent = this.savedRoutes.length;

            if (this.currentView === 'routes') {
                this.renderSavedRoutes();
            }
        } catch (error) {
            console.error('Error loading saved routes:', error);
        }
    }

    /**
     * Render saved routes list
     */
    renderSavedRoutes() {
        const container = document.getElementById('saved-routes-list');
        if (!container) return;

        if (this.savedRoutes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <p>No tienes rutas guardadas</p>
                    <span>Crea tu primera ruta seleccionando puntos en el mapa</span>
                </div>
            `;
            return;
        }

        container.innerHTML = this.savedRoutes.map(route => `
            <div class="saved-route-card" data-route-id="${route.id}">
                <div class="saved-route-header">
                    <h4 class="saved-route-name">${route.name}</h4>
                    <span class="saved-route-date">${formatRelativeTime(route.createdAt)}</span>
                </div>
                ${route.description ? `<p class="saved-route-description">${route.description}</p>` : ''}
                <div class="saved-route-stats">
                    <div class="saved-route-stat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <strong>${route.waypoints?.length || 0}</strong> puntos
                    </div>
                    <div class="saved-route-stat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <strong>${formatDuration(route.duration || 0)}</strong>
                    </div>
                    <div class="saved-route-stat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                        <strong>${formatDistance(route.distance || 0)}</strong>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click listeners
        container.querySelectorAll('.saved-route-card').forEach(card => {
            card.addEventListener('click', () => {
                this.openRouteDetail(parseInt(card.dataset.routeId));
            });
        });
    }

    /**
     * Open route detail modal
     */
    openRouteDetail(routeId) {
        const route = this.savedRoutes.find(r => r.id === routeId);
        if (!route) return;

        this.selectedRouteId = routeId;

        const modal = document.getElementById('modal-route-detail');
        if (!modal) return;

        // Populate modal
        document.getElementById('detail-route-name').textContent = route.name;
        document.getElementById('detail-points').textContent = route.waypoints?.length || 0;
        document.getElementById('detail-distance').textContent = formatDistance(route.distance || 0);
        document.getElementById('detail-duration').textContent = formatDuration(route.duration || 0);
        document.getElementById('detail-date').textContent = formatDate(route.createdAt);
        document.getElementById('detail-description').textContent = route.description || 'Sin descripción';

        // Render waypoints
        const waypointsList = document.getElementById('detail-waypoints-list');
        if (waypointsList && route.waypoints) {
            waypointsList.innerHTML = route.waypoints.map(wp =>
                `<li>${wp.name}</li>`
            ).join('');
        }

        modal.classList.remove('hidden');
    }

    /**
     * Load selected route onto map
     */
    loadSelectedRoute() {
        const route = this.savedRoutes.find(r => r.id === this.selectedRouteId);
        if (!route) return;

        // Set current route data
        this.currentRoute = {
            waypoints: route.waypoints || [],
            distance: route.distance || 0,
            duration: route.duration || 0,
            geometry: route.routeGeometry,
            transportMode: route.transportMode || 'driving'
        };

        // Update transport mode UI
        document.querySelectorAll('.transport-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === this.currentRoute.transportMode);
        });

        // Close modal and switch to explore view
        document.getElementById('modal-route-detail')?.classList.add('hidden');
        this.switchView('explore');

        // Render and draw route
        this.renderWaypoints();
        this.updateRouteOnMap();

        showToast(`Ruta "${route.name}" cargada`, 'success');
    }

    /**
     * Delete selected route
     */
    async deleteSelectedRoute() {
        if (!this.selectedRouteId) return;

        const confirmed = confirm('¿Estás seguro de que quieres eliminar esta ruta?');
        if (!confirmed) return;

        try {
            await RouteService.delete(this.selectedRouteId);

            // Close modal
            document.getElementById('modal-route-detail')?.classList.add('hidden');

            // Reload routes
            await this.loadSavedRoutes();
            this.renderSavedRoutes();

            showToast('Ruta eliminada', 'success');
        } catch (error) {
            console.error('Error deleting route:', error);
            showToast('Error al eliminar la ruta', 'error');
        }
    }

    // ==================== EXPORT ====================

    /**
     * Open export modal
     */
    openExportModal() {
        if (this.currentRoute.waypoints.length < 2 && !this.selectedRouteId) {
            showToast('No hay ruta para exportar', 'error');
            return;
        }

        document.getElementById('modal-export')?.classList.remove('hidden');
    }

    /**
     * Export current route
     */
    async exportRoute() {
        const format = document.querySelector('input[name="export-format"]:checked')?.value || 'pdf';
        const includeMap = document.getElementById('export-include-map')?.checked;

        // Get route data
        const routeData = {
            name: 'Ruta actual',
            description: '',
            waypoints: this.currentRoute.waypoints,
            distance: this.currentRoute.distance,
            duration: this.currentRoute.duration,
            transportMode: this.currentRoute.transportMode,
            createdAt: new Date().toISOString()
        };

        try {
            let filename;

            switch (format) {
                case 'pdf':
                    filename = await exportToPDF(routeData, {
                        includeMap,
                        mapElement: document.getElementById('map')
                    });
                    break;
                case 'html':
                    filename = exportToHTML(routeData);
                    break;
                case 'json':
                    filename = exportToJSON(routeData);
                    break;
            }

            document.getElementById('modal-export')?.classList.add('hidden');
            showToast(`Ruta exportada como ${format.toUpperCase()}`, 'success');
        } catch (error) {
            console.error('Error exporting route:', error);
            showToast('Error al exportar la ruta', 'error');
        }
    }

    /**
     * Export selected saved route
     */
    async exportSelectedRoute() {
        const route = this.savedRoutes.find(r => r.id === this.selectedRouteId);
        if (!route) return;

        document.getElementById('modal-route-detail')?.classList.add('hidden');
        this.openExportModal();

        // Override export to use saved route data
        const originalExport = this.exportRoute.bind(this);
        this.exportRoute = async () => {
            const format = document.querySelector('input[name="export-format"]:checked')?.value || 'pdf';
            const includeMap = document.getElementById('export-include-map')?.checked;

            try {
                let filename;

                switch (format) {
                    case 'pdf':
                        filename = await exportToPDF(route, {
                            includeMap,
                            mapElement: document.getElementById('map')
                        });
                        break;
                    case 'html':
                        filename = exportToHTML(route);
                        break;
                    case 'json':
                        filename = exportToJSON(route);
                        break;
                }

                document.getElementById('modal-export')?.classList.add('hidden');
                showToast(`Ruta exportada como ${format.toUpperCase()}`, 'success');

                // Restore original function
                this.exportRoute = originalExport;
            } catch (error) {
                console.error('Error exporting route:', error);
                showToast('Error al exportar la ruta', 'error');
                this.exportRoute = originalExport;
            }
        };
    }

    /**
     * Register Service Worker for PWA
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                // Add version query param to force update check
                navigator.serviceWorker.register('./sw.js?v=' + new Date().getTime())
                    .then(registration => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                        
                        registration.onupdatefound = () => {
                            const installingWorker = registration.installing;
                            if (installingWorker == null) {
                                return;
                            }
                            installingWorker.onstatechange = () => {
                                if (installingWorker.state === 'installed') {
                                    if (navigator.serviceWorker.controller) {
                                        // New content is available; please refresh.
                                        showToast('Nueva versión disponible. Reinicia la app.', 'info');
                                    } else {
                                        // Content is cached for offline use.
                                        console.log('Content is cached for offline use.');
                                    }
                                }
                            };
                        };
                    })
                    .catch(err => {
                        console.log('ServiceWorker registration failed: ', err);
                    });
            });
        }
    }
}

// ==================== INITIALIZATION ====================

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new GeoportalApp();
    app.init();
});

export default GeoportalApp;
