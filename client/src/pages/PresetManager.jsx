import { useState, useEffect } from 'react';

const HEAD_POSES = ['LOOKING_FRONT', 'LOOKING_DOWN', 'LOOKING_AWAY', 'LOOKING_PEER', 'NOT_VISIBLE'];
const BODY_POSTURES = ['UPRIGHT', 'SLOUCHED', 'LEANING_FORWARD', 'LEANING_BACK', 'TURNED_AWAY', 'NOT_VISIBLE'];
const ACTIVITIES = ['WRITING', 'READING', 'HAND_RAISED', 'TALKING', 'USING_DEVICE', 'IDLE', 'DISRUPTIVE', 'NOT_VISIBLE'];
const ENGAGEMENTS = ['ACTIVE', 'PASSIVE', 'DISTRACTED', 'ASLEEP', 'NOT_VISIBLE'];
const PERCEPTIONS = ['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
const ICONS = ['🔴', '🟠', '🟡', '🟢', '💚', '⚪', '🔵', '🟤', '⚫'];

const PERCEPTION_BADGES = {
  VERY_LOW: 'bg-red-100 text-red-700', LOW: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700', HIGH: 'bg-green-100 text-green-700',
  VERY_HIGH: 'bg-emerald-100 text-emerald-700',
};

export default function PresetManager() {
  const [presets, setPresets] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', icon: '🟢', shortcutKey: '1', teacherPerception: 'HIGH',
    headPose: 'LOOKING_FRONT', bodyPosture: 'UPRIGHT', activity: 'WRITING', engagement: 'ACTIVE'
  });

  const loadPresets = () => {
    fetch('http://localhost:5000/api/presets').then(r => r.json()).then(setPresets).catch(console.error);
  };

  useEffect(() => {
    // Seed first, then load
    fetch('http://localhost:5000/api/presets/seed', { method: 'POST' }).then(() => loadPresets());
  }, []);

  const startEdit = (preset) => {
    setEditing(preset._id);
    setForm({
      name: preset.name, icon: preset.icon, shortcutKey: preset.shortcutKey,
      teacherPerception: preset.teacherPerception,
      headPose: preset.observableIndicators?.headPose || 'NOT_VISIBLE',
      bodyPosture: preset.observableIndicators?.bodyPosture || 'NOT_VISIBLE',
      activity: preset.observableIndicators?.activity || 'NOT_VISIBLE',
      engagement: preset.observableIndicators?.engagement || 'NOT_VISIBLE',
    });
  };

  const startNew = () => {
    setEditing('new');
    setForm({ name: '', icon: '🟢', shortcutKey: String(presets.length + 1), teacherPerception: 'HIGH', headPose: 'LOOKING_FRONT', bodyPosture: 'UPRIGHT', activity: 'WRITING', engagement: 'ACTIVE' });
  };

  const savePreset = async () => {
    const body = {
      name: form.name, icon: form.icon, shortcutKey: form.shortcutKey, teacherPerception: form.teacherPerception,
      observableIndicators: { headPose: form.headPose, bodyPosture: form.bodyPosture, activity: form.activity, engagement: form.engagement }
    };
    if (editing === 'new') {
      await fetch('http://localhost:5000/api/presets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      await fetch(`http://localhost:5000/api/presets/${editing}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setEditing(null);
    loadPresets();
  };

  const deletePreset = async (id) => {
    if (!confirm('¿Eliminar este preset?')) return;
    await fetch(`http://localhost:5000/api/presets/${id}`, { method: 'DELETE' });
    loadPresets();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Presets de Etiquetado</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Configura plantillas predefinidas para etiquetar con un solo clic o atajo de teclado.
          </p>
        </div>
        <button className="btn-primary" onClick={startNew}>+ Nuevo Preset</button>
      </div>

      {/* Editor */}
      {editing && (
        <div className="card-elevated mb-6 animate-scale-in">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">{editing === 'new' ? 'Crear Preset' : 'Editar Preset'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Ej: Atento escribiendo" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Icono</label>
              <div className="flex gap-1 flex-wrap">
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                    className={`w-8 h-8 rounded flex items-center justify-center text-lg ${form.icon === ic ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-400' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Atajo de Teclado</label>
              <select value={form.shortcutKey} onChange={e => setForm(f => ({ ...f, shortcutKey: e.target.value }))} className="input-field">
                {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={String(n)}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Percepción</label>
              <select value={form.teacherPerception} onChange={e => setForm(f => ({ ...f, teacherPerception: e.target.value }))} className="input-field !text-xs">
                {PERCEPTIONS.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Cabeza</label>
              <select value={form.headPose} onChange={e => setForm(f => ({ ...f, headPose: e.target.value }))} className="input-field !text-xs">
                {HEAD_POSES.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Postura</label>
              <select value={form.bodyPosture} onChange={e => setForm(f => ({ ...f, bodyPosture: e.target.value }))} className="input-field !text-xs">
                {BODY_POSTURES.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Actividad</label>
              <select value={form.activity} onChange={e => setForm(f => ({ ...f, activity: e.target.value }))} className="input-field !text-xs">
                {ACTIVITIES.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Engagement</label>
              <select value={form.engagement} onChange={e => setForm(f => ({ ...f, engagement: e.target.value }))} className="input-field !text-xs">
                {ENGAGEMENTS.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={savePreset} className="btn-primary">💾 Guardar Preset</button>
            <button onClick={() => setEditing(null)} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map(p => (
          <div key={p._id} className="card hover-lift group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{p.name}</h4>
                  <kbd className="mt-0.5 inline-block px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-mono text-gray-600 dark:text-gray-400">Tecla {p.shortcutKey}</kbd>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(p)} className="text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 p-1 rounded text-xs">✏️</button>
                <button onClick={() => deletePreset(p._id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded text-xs">🗑️</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PERCEPTION_BADGES[p.teacherPerception] || ''}`}>{p.teacherPerception?.replace(/_/g, ' ')}</span>
              <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{p.observableIndicators?.headPose?.replace(/_/g, ' ')}</span>
              <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{p.observableIndicators?.activity?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
