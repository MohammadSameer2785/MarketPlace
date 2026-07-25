import Crop from "../models/Crop.js";
import Order from "../models/Order.js";
import { body, validationResult } from "express-validator";

export const getAllCrops = async (req, res) => {
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
};

export const getTopDemandedCrops = async (req, res) => {
  try {
    const { state, district, village } = req.query;
    
    let matchQuery = { isActive: true };
    
    if (state) matchQuery['location.state'] = new RegExp(state, 'i');
    if (district) matchQuery['location.district'] = new RegExp(district, 'i');
    if (village) matchQuery['location.village'] = new RegExp(village, 'i');

    const topCrops = await Crop.aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          demandScore: {
            $add: [
              { $multiply: ['$saleFrequency', 10] },
              { $divide: [1000, { $add: ['$price', 1] }] },
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
};

export const addCrop = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, quantity, priceUnit, quantityUnit, description, category } = req.body;
    
    let location = req.user.address;
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
      image: req.file ? req.file.path : ''
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
};

export const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (crop.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this crop' });
    }

    const updates = {};
    const allowedFields = ['name', 'price', 'quantity', 'priceUnit', 'quantityUnit', 'description', 'category'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.body['location.state'] || req.body['location.district'] || req.body['location.village']) {
      updates.location = {
        state: req.body['location.state'] || crop.location?.state || '',
        district: req.body['location.district'] || crop.location?.district || '',
        village: req.body['location.village'] || crop.location?.village || '',
        pincode: req.body['location.pincode'] || crop.location?.pincode || ''
      };
    }

    if (req.file) {
      updates.image = req.file.path;
    }

    Object.assign(crop, updates);
    await crop.save();
    await crop.populate('farmer', 'name phone address');

    res.json(crop);
  } catch (error) {
    console.error('Update crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCrop = async (req, res) => {
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
};

export const getMyCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ farmer: req.user._id, isActive: true })
      .populate('farmer', 'name phone address')
      .sort({ createdAt: -1 });

    res.json(crops);
  } catch (error) {
    console.error('Get farmer crops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
