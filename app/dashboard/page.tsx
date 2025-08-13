"use client";

import { useMsal } from "@azure/msal-react";
import React from "react";

export default function DashboardPage() {
  const { instance, accounts, inProgress } = useMsal();
  const account = instance.getActiveAccount() || accounts[0];

  if (!account) return <div>Debes iniciar sesión</div>;
  return <div>Hola, {account.name}</div>;

}