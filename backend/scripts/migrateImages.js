import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateImages() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Find all products with the old image field
        const products = await Product.find({ image: { $exists: true } });

        console.log(`Found ${products.length} products to migrate`);

        for (const product of products) {
            if (product.image && !product.primaryImage) {
                product.primaryImage = product.image;
                product.secondaryImages = [];
                // Don't delete the image field, just add the new fields
                
                await product.save();
                console.log(`Migrated product ${product._id}`);
            }
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateImages();