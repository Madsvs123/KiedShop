import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a product description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a product price'],
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please add a product category']
    },
    subcategory: {
        type: String,
        default: ''
    },
    brand: {
        type: String,
        required: [true, 'Please add a product brand']
    },
    countInStock: {
        type: Number,
        required: [true, 'Please add the stock count'],
        default: 0
    },
    primaryImage: {
        type: String,
        default: '/images/sample.jpg'
    },
    secondaryImages: {
        type: [String],
        default: []
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for better query performance
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;