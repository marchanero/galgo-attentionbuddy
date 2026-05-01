import mongoose from 'mongoose';

const videoSessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  layoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassroomLayout', required: true },
  videoUrl: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING_FRAMES', 'READY', 'LABELED'],
    default: 'PENDING'
  }
}, { timestamps: true });

export default mongoose.model('VideoSession', videoSessionSchema);
