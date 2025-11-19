import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3005/api";

export default function VNPayReturn() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [statusText, setStatusText] = useState('Đang xác nhận giao dịch...');
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState(null);
    const responseCode = searchParams.get("vnp_ResponseCode");
    const txnRef = searchParams.get("vnp_TxnRef");
    const amountRaw = searchParams.get("vnp_Amount");
    const amount = amountRaw ? Number(amountRaw) / 100 : 0;

    useEffect(() => {
        if (!txnRef) {
            setError('Không tìm thấy mã giao dịch (vnp_TxnRef).');
            setStatusText('Lỗi: thiếu mã giao dịch');
            return;
        }

        let cancelled = false;
        const maxRetries = 6;
        const retryDelay = 1000; // ms

        const checkOrder = async (tryCount = 0) => {
            try {
                // backend mounts orders router at /api/orders
                const res = await fetch(`${API_BASE}/orders/get/${txnRef}`, { credentials: 'include' });
                if (res.status === 404) {
                    if (tryCount < maxRetries) {
                        setStatusText('Đang chờ xử lý, thử xác nhận lại...');
                        setTimeout(() => checkOrder(tryCount + 1), retryDelay);
                        return;
                    }
                    setStatusText('Không tìm thấy đơn hàng. Vui lòng liên hệ hỗ trợ.');
                    setError('Order not found');
                    return;
                }

                if (!res.ok) {
                    if (tryCount < maxRetries) {
                        setTimeout(() => checkOrder(tryCount + 1), retryDelay);
                        return;
                    }
                    throw new Error('Không thể xác nhận đơn hàng');
                }

                const order = await res.json();

                //  order paid when paymentStatus === 'paid'
                if (order.paymentStatus === 'paid' || responseCode === '00') {
                    if (cancelled) return;
                    setStatusText('Thanh toán đã được xác nhận. Chuyển hướng...');
                    setConfirmed(true);
                    // navigate to order success page
                    const orderId = order._id || txnRef;
                    setTimeout(() => navigate(`/order-success/${orderId}`), 800);
                    return;
                }

                // If not yet paid, retry 
                if (tryCount < maxRetries) {
                    setStatusText('Chưa xác nhận thanh toán, thử lại...');
                    setTimeout(() => checkOrder(tryCount + 1), retryDelay);
                    return;
                }

                setStatusText('Thanh toán chưa được xác nhận. Vui lòng kiểm tra lại sau.');
                setError('Payment not confirmed');

            } catch (err) {
                if (tryCount < maxRetries) {
                    setTimeout(() => checkOrder(tryCount + 1), retryDelay);
                    return;
                }
                setError(err.message || 'Lỗi xác nhận đơn hàng');
                setStatusText('Lỗi khi xác nhận đơn hàng');
            }
        };

        // start checking
        checkOrder(0);

        return () => { cancelled = true; };
    }, [searchParams, navigate, responseCode, txnRef]);

    return (
        <div className="container mt-5 text-center">
            <div className="card mx-auto" style={{ maxWidth: 600 }}>
                <div className="card-body">
                    <h4 className="card-title">Kết quả thanh toán VNPAY</h4>
                    <p className="card-text">Mã giao dịch: <b>{txnRef}</b></p>
                    <p className="card-text">Số tiền: <b>{amount.toLocaleString()} VNĐ</b></p>
                    <hr />
                    <p>{statusText}</p>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="d-flex justify-content-center gap-2">
                        <Link to="/" className="btn btn-outline-secondary">Về trang chủ</Link>
                        {!confirmed && <Link to="/order-success" className="btn btn-outline-primary">Xem trạng thái đơn</Link>}
                    </div>
                </div>
            </div>
        </div>
    );
}
