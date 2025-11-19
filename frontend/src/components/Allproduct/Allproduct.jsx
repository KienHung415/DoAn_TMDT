import React, { useState, useEffect } from "react";
import Heading from "../Heading/Heading";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:3005';

const Allproduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/products`, { credentials: 'include' });
        if (!res.ok) throw new Error('Lỗi tải sản phẩm');
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        setError(err.message || 'Lỗi mạng');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!localStorage.getItem('tokenUser')) {
      // chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/cart/add/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 1 }),
        credentials: 'include'
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.message || 'Thêm vào giỏ hàng thất bại');
        return;
      }
      alert('Đã thêm vào giỏ hàng');
    } catch {
      alert('Lỗi khi thêm vào giỏ hàng');
    }
  };

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All' ? products : products.filter(p => p.category === activeTab);

  return (
    <section>
      <div className="max-w-[1400px] mx-auto px-10 mt-40 mb-10">
        <Heading highlight="Our" heading="Products" />

        <div className="flex gap-3 justify-center mt-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`rounded-lg px-5 text-lg cursor-pointer ${activeTab === category ? "bg-linear-to-b from-orange-400 to-orange-500 text-white" : "bg-zinc-100"}`}>
              {category}
            </button>
          ))}
        </div>

        {loading && <p className="text-center mt-8">Đang tải sản phẩm...</p>}
        {error && <p className="text-center text-red-600 mt-8">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {filtered.map(product => (
            <div key={product._id || product.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="w-full h-48 flex items-center justify-center overflow-hidden mb-4">
                {(() => {
                  const raw = product.thumbnail || product.image || (product.images && product.images[0]) || null;
                  let src = '/images/placeholder.png';
                  if (raw) {
                    if (/^https?:\/\//i.test(raw)) src = raw;
                    else if (raw.startsWith('/')) src = BACKEND_ORIGIN + raw;
                    else src = BACKEND_ORIGIN + '/' + raw;
                  }
                  return <img src={src} alt={product.title || product.name} className="object-contain h-full" />;
                })()}
              </div>
              <h4 className="font-semibold text-lg mb-2">{product.title || product.name}</h4>
              <p className="text-orange-500 font-bold mb-3">
                {product.price ? `${product.price.toLocaleString()} VND` : ''}
              </p>
              <div className="flex gap-2">
                {localStorage.getItem('tokenUser') ? (
                  <Link to={`/detail?id=${product._id || product.id}`} className="flex-1 text-center bg-gray-200 hover:bg-gray-300 py-2 rounded">Detail</Link>
                ) : (
                  <button disabled className="flex-1 text-center bg-gray-200 py-2 rounded opacity-50 cursor-not-allowed">Detail</button>
                )}
                {localStorage.getItem('tokenUser') ? (
                  <button onClick={() => handleAddToCart(product._id || product.id)} className="flex-1 bg-orange-500 hover:brightness-90 text-white py-2 rounded">Add to Cart</button>
                ) : (
                  <button onClick={() => navigate('/login')} className="flex-1 bg-orange-300 text-white py-2 rounded">Đăng nhập để mua</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Allproduct;
