/**
 * Iceland Tourism POIs (Points of Interest)
 * Mock data for the Iceland Geoportal
 */

export const categories = [
    { id: 'nature', name: 'Naturaleza', icon: '🌲', color: '#22c55e' },
    { id: 'waterfall', name: 'Cascadas', icon: '💧', color: '#3b82f6' },
    { id: 'volcano', name: 'Volcanes', icon: '🌋', color: '#ef4444' },
    { id: 'glacier', name: 'Glaciares', icon: '🏔️', color: '#06b6d4' },
    { id: 'city', name: 'Ciudades', icon: '🏛️', color: '#8b5cf6' },
    { id: 'hotspring', name: 'Aguas Termales', icon: '♨️', color: '#f97316' },
    { id: 'landmark', name: 'Monumentos', icon: '🏰', color: '#ec4899' },
    { id: 'beach', name: 'Playas', icon: '🏖️', color: '#eab308' }
];

export const pois = [
    // === CASCADAS ===
    {
        id: 'gullfoss',
        name: 'Gullfoss',
        category: 'waterfall',
        coordinates: [64.3271, -20.1199],
        description: 'La "Cascada Dorada" es una de las más icónicas de Islandia. El río Hvítá cae en dos etapas de 11 y 21 metros hacia un cañón de 70 metros de profundidad.',
        highlights: ['Parte del Círculo Dorado', 'Arcoíris frecuentes', 'Acceso gratuito'],
        visitDuration: 60,
        bestSeason: 'Todo el año'
    },
    {
        id: 'seljalandsfoss',
        name: 'Seljalandsfoss',
        category: 'waterfall',
        coordinates: [63.6156, -19.9886],
        description: 'Famosa cascada de 60 metros que permite caminar por detrás de la cortina de agua a través de una cueva.',
        highlights: ['Caminar detrás de la cascada', 'Mejor al atardecer', 'Cerca de Gljúfrabúi'],
        visitDuration: 45,
        bestSeason: 'Verano'
    },
    {
        id: 'skogafoss',
        name: 'Skógafoss',
        category: 'waterfall',
        coordinates: [63.5321, -19.5112],
        description: 'Impresionante cascada de 60 metros de altura y 25 metros de ancho. Una de las más grandes y hermosas de Islandia.',
        highlights: ['Escaleras hasta la cima', 'Inicio del sendero Fimmvörðuháls', 'Arcoíris dobles'],
        visitDuration: 60,
        bestSeason: 'Todo el año'
    },
    {
        id: 'dettifoss',
        name: 'Dettifoss',
        category: 'waterfall',
        coordinates: [65.8147, -16.3845],
        description: 'La cascada más poderosa de Europa. Con 100 metros de ancho y 44 metros de altura, su rugido se escucha a kilómetros.',
        highlights: ['La más poderosa de Europa', 'Escenario de Prometheus', 'Paisaje lunar'],
        visitDuration: 90,
        bestSeason: 'Verano'
    },
    {
        id: 'godafoss',
        name: 'Goðafoss',
        category: 'waterfall',
        coordinates: [65.6826, -17.5502],
        description: 'La "Cascada de los Dioses" tiene forma de herradura con 30 metros de ancho. Según la leyenda, aquí se arrojaron los ídolos paganos al convertirse Islandia al cristianismo.',
        highlights: ['Historia vikinga', 'Forma de herradura', 'Cerca de Akureyri'],
        visitDuration: 45,
        bestSeason: 'Todo el año'
    },
    {
        id: 'svartifoss',
        name: 'Svartifoss',
        category: 'waterfall',
        coordinates: [64.0272, -16.9756],
        description: 'La "Cascada Negra" está rodeada de impresionantes columnas de basalto hexagonales que inspiraron la arquitectura de Hallgrímskirkja.',
        highlights: ['Columnas de basalto', 'Caminata de 5.5 km', 'Parque Nacional Vatnajökull'],
        visitDuration: 120,
        bestSeason: 'Verano'
    },

    // === VOLCANES ===
    {
        id: 'eyjafjallajokull',
        name: 'Eyjafjallajökull',
        category: 'volcano',
        coordinates: [63.6330, -19.6218],
        description: 'Famoso volcán cubierto de glaciar que erupcionó en 2010 causando el caos aéreo en Europa. Su cumbre alcanza los 1651 metros.',
        highlights: ['Erupción de 2010', 'Cubierto de glaciar', 'Tours en superjeep'],
        visitDuration: 240,
        bestSeason: 'Verano'
    },
    {
        id: 'hekla',
        name: 'Hekla',
        category: 'volcano',
        coordinates: [63.9833, -19.6667],
        description: 'Conocido en la Edad Media como la "Puerta al Infierno". Es uno de los volcanes más activos de Islandia con más de 20 erupciones desde 874.',
        highlights: ['Volcán muy activo', 'Se puede escalar', 'Vistas panorámicas'],
        visitDuration: 360,
        bestSeason: 'Verano'
    },
    {
        id: 'askja',
        name: 'Askja',
        category: 'volcano',
        coordinates: [65.0333, -16.7500],
        description: 'Caldera volcánica en las Tierras Altas con el lago Öskjuvatn, el segundo más profundo de Islandia, y el cráter Víti donde se puede nadar en aguas termales.',
        highlights: ['Lago del cráter', 'Baño termal en Víti', 'Paisaje marciano'],
        visitDuration: 300,
        bestSeason: 'Julio-Agosto'
    },
    {
        id: 'krafla',
        name: 'Krafla',
        category: 'volcano',
        coordinates: [65.7260, -16.7280],
        description: 'Sistema volcánico activo con el colorido cráter Víti y campos de lava humeantes. Centro de la actividad geotérmica del norte.',
        highlights: ['Cráter Víti', 'Campos geotérmicos', 'Central geotérmica'],
        visitDuration: 120,
        bestSeason: 'Verano'
    },

    // === GLACIARES ===
    {
        id: 'vatnajokull',
        name: 'Vatnajökull',
        category: 'glacier',
        coordinates: [64.4000, -16.8000],
        description: 'El glaciar más grande de Europa cubre el 8% de Islandia. Esconde varios volcanes activos bajo su capa de hielo de hasta 1000 metros de espesor.',
        highlights: ['El más grande de Europa', 'Cuevas de hielo', 'Volcanes subglaciales'],
        visitDuration: 480,
        bestSeason: 'Invierno para cuevas'
    },
    {
        id: 'jokulsarlon',
        name: 'Jökulsárlón',
        category: 'glacier',
        coordinates: [64.0784, -16.2306],
        description: 'Espectacular laguna glaciar donde flotan icebergs azules desprendidos del glaciar Breiðamerkurjökull. Hogar de focas.',
        highlights: ['Icebergs flotantes', 'Focas', 'Diamond Beach cercana'],
        visitDuration: 120,
        bestSeason: 'Todo el año'
    },
    {
        id: 'solheimajokull',
        name: 'Sólheimajökull',
        category: 'glacier',
        coordinates: [63.5294, -19.3667],
        description: 'Lengua glaciar accesible del glaciar Mýrdalsjökull. Popular para caminatas sobre hielo y escalada en glaciar.',
        highlights: ['Caminatas sobre hielo', 'Escalada en glaciar', 'Fácil acceso'],
        visitDuration: 180,
        bestSeason: 'Todo el año'
    },

    // === CIUDADES ===
    {
        id: 'reykjavik',
        name: 'Reykjavík',
        category: 'city',
        coordinates: [64.1466, -21.9426],
        description: 'La capital más septentrional del mundo. Ciudad vibrante con coloridas casas, animada vida nocturna, museos y excelentes restaurantes.',
        highlights: ['Capital de Islandia', 'Vida cultural', 'Gastronomía'],
        visitDuration: 480,
        bestSeason: 'Todo el año'
    },
    {
        id: 'akureyri',
        name: 'Akureyri',
        category: 'city',
        coordinates: [65.6885, -18.0906],
        description: 'La "Capital del Norte" es la segunda ciudad más grande de Islandia. Situada en un fiordo espectacular con jardín botánico más septentrional.',
        highlights: ['Capital del Norte', 'Jardín Botánico', 'Base para el norte'],
        visitDuration: 240,
        bestSeason: 'Todo el año'
    },
    {
        id: 'vik',
        name: 'Vík í Mýrdal',
        category: 'city',
        coordinates: [63.4186, -19.0060],
        description: 'Pueblo más meridional de Islandia famoso por su playa de arena negra, los pilares de Reynisdrangar y la iglesia en la colina.',
        highlights: ['Playa negra', 'Reynisdrangar', 'Pueblo pintoresco'],
        visitDuration: 120,
        bestSeason: 'Todo el año'
    },
    {
        id: 'husavik',
        name: 'Húsavík',
        category: 'city',
        coordinates: [66.0449, -17.3383],
        description: 'Conocida como la capital de las ballenas de Europa. Excelente punto para avistamiento de ballenas jorobadas y delfines.',
        highlights: ['Avistamiento de ballenas', 'Museo de las Ballenas', 'Pueblo pesquero'],
        visitDuration: 240,
        bestSeason: 'Mayo-Septiembre'
    },

    // === AGUAS TERMALES ===
    {
        id: 'blue-lagoon',
        name: 'Blue Lagoon',
        category: 'hotspring',
        coordinates: [63.8804, -22.4495],
        description: 'El spa geotérmico más famoso del mundo. Aguas azul lechoso ricas en sílice y minerales a 37-40°C entre campos de lava.',
        highlights: ['Spa de lujo', 'Aguas curativas', 'Máscaras de sílice'],
        visitDuration: 180,
        bestSeason: 'Todo el año'
    },
    {
        id: 'myvatn-baths',
        name: 'Myvatn Nature Baths',
        category: 'hotspring',
        coordinates: [65.6308, -16.8469],
        description: 'Alternativa menos concurrida al Blue Lagoon en el norte. Aguas termales naturales con vistas al lago Mývatn.',
        highlights: ['Menos turístico', 'Vistas al lago', 'Más económico'],
        visitDuration: 120,
        bestSeason: 'Todo el año'
    },
    {
        id: 'secret-lagoon',
        name: 'Secret Lagoon',
        category: 'hotspring',
        coordinates: [64.1372, -20.3094],
        description: 'La piscina natural más antigua de Islandia en Flúðir. Ambiente rústico y auténtico con pequeño géiser cercano.',
        highlights: ['Piscina histórica', 'Ambiente natural', 'Géiser Litli Geysir'],
        visitDuration: 90,
        bestSeason: 'Todo el año'
    },
    {
        id: 'landmannalaugar',
        name: 'Landmannalaugar',
        category: 'hotspring',
        coordinates: [63.9930, -19.0617],
        description: 'Paraíso geotérmico en las Tierras Altas con montañas de riolita multicolores y piscinas termales naturales entre campos de lava.',
        highlights: ['Montañas coloridas', 'Senderismo Laugavegur', 'Piscinas naturales'],
        visitDuration: 360,
        bestSeason: 'Junio-Septiembre'
    },
    {
        id: 'reykjadalur',
        name: 'Reykjadalur Hot Spring',
        category: 'hotspring',
        coordinates: [64.0302, -21.2142],
        description: 'Río termal natural donde puedes bañarte tras una caminata de 3 km por un valle humeante cerca de Hveragerði.',
        highlights: ['Río termal', 'Caminata escénica', 'Gratuito'],
        visitDuration: 180,
        bestSeason: 'Todo el año'
    },

    // === NATURALEZA ===
    {
        id: 'thingvellir',
        name: 'Þingvellir (Thingvellir)',
        category: 'nature',
        coordinates: [64.2559, -21.1299],
        description: 'Parque Nacional UNESCO donde se fundó el primer parlamento del mundo en 930. Aquí las placas tectónicas de América y Eurasia se separan.',
        highlights: ['Patrimonio UNESCO', 'Falla de Silfra', 'Parlamento vikingo'],
        visitDuration: 180,
        bestSeason: 'Todo el año'
    },
    {
        id: 'geysir',
        name: 'Geysir',
        category: 'nature',
        coordinates: [64.3104, -20.3024],
        description: 'Área geotérmica que dio nombre a todos los géiseres del mundo. El géiser Strokkur erupciona cada 5-10 minutos alcanzando 30 metros.',
        highlights: ['Strokkur activo', 'Origen del nombre géiser', 'Círculo Dorado'],
        visitDuration: 60,
        bestSeason: 'Todo el año'
    },
    {
        id: 'myvatn',
        name: 'Lago Mývatn',
        category: 'nature',
        coordinates: [65.6039, -17.0000],
        description: 'Lago volcánico rodeado de paisajes lunares, pseudocráteres, formaciones de lava y abundante avifauna. Zona geotérmica activa.',
        highlights: ['Pseudocráteres', 'Área geotérmica Hverir', 'Aves acuáticas'],
        visitDuration: 300,
        bestSeason: 'Verano'
    },
    {
        id: 'asbyrgi',
        name: 'Ásbyrgi',
        category: 'nature',
        coordinates: [66.0167, -16.5000],
        description: 'Espectacular cañón en forma de herradura según la leyenda creado por el caballo de ocho patas de Odín. Bosque de abedules y acantilados.',
        highlights: ['Forma de herradura', 'Mitología nórdica', 'Bosque de abedules'],
        visitDuration: 120,
        bestSeason: 'Verano'
    },
    {
        id: 'fjadrargljufur',
        name: 'Fjaðrárgljúfur',
        category: 'nature',
        coordinates: [63.7714, -18.1728],
        description: 'Dramático cañón de 100 metros de profundidad y 2 km de largo tallado por el río Fjaðrá. Paredes cubiertas de musgo verde intenso.',
        highlights: ['Cañón fotogénico', 'Miradores', 'Cerca de Kirkjubæjarklaustur'],
        visitDuration: 60,
        bestSeason: 'Verano'
    },
    {
        id: 'kerlingarfjoll',
        name: 'Kerlingarfjöll',
        category: 'nature',
        coordinates: [64.6333, -19.2833],
        description: 'Cordillera de montañas de riolita con colores vibrantes, fumarolas humeantes y glaciares. Paraíso para el senderismo en las Tierras Altas.',
        highlights: ['Montañas coloridas', 'Fumarolas', 'Tierras Altas'],
        visitDuration: 360,
        bestSeason: 'Julio-Agosto'
    },

    // === PLAYAS ===
    {
        id: 'reynisfjara',
        name: 'Reynisfjara',
        category: 'beach',
        coordinates: [63.4053, -19.0714],
        description: 'Famosa playa de arena negra volcánica con impresionantes columnas de basalto, la cueva Hálsanefshellir y los pilares marinos Reynisdrangar.',
        highlights: ['Arena negra', 'Columnas de basalto', 'Olas peligrosas'],
        visitDuration: 90,
        bestSeason: 'Todo el año'
    },
    {
        id: 'diamond-beach',
        name: 'Diamond Beach',
        category: 'beach',
        coordinates: [64.0444, -16.1778],
        description: 'Playa de arena negra volcánica donde los icebergs de Jökulsárlón llegan al mar y quedan varados brillando como diamantes.',
        highlights: ['Icebergs en la playa', 'Fotografía', 'Cerca de Jökulsárlón'],
        visitDuration: 60,
        bestSeason: 'Todo el año'
    },
    {
        id: 'stokksnes',
        name: 'Stokksnes',
        category: 'beach',
        coordinates: [64.2558, -14.9689],
        description: 'Dramático promontorio con dunas de arena negra y vistas icónicas de la montaña Vestrahorn. Uno de los lugares más fotografiados de Islandia.',
        highlights: ['Montaña Vestrahorn', 'Dunas negras', 'Atardecer espectacular'],
        visitDuration: 120,
        bestSeason: 'Todo el año'
    },

    // === MONUMENTOS ===
    {
        id: 'hallgrimskirkja',
        name: 'Hallgrímskirkja',
        category: 'landmark',
        coordinates: [64.1417, -21.9267],
        description: 'Icónica iglesia luterana de 74.5 metros, el edificio más alto de Islandia. Su diseño evoca las columnas de basalto islandesas. Torre con vistas panorámicas.',
        highlights: ['Edificio más alto', 'Órgano de 5275 tubos', 'Mirador'],
        visitDuration: 45,
        bestSeason: 'Todo el año'
    },
    {
        id: 'harpa',
        name: 'Harpa',
        category: 'landmark',
        coordinates: [64.1504, -21.9328],
        description: 'Espectacular sala de conciertos con fachada de cristal diseñada por Olafur Eliasson. Premio de Arquitectura de la UE 2013.',
        highlights: ['Arquitectura premiada', 'Fachada de cristal', 'Conciertos'],
        visitDuration: 60,
        bestSeason: 'Todo el año'
    },
    {
        id: 'sun-voyager',
        name: 'Sun Voyager (Sólfarið)',
        category: 'landmark',
        coordinates: [64.1478, -21.9223],
        description: 'Icónica escultura de acero en forma de barco vikingo junto al mar. Obra de Jón Gunnar Árnason, representa sueños y esperanza.',
        highlights: ['Escultura icónica', 'Atardecer', 'Paseo marítimo'],
        visitDuration: 20,
        bestSeason: 'Todo el año'
    },
    {
        id: 'perlan',
        name: 'Perlan',
        category: 'landmark',
        coordinates: [64.1297, -21.9178],
        description: 'Edificio futurista con cúpula de cristal que alberga museo, planetario y cueva de hielo artificial. Plataforma de observación con vistas 360°.',
        highlights: ['Cueva de hielo interior', 'Planetario', 'Vistas panorámicas'],
        visitDuration: 150,
        bestSeason: 'Todo el año'
    },
    {
        id: 'dyrholaey',
        name: 'Dyrhólaey',
        category: 'landmark',
        coordinates: [63.4019, -19.1264],
        description: 'Promontorio con arco de roca natural de 120 metros de altura. Colonia de frailecillos y vistas panorámicas de la costa sur.',
        highlights: ['Arco de roca', 'Frailecillos', 'Faro histórico'],
        visitDuration: 90,
        bestSeason: 'Mayo-Agosto'
    },
    {
        id: 'hvitserkur',
        name: 'Hvítserkur',
        category: 'landmark',
        coordinates: [65.6064, -20.6363],
        description: 'Roca basáltica de 15 metros en el mar que parece un dragón o dinosaurio bebiendo agua. Mejor al amanecer o atardecer.',
        highlights: ['Formación única', 'Fotografía', 'Leyenda del troll'],
        visitDuration: 60,
        bestSeason: 'Todo el año'
    }
];

/**
 * Get category info by ID
 */
export function getCategoryById(categoryId) {
    return categories.find(cat => cat.id === categoryId);
}

/**
 * Get POIs filtered by category
 */
export function getPoisByCategory(categoryId) {
    if (!categoryId || categoryId === 'all') {
        return pois;
    }
    return pois.filter(poi => poi.category === categoryId);
}

/**
 * Get POI by ID
 */
export function getPoiById(poiId) {
    return pois.find(poi => poi.id === poiId);
}

/**
 * Search POIs by name or description
 */
export function searchPois(query) {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return pois;

    return pois.filter(poi =>
        poi.name.toLowerCase().includes(normalizedQuery) ||
        poi.description.toLowerCase().includes(normalizedQuery)
    );
}

/**
 * Get POI count by category
 */
export function getPoiCountByCategory() {
    const counts = {};
    categories.forEach(cat => {
        counts[cat.id] = pois.filter(poi => poi.category === cat.id).length;
    });
    counts.all = pois.length;
    return counts;
}

export default {
    categories,
    pois,
    getCategoryById,
    getPoisByCategory,
    getPoiById,
    searchPois,
    getPoiCountByCategory
};
