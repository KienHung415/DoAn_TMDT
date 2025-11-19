import React, { useState, useEffect } from 'react';
import './auth.css';
import { useNavigate, Link } from 'react-router-dom';

// Use relative path so Vite dev proxy handles cross-origin during development
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Reset form khi component mount
    useEffect(() => {
        setEmail('');
        setPassword('');
        setError(null);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const resp = await fetch(`${API_BASE}/user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });
            let data = null;
            try { data = await resp.json(); } catch { data = null; }

            // Kiểm tra nếu đăng nhập thất bại
            if (!resp.ok || (data && data.code !== 200)) {
                let message = 'Đăng nhập thất bại';
                if (resp.status === 401 || resp.status === 403) {
                    message = 'Email hoặc mật khẩu không đúng';
                } else if (data && data.message) {
                    message = data.message;
                } else if (!data) {
                    message = 'Server không phản hồi';
                }
                setError(message);
                setPassword(''); // Xóa mật khẩu
                return; // Dừng lại, không chuyển hướng
            }

            // Đăng nhập thành công
            const token = data && (data.token || data.tokenUser);
            if (token) {
                localStorage.setItem('tokenUser', token);
                navigate('/'); // Chuyển tới trang chủ
            } else {
                setError('Lỗi: không nhận được token từ server');
                setPassword('');
            }
        } catch (err) {
            setError(err.message || 'Lỗi kết nối');
            setPassword('');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h3>Đăng nhập</h3>
                {error && (
                    <div className="auth-alert auth-alert-danger" role="alert" aria-live="assertive">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="auth-form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="auth-form-group">
                        <label>Mật khẩu</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <small style={{ display: 'block', marginTop: '8px' }}>
                            <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#007bff' }}>Quên mật khẩu?</Link>
                        </small>
                    </div>
                    <button className="auth-btn" type="submit">Đăng nhập</button>
                </form>
                <hr className="auth-divider" />
                <p className="auth-footer">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
            </div>
        </div>
    );
}
