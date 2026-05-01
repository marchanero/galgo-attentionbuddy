import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

// Datos de prueba (en el futuro vendrán de ClassroomLayout de la BD)
export default function VideoAnnotator() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [layouts, setLayouts] = useState([]);
  const [activeLayout, setActiveLayout] = useState(null);
  
  // Tamaño del video (esto debería ajustarse dinámicamente)
  const videoWidth = 800;
  const videoHeight = 450;

  useEffect(() => {
    fetch('http://localhost:5000/api/layouts')
      .then(res => res.json())
      .then(data => {
        setLayouts(data);
        if (data.length > 0) setActiveLayout(data[0]);
      })
      .catch(err => console.error("Error loading layouts:", err));

    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const changeSpeed = (speed) => {
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
  };

  const handleZoneClick = async (zoneId) => {
    if (isPlaying) videoRef.current.pause();

    const levels = ['LOW', 'MEDIUM', 'HIGH'];
    let nextLevel = 'LOW';
    
    setAnnotations(prev => {
      const existing = prev.find(a => a.zoneId === zoneId && Math.abs(a.timestamp - currentTime) < 0.5);
      if (existing) {
        const currentIdx = levels.indexOf(existing.attentionLevel);
        nextLevel = levels[(currentIdx + 1) % levels.length];
        return prev.map(a => a === existing ? { ...a, attentionLevel: nextLevel } : a);
      } else {
        return [...prev, { id: Date.now().toString(), timestamp: currentTime, zoneId, attentionLevel: 'LOW' }];
      }
    });

    // Simulamos que tenemos un sessionId real de prueba
    const MOCK_SESSION_ID = '641a2b3c4d5e6f7a8b9c0d1e'; 
    try {
      await fetch('http://localhost:5000/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: MOCK_SESSION_ID,
          timestamp: currentTime,
          zoneId,
          attentionLevel: nextLevel
        })
      });
    } catch(err) {
      console.error("Error saving annotation:", err);
    }
  };

  // Función para obtener el color según el nivel de atención
  const getAttentionColor = (zoneId) => {
    // Buscar si hay una anotación para esta zona cerca del timestamp actual
    const annotation = annotations.find(a => 
      a.zoneId === zoneId && Math.abs(a.timestamp - currentTime) < 0.5
    );

    if (!annotation) return "rgba(255, 255, 255, 0.2)"; // Neutro / Sin etiquetar
    
    if (annotation.attentionLevel === 'LOW') return "rgba(239, 68, 68, 0.5)"; // Rojo
    if (annotation.attentionLevel === 'MEDIUM') return "rgba(234, 179, 8, 0.5)"; // Amarillo
    if (annotation.attentionLevel === 'HIGH') return "rgba(34, 197, 94, 0.5)"; // Verde
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Etiquetado de Vídeo</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Reproduce el vídeo, pausa en el momento clave y haz clic en las zonas para catalogar la atención.
          </p>
        </div>
        <div className="text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-lg">
          Etiquetas guardadas: {annotations.length}
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Panel Izquierdo - Reproductor */}
        <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col">
          
          {/* Contenedor Relativo para Video + Canvas */}
          <div className="relative bg-black flex-1 flex items-center justify-center overflow-hidden">
            {/* Usamos un video de prueba online */}
            <video 
              ref={videoRef}
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              className="absolute w-full h-full object-contain"
              crossOrigin="anonymous"
            />
            
            {/* Canvas de Konva superpuesto */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                style={{ width: videoWidth, height: videoHeight }} 
                className="relative pointer-events-auto"
              >
                <Stage width={videoWidth} height={videoHeight}>
                  <Layer>
                    {(activeLayout ? activeLayout.zones : MOCK_ZONES).map(zone => (
                      <React.Fragment key={zone.id || zone._id}>
                        <Rect
                          x={zone.x || zone.coordinates?.x}
                          y={zone.y || zone.coordinates?.y}
                          width={zone.width || zone.coordinates?.width}
                          height={zone.height || zone.coordinates?.height}
                          fill={getAttentionColor(zone.id || zone._id)}
                          stroke={hoveredZone === (zone.id || zone._id) ? "#fff" : "rgba(255,255,255,0.5)"}
                          strokeWidth={2}
                          cornerRadius={4}
                          onMouseEnter={() => setHoveredZone(zone.id || zone._id)}
                          onMouseLeave={() => setHoveredZone(null)}
                          onClick={() => handleZoneClick(zone.id || zone._id)}
                          onTap={() => handleZoneClick(zone.id || zone._id)}
                        />
                        <Text 
                          x={(zone.x || zone.coordinates?.x) + 5} 
                          y={(zone.y || zone.coordinates?.y) + 5} 
                          text={zone.label} 
                          fill="#ffffff" 
                          fontSize={12}
                          fontStyle="bold"
                          shadowColor="black"
                          shadowBlur={4}
                          listening={false}
                        />
                      </React.Fragment>
                    ))}
                  </Layer>
                </Stage>
              </div>
            </div>
          </div>

          {/* Controles del Reproductor */}
          <div className="p-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
            {/* Barra de progreso (visual) */}
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full mb-4 overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-primary-500" 
                style={{ width: `${videoRef.current && videoRef.current.duration ? (currentTime / videoRef.current.duration) * 100 : 0}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors focus-ring"
                >
                  {isPlaying ? '⏸' : '▶️'}
                </button>
                <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                  {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
                  {Math.floor(currentTime % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                {[1, 1.5, 2, 3].map(speed => (
                  <button
                    key={speed}
                    onClick={() => changeSpeed(speed)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      playbackRate === speed 
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho - Línea de tiempo de Anotaciones */}
        <div className="w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
            Anotaciones ({annotations.length})
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {annotations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Pausa el vídeo y haz clic en una zona para crear una anotación.
              </p>
            ) : (
              // Ordenadas de más reciente a más antigua
              [...annotations].sort((a, b) => b.timestamp - a.timestamp).map(ann => {
                const zoneLabel = MOCK_ZONES.find(z => z.id === ann.zoneId)?.label || 'Zona';
                
                let badgeColor = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
                let icon = "🔴 Baja";
                if (ann.attentionLevel === 'MEDIUM') {
                  badgeColor = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
                  icon = "🟡 Media";
                }
                if (ann.attentionLevel === 'HIGH') {
                  badgeColor = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
                  icon = "🟢 Alta";
                }

                return (
                  <div key={ann.id} className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:border-primary-300 cursor-pointer" onClick={() => {
                    videoRef.current.currentTime = ann.timestamp;
                  }}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{zoneLabel}</span>
                      <span className="font-mono text-xs text-gray-500 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
                        {ann.timestamp.toFixed(1)}s
                      </span>
                    </div>
                    <div className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${badgeColor}`}>
                      {icon}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
