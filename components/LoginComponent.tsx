"use client";
import { Button, Card, CardBody } from "@heroui/react";

export default function LoginComponent({ login }: { login: (redirectUri?: string) => Promise<void> | void }) {
    return (
        <div className="grid min-h-dvh grid-cols-1 md:grid-cols-2">
            <div className="flex items-center justify-center p-8 bg-background">
                <Card className="w-full max-w-md">
                    <CardBody className="gap-4">
                        <h1 className="text-2xl font-semibold text-center">Inicia sesión</h1>
                        <p className="text-default-500 text-center">Usa tu cuenta de Microsoft para continuar</p>
                        <Button size="lg" onPress={() => login("/")}>
                            Iniciar sesión con Microsoft
                        </Button>
                    </CardBody>
                </Card>
            </div>
            <div className="hidden md:flex items-center justify-center bg-primary text-primary-foreground p-8">
                <div className="max-w-lg text-center space-y-2">
                    <h2 className="text-3xl font-semibold">Gestiona y visualiza tu información</h2>
                    <p>Todas las operaciones, desde un solo lugar.</p>
                </div>
            </div>
        </div>
    );
}