"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MsalProvider } from "@azure/msal-react";
import { AuthService } from "@liquicapital/common";
import { ToastProvider } from "@heroui/react";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    AuthService.initialize()
      .catch(console.error)
      .finally(() => setReady(true));
  }, []);

  if (!ready) return null;
  return (
    <MsalProvider instance={AuthService.msalInstance as any}>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>
          <ToastProvider />
          {children}
        </NextThemesProvider>
      </HeroUIProvider>
    </MsalProvider>
  );
}
