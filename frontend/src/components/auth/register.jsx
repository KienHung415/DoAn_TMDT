import React, { useState, useEffect } from 'react';
import './auth.css';
import { useNavigate, Link } from 'react-router-dom';

// Use relative path so Vite dev proxy handles cross-origin during development
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Reset form khi component mount hoặc route thay đổi
    useEffect(() => {
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError(null);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp');
            return;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        try {
            const resp = await fetch(`${API_BASE}/user/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password }),
                credentials: 'include'
            });
            let data = null;
            try { data = await resp.json(); } catch { data = null; }

            if (!resp.ok && !(data && data.code === 200)) {
                setError(data?.message || 'Đăng ký thất bại');
                return;
            }

            if (data) {
                if (data.code === 200) {
                    const token = data.token || data.tokenUser;
                    if (token) {
                        localStorage.setItem('tokenUser', token);
                        navigate('/login');
                    } else {
                        setError('Lỗi: không nhận được token từ server');
                    }
                } else {
                    setError(data.message || 'Đăng ký thất bại');
                }
            } else {
                setError('Server không phản hồi');
            }
        } catch (err) {
            setError(err.message || 'Lỗi');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ width: '520px' }}>
                <h3>Đăng ký</h3>
                {error && <div className="auth-alert auth-alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="auth-form-group">
                        <label>Họ và tên</label>
                        <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
                    </div>
                    <div className="auth-form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                    </div>
                    <div className="auth-form-group">
                        <label>Mật khẩu</label>
                        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Tối thiểu 6 ký tự" />
                    </div>
                    <div className="auth-form-group">
                        <label>Xác nhận mật khẩu</label>
                        <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
                    </div>
                    <button className="auth-btn" type="submit">Đăng ký</button>
                </form>
                <hr className="auth-divider" />
                <p className="auth-footer">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
            </div>
        </div>
    );
}
