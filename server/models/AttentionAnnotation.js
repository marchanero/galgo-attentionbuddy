import mongoose from 'mongoose';

const attentionAnnotationSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoSession', required: true },
  timestamp: { type: Number, required: true }, // Segundos exactos del vídeo
  zoneId: { type: String, required: true }, // Coincide con el id de una zone dentro de ClassroomLayout

  // --- Atención percibida por el docente (subjetiva) ---
  teacherPerception: {
    type: String,
    enum: ['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'],
    required: true
  },

  // --- Indicadores observables (para entrenar el modelo) ---
  observableIndicators: {
    headPose: { type: String, enum: ['LOOKING_FRONT', 'LOOKING_DOWN', 'LOOKING_AWAY', 'LOOKING_PEER', 'NOT_VISIBLE'], default: 'NOT_VISIBLE' },
    bodyPosture: { type: String, enum: ['UPRIGHT', 'SLOUCHED', 'LEANING_FORWARD', 'LEANING_BACK', 'TURNED_AWAY', 'NOT_VISIBLE'], default: 'NOT_VISIBLE' },
    activity: { type: String, enum: ['WRITING', 'READING', 'HAND_RAISED', 'TALKING', 'USING_DEVICE', 'IDLE', 'DISRUPTIVE', 'NOT_VISIBLE'], default: 'NOT_VISIBLE' },
    engagement: { type: String, enum: ['ACTIVE', 'PASSIVE', 'DISTRACTED', 'ASLEEP', 'NOT_VISIBLE'], default: 'NOT_VISIBLE' }
  },

  // --- Nota libre del docente ---
  notes: { type: String, default: '' },

  annotatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Índice compuesto para evitar dobles etiquetas en el mismo momento exacto para una zona
attentionAnnotationSchema.index({ sessionId: 1, timestamp: 1, zoneId: 1 }, { unique: true });

export default mongoose.model('AttentionAnnotation', attentionAnnotationSchema);
