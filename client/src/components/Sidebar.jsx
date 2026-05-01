export default function Sidebar() {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'tests', label: 'Tests Cognitivos', icon: '🧠' },
    { id: 'patients', label: 'Pacientes', icon: '👥' },
    { id: 'reports', label: 'Informes', icon: '📄' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0 hidden md:flex flex-col transition-colors duration-300">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold gradient-text">AttentionBuddy</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item, index) => (
          <a
            key={item.id}
            href="#"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              index === 0 
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>
    </aside>
  );
}
