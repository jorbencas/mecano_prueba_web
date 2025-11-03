import React, { useEffect, useState } from 'react';
import { loadStats, clearStats, SavedStat } from '../utils/saveStats';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const FILTER_KEY = 'statsFilter';

const StatsHistory: React.FC = () => {
  const [stats, setStats] = useState<SavedStat[]>([]);
  const [filter, setFilter] = useState<string>(() => localStorage.getItem(FILTER_KEY) || 'Todos');
  const { isDarkMode } = useTheme();

  useEffect(() => {
    setStats(loadStats());
  }, []);

  const filteredStats = stats.filter((s) =>
    filter === 'Todos' ? true : s.sourceComponent === filter
  );

  const handleFilterChange = (value: string) => {
    setFilter(value);
    localStorage.setItem(FILTER_KEY, value);
  };

  const handleClear = () => {
    if (window.confirm('¿Deseas borrar todo el historial de estadísticas?')) {
      clearStats();
      setStats([]);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Historial de Estadísticas</h2>

      <div className="flex flex-wrap justify-between items-center mb-4">
        <select
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className={` p-2 border rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
        >
          <option value="Todos">Todos</option>
          <option value="Levels">Niveles</option>
          <option value="PlayGame">Juego Libre</option>
          <option value="CreateText">Textos Personalizados</option>
        </select>

        <button
          onClick={handleClear}
          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-700 transition"
        >
          Borrar Historial
        </button>
      </div>

      <div className="h-64 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="wpm" name="WPM" stroke="#2563eb" />
            <Line type="monotone" dataKey="accuracy" name="Precisión (%)" stroke="#16a34a" />
            <Line type="monotone" dataKey="errors" name="Errores" stroke="#dc2626" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}>
          <tr>
            <th className="p-2 text-left">Fecha</th>
            <th className="p-2 text-left">Origen</th>
            <th className="p-2 text-left">Nivel</th>
            <th className="p-2 text-left">WPM</th>
            <th className="p-2 text-left">Precisión</th>
            <th className="p-2 text-left">Errores</th>
            <th className="p-2 text-left">Tiempo</th>
          </tr>
        </thead>
        <tbody>
          {filteredStats.map((stat, index) => (
            <tr key={index} className="border-b hover:bg-gray-100">
              <td className="p-2">{new Date(stat.date || '').toLocaleString()}</td>
              <td className="p-2">{stat.sourceComponent}</td>
              <td className="p-2">{stat.level}</td>
              <td className="p-2">{stat.wpm}</td>
              <td className="p-2">{stat.accuracy.toFixed(1)}%</td>
              <td className="p-2">{stat.errors}</td>
              <td className="p-2">{Math.round(stat.elapsedTime)}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatsHistory;