import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import loginImage from '../../assets/images/loginImage.jpg';
import ibimaLogo from '../../assets/images/ibimaLogo.svg';
import { COLORS } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';
import { setSuperAdminSession } from '../../auth/session';

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
const generateCaptcha = (length = 5) =>
    Array.from({ length }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join('');

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captcha, setCaptcha] = useState(() => generateCaptcha());
    const [captchaInput, setCaptchaInput] = useState('');
    const [error, setError] = useState('');

    const refreshCaptcha = () => {
        setCaptcha(generateCaptcha());
        setCaptchaInput('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email.trim()) return setError('Please enter your email address.');
        if (!password) return setError('Please enter your password.');
        if (captchaInput !== captcha) {
            setError('Captcha does not match.');
            refreshCaptcha();
            return;
        }
        setError('');
        // No backend yet -- this is a UI-only demo login (any credentials +
        // a matching captcha get you in). Swap for a real auth call later.
        setSuperAdminSession({ email });
        navigate(ROUTES.HOME);
    };

    return (
        <div className="min-h-screen flex" style={{ background: '#fff' }}>
            {/* Left -- hero image, hidden on small screens */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                <img src={loginImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>

            {/* Right -- form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <img src={ibimaLogo} alt="IBima Assist" style={{ height: 56, marginBottom: 28 }} />

                    <h1 className="text-3xl font-extrabold m-0" style={{ color: COLORS.textPrimary }}>
                        Claim Management System
                    </h1>
                    <p className="text-sm mt-2 mb-8" style={{ color: COLORS.textSecondary }}>
                        Sign in to your super-admin account
                    </p>

                    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                        <div>
                            <label className="block text-xs font-bold tracking-wide mb-1.5" style={{ color: COLORS.textPrimary }}>
                                EMAIL ADDRESS
                            </label>
                            <Input size="large" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold tracking-wide" style={{ color: COLORS.textPrimary }}>PASSWORD</label>
                                <button type="button" className="text-xs font-semibold" style={{ color: COLORS.primary }}>Forget Password?</button>
                            </div>
                            <Input.Password size="large" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                        </div>

                        <div className="flex items-center gap-3">
                            <span
                                className="font-bold text-lg select-none"
                                style={{ letterSpacing: '0.4em', fontFamily: 'monospace', color: COLORS.textPrimary, background: '#F1F5F9', padding: '6px 14px', borderRadius: 6 }}
                            >
                                {captcha}
                            </span>
                            <button type="button" onClick={refreshCaptcha} aria-label="Refresh captcha" style={{ color: COLORS.primary, fontSize: 20 }}>
                                <ReloadOutlined />
                            </button>
                        </div>
                        <Input size="large" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder="Enter captcha" />

                        {error && <p role="alert" className="text-sm m-0" style={{ color: COLORS.danger }}>{error}</p>}

                        <Button type="primary" size="large" htmlType="submit" block>Sign In</Button>
                    </form>

                    <div className="mt-8 text-xs leading-relaxed" style={{ color: COLORS.textSecondary }}>
                        <p className="font-semibold m-0">Powered By Vroomsync Expertise Private Limited. All Rights Reserved 2025. CIN: U62099CT2025PTC017274</p>
                        <p className="mt-2 m-0">Insurance is the subject matter of solicitation.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
