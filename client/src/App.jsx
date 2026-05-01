import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LayoutBuilder from './pages/LayoutBuilder';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/layout-builder" element={<LayoutBuilder />} />
      </Routes>
    </Layout>
  )
}

export default App;
