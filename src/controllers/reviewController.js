const Review = require('../models/Review');

// Public: Get approved reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId, isApproved: true, isVisible: true })
      .sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, reviews });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// Public: Submit a review
exports.submitReview = async (req, res) => {
  try {
    const { name, rating, title, comment } = req.body;
    if (!name || !rating || !comment) return res.status(400).json({ success: false, message: 'Name, rating and comment required' });
    const review = await Review.create({
      productId: req.params.productId,
      userId: req.user?._id,
      name, rating: Number(rating), title, comment,
      isApproved: false // Requires admin approval
    });
    res.status(201).json({ success: true, message: 'Review submitted! It will appear after admin approval.', review });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// Admin: Get ALL reviews (including unapproved)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).populate('productId', 'name');
    res.json({ success: true, reviews });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// Admin: Approve/reject a review
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, review });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// Admin: Delete a review
exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
