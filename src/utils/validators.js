const validator = require('validator');

function validateRegistration(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!data.email || !validator.isEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  return { isValid: errors.length === 0, errors };
}

function validateProduct(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Product name is required');
  }

  if (!data.description) {
    errors.push('Product description is required');
  }

  if (!data.category) {
    errors.push('Category is required');
  }

  if (data.price === undefined || data.price < 0) {
    errors.push('Valid price is required');
  }

  if (data.stock !== undefined && data.stock < 0) {
    errors.push('Stock cannot be negative');
  }

  return { isValid: errors.length === 0, errors };
}

function validateBlog(data) {
  const errors = [];

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Blog title must be at least 3 characters');
  }

  if (!data.content || data.content.trim().length < 10) {
    errors.push('Blog content is required');
  }

  return { isValid: errors.length === 0, errors };
}

function validateOrder(data) {
  const errors = [];

  if (!data.items || data.items.length === 0) {
    errors.push('Order must have at least one item');
  }

  if (!data.shippingAddress) {
    errors.push('Shipping address is required');
  }

  if (!data.paymentMethod) {
    errors.push('Payment method is required');
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = {
  validateRegistration,
  validateProduct,
  validateBlog,
  validateOrder
};
