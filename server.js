const express = require('express');
const cors = require('cors');
const app = express();

// ===== CORS MIDDLEWARE =====
app.use(cors({
  origin: ['http://localhost:3000', 'https://frontend-kwu-team.vercel.app'],
  credentials: true
}));

app.use(express.json());

// ===== DATA STRUKTUR =====
let users = [
  { id: 1, name: 'User1', email: 'user1@gmail.com', password: '123456', role: 'user', phone: '081234567890' }
];

let providers = [
  { id: 1, name: 'Budi (Driver)', email: 'budi@gmail.com', password: '123456', role: 'provider', category: 'Transportasi', phone: '081234567891', price: 50000, rating: 4.5, reviews: 12, photo: 'https://via.placeholder.com/200?text=Driver+Budi' },
  { id: 2, name: 'Siti (Makanan)', email: 'siti@gmail.com', password: '123456', role: 'provider', category: 'Makanan', phone: '081234567892', price: 35000, rating: 4.8, reviews: 25, photo: 'https://via.placeholder.com/200?text=Chef+Siti' }
];

let categories = [
  { id: 1, nama: 'Transportasi', emoji: '🚗', desc: 'Pesan driver' },
  { id: 2, nama: 'Makanan', emoji: '🍜', desc: 'Pesan makanan' },
  { id: 3, nama: 'Kurir', emoji: '📦', desc: 'Pengiriman' },
  { id: 4, nama: 'Belanja', emoji: '🛍️', desc: 'Belanja kebutuhan' },
  { id: 5, nama: 'Bantuan', emoji: '🔧', desc: 'Jasa & bantuan' }
];

let orders = [];
let orderIdCounter = 1;

let ratings = [];

// ===== API ROUTES =====

// 1. Home
app.get('/', (req, res) => {
  res.json({ pesan: 'Selamat datang di SahabatGo!' });
});

// ===== AUTHENTICATION =====

// User Login
app.post('/api/auth/user-login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ success: false, pesan: 'Email atau password salah' });
  }
  
  res.json({ success: true, data: user });
});

// User Register
app.post('/api/auth/user-register', (req, res) => {
  const { name, email, password, phone } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, pesan: 'Email sudah terdaftar' });
  }
  
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    phone,
    role: 'user'
  };
  
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// Provider Login
app.post('/api/auth/provider-login', (req, res) => {
  const { email, password } = req.body;
  const provider = providers.find(p => p.email === email && p.password === password);
  
  if (!provider) {
    return res.status(401).json({ success: false, pesan: 'Email atau password salah' });
  }
  
  res.json({ success: true, data: provider });
});

// Provider Register
app.post('/api/auth/provider-register', (req, res) => {
  const { name, email, password, phone, category, price } = req.body;
  
  if (providers.find(p => p.email === email)) {
    return res.status(400).json({ success: false, pesan: 'Email sudah terdaftar' });
  }
  
  const newProvider = {
    id: providers.length + 1,
    name,
    email,
    password,
    phone,
    category,
    price,
    rating: 5.0,
    reviews: 0,
    role: 'provider',
    photo: 'https://via.placeholder.com/200?text=' + name
  };
  
  providers.push(newProvider);
  res.status(201).json({ success: true, data: newProvider });
});

// ===== CATEGORY ROUTES =====

app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: categories });
});

// ===== PROVIDER ROUTES =====

// Get providers by category
app.get('/api/providers/:category', (req, res) => {
  const providersByCategory = providers.filter(p => p.category === req.params.category);
  res.json({ success: true, data: providersByCategory });
});

// Get single provider
app.get('/api/provider/:id', (req, res) => {
  const provider = providers.find(p => p.id == req.params.id);
  if (!provider) {
    return res.status(404).json({ success: false, pesan: 'Provider tidak ditemukan' });
  }
  res.json({ success: true, data: provider });
});

// ===== ORDER ROUTES =====

// Create order
app.post('/api/orders', (req, res) => {
  const { userId, providerId, categoryName, totalPrice, description } = req.body;
  
  if (!userId || !providerId) {
    return res.status(400).json({ success: false, pesan: 'User ID dan Provider ID harus diisi!' });
  }
  
  const newOrder = {
    id: orderIdCounter++,
    userId,
    providerId,
    categoryName,
    totalPrice,
    description,
    status: 'pending', // pending, accepted, in_progress, completed
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  orders.push(newOrder);
  res.status(201).json({ success: true, data: newOrder });
});

// Get user orders
app.get('/api/orders/user/:userId', (req, res) => {
  const userOrders = orders.filter(o => o.userId == req.params.userId);
  res.json({ success: true, data: userOrders });
});

// Get provider orders
app.get('/api/orders/provider/:providerId', (req, res) => {
  const providerOrders = orders.filter(o => o.providerId == req.params.providerId);
  res.json({ success: true, data: providerOrders });
});

// Update order status
app.put('/api/orders/:orderId', (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id == req.params.orderId);
  
  if (!order) {
    return res.status(404).json({ success: false, pesan: 'Order tidak ditemukan' });
  }
  
  order.status = status;
  res.json({ success: true, data: order });
});

// ===== RATING ROUTES =====

// Create rating
app.post('/api/ratings', (req, res) => {
  const { userId, providerId, rating, review } = req.body;
  
  const newRating = {
    id: ratings.length + 1,
    userId,
    providerId,
    rating,
    review,
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  ratings.push(newRating);
  
  // Update provider rating
  const provider = providers.find(p => p.id === providerId);
  if (provider) {
    const providerRatings = ratings.filter(r => r.providerId === providerId);
    const avgRating = (providerRatings.reduce((sum, r) => sum + r.rating, 0) / providerRatings.length).toFixed(1);
    provider.rating = parseFloat(avgRating);
    provider.reviews = providerRatings.length;
  }
  
  res.status(201).json({ success: true, data: newRating });
});

// Get ratings for provider
app.get('/api/ratings/:providerId', (req, res) => {
  const providerRatings = ratings.filter(r => r.providerId == req.params.providerId);
  res.json({ success: true, data: providerRatings });
});

// ===== START SERVER =====
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server SahabatGo jalan di http://localhost:${PORT}`);
});