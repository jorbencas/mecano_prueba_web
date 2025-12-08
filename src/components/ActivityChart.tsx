import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ActivityChartProps {
  data: Array<{ component: string; count: number; time: number }>;
  title: string;
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data, title }) => {
  const { isDarkMode } = useTheme();
  
  if (data.length === 0) {
    return (
      <div className={`p-6 rounded-xl border backdrop-blur-md shadow-lg ${
        isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'
      }`}>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.count));
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // orange
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ];

  return (
    <div className={`p-6 rounded-xl border backdrop-blur-md shadow-lg ${
      isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-white/50'
    }`}>
      <h3 className="text-xl font-bold mb-6">{title}</h3>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.count / maxValue) * 100;
          const color = colors[index % colors.length];
          
          return (
            <div key={item.component}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{item.component}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">{item.count} actividades</span>
                  <span className="text-gray-500">
                    {Math.floor(item.time / 60)}m {item.time % 60}s
                  </span>
                </div>
              </div>
              
              <div className={`w-full h-3 rounded-full overflow-hidden ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}40`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityChart;
