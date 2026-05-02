const Blog = require('../models/Blog');
const { validateBlog } = require('../utils/validators');

// @desc    Get all published blogs
// @route   GET /api/blogs
exports.getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, tag } = req.query;

    let query = { isPublished: true };

    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .select('-content')
      .sort({ publishedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('author', 'name');

    res.json({
      success: true,
      blogs,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true })
      .populate('author', 'name');

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Increment view count
    blog.viewCount += 1;
    await blog.save();

    // Get related posts
    const relatedPosts = await Blog.find({
      _id: { $ne: blog._id },
      isPublished: true,
      $or: [
        { category: blog.category },
        { tags: { $in: blog.tags } }
      ]
    })
      .select('title slug excerpt featuredImage publishedAt')
      .limit(3)
      .sort({ publishedAt: -1 });

    res.json({ success: true, blog, relatedPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create blog (Admin)
// @route   POST /api/blogs
exports.createBlog = async (req, res) => {
  try {
    const { isValid, errors } = validateBlog(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    req.body.author = req.user._id;
    const blog = await Blog.create(req.body);

    res.status(201).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update blog (Admin)
// @route   PUT /api/blogs/:id
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    Object.assign(blog, req.body);
    await blog.save();

    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete blog (Admin)
// @route   DELETE /api/blogs/:id
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all blogs including drafts (Admin)
// @route   GET /api/admin/blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Blog.countDocuments();
    const blogs = await Blog.find()
      .select('-content')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('author', 'name');

    res.json({
      success: true,
      blogs,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
