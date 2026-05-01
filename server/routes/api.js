import express from 'express';
import ClassroomLayout from '../models/ClassroomLayout.js';
import VideoSession from '../models/VideoSession.js';
import AttentionAnnotation from '../models/AttentionAnnotation.js';

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
    const { sessionId, timestamp, zoneId, attentionLevel } = req.body;
    
    // Upsert anotación en este momento exacto para esa zona
    const annotation = await AttentionAnnotation.findOneAndUpdate(
      { sessionId, timestamp, zoneId },
      { attentionLevel },
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

export default router;
