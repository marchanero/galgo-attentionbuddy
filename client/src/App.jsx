import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">
        MERN Stack + Vite + Tailwind CSS
      </h1>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center">
        <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">
          Client is ready to go!
        </p>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>
        <p className="mt-4 text-sm text-gray-500">
          Edit <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">src/App.jsx</code> and save to test HMR
        </p>
      </div>
    </div>
  )
}

export default App
