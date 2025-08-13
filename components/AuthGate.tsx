"use client";
import React from "react";
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { useAuthStore } from "@liquicapital/common";
import LoginComponent from "@/components/LoginComponent";

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const { login } = useAuthStore();

    const handleLogin = React.useCallback(
        () => login("/"),
        [login]
    );

    return (
        <>
            <UnauthenticatedTemplate>
                <LoginComponent login={handleLogin} />
            </UnauthenticatedTemplate>
            <AuthenticatedTemplate>{children}</AuthenticatedTemplate>
        </>
    );
}