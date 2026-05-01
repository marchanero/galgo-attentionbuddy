import mongoose from 'mongoose';

const attentionAnnotationSchema = new mongoose.Schema({
  keyframeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Keyframe', required: true },
  zoneId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Coincide con el _id de una zone dentro de ClassroomLayout
  attentionLevel: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    required: true 
  },
  annotatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Opcional por si añadimos autenticación luego
}, { timestamps: true });

// Índice para asegurar que no etiquetamos dos veces la misma zona en el mismo frame
attentionAnnotationSchema.index({ keyframeId: 1, zoneId: 1 }, { unique: true });

export default mongoose.model('AttentionAnnotation', attentionAnnotationSchema);
