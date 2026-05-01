import express from 'express';
import ClassroomLayout from '../models/ClassroomLayout.js';
import VideoSession from '../models/VideoSession.js';
import AttentionAnnotation from '../models/AttentionAnnotation.js';
import AnnotationPreset from '../models/AnnotationPreset.js';

const router = express.Router();

// --- CLASSROOM LAYOUTS ---
router.post('/layouts', async (req, res) => {
  try {
    const layout = new ClassroomLayout(req.body);
    const savedLayout = await layout.save();
    res.status(201).json(savedLayout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/layouts', async (req, res) => {
  try {
    const layouts = await ClassroomLayout.find().sort({ createdAt: -1 });
    res.json(layouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/layouts/:id', async (req, res) => {
  try {
    const layout = await ClassroomLayout.findById(req.params.id);
    if (!layout) return res.status(404).json({ error: 'Layout not found' });
    res.json(layout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- VIDEO SESSIONS ---
router.post('/sessions', async (req, res) => {
  try {
    const session = new VideoSession(req.body);
    const savedSession = await session.save();
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await VideoSession.find().populate('layoutId').sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ANNOTATIONS ---
router.post('/annotations', async (req, res) => {
  try {
    const { sessionId, timestamp, zoneId, teacherPerception, observableIndicators, notes } = req.body;
    
    const annotation = await AttentionAnnotation.findOneAndUpdate(
      { sessionId, timestamp, zoneId },
      { teacherPerception, observableIndicators, notes },
      { new: true, upsert: true }
    );
    
    res.status(201).json(annotation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/annotations/:sessionId', async (req, res) => {
  try {
    const annotations = await AttentionAnnotation.find({ sessionId: req.params.sessionId });
    res.json(annotations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ANNOTATION PRESETS ---
const DEFAULT_PRESETS = [
  { name: 'Atento escribiendo',     icon: '🟢', shortcutKey: '1', teacherPerception: 'HIGH',      observableIndicators: { headPose: 'LOOKING_DOWN',  bodyPosture: 'UPRIGHT',         activity: 'WRITING',      engagement: 'ACTIVE' },     isDefault: true },
  { name: 'Atento al profesor',     icon: '🟢', shortcutKey: '2', teacherPerception: 'HIGH',      observableIndicators: { headPose: 'LOOKING_FRONT', bodyPosture: 'UPRIGHT',         activity: 'READING',      engagement: 'ACTIVE' },     isDefault: true },
  { name: 'Participando',           icon: '💚', shortcutKey: '3', teacherPerception: 'VERY_HIGH',  observableIndicators: { headPose: 'LOOKING_FRONT', bodyPosture: 'LEANING_FORWARD', activity: 'HAND_RAISED',  engagement: 'ACTIVE' },     isDefault: true },
  { name: 'Pasivo',                 icon: '🟡', shortcutKey: '4', teacherPerception: 'MEDIUM',     observableIndicators: { headPose: 'LOOKING_FRONT', bodyPosture: 'SLOUCHED',        activity: 'IDLE',         engagement: 'PASSIVE' },    isDefault: true },
  { name: 'Hablando con compañero', icon: '🟠', shortcutKey: '5', teacherPerception: 'LOW',        observableIndicators: { headPose: 'LOOKING_PEER',  bodyPosture: 'LEANING_FORWARD', activity: 'TALKING',      engagement: 'DISTRACTED' }, isDefault: true },
  { name: 'Mirando móvil',          icon: '🔴', shortcutKey: '6', teacherPerception: 'VERY_LOW',   observableIndicators: { headPose: 'LOOKING_DOWN',  bodyPosture: 'SLOUCHED',        activity: 'USING_DEVICE', engagement: 'DISTRACTED' }, isDefault: true },
  { name: 'Distraído total',        icon: '🔴', shortcutKey: '7', teacherPerception: 'VERY_LOW',   observableIndicators: { headPose: 'LOOKING_AWAY',  bodyPosture: 'TURNED_AWAY',     activity: 'IDLE',         engagement: 'DISTRACTED' }, isDefault: true },
];

router.post('/presets/seed', async (req, res) => {
  try {
    const existing = await AnnotationPreset.countDocuments();
    if (existing > 0) return res.json({ message: 'Presets already exist', count: existing });
    const created = await AnnotationPreset.insertMany(DEFAULT_PRESETS);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/presets', async (req, res) => {
  try {
    const presets = await AnnotationPreset.find().sort({ shortcutKey: 1 });
    res.json(presets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/presets', async (req, res) => {
  try {
    const preset = new AnnotationPreset(req.body);
    const saved = await preset.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/presets/:id', async (req, res) => {
  try {
    const updated = await AnnotationPreset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Preset not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/presets/:id', async (req, res) => {
  try {
    await AnnotationPreset.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
