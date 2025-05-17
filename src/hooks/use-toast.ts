
import { useState, useEffect } from "react";

export type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = ({
    title,
    description,
    action,
    variant = "default",
  }: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, title, description, action, variant }]);
    return id;
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    toast,
    dismiss,
  };
};

export const toast = ({
  title,
  description,
  action,
  variant = "default",
}: Omit<ToastProps, "id">) => {
  const event = new CustomEvent("toast", {
    detail: {
      title,
      description,
      action,
      variant,
    },
  });
  document.dispatchEvent(event);
};
