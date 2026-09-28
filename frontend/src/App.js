import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [page, setPage] = useState('login'); // login, user-dashboard, provider-dashboard, category, providers, order
  const [userType, setUserType] = useState('user'); // user atau provider
  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', category: '', price: '' });

  const BACKEND_URL = 'https://tpop-group-order-production.up.railway.app';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/categories`);
      const data = await response.json();
      setCategories(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProvidersByCategory = async (category) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/providers/${category}`);
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
    const endpoint = userType === 'user' ? '/api/auth/user-login' : '/api/auth/provider-login';
    
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.data);
        setForm({ name: '', email: '', password: '', phone: '', category: '', price: '' });
        
        if (userType === 'user') {
          fetchUserOrders(data.data.id);
          setPage('user-dashboard');
        } else {
          setPage('provider-dashboard');
        }
      } else {
        alert(data.pesan);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Login gagal');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const endpoint = userType === 'user' ? '/api/auth/user-register' : '/api/auth/provider-register';
    
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Pendaftaran berhasil! Silakan login.');
        setForm({ name: '', email: '', password: '', phone: '', category: '', price: '' });
      } else {
        alert(data.pesan);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Register gagal');
    }
  };

  const handleOrder = async (providerId) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          providerId,
          categoryName: selectedCategory,
          totalPrice: selectedProvider.price,
          description: 'Order dari ' + currentUser.name
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Order berhasil dibuat!');
        fetchUserOrders(currentUser.id);
        setPage('user-dashboard');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Order gagal');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage('login');
    setForm({ name: '', email: '', password: '', phone: '', category: '', price: '' });
    setSelectedCategory(null);
  };

  // ===== LOGIN PAGE =====
  if (page === 'login') {
    return (
      <div className="app">
        <div className="login-container">
          <h1>🚀 SahabatGo</h1>
          <p>Platform Layanan Masyarakat</p>
          
          <div className="role-selector">
            <button 
              className={`role-btn ${userType === 'user' ? 'active' : ''}`}
              onClick={() => setUserType('user')}
            >
              Pemesan
            </button>
            <button 
              className={`role-btn ${userType === 'provider' ? 'active' : ''}`}
              onClick={() => setUserType('provider')}
            >
              Provider
            </button>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <h2>{userType === 'user' ? 'Login Pemesan' : 'Login Provider'}</h2>
            
            <input 
              type="email" 
              placeholder="Email" 
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              required
            />
            
            <input 
              type="password" 
              placeholder="Password" 
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              required
            />
            
            <button type="submit">Login</button>
          </form>

          <p className="switch-form">
            Belum punya akun? 
            <button onClick={() => setPage('register')} className="link-btn">Daftar di sini</button>
          </p>
        </div>
      </div>
    );
  }

  // ===== REGISTER PAGE =====
  if (page === 'register') {
    return (
      <div className="app">
        <div className="login-container">
          <h1>🚀 SahabatGo</h1>
          <p>Daftar Akun Baru</p>
          
          <div className="role-selector">
            <button 
              className={`role-btn ${userType === 'user' ? 'active' : ''}`}
              onClick={() => setUserType('user')}
            >
              Pemesan
            </button>
            <button 
              className={`role-btn ${userType === 'provider' ? 'active' : ''}`}
              onClick={() => setUserType('provider')}
            >
              Provider
            </button>
          </div>

          <form onSubmit={handleRegister} className="login-form">
            <h2>{userType === 'user' ? 'Daftar Pemesan' : 'Daftar Provider'}</h2>
            
            <input 
              type="text" 
              placeholder="Nama" 
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              required
            />
            
            <input 
              type="email" 
              placeholder="Email" 
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              required
            />
            
            <input 
              type="password" 
              placeholder="Password" 
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              required
            />
            
            <input 
              type="text" 
              placeholder="No. Telepon" 
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
              required
            />
            
            {userType === 'provider' && (
              <>
                <select 
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  required
                >
                  <option value="">Pilih Kategori Jasa</option>
                  <option value="Transportasi">Transportasi</option>
                  <option value="Makanan">Makanan</option>
                  <option value="Kurir">Kurir</option>
                  <option value="Belanja">Belanja</option>
                  <option value="Bantuan">Bantuan</option>
                </select>
                
                <input 
                  type="number" 
                  placeholder="Harga Jasa" 
                  value={form.price}
                  onChange={(e) => setForm({...form, price: e.target.value})}
                  required
                />
              </>
            )}
            
            <button type="submit">Daftar</button>
          </form>

          <p className="switch-form">
            Sudah punya akun? 
            <button onClick={() => setPage('login')} className="link-btn">Login di sini</button>
          </p>
        </div>
      </div>
    );
  }

  // ===== USER DASHBOARD =====
  if (page === 'user-dashboard' && currentUser) {
    return (
      <div className="app">
        <header className="header">
          <h1>🚀 SahabatGo</h1>
          <div className="user-info">
            <span>{currentUser.name}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </header>

        <div className="container">
          <section className="section">
            <h2>📋 Pilih Layanan</h2>
            <div className="categories-grid">
              {categories.map(cat => (
                <div 
                  key={cat.id} 
                  className="category-card"
                  onClick={() => {
                    setSelectedCategory(cat.nama);
                    fetchProvidersByCategory(cat.nama);
                    setPage('providers');
                  }}
                >
                  <div className="category-emoji">{cat.emoji}</div>
                  <h3>{cat.nama}</h3>
                  <p>{cat.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <h2>📦 Pesanan Saya</h2>
            {orders.length === 0 ? (
              <p>Belum ada pesanan</p>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <p><strong>ID Order:</strong> {order.id}</p>
                    <p><strong>Kategori:</strong> {order.categoryName}</p>
                    <p><strong>Harga:</strong> Rp {order.totalPrice.toLocaleString()}</p>
                    <p><strong>Status:</strong> <span className={`status-${order.status}`}>{order.status}</span></p>
                    <p><strong>Tanggal:</strong> {order.createdAt}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // ===== PROVIDERS PAGE =====
  if (page === 'providers' && currentUser) {
    return (
      <div className="app">
        <header className="header">
          <h1>🚀 SahabatGo</h1>
          <button onClick={() => setPage('user-dashboard')} className="back-btn">← Kembali</button>
        </header>

        <div className="container">
          <section className="section">
            <h2>🔍 Provider - {selectedCategory}</h2>
            {providers.length === 0 ? (
              <p>Provider tidak tersedia</p>
            ) : (
              <div className="providers-grid">
                {providers.map(provider => (
                  <div key={provider.id} className="provider-card">
                    <img src={provider.photo} alt={provider.name} />
                    <h3>{provider.name}</h3>
                    <p><strong>Harga:</strong> Rp {provider.price.toLocaleString()}</p>
                    <p><strong>Rating:</strong> ⭐ {provider.rating} ({provider.reviews} ulasan)</p>
                    <p><strong>Kontak:</strong> {provider.phone}</p>
                    <button 
                      onClick={() => {
                        setSelectedProvider(provider);
                        handleOrder(provider.id);
                      }}
                      className="order-btn"
                    >
                      Pesan Sekarang
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

  // ===== PROVIDER DASHBOARD =====
  if (page === 'provider-dashboard' && currentUser) {
    return (
      <div className="app">
        <header className="header">
          <h1>🚀 SahabatGo - Provider</h1>
          <div className="user-info">
            <span>{currentUser.name}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </header>

        <div className="container">
          <section className="section">
            <h2>📊 Profil Saya</h2>
            <div className="profile-card">
              <p><strong>Nama:</strong> {currentUser.name}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Kategori:</strong> {currentUser.category}</p>
              <p><strong>Harga Jasa:</strong> Rp {currentUser.price.toLocaleString()}</p>
              <p><strong>Rating:</strong> ⭐ {currentUser.rating}</p>
              <p><strong>Jumlah Review:</strong> {currentUser.reviews}</p>
            </div>
          </section>

          <section className="section">
            <h2>📬 Order Masuk</h2>
            <p className="info">*Fitur order masuk sedang dikembangkan</p>
          </section>
        </div>
      </div>
    );
  }

  return null;
}

export default App;