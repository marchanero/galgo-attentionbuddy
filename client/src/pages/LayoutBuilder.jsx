import { useState, useRef } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

// Componente para cargar la imagen de fondo
const BackgroundImage = ({ imageUrl }) => {
  const [image] = useImage(imageUrl, 'anonymous');
  return image ? <KonvaImage image={image} width={800} height={450} /> : null;
};

export default function LayoutBuilder() {
  const [imageUrl, setImageUrl] = useState(null);
  const [zones, setZones] = useState([]);
  const [newZone, setNewZone] = useState(null);
  const stageRef = useRef(null);

  // Simular la subida de un fondo (en el futuro esto irá a la API)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleMouseDown = (e) => {
    if (!imageUrl) return;
    const { x, y } = e.target.getStage().getPointerPosition();
    setNewZone({ x, y, width: 0, height: 0, id: Date.now().toString() });
  };

  const handleMouseMove = (e) => {
    if (!newZone) return;
    const { x, y } = e.target.getStage().getPointerPosition();
    setNewZone({
      ...newZone,
      width: x - newZone.x,
      height: y - newZone.y,
    });
  };

  const handleMouseUp = () => {
    if (newZone) {
      if (Math.abs(newZone.width) > 10 && Math.abs(newZone.height) > 10) {
        // Normalizar coordenadas (si el usuario arrastró hacia arriba o izquierda)
        const normalizedZone = {
          ...newZone,
          x: newZone.width < 0 ? newZone.x + newZone.width : newZone.x,
          y: newZone.height < 0 ? newZone.y + newZone.height : newZone.y,
          width: Math.abs(newZone.width),
          height: Math.abs(newZone.height),
          label: `Mesa ${zones.length + 1}`
        };
        setZones([...zones, normalizedZone]);
      }
      setNewZone(null);
    }
  };

  const handleSave = async () => {
    if (zones.length === 0) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Aula ${new Date().toLocaleTimeString()}`, // Esto luego lo pediremos en un input
          backgroundImageUrl: imageUrl,
          zones: zones.map(z => ({
            label: z.label,
            coordinates: { x: z.x, y: z.y, width: z.width, height: z.height }
          }))
        })
      });

      if (response.ok) {
        alert(`¡Plantilla guardada con ${zones.length} zonas en la base de datos!`);
      } else {
        alert("Error al guardar la plantilla");
      }
    } catch (error) {
      console.error(error);
      alert("Error de red al guardar la plantilla");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plantilla del Aula</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Sube la vista de tu cámara y dibuja las zonas que representan las mesas o alumnos.
          </p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={zones.length === 0}>
          Guardar Plantilla
        </button>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Panel Central - Canvas */}
        <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col">
          {!imageUrl ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mb-4">
                📷
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Subir imagen de referencia</h3>
              <p className="text-gray-500 text-center max-w-sm mb-6">
                Selecciona una captura clara del vídeo de esta cámara donde se aprecien todas las mesas vacías o con los alumnos sentados.
              </p>
              <label className="btn-primary cursor-pointer">
                <span>Seleccionar Archivo</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
          ) : (
            <div className="flex-1 bg-gray-100 dark:bg-gray-950 flex items-center justify-center overflow-auto relative">
              <div className="shadow-2xl ring-1 ring-gray-900/5 cursor-crosshair">
                <Stage
                  width={800}
                  height={450}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  ref={stageRef}
                >
                  <Layer>
                    <BackgroundImage imageUrl={imageUrl} />
                    
                    {/* Cajas guardadas */}
                    {zones.map((zone) => (
                      <Rect
                        key={zone.id}
                        x={zone.x}
                        y={zone.y}
                        width={zone.width}
                        height={zone.height}
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        fill="rgba(14, 165, 233, 0.2)"
                      />
                    ))}
                    
                    {/* Caja en proceso de dibujo */}
                    {newZone && (
                      <Rect
                        x={newZone.x}
                        y={newZone.y}
                        width={newZone.width}
                        height={newZone.height}
                        stroke="#22c55e"
                        strokeWidth={2}
                        dash={[4, 4]}
                        fill="rgba(34, 197, 94, 0.2)"
                      />
                    )}
                  </Layer>
                </Stage>
              </div>
            </div>
          )}
        </div>

        {/* Panel Lateral - Lista de Zones */}
        <div className="w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Zonas Definidas</span>
            <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 text-xs px-2 py-1 rounded-full">
              {zones.length}
            </span>
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3">
            {zones.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                No hay zonas definidas. Arrastra el ratón sobre la imagen para crear una.
              </div>
            ) : (
              zones.map((zone, idx) => (
                <div key={zone.id} className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:border-primary-300 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <input 
                      type="text" 
                      value={zone.label}
                      onChange={(e) => {
                        const newZones = [...zones];
                        newZones[idx].label = e.target.value;
                        setZones(newZones);
                      }}
                      className="bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none border-b border-transparent focus:border-primary-500 w-full"
                    />
                    <button 
                      onClick={() => setZones(zones.filter(z => z.id !== zone.id))}
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      title="Eliminar zona"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 flex gap-2">
                    <span>X: {Math.round(zone.x)}</span>
                    <span>Y: {Math.round(zone.y)}</span>
                    <span>W: {Math.round(zone.width)}</span>
                    <span>H: {Math.round(zone.height)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
