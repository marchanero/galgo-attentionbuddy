import mongoose from 'mongoose';

const keyframeSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoSession', required: true },
  timestamp: { type: Number, required: true }, // Segundos desde el inicio del video
  imageUrl: { type: String, required: true },
  isLabeled: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Keyframe', keyframeSchema);
