/**
 * Export Service for Iceland Geoportal
 * Handles PDF, HTML, and JSON export of routes
 */

import { formatDistance, formatDuration } from './routing.js';

/**
 * Generate PDF report using jsPDF
 */
export async function exportToPDF(route, options = {}) {
    const { jsPDF } = window.jspdf;

    // Create PDF document
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Colors
    const primaryColor = [0, 102, 204];
    const textColor = [30, 41, 59];
    const mutedColor = [100, 116, 139];

    // Helper function to add text
    const addText = (text, x, y, size = 10, color = textColor, style = 'normal') => {
        doc.setFontSize(size);
        doc.setTextColor(...color);
        doc.setFont('helvetica', style);
        doc.text(text, x, y);
        return y + (size * 0.5);
    };

    // ==================== HEADER ====================
    // Logo/Title
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Iceland Geoportal', margin, 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Informe de Ruta', margin, 30);

    yPos = 55;

    // ==================== ROUTE INFO ====================
    // Route name
    doc.setFontSize(20);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.text(route.name || 'Ruta sin nombre', margin, yPos);
    yPos += 10;

    // Date
    doc.setFontSize(10);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date(route.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(`Creada: ${dateStr}`, margin, yPos);
    yPos += 15;

    // ==================== STATS BOX ====================
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 30, 3, 3, 'F');

    const statsY = yPos + 12;
    const colWidth = (pageWidth - (margin * 2)) / 4;

    // Stat items
    const stats = [
        { label: 'Puntos', value: route.waypoints?.length || 0 },
        { label: 'Distancia', value: formatDistance(route.distance || 0) },
        { label: 'Duración', value: formatDuration(route.duration || 0) },
        { label: 'Transporte', value: getTransportName(route.transportMode) }
    ];

    stats.forEach((stat, i) => {
        const x = margin + (colWidth * i) + (colWidth / 2);

        doc.setFontSize(8);
        doc.setTextColor(...mutedColor);
        doc.text(stat.label.toUpperCase(), x, statsY, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'bold');
        doc.text(String(stat.value), x, statsY + 10, { align: 'center' });
    });

    yPos += 45;

    // ==================== DESCRIPTION ====================
    if (route.description) {
        doc.setFontSize(12);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Descripción', margin, yPos);
        yPos += 7;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(route.description, pageWidth - (margin * 2));
        doc.text(descLines, margin, yPos);
        yPos += (descLines.length * 5) + 10;
    }

    // ==================== WAYPOINTS ====================
    doc.setFontSize(12);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Paradas de la Ruta', margin, yPos);
    yPos += 10;

    if (route.waypoints && route.waypoints.length > 0) {
        route.waypoints.forEach((wp, index) => {
            // Check if we need a new page
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = margin;
            }

            // Waypoint number circle
            doc.setFillColor(...primaryColor);
            doc.circle(margin + 5, yPos - 2, 4, 'F');
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.text(String(index + 1), margin + 5, yPos, { align: 'center' });

            // Waypoint name
            doc.setFontSize(11);
            doc.setTextColor(...textColor);
            doc.setFont('helvetica', 'bold');
            doc.text(wp.name || `Punto ${index + 1}`, margin + 15, yPos);

            // Category
            if (wp.category) {
                doc.setFontSize(9);
                doc.setTextColor(...mutedColor);
                doc.setFont('helvetica', 'normal');
                doc.text(wp.category, margin + 15, yPos + 5);
                yPos += 5;
            }

            // Coordinates
            if (wp.coordinates) {
                doc.setFontSize(8);
                doc.setTextColor(...mutedColor);
                const coordStr = `${wp.coordinates[0].toFixed(4)}°N, ${Math.abs(wp.coordinates[1]).toFixed(4)}°W`;
                doc.text(coordStr, margin + 15, yPos + 5);
            }

            yPos += 15;

            // Connection line
            if (index < route.waypoints.length - 1) {
                doc.setDrawColor(...primaryColor);
                doc.setLineDash([1, 1]);
                doc.line(margin + 5, yPos - 12, margin + 5, yPos - 2);
            }
        });
    }

    // ==================== MAP CAPTURE ====================
    if (options.includeMap && options.mapElement) {
        try {
            // Check if we need a new page for the map
            if (yPos > pageHeight - 100) {
                doc.addPage();
                yPos = margin;
            }

            yPos += 10;
            doc.setFontSize(12);
            doc.setTextColor(...textColor);
            doc.setFont('helvetica', 'bold');
            doc.text('Mapa de la Ruta', margin, yPos);
            yPos += 10;

            const canvas = await html2canvas(options.mapElement, {
                useCORS: true,
                allowTaint: true,
                scale: 2
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            const imgWidth = pageWidth - (margin * 2);
            const imgHeight = (canvas.height / canvas.width) * imgWidth;

            // Ensure map fits on page
            const maxHeight = pageHeight - yPos - margin;
            const finalHeight = Math.min(imgHeight, maxHeight);
            const finalWidth = (finalHeight / imgHeight) * imgWidth;

            doc.addImage(imgData, 'JPEG', margin, yPos, finalWidth, finalHeight);
            yPos += finalHeight + 10;
        } catch (error) {
            console.error('Error capturing map:', error);
        }
    }

    // ==================== FOOTER ====================
    const addFooter = (pageNum) => {
        doc.setFontSize(8);
        doc.setTextColor(...mutedColor);
        doc.text(
            `Generado por Iceland Geoportal - Página ${pageNum}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    };

    // Add footers to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(i);
    }

    // Save PDF
    const fileName = `ruta-${(route.name || 'sin-nombre').toLowerCase().replace(/\s+/g, '-')}.pdf`;
    doc.save(fileName);

    return fileName;
}

/**
 * Generate HTML report
 */
export function exportToHTML(route, options = {}) {
    const stats = {
        points: route.waypoints?.length || 0,
        distance: formatDistance(route.distance || 0),
        duration: formatDuration(route.duration || 0),
        transport: getTransportName(route.transportMode)
    };

    const dateStr = new Date(route.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${route.name || 'Ruta'} - Iceland Geoportal</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: #f8fafc;
            padding: 40px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #0066cc 0%, #004d99 100%);
            color: white;
            padding: 30px 40px;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 5px;
        }
        .header p {
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 40px;
        }
        .route-title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 5px;
        }
        .route-date {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 30px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            padding: 25px;
            background: #f8fafc;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .stat-item {
            text-align: center;
        }
        .stat-label {
            font-size: 11px;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
        }
        .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            margin-top: 5px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        .description {
            color: #475569;
            font-size: 15px;
        }
        .waypoints-list {
            list-style: none;
        }
        .waypoint-item {
            display: flex;
            align-items: flex-start;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            margin-bottom: 10px;
        }
        .waypoint-number {
            width: 28px;
            height: 28px;
            background: #0066cc;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 12px;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .waypoint-info h4 {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 3px;
        }
        .waypoint-info p {
            font-size: 13px;
            color: #64748b;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #94a3b8;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
            }
        }
        @media (max-width: 600px) {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Iceland Geoportal</h1>
            <p>Informe de Ruta</p>
        </div>
        <div class="content">
            <h2 class="route-title">${route.name || 'Ruta sin nombre'}</h2>
            <p class="route-date">Creada: ${dateStr}</p>

            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">Puntos</div>
                    <div class="stat-value">${stats.points}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Distancia</div>
                    <div class="stat-value">${stats.distance}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Duración</div>
                    <div class="stat-value">${stats.duration}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Transporte</div>
                    <div class="stat-value">${stats.transport}</div>
                </div>
            </div>

            ${route.description ? `
            <div class="section">
                <h3 class="section-title">Descripción</h3>
                <p class="description">${route.description}</p>
            </div>
            ` : ''}

            <div class="section">
                <h3 class="section-title">Paradas de la Ruta</h3>
                <ul class="waypoints-list">
                    ${(route.waypoints || []).map((wp, i) => `
                    <li class="waypoint-item">
                        <span class="waypoint-number">${i + 1}</span>
                        <div class="waypoint-info">
                            <h4>${wp.name || `Punto ${i + 1}`}</h4>
                            <p>${wp.coordinates ? `${wp.coordinates[0].toFixed(4)}°N, ${Math.abs(wp.coordinates[1]).toFixed(4)}°W` : ''}</p>
                        </div>
                    </li>
                    `).join('')}
                </ul>
            </div>
        </div>
        <div class="footer">
            Generado por Iceland Geoportal | ${new Date().toLocaleDateString('es-ES')}
        </div>
    </div>
</body>
</html>
`;

    // Download HTML file
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ruta-${(route.name || 'sin-nombre').toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return link.download;
}

/**
 * Export route as JSON
 */
export function exportToJSON(route) {
    const exportData = {
        exportDate: new Date().toISOString(),
        source: 'Iceland Geoportal',
        route: {
            name: route.name,
            description: route.description,
            waypoints: route.waypoints,
            distance: route.distance,
            duration: route.duration,
            transportMode: route.transportMode,
            createdAt: route.createdAt
        }
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ruta-${(route.name || 'sin-nombre').toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return link.download;
}

/**
 * Get transport mode display name
 */
function getTransportName(mode) {
    const names = {
        driving: 'Coche',
        cycling: 'Bicicleta',
        walking: 'A pie'
    };
    return names[mode] || 'Coche';
}

export default {
    exportToPDF,
    exportToHTML,
    exportToJSON
};
