import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LayoutBuilder from './pages/LayoutBuilder';
import VideoAnnotator from './pages/VideoAnnotator';
import PresetManager from './pages/PresetManager';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/layout-builder" element={<LayoutBuilder />} />
        <Route path="/presets" element={<PresetManager />} />
        <Route path="/sessions" element={<VideoAnnotator />} />
      </Routes>
    </Layout>
  )
}

export default App;
