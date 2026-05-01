import { useState, useRef, useEffect, Fragment, useCallback } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

const PERCEPTION_COLORS = {
  VERY_LOW:  'rgba(220, 38, 38, 0.55)',
  LOW:       'rgba(249, 115, 22, 0.50)',
  MEDIUM:    'rgba(234, 179, 8, 0.50)',
  HIGH:      'rgba(34, 197, 94, 0.50)',
  VERY_HIGH: 'rgba(16, 185, 129, 0.55)',
};

const PERCEPTION_BADGES = {
  VERY_LOW:  'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  LOW:       'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  MEDIUM:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  HIGH:      'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  VERY_HIGH: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
};

const HEAD_POSES = ['LOOKING_FRONT', 'LOOKING_DOWN', 'LOOKING_AWAY', 'LOOKING_PEER', 'NOT_VISIBLE'];
const BODY_POSTURES = ['UPRIGHT', 'SLOUCHED', 'LEANING_FORWARD', 'LEANING_BACK', 'TURNED_AWAY', 'NOT_VISIBLE'];
const ACTIVITIES = ['WRITING', 'READING', 'HAND_RAISED', 'TALKING', 'USING_DEVICE', 'IDLE', 'DISRUPTIVE', 'NOT_VISIBLE'];
const ENGAGEMENTS = ['ACTIVE', 'PASSIVE', 'DISTRACTED', 'ASLEEP', 'NOT_VISIBLE'];

