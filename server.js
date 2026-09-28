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
  { id: 1, name: 'User1', email: 'user1@gmail.com', password: '123456', role: 'user', phone: '081234567890', gopay: 500000, status: 'active' }
];
let userIdCounter = 2;

let providers = [
  { id: 1, name: 'Budi (Driver)', email: 'budi@gmail.com', password: '123456', role: 'driver', type: 'GoRide', phone: '081234567891', rating: 4.5, reviews: 12, photo: 'https://via.placeholder.com/200?text=Driver+Budi', earnings: 1500000, status: 'online' },
  { id: 2, name: 'Siti (Makanan)', email: 'siti@gmail.com', password: '123456', role: 'merchant', type: 'GoFood', phone: '081234567892', rating: 4.8, reviews: 25, photo: 'https://via.placeholder.com/200?text=Chef+Siti', earnings: 2000000, status: 'active' }
];
let providerIdCounter = 3;

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

let ratings = [];
let admins = [
  { id: 1, name: 'Admin', email: 'admin@sahabatgo.com', password: 'admin123', role: 'admin' }
];

// ===== AUTH =====
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;

  if (role === 'user') {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ success: false, pesan: 'Email atau password salah' });
    if (user.status === 'suspended') return res.status(403).json({ success: false, pesan: 'Akun Anda disuspend' });
    return res.json({ success: true, data: user });
  }

  if (role === 'admin') {
    const admin = admins.find(a => a.email === email && a.password === password);
    if (!admin) return res.status(401).json({ success: false, pesan: 'Email atau password salah' });
    return res.json({ success: true, data: admin });
  }

  const provider = providers.find(p => p.email === email && p.password === password && p.role === role);
  if (!provider) return res.status(401).json({ success: false, pesan: 'Email atau password salah' });
  if (provider.status === 'suspended') return res.status(403).json({ success: false, pesan: 'Akun Anda disuspend' });
  res.json({ success: true, data: provider });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, role, type } = req.body;
  const emailTaken = users.find(u => u.email === email) || providers.find(p => p.email === email);
  if (emailTaken) return res.status(400).json({ success: false, pesan: 'Email sudah terdaftar' });

  if (role === 'user') {
    const newUser = { id: userIdCounter++, name, email, password, phone, role, gopay: 0, status: 'active' };
    users.push(newUser);
    return res.status(201).json({ success: true, data: newUser });
  }

  const newProvider = { id: providerIdCounter++, name, email, password, phone, role, type, rating: 5.0, reviews: 0, photo: 'https://via.placeholder.com/200?text=' + encodeURIComponent(name), earnings: 0, status: 'active' };
  providers.push(newProvider);
  res.status(201).json({ success: true, data: newProvider });
});

// ===== SERVICES =====
app.get('/api/services', (req, res) => {
  res.json({ success: true, data: services });
});

app.get('/api/providers/:type', (req, res) => {
  const list = providers.filter(p => p.type === req.params.type && p.status !== 'suspended');
  res.json({ success: true, data: list });
});

app.get('/api/provider/:id', (req, res) => {
  const provider = providers.find(p => p.id == req.params.id);
  if (!provider) return res.status(404).json({ success: false, pesan: 'Provider tidak ditemukan' });
  res.json({ success: true, data: provider });
});

// ===== ORDERS =====
app.post('/api/orders', (req, res) => {
  const { userId, serviceName, totalPrice, description } = req.body;
  const newOrder = {
    id: orderIdCounter++,
    userId,
    providerId: null,
    driverId: null,
    serviceName,
    totalPrice,
    description,
    status: 'searching',
    createdAt: new Date().toISOString().split('T')[0],
    acceptedAt: null,
    completedAt: null
  };
  orders.push(newOrder);
  res.status(201).json({ success: true, data: newOrder });
});

app.get('/api/orders/user/:userId', (req, res) => {
  res.json({ success: true, data: orders.filter(o => o.userId == req.params.userId) });
});

app.get('/api/orders/available/:serviceName', (req, res) => {
  res.json({ success: true, data: orders.filter(o => o.status === 'searching' && o.serviceName === req.params.serviceName) });
});

app.get('/api/orders/driver/:driverId', (req, res) => {
  res.json({ success: true, data: orders.filter(o => o.driverId == req.params.driverId) });
});

app.get('/api/order/:orderId', (req, res) => {
  const order = orders.find(o => o.id == req.params.orderId);
  if (!order) return res.status(404).json({ success: false, pesan: 'Order tidak ditemukan' });
  res.json({ success: true, data: order });
});

app.put('/api/order/:orderId/accept', (req, res) => {
  const { driverId } = req.body;
  const order = orders.find(o => o.id == req.params.orderId);
  if (!order) return res.status(404).json({ success: false, pesan: 'Order tidak ditemukan' });
  if (order.status !== 'searching') return res.status(400).json({ success: false, pesan: 'Order sudah diambil' });

  order.status = 'accepted';
  order.driverId = driverId;
  order.acceptedAt = new Date().toISOString().split('T')[0];

  const driver = providers.find(p => p.id === driverId);
  if (driver) driver.earnings += order.totalPrice;

  res.json({ success: true, data: order });
});

app.put('/api/order/:orderId/status', (req, res) => {
  const { status } = req.body;
  const valid = ['searching', 'accepted', 'on_the_way', 'arrived', 'completed', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ success: false, pesan: 'Status tidak valid' });

  const order = orders.find(o => o.id == req.params.orderId);
  if (!order) return res.status(404).json({ success: false, pesan: 'Order tidak ditemukan' });

  order.status = status;
  if (status === 'completed') order.completedAt = new Date().toISOString().split('T')[0];

  res.json({ success: true, data: order });
});

