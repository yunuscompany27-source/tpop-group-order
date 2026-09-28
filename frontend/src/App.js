import React, { useState, useEffect } from 'react';
import './App.css';

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
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', type: '' });
  const [selectedService, setSelectedService] = useState(null);

  const BACKEND_URL = 'https://tpop-group-order-production.up.railway.app';

  useEffect(() => {
    fetchServices();
    fetchPromos();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/services`);
      const data = await res.json();
      setServices(data.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchPromos = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/promos`);
      const data = await res.json();
      setPromos(data.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchProviders = async (type) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/providers/${type}`);
      const data = await res.json();
      setProviders(data.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchUserOrders = async (userId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/user/${userId}`);
      const data = await res.json();
      setOrders(data.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchAvailableOrders = async (serviceName) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/available/${serviceName}`);
      const data = await res.json();
      setAvailableOrders(data.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchDriverOrders = async (driverId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/driver/${driverId}`);
      const data = await res.json();
      setDriverOrders(data.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, role })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.data);
        setForm({ name: '', email: '', password: '', phone: '', type: '' });
        if (role === 'user') {
          fetchUserOrders(data.data.id);
          setPage('home');
        } else if (role === 'admin') {
          setPage('admin-dashboard');
        } else if (role === 'driver') {
          fetchAvailableOrders(data.data.type);
          fetchDriverOrders(data.data.id);
          setPage('driver-dashboard');
        } else {
          setPage('merchant-dashboard');
        }
      } else {
        alert(data.pesan);
      }
    } catch (err) {
      alert('Login gagal');
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/order/${orderId}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: currentUser.id })
      });
      const data = await res.json();
      if (data.success) {
        alert('Order diterima!');
        fetchAvailableOrders(currentUser.type);
        fetchDriverOrders(currentUser.id);
        setPage('driver-active-orders');
      }
    } catch (err) {
      alert('Gagal terima order');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/order/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Status diubah ke ${status}!`);
        fetchDriverOrders(currentUser.id);
      }
    } catch (err) {
      alert('Gagal update status');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage('login');
    setForm({ name: '', email: '', password: '', phone: '', type: '' });
  };

  // LOGIN
  if (page === 'login') {
    return (
      <div className="app">
        <div className="login-container">
          <h1>🏍️ SahabatGo</h1>
          <p>Layanan Transportasi & Logistik Terpadu</p>
          <div className="role-selector">
            <button className={`role-btn ${role === 'user' ? 'active' : ''}`} onClick={() => setRole('user')}>👤 User</button>
            <button className={`role-btn ${role === 'driver' ? 'active' : ''}`} onClick={() => setRole('driver')}>🛵 Driver</button>
            <button className={`role-btn ${role === 'merchant' ? 'active' : ''}`} onClick={() => setRole('merchant')}>🏪 Merchant</button>
            <button className={`role-btn ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>⚙️ Admin</button>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <h2>Login</h2>
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required />
            <button type="submit">Login</button>
          </form>
          <p className="switch-form">Belum punya akun? <button onClick={() => setPage('register')} className="link-btn">Daftar</button></p>
        </div>
      </div>
    );
  }

  // REGISTER
  if (page === 'register') {
    return (
      <div className="app">
        <div className="login-container">
          <h1>🏍️ SahabatGo</h1>
          <p>Daftar Akun Baru</p>
          <div className="role-selector">
            <button className={`role-btn ${role === 'user' ? 'active' : ''}`} onClick={() => setRole('user')}>👤 User</button>
            <button className={`role-btn ${role === 'driver' ? 'active' : ''}`} onClick={() => setRole('driver')}>🛵 Driver</button>
            <button className={`role-btn ${role === 'merchant' ? 'active' : ''}`} onClick={() => setRole('merchant')}>🏪 Merchant</button>
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, role })
              });
              const data = await res.json();
              if (data.success) {
                alert('Pendaftaran berhasil!');
                setPage('login');
                setForm({ name: '', email: '', password: '', phone: '', type: '' });
              } else {
                alert(data.pesan);
              }
            } catch (err) {
              alert('Register gagal');
            }
          }} className="login-form">
            <h2>Daftar</h2>
            <input type="text" placeholder="Nama" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required />
            <input type="text" placeholder="No. Telepon" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required />
            {role !== 'user' && (
              <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} required>
                <option value="">Pilih Tipe</option>
                <option value="GoRide">GoRide - Driver</option>
                <option value="GoFood">GoFood - Merchant</option>
                <option value="GoSend">GoSend - Kurir</option>
                <option value="GoMart">GoMart - Toko</option>
                <option value="GoService">GoService - Jasa</option>
              </select>
            )}
            <button type="submit">Daftar</button>
          </form>
          <p className="switch-form">Sudah punya akun? <button onClick={() => setPage('login')} className="link-btn">Login</button></p>
        </div>
      </div>
    );
  }

  // USER HOME
  if (page === 'home' && currentUser && role === 'user') {
    return (
      <div className="app-user">
        <header className="navbar">
          <h1>🏍️ SahabatGo</h1>
          <div className="navbar-menu">
            <button onClick={() => setPage('home')} className={`nav-btn ${page === 'home' ? 'active' : ''}`}>🏠 Home</button>
            <button onClick={() => setPage('gopay')} className={`nav-btn ${page === 'gopay' ? 'active' : ''}`}>💳 GoPay</button>
            <button onClick={() => setPage('tracking')} className={`nav-btn ${page === 'tracking' ? 'active' : ''}`}>📍 Tracking</button>
            <button onClick={() => setPage('profile')} className={`nav-btn ${page === 'profile' ? 'active' : ''}`}>👤 Profile</button>
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

  // SELECT PROVIDER
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
                  const res = await fetch(`${BACKEND_URL}/api/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId: currentUser.id,
                      providerId: p.id,
                      serviceName: selectedService,
                      totalPrice: Math.round(p.rating * 10000),
                      description: `Order ${selectedService}`
                    })
                  });
                  const data = await res.json();
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

  // GOPAY
  if (page === 'gopay' && currentUser) {
    return (
      <div className="app-user">
        <header className="navbar">
          <h1>🏍️ SahabatGo</h1>
          <button onClick={() => setPage('home')} className="back-btn">← Home</button>
        </header>
        <div className="container">
          <section className="gopay-section">
            <h2>💳 GoPay</h2>
            <div className="gopay-card">
              <h3>Saldo Anda</h3>
              <p className="balance">Rp {(currentUser.gopay || 0).toLocaleString()}</p>
              <button onClick={async () => {
                const amount = prompt('Masukkan nominal (Rp):');
                if (amount) {
                  const res = await fetch(`${BACKEND_URL}/api/gopay/topup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUser.id, amount: parseInt(amount) })
                  });
                  const data = await res.json();
                  if (data.success) {
                    setCurrentUser(data.data);
                    alert('Topup berhasil!');
                  }
                }
              }} className="topup-btn">+ Topup</button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // TRACKING
  if (page === 'tracking' && currentUser) {
    return (
      <div className="app-user">
        <header className="navbar">
          <h1>🏍️ SahabatGo</h1>
          <button onClick={() => setPage('home')} className="back-btn">← Home</button>
        </header>
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

  // PROFILE USER
  if (page === 'profile' && currentUser && role === 'user') {
    return (
      <div className="app-user">
        <header className="navbar">
          <h1>🏍️ SahabatGo</h1>
          <button onClick={() => setPage('home')} className="back-btn">← Home</button>
        </header>
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

  // DRIVER DASHBOARD - AVAILABLE ORDERS
  if (page === 'driver-dashboard' && currentUser && role === 'driver') {
    return (
      <div className="app-user">
        <header className="navbar">
          <h1>🛵 SahabatGo Driver</h1>
          <div className="navbar-menu">
            <button onClick={() => setPage('driver-dashboard')} className="nav-btn active">📋 Tersedia</button>
            <button onClick={() => setPage('driver-active-orders')} className="nav-btn">🚗 Aktif</button>
            <button onClick={() => setPage('driver-profile')} className="nav-btn">👤 Profile</button>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </header>
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

  // DRIVER DASHBOARD - ACTIVE ORDERS
  if (page === 'driver-active-orders' && currentUser && role === 'driver') {
    const activeOrders = driverOrders.filter(o => o.status !== 'completed');
    const completedOrders = driverOrders.filter(o => o.status === 'completed');
    
    return (
      <div className="app-user">
        <header className="navbar">
          <h1>🛵 SahabatGo Driver</h1>
          <div className="navbar-menu">
            <button onClick={() => setPage('driver-dashboard')} className="nav-btn">📋 Tersedia</button>
            <button onClick={() => setPage('driver-active-orders')} className="nav-btn active">🚗 Aktif</button>
            <button onClick={() => setPage('driver-profile')} className="nav-btn">👤 Profile</button>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </header>
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

          <section className="driver-section" style={{marginTop: '40px'}}>
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

  // DRIVER PROFILE
  if (page === 'driver-profile' && currentUser && role === 'driver') {
    return (
      <div className="app-user">
        <header className="navbar">
          <h1>🛵 SahabatGo Driver</h1>
          <button onClick={() => setPage('driver-dashboard')} className="back-btn">← Kembali</button>
        </header>
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
              <p><strong>Pesanan Aktif:</strong> {driverOrders.filter(o => o.status !== 'completed').length}</p>
              <p><strong>Pesanan Selesai:</strong> {driverOrders.filter(o => o.status === 'completed').length}</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // MERCHANT DASHBOARD
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

  // ADMIN DASHBOARD
  if (page === 'admin-dashboard' && currentUser && role === 'admin') {
    return (
      <div className="app-user">
        <header className="navbar">
          <h1>⚙️ Admin Dashboard</h1>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </header>
        <div className="container">
          <section className="stats-section">
            <h2>📊 Statistik</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Orders</h3>
                <p className="stat-number">{orders.length}</p>
              </div>
              <div className="stat-card">
                <h3>Aktif</h3>
                <p className="stat-number">{orders.filter(o => o.status !== 'completed').length}</p>
              </div>
              <div className="stat-card">
                <h3>Selesai</h3>
                <p className="stat-number">{orders.filter(o => o.status === 'completed').length}</p>
              </div>
            </div>
            <div style={{marginTop: '40px'}}>
              <h3>📋 Semua Pesanan</h3>
              <div className="admin-orders-list">
                {orders.map(o => (
                  <div key={o.id} className="admin-order-item">
                    <p><strong>#{o.id}</strong> - {o.serviceName} - Rp {o.totalPrice.toLocaleString()}</p>
                    <p className={`status-${o.status}`}>{o.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return null;
}

export default App;