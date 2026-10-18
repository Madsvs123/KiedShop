import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';
import Cart from '../models/Cart.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for seeding...'))
  .catch(err => console.log(err));

// ==================== REAL IMAGE URLs ====================
const IMAGES = {
  // Category Images
  categories: {
    medical_equipment: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800',
    medical_books: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
    diagnostics: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    surgical: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800',
    lab_equipment: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
    patient_care: 'https://images.unsplash.com/photo-1576765608535-5f04d1e1f2f7?w=800',
  },
  
  // Product Primary Images
  products: {
    stethoscope: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=500',
    thermometer: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500',
    bp_monitor: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500',
    pulse_oximeter: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500',
    nebulizer: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500',
    wheelchair: 'https://images.unsplash.com/photo-1584291523564-5017e9cf9849?w=500',
    hospital_bed: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
    infusion_pump: 'https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?w=500',
    ecg_machine: 'https://images.unsplash.com/photo-1656511642757-0d6c2b2e96d0?w=500',
    ultrasound: 'https://images.unsplash.com/photo-1599508704512-2f19e2c3e6b7?w=500',
    anatomy_book: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=500',
    medical_dictionary: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500',
    pharmacology_book: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500',
    nursing_book: 'https://images.unsplash.com/photo-1585435557343-3b092031a7a1?w=500',
    surgery_book: 'https://images.unsplash.com/photo-1588776814546-ecf3d727f7e1?w=500',
    stethoscope_spare: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=500',
    gloves: 'https://images.unsplash.com/photo-1585435557343-3b092031a7a1?w=500',
    mask: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=500',
    ventilator: 'https://images.unsplash.com/photo-1588776814546-ecf3d727f7e1?w=500',
    defibrillator: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500',
  },
  
  // Secondary Images
  secondary: {
    stethoscope_2: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=500',
    stethoscope_3: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=500',
    thermometer_2: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500',
    bp_monitor_2: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500',
    nebulizer_2: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500',
  }
};

// ==================== SEED DATA ====================

// Categories with Subcategories
const categories = [
  {
    name: 'Medical Equipment',
    slug: 'medical-equipment',
    description: 'Professional medical equipment for healthcare facilities and home care',
    image: IMAGES.categories.medical_equipment,
    subcategories: [
      { name: 'Diagnostic Tools', slug: 'diagnostic-tools', description: 'Stethoscopes, thermometers, blood pressure monitors' },
      { name: 'Monitoring Devices', slug: 'monitoring-devices', description: 'ECG monitors, pulse oximeters' },
      { name: 'Respiratory Equipment', slug: 'respiratory-equipment', description: 'Nebulizers, ventilators, oxygen concentrators' },
      { name: 'Mobility Aids', slug: 'mobility-aids', description: 'Wheelchairs, walkers, crutches' },
    ],
    isSubcategory: false,
    parentCategory: null
  },
  {
    name: 'Medical Books',
    slug: 'medical-books',
    description: 'Comprehensive medical textbooks and reference materials',
    image: IMAGES.categories.medical_books,
    subcategories: [
      { name: 'Anatomy', slug: 'anatomy', description: 'Anatomy textbooks and atlases' },
      { name: 'Pharmacology', slug: 'pharmacology', description: 'Drug guides and pharmacology references' },
      { name: 'Clinical Medicine', slug: 'clinical-medicine', description: 'Clinical practice guidelines' },
      { name: 'Nursing', slug: 'nursing', description: 'Nursing textbooks and study guides' },
    ],
    isSubcategory: false,
    parentCategory: null
  },
  {
    name: 'Diagnostic Equipment',
    slug: 'diagnostic-equipment',
    description: 'High-precision diagnostic tools for accurate patient assessment',
    image: IMAGES.categories.diagnostics,
    subcategories: [
      { name: 'Cardiology', slug: 'cardiology', description: 'ECG, EKG machines' },
      { name: 'Radiology', slug: 'radiology', description: 'X-ray, ultrasound equipment' },
    ],
    isSubcategory: false,
    parentCategory: null
  },
  {
    name: 'Surgical Instruments',
    slug: 'surgical-instruments',
    description: 'Premium surgical instruments for operating rooms',
    image: IMAGES.categories.surgical,
    subcategories: [],
    isSubcategory: false,
    parentCategory: null
  },
  {
    name: 'Lab Equipment',
    slug: 'lab-equipment',
    description: 'Laboratory equipment for clinical and research labs',
    image: IMAGES.categories.lab_equipment,
    subcategories: [],
    isSubcategory: false,
    parentCategory: null
  },
  {
    name: 'Patient Care',
    slug: 'patient-care',
    description: 'Products for patient comfort and care',
    image: IMAGES.categories.patient_care,
    subcategories: [],
    isSubcategory: false,
    parentCategory: null
  }
];

