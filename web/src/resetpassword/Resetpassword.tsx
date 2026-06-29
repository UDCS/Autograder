import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Navbar from "../components/navbar/Navbar"
import TextField from "../components/textfield/Textfield"
import './resetpassword.css'

function ResetPassword() {
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get("request_id");
    const token = params.get("token");
    const hasToken = !!(requestId && token);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [requested, setRequested] = useState(false);
    // Validity of the emailed link: "verifying" until the backend confirms.
    const [tokenStatus, setTokenStatus] = useState<"verifying" | "valid" | "invalid">("verifying");

    // Verify the reset token before showing the new-password form.
    useEffect(() => {
        if (!hasToken) return;
        (async () => {
            try {
                const res = await fetch(`/api/auth/reset_password/${requestId}/valid?token=${encodeURIComponent(token!)}`);
                const data = await res.json();
                setTokenStatus(res.ok && data?.message === "true" ? "valid" : "invalid");
            } catch {
                setTokenStatus("invalid");
            }
        })();
    }, []);

    // Logged-out "forgot password": ask for the reset email.
    const requestReset = async () => {
        setSubmitting(true);
        setMessage("");
        try {
            const res = await fetch("/api/auth/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                setRequested(true);
                setMessage("If an account exists for that email, a reset link has been sent. Check your inbox.");
            } else {
                setMessage("Something went wrong. Please try again.");
                setSubmitting(false);
            }
        } catch {
            setMessage("Something went wrong. Please try again.");
            setSubmitting(false);
        }
    };

    // Followed an emailed link: set the new password.
    const submitNewPassword = async () => {
        if (password !== confirm) {
            setMessage("Passwords do not match.");
            return;
        }
        setSubmitting(true);
        setMessage("");
        try {
            const res = await fetch(`/api/auth/reset_password/${requestId}?token=${encodeURIComponent(token!)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (res.ok) {
                window.location.href = "/dashboard";
            } else {
                const data = await res.json().catch(() => null);
                setMessage(data?.error ?? "Could not reset password. The link may have expired or already been used.");
                setSubmitting(false);
            }
        } catch {
            setMessage("Something went wrong. Please try again.");
            setSubmitting(false);
        }
    };

    return (
        <div className="reset-page">
            <div className="reset-card">
                <h1 className="reset-title">Reset Password</h1>
                {hasToken ? (
                    tokenStatus === "verifying" ? (
                        <p className="reset-message">Verifying reset link…</p>
                    ) : tokenStatus === "invalid" ? (
                        <div className="reset-error">This password reset link is invalid or has expired.</div>
                    ) : (
                        <>
                            <TextField type="password" label="" initialValue="New password"
                                onChange={(data) => setPassword(data.value)} />
                            <TextField type="password" label="" initialValue="Confirm new password"
                                onChange={(data) => setConfirm(data.value)} />
                            <button className="reset-button" onClick={submitNewPassword} disabled={submitting || password === "" || confirm === ""}>
                                Set New Password
                            </button>
                        </>
                    )
                ) : !requested ? (
                    <>
                        <TextField type="email" label="" initialValue="Email"
                            onChange={(data) => setEmail(data.value)} />
                        <button className="reset-button" onClick={requestReset} disabled={submitting || email === ""}>
                            Send Reset Link
                        </button>
                    </>
                ) : null}
                {message && <p className="reset-message">{message}</p>}
            </div>
        </div>
    );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Navbar />
    <ResetPassword />
  </StrictMode>,
)
