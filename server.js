const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://frontend-kwu-team.vercel.app'],
  credentials: true
}));

app.use(express.json());

// ===== DATA =====
let users = [
  { id: 1, name: 'User1', email: 'user1@gmail.com', password: '123456', role: 'user', phone: '081234567890', gopay: 500000 }
];

let providers = [
  { id: 1, name: 'Budi (Driver)', email: 'budi@gmail.com', password: '123456', role: 'driver', type: 'GoRide', phone: '081234567891', rating: 4.5, reviews: 12, photo: 'https://via.placeholder.com/200?text=Driver+Budi' },
  { id: 2, name: 'Siti (Makanan)', email: 'siti@gmail.com', password: '123456', role: 'merchant', type: 'GoFood', phone: '081234567892', rating: 4.8, reviews: 25, photo: 'https://via.placeholder.com/200?text=Chef+Siti' }
];

let services = [
  { id: 1, name: 'GoRide', emoji: '🛵', desc: 'Pesan kendaraan', icon: '🚗' },
  { id: 2, name: 'GoFood', emoji: '🍔', desc: 'Pesan makanan', icon: '🍜' },
  { id: 3, name: 'GoSend', emoji: '📦', desc: 'Kirim barang', icon: '📮' },
  { id: 4, name: 'GoMart', emoji: '🛒', desc: 'Belanja', icon: '🏪' },
  { id: 5, name: 'GoService', emoji: '🔧', desc: 'Cari jasa', icon: '🔨' }
];

let orders = [];
let orderIdCounter = 1;

let promos = [
  { id: 1, name: 'Diskon 20% GoRide', desc: 'Perjalanan pertama', discount: 20, code: 'GORIDEHEMAT' },
  { id: 2, name: 'Gratis Ongkos GoSend', desc: 'Minimal Rp 50.000', discount: 100, code: 'GOSENDGRATIS' },
  { id: 3, name: 'Beli 2 Gratis 1', desc: 'Untuk GoFood', discount: 50, code: 'GOFOOD2GRATIS' }
];

let transactions = [];

let admins = [
  { id: 1, name: 'Admin', email: 'admin@sahabatgo.com', password: 'admin123', role: 'admin' }
];

// ===== AUTH =====
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  
  if (role === 'user') {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ success: false, pesan: 'Email atau password salah' });
    return res.json({ success: true, data: user });
  }
  
  if (role === 'admin') {
    const admin = admins.find(a => a.email === email && a.password === password);
    if (!admin) return res.status(401).json({ success: false, pesan: 'Email atau password salah' });
    return res.json({ success: true, data: admin });
  }
  
  const provider = providers.find(p => p.email === email && p.password === password);
  if (!provider) return res.status(401).json({ success: false, pesan: 'Email atau password salah' });
  res.json({ success: true, data: provider });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, role, type } = req.body;
  
  if (role === 'user') {
    if (users.find(u => u.email === email)) return res.status(400).json({ success: false, pesan: 'Email sudah terdaftar' });
    const newUser = { id: users.length + 1, name, email, password, phone, role, gopay: 0 };
    users.push(newUser);
    return res.status(201).json({ success: true, data: newUser });
  }
  
  if (providers.find(p => p.email === email)) return res.status(400).json({ success: false, pesan: 'Email sudah terdaftar' });
  const newProvider = { id: providers.length + 1, name, email, password, phone, role, type, rating: 5.0, reviews: 0, photo: 'https://via.placeholder.com/200?text=' + name };
  providers.push(newProvider);
  res.status(201).json({ success: true, data: newProvider });
});

// ===== SERVICES =====
app.get('/api/services', (req, res) => {
  res.json({ success: true, data: services });
});

app.get('/api/providers/:type', (req, res) => {
  const providersByType = providers.filter(p => p.type === req.params.type);
  res.json({ success: true, data: providersByType });
});

// ===== ORDERS =====
app.post('/api/orders', (req, res) => {
  const { userId, providerId, serviceName, totalPrice, description } = req.body;
  const newOrder = { id: orderIdCounter++, userId, providerId, serviceName, totalPrice, description, status: 'pending', createdAt: new Date().toISOString().split('T')[0] };
  orders.push(newOrder);
  res.status(201).json({ success: true, data: newOrder });
});

app.get('/api/orders/user/:userId', (req, res) => {
  const userOrders = orders.filter(o => o.userId == req.params.userId);
  res.json({ success: true, data: userOrders });
});

app.get('/api/order/:orderId', (req, res) => {
  const order = orders.find(o => o.id == req.params.orderId);
  if (!order) return res.status(404).json({ success: false, pesan: 'Order tidak ditemukan' });
  res.json({ success: true, data: order });
});

app.put('/api/order/:orderId', (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id == req.params.orderId);
  if (!order) return res.status(404).json({ success: false, pesan: 'Order tidak ditemukan' });
  order.status = status;
  res.json({ success: true, data: order });
});

// ===== GOJEK FEATURES =====
app.get('/api/promos', (req, res) => {
  res.json({ success: true, data: promos });
});

app.post('/api/gopay/topup', (req, res) => {
  const { userId, amount } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ success: false, pesan: 'User tidak ditemukan' });
  user.gopay += amount;
  transactions.push({ id: transactions.length + 1, userId, type: 'topup', amount, date: new Date().toISOString().split('T')[0] });
  res.json({ success: true, data: user });
});

app.get('/api/user/:userId', (req, res) => {
  const user = users.find(u => u.id == req.params.userId);
  if (!user) return res.status(404).json({ success: false, pesan: 'User tidak ditemukan' });
  res.json({ success: true, data: user });
});

// ===== ADMIN =====
app.get('/api/admin/stats', (req, res) => {
  res.json({ success: true, data: { totalUsers: users.length, totalOrders: orders.length, totalProviders: providers.length } });
});

app.get('/api/admin/orders', (req, res) => {
  res.json({ success: true, data: orders });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ SahabatGo Server jalan di http://localhost:${PORT}`);
});