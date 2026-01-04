import React, { useState } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '@context/AuthContext';
import { statsAPI } from '@api/stats';
import { FaDownload, FaFileExport, FaFileCsv, FaFileCode } from 'react-icons/fa';

const DataExport: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  const exportToJSON = async () => {
    if (!user) return;
    
    try {
      setExporting(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const data = await statsAPI.get(token, user.id);
      
      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName
        },
        exportDate: new Date().toISOString(),
        statistics: {
          overall: data.overall,
          byMode: data.byMode,
          wpmProgression: data.wpmProgression
        },
        sessions: data.recent
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mecano-stats-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Error al exportar datos');
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = async () => {
    if (!user) return;
    
    try {
      setExporting(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const data = await statsAPI.get(token, user.id);
      
      // Create CSV header
      let csv = 'Fecha,Modo,Nivel,WPM,Precisión,Errores,Duración\n';
      
      // Add data rows
      data.recent.forEach((session: any) => {
        csv += `${new Date(session.created_at).toLocaleString()},${session.mode},${session.level_number || ''},${session.wpm},${session.accuracy},${session.errors || 0},${session.duration}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mecano-stats-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error al exportar datos');
    } finally {
      setExporting(false);
    }
  };

  const exportSummary = async () => {
    if (!user) return;
    
    try {
      setExporting(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const data = await statsAPI.get(token, user.id);
      
      const summary = `
REPORTE DE ESTADÍSTICAS - MECANO
================================
Usuario: ${user.displayName || user.email}
Fecha: ${new Date().toLocaleDateString('es-ES')}

RESUMEN GENERAL
--------------
WPM Promedio: ${Math.round(data.overall.avg_wpm)}
WPM Máximo: ${Math.round(data.overall.max_wpm)}
Precisión Promedio: ${data.overall.avg_accuracy.toFixed(1)}%
Sesiones Totales: ${data.overall.total_sessions}
Tiempo Total: ${Math.floor(data.overall.total_time / 3600)}h ${Math.floor((data.overall.total_time % 3600) / 60)}m

RENDIMIENTO POR MODO
-------------------
${data.byMode.map((mode: any) => `
${mode.mode}:
  - WPM Promedio: ${Math.round(mode.avg_wpm)}
  - WPM Máximo: ${Math.round(mode.max_wpm)}
  - Precisión: ${mode.avg_accuracy.toFixed(1)}%
  - Sesiones: ${mode.sessions}
  - Tiempo: ${Math.floor(mode.total_time / 60)} minutos
`).join('\n')}

PROGRESIÓN WPM (Últimos 30 días)
-------------------------------
${data.wpmProgression.map((day: any) => 
  `${new Date(day.date).toLocaleDateString('es-ES')}: ${Math.round(day.avg_wpm)} WPM (máx: ${Math.round(day.max_wpm)})`
).join('\n')}
      `.trim();

      const blob = new Blob([summary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mecano-resumen-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting summary:', error);
      alert('Error al exportar resumen');
    } finally {
      setExporting(false);
    }
  };

  if (!user) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <p>Debes iniciar sesión para exportar datos</p>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaFileExport /> Exportar Datos
      </h2>
      <p className="mb-6 opacity-75">
        Descarga tus estadísticas en diferentes formatos para análisis externo o respaldo
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* JSON Export */}
        <button
          onClick={exportToJSON}
          disabled={exporting}
          className={`p-6 rounded-lg border-2 transition-all ${
            isDarkMode 
              ? 'border-gray-600 hover:border-blue-500 bg-gray-700' 
              : 'border-gray-300 hover:border-blue-500 bg-white'
          } ${exporting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
        >
          <FaFileCode className="text-4xl mb-3 text-blue-500 mx-auto" />
          <h3 className="font-bold text-lg mb-2">Formato JSON</h3>
          <p className="text-sm opacity-75 mb-4">
            Datos completos en formato JSON para análisis programático
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-500">
            <FaDownload />
            <span>Descargar JSON</span>
          </div>
        </button>

        {/* CSV Export */}
        <button
          onClick={exportToCSV}
          disabled={exporting}
          className={`p-6 rounded-lg border-2 transition-all ${
            isDarkMode 
              ? 'border-gray-600 hover:border-green-500 bg-gray-700' 
              : 'border-gray-300 hover:border-green-500 bg-white'
          } ${exporting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
        >
          <FaFileCsv className="text-4xl mb-3 text-green-500 mx-auto" />
          <h3 className="font-bold text-lg mb-2">Formato CSV</h3>
          <p className="text-sm opacity-75 mb-4">
            Tabla de sesiones para Excel o Google Sheets
          </p>
          <div className="flex items-center justify-center gap-2 text-green-500">
            <FaDownload />
            <span>Descargar CSV</span>
          </div>
        </button>

        {/* Text Summary */}
        <button
          onClick={exportSummary}
          disabled={exporting}
          className={`p-6 rounded-lg border-2 transition-all ${
            isDarkMode 
              ? 'border-gray-600 hover:border-purple-500 bg-gray-700' 
              : 'border-gray-300 hover:border-purple-500 bg-white'
          } ${exporting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
        >
          <FaFileExport className="text-4xl mb-3 text-purple-500 mx-auto" />
          <h3 className="font-bold text-lg mb-2">Resumen de Texto</h3>
          <p className="text-sm opacity-75 mb-4">
            Reporte legible en formato de texto plano
          </p>
          <div className="flex items-center justify-center gap-2 text-purple-500">
            <FaDownload />
            <span>Descargar TXT</span>
          </div>
        </button>
      </div>

      {/* Info */}
      <div className={`mt-6 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className="font-bold mb-2">ℹ️ Información sobre la Exportación</h3>
        <ul className="text-sm opacity-90 space-y-1">
          <li>• Los datos exportados incluyen todas tus sesiones recientes</li>
          <li>• El formato JSON contiene la información más completa</li>
          <li>• El CSV es ideal para análisis en hojas de cálculo</li>
          <li>• El resumen de texto es perfecto para compartir o imprimir</li>
        </ul>
      </div>
    </div>
  );
};

export default DataExport;