// Products
const products = [
  {
    name: 'Professional 3M Littmann Stethoscope',
    description: 'High-quality cardiology grade stethoscope with dual head and noise cancellation technology. Perfect for medical professionals.',
    price: 129.99,
    brand: '3M Littmann',
    countInStock: 45,
    primaryImage: IMAGES.products.stethoscope,
    secondaryImages: [IMAGES.secondary.stethoscope_2, IMAGES.secondary.stethoscope_3],
    rating: 4.8,
    numReviews: 0,
    subcategory: 'Diagnostic Tools'
  },
  {
    name: 'Digital Infrared Thermometer',
    description: 'Non-contact forehead thermometer with instant reading. FDA approved and clinically tested.',
    price: 39.99,
    brand: 'Braun',
    countInStock: 120,
    primaryImage: IMAGES.products.thermometer,
    secondaryImages: [IMAGES.secondary.thermometer_2],
    rating: 4.6,
    numReviews: 0,
    subcategory: 'Diagnostic Tools'
  },
  {
    name: 'Automatic Blood Pressure Monitor',
    description: 'Upper arm blood pressure monitor with large display and memory storage for up to 60 readings.',
    price: 59.99,
    brand: 'Omron',
    countInStock: 78,
    primaryImage: IMAGES.products.bp_monitor,
    secondaryImages: [IMAGES.secondary.bp_monitor_2],
    rating: 4.7,
    numReviews: 0,
    subcategory: 'Diagnostic Tools'
  },
  {
    name: 'Fingertip Pulse Oximeter',
    description: 'Accurate oxygen saturation and heart rate monitoring. OLED display with plethysmograph.',
    price: 24.99,
    brand: 'ChoiceMMed',
    countInStock: 200,
    primaryImage: IMAGES.products.pulse_oximeter,
    rating: 4.5,
    numReviews: 0,
    subcategory: 'Monitoring Devices'
  },
  {
    name: 'Portable Nebulizer',
    description: 'Compressor nebulizer for respiratory treatments. Quiet operation and portable design.',
    price: 49.99,
    brand: 'Omron',
    countInStock: 56,
    primaryImage: IMAGES.products.nebulizer,
    secondaryImages: [IMAGES.secondary.nebulizer_2],
    rating: 4.4,
    numReviews: 0,
    subcategory: 'Respiratory Equipment'
  },
  {
    name: 'Lightweight Wheelchair',
    description: 'Folding aluminum wheelchair with removable armrests and swing-away footrests.',
    price: 299.99,
    brand: 'Drive Medical',
    countInStock: 23,
    primaryImage: IMAGES.products.wheelchair,
    rating: 4.3,
    numReviews: 0,
    subcategory: 'Mobility Aids'
  },
  {
    name: 'Adjustable Hospital Bed',
    description: 'Electric hospital bed with adjustable head and foot positions. Includes side rails.',
    price: 1299.99,
    brand: 'Invacare',
    countInStock: 12,
    primaryImage: IMAGES.products.hospital_bed,
    rating: 4.9,
    numReviews: 0,
    subcategory: 'Mobility Aids'
  },
  {
    name: 'Infusion Pump',
    description: 'Ambulatory infusion pump for precise medication delivery. User-friendly interface.',
    price: 899.99,
    brand: 'BD',
    countInStock: 8,
    primaryImage: IMAGES.products.infusion_pump,
    rating: 4.7,
    numReviews: 0,
    subcategory: 'Monitoring Devices'
  },
  {
    name: '12-Lead ECG Machine',
    description: 'Portable electrocardiograph with interpretation. Digital storage and printing capability.',
    price: 2499.99,
    brand: 'GE Healthcare',
    countInStock: 5,
    primaryImage: IMAGES.products.ecg_machine,
    rating: 4.8,
    numReviews: 0,
    subcategory: 'Monitoring Devices'
  },
  {
    name: 'Portable Ultrasound Scanner',
    description: 'Handheld wireless ultrasound for point-of-care diagnostics. Android/iOS compatible.',
    price: 3499.99,
    brand: 'Butterfly',
    countInStock: 3,
    primaryImage: IMAGES.products.ultrasound,
    rating: 4.9,
    numReviews: 0,
    subcategory: 'Diagnostic Tools'
  },
  {
    name: "Gray's Anatomy - 42nd Edition",
    description: 'The definitive anatomy reference book with over 1,300 illustrations and clinical case studies.',
    price: 89.99,
    brand: 'Elsevier',
    countInStock: 150,
    primaryImage: IMAGES.products.anatomy_book,
    rating: 4.9,
    numReviews: 0,
    subcategory: 'Anatomy'
  },
  {
    name: 'Stedman\'s Medical Dictionary',
    description: 'Comprehensive medical dictionary with over 110,000 terms and illustrations.',
    price: 49.99,
    brand: 'Stedman\'s',
    countInStock: 200,
    primaryImage: IMAGES.products.medical_dictionary,
    rating: 4.8,
    numReviews: 0,
    subcategory: 'Clinical Medicine'
  },
  {
    name: 'Goodman & Gilman\'s Pharmacology',
    description: 'Complete guide to pharmacology and therapeutic principles.',
    price: 79.99,
    brand: 'McGraw-Hill',
    countInStock: 120,
    primaryImage: IMAGES.products.pharmacology_book,
    rating: 4.7,
    numReviews: 0,
    subcategory: 'Pharmacology'
  },
  {
    name: 'Nursing 2025 Drug Handbook',
    description: 'Updated drug guide with patient safety information and clinical alerts.',
    price: 44.99,
    brand: 'Lippincott',
    countInStock: 180,
    primaryImage: IMAGES.products.nursing_book,
    rating: 4.6,
    numReviews: 0,
    subcategory: 'Nursing'
  },
  {
    name: 'Sabiston Textbook of Surgery',
    description: 'Comprehensive surgery textbook covering all surgical subspecialties.',
    price: 149.99,
    brand: 'Elsevier',
    countInStock: 75,
    primaryImage: IMAGES.products.surgery_book,
    rating: 4.9,
    numReviews: 0,
    subcategory: 'Clinical Medicine'
  },
  {
    name: 'Littmann Cardiology IV Stethoscope',
    description: 'Premium cardiology stethoscope with dual-lumen tubing and tunable diaphragms.',
    price: 199.99,
    brand: '3M Littmann',
    countInStock: 38,
    primaryImage: IMAGES.products.stethoscope_spare,
    rating: 4.9,
    numReviews: 0,
    subcategory: 'Diagnostic Tools'
  },
  {
    name: 'Nitrile Exam Gloves (Box of 100)',
    description: 'Powder-free, latex-free examination gloves. Available in sizes S-XXL.',
    price: 14.99,
    brand: 'Medline',
    countInStock: 500,
    primaryImage: IMAGES.products.gloves,
    rating: 4.4,
    numReviews: 0,
    subcategory: 'Patient Care'
  },
  {
    name: 'N95 Respirator Masks (20-pack)',
    description: 'NIOSH-approved N95 masks for respiratory protection.',
    price: 29.99,
    brand: '3M',
    countInStock: 300,
    primaryImage: IMAGES.products.mask,
    rating: 4.7,
    numReviews: 0,
    subcategory: 'Patient Care'
  },
  {
    name: 'Portable Ventilator',
    description: 'Emergency transport ventilator with multiple ventilation modes.',
    price: 4999.99,
    brand: 'Hamilton Medical',
    countInStock: 2,
    primaryImage: IMAGES.products.ventilator,
    rating: 4.8,
    numReviews: 0,
    subcategory: 'Respiratory Equipment'
  },
  {
    name: 'AED Defibrillator',
    description: 'Automated external defibrillator for public access and emergency response.',
    price: 1499.99,
    brand: 'Philips',
    countInStock: 15,
    primaryImage: IMAGES.products.defibrillator,
    rating: 4.9,
    numReviews: 0,
    subcategory: 'Monitoring Devices'
  }
];

