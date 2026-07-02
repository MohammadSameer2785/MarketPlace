const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
const { auth, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if the file exists
    if (!file) {
      return cb(null, true); // No file is okay (image is optional)
    }
    
    // Check file extension
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed!'), false);
    }
  }
});

// Get all crops with filters
router.get('/', async (req, res) => {
  try {
    const { 
      state, 
      district, 
      village, 
      minPrice, 
      maxPrice, 
      category,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    let query = { isActive: true };

    if (state) query['location.state'] = new RegExp(state, 'i');
    if (district) query['location.district'] = new RegExp(district, 'i');
    if (village) query['location.village'] = new RegExp(village, 'i');
    if (category) query.category = category;
    if (search) query.name = new RegExp(search, 'i');
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const crops = await Crop.find(query)
      .populate('farmer', 'name phone address')
      .sort(sortOptions);

    res.json(crops);
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top 8 most demanded crops
router.get('/top-demanded', async (req, res) => {
  try {
    const { state, district, village } = req.query;
    
    let matchQuery = { isActive: true };
    
    if (state) matchQuery['location.state'] = new RegExp(state, 'i');
    if (district) matchQuery['location.district'] = new RegExp(district, 'i');
    if (village) matchQuery['location.village'] = new RegExp(village, 'i');

    // Aggregate demand score based on sales frequency and price trends
    const topCrops = await Crop.aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          demandScore: {
            $add: [
              { $multiply: ['$saleFrequency', 10] },
              { $divide: [1000, { $add: ['$price', 1] }] }, // Lower price = higher demand
              { $multiply: [{ $size: { $ifNull: ['$orders', []] } }, 5] }
            ]
          }
        }
      },
      { $sort: { demandScore: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: 'users',
          localField: 'farmer',
          foreignField: '_id',
          as: 'farmer',
          pipeline: [{ $project: { name: 1, phone: 1, address: 1 } }]
        }
      },
      { $unwind: '$farmer' }
    ]);

    res.json(topCrops);
  } catch (error) {
    console.error('Get top demanded crops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new crop (Farmer only)
router.post('/', auth, authorizeRoles('farmer'), upload.single('image'), [
  body('name').notEmpty().withMessage('Crop name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('priceUnit').isIn(['kg', 'quintal']).withMessage('Invalid price unit'),
  body('quantityUnit').isIn(['kg', 'quintal']).withMessage('Invalid quantity unit'),
  body('category').isIn(['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, quantity, priceUnit, quantityUnit, description, category } = req.body;
    
    // Handle location data from FormData
    let location = req.user.address; // Default to user's address
    if (req.body['location.state'] || req.body['location.district'] || req.body['location.village']) {
      location = {
        state: req.body['location.state'] || req.user.address?.state || '',
        district: req.body['location.district'] || req.user.address?.district || '',
        village: req.body['location.village'] || req.user.address?.village || '',
        pincode: req.body['location.pincode'] || req.user.address?.pincode || ''
      };
    }

    const crop = new Crop({
      name,
      farmer: req.user._id,
      price,
      priceUnit,
      quantity,
      quantityUnit,
      description,
      category,
      location,
      image: req.file ? `/uploads/${req.file.filename}` : ''
    });

    await crop.save();
    await crop.populate('farmer', 'name phone address');

    res.status(201).json(crop);
  } catch (error) {
    console.error('Add crop error:', error);
    if (error.message && error.message.includes('Only image files')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update crop (Farmer only)
router.put('/:id', auth, authorizeRoles('farmer'), upload.single('image'), async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (crop.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this crop' });
    }

    // Update basic fields
    const updates = {};
    const allowedFields = ['name', 'price', 'quantity', 'priceUnit', 'quantityUnit', 'description', 'category'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle location data from FormData
    if (req.body['location.state'] || req.body['location.district'] || req.body['location.village']) {
      updates.location = {
        state: req.body['location.state'] || crop.location?.state || '',
        district: req.body['location.district'] || crop.location?.district || '',
        village: req.body['location.village'] || crop.location?.village || '',
        pincode: req.body['location.pincode'] || crop.location?.pincode || ''
      };
    }

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    Object.assign(crop, updates);
    await crop.save();
    await crop.populate('farmer', 'name phone address');

    res.json(crop);
  } catch (error) {
    console.error('Update crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete crop (Farmer only)
router.delete('/:id', auth, authorizeRoles('farmer'), async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (crop.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this crop' });
    }

    crop.isActive = false;
    await crop.save();

    res.json({ message: 'Crop deleted successfully' });
  } catch (error) {
    console.error('Delete crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get farmer's crops
router.get('/my-crops', auth, authorizeRoles('farmer'), async (req, res) => {
  try {
    const crops = await Crop.find({ farmer: req.user._id, isActive: true })
      .populate('farmer', 'name phone address')
      .sort({ createdAt: -1 });

    res.json(crops);
  } catch (error) {
    console.error('Get farmer crops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
