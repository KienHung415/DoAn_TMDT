import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:3005';

const Cart = () => {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch cart on component mount
  // Fetch cart on component mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/cart`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        // If not authenticated, redirect to login
        if (res.status === 401) {
          setError('Vui lòng đăng nhập để xem giỏ hàng');
          navigate('/login');
          return;
        }

        if (!res.ok) throw new Error('Lỗi tải giỏ hàng');
        const data = await res.json();

        if (data.code === 200 && data.cart) {
          // refresh each product's latest data (stock, etc.)
          const fresh = await refreshProductDetails(data.cart);
          setCartData(fresh);
        } else {
          setError(data.message || 'Không thể tải giỏ hàng');
        }
      } catch (err) {
        setError(err.message || 'Lỗi tải giỏ hàng');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const getProductImage = (product) => {
    if (!product) return '/images/placeholder.png';

    const raw = product.thumbnail || product.image || (product.images && product.images[0]) || null;
    if (!raw) return '/images/placeholder.png';

    if (/^https?:\/\//i.test(raw)) return raw; // absolute URL
    if (raw.startsWith('/')) return BACKEND_ORIGIN + raw; // backend absolute path
    return BACKEND_ORIGIN + '/' + raw; // relative path
  };

  const getAvailableStock = (product) => {
    if (!product) return 0;
    // support common field names for stock/quantity
    return product.quantity || product.stock || product.countInStock || product.inventory || 0;
  };

  // Fetch latest product details (stock, price, etc.) for items in the cart
  const refreshProductDetails = async (cart) => {
    if (!cart || !cart.products || cart.products.length === 0) return cart;

    try {
      const updated = await Promise.all(cart.products.map(async (item) => {
        const pid = item.product?._id || item.product_id;
        try {
          const res = await fetch(`${API_BASE}/products/detail/${pid}`);
          if (!res.ok) return item;
          const latest = await res.json();
          return { ...item, product: latest };
        } catch {
          return item;
        }
      }));

      return { ...cart, products: updated };
    } catch {
      return cart;
    }
  };

  const updateQuantity = async (productId, requestedQty) => {
    if (!cartData || !cartData.products) return;

    const item = cartData.products.find(p => p.product_id === productId);
    if (!item) return;

    // sanitize requested qty
    let newQty = parseInt(requestedQty, 10);
    if (Number.isNaN(newQty)) return;

    if (newQty < 1) {
      // treat as remove
      await removeItem(productId);
      return;
    }

    const maxStock = getAvailableStock(item.product);
    if (maxStock <= 0) {
      setError('Sản phẩm hiện hết hàng');
      return;
    }

    if (newQty > maxStock) {
      setError(`Không thể thêm quá ${maxStock} sản phẩm. Đã đặt tối đa.`);
      newQty = maxStock;
    } else {
      setError(null);
    }

    const existingQty = item.quantity || 0;
    if (newQty === existingQty) return;

    if (newQty > existingQty) {
      // Tăng số lượng: gọi backend như cũ
      try {
        const diff = newQty - existingQty;
        const addRes = await fetch(`${API_BASE}/cart/add/${productId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: diff }),
          credentials: 'include'
        });
        if (addRes.ok) {
          const addData = await addRes.json();
          if (addData.cart) {
            const fresh = await refreshProductDetails(addData.cart);
            setCartData(fresh);
          }
        } else {
          const errText = await addRes.text();
          setError(errText || 'Lỗi cập nhật số lượng');
        }
      } catch (err) {
        setError(err.message || 'Lỗi cập nhật số lượng');
      }
    } else {
      // Giảm số lượng: tối ưu - cập nhật UI ngay, đồng bộ ngầm với backend
      const updatedProducts = cartData.products.map(p =>
        p.product_id === productId ? { ...p, quantity: newQty } : p
      );
      setCartData({ ...cartData, products: updatedProducts });

      // Fire-and-forget background sync: delete then re-add desired qty
      (async () => {
        try {
          // remove from backend first
          await fetch(`${API_BASE}/cart/delete/${productId}`, {
            method: 'GET',
            credentials: 'include'
          });

          // add desired quantity (>0)
          if (newQty > 0) {
            await fetch(`${API_BASE}/cart/add/${productId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quantity: newQty }),
              credentials: 'include'
            });
          }

          // noop: don't setCartData from responses to avoid extra re-renders.
        } catch (err) {
          // sync failed: notify and refetch cart to reconcile state
          console.warn('Background cart sync failed:', err);
          setError('Lỗi đồng bộ giỏ hàng. Đã tải lại giỏ hàng.');
          try {
            const r = await fetch(`${API_BASE}/cart`, {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            if (r.ok) {
              const d = await r.json();
              if (d.code === 200 && d.cart) {
                const fresh = await refreshProductDetails(d.cart);
                setCartData(fresh);
              }
            }
          } catch (err) {
            console.debug('ignore refetch error', err);
          }
        }
      })();
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/cart/delete/${productId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.cart) {
          const fresh = await refreshProductDetails(data.cart);
          setCartData(fresh);
        }
      }
    } catch (err) {
      setError(err.message || 'Lỗi xóa sản phẩm');
    }
  };

  // Totals (computed below once we have products)

  if (loading) {
    return <div className="bg-white max-w-[1400px] mx-auto px-10 mt-10 mb-5 text-center py-10">Đang tải giỏ hàng...</div>;
  }


  const products = cartData && cartData.products ? cartData.products : [];
  const isEmpty = products.length === 0;

  const subtotal = products.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
  const taxRate = 0.05;
  const shippingRate = 15.0;
  const tax = subtotal * taxRate;
  const shipping = subtotal > 0 ? shippingRate : 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="bg-white max-w-[1400px] mx-auto px-10 mt-10 mb-5">
      <h1 className="text-3xl font-light mb-6">Shopping Cart</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {isEmpty ? (
        <div className="text-center py-10">
          <p className="text-gray-600 mb-4">Giỏ hàng của bạn trống</p>
          <button
            onClick={() => navigate('/allproduct')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <>
          {/* Column labels */}
          <div className="hidden md:flex border-b border-gray-200 pb-3 font-semibold text-gray-500">
            <div className="w-1/5">Image</div>
            <div className="w-[37%]">Product</div>
            <div className="w-[12%]">Price</div>
            <div className="w-[10%]">Quantity</div>
            <div className="w-[9%]">Remove</div>
            <div className="w-[12%] text-right">Total</div>
          </div>

          {/* Product list */}
          {products.map(item => (
            <div key={item.product_id} className="flex items-start border-b border-gray-200 py-4">
              <div className="w-1/5 text-center">
                <img
                  src={getProductImage(item.product)}
                  alt={item.product?.title || 'Product'}
                  className="w-24 mx-auto object-contain"
                />
              </div>
              <div className="w-[37%]">
                <h3 className="font-medium mb-1">{item.product?.title || 'Unknown Product'}</h3>
                <p className="text-sm text-gray-600">{item.product?._id}</p>
                <p className="text-sm text-gray-500">Sẵn có: {getAvailableStock(item.product)}</p>
              </div>
              <div className="w-[12%]">${(item.product?.price || 0).toFixed(2)}</div>
              <div className="w-[10%]">
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value))}
                  className="w-12 border rounded px-2"
                />
              </div>
              <div className="w-[9%]">
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded uppercase"
                >
                  Remove
                </button>
              </div>
              <div className="w-[12%] text-right">
                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="mt-8">
            <div className="flex justify-between mb-2">
              <label className="w-4/5 text-right">Subtotal</label>
              <div className="w-1/5 text-right">${subtotal.toFixed(2)}</div>
            </div>
            <div className="flex justify-between mb-2">
              <label className="w-4/5 text-right">Tax (5%)</label>
              <div className="w-1/5 text-right">${tax.toFixed(2)}</div>
            </div>
            <div className="flex justify-between mb-2">
              <label className="w-4/5 text-right">Shipping</label>
              <div className="w-1/5 text-right">${shipping.toFixed(2)}</div>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <label className="w-4/5 text-right">Grand Total</label>
              <div className="w-1/5 text-right">${total.toFixed(2)}</div>
            </div>
          </div>

          {/* Checkout button */}
          <div className="flex justify-end">
            <button
              onClick={async () => {
                // Always sync cart with backend before navigating to checkout
                try {
                  const res = await fetch(`${API_BASE}/cart`, {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.code === 200 && data.cart) {
                      setCartData(await refreshProductDetails(data.cart));
                    }
                  }
                } catch (err) { console.warn(err); }
                navigate('/checkout');
              }}
              className="bg-linear-to-b from-orange-400 
          to-orange-500 text-white px-8 py-3 rounded-lg md:text-lg text-md hover:scale-105 hover:to-orange-600 
          transition-all duration-300 cursor-pointer">
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
