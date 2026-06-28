export type ToastType = "success" | "error";

type ToastListener = (message: string, type: ToastType) => void;

let listener: ToastListener | null = null;

// The <Toast /> component registers itself here; showToast can then be called
// from anywhere (event handlers, plain functions) to surface a toast.
export function registerToastListener(l: ToastListener | null) {
    listener = l;
}

export function showToast(message: string, type: ToastType = "success") {
    listener?.(message, type);
}
