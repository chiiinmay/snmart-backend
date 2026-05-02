const slugify = require('slugify');

function generateSlug(text) {
  return slugify(text, { lower: true, strict: true });
}

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SNM-${timestamp}-${random}`;
}

function generateSKU(category, name) {
  const catCode = category.substring(0, 3).toUpperCase();
  const nameCode = name.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${catCode}-${nameCode}-${random}`;
}

function paginate(query, page = 1, limit = 12) {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
}

function sanitizeHtml(html) {
  // Basic sanitization — remove script tags
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

module.exports = {
  generateSlug,
  generateOrderNumber,
  generateSKU,
  paginate,
  sanitizeHtml
};
