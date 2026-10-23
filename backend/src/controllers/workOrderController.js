const WorkOrder = require('../models/WorkOrder');

// @desc    Get all work orders
// @route   GET /api/workorders
// @access  Private
const getWorkOrders = async (req, res) => {
  try {
    const { status, type, priority, assignedTo } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    // Technicians only see their assigned work orders
    if (req.user.role === 'technician') {
      query.assignedTo = req.user._id;
    }

    const workOrders = await WorkOrder.find(query)
      .populate('equipment', 'name code location')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single work order
// @route   GET /api/workorders/:id
// @access  Private
const getWorkOrderById = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate('equipment', 'name code location type')
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email phone')
      .populate('partsUsed.part', 'name partNumber');
    
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    
    // Check if technician is authorized to view this work order
    if (req.user.role === 'technician' && 
        workOrder.assignedTo && 
        workOrder.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create work order
// @route   POST /api/workorders
// @access  Private
const createWorkOrder = async (req, res) => {
  try {
    const orderNumber = await WorkOrder.generateOrderNumber();
    
    const workOrder = await WorkOrder.create({
      ...req.body,
      orderNumber,
      reportedBy: req.user._id
    });
    
    const populatedWorkOrder = await WorkOrder.findById(workOrder._id)
      .populate('equipment', 'name code')
      .populate('reportedBy', 'name email');
    
    res.status(201).json(populatedWorkOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update work order
// @route   PUT /api/workorders/:id
// @access  Private
const updateWorkOrder = async (req, res) => {
  try {
    let workOrder = await WorkOrder.findById(req.params.id);
    
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    
    // Check if technician is authorized to update this work order
    if (req.user.role === 'technician' && 
        workOrder.assignedTo && 
        workOrder.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    workOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('equipment', 'name code')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');
    
    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete work order
// @route   DELETE /api/workorders/:id
// @access  Private/Manager
const deleteWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    
    await workOrder.deleteOne();
    res.json({ message: 'Work order removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get work order statistics
// @route   GET /api/workorders/stats
// @access  Private
const getWorkOrderStats = async (req, res) => {
  try {
    const stats = await WorkOrder.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          openOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
          },
          inProgressOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          avgCompletionTime: { $avg: '$estimatedHours' }
        }
      }
    ]);
    
    const byPriority = await WorkOrder.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const byType = await WorkOrder.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      summary: stats[0] || {},
      byPriority,
      byType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  getWorkOrderStats
};
