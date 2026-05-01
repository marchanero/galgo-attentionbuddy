import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6 sticky top-0 z-20 transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Aquí podría ir un toggle para el sidebar en móvil */}
        <h2 className="text-xl font-semibold gradient-text hidden sm:block">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus-ring"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        
        <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 flex items-center justify-center font-bold border border-primary-200 dark:border-primary-800">
          U
        </div>
      </div>
    </nav>
  );
}
