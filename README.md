# Iceland Tourism Geoportal

Un geoportal interactivo profesional para explorar los lugares turísticos de Islandia, planificar rutas y generar informes.

![Iceland Geoportal](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Características

### Mapa Interactivo
- Mapa base con múltiples capas (OpenStreetMap, Satélite, Terreno)
- Visualización de más de 40 puntos de interés turístico
- Iconos personalizados por categoría
- Popups informativos con detalles de cada lugar
- Controles de zoom y navegación

### Puntos de Interés (POIs)
- **Cascadas**: Gullfoss, Seljalandsfoss, Skógafoss, Dettifoss, Goðafoss, Svartifoss
- **Volcanes**: Eyjafjallajökull, Hekla, Askja, Krafla
- **Glaciares**: Vatnajökull, Jökulsárlón, Sólheimajökull
- **Ciudades**: Reykjavík, Akureyri, Vík, Húsavík
- **Aguas Termales**: Blue Lagoon, Myvatn Nature Baths, Secret Lagoon, Landmannalaugar
- **Naturaleza**: Þingvellir, Geysir, Lago Mývatn, Ásbyrgi
- **Playas**: Reynisfjara, Diamond Beach, Stokksnes
- **Monumentos**: Hallgrímskirkja, Harpa, Sun Voyager, Perlan

### Planificación de Rutas
- Selección de múltiples waypoints
- Cálculo automático de distancia y tiempo
- Tres modos de transporte: coche, bicicleta, a pie
- Visualización del trazado en el mapa
- API de routing OSRM integrada

### Gestión de Rutas
- Guardar rutas con nombre y descripción
- Almacenamiento persistente en IndexedDB
- Listar y buscar rutas guardadas
- Cargar rutas guardadas en el mapa
- Eliminar rutas

### Exportación de Informes
- **PDF**: Informe profesional con estadísticas y lista de paradas
- **HTML**: Página web imprimible
- **JSON**: Datos estructurados para integración

### Interfaz de Usuario
- Diseño moderno estilo dashboard GIS
- Panel lateral con lista de lugares y filtros
- Búsqueda en tiempo real
- Filtros por categoría
- Diseño responsive para móviles
- Notificaciones toast

## Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript ES6+ (Vanilla)
- **Mapas**: [Leaflet](https://leafletjs.com/) v1.9.4
- **Base de datos**: [Dexie.js](https://dexie.org/) (IndexedDB)
- **Routing**: [OSRM](http://project-osrm.org/) (Open Source Routing Machine)
- **Exportación PDF**: [jsPDF](https://parall.ax/products/jspdf)
- **Captura de mapa**: [html2canvas](https://html2canvas.hertzen.com/)
- **Fuentes**: Inter (Google Fonts)

## Instalación

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (para desarrollo)

### Opción 1: Servidor local simple

```bash
# Clonar el repositorio
git clone <repository-url>
cd Iceland-map

# Usando Python 3
python -m http.server 8000

# Usando Node.js (npx)
npx serve

# Usando PHP
php -S localhost:8000
```

### Opción 2: VS Code Live Server

1. Instalar la extensión "Live Server" en VS Code
2. Abrir la carpeta del proyecto
3. Click derecho en `index.html` > "Open with Live Server"

### Opción 3: Abrir directamente

Algunos navegadores permiten abrir `index.html` directamente, pero ciertas funcionalidades pueden no funcionar debido a restricciones CORS.

## Uso

### Explorar Lugares
1. Navega por el mapa o usa la lista lateral
2. Filtra por categoría usando los chips
3. Busca lugares específicos con el buscador
4. Click en un marcador para ver detalles

### Crear una Ruta
1. Click en "Añadir a ruta" en el popup de un lugar
2. O usa el botón + en la lista lateral
3. Añade múltiples puntos
4. Selecciona el modo de transporte
5. Visualiza la ruta calculada en el mapa

### Guardar Ruta
1. Click en "Guardar Ruta" en el panel de planificación
2. Introduce un nombre y descripción opcional
3. La ruta se guardará en el navegador (IndexedDB)

### Cargar Ruta Guardada
1. Click en "Mis Rutas" en la navegación
2. Selecciona una ruta de la lista
3. Click en "Cargar en Mapa"

### Exportar Informe
1. Crea o carga una ruta
2. Click en el botón de exportar (icono de descarga)
3. Selecciona el formato (PDF, HTML, JSON)
4. El archivo se descargará automáticamente

## Estructura del Proyecto

```
Iceland-map/
├── index.html              # Página principal
├── README.md               # Documentación
├── package.json            # Configuración del proyecto
├── styles/
│   ├── main.css           # Estilos principales
│   ├── sidebar.css        # Estilos del panel lateral
│   ├── controls.css       # Estilos de controles del mapa
│   └── modals.css         # Estilos de modales
└── src/
    ├── app.js             # Aplicación principal
    ├── components/
    │   └── Map.js         # Componente del mapa
    ├── services/
    │   ├── database.js    # Servicio IndexedDB
    │   ├── routing.js     # Servicio de rutas
    │   └── export.js      # Servicio de exportación
    ├── data/
    │   └── pois.js        # Datos de POIs
    └── utils/
        └── helpers.js     # Funciones auxiliares
```

## Arquitectura

### Componentes Principales

1. **MapManager** (`Map.js`)
   - Inicialización de Leaflet
   - Gestión de marcadores
   - Visualización de rutas
   - Control de capas

2. **RouteService** (`database.js`)
   - CRUD de rutas en IndexedDB
   - Búsqueda y filtrado
   - Importación/exportación

3. **RoutingService** (`routing.js`)
   - Cálculo de rutas con OSRM
   - Formateo de distancias y tiempos
   - Modos de transporte

4. **ExportService** (`export.js`)
   - Generación de PDF
   - Generación de HTML
   - Exportación JSON

### Flujo de Datos

```
Usuario → UI Events → GeoportalApp → Services → Map/Database
                                          ↓
                                      UI Update
```

## API de Servicios

### RouteService

```javascript
// Crear ruta
const id = await RouteService.create({
    name: 'Mi Ruta',
    waypoints: [...],
    distance: 1000,
    duration: 3600
});

// Obtener todas las rutas
const routes = await RouteService.getAll();

// Obtener ruta por ID
const route = await RouteService.getById(1);

// Actualizar ruta
await RouteService.update(1, { name: 'Nuevo nombre' });

// Eliminar ruta
await RouteService.delete(1);
```

### RoutingService

```javascript
import { calculateRoute, formatDistance, formatDuration } from './services/routing.js';

// Calcular ruta
const route = await calculateRoute(
    [[64.14, -21.94], [64.32, -20.12]],
    'driving'
);

console.log(formatDistance(route.distance)); // "120.5 km"
console.log(formatDuration(route.duration)); // "1 h 30 min"
```

## Personalización

### Añadir nuevos POIs

Edita `src/data/pois.js`:

```javascript
{
    id: 'mi-lugar',
    name: 'Mi Lugar',
    category: 'nature', // nature, waterfall, volcano, etc.
    coordinates: [64.1234, -21.5678],
    description: 'Descripción del lugar...',
    highlights: ['Característica 1', 'Característica 2'],
    visitDuration: 60, // minutos
    bestSeason: 'Verano'
}
```

### Añadir nueva categoría

```javascript
// En pois.js
export const categories = [
    // ... categorías existentes
    { id: 'nueva', name: 'Nueva Categoría', icon: '🆕', color: '#123456' }
];
```

### Cambiar capa base del mapa

Edita `src/components/Map.js`:

```javascript
const baseLayers = {
    miCapa: {
        url: 'https://mi-servidor/{z}/{x}/{y}.png',
        attribution: '© Mi Atribución',
        name: 'Mi Capa'
    }
};
```

## Limitaciones Conocidas

- El servidor OSRM público puede tener limitaciones de uso
- La exportación PDF requiere conexión para cargar fuentes
- IndexedDB tiene límites de almacenamiento por navegador
- Algunas funciones requieren HTTPS en producción

## Futuras Mejoras

- [ ] Sistema de autenticación
- [ ] Backend con sincronización cloud
- [ ] Modo offline con Service Workers
- [ ] Integración con APIs de clima
- [ ] Soporte para GPX/KML
- [ ] Fotos de usuarios en POIs
- [ ] Sistema de comentarios/reseñas
- [ ] Rutas predefinidas populares
- [ ] Integración con Google/Apple Maps

## Licencia

MIT License - Ver archivo LICENSE para más detalles.

## Créditos

- Datos de mapas: © OpenStreetMap contributors
- Imágenes satélite: © Esri, Maxar
- Routing: OSRM Project
- Iconos: Custom SVG icons

---

Desarrollado con ❄️ para explorar la tierra de hielo y fuego.