// ===== RATING =====
app.post('/api/ratings', (req, res) => {
  const { userId, providerId, rating, review } = req.body;
  const newRating = { id: ratings.length + 1, userId, providerId, rating, review, createdAt: new Date().toISOString().split('T')[0] };
  ratings.push(newRating);

  const provider = providers.find(p => p.id === providerId);
  if (provider) {
    const list = ratings.filter(r => r.providerId === providerId);
    provider.rating = parseFloat((list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1));
    provider.reviews = list.length;
  }
  res.status(201).json({ success: true, data: newRating });
});

app.get('/api/ratings/:providerId', (req, res) => {
  res.json({ success: true, data: ratings.filter(r => r.providerId == req.params.providerId) });
});

// ===== GOJEK FEATURES =====
app.get('/api/promos', (req, res) => {
  res.json({ success: true, data: promos });
});

app.post('/api/gopay/topup', (req, res) => {
  const { userId, amount } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ success: false, pesan: 'User tidak ditemukan' });
  if (!amount || amount <= 0) return res.status(400).json({ success: false, pesan: 'Nominal tidak valid' });
  user.gopay += amount;
  res.json({ success: true, data: user });
});

app.get('/api/user/:userId', (req, res) => {
  const user = users.find(u => u.id == req.params.userId);
  if (!user) return res.status(404).json({ success: false, pesan: 'User tidak ditemukan' });
  res.json({ success: true, data: user });
});

// ===== ADMIN ENDPOINTS =====
app.get('/api/admin/users', (req, res) => res.json({ success: true, data: users }));
app.get('/api/admin/providers', (req, res) => res.json({ success: true, data: providers }));
app.get('/api/admin/all-orders', (req, res) => res.json({ success: true, data: orders }));

app.delete('/api/admin/user/:userId', (req, res) => {
  const index = users.findIndex(u => u.id == req.params.userId);
  if (index === -1) return res.status(404).json({ success: false, pesan: 'User tidak ditemukan' });
  res.json({ success: true, data: users.splice(index, 1)[0] });
});

app.delete('/api/admin/provider/:providerId', (req, res) => {
  const index = providers.findIndex(p => p.id == req.params.providerId);
  if (index === -1) return res.status(404).json({ success: false, pesan: 'Provider tidak ditemukan' });
  res.json({ success: true, data: providers.splice(index, 1)[0] });
});

app.put('/api/admin/user/:userId', (req, res) => {
  const { name, email, phone, status } = req.body;
  const user = users.find(u => u.id == req.params.userId);
  if (!user) return res.status(404).json({ success: false, pesan: 'User tidak ditemukan' });
  if (email && email !== user.email && (users.find(u => u.email === email) || providers.find(p => p.email === email))) {
    return res.status(400).json({ success: false, pesan: 'Email sudah dipakai' });
  }
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (status) user.status = status;
  res.json({ success: true, data: user });
});

app.put('/api/admin/provider/:providerId', (req, res) => {
  const { name, email, phone, status } = req.body;
  const provider = providers.find(p => p.id == req.params.providerId);
  if (!provider) return res.status(404).json({ success: false, pesan: 'Provider tidak ditemukan' });
  if (email && email !== provider.email && (users.find(u => u.email === email) || providers.find(p => p.email === email))) {
    return res.status(400).json({ success: false, pesan: 'Email sudah dipakai' });
  }
  if (name) provider.name = name;
  if (email) provider.email = email;
  if (phone) provider.phone = phone;
  if (status) provider.status = status;
  res.json({ success: true, data: provider });
});

app.put('/api/admin/user/:userId/reset-password', (req, res) => {
  const { newPassword } = req.body;
  const user = users.find(u => u.id == req.params.userId);
  if (!user) return res.status(404).json({ success: false, pesan: 'User tidak ditemukan' });
  if (!newPassword) return res.status(400).json({ success: false, pesan: 'Password baru wajib diisi' });
  user.password = newPassword;
  res.json({ success: true, pesan: 'Password berhasil direset' });
});

app.put('/api/admin/provider/:providerId/reset-password', (req, res) => {
  const { newPassword } = req.body;
  const provider = providers.find(p => p.id == req.params.providerId);
  if (!provider) return res.status(404).json({ success: false, pesan: 'Provider tidak ditemukan' });
  if (!newPassword) return res.status(400).json({ success: false, pesan: 'Password baru wajib diisi' });
  provider.password = newPassword;
  res.json({ success: true, pesan: 'Password berhasil direset' });
});

app.put('/api/admin/user/:userId/suspend', (req, res) => {
  const user = users.find(u => u.id == req.params.userId);
  if (!user) return res.status(404).json({ success: false, pesan: 'User tidak ditemukan' });
  user.status = user.status === 'suspended' ? 'active' : 'suspended';
  res.json({ success: true, data: user });
});

app.put('/api/admin/provider/:providerId/suspend', (req, res) => {
  const provider = providers.find(p => p.id == req.params.providerId);
  if (!provider) return res.status(404).json({ success: false, pesan: 'Provider tidak ditemukan' });
  provider.status = provider.status === 'suspended' ? 'active' : 'suspended';
  res.json({ success: true, data: provider });
});

app.get('/api/admin/stats', (req, res) => {
  res.json({ success: true, data: {
    totalUsers: users.length,
    totalOrders: orders.length,
    totalProviders: providers.length,
    activeOrders: orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length,
    completedOrders: orders.filter(o => o.status === 'completed').length
  } });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ SahabatGo Server jalan di port ${PORT}`);
});