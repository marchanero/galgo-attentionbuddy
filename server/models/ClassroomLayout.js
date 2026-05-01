import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema({
  label: { type: String, required: true },
  coordinates: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  }
});

const classroomLayoutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  backgroundImageUrl: { type: String, required: true },
  zones: [zoneSchema]
}, { timestamps: true });

export default mongoose.model('ClassroomLayout', classroomLayoutSchema);
