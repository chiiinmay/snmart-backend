const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    index: true,
    enum: ['immunity', 'digestion', 'hair-care', 'skin-care', 'joint-care', 'respiratory', 'general-wellness', 'womens-health', 'mens-health', 'kids-health', 'oral-care', 'eye-care']
  },
  subCategory: String,
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  images: [{
    type: String
  }],
  ingredients: [String],
  benefits: [String],
  dosage: String,
  symptoms: {
    type: [String],
    index: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  weight: String,
  metaTitle: String,
  metaDescription: String,
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  purchaseCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return Math.round(this.price - (this.price * this.discount / 100));
  }
  return this.price;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
