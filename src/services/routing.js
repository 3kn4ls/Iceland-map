/**
 * Routing Service for Iceland Geoportal
 * Uses OSRM (Open Source Routing Machine) for route calculations
 */

// OSRM Demo Server (for development/testing)
// Note: For production, use your own OSRM server or Mapbox Directions API
const OSRM_BASE_URL = 'https://router.project-osrm.org';

/**
 * Transport mode profiles
 */
export const TransportModes = {
    driving: {
        id: 'driving',
        name: 'En coche',
        profile: 'driving',
        icon: 'car',
        avgSpeed: 80 // km/h
    },
    cycling: {
        id: 'cycling',
        name: 'En bicicleta',
        profile: 'cycling',
        icon: 'bicycle',
        avgSpeed: 20 // km/h
    },
    walking: {
        id: 'walking',
        name: 'A pie',
        profile: 'foot',
        icon: 'walking',
        avgSpeed: 5 // km/h
    }
};

/**
 * Calculate route between waypoints using OSRM
 * @param {Array} waypoints - Array of [lat, lng] coordinates
 * @param {string} mode - Transport mode ('driving', 'cycling', 'walking')
 * @returns {Promise<Object>} - Route data including geometry, distance, duration
 */
export async function calculateRoute(waypoints, mode = 'driving') {
    if (!waypoints || waypoints.length < 2) {
        throw new Error('Se necesitan al menos 2 puntos para calcular una ruta');
    }

    const profile = TransportModes[mode]?.profile || 'driving';

    // Format coordinates for OSRM: lng,lat;lng,lat;...
    const coordinates = waypoints
        .map(wp => `${wp[1]},${wp[0]}`)
        .join(';');

    const url = `${OSRM_BASE_URL}/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson&steps=true`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error del servidor de routing: ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== 'Ok') {
            throw new Error(data.message || 'Error al calcular la ruta');
        }

        const route = data.routes[0];

        return {
            distance: route.distance, // meters
            duration: route.duration, // seconds
            geometry: route.geometry, // GeoJSON geometry
            legs: route.legs.map(leg => ({
                distance: leg.distance,
                duration: leg.duration,
                steps: leg.steps.map(step => ({
                    distance: step.distance,
                    duration: step.duration,
                    instruction: step.maneuver.type,
                    name: step.name || 'Sin nombre'
                }))
            })),
            waypoints: data.waypoints.map(wp => ({
                name: wp.name,
                location: [wp.location[1], wp.location[0]] // Convert to [lat, lng]
            }))
        };
    } catch (error) {
        console.error('Error calculating route:', error);
        // Fallback: calculate straight-line distance
        return calculateFallbackRoute(waypoints, mode);
    }
}

/**
 * Fallback route calculation using straight-line distance
 * Used when OSRM is unavailable
 */
function calculateFallbackRoute(waypoints, mode) {
    const avgSpeed = TransportModes[mode]?.avgSpeed || 80;
    let totalDistance = 0;

    // Calculate straight-line distances
    for (let i = 0; i < waypoints.length - 1; i++) {
        totalDistance += haversineDistance(waypoints[i], waypoints[i + 1]);
    }

    // Apply factor for road distance (roads are ~1.3x straight line)
    const roadDistance = totalDistance * 1.3;
    const duration = (roadDistance / avgSpeed) * 3600; // seconds

    // Create simple line geometry
    const geometry = {
        type: 'LineString',
        coordinates: waypoints.map(wp => [wp[1], wp[0]])
    };

    return {
        distance: roadDistance * 1000, // meters
        duration: duration,
        geometry: geometry,
        legs: [],
        waypoints: waypoints.map((wp, i) => ({
            name: `Punto ${i + 1}`,
            location: wp
        })),
        isFallback: true
    };
}

/**
 * Calculate Haversine distance between two points
 * @param {Array} point1 - [lat, lng]
 * @param {Array} point2 - [lat, lng]
 * @returns {number} - Distance in kilometers
 */
export function haversineDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(point2[0] - point1[0]);
    const dLon = toRad(point2[1] - point1[1]);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(point1[0])) * Math.cos(toRad(point2[0])) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} - Formatted distance string
 */
export function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
export function formatDuration(seconds) {
    if (seconds < 60) {
        return `${Math.round(seconds)} seg`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);

    if (hours === 0) {
        return `${minutes} min`;
    }

    if (minutes === 0) {
        return `${hours} h`;
    }

    return `${hours} h ${minutes} min`;
}

/**
 * Get route summary
 * @param {Object} route - Route data
 * @param {string} mode - Transport mode
 * @returns {Object} - Route summary
 */
export function getRouteSummary(route, mode) {
    return {
        distance: formatDistance(route.distance),
        duration: formatDuration(route.duration),
        mode: TransportModes[mode]?.name || 'En coche',
        waypointCount: route.waypoints?.length || 0,
        isFallback: route.isFallback || false
    };
}

/**
 * Calculate total route stats from multiple legs
 * @param {Array} legs - Route legs
 * @returns {Object} - Total stats
 */
export function calculateTotalStats(legs) {
    return legs.reduce((acc, leg) => ({
        distance: acc.distance + leg.distance,
        duration: acc.duration + leg.duration
    }), { distance: 0, duration: 0 });
}

/**
 * Optimize waypoint order (simple nearest neighbor)
 * @param {Array} waypoints - Array of waypoints with coordinates
 * @param {number} startIndex - Index of starting waypoint
 * @returns {Array} - Optimized waypoint order
 */
export function optimizeWaypointOrder(waypoints, startIndex = 0) {
    if (waypoints.length <= 2) return waypoints;

    const optimized = [waypoints[startIndex]];
    const remaining = waypoints.filter((_, i) => i !== startIndex);

    while (remaining.length > 0) {
        const current = optimized[optimized.length - 1];
        let nearestIndex = 0;
        let nearestDistance = Infinity;

        remaining.forEach((wp, i) => {
            const dist = haversineDistance(current.coordinates, wp.coordinates);
            if (dist < nearestDistance) {
                nearestDistance = dist;
                nearestIndex = i;
            }
        });

        optimized.push(remaining.splice(nearestIndex, 1)[0]);
    }

    return optimized;
}

/**
 * Check if a point is within Iceland bounds
 * @param {Array} point - [lat, lng]
 * @returns {boolean}
 */
export function isWithinIceland(point) {
    const bounds = {
        north: 66.6,
        south: 63.2,
        west: -24.6,
        east: -13.2
    };

    return point[0] >= bounds.south &&
        point[0] <= bounds.north &&
        point[1] >= bounds.west &&
        point[1] <= bounds.east;
}

export default {
    calculateRoute,
    haversineDistance,
    formatDistance,
    formatDuration,
    getRouteSummary,
    calculateTotalStats,
    optimizeWaypointOrder,
    isWithinIceland,
    TransportModes
};
