import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = 'https://tpop-group-order-production.up.railway.app';
const EMPTY_FORM = { name: '', email: '', password: '', phone: '', type: '' };
const ORDER_STATUSES = ['searching', 'accepted', 'on_the_way', 'arrived', 'completed', 'cancelled'];

// helper fetch JSON
const api = async (path, method = 'GET', body) => {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.json();
};

function App() {
  const [page, setPage] = useState('login');
  const [role, setRole] = useState('user');
  const [currentUser, setCurrentUser] = useState(null);
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [driverOrders, setDriverOrders] = useState([]);
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedService, setSelectedService] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminProviders, setAdminProviders] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminStats, setAdminStats] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [editingProvider, setEditingProvider] = useState(null);

  useEffect(() => {
    fetchServices();
    fetchPromos();
  }, []);

  // ===== FETCHERS =====
  const load = async (path, setter, fallback = []) => {
    try {
      const data = await api(path);
      setter(data.data || fallback);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  const fetchServices = () => load('/api/services', setServices);
  const fetchPromos = () => load('/api/promos', setPromos);
  const fetchProviders = (type) => load(`/api/providers/${type}`, setProviders);
  const fetchUserOrders = (id) => load(`/api/orders/user/${id}`, setOrders);
  const fetchAvailableOrders = (name) => load(`/api/orders/available/${name}`, setAvailableOrders);
  const fetchDriverOrders = (id) => load(`/api/orders/driver/${id}`, setDriverOrders);
  const fetchAdminUsers = () => load('/api/admin/users', setAdminUsers);
  const fetchAdminProviders = () => load('/api/admin/providers', setAdminProviders);
  const fetchAdminOrders = () => load('/api/admin/all-orders', setAdminOrders);
  const fetchAdminStats = () => load('/api/admin/stats', setAdminStats, {});

  // ===== AUTH =====
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await api('/api/auth/login', 'POST', { email: form.email, password: form.password, role });
      if (!data.success) return alert(data.pesan);
      setCurrentUser(data.data);
      setForm(EMPTY_FORM);
      if (role === 'user') {
        fetchUserOrders(data.data.id);
        setPage('home');
      } else if (role === 'admin') {
        fetchAdminStats();
        fetchAdminUsers();
        fetchAdminProviders();
        fetchAdminOrders();
        setPage('admin-dashboard');
      } else if (role === 'driver') {
        fetchAvailableOrders(data.data.type);
        fetchDriverOrders(data.data.id);
        setPage('driver-dashboard');
      } else {
        setPage('merchant-dashboard');
      }
    } catch (err) {
      alert('Login gagal');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const data = await api('/api/auth/register', 'POST', { ...form, role });
      if (data.success) {
        alert('Pendaftaran berhasil!');
        setPage('login');
        setForm(EMPTY_FORM);
      } else {
        alert(data.pesan);
      }
    } catch (err) {
      alert('Register gagal');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage('login');
    setForm(EMPTY_FORM);
    setEditingUser(null);
    setEditingProvider(null);
  };

  // ===== DRIVER =====
  const handleAcceptOrder = async (orderId) => {
    try {
      const data = await api(`/api/order/${orderId}/accept`, 'PUT', { driverId: currentUser.id });
      if (data.success) {
        alert('Order diterima!');
        fetchAvailableOrders(currentUser.type);
        fetchDriverOrders(currentUser.id);
        setPage('driver-active-orders');
      } else {
        alert(data.pesan);
        fetchAvailableOrders(currentUser.type);
      }
    } catch (err) {
      alert('Gagal terima order');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const data = await api(`/api/order/${orderId}/status`, 'PUT', { status });
      if (data.success) {
        alert('Status diubah!');
        fetchDriverOrders(currentUser.id);
      }
    } catch (err) {
      alert('Gagal update status');
    }
  };

  // ===== ADMIN: USERS =====
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Hapus user ini?')) return;
    try {
      const data = await api(`/api/admin/user/${userId}`, 'DELETE');
      if (data.success) {
        alert('User dihapus!');
        fetchAdminUsers();
        fetchAdminStats();
      }
    } catch (err) {
      alert('Gagal hapus user');
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      const data = await api(`/api/admin/user/${userId}/suspend`, 'PUT');
      if (data.success) {
        alert(`User sekarang: ${data.data.status}`);
        fetchAdminUsers();
      }
    } catch (err) {
      alert('Gagal suspend user');
    }
  };

  const handleSaveUser = async () => {
    try {
      const data = await api(`/api/admin/user/${editingUser.id}`, 'PUT', {
        name: editingUser.name, email: editingUser.email, phone: editingUser.phone
      });
      if (!data.success) return alert(data.pesan);
      if (editingUser.newPassword) {
        const r = await api(`/api/admin/user/${editingUser.id}/reset-password`, 'PUT', { newPassword: editingUser.newPassword });
        if (!r.success) return alert(r.pesan);
      }
      alert('User berhasil diupdate!');
      setEditingUser(null);
      fetchAdminUsers();
    } catch (err) {
      alert('Gagal update user');
    }
  };

  // ===== ADMIN: PROVIDERS =====
  const handleDeleteProvider = async (providerId) => {
    if (!window.confirm('Hapus provider ini?')) return;
    try {
      const data = await api(`/api/admin/provider/${providerId}`, 'DELETE');
      if (data.success) {
        alert('Provider dihapus!');
        fetchAdminProviders();
        fetchAdminStats();
      }
    } catch (err) {
      alert('Gagal hapus provider');
    }
  };

  const handleSuspendProvider = async (providerId) => {
    try {
      const data = await api(`/api/admin/provider/${providerId}/suspend`, 'PUT');
      if (data.success) {
        alert(`Provider sekarang: ${data.data.status}`);
        fetchAdminProviders();
      }
    } catch (err) {
      alert('Gagal suspend provider');
    }
  };

  const handleSaveProvider = async () => {
    try {
      const data = await api(`/api/admin/provider/${editingProvider.id}`, 'PUT', {
        name: editingProvider.name, email: editingProvider.email, phone: editingProvider.phone
      });
      if (!data.success) return alert(data.pesan);
      if (editingProvider.newPassword) {
        const r = await api(`/api/admin/provider/${editingProvider.id}/reset-password`, 'PUT', { newPassword: editingProvider.newPassword });
        if (!r.success) return alert(r.pesan);
      }
      alert('Provider berhasil diupdate!');
      setEditingProvider(null);
      fetchAdminProviders();
    } catch (err) {
      alert('Gagal update provider');
    }
  };

  // ===== ADMIN: ORDERS =====
  const handleAdminChangeStatus = async (orderId, status) => {
    try {
      const data = await api(`/api/order/${orderId}/status`, 'PUT', { status });
      if (!data.success) return alert(data.pesan);
      fetchAdminOrders();
      fetchAdminStats();
    } catch (err) {
      alert('Gagal ubah status');
    }
  };

  // ===== SHARED UI =====
  const adminNav = (active) => (
    <header className="navbar">
      <h1>⚙️ Admin Dashboard</h1>
      <div className="navbar-menu">
        <button onClick={() => { fetchAdminStats(); setPage('admin-dashboard'); }} className={`nav-btn ${active === 'stats' ? 'active' : ''}`}>📊 Stats</button>
        <button onClick={() => { fetchAdminUsers(); setPage('admin-users'); }} className={`nav-btn ${active === 'users' ? 'active' : ''}`}>👥 Users</button>
        <button onClick={() => { fetchAdminProviders(); setPage('admin-providers'); }} className={`nav-btn ${active === 'providers' ? 'active' : ''}`}>🚗 Providers</button>
        <button onClick={() => { fetchAdminOrders(); setPage('admin-orders'); }} className={`nav-btn ${active === 'orders' ? 'active' : ''}`}>📦 Orders</button>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </header>
  );

  const driverNav = (active) => (
    <header className="navbar">
      <h1>🛵 SahabatGo Driver</h1>
      <div className="navbar-menu">
        <button onClick={() => setPage('driver-dashboard')} className={`nav-btn ${active === 'available' ? 'active' : ''}`}>📋 Tersedia</button>
        <button onClick={() => setPage('driver-active-orders')} className={`nav-btn ${active === 'active' ? 'active' : ''}`}>🚗 Aktif</button>
        <button onClick={() => setPage('driver-profile')} className={`nav-btn ${active === 'profile' ? 'active' : ''}`}>👤 Profile</button>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </header>
  );

  const userBackHeader = (
    <header className="navbar">
      <h1>🏍️ SahabatGo</h1>
      <button onClick={() => setPage('home')} className="back-btn">← Home</button>
    </header>
  );

  const roleSelector = (withAdmin) => (
    <div className="role-selector">
      <button className={`role-btn ${role === 'user' ? 'active' : ''}`} onClick={() => setRole('user')}>👤 User</button>
      <button className={`role-btn ${role === 'driver' ? 'active' : ''}`} onClick={() => setRole('driver')}>🛵 Driver</button>
      <button className={`role-btn ${role === 'merchant' ? 'active' : ''}`} onClick={() => setRole('merchant')}>🏪 Merchant</button>
      {withAdmin && <button className={`role-btn ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>⚙️ Admin</button>}
    </div>
  );

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // ===== LOGIN =====
  if (page === 'login') {
    return (
      <div className="app">
        <div className="login-container">
          <h1>🏍️ SahabatGo</h1>
          <p>Layanan Transportasi & Logistik Terpadu</p>
          {roleSelector(true)}
          <form onSubmit={handleLogin} className="login-form">
            <h2>Login</h2>
            <input type="email" placeholder="Email" value={form.email} onChange={setField('email')} required />
            <input type="password" placeholder="Password" value={form.password} onChange={setField('password')} required />
            <button type="submit">Login</button>
          </form>
          <p className="switch-form">Belum punya akun? <button onClick={() => { setRole(role === 'admin' ? 'user' : role); setPage('register'); }} className="link-btn">Daftar</button></p>
        </div>
      </div>
    );
  }

  // ===== REGISTER =====
  if (page === 'register') {
    return (
      <div className="app">
        <div className="login-container">
          <h1>🏍️ SahabatGo</h1>
          <p>Daftar Akun Baru</p>
          {roleSelector(false)}
          <form onSubmit={handleRegister} className="login-form">
            <h2>Daftar</h2>
            <input type="text" placeholder="Nama" value={form.name} onChange={setField('name')} required />
            <input type="email" placeholder="Email" value={form.email} onChange={setField('email')} required />
            <input type="password" placeholder="Password" value={form.password} onChange={setField('password')} required />
            <input type="text" placeholder="No. Telepon" value={form.phone} onChange={setField('phone')} required />
            {role !== 'user' && (
              <select value={form.type} onChange={setField('type')} required>
                <option value="">Pilih Tipe</option>
                <option value="GoRide">GoRide</option>
                <option value="GoFood">GoFood</option>
                <option value="GoSend">GoSend</option>
              </select>
            )}
            <button type="submit">Daftar</button>
          </form>
          <p className="switch-form">Sudah punya akun? <button onClick={() => setPage('login')} className="link-btn">Login</button></p>
        </div>
      </div>
    );
  }

  // ===== USER HOME =====
  if (page === 'home' && currentUser && role === 'user') {
    return (
      <div className="app-user">
        <header className="navbar">
          <h1>🏍️ SahabatGo</h1>
          <div className="navbar-menu">
            <button onClick={() => setPage('home')} className="nav-btn active">🏠 Home</button>
            <button onClick={() => setPage('gopay')} className="nav-btn">💳 GoPay</button>
            <button onClick={() => { fetchUserOrders(currentUser.id); setPage('tracking'); }} className="nav-btn">📍 Tracking</button>
            <button onClick={() => setPage('profile')} className="nav-btn">👤 Profile</button>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </header>
        <div className="container">
          <section className="hero">
            <h2>Selamat datang, {currentUser.name}! 👋</h2>
            <p>Pilih layanan yang Anda butuhkan</p>
          </section>
          <section className="services-grid">
            {services.map(s => (
              <div key={s.id} className="service-card" onClick={() => {
                setSelectedService(s.name);
                fetchProviders(s.name);
                setPage('select-provider');
              }}>
                <div className="service-emoji">{s.emoji}</div>
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </section>
          <section className="promos-section">
            <h3>🎁 Promo Spesial</h3>
            <div className="promos-list">
              {promos.map(p => (
                <div key={p.id} className="promo-card">
                  <h4>{p.name}</h4>
                  <p>{p.desc}</p>
                  <p className="promo-code">Kode: {p.code}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="orders-section">
            <h3>📦 Pesanan Terakhir</h3>
            {orders.length === 0 ? (
              <p>Belum ada pesanan</p>
            ) : (
              <div className="orders-list">
                {orders.slice(-3).map(o => (
                  <div key={o.id} className="order-item">
                    <p><strong>{o.serviceName}</strong> - Rp {o.totalPrice.toLocaleString()}</p>
                    <p className={`status-${o.status}`}>{o.status}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // ===== SELECT PROVIDER =====
  if (page === 'select-provider' && currentUser && role === 'user') {
    return (
      <div className="app-user">
        <header className="navbar">
          <h1>🏍️ SahabatGo</h1>
          <button onClick={() => setPage('home')} className="back-btn">← Kembali</button>
        </header>
        <div className="container">
          <h2>Pilih {selectedService}</h2>
          <div className="providers-grid">
            {providers.map(p => (
              <div key={p.id} className="provider-card">
                <img src={p.photo} alt={p.name} />
                <h3>{p.name}</h3>
                <p>⭐ {p.rating} ({p.reviews} review)</p>
                <p className="price">Rp {Math.round(p.rating * 10000).toLocaleString()}</p>
                <button onClick={async () => {
                  const data = await api('/api/orders', 'POST', {
                    userId: currentUser.id,
                    providerId: p.id,
                    serviceName: selectedService,
                    totalPrice: Math.round(p.rating * 10000),
                    description: `Order ${selectedService}`
                  });
                  if (data.success) {
                    alert('Order berhasil!');
                    fetchUserOrders(currentUser.id);
                    setPage('home');
                  }
                }} className="order-btn">Pesan Sekarang</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===== GOPAY =====
  if (page === 'gopay' && currentUser && role === 'user') {
    return (
      <div className="app-user">
        {userBackHeader}
        <div className="container">
          <section className="gopay-section">
            <h2>💳 GoPay</h2>
            <div className="gopay-card">
              <h3>Saldo Anda</h3>
              <p className="balance">Rp {(currentUser.gopay || 0).toLocaleString()}</p>
              <button onClick={async () => {
                const amount = parseInt(prompt('Masukkan nominal (Rp):'), 10);
                if (!amount || amount <= 0) return;
                const data = await api('/api/gopay/topup', 'POST', { userId: currentUser.id, amount });
                if (data.success) {
                  setCurrentUser(data.data);
                  alert('Topup berhasil!');
                } else {
                  alert(data.pesan);
                }
              }} className="topup-btn">+ Topup</button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ===== TRACKING =====
  if (page === 'tracking' && currentUser && role === 'user') {
    return (
      <div className="app-user">
        {userBackHeader}
        <div className="container">
          <h2>📍 Tracking</h2>
          {orders.length === 0 ? (
            <p>Tidak ada pesanan</p>
          ) : (
            <div className="tracking-list">
              {orders.map(o => (
                <div key={o.id} className="tracking-item">
                  <h3>Order #{o.id}</h3>
                  <p><strong>Layanan:</strong> {o.serviceName}</p>
                  <p><strong>Harga:</strong> Rp {o.totalPrice.toLocaleString()}</p>
                  <p><strong>Status:</strong> <span className={`status-${o.status}`}>{o.status}</span></p>
                  <div className="tracking-status">
                    <div className={`step ${['searching', 'accepted', 'on_the_way', 'arrived', 'completed'].includes(o.status) ? 'active' : ''}`}>Mencari</div>
                    <div className={`step ${['accepted', 'on_the_way', 'arrived', 'completed'].includes(o.status) ? 'active' : ''}`}>Diterima</div>
                    <div className={`step ${['on_the_way', 'arrived', 'completed'].includes(o.status) ? 'active' : ''}`}>Perjalanan</div>
                    <div className={`step ${o.status === 'completed' ? 'active' : ''}`}>Selesai</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== PROFILE USER =====
  if (page === 'profile' && currentUser && role === 'user') {
    return (
      <div className="app-user">
        {userBackHeader}
        <div className="container">
          <section className="profile-section">
            <h2>👤 Profile</h2>
            <div className="profile-card">
              <p><strong>Nama:</strong> {currentUser.name}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>No. Telepon:</strong> {currentUser.phone}</p>
              <p><strong>Saldo GoPay:</strong> Rp {(currentUser.gopay || 0).toLocaleString()}</p>
              <p><strong>Total Pesanan:</strong> {orders.length}</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ===== DRIVER DASHBOARD =====
  if (page === 'driver-dashboard' && currentUser && role === 'driver') {
    return (
      <div className="app-user">
        {driverNav('available')}
        <div className="container">
          <section className="driver-section">
            <h2>📋 Pesanan Tersedia ({availableOrders.length})</h2>
            {availableOrders.length === 0 ? (
              <p className="no-orders">Tidak ada pesanan tersedia</p>
            ) : (
              <div className="available-orders-list">
                {availableOrders.map(o => (
                  <div key={o.id} className="available-order-card">
                    <div className="order-header">
                      <h3>Order #{o.id}</h3>
                      <p className="service-type">{o.serviceName}</p>
                    </div>
                    <div className="order-details">
                      <p><strong>Deskripsi:</strong> {o.description}</p>
                      <p><strong>Harga:</strong> <span className="price">Rp {o.totalPrice.toLocaleString()}</span></p>
                      <p><strong>Tanggal:</strong> {o.createdAt}</p>
                    </div>
                    <button onClick={() => handleAcceptOrder(o.id)} className="accept-btn">✓ Terima Pesanan</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // ===== DRIVER ACTIVE ORDERS =====
  if (page === 'driver-active-orders' && currentUser && role === 'driver') {
    const activeOrders = driverOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
    const completedOrders = driverOrders.filter(o => o.status === 'completed');

    return (
      <div className="app-user">
        {driverNav('active')}
        <div className="container">
          <section className="driver-section">
            <h2>🚗 Pesanan Aktif ({activeOrders.length})</h2>
            {activeOrders.length === 0 ? (
              <p className="no-orders">Tidak ada pesanan aktif</p>
            ) : (
              <div className="active-orders-list">
                {activeOrders.map(o => (
                  <div key={o.id} className="active-order-card">
                    <div className="order-header">
                      <h3>Order #{o.id}</h3>
                      <p className={`status-badge status-${o.status}`}>{o.status.toUpperCase()}</p>
                    </div>
                    <div className="order-details">
                      <p><strong>Layanan:</strong> {o.serviceName}</p>
                      <p><strong>Harga:</strong> <span className="price">Rp {o.totalPrice.toLocaleString()}</span></p>
                      <p><strong>Diterima:</strong> {o.acceptedAt}</p>
                    </div>
                    <div className="status-buttons">
                      {o.status === 'accepted' && (
                        <button onClick={() => handleUpdateStatus(o.id, 'on_the_way')} className="status-btn status-btn-yellow">🚗 Sedang Perjalanan</button>
                      )}
                      {o.status === 'on_the_way' && (
                        <button onClick={() => handleUpdateStatus(o.id, 'arrived')} className="status-btn status-btn-blue">📍 Tiba di Tujuan</button>
                      )}
                      {o.status === 'arrived' && (
                        <button onClick={() => handleUpdateStatus(o.id, 'completed')} className="status-btn status-btn-green">✓ Selesai</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="driver-section" style={{ marginTop: '40px' }}>
            <h2>✓ Selesai ({completedOrders.length})</h2>
            {completedOrders.length === 0 ? (
              <p className="no-orders">Belum ada yang selesai</p>
            ) : (
              <div className="completed-orders-list">
                {completedOrders.map(o => (
                  <div key={o.id} className="completed-order-card">
                    <p><strong>{o.serviceName}</strong> - Rp {o.totalPrice.toLocaleString()}</p>
                    <p className="completed-date">Selesai: {o.completedAt}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // ===== DRIVER PROFILE =====
  if (page === 'driver-profile' && currentUser && role === 'driver') {
    return (
      <div className="app-user">
        {driverNav('profile')}
        <div className="container">
          <section className="driver-profile-section">
            <h2>👤 Profile Driver</h2>
            <div className="driver-profile-card">
              <p><strong>Nama:</strong> {currentUser.name}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>No. Telepon:</strong> {currentUser.phone}</p>
              <p><strong>Tipe Layanan:</strong> {currentUser.type}</p>
              <p><strong>Rating:</strong> ⭐ {currentUser.rating} ({currentUser.reviews} review)</p>
              <p><strong>Status:</strong> <span className={`status-badge ${currentUser.status === 'online' ? 'online' : 'offline'}`}>{currentUser.status.toUpperCase()}</span></p>
              <p className="earnings"><strong>Total Earning:</strong> Rp {(currentUser.earnings || 0).toLocaleString()}</p>
              <p><strong>Pesanan Aktif:</strong> {driverOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}</p>
              <p><strong>Pesanan Selesai:</strong> {driverOrders.filter(o => o.status === 'completed').length}</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ===== MERCHANT DASHBOARD =====
  if (page === 'merchant-dashboard' && currentUser && role === 'merchant') {
    return (
      <div className="app-user">
        <header className="navbar">
          <h1>🏪 Dashboard Merchant</h1>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </header>
        <div className="container">
          <section className="dashboard-section">
            <h2>Selamat datang, {currentUser.name}!</h2>
            <div className="dashboard-card">
              <p><strong>Toko:</strong> {currentUser.name}</p>
              <p><strong>Rating:</strong> ⭐ {currentUser.rating}</p>
              <p><strong>Total Review:</strong> {currentUser.reviews}</p>
              <p><strong>Total Earning:</strong> Rp {(currentUser.earnings || 0).toLocaleString()}</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ===== ADMIN DASHBOARD =====
  if (page === 'admin-dashboard' && currentUser && role === 'admin') {
    const stats = [
      ['Total Users', adminStats.totalUsers],
      ['Total Providers', adminStats.totalProviders],
      ['Total Orders', adminStats.totalOrders],
      ['Aktif', adminStats.activeOrders],
      ['Selesai', adminStats.completedOrders]
    ];
    return (
      <div className="app-user">
        {adminNav('stats')}
        <div className="container">
          <section className="stats-section">
            <h2>📊 Statistik</h2>
            <div className="stats-grid">
              {stats.map(([label, value]) => (
                <div key={label} className="stat-card">
                  <h3>{label}</h3>
                  <p className="stat-number">{value || 0}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ===== ADMIN USERS =====
  if (page === 'admin-users' && currentUser && role === 'admin') {
    return (
      <div className="app-user">
        {adminNav('users')}
        <div className="container">
          <section className="admin-section">
            <h2>👥 Manage Users ({adminUsers.length})</h2>
            {editingUser ? (
              <div className="edit-form">
                <h3>Edit User #{editingUser.id}</h3>
                <input type="text" placeholder="Nama" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} />
                <input type="email" placeholder="Email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} />
                <input type="text" placeholder="No. Telepon" value={editingUser.phone} onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })} />
                <input type="password" placeholder="Password baru (kosongkan jika tidak diganti)" value={editingUser.newPassword || ''} onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })} />
                <div className="button-group">
                  <button onClick={handleSaveUser} className="save-btn">💾 Simpan</button>
                  <button onClick={() => setEditingUser(null)} className="cancel-btn">❌ Batal</button>
                </div>
              </div>
            ) : (
              <div className="admin-list">
                {adminUsers.length === 0 && <p className="no-orders">Belum ada user</p>}
                {adminUsers.map(u => (
                  <div key={u.id} className="admin-item">
                    <div className="item-info">
                      <h4>#{u.id} - {u.name}</h4>
                      <p>{u.email} | {u.phone}</p>
                      <p><strong>Status:</strong> <span className={`status-badge ${u.status}`}>{u.status}</span></p>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => setEditingUser({ ...u })} className="edit-btn">✏️ Edit</button>
                      <button onClick={() => handleSuspendUser(u.id)} className="suspend-btn">🚫 {u.status === 'suspended' ? 'Aktifkan' : 'Suspend'}</button>
                      <button onClick={() => handleDeleteUser(u.id)} className="delete-btn">🗑️ Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // ===== ADMIN PROVIDERS =====
  if (page === 'admin-providers' && currentUser && role === 'admin') {
    return (
      <div className="app-user">
        {adminNav('providers')}
        <div className="container">
          <section className="admin-section">
            <h2>🚗 Manage Providers ({adminProviders.length})</h2>
            {editingProvider ? (
              <div className="edit-form">
                <h3>Edit Provider #{editingProvider.id}</h3>
                <input type="text" placeholder="Nama" value={editingProvider.name} onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })} />
                <input type="email" placeholder="Email" value={editingProvider.email} onChange={(e) => setEditingProvider({ ...editingProvider, email: e.target.value })} />
                <input type="text" placeholder="No. Telepon" value={editingProvider.phone} onChange={(e) => setEditingProvider({ ...editingProvider, phone: e.target.value })} />
                <input type="password" placeholder="Password baru (kosongkan jika tidak diganti)" value={editingProvider.newPassword || ''} onChange={(e) => setEditingProvider({ ...editingProvider, newPassword: e.target.value })} />
                <div className="button-group">
                  <button onClick={handleSaveProvider} className="save-btn">💾 Simpan</button>
                  <button onClick={() => setEditingProvider(null)} className="cancel-btn">❌ Batal</button>
                </div>
              </div>
            ) : (
              <div className="admin-list">
                {adminProviders.length === 0 && <p className="no-orders">Belum ada provider</p>}
                {adminProviders.map(p => (
                  <div key={p.id} className="admin-item">
                    <div className="item-info">
                      <h4>#{p.id} - {p.name}</h4>
                      <p>{p.email} | {p.phone} | {p.type} ({p.role})</p>
                      <p><strong>Rating:</strong> ⭐ {p.rating} | <strong>Status:</strong> <span className={`status-badge ${p.status}`}>{p.status}</span></p>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => setEditingProvider({ ...p })} className="edit-btn">✏️ Edit</button>
                      <button onClick={() => handleSuspendProvider(p.id)} className="suspend-btn">🚫 {p.status === 'suspended' ? 'Aktifkan' : 'Suspend'}</button>
                      <button onClick={() => handleDeleteProvider(p.id)} className="delete-btn">🗑️ Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // ===== ADMIN ORDERS =====
  if (page === 'admin-orders' && currentUser && role === 'admin') {
    return (
      <div className="app-user">
        {adminNav('orders')}
        <div className="container">
          <section className="admin-section">
            <h2>📦 Semua Orders ({adminOrders.length})</h2>
            <div className="admin-orders-list">
              {adminOrders.length === 0 && <p className="no-orders">Belum ada order</p>}
              {adminOrders.map(o => (
                <div key={o.id} className="admin-order-item">
                  <div className="item-info">
                    <p><strong>Order #{o.id}</strong> - {o.serviceName}</p>
                    <p>Rp {o.totalPrice.toLocaleString()} | User ID: {o.userId} | Driver ID: {o.driverId || '-'}</p>
                    <p>Dibuat: {o.createdAt}</p>
                  </div>
                  <select className="status-select" value={o.status} onChange={(e) => handleAdminChangeStatus(o.id, e.target.value)}>
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return null;
}

export default App;