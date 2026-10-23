const Equipment = require('../models/Equipment');

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Private
const getEquipment = async (req, res) => {
  try {
    const { status, type, department, search } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const equipment = await Equipment.find(query).sort({ createdAt: -1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Private
const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create equipment
// @route   POST /api/equipment
// @access  Private/Manager
const createEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.create(req.body);
    res.status(201).json(equipment);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Equipment code already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private/Manager
const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    const updatedEquipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedEquipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private/Manager
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    await equipment.deleteOne();
    res.json({ message: 'Equipment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};
