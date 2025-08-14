"use client";

import React from "react";
import { Tabs, Tab, Spinner, Card, CardBody, CardHeader, Divider, Skeleton } from "@heroui/react";
import { useMediaQuery } from "usehooks-ts";
import RegistroCard from "./RegistroCard";
import AutorizacionBuroCard from "./AutorizacionBuroCard";
import AvalesCard from "./AvalesCard";
import DatosConsultasCard from "./DatosConsultasCard";
import ExpedienteAzulCard from "./ExpedienteAzulCard";
import CashflowCard from "./CashflowCard";
import RazonesFinancierasCard from "./RazonesFinancierasCard";
import { useVinculacion } from "@/contexts/VinculacionProvider";

export default function DetalleVinculacionPage() {
  const [expandAll, setExpandAll] = React.useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { loading, error } = useVinculacion();

  const tabs = [
    { key: "buro", title: "Autorización Buró", content: <AutorizacionBuroCard /> },
    { key: "avales", title: "Avales", content: <AvalesCard /> },
    { key: "consulta", title: "Consultas", content: <DatosConsultasCard /> },
    { key: "exp", title: "Expediente Azul", content: <ExpedienteAzulCard /> },
    { key: "cash", title: "CashFlow", content: <CashflowCard /> },
    { key: "raz", title: "Razones Financieras", content: <RazonesFinancierasCard /> },
    { key: "cupos", title: "Cupos", content: <div className="p-3 text-foreground-500">Contenido de Cupos…</div> },
  ] as const;

  const FieldSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-3 w-28 rounded-md" />
      <Skeleton className="h-5 w-48 rounded-md" />
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4 mt-4">
        {/* Header: Detalle de vinculación */}
        <Card
          shadow="sm"
          className="text-left px-3 m-3 dark:border-default-100 border border-default-50 shadow-xl shadow-black/10 dark:shadow-black/40"
        >
          <CardHeader className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-6 rounded-md" />
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-6 w-44 rounded-full" />
            </div>
            <Skeleton className="h-9 w-36 rounded-xl" />
          </CardHeader>

          <Divider className="my-2" />

          <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 6 campos como en la cabecera (razón, RFC, rep., tel, whatsapp, email) */}
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
          </CardBody>
        </Card>

        {/* Layout 2 columnas: sidebar + contenido */}
        <div className="grid grid-cols-12 gap-4 px-3">
          {/* Sidebar de tabs */}
          <div className="col-span-12 md:col-span-3">
            <Card shadow="sm" className="sticky top-3">
              <CardBody className="space-y-3 p-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-xl" />
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Tarjeta: Autorización Buró */}
          <div className="col-span-12 md:col-span-9">
            <Card
              shadow="sm"
              className="text-left px-5 py-2 dark:border-default-100 border border-default-100 shadow-xl shadow-black/20 dark:shadow-black/40"
            >
              <CardHeader className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-md" />
                  <Skeleton className="h-5 w-40 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  {/* chips de estado (3) */}
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>
              </CardHeader>

              <Divider className="my-2" />

              <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Grid de campos como en la tarjeta (12–15 es razonable) */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <FieldSkeleton key={i} />
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card shadow="sm" className="mt-6">
        <CardBody className="text-danger">{error}</CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      <RegistroCard expandAll={expandAll} onToggleExpandAll={() => setExpandAll((v) => !v)} />
      {!expandAll && !isMobile ? (
        <Tabs
          aria-label="Detalle vinculación"
          color="primary"
          variant="solid"
          placement="start"
          classNames={{
            tabList: "sticky top-3 z-10 bg-content1/60 backdrop-blur-sm px-3 rounded-xl",
            tab: "justify-start text-left min-h-11 -mr-1",
          }}
          items={tabs as any}
        >
          {(t: any) => (
            <Tab key={t.key} title={t.title} className="w-full">
              {t.content}
            </Tab>
          )}
        </Tabs>
      ) : (
        <div className="space-y-8">
          {tabs.map((t) => (
            <section key={t.key} className="space-y-3">
              <h3 className="text-medium font-semibold">{t.title}</h3>
              {t.content}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
