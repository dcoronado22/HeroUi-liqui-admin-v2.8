"use client";
import React from "react";
import { setApiErrorHandler, setUnauthorizedHandler } from "@/lib/api/client";
import { useAuthStore } from "@liquicapital/common";
import { addToast } from "@heroui/toast"

export default function ApiProvider({ children }: { children: React.ReactNode }) {
    const { logout } = useAuthStore();

    React.useEffect(() => {
        setApiErrorHandler((msg) => {
            addToast({
                title: "Error",
                description: msg,
                color: "danger",
            })
        });

        setUnauthorizedHandler(() => {
            // Sesión expirada/no autorizada: por ejemplo redirigir al login
            logout("/");
        });
    }, [logout]);

    return <>{children}</>;
}