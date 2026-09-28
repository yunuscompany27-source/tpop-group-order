import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [page, setPage] = useState('login');
  const [role, setRole] = useState('user');
  const [currentUser, setCurrentUser] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [providers, setProviders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [driverOrders, setDriverOrders] = useState([]);
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

  const fetchAvailableOrders = async (serviceName) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/orders/available/${serviceName}`);
      const data = await response.json();
      setAvailableOrders(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDriverOrders = async (driverId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/orders/driver/${driverId}`);
      const data = await response.json();
      setDriverOrders(data.data);
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
          fetchAvailableOrders(data.data.type);
          fetchDriverOrders(data.data.id);
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

  const handleAcceptOrder = async (orderId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/order/${orderId}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: currentUser.id })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Order diterima!');
        fetchAvailableOrders(currentUser.type);
        fetchDriverOrders(currentUser.id);
        setPage('driver-active-orders');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menerima order');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/order/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Status diubah menjadi ${status}!`);
        fetchDriverOrders(currentUser.id);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal update status');
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
                <p className="price">Rp {Math.round(provider.rating * 10000).toLocaleString()}</p>
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
                    alert('Order berhasil! Menunggu driver...');
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
                    <div className={`step ${['searching', 'accepted', 'on_the_way', 'arrived', 'completed'].includes(order.status) ? 'active' : ''}`}>Mencari</div>
                    <div className={`step ${['accepted', 'on_the_way', 'arrived', 'completed'].includes(order.status) ? 'active' : ''}`}>Diterima</div>
                    <div className={`step ${['on_the_way', 'arrived', 'completed'].includes(order.status) ? 'active' : ''}`}>Perjalanan</div>
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
          <h1>🛵 SahabatGo Driver</h1>
          <div className="navbar-menu">
            <button onClick={() => setPage('driver-dashboard')} className="nav-btn active">📋 Pesanan Tersedia</button>
            <button onClick={() => setPage('driver-active-orders')} className="nav-btn">🚗 Pesanan Aktif</button>
            <button onClick={() => setPage('driver-profile')} className="nav-btn">👤 Profile</button>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </header>

        <div className="container">
          <section className="driver-section">
            <h2>📋 Pesanan Tersedia ({availableOrders.length})</h2>
            
            {availableOrders.length === 0 ? (
              <p className="no-orders">Tidak ada pesanan yang tersedia saat ini</p>
            ) : (
              <div className="available-orders-list">
                {availableOrders.map(order => (
                  <div key={order.id} className="available-order-card">
                    <div className="order-header">
                      <h3>Order #{order.id}</h3>
                      <p className="service-type">{order.serviceName}</p>
                    </div>
                    
                    <div className="order-details">
                      <p><strong>Deskripsi:</strong> {order.description}</p>
                      <p><strong>Harga:</strong> <span className="price">Rp {order.totalPrice.toLocaleString()}</span></p>
                      <p><strong>Tanggal:</strong> {order.createdAt}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleAcceptOrder(order.id)}
                      className="accept-btn"
                    >
                      ✓ Terima Pesanan
                    </button>
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
  if (page === 'driver-active-orders' && currentUser) {
    return (
      <div className="app-user">
        <header className="navbar">
          <h1>🛵 SahabatGo Driver</h1>
          <div className="navbar-menu">
            <button onClick={() => setPage('driver-dashboard')} className="nav-btn">📋 Pesanan Tersedia</button>
            <button onClick={() => setPage('driver-active-orders')} className="nav-btn active">🚗 Pesanan Aktif</button>
            <button onClick={() => setPage('driver-profile')} className="nav-btn">👤 Profile</button>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </header>

        <div className="container">
          <section className="driver-section">
            <h2>🚗 Pesanan Aktif ({driverOrders.filter(o => o.status !== 'completed').length})</h2>
            
            {driverOrders.filter(o => o.status !== 'completed').length === 0 ? (
              <p className="no-orders">Tidak ada pesanan aktif</p>
            ) : (
              <div className="active-orders-list">
                {driverOrders.filter(o => o.status !== 'completed').map(order => (
                  <div key={order.id} className="active-order-card">
                    <div className="order-header">
                      <h3>Order #{order.id}</h3>
                      <p className={`status-badge status-${order.status}`}>{order.status.toUpperCase()}</p>
                    </div>
                    
                    <div className="order-details">
                      <p><strong>Layanan:</strong> {order.serviceName}</p>
                      <p><strong>Harga:</strong> <span className="price">Rp {order.totalPrice.toLocaleString()}</span></p>
                      <p><strong>Diterima pada:</strong> {order.acceptedAt}</p>
                    </div>
                    
                    <div className="status-buttons">
                      {order.status === 'accepted' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'on_the_way')} className="status-btn status-btn-yellow">
                          🚗 Sedang Perjalanan
                        </button>
                      )}
                      {order.status === 'on_the_way' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'arrived')} className="status-btn status-btn-blue">
                          📍 Tiba di Tujuan
                        </button>
                      )}
                      {order.status === 'arrived' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'completed')} className="status-btn status-btn-green">
                          ✓ Selesai
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <section className="driver-section" style={{marginTop: '40px'}}>
              <h2>✓ Pesanan Selesai ({driverOrders.filter(o => o.status === 'completed').length})</h2>
              {driverOrders.filter(o => o.status === 'completed').length === 0 ? (
                <p className="no-orders">Belum ada pesanan yang selesai</p>
              ) : (
                <div className="completed-orders-list">
                  {driverOrders.filter(o => o.status === 'completed').map(order => (
                    <div key={order.id} className="completed-order-card">
                      <p><strong>{order.serviceName}</strong> - Rp {order.totalPrice.toLocaleString()}</p>
                      <p className="completed-date">Selesai: {order.completedAt}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>
        </div>
      </div>
    );
  }

  // ===== DRIVER PROFILE =====
  if (page === 'driver-profile' && currentUser) {
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
              <p className="earnings"><strong>Total Earning:</strong> Rp {currentUser.earnings?.toLocaleString() || 0}</p>
              <p><strong>Pesanan Aktif:</strong> {driverOrders.filter(o => o.status !== 'completed').length}</p>
              <p><strong>Pesanan Selesai:</strong> {driverOrders.filter(o => o.status === 'completed').length}</p>
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
              <p><strong>Total Earning:</strong> Rp {currentUser.earnings?.toLocaleString() || 0}</p>
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
                <h3>Total Orders</h3>
                <p className="stat-number">{orders.length}</p>
              </div>
              <div className="stat-card">
                <h3>Pesanan Aktif</h3>
                <p className="stat-number">{orders.filter(o => o.status !== 'completed').length}</p>
              </div>
              <div className="stat-card">
                <h3>Pesanan Selesai</h3>
                <p className="stat-number">{orders.filter(o => o.status === 'completed').length}</p>
              </div>
            </div>

            <div style={{marginTop: '40px'}}>
              <h3>📋 Semua Pesanan</h3>
              <div className="admin-orders-list">
                {orders.map(order => (
                  <div key={order.id} className="admin-order-item">
                    <p><strong>#{order.id}</strong> - {order.serviceName} - Rp {order.totalPrice.toLocaleString()}</p>
                    <p className={`status-${order.status}`}>{order.status}</p>
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