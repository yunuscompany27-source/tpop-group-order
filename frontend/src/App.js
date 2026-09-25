import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [merchandise, setMerchandise] = useState([]);
  const [groupOrders, setGroupOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = 'https://tpop-group-order-production.up.railway.app';

  useEffect(() => {
    fetchMerchandise();
    fetchGroupOrders();
  }, []);

  const fetchMerchandise = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/merchandise`);
      const data = await response.json();
      setMerchandise(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const fetchGroupOrders = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/group-order`);
      const data = await response.json();
      setGroupOrders(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🎵 T-pop Group Order</h1>
        <p>Pesan merchandise T-pop favorit bersama-sama!</p>
      </header>

      <div className="container">
        {/* SECTION 1: GROUP ORDER */}
        <section className="section">
          <h2>📦 Group Order Aktif</h2>
          {groupOrders.length === 0 ? (
            <p>Tidak ada group order</p>
          ) : (
            <div className="cards">
              {groupOrders.map(go => (
                <div key={go.id} className="card">
                  <h3>{go.nama}</h3>
                  <p><strong>Status:</strong> {go.status}</p>
                  <p><strong>Buka:</strong> {go.tanggalBuka}</p>
                  <p><strong>Tutup:</strong> {go.tanggalTutup}</p>
                  <button>Lihat Detail</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: MERCHANDISE */}
        <section className="section">
          <h2>🎁 Merchandise Tersedia</h2>
          {loading ? (
            <p>Memuat...</p>
          ) : merchandise.length === 0 ? (
            <p>Tidak ada merchandise</p>
          ) : (
            <div className="cards">
              {merchandise.map(item => (
                <div key={item.id} className="card">
                  <h3>{item.nama}</h3>
                  <p className="harga">Rp {item.harga.toLocaleString()}</p>
                  <p><strong>Stok:</strong> {item.stok}</p>
                  <button>Pesan Sekarang</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;