/**
 * IndexedDB Service for Iceland Geoportal
 * Uses Dexie.js for simplified IndexedDB management
 */

// Initialize Dexie database
const db = new Dexie('IcelandGeoportalDB');

// Database schema definition
db.version(1).stores({
    routes: '++id, name, createdAt, updatedAt',
    settings: 'key'
});

/**
 * Route Service - CRUD operations for saved routes
 */
export const RouteService = {
    /**
     * Create a new route
     * @param {Object} routeData - Route data to save
     * @returns {Promise<number>} - ID of the created route
     */
    async create(routeData) {
        const route = {
            name: routeData.name || 'Ruta sin nombre',
            description: routeData.description || '',
            waypoints: routeData.waypoints || [],
            distance: routeData.distance || 0,
            duration: routeData.duration || 0,
            transportMode: routeData.transportMode || 'driving',
            routeGeometry: routeData.routeGeometry || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            const id = await db.routes.add(route);
            console.log(`Route created with ID: ${id}`);
            return id;
        } catch (error) {
            console.error('Error creating route:', error);
            throw error;
        }
    },

    /**
     * Get all routes
     * @returns {Promise<Array>} - Array of all routes
     */
    async getAll() {
        try {
            const routes = await db.routes
                .orderBy('createdAt')
                .reverse()
                .toArray();
            return routes;
        } catch (error) {
            console.error('Error getting routes:', error);
            throw error;
        }
    },

    /**
     * Get a route by ID
     * @param {number} id - Route ID
     * @returns {Promise<Object|undefined>} - Route object or undefined
     */
    async getById(id) {
        try {
            const route = await db.routes.get(id);
            return route;
        } catch (error) {
            console.error(`Error getting route ${id}:`, error);
            throw error;
        }
    },

    /**
     * Update a route
     * @param {number} id - Route ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<number>} - Number of updated records
     */
    async update(id, updates) {
        try {
            const updateData = {
                ...updates,
                updatedAt: new Date().toISOString()
            };
            const count = await db.routes.update(id, updateData);
            console.log(`Route ${id} updated`);
            return count;
        } catch (error) {
            console.error(`Error updating route ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete a route
     * @param {number} id - Route ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            await db.routes.delete(id);
            console.log(`Route ${id} deleted`);
        } catch (error) {
            console.error(`Error deleting route ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete all routes
     * @returns {Promise<void>}
     */
    async deleteAll() {
        try {
            await db.routes.clear();
            console.log('All routes deleted');
        } catch (error) {
            console.error('Error deleting all routes:', error);
            throw error;
        }
    },

    /**
     * Get route count
     * @returns {Promise<number>} - Number of routes
     */
    async count() {
        try {
            return await db.routes.count();
        } catch (error) {
            console.error('Error counting routes:', error);
            return 0;
        }
    },

    /**
     * Search routes by name
     * @param {string} query - Search query
     * @returns {Promise<Array>} - Matching routes
     */
    async search(query) {
        try {
            const normalizedQuery = query.toLowerCase().trim();
            const routes = await db.routes.toArray();
            return routes.filter(route =>
                route.name.toLowerCase().includes(normalizedQuery) ||
                (route.description && route.description.toLowerCase().includes(normalizedQuery))
            );
        } catch (error) {
            console.error('Error searching routes:', error);
            throw error;
        }
    },

    /**
     * Export route as JSON
     * @param {number} id - Route ID
     * @returns {Promise<string>} - JSON string
     */
    async exportAsJson(id) {
        try {
            const route = await this.getById(id);
            if (!route) throw new Error('Route not found');
            return JSON.stringify(route, null, 2);
        } catch (error) {
            console.error(`Error exporting route ${id}:`, error);
            throw error;
        }
    },

    /**
     * Export all routes as JSON
     * @returns {Promise<string>} - JSON string
     */
    async exportAllAsJson() {
        try {
            const routes = await this.getAll();
            return JSON.stringify(routes, null, 2);
        } catch (error) {
            console.error('Error exporting all routes:', error);
            throw error;
        }
    },

    /**
     * Import route from JSON
     * @param {string} jsonString - JSON string
     * @returns {Promise<number>} - ID of imported route
     */
    async importFromJson(jsonString) {
        try {
            const routeData = JSON.parse(jsonString);
            // Remove ID to create a new entry
            delete routeData.id;
            return await this.create(routeData);
        } catch (error) {
            console.error('Error importing route:', error);
            throw error;
        }
    }
};

/**
 * Settings Service - User preferences storage
 */
export const SettingsService = {
    /**
     * Get a setting value
     * @param {string} key - Setting key
     * @param {*} defaultValue - Default value if not found
     * @returns {Promise<*>} - Setting value
     */
    async get(key, defaultValue = null) {
        try {
            const setting = await db.settings.get(key);
            return setting ? setting.value : defaultValue;
        } catch (error) {
            console.error(`Error getting setting ${key}:`, error);
            return defaultValue;
        }
    },

    /**
     * Set a setting value
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     * @returns {Promise<void>}
     */
    async set(key, value) {
        try {
            await db.settings.put({ key, value });
        } catch (error) {
            console.error(`Error setting ${key}:`, error);
            throw error;
        }
    },

    /**
     * Delete a setting
     * @param {string} key - Setting key
     * @returns {Promise<void>}
     */
    async delete(key) {
        try {
            await db.settings.delete(key);
        } catch (error) {
            console.error(`Error deleting setting ${key}:`, error);
            throw error;
        }
    },

    /**
     * Get all settings
     * @returns {Promise<Object>} - All settings as key-value pairs
     */
    async getAll() {
        try {
            const settings = await db.settings.toArray();
            return settings.reduce((acc, { key, value }) => {
                acc[key] = value;
                return acc;
            }, {});
        } catch (error) {
            console.error('Error getting all settings:', error);
            return {};
        }
    }
};

/**
 * Database utility functions
 */
export const DatabaseUtils = {
    /**
     * Check if database is ready
     * @returns {Promise<boolean>}
     */
    async isReady() {
        try {
            await db.open();
            return true;
        } catch (error) {
            console.error('Database not ready:', error);
            return false;
        }
    },

    /**
     * Get database info
     * @returns {Promise<Object>} - Database information
     */
    async getInfo() {
        const routeCount = await RouteService.count();
        return {
            name: db.name,
            version: db.verno,
            tables: db.tables.map(t => t.name),
            routeCount
        };
    },

    /**
     * Clear all data
     * @returns {Promise<void>}
     */
    async clearAll() {
        try {
            await db.routes.clear();
            await db.settings.clear();
            console.log('All database data cleared');
        } catch (error) {
            console.error('Error clearing database:', error);
            throw error;
        }
    },

    /**
     * Export entire database
     * @returns {Promise<Object>}
     */
    async exportDatabase() {
        const routes = await db.routes.toArray();
        const settings = await db.settings.toArray();
        return {
            exportDate: new Date().toISOString(),
            version: db.verno,
            routes,
            settings
        };
    },

    /**
     * Import database from backup
     * @param {Object} data - Backup data
     * @returns {Promise<void>}
     */
    async importDatabase(data) {
        try {
            if (data.routes) {
                await db.routes.clear();
                await db.routes.bulkAdd(data.routes);
            }
            if (data.settings) {
                await db.settings.clear();
                await db.settings.bulkAdd(data.settings);
            }
            console.log('Database imported successfully');
        } catch (error) {
            console.error('Error importing database:', error);
            throw error;
        }
    }
};

// Export database instance for direct access if needed
export { db };

export default {
    RouteService,
    SettingsService,
    DatabaseUtils,
    db
};
