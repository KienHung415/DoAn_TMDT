import React, { useState } from 'react';
import './auth.css';
import { useNavigate, Link } from 'react-router-dom';

// Use relative path so dev proxy handles cross-origin during development
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function callApi(endpoint, body) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            credentials: 'include'
        });
        let data = null;
        try {
            data = await res.json();
        } catch (e) {
            // non-json response
            data = null;
        }
        return { ok: res.ok, status: res.status, data };
    } catch (err) {
        // network error
        return { ok: false, status: 0, data: null, error: err };
    }
}

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: enter email, 2: enter otp, 3: reset password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    // Step 1: Send OTP to email
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const res = await callApi('/user/password/forgot', { email });
            if (res && res.data && (res.data.code === 200 || res.ok)) {
                setSuccess('Mã OTP đã được gửi tới email của bạn');
                setStep(2);
            } else {
                setError(res.data?.message || 'Lỗi gửi OTP');
            }
        } catch (err) {
            setError(err.message || 'Lỗi');
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const res = await callApi('/user/password/otp', { email, otp });
            console.log('Full OTP Response:', res);
            console.log('OTP Response data:', res.data);
            console.log('OTP Response data keys:', Object.keys(res.data));
            console.log('res.data.token:', res.data?.token);
            console.log('res.data.tokenUser:', res.data?.tokenUser);
            if (res && res.data && (res.data.code === 200 || res.ok)) {
                // Save token from OTP response for password reset
                const tokenFromOtp = res.data.token || res.data.tokenUser;
                if (tokenFromOtp) {
                    localStorage.setItem('resetToken', tokenFromOtp);
                    console.log('Token saved:', tokenFromOtp);
                }
                setSuccess('Xác thực thành công');
                setStep(3);
            } else {
                setError(res.data?.message || 'OTP không hợp lệ');
            }
        } catch (err) {
            setError(err.message || 'Lỗi');
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp');
            return;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        try {
            // use token from resetToken (saved from OTP verification)
            const tokenToSend = localStorage.getItem('resetToken');
            if (!tokenToSend) {
                setError('Không có token, vui lòng thực hiện lại từ đầu');
                return;
            }
            const res = await callApi('/user/password/reset', { token: tokenToSend, password });
            if (res && res.data && (res.data.code === 200 || res.ok)) {
                // Clear tokens after successful reset
                localStorage.removeItem('resetToken');
                localStorage.removeItem('tokenUser');
                setSuccess('Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(res.data?.message || 'Lỗi đổi mật khẩu');
            }
        } catch (err) {
            setError(err.message || 'Lỗi');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h3>Lấy lại mật khẩu</h3>
                {error && <div className="auth-alert auth-alert-danger">{error}</div>}
                {success && <div className="auth-alert auth-alert-success">{success}</div>}

                {step === 1 && (
                    <form onSubmit={handleSendOtp}>
                        <div className="auth-form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button className="auth-btn" type="submit">Gửi mã OTP</button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="auth-form-group">
                            <label>Mã OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                placeholder="Nhập mã OTP từ email"
                                required
                            />
                        </div>
                        <button className="auth-btn" type="submit">Xác thực</button>
                        <button type="button" className="auth-btn-link" onClick={() => setStep(1)}>
                            Quay lại
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <div className="auth-form-group">
                            <label>Mật khẩu mới</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                placeholder="Tối thiểu 6 ký tự"
                            />
                        </div>
                        <div className="auth-form-group">
                            <label>Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className="auth-btn" type="submit">Đổi mật khẩu</button>
                    </form>
                )}

                <hr className="auth-divider" />
                <p className="auth-footer"><Link to="/login">Quay lại đăng nhập</Link></p>
            </div>
        </div>
    );
}
