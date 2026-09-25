const express = require('express');
const cors = require('cors');
const app = express();

// ===== CORS MIDDLEWARE =====
app.use(cors({
  origin: ['http://localhost:3000', 'https://frontend-kwu-team.vercel.app'],
  credentials: true
}));

app.use(express.json());

// ===== DATA DUMMY =====
const merch = [
  { id: 1, nama: 'Photocard BTS', harga: 25000, stok: 10, image: 'https://via.placeholder.com/200?text=BTS+Photocard' },
  { id: 2, nama: 'T-Shirt SEVENTEEN', harga: 150000, stok: 5, image: 'https://via.placeholder.com/200?text=SEVENTEEN+Tshirt' },
  { id: 3, nama: 'Lightstick Stray Kids', harga: 200000, stok: 8, image: 'https://via.placeholder.com/200?text=Stray+Kids+Lightstick' },
  { id: 4, nama: 'Album NewJeans', harga: 120000, stok: 15, image: 'https://via.placeholder.com/200?text=NewJeans+Album' },
];

let groupOrders = [
  { 
    id: 1, 
    nama: 'Group Order BTS Merch', 
    status: 'open',
    tanggalBuka: '2024-01-10',
    tanggalTutup: '2024-01-20',
    merchandise: [1, 2, 3]
  }
];

let orders = [];
let orderIdCounter = 1;

// ===== API ROUTES =====

// 1. Halaman utama
app.get('/', (req, res) => {
  res.json({ pesan: 'Selamat datang di T-pop Group Order!' });
});

// ===== MERCHANDISE ROUTES =====
app.get('/api/merchandise', (req, res) => {
  res.json({ success: true, data: merch });
});

app.get('/api/merchandise/:id', (req, res) => {
  const item = merch.find(m => m.id == req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, pesan: 'Merchandise tidak ditemukan' });
  }
  res.json({ success: true, data: item });
});

// ===== GROUP ORDER ROUTES =====

// 2. Lihat semua group order
app.get('/api/group-order', (req, res) => {
  res.json({ success: true, data: groupOrders });
});

// 3. Lihat 1 group order by ID
app.get('/api/group-order/:id', (req, res) => {
  const go = groupOrders.find(g => g.id == req.params.id);
  if (!go) {
    return res.status(404).json({ success: false, pesan: 'Group order tidak ditemukan' });
  }
  
  // Ambil detail merchandise di group order ini
  const merchDetail = go.merchandise.map(merchId => 
    merch.find(m => m.id === merchId)
  );
  
  res.json({ 
    success: true, 
    data: {
      ...go,
      merchandise: merchDetail
    }
  });
});

// 4. BUAT group order baru (POST)
app.post('/api/group-order', (req, res) => {
  const { nama, tanggalTutup, merchandise } = req.body;
  
  if (!nama || !tanggalTutup) {
    return res.status(400).json({ 
      success: false, 
      pesan: 'Nama dan tanggal tutup harus diisi!' 
    });
  }
  
  const newGroupOrder = {
    id: groupOrders.length + 1,
    nama,
    status: 'open',
    tanggalBuka: new Date().toISOString().split('T')[0],
    tanggalTutup,
    merchandise: merchandise || []
  };
  
  groupOrders.push(newGroupOrder);
  
  res.status(201).json({ 
    success: true, 
    pesan: 'Group order berhasil dibuat!',
    data: newGroupOrder 
  });
});

// ===== ORDER ROUTES =====

// 5. Lihat semua order
app.get('/api/orders', (req, res) => {
  res.json({ success: true, data: orders });
});

// 6. BUAT order baru (user order merchandise)
app.post('/api/orders', (req, res) => {
  const { userId, groupOrderId, merchandise } = req.body;
  
  if (!userId || !groupOrderId || !merchandise) {
    return res.status(400).json({ 
      success: false, 
      pesan: 'userId, groupOrderId, dan merchandise harus diisi!' 
    });
  }
  
  // Hitung total harga
  let totalHarga = 0;
  merchandise.forEach(item => {
    const merch_item = merch.find(m => m.id === item.merchId);
    if (merch_item) {
      totalHarga += merch_item.harga * item.jumlah;
    }
  });
  
  const newOrder = {
    id: orderIdCounter++,
    userId,
    groupOrderId,
    merchandise,
    totalHarga,
    status: 'pending',
    tanggalOrder: new Date().toISOString().split('T')[0]
  };
  
  orders.push(newOrder);
  
  res.status(201).json({ 
    success: true, 
    pesan: 'Order berhasil dibuat!',
    data: newOrder 
  });
});

// 7. Lihat order by ID
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id == req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, pesan: 'Order tidak ditemukan' });
  }
  res.json({ success: true, data: order });
});

// ===== START SERVER =====
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server jalan di http://localhost:${PORT}`);
});