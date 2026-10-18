import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const checkData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Count documents in each collection
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    const orderCount = await Order.countDocuments();

    console.log('Database contents:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Products: ${productCount}`);
    console.log(`- Categories: ${categoryCount}`);
    console.log(`- Orders: ${orderCount}`);

    // Show sample data
    const sampleProducts = await Product.find().limit(3).select('name price brand');
    console.log('\nSample products:');
    sampleProducts.forEach(product => {
      console.log(`  - ${product.name} (${product.brand}): $${product.price}`);
    });

    process.exit();
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
};

checkData();
