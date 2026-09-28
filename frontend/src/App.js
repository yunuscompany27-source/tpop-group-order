import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [page, setPage] = useState('login');
  const [role, setRole] = useState('user'); // user, driver, merchant, admin
  const [currentUser, setCurrentUser] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [providers, setProviders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', type: '' });

  const BACKEND_URL = 'https://tpop-group-order-production.up.railway.app';

  useEffect(() => {
    fetchServices();
    fetchPromos();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/services`);
      const data = await response.json();
      setServices(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPromos = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/promos`);
      const data = await response.json();
      setPromos(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProviders = async (type) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/providers/${type}`);
      const data = await response.json();
      setProviders(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUserOrders = async (userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/orders/user/${userId}`);
      const data = await response.json();
      setOrders(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, role })
      });
      
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.data);
        setForm({ name: '', email: '', password: '', phone: '', type: '' });
        
        if (role === 'user') {
          fetchUserOrders(data.data.id);
          setPage('home');
        } else if (role === 'admin') {
          setPage('admin-dashboard');
        } else if (role === 'driver') {
          setPage('driver-dashboard');
        } else {
          setPage('merchant-dashboard');
        }
      } else {
        alert(data.pesan);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Login gagal');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage('login');
    setForm({ name: '', email: '', password: '', phone: '', type: '' });
  };

  // ===== LOGIN PAGE =====
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

          <p className="switch-form">Belum punya akun? <button onClick={() => setPage('register')} className="link-btn">Daftar di sini</button></p>
        </div>
      </div>
    );
  }

  // ===== REGISTER PAGE =====
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
              const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, role })
              });
              const data = await response.json();
              if (data.success) {
                alert('Pendaftaran berhasil! Silakan login.');
                setPage('login');
                setForm({ name: '', email: '', password: '', phone: '', type: '' });
              } else {
                alert(data.pesan);
              }
            } catch (error) {
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

          <p className="switch-form">Sudah punya akun? <button onClick={() => setPage('login')} className="link-btn">Login di sini</button></p>
        </div>
      </div>
    );
  }

  // ===== HOME PAGE (USER) =====
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

          {/* SERVICES GRID */}
          <section className="services-grid">
            {services.map(service => (
              <div key={service.id} className="service-card" onClick={() => {
                setSelectedService(service.name);
                fetchProviders(service.name);
                setPage('select-provider');
              }}>
                <div className="service-emoji">{service.emoji}</div>
                <h3>{service.name}</h3>
                <p>{service.desc}</p>
              </div>
            ))}
          </section>

          {/* PROMOS */}
          <section className="promos-section">
            <h3>🎁 Promo Spesial</h3>
            <div className="promos-list">
              {promos.map(promo => (
                <div key={promo.id} className="promo-card">
                  <h4>{promo.name}</h4>
                  <p>{promo.desc}</p>
                  <p className="promo-code">Kode: {promo.code}</p>
                </div>
              ))}
            </div>
          </section>

          {/* RECENT ORDERS */}
          <section className="orders-section">
            <h3>📦 Pesanan Terakhir</h3>
            {orders.length === 0 ? (
              <p>Belum ada pesanan</p>
            ) : (
              <div className="orders-list">
                {orders.slice(-3).map(order => (
                  <div key={order.id} className="order-item">
                    <p><strong>{order.serviceName}</strong> - Rp {order.totalPrice.toLocaleString()}</p>
                    <p className={`status-${order.status}`}>{order.status}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // ===== SELECT PROVIDER PAGE =====
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
            {providers.map(provider => (
              <div key={provider.id} className="provider-card">
                <img src={provider.photo} alt={provider.name} />
                <h3>{provider.name}</h3>
                <p>⭐ {provider.rating} ({provider.reviews} review)</p>
                <p className="price">Rp {provider.rating * 10000}</p>
                <button onClick={async () => {
                  const response = await fetch(`${BACKEND_URL}/api/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId: currentUser.id,
                      providerId: provider.id,
                      serviceName: selectedService,
                      totalPrice: Math.round(provider.rating * 10000),
                      description: `Order ${selectedService}`
                    })
                  });
                  const data = await response.json();
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

  // ===== GOPAY PAGE =====
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
              <p className="balance">Rp {currentUser.gopay?.toLocaleString() || 0}</p>
              <button onClick={async () => {
                const amount = prompt('Masukkan nominal topup (Rp):');
                if (amount) {
                  const response = await fetch(`${BACKEND_URL}/api/gopay/topup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUser.id, amount: parseInt(amount) })
                  });
                  const data = await response.json();
                  if (data.success) {
                    setCurrentUser(data.data);
                    alert('Topup berhasil!');
                  }
                }
              }} className="topup-btn">+ Topup Saldo</button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ===== TRACKING PAGE =====
  if (page === 'tracking' && currentUser) {
    return (
      <div className="app-user">
        <header className="navbar">
          <h1>🏍️ SahabatGo</h1>
          <button onClick={() => setPage('home')} className="back-btn">← Home</button>
        </header>

        <div className="container">
          <h2>📍 Tracking Pesanan</h2>
          {orders.length === 0 ? (
            <p>Tidak ada pesanan untuk dilacak</p>
          ) : (
            <div className="tracking-list">
              {orders.map(order => (
                <div key={order.id} className="tracking-item">
                  <h3>Order #{order.id}</h3>
                  <p><strong>Layanan:</strong> {order.serviceName}</p>
                  <p><strong>Harga:</strong> Rp {order.totalPrice.toLocaleString()}</p>
                  <p><strong>Status:</strong> <span className={`status-${order.status}`}>{order.status}</span></p>
                  <div className="tracking-status">
                    <div className={`step ${['pending', 'accepted', 'in_progress', 'completed'].includes(order.status) ? 'active' : ''}`}>Menunggu</div>
                    <div className={`step ${['accepted', 'in_progress', 'completed'].includes(order.status) ? 'active' : ''}`}>Diterima</div>
                    <div className={`step ${['in_progress', 'completed'].includes(order.status) ? 'active' : ''}`}>Proses</div>
                    <div className={`step ${order.status === 'completed' ? 'active' : ''}`}>Selesai</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== PROFILE PAGE =====
  if (page === 'profile' && currentUser) {
    return (
      <div className="app-user">
        <header className="navbar">
          <h1>🏍️ SahabatGo</h1>
          <button onClick={() => setPage('home')} className="back-btn">← Home</button>
        </header>

        <div className="container">
          <section className="profile-section">
            <h2>👤 Profile Saya</h2>
            <div className="profile-card">
              <p><strong>Nama:</strong> {currentUser.name}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>No. Telepon:</strong> {currentUser.phone}</p>
              <p><strong>Saldo GoPay:</strong> Rp {currentUser.gopay?.toLocaleString() || 0}</p>
              <p><strong>Total Pesanan:</strong> {orders.length}</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ===== DRIVER DASHBOARD =====
  if (page === 'driver-dashboard' && currentUser) {
    return (
      <div className="app-user">
        <header className="navbar">
          <h1>🛵 Dashboard Driver</h1>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </header>

        <div className="container">
          <section className="dashboard-section">
            <h2>Selamat datang, {currentUser.name}!</h2>
            <div className="dashboard-card">
              <p><strong>Tipe Layanan:</strong> {currentUser.type}</p>
              <p><strong>Rating:</strong> ⭐ {currentUser.rating}</p>
              <p><strong>Total Review:</strong> {currentUser.reviews}</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ===== MERCHANT DASHBOARD =====
  if (page === 'merchant-dashboard' && currentUser) {
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
              <p><strong>Total Ulasan:</strong> {currentUser.reviews}</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ===== ADMIN DASHBOARD =====
  if (page === 'admin-dashboard' && currentUser) {
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
                <h3>Total User</h3>
                <p className="stat-number">{orders.length > 0 ? Math.floor(Math.random() * 1000) : 0}</p>
              </div>
              <div className="stat-card">
                <h3>Total Orders</h3>
                <p className="stat-number">{orders.length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Providers</h3>
                <p className="stat-number">{providers.length}</p>
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