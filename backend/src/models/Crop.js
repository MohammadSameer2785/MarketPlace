import mongoose from "mongoose";

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  priceUnit: {
    type: String,
    enum: ['kg', 'quintal'],
    default: 'kg'
  },
  quantity: {
    type: Number,
    required: true
  },
  quantityUnit: {
    type: String,
    enum: ['kg', 'quintal'],
    default: 'kg'
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    state: String,
    district: String,
    village: String
  },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'other'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  demandScore: {
    type: Number,
    default: 0
  },
  saleFrequency: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

cropSchema.index({ name: 1, location: 1 });
cropSchema.index({ demandScore: -1 });
cropSchema.index({ saleFrequency: -1 });

export default mongoose.model('Crop', cropSchema);
