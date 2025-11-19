import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// API base (override with VITE_API_BASE in frontend/.env)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3005/api";

const OrderSuccess = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderId) return;
        let cancelled = false;
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/orders/get/${orderId}`, { credentials: 'include' });
                if (!res.ok) throw new Error('Không lấy được thông tin đơn hàng');
                const data = await res.json();
                if (!cancelled) setOrder(data);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Lỗi server');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchOrder();
        return () => { cancelled = true; };
    }, [orderId]);

    const renderPaymentMethod = (m) => {
        if (!m) return '---';
        if (m.toLowerCase() === 'vnpay') return 'VNPAY';
        if (m.toLowerCase() === 'cod' || m.toLowerCase().includes('cod')) return 'Thanh toán khi nhận hàng (COD)';
        return m;
    };

    const renderStatus = (o) => {
        // prefer paymentStatus field
        const ps = o?.paymentStatus;
        if (ps === 'paid') return 'Thành công';
        if (ps === 'failed') return 'Thất bại';
        // fallback to numeric status
        const s = o?.status;
        if (s === 1) return 'Thành công';
        if (s === 2) return 'Thất bại';
        return 'Chờ xử lý';
    };

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="max-w-[1400px] mx-auto px-10">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
                    {/* Success Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Title and Message */}
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">
                        Đặt hàng thành công!
                    </h1>

                    <p className="text-lg text-gray-600 mb-6">
                        Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất.
                    </p>

                    {/* Order ID */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 mb-1">Mã đơn hàng của bạn:</p>
                        <p className="text-2xl font-bold text-blue-600 break-all">
                            {orderId}
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-yellow-800 mb-2">Thông tin đơn hàng</h3>
                        {loading ? (
                            <p className="text-sm text-yellow-700">Đang tải thông tin đơn hàng...</p>
                        ) : error ? (
                            <p className="text-sm text-red-600">Lỗi: {error}</p>
                        ) : (
                            <ul className="text-sm text-yellow-700 space-y-1 text-left">
                                <li>Phương thức thanh toán: <strong>{renderPaymentMethod(order?.paymentMethod)}</strong></li>
                                <li>Trạng thái: <strong>{renderStatus(order)}</strong></li>
                                <li>Bạn sẽ nhận thông báo qua email khi đơn hàng được giao</li>
                            </ul>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate("/allproduct")}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                        >
                            Tiếp tục mua sắm
                        </button>

                        <button
                            onClick={() => navigate("/")}
                            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-all duration-300"
                        >
                            Quay lại trang chủ
                        </button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">
                            Có câu hỏi về đơn hàng của bạn?
                        </p>
                        <a
                            href="/contact"
                            className="text-orange-500 hover:text-orange-600 font-semibold"
                        >
                            Liên hệ chúng tôi
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
