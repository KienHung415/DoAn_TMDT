import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:3005';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [cartData, setCartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        email: "",
        paymentMethod: "cod"
    });

    // Fetch cart data on mount and when location changes (e.g. when user navigates back from cart)
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`${API_BASE}/cart`, {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (res.status === 401) {
                    navigate('/login');
                    return;
                }

                if (!res.ok) throw new Error('Lỗi tải giỏ hàng');
                const data = await res.json();

                if (data.code === 200 && data.cart) {
                    setCartData(data.cart);
                } else {
                    setError(data.message || 'Không thể tải giỏ hàng');
                }
            } catch (err) {
                setError(err.message || 'Lỗi tải giỏ hàng');
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate, location]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.fullName.trim()) {
            setError('Vui lòng nhập tên người nhận');
            return;
        }
        if (!formData.phone.trim()) {
            setError('Vui lòng nhập số điện thoại');
            return;
        }
        if (!formData.address.trim()) {
            setError('Vui lòng nhập địa chỉ');
            return;
        }
        if (cartData.products.length === 0) {
            setError('Giỏ hàng trống');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // người dùng chọn VNPAY- gọi backend /orders/create_payment_url
            if (formData.paymentMethod === 'vnpay') {
                const amount = Math.round(total || 0);
                const payload = {
                    amount,
                    user_id: cartData.user_id,
                    language: 'vn',
                    // Include user info so backend can attach it to the order
                    userInfo: {
                        fullName: formData.fullName,
                        phone: formData.phone,
                        address: formData.address,
                        email: formData.email || ''
                    }
                };

                const res = await fetch(`${API_BASE}/orders/create_payment_url`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                });

                const data = await res.json();
                if (!res.ok) {
                    setError(data.message || 'Không thể tạo đường dẫn thanh toán VNPAY');
                    return;
                }

                if (data && data.paymentUrl) {
                    // Redirect the browser to VNPAY payment page
                    window.location.href = data.paymentUrl;
                    return;
                } else {
                    setError('Không nhận được đường dẫn thanh toán từ server');
                    return;
                }
            }

            // Fallback/other payment methods (e.g., COD)
            const orderData = {
                userInfo: {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    address: formData.address,
                    email: formData.email || ""
                },
                paymentMethod: formData.paymentMethod
            };

            const res = await fetch(`${API_BASE}/checkout/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
                credentials: 'include'
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Lỗi đặt hàng');
                return;
            }

            // Success - chuyển hướng đến trang tạo đơn hàng thành công
            navigate(`/order-success/${data.orderId}`, {
                state: { orderId: data.orderId, paymentMethod: data.paymentMethod }
            });
        } catch (err) {
            setError(err.message || 'Lỗi đặt hàng');
        } finally {
            setSubmitting(false);
        }
    };

    const getProductImage = (product) => {
        if (!product) return '/images/placeholder.png';
        const raw = product.thumbnail || product.image || (product.images && product.images[0]) || null;
        if (!raw) return '/images/placeholder.png';
        if (/^https?:\/\//i.test(raw)) return raw;
        if (raw.startsWith('/')) return BACKEND_ORIGIN + raw;
        return BACKEND_ORIGIN + '/' + raw;
    };

    if (loading) {
        return <div className="bg-white max-w-[1400px] mx-auto px-10 mt-10 mb-5 text-center py-10">Đang tải...</div>;
    }

    const products = cartData?.products || [];
    const subtotal = products.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
    const taxRate = 0.05;
    const shippingRate = 15.0;
    const tax = subtotal * taxRate;
    const shipping = subtotal > 0 ? shippingRate : 0;
    const total = subtotal + tax + shipping;

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="max-w-[1400px] mx-auto px-10">
                <h1 className="text-3xl font-light mb-8">Checkout</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left side - Customer Info & Payment Method */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Customer Information */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-2xl font-semibold mb-4">Thông tin người nhận</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tên người nhận *
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số điện thoại *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="0912345678"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Địa chỉ *
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email (Tùy chọn)
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="example@email.com"
                                    />
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-2xl font-semibold mb-4">Phương thức thanh toán</h2>

                                <div className="space-y-3">
                                    <label className="flex items-center p-3 border border-gray-300 rounded cursor-pointer hover:bg-orange-50" style={{ borderColor: formData.paymentMethod === 'cod' ? '#ff7a45' : '#ccc' }}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={handleInputChange}
                                            className="w-4 h-4"
                                        />
                                        <span className="ml-3 font-medium">Thanh toán khi nhận hàng (COD)</span>
                                    </label>

                                    <label className="flex items-center p-3 border border-gray-300 rounded cursor-pointer hover:bg-orange-50" style={{ borderColor: formData.paymentMethod === 'vnpay' ? '#ff7a45' : '#ccc' }}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="vnpay"
                                            checked={formData.paymentMethod === 'vnpay'}
                                            onChange={handleInputChange}
                                            className="w-4 h-4"
                                        />
                                        <span className="ml-3 font-medium">VNPAY</span>
                                    </label>

                                    <label className="flex items-center p-3 border border-gray-300 rounded cursor-pointer hover:bg-orange-50 opacity-50" style={{ borderColor: formData.paymentMethod === 'momo' ? '#ff7a45' : '#ccc' }}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="momo"
                                            checked={formData.paymentMethod === 'momo'}
                                            onChange={handleInputChange}
                                            disabled
                                            className="w-4 h-4"
                                        />
                                        <span className="ml-3 font-medium">MoMo (Sắp ra mắt)</span>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right side - Order Summary */}
                    <div>
                        <div className="bg-white p-6 rounded-lg shadow sticky top-20">
                            <h2 className="text-2xl font-semibold mb-4">Kiểm tra đơn hàng</h2>

                            {/* Products List */}
                            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                                {products.map(item => (
                                    <div key={item.product_id} className="flex gap-3 pb-3 border-b border-gray-200">
                                        <img
                                            src={getProductImage(item.product)}
                                            alt={item.product?.title}
                                            className="w-16 h-16 object-contain"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{item.product?.title}</p>
                                            <p className="text-xs text-gray-500">SL: {item.quantity}</p>
                                            <p className="text-sm font-semibold text-orange-500">
                                                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pricing Summary */}
                            <div className="space-y-2 border-t border-gray-200 pt-4 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tạm tính</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Thuế (5%)</span>
                                    <span className="font-medium">${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phí vận chuyển</span>
                                    <span className="font-medium">${shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                                    <span>Tổng cộng</span>
                                    <span className="text-orange-500">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || loading}
                                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                            >
                                {submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                            </button>

                            {/* Back to Cart */}
                            <button
                                onClick={() => navigate('/cart')}
                                className="w-full mt-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-all duration-300"
                            >
                                Quay lại giỏ hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
