const SparePart = require('../models/SparePart');

// @desc    Get all spare parts
// @route   GET /api/spareparts
// @access  Private
const getSpareParts = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const spareParts = await SparePart.find(query)
      .populate('compatibleEquipment', 'name code')
      .sort({ name: 1 });
    
    res.json(spareParts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single spare part
// @route   GET /api/spareparts/:id
// @access  Private
const getSparePartById = async (req, res) => {
  try {
    const sparePart = await SparePart.findById(req.params.id)
      .populate('compatibleEquipment', 'name code location');
    
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    
    res.json(sparePart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create spare part
// @route   POST /api/spareparts
// @access  Private/Manager
const createSparePart = async (req, res) => {
  try {
    const sparePart = await SparePart.create(req.body);
    res.status(201).json(sparePart);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Part number already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update spare part
// @route   PUT /api/spareparts/:id
// @access  Private/Manager
const updateSparePart = async (req, res) => {
  try {
    const sparePart = await SparePart.findById(req.params.id);
    
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    
    const updatedSparePart = await SparePart.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedSparePart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete spare part
// @route   DELETE /api/spareparts/:id
// @access  Private/Manager
const deleteSparePart = async (req, res) => {
  try {
    const sparePart = await SparePart.findById(req.params.id);
    
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    
    await sparePart.deleteOne();
    res.json({ message: 'Spare part removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update spare part quantity
// @route   PATCH /api/spareparts/:id/quantity
// @access  Private
const updateQuantity = async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add' or 'subtract'
    
    const sparePart = await SparePart.findById(req.params.id);
    
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    
    if (operation === 'add') {
      sparePart.quantity.current += quantity;
      sparePart.lastRestockDate = Date.now();
    } else if (operation === 'subtract') {
      if (sparePart.quantity.current < quantity) {
        return res.status(400).json({ message: 'Insufficient quantity' });
      }
      sparePart.quantity.current -= quantity;
    } else {
      sparePart.quantity.current = quantity;
    }
    
    await sparePart.save();
    res.json(sparePart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get low stock parts
// @route   GET /api/spareparts/low-stock
// @access  Private
const getLowStockParts = async (req, res) => {
  try {
    const spareParts = await SparePart.find({
      $expr: { $lte: ['$quantity.current', '$reorderPoint'] }
    }).sort({ 'quantity.current': 1 });
    
    res.json(spareParts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSpareParts,
  getSparePartById,
  createSparePart,
  updateSparePart,
  deleteSparePart,
  updateQuantity,
  getLowStockParts
};
