import mongoose from 'mongoose';

const annotationPresetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  shortcutKey: { type: String, required: true }, // "1" - "9"
  teacherPerception: {
    type: String,
    enum: ['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'],
    required: true
  },
  observableIndicators: {
    headPose: { type: String, enum: ['LOOKING_FRONT', 'LOOKING_DOWN', 'LOOKING_AWAY', 'LOOKING_PEER', 'NOT_VISIBLE'], default: 'NOT_VISIBLE' },
    bodyPosture: { type: String, enum: ['UPRIGHT', 'SLOUCHED', 'LEANING_FORWARD', 'LEANING_BACK', 'TURNED_AWAY', 'NOT_VISIBLE'], default: 'NOT_VISIBLE' },
    activity: { type: String, enum: ['WRITING', 'READING', 'HAND_RAISED', 'TALKING', 'USING_DEVICE', 'IDLE', 'DISRUPTIVE', 'NOT_VISIBLE'], default: 'NOT_VISIBLE' },
    engagement: { type: String, enum: ['ACTIVE', 'PASSIVE', 'DISTRACTED', 'ASLEEP', 'NOT_VISIBLE'], default: 'NOT_VISIBLE' }
  },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('AnnotationPreset', annotationPresetSchema);