// Users (plain text passwords - model will hash them via save())
const users = [
  {
    name: 'Admin User',
    email: 'admin@medistore.com',
    password: 'admin123',
    isAdmin: true,
    address: '123 Admin Street, New York, NY 10001',
    phone: '+1-555-0100'
  },
  {
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123',
    isAdmin: false,
    address: '456 Oak Avenue, New York, NY 10001',
    phone: '+1-555-0101'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: 'password123',
    isAdmin: false,
    address: '789 Pine Road, Los Angeles, CA 90001',
    phone: '+1-555-0102'
  },
  {
    name: 'Michael Brown',
    email: 'michael@example.com',
    password: 'password123',
    isAdmin: false,
    address: '321 Maple Drive, Chicago, IL 60601',
    phone: '+1-555-0103'
  },
  {
    name: 'Emily Davis',
    email: 'emily@example.com',
    password: 'password123',
    isAdmin: false,
    address: '654 Cedar Lane, Houston, TX 77001',
    phone: '+1-555-0104'
  },
  {
    name: 'Dr. James Wilson',
    email: 'wilson@medistore.com',
    password: 'password123',
    isAdmin: false,
    address: '987 Medical Center Drive, Boston, MA 02101',
    phone: '+1-555-0105'
  },
  {
    name: 'Maria Garcia',
    email: 'maria@example.com',
    password: 'password123',
    isAdmin: false,
    address: '147 Sunset Blvd, Miami, FL 33101',
    phone: '+1-555-0106'
  },
  {
    name: 'David Lee',
    email: 'david@example.com',
    password: 'password123',
    isAdmin: false,
    address: '258 Broadway, Seattle, WA 98101',
    phone: '+1-555-0107'
  }
];

