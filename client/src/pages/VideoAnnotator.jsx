import { useState, useRef, useEffect, Fragment } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

const PERCEPTION_LEVELS = [
  { value: 'VERY_LOW',  label: 'Muy Baja',  color: 'rgba(220, 38, 38, 0.55)',  badge: 'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300',    icon: '🔴' },
  { value: 'LOW',       label: 'Baja',       color: 'rgba(249, 115, 22, 0.50)', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300', icon: '🟠' },
  { value: 'MEDIUM',    label: 'Media',      color: 'rgba(234, 179, 8, 0.50)',  badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', icon: '🟡' },
  { value: 'HIGH',      label: 'Alta',       color: 'rgba(34, 197, 94, 0.50)',  badge: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',   icon: '🟢' },
  { value: 'VERY_HIGH', label: 'Muy Alta',   color: 'rgba(16, 185, 129, 0.55)', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', icon: '💚' },
];

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

  // Panel de etiquetado
  const [selectedZone, setSelectedZone] = useState(null);
  const [labelForm, setLabelForm] = useState({
    teacherPerception: 'MEDIUM',
    headPose: 'NOT_VISIBLE',
    bodyPosture: 'NOT_VISIBLE',
    activity: 'NOT_VISIBLE',
    engagement: 'NOT_VISIBLE',
    notes: ''
  });

  const videoWidth = 800;
  const videoHeight = 450;

  const zones = activeLayout ? activeLayout.zones : [];

  useEffect(() => {
    fetch('http://localhost:5000/api/layouts')
      .then(res => res.json())
      .then(data => {
        setLayouts(data);
        if (data.length > 0) setActiveLayout(data[0]);
      })
      .catch(err => console.error("Error loading layouts:", err));
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoaded = () => setDuration(video.duration);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadedmetadata', handleLoaded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadedmetadata', handleLoaded);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current.paused) videoRef.current.play();
    else videoRef.current.pause();
  };

  const changeSpeed = (speed) => {
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
  };

  const handleZoneClick = (zoneId) => {
    if (isPlaying) videoRef.current.pause();
    setSelectedZone(zoneId);
    // Precargar datos si ya existe una anotación
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

  const saveAnnotation = async () => {
    if (!selectedZone) return;

    const annotation = {
      id: Date.now().toString(),
      timestamp: currentTime,
      zoneId: selectedZone,
      teacherPerception: labelForm.teacherPerception,
      observableIndicators: {
        headPose: labelForm.headPose,
        bodyPosture: labelForm.bodyPosture,
        activity: labelForm.activity,
        engagement: labelForm.engagement
      },
      notes: labelForm.notes
    };

    setAnnotations(prev => {
      const filtered = prev.filter(a => !(a.zoneId === selectedZone && Math.abs(a.timestamp - currentTime) < 0.5));
      return [...filtered, annotation];
    });

    // Guardar en backend
    const MOCK_SESSION_ID = '641a2b3c4d5e6f7a8b9c0d1e';
    try {
      await fetch('http://localhost:5000/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: MOCK_SESSION_ID, ...annotation })
      });
    } catch (err) {
      console.error("Error saving annotation:", err);
    }

    setSelectedZone(null);
  };

  const getZoneColor = (zoneId) => {
    const ann = annotations.find(a => a.zoneId === zoneId && Math.abs(a.timestamp - currentTime) < 0.5);
    if (!ann) return "rgba(255, 255, 255, 0.15)";
    return PERCEPTION_LEVELS.find(p => p.value === ann.teacherPerception)?.color || "rgba(255,255,255,0.15)";
  };

  const getZoneLabel = (zoneId) => {
    const zone = zones.find(z => (z.id || z._id) === zoneId);
    return zone?.label || 'Zona';
  };

  const zoneX = (z) => z.x ?? z.coordinates?.x ?? 0;
  const zoneY = (z) => z.y ?? z.coordinates?.y ?? 0;
  const zoneW = (z) => z.width ?? z.coordinates?.width ?? 0;
  const zoneH = (z) => z.height ?? z.coordinates?.height ?? 0;
  const zoneKey = (z) => z.id || z._id;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Etiquetado de Vídeo</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Reproduce, pausa y etiqueta la atención percibida por zona. Los indicadores observables ayudarán al futuro modelo ML.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeLayout && (
            <select
              value={activeLayout?._id || ''}
              onChange={(e) => setActiveLayout(layouts.find(l => l._id === e.target.value))}
              className="input-field !w-auto text-sm !py-1.5"
            >
              {layouts.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
          )}
          <div className="text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-lg">
            {annotations.length} etiquetas
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Panel Central - Reproductor */}
        <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="relative bg-black flex-1 flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              className="absolute w-full h-full object-contain"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div style={{ width: videoWidth, height: videoHeight }} className="relative pointer-events-auto">
                <Stage width={videoWidth} height={videoHeight}>
                  <Layer>
                    {zones.map(zone => (
                      <Fragment key={zoneKey(zone)}>
                        <Rect
                          x={zoneX(zone)} y={zoneY(zone)} width={zoneW(zone)} height={zoneH(zone)}
                          fill={getZoneColor(zoneKey(zone))}
                          stroke={selectedZone === zoneKey(zone) ? "#facc15" : hoveredZone === zoneKey(zone) ? "#fff" : "rgba(255,255,255,0.4)"}
                          strokeWidth={selectedZone === zoneKey(zone) ? 3 : 2}
                          cornerRadius={4}
                          onMouseEnter={() => setHoveredZone(zoneKey(zone))}
                          onMouseLeave={() => setHoveredZone(null)}
                          onClick={() => handleZoneClick(zoneKey(zone))}
                          onTap={() => handleZoneClick(zoneKey(zone))}
                        />
                        <Text
                          x={zoneX(zone) + 5} y={zoneY(zone) + 5}
                          text={zone.label}
                          fill="#ffffff" fontSize={11} fontStyle="bold"
                          shadowColor="black" shadowBlur={4} listening={false}
                        />
                      </Fragment>
                    ))}
                  </Layer>
                </Stage>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="p-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
            <div
              className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full mb-4 cursor-pointer relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                videoRef.current.currentTime = ratio * duration;
              }}
            >
              <div className="absolute top-0 left-0 h-full bg-primary-500 rounded-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
              {/* Marcadores de anotaciones */}
              {annotations.map(a => (
                <div key={a.id} className="absolute top-0 w-1 h-full bg-yellow-400 opacity-80" style={{ left: `${duration ? (a.timestamp / duration) * 100 : 0}%` }} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors focus-ring">
                  {isPlaying ? '⏸' : '▶️'}
                </button>
                <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                  {Math.floor(currentTime / 60).toString().padStart(2, '0')}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                  <span className="text-gray-400 dark:text-gray-600"> / {Math.floor(duration / 60).toString().padStart(2, '0')}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                {[1, 1.5, 2, 3].map(speed => (
                  <button key={speed} onClick={() => changeSpeed(speed)} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${playbackRate === speed ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho */}
        <div className="w-96 flex flex-col gap-4 min-h-0">
          {/* Formulario de Etiquetado */}
          {selectedZone ? (
            <div className="bg-white dark:bg-gray-900 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-4 flex flex-col gap-3 animate-scale-in">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                  📌 {getZoneLabel(selectedZone)} — {currentTime.toFixed(1)}s
                </h3>
                <button onClick={() => setSelectedZone(null)} className="text-gray-400 hover:text-red-500 transition-colors">✕</button>
              </div>

              {/* Percepción del Docente */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Atención Percibida (Docente)</label>
                <div className="flex gap-1">
                  {PERCEPTION_LEVELS.map(p => (
                    <button key={p.value} onClick={() => setLabelForm(f => ({ ...f, teacherPerception: p.value }))}
                      className={`flex-1 py-1.5 rounded text-xs font-semibold transition-all ${labelForm.teacherPerception === p.value ? p.badge + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                      {p.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Indicadores Observables */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cabeza</label>
                  <select value={labelForm.headPose} onChange={e => setLabelForm(f => ({ ...f, headPose: e.target.value }))} className="input-field !py-1 !text-xs">
                    {HEAD_POSES.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Postura</label>
                  <select value={labelForm.bodyPosture} onChange={e => setLabelForm(f => ({ ...f, bodyPosture: e.target.value }))} className="input-field !py-1 !text-xs">
                    {BODY_POSTURES.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Actividad</label>
                  <select value={labelForm.activity} onChange={e => setLabelForm(f => ({ ...f, activity: e.target.value }))} className="input-field !py-1 !text-xs">
                    {ACTIVITIES.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Engagement</label>
                  <select value={labelForm.engagement} onChange={e => setLabelForm(f => ({ ...f, engagement: e.target.value }))} className="input-field !py-1 !text-xs">
                    {ENGAGEMENTS.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nota del Docente</label>
                <input type="text" placeholder="Ej: Alumno habla con el compañero..." value={labelForm.notes} onChange={e => setLabelForm(f => ({ ...f, notes: e.target.value }))} className="input-field !py-1.5 !text-xs" />
              </div>

              <button onClick={saveAnnotation} className="btn-primary w-full !py-2 text-sm">
                💾 Guardar Etiqueta
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Pausa el vídeo y haz clic en una zona para etiquetar.
            </div>
          )}

          {/* Lista de Anotaciones */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col flex-1 min-h-0">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm border-b border-gray-200 dark:border-gray-800 pb-2">
              Anotaciones ({annotations.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {annotations.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">Sin anotaciones aún.</p>
              ) : (
                [...annotations].sort((a, b) => b.timestamp - a.timestamp).map(ann => {
                  const perc = PERCEPTION_LEVELS.find(p => p.value === ann.teacherPerception);
                  return (
                    <div key={ann.id} className="p-2.5 border border-gray-100 dark:border-gray-800 rounded-lg hover:border-primary-300 cursor-pointer transition-colors" onClick={() => { videoRef.current.currentTime = ann.timestamp; }}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-xs text-gray-900 dark:text-white">{getZoneLabel(ann.zoneId)}</span>
                        <span className="font-mono text-[10px] text-gray-500 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">{ann.timestamp.toFixed(1)}s</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${perc?.badge || ''}`}>
                          {perc?.icon} {perc?.label}
                        </span>
                        {ann.notes && <span className="text-[10px] text-gray-400 truncate max-w-[120px]">💬 {ann.notes}</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
