import { useState } from 'react'
import Layout from './components/Layout'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Layout>
      <div className="mb-8 animate-slide-up">
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Bienvenido a AttentionBuddy</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Aplicando el estilo visual estructurado de Galgo School Manager
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Component Example */}
        <div className="card-elevated animate-fade-in hover-lift">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Estadísticas Rápidas</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-primary-50 dark:bg-gray-800 p-4 rounded-lg border border-primary-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pacientes</p>
              <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">124</p>
            </div>
            <div className="bg-secondary-50 dark:bg-gray-800 p-4 rounded-lg border border-secondary-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tests Hoy</p>
              <p className="text-2xl font-bold text-secondary-700 dark:text-secondary-400">12</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Buscar paciente..." 
              className="input-field"
            />
            <div className="flex gap-3">
              <button className="btn-primary flex-1" onClick={() => setCount(c => c + 1)}>
                Acción Principal ({count})
              </button>
              <button className="btn-secondary flex-1">
                Secundaria
              </button>
            </div>
          </div>
        </div>

        {/* Glass Effect Example */}
        <div className="relative rounded-xl overflow-hidden p-8 flex items-center justify-center min-h-[300px] animate-fade-in" style={{ transitionDelay: '100ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 opacity-20 dark:opacity-40"></div>
          
          <div className="glass p-6 rounded-xl relative z-10 w-full text-center hover-lift shadow-lg">
            <div className="live-indicator mx-auto w-max mb-4 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Sistema Activo
            </div>
            <h4 className="text-lg font-bold mb-2 dark:text-white">Panel de Control</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              El diseño ahora respeta exactamente los mismos colores, fondos y estructura del repositorio original.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default App
