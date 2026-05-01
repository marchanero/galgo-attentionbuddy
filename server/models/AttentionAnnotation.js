import mongoose from 'mongoose';

const attentionAnnotationSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoSession', required: true },
  timestamp: { type: Number, required: true }, // Segundos exactos del vídeo
  zoneId: { type: String, required: true }, // Coincide con el id de una zone dentro de ClassroomLayout
  attentionLevel: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    required: true 
  },
  annotatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Índice compuesto para evitar dobles etiquetas en el mismo milisegundo exacto para una zona
attentionAnnotationSchema.index({ sessionId: 1, timestamp: 1, zoneId: 1 }, { unique: true });

export default mongoose.model('AttentionAnnotation', attentionAnnotationSchema);
