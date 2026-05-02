const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try connecting to configured MongoDB first
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('⚠️  Local MongoDB not available. Starting in-memory MongoDB...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
      console.log('   ⚠️  Data will be lost on restart. Use MongoDB Atlas for persistence.');

      // Auto-seed some data after connecting
      setTimeout(async () => {
        try {
          await seedInitialData();
        } catch (e) {
          console.log('Seed warning:', e.message);
        }
      }, 1000);
    } catch (memErr) {
      console.error(`❌ Failed to start in-memory MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

async function seedInitialData() {
  const User = require('../models/User');
  const Product = require('../models/Product');
  const Blog = require('../models/Blog');

  const existingAdmin = await User.findOne({ email: 'admin@snmart.com' });
  if (existingAdmin) return;

  console.log('🌱 Seeding initial data...');

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@snmart.com',
    phone: '9876543210',
    password: 'admin123',
    role: 'admin'
  });

  await Product.insertMany([
    {
      name: 'Ashwagandha Capsules',
      description: 'Premium Ashwagandha root extract capsules for stress relief, energy boost, and overall vitality. Made from organically grown KSM-66 Ashwagandha.',
      category: 'immunity', price: 499, discount: 10, stock: 50,
      ingredients: ['Ashwagandha Root Extract', 'Black Pepper Extract', 'Vegetable Capsule'],
      benefits: ['Reduces stress and anxiety', 'Boosts immunity', 'Improves energy levels', 'Supports muscle strength'],
      symptoms: ['stress', 'fatigue', 'anxiety', 'low energy', 'weakness'],
      dosage: '1 capsule twice daily with warm water after meals',
      images: ['https://placehold.co/500x500/ECFDF5/10B981?text=Ashwagandha']
    },
    {
      name: 'Triphala Churna',
      description: 'Traditional Triphala powder blend of Amla, Haritaki, and Bibhitaki for digestive health and detoxification.',
      category: 'digestion', price: 299, discount: 15, stock: 80,
      ingredients: ['Amla', 'Haritaki', 'Bibhitaki'],
      benefits: ['Improves digestion', 'Natural detox', 'Supports gut health', 'Rich in Vitamin C'],
      symptoms: ['constipation', 'bloating', 'indigestion', 'acidity'],
      dosage: '1 teaspoon with warm water before bed',
      images: ['https://placehold.co/500x500/FEF3C7/D97706?text=Triphala']
    },
    {
      name: 'Brahmi Hair Oil',
      description: 'Ayurvedic hair oil infused with Brahmi, Amla, and Bhringraj for stronger, thicker, and healthier hair.',
      category: 'hair-care', price: 349, discount: 0, stock: 60,
      ingredients: ['Brahmi', 'Amla', 'Bhringraj', 'Coconut Oil', 'Sesame Oil'],
      benefits: ['Reduces hair fall', 'Promotes hair growth', 'Prevents premature graying', 'Nourishes scalp'],
      symptoms: ['hair fall', 'dandruff', 'dry hair', 'premature graying'],
      dosage: 'Apply to scalp 30 minutes before washing, 2-3 times per week.',
      images: ['https://placehold.co/500x500/EDE9FE/7C3AED?text=Brahmi+Oil']
    },
    {
      name: 'Kumkumadi Face Serum',
      description: 'Luxurious Kumkumadi oil serum with saffron and 16 herbs for radiant, glowing skin.',
      category: 'skin-care', price: 699, discount: 20, stock: 30,
      ingredients: ['Saffron', 'Sandalwood', 'Turmeric', 'Manjistha', 'Sesame Oil'],
      benefits: ['Brightens skin tone', 'Reduces dark spots', 'Anti-aging properties', 'Deep moisturizing'],
      symptoms: ['dark spots', 'dull skin', 'pigmentation', 'wrinkles', 'dry skin'],
      dosage: 'Apply 3-4 drops on clean face before bedtime.',
      images: ['https://placehold.co/500x500/FFF7ED/EA580C?text=Kumkumadi']
    },
    {
      name: 'Joint Pain Relief Oil',
      description: 'Powerful Ayurvedic oil blend with Mahanarayan and Nirgundi for joint pain and inflammation relief.',
      category: 'joint-care', price: 399, discount: 5, stock: 45,
      ingredients: ['Mahanarayan Oil', 'Nirgundi', 'Eucalyptus', 'Wintergreen'],
      benefits: ['Relieves joint pain', 'Reduces inflammation', 'Improves mobility', 'Soothes muscles'],
      symptoms: ['joint pain', 'arthritis', 'muscle pain', 'stiffness'],
      dosage: 'Massage gently on affected areas twice daily.',
      images: ['https://placehold.co/500x500/DBEAFE/2563EB?text=Joint+Oil']
    },
    {
      name: 'Tulsi Immunity Drops',
      description: 'Concentrated Tulsi extract drops for respiratory health and immune system support.',
      category: 'immunity', price: 249, discount: 0, stock: 100,
      ingredients: ['Rama Tulsi', 'Krishna Tulsi', 'Vana Tulsi'],
      benefits: ['Boosts immunity', 'Supports respiratory health', 'Natural antioxidant'],
      symptoms: ['cold', 'cough', 'fever', 'sore throat', 'low immunity'],
      dosage: '5-10 drops in warm water or tea, twice daily.',
      images: ['https://placehold.co/500x500/DCFCE7/16A34A?text=Tulsi+Drops']
    },
    {
      name: 'Chyawanprash - 500g',
      description: 'Traditional Chyawanprash made with 40+ herbs and Amla for overall health and vitality.',
      category: 'general-wellness', price: 449, discount: 12, stock: 70,
      ingredients: ['Amla', 'Ashwagandha', 'Pippali', 'Ghee', 'Honey'],
      benefits: ['Complete immunity booster', 'Rich in Vitamin C', 'Improves digestion'],
      symptoms: ['low immunity', 'weakness', 'fatigue', 'seasonal illness'],
      dosage: '1-2 teaspoons daily with warm milk.',
      images: ['https://placehold.co/500x500/FEF3C7/B45309?text=Chyawanprash']
    },
    {
      name: 'Neem Face Wash',
      description: 'Gentle Ayurvedic face wash with Neem, Turmeric, and Tea Tree for clear skin.',
      category: 'skin-care', price: 199, discount: 0, stock: 90,
      ingredients: ['Neem Extract', 'Turmeric', 'Tea Tree Oil', 'Aloe Vera'],
      benefits: ['Controls acne', 'Deep cleansing', 'Antibacterial', 'Soothes skin'],
      symptoms: ['acne', 'pimples', 'oily skin', 'skin infections'],
      dosage: 'Use twice daily - morning and night.',
      images: ['https://placehold.co/500x500/ECFDF5/059669?text=Neem+Wash']
    }
  ]);

  await Blog.insertMany([
    {
      title: '10 Amazing Benefits of Ashwagandha for Modern Life',
      content: '<p>Ashwagandha, known as the "King of Ayurvedic Herbs," has been used for over 3,000 years to relieve stress, increase energy levels, and improve concentration.</p><h2>Key Benefits</h2><ul><li>Reduces cortisol levels and stress</li><li>Boosts brain function and memory</li><li>Helps fight symptoms of anxiety</li><li>Increases muscle mass and strength</li><li>Improves heart health</li></ul><p>Incorporating Ashwagandha into your daily routine can transform your wellness journey.</p>',
      category: 'herbs', tags: ['ashwagandha', 'stress-relief', 'immunity'],
      author: admin._id, isPublished: true, publishedAt: new Date()
    },
    {
      title: 'The Complete Guide to Ayurvedic Morning Routine',
      content: '<p>Start your day the Ayurvedic way! A proper morning routine (Dinacharya) sets the foundation for optimal health.</p><h2>Steps</h2><ol><li>Wake up before sunrise</li><li>Oil pulling with sesame oil</li><li>Tongue scraping</li><li>Warm water with lemon</li><li>Yoga and meditation</li><li>Self-massage (Abhyanga)</li></ol><p>Following these steps can dramatically improve your energy and mental clarity.</p>',
      category: 'lifestyle', tags: ['morning-routine', 'dinacharya', 'wellness'],
      author: admin._id, isPublished: true, publishedAt: new Date()
    },
    {
      title: 'Understanding the Three Doshas: Vata, Pitta, and Kapha',
      content: '<p>According to Ayurveda, every person has a unique constitution made up of three doshas.</p><h2>Vata</h2><p>Governs movement. When balanced, Vata types are creative and energetic.</p><h2>Pitta</h2><p>Governs digestion. Balanced Pitta types are intelligent and focused.</p><h2>Kapha</h2><p>Governs structure. Balanced Kapha types are calm and loving.</p><p>Understanding your dosha helps you make better choices for optimal health.</p>',
      category: 'ayurveda', tags: ['doshas', 'vata', 'pitta', 'kapha'],
      author: admin._id, isPublished: true, publishedAt: new Date()
    }
  ]);

  console.log('✅ Seeded: admin (admin@snmart.com / admin123), 8 products, 3 blog posts');
}

module.exports = connectDB;