// Coupons
const coupons = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    validUntil: new Date('2025-12-31'),
    isActive: true
  },
  {
    code: 'MEDSAVE20',
    discountType: 'percentage',
    discountValue: 20,
    validUntil: new Date('2025-12-31'),
    isActive: true
  },
  {
    code: 'FLASH25',
    discountType: 'percentage',
    discountValue: 25,
    validUntil: new Date('2025-03-15'),
    isActive: true
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 10,
    validUntil: new Date('2025-12-31'),
    isActive: true
  },
  {
    code: 'BULK15',
    discountType: 'percentage',
    discountValue: 15,
    validUntil: new Date('2025-06-30'),
    isActive: true
  },
  {
    code: 'NEWYEAR2025',
    discountType: 'percentage',
    discountValue: 30,
    validUntil: new Date('2025-01-31'),
    isActive: true
  }
];

// Generate orders
const generateOrders = (usersList, productsList) => {
  const orders = [];
  const regularUsers = usersList.filter(u => !u.isAdmin);
  
  if (regularUsers.length === 0) return [];
  
  for (let i = 0; i < 50; i++) {
    const user = regularUsers[Math.floor(Math.random() * regularUsers.length)];
    const numItems = Math.floor(Math.random() * 4) + 1;
    const selectedProducts = [];
    let total = 0;
    const usedProductIds = new Set();
    
    for (let j = 0; j < numItems; j++) {
      let product;
      let attempts = 0;
      do {
        product = productsList[Math.floor(Math.random() * productsList.length)];
        attempts++;
        if (attempts > 20) break;
      } while (usedProductIds.has(product._id.toString()));
      
      if (attempts > 20) continue;
      
      usedProductIds.add(product._id.toString());
      const qty = Math.floor(Math.random() * 3) + 1;
      selectedProducts.push({
        name: product.name,
        qty: qty,
        image: product.primaryImage,
        price: product.price,
        product: product._id
      });
      total += product.price * qty;
    }
    
    if (selectedProducts.length === 0) continue;
    
    const shipping = total > 50 ? 0 : 9.99;
    const tax = total * 0.08;
    const isPaid = Math.random() > 0.3;
    const isDelivered = isPaid && Math.random() > 0.5;
    
    orders.push({
      user: user._id,
      orderItems: selectedProducts,
      shippingAddress: {
        address: user.address,
        city: user.address.split(',')[1]?.trim() || 'New York',
        postalCode: user.address.split(',')[2]?.trim() || '10001',
        country: 'United States'
      },
      paymentMethod: Math.random() > 0.5 ? 'credit_card' : 'paypal',
      itemsPrice: total,
      taxPrice: tax,
      shippingPrice: shipping,
      totalPrice: total + shipping + tax,
      isPaid: isPaid,
      isDelivered: isDelivered,
      paidAt: isPaid ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
      deliveredAt: isDelivered ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000) : null,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
    });
  }
  
  return orders;
};

