const Material = require('../models/Material');
const path = require('path');
const fs = require('fs');

// Upload material (file + metadata)
exports.uploadMaterial = async (req, res) => {
  try {
    console.log('[uploadMaterial] req.body:', req.body);
    console.log('[uploadMaterial] req.file:', req.file);
    const { title, description, section, semester, department, subject } = req.body;
    const faculty = req.user._id;
    // File upload handled by multer
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    const material = new Material({
      title,
      description,
      fileUrl,
      faculty,
      section,
      semester,
      department,
      subject,
    });
    await material.save();
    res.status(201).json(material);
  } catch (err) {
    console.error('[uploadMaterial]', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// List materials for a section/subject
exports.listMaterials = async (req, res) => {
  try {
    const { section, semester, department, subject } = req.query;
    const filter = { section, semester: Number(semester), department, subject };
    // Only students/faculty from same section/subject can view
    const materials = await Material.find(filter).sort({ uploadedAt: -1 });
    res.status(200).json(materials);
  } catch (err) {
    console.error('[listMaterials]', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get material details
exports.getMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.status(200).json(material);
  } catch (err) {
    console.error('[getMaterial]', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
