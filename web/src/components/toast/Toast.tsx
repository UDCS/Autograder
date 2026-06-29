import { useEffect, useRef, useState } from "react";
import { registerToastListener, ToastType } from "./toastBus";
import "./Toast.css";

type ToastState = { id: number; message: string; type: ToastType };

// Mount once near the page root. Listens for showToast() calls and renders a
// transient toast in the lower-left corner that vanishes after a few seconds.
function Toast() {
    const [toast, setToast] = useState<ToastState | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();
    const idRef = useRef(0);

    useEffect(() => {
        registerToastListener((message, type) => {
            idRef.current += 1;
            const id = idRef.current;
            setToast({ id, message, type });
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                setToast(curr => (curr && curr.id === id ? null : curr));
            }, 3000);
        });
        return () => {
            registerToastListener(null);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    if (!toast) return null;
    return (
        <div className={`toast toast-${toast.type}`}>
            {toast.message}
        </div>
    );
}

export default Toast;
