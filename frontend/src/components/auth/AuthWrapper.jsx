import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './auth-wrapper.css';

const AuthWrapper = ({ children }) => {
    return (
        <div className="auth-wrapper">
            {children}
        </div>
    );
};

export default AuthWrapper;
