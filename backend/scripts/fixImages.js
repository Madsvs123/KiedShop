import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixImages() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Find all products that have image but no primaryImage
        const products = await Product.find({ image: { $exists: true, $ne: null }, primaryImage: { $exists: false } });

        console.log(`Found ${products.length} products to fix`);

        for (const product of products) {
            product.primaryImage = product.image;
            product.secondaryImages = [];
            
            await product.save();
            console.log(`Fixed product ${product._id} - ${product.name}`);
        }

        console.log('Image fixing completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Image fixing failed:', error);
        process.exit(1);
    }
}

fixImages();