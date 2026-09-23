import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, App } from 'antd';
import { MailOutlined, LockOutlined, ReloadOutlined } from '@ant-design/icons';
import loginImage from '../../assets/images/loginHero.jpg';
import ibimaLogo from '../../assets/images/ibimaLogo.svg';
import { COLORS } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';
import { setSuperAdminSession } from '../../auth/session';

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
const generateCaptcha = (length = 5) =>
    Array.from({ length }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join('');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;

const Label = ({ children, extra }) => (
    <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
            {children} <span style={{ color: COLORS.danger }}>*</span>
        </label>
        {extra}
    </div>
);

const LoginPage = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [captcha, setCaptcha] = useState(() => generateCaptcha());
    const [captchaInput, setCaptchaInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const refreshCaptcha = () => {
        setCaptcha(generateCaptcha());
        setCaptchaInput('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const id = identifier.trim();
        if (!id) return setError('Please enter your email address or mobile number.');
        if (!EMAIL_RE.test(id) && !MOBILE_RE.test(id.replace(/\s/g, ''))) return setError('Enter a valid email address or 10-digit mobile number.');
        if (password.length < 6) return setError('Password must be at least 6 characters.');
        if (captchaInput.trim() !== captcha) {
            setError('Captcha does not match (it is case-sensitive).');
            refreshCaptcha();
            return;
        }
        setError('');
        setLoading(true);
        // UI-only demo login (no backend yet): any valid-looking credentials
        // + a matching captcha get you in. Swap for a real auth call later.
        setTimeout(() => {
            setSuperAdminSession({ email: EMAIL_RE.test(id) ? id : 'Superadmin@ibima.com', loggedInAt: new Date().toISOString() });
            navigate(ROUTES.HOME, { replace: true });
        }, 400);
    };

    return (
        <div className="min-h-screen flex bg-white">
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                <img src={loginImage} alt="Smarter Claims. Stronger Protection." className="absolute inset-0 w-full h-full object-cover object-top" />
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-[440px]">
                    {/* Twin-logo lockup */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex rounded-md overflow-hidden" style={{ border: '2px solid #1E2A5A' }}>
                            <img src={ibimaLogo} alt="IBima Assist" className="block" style={{ height: 64, borderRight: '2px solid #1E2A5A' }} />
                            <img src={ibimaLogo} alt="" aria-hidden="true" className="block" style={{ height: 64 }} />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold m-0" style={{ color: COLORS.textPrimary }}>Welcome back</h1>
                    <p className="text-sm mt-1 mb-6" style={{ color: COLORS.textPrimary }}>Sign in to your account to continue.</p>

                    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                        <div>
                            <Label>Email Address/ Mobile Number</Label>
                            <Input
                                prefix={<MailOutlined style={{ color: COLORS.textMuted }} />}
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="Enter Email Address"
                                autoComplete="username"
                                style={{ height: 40 }}
                            />
                        </div>

                        <div>
                            <Label extra={(
                                <button type="button" className="text-xs" style={{ color: COLORS.textMuted }} onClick={() => message.info('Please contact your IBima Assist administrator to reset your password.')}>
                                    Forgot password?
                                </button>
                            )}
                            >
                                Password
                            </Label>
                            <Input.Password
                                prefix={<LockOutlined style={{ color: COLORS.textMuted }} />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Password"
                                autoComplete="current-password"
                                style={{ height: 40 }}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm select-none" style={{ letterSpacing: '0.55em', fontFamily: 'monospace', color: COLORS.textPrimary }} aria-label={`Captcha ${captcha.split('').join(' ')}`}>
                                {captcha}
                            </span>
                            <button type="button" onClick={refreshCaptcha} aria-label="Refresh captcha" style={{ color: COLORS.primary, fontSize: 18 }}>
                                <ReloadOutlined />
                            </button>
                        </div>
                        <Input value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder="Enter the captcha above" aria-label="Captcha" style={{ height: 40 }} />

                        {error && <p role="alert" className="text-xs m-0" style={{ color: COLORS.danger }}>{error}</p>}

                        <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 42, fontSize: 15, fontWeight: 600 }}>Sign In</Button>
                    </form>

                    <div className="mt-8 text-[11px] leading-relaxed" style={{ color: COLORS.textPrimary }}>
                        <p className="m-0">Powered By Vroomsync Expertise Private Limited. All Rights Reserved 2025. CIN: U62099CT2025PTC017274</p>
                        <p className="m-0">Insurance is the subject matter of solicitation.</p>
                        <p className="mt-3 mb-0">Images used on this website and the models photographed in them are for representative purposes only and are not indicative of anyone&apos;s personal thoughts or ideas.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