// Main seed function
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Order.deleteMany();
    await Coupon.deleteMany();
    await Notification.deleteMany();
    await Cart.deleteMany();
    
    console.log('Data cleared...');
    
    // Import Categories (insertMany is fine for these - no middleware needed)
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} Categories imported...`);
    
    // Get category references
    const medicalEquipCat = createdCategories.find(c => c.name === 'Medical Equipment');
    const medicalBooksCat = createdCategories.find(c => c.name === 'Medical Books');
    const diagnosticCat = createdCategories.find(c => c.name === 'Diagnostic Equipment');
    const surgicalCat = createdCategories.find(c => c.name === 'Surgical Instruments');
    const labCat = createdCategories.find(c => c.name === 'Lab Equipment');
    const patientCareCat = createdCategories.find(c => c.name === 'Patient Care');
    
    // Map products to categories
    const productsWithCategories = products.map(product => {
      let category;
      const bookSubcategories = ['Anatomy', 'Pharmacology', 'Clinical Medicine', 'Nursing'];
      const diagnosticSubcategories = ['Diagnostic Tools', 'Monitoring Devices'];
      
      if (bookSubcategories.includes(product.subcategory)) {
        category = medicalBooksCat._id;
      } else if (diagnosticSubcategories.includes(product.subcategory)) {
        category = medicalEquipCat._id;
      } else if (product.subcategory === 'Respiratory Equipment' || product.subcategory === 'Mobility Aids') {
        category = medicalEquipCat._id;
      } else if (product.name.includes('Diagnostic') || product.name.includes('ECG')) {
        category = diagnosticCat?._id || medicalEquipCat._id;
      } else if (product.name.includes('Surgical')) {
        category = surgicalCat?._id || medicalEquipCat._id;
      } else if (product.name.includes('Lab')) {
        category = labCat?._id || medicalEquipCat._id;
      } else if (product.name.includes('Glove') || product.name.includes('Mask')) {
        category = patientCareCat?._id || medicalEquipCat._id;
      } else {
        category = medicalEquipCat._id;
      }
      
      return { ...product, category };
    });
    
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`${createdProducts.length} Products imported...`);
    
    // Import Users ONE BY ONE to trigger password hashing middleware
    console.log('Importing users with password hashing...');
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save(); // This triggers the pre('save') middleware
      createdUsers.push(user);
    }
    console.log(`${createdUsers.length} Users imported (passwords hashed)...`);
    
    // Update product user references
    for (const product of createdProducts) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      product.user = randomUser._id;
      await product.save();
    }
    console.log('Product user references updated...');
    
    // Import Coupons
    const createdCoupons = await Coupon.insertMany(coupons);
    console.log(`${createdCoupons.length} Coupons imported...`);
    
    // Generate and import Orders
    const orders = generateOrders(createdUsers, createdProducts);
    if (orders.length > 0) {
      const createdOrders = await Order.insertMany(orders);
      console.log(`${createdOrders.length} Orders imported...`);
    }
    
    console.log('\x1b[32m%s\x1b[0m', '✓ All data imported successfully!');
    console.log('\x1b[36m%s\x1b[0m', '\n📊 Summary:');
    console.log(`   - ${createdCategories.length} Categories`);
    console.log(`   - ${createdProducts.length} Products`);
    console.log(`   - ${createdUsers.length} Users (passwords hashed)`);
    console.log(`   - ${orders.length} Orders`);
    console.log(`   - ${createdCoupons.length} Coupons`);
    
    console.log('\n\x1b[33m%s\x1b[0m', '🔑 Demo Login Credentials:');
    console.log('   Admin: admin@medistore.com / admin123');
    console.log('   User: john@example.com / password123');
    console.log('   User: sarah@example.com / password123');
    
    process.exit();
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error importing data:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Order.deleteMany();
    await Coupon.deleteMany();
    await Notification.deleteMany();
    await Cart.deleteMany();
    
    console.log('\x1b[32m%s\x1b[0m', 'Data destroyed!');
    process.exit();
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `Error: ${error}`);
    process.exit(1);
  }
};

// Run seed based on command line argument
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}