export default function VideoAnnotator() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [layouts, setLayouts] = useState([]);
  const [activeLayout, setActiveLayout] = useState(null);

  // Presets
  const [presets, setPresets] = useState([]);
  const [activePreset, setActivePreset] = useState(null);

  // Detail mode (double click)
  const [detailZone, setDetailZone] = useState(null);
  const [labelForm, setLabelForm] = useState({
    teacherPerception: 'MEDIUM', headPose: 'NOT_VISIBLE', bodyPosture: 'NOT_VISIBLE',
    activity: 'NOT_VISIBLE', engagement: 'NOT_VISIBLE', notes: ''
  });

  const videoWidth = 800;
  const videoHeight = 450;
  const zones = activeLayout ? activeLayout.zones : [];

  // Helpers
  const zoneX = (z) => z.x ?? z.coordinates?.x ?? 0;
  const zoneY = (z) => z.y ?? z.coordinates?.y ?? 0;
  const zoneW = (z) => z.width ?? z.coordinates?.width ?? 0;
  const zoneH = (z) => z.height ?? z.coordinates?.height ?? 0;
  const zoneKey = (z) => z.id || z._id;
  const getZoneLabel = (zoneId) => zones.find(z => zoneKey(z) === zoneId)?.label || 'Zona';

  // ─── Load layouts & presets ───
  useEffect(() => {
    fetch('http://localhost:5000/api/layouts')
      .then(r => r.json()).then(data => { setLayouts(data); if (data.length > 0) setActiveLayout(data[0]); })
      .catch(console.error);

    // Seed presets if empty, then load
    fetch('http://localhost:5000/api/presets/seed', { method: 'POST' })
      .then(() => fetch('http://localhost:5000/api/presets'))
      .then(r => r.json()).then(data => { setPresets(data); if (data.length > 0) setActivePreset(data[0]); })
      .catch(console.error);
  }, []);

  // ─── Video event listeners ───
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrentTime(v.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onMeta = () => setDuration(v.duration);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('loadedmetadata', onMeta);
    return () => { v.removeEventListener('timeupdate', onTime); v.removeEventListener('play', onPlay); v.removeEventListener('pause', onPause); v.removeEventListener('loadedmetadata', onMeta); };
  }, []);

  // ─── Keyboard shortcuts ───
  const handleKeyDown = useCallback((e) => {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    if (e.code === 'Space') { e.preventDefault(); togglePlay(); return; }
    if (e.code === 'ArrowLeft') { e.preventDefault(); videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5); return; }
    if (e.code === 'ArrowRight') { e.preventDefault(); videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5); return; }
    if (e.key === 'd' || e.key === 'D') { setDetailZone(prev => prev ? null : prev); return; }

    // Number keys 1-9 to select preset
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) {
      const preset = presets.find(p => p.shortcutKey === e.key);
      if (preset) setActivePreset(preset);
    }
  }, [presets, duration]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const togglePlay = () => { if (videoRef.current.paused) videoRef.current.play(); else videoRef.current.pause(); };
  const changeSpeed = (s) => { videoRef.current.playbackRate = s; setPlaybackRate(s); };

  // ─── Quick mode: single click applies active preset ───
  const applyPresetToZone = async (zoneId) => {
    if (!activePreset) return;
    if (isPlaying) videoRef.current.pause();

    const annotation = {
      id: Date.now().toString(),
      timestamp: currentTime,
      zoneId,
      teacherPerception: activePreset.teacherPerception,
      observableIndicators: activePreset.observableIndicators,
      notes: '',
      presetName: activePreset.name,
      presetIcon: activePreset.icon,
    };

    setAnnotations(prev => {
      const filtered = prev.filter(a => !(a.zoneId === zoneId && Math.abs(a.timestamp - currentTime) < 0.5));
      return [...filtered, annotation];
    });

    const MOCK_SESSION_ID = '641a2b3c4d5e6f7a8b9c0d1e';
    try {
      await fetch('http://localhost:5000/api/annotations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: MOCK_SESSION_ID, timestamp: currentTime, zoneId, teacherPerception: activePreset.teacherPerception, observableIndicators: activePreset.observableIndicators, notes: '' })
      });
    } catch (err) { console.error(err); }
  };

  // ─── Detail mode: double click opens full form ───
  const handleZoneDoubleClick = (zoneId) => {
    if (isPlaying) videoRef.current.pause();
    setDetailZone(zoneId);
    const existing = annotations.find(a => a.zoneId === zoneId && Math.abs(a.timestamp - currentTime) < 0.5);
    if (existing) {
      setLabelForm({
        teacherPerception: existing.teacherPerception || 'MEDIUM',
        headPose: existing.observableIndicators?.headPose || 'NOT_VISIBLE',
        bodyPosture: existing.observableIndicators?.bodyPosture || 'NOT_VISIBLE',
        activity: existing.observableIndicators?.activity || 'NOT_VISIBLE',
        engagement: existing.observableIndicators?.engagement || 'NOT_VISIBLE',
        notes: existing.notes || ''
      });
    } else {
      setLabelForm({ teacherPerception: 'MEDIUM', headPose: 'NOT_VISIBLE', bodyPosture: 'NOT_VISIBLE', activity: 'NOT_VISIBLE', engagement: 'NOT_VISIBLE', notes: '' });
    }
  };

  const saveDetailAnnotation = async () => {
    if (!detailZone) return;
    const annotation = {
      id: Date.now().toString(), timestamp: currentTime, zoneId: detailZone,
      teacherPerception: labelForm.teacherPerception,
      observableIndicators: { headPose: labelForm.headPose, bodyPosture: labelForm.bodyPosture, activity: labelForm.activity, engagement: labelForm.engagement },
      notes: labelForm.notes, presetName: 'Manual', presetIcon: '✏️'
    };
    setAnnotations(prev => {
      const filtered = prev.filter(a => !(a.zoneId === detailZone && Math.abs(a.timestamp - currentTime) < 0.5));
      return [...filtered, annotation];
    });
    const MOCK_SESSION_ID = '641a2b3c4d5e6f7a8b9c0d1e';
    try { await fetch('http://localhost:5000/api/annotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: MOCK_SESSION_ID, ...annotation }) }); } catch (err) { console.error(err); }
    setDetailZone(null);
  };

  const getZoneColor = (zoneId) => {
    const ann = annotations.find(a => a.zoneId === zoneId && Math.abs(a.timestamp - currentTime) < 0.5);
    if (!ann) return "rgba(255, 255, 255, 0.12)";
    return PERCEPTION_COLORS[ann.teacherPerception] || "rgba(255,255,255,0.12)";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Etiquetado de Vídeo</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-mono">1-7</kbd> cambiar preset · <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-mono">Clic</kbd> aplicar · <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-mono">Doble clic</kbd> modo detallado · <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-mono">Espacio</kbd> play/pausa · <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-mono">←→</kbd> ±5s
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeLayout && (
            <select value={activeLayout?._id || ''} onChange={(e) => setActiveLayout(layouts.find(l => l._id === e.target.value))} className="input-field !w-auto text-sm !py-1.5">
              {layouts.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
          )}
          <div className="text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-lg">
            {annotations.length} etiquetas
          </div>
        </div>
      </div>

      {/* Barra de Presets */}
      <div className="mb-3 flex gap-1.5 flex-wrap">
        {presets.map(p => (
          <button key={p._id} onClick={() => setActivePreset(p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              activePreset?._id === p._id
                ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-400 dark:border-primary-600 text-primary-700 dark:text-primary-300 ring-2 ring-primary-300 dark:ring-primary-700'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
            <span>{p.icon}</span>
            <span className="hidden sm:inline">{p.name}</span>
            <kbd className="ml-1 px-1 py-0.5 bg-gray-200/80 dark:bg-gray-700 rounded text-[9px] font-mono">{p.shortcutKey}</kbd>
          </button>
        ))}
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Panel Central */}
        <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="relative bg-black flex-1 flex items-center justify-center overflow-hidden">
            <video ref={videoRef} src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" className="absolute w-full h-full object-contain" crossOrigin="anonymous" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div style={{ width: videoWidth, height: videoHeight }} className="relative pointer-events-auto">
                <Stage width={videoWidth} height={videoHeight}>
                  <Layer>
                    {zones.map(zone => (
                      <Fragment key={zoneKey(zone)}>
                        <Rect x={zoneX(zone)} y={zoneY(zone)} width={zoneW(zone)} height={zoneH(zone)}
                          fill={getZoneColor(zoneKey(zone))}
                          stroke={detailZone === zoneKey(zone) ? "#facc15" : hoveredZone === zoneKey(zone) ? "#fff" : "rgba(255,255,255,0.35)"}
                          strokeWidth={detailZone === zoneKey(zone) ? 3 : 2} cornerRadius={4}
                          onMouseEnter={() => setHoveredZone(zoneKey(zone))}
                          onMouseLeave={() => setHoveredZone(null)}
                          onClick={() => applyPresetToZone(zoneKey(zone))}
                          onDblClick={() => handleZoneDoubleClick(zoneKey(zone))}
                          onDblTap={() => handleZoneDoubleClick(zoneKey(zone))}
                        />
                        <Text x={zoneX(zone) + 4} y={zoneY(zone) + 4} text={zone.label} fill="#fff" fontSize={11} fontStyle="bold" shadowColor="black" shadowBlur={4} listening={false} />
                      </Fragment>
                    ))}
                  </Layer>
                </Stage>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="p-3 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full mb-3 cursor-pointer relative" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); videoRef.current.currentTime = ((e.clientX - r.left) / r.width) * duration; }}>
              <div className="absolute top-0 left-0 h-full bg-primary-500 rounded-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
              {annotations.map(a => <div key={a.id} className="absolute top-0 w-1 h-full bg-yellow-400 opacity-70" style={{ left: `${duration ? (a.timestamp / duration) * 100 : 0}%` }} />)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors text-sm">{isPlaying ? '⏸' : '▶️'}</button>
                <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                  {Math.floor(currentTime / 60).toString().padStart(2, '0')}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                  <span className="text-gray-400 dark:text-gray-600"> / {Math.floor(duration / 60).toString().padStart(2, '0')}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5">
                {[1, 1.5, 2, 3].map(s => (
                  <button key={s} onClick={() => changeSpeed(s)} className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${playbackRate === s ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{s}x</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho */}
        <div className="w-80 flex flex-col gap-3 min-h-0">
          {/* Formulario detallado (doble clic) */}
          {detailZone && (
            <div className="bg-white dark:bg-gray-900 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-3 flex flex-col gap-2 animate-scale-in">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white text-xs">✏️ {getZoneLabel(detailZone)} — {currentTime.toFixed(1)}s</h3>
                <button onClick={() => setDetailZone(null)} className="text-gray-400 hover:text-red-500 text-sm">✕</button>
              </div>
              <div className="flex gap-1">
                {Object.entries(PERCEPTION_COLORS).map(([val]) => (
                  <button key={val} onClick={() => setLabelForm(f => ({ ...f, teacherPerception: val }))}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${labelForm.teacherPerception === val ? PERCEPTION_BADGES[val] + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    {val.replace('VERY_', 'M.')}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div><label className="block text-[10px] font-medium text-gray-500 mb-0.5">Cabeza</label><select value={labelForm.headPose} onChange={e => setLabelForm(f => ({ ...f, headPose: e.target.value }))} className="input-field !py-0.5 !text-[10px]">{HEAD_POSES.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}</select></div>
                <div><label className="block text-[10px] font-medium text-gray-500 mb-0.5">Postura</label><select value={labelForm.bodyPosture} onChange={e => setLabelForm(f => ({ ...f, bodyPosture: e.target.value }))} className="input-field !py-0.5 !text-[10px]">{BODY_POSTURES.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}</select></div>
                <div><label className="block text-[10px] font-medium text-gray-500 mb-0.5">Actividad</label><select value={labelForm.activity} onChange={e => setLabelForm(f => ({ ...f, activity: e.target.value }))} className="input-field !py-0.5 !text-[10px]">{ACTIVITIES.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}</select></div>
                <div><label className="block text-[10px] font-medium text-gray-500 mb-0.5">Engagement</label><select value={labelForm.engagement} onChange={e => setLabelForm(f => ({ ...f, engagement: e.target.value }))} className="input-field !py-0.5 !text-[10px]">{ENGAGEMENTS.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}</select></div>
              </div>
              <input type="text" placeholder="Nota del docente..." value={labelForm.notes} onChange={e => setLabelForm(f => ({ ...f, notes: e.target.value }))} className="input-field !py-1 !text-xs" />
              <button onClick={saveDetailAnnotation} className="btn-primary w-full !py-1.5 text-xs">💾 Guardar</button>
            </div>
          )}

          {/* Lista de Anotaciones */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 flex flex-col flex-1 min-h-0">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-xs border-b border-gray-200 dark:border-gray-800 pb-2">
              Historial ({annotations.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {annotations.length === 0 ? (
                <p className="text-[11px] text-gray-500 text-center py-6">Haz clic en una zona para anotar con el preset activo.</p>
              ) : (
                [...annotations].sort((a, b) => b.timestamp - a.timestamp).map(ann => (
                  <div key={ann.id} className="p-2 border border-gray-100 dark:border-gray-800 rounded-lg hover:border-primary-300 cursor-pointer transition-colors" onClick={() => { videoRef.current.currentTime = ann.timestamp; }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-[11px] text-gray-900 dark:text-white">{getZoneLabel(ann.zoneId)}</span>
                      <span className="font-mono text-[9px] text-gray-500 bg-white dark:bg-gray-800 px-1 py-0.5 rounded border border-gray-200 dark:border-gray-700">{ann.timestamp.toFixed(1)}s</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${PERCEPTION_BADGES[ann.teacherPerception] || ''}`}>
                        {ann.presetIcon || '📌'} {ann.presetName || ann.teacherPerception}
                      </span>
                      {ann.notes && <span className="text-[9px] text-gray-400 truncate max-w-[100px]">💬 {ann.notes}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
