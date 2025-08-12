"use client";

import React from "react";
import {
  Card, CardBody, CardHeader, Chip, Skeleton, Tabs, Tab, Divider
} from "@heroui/react";
import RegistroCard from "./RegistroCard";
import AutorizacionBuroCard from "./AutorizacionBuroCard";
import AvalesCard from "./AvalesCard";
import DatosConsultasCard from "./DatosConsultasCard";
import ExpedienteAzulCard from "./ExpedienteAzulCard";
import CashflowCard from "./CashflowCard";
import RazonesFinancierasCard from "./RazonesFinancierasCard";
import { useMediaQuery } from "usehooks-ts";

type Resp = {
  detalleVinculacion: {
    state?: number;
    datosRegistroVinculacion: {
      state?: number;
      rfc?: string;
      razonSocial?: string;
      telefono?: string;
      whatsapp?: string;
      email?: string;
      nombresRepLegal?: string;
      apellidoPaternoRepLegal?: string;
      apellidoMaternoRepLegal?: string;
      TipoContribuyente?: 0 | 1;
    };
  };
};

async function fetchDetalle(id: string): Promise<Resp> {
  const res = await fetch("/mock/GetDetalleVinculacionMock.json", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar");
  return res.json();
}

export default function DetalleVinculacionPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<Resp | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [expandAll, setExpandAll] = React.useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  React.useEffect(() => {
    let on = true;
    (async () => {
      try {
        setLoading(true);
        const json = await fetchDetalle(params.id);
        if (on) setData(json);
      } catch (e: any) {
        setError(e?.message ?? "Error");
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [params.id]);

  const tabs = [
    { key: "buro", title: "Autorización Buró", content: <AutorizacionBuroCard id={params.id} /> },
    { key: "avales", title: "Avales", content: <AvalesCard id={params.id} /> },
    { key: "consulta", title: "Consultas", content: <DatosConsultasCard id={params.id} /> },
    { key: "exp", title: "Expediente Azul", content: <ExpedienteAzulCard id={params.id} /> },
    { key: "cash", title: "CashFlow", content: <CashflowCard id={params.id} /> },
    { key: "raz", title: "Razones Financieras", content: <RazonesFinancierasCard id={params.id} /> },
    { key: "cupos", title: "Cupos", content: <div className="p-3 text-foreground-500">Contenido de Cupos…</div> },
  ] as const;

  return (
    <div className="space-y-6 mt-4">
      <RegistroCard id={params.id} expandAll={expandAll} onToggleExpandAll={() => setExpandAll(v => !v)} />
      {(!expandAll && !isMobile) ? (
        <Tabs
          aria-label="Detalle vinculación"
          color="primary"
          variant="solid"
          placement="start"
          classNames={{
            tabList: "sticky top-3 z-10 bg-content1/60 backdrop-blur-sm px-3 rounded-xl",
            tab: "justify-start text-left min-h-11 -mr-1"
          }}
          items={tabs as any}
        >
          {(t: any) => <Tab key={t.key} title={t.title} className="w-full">{t.content}</Tab>}
        </Tabs>
      ) : (
        // *** Vista expandida: todo apilado (siempre en móvil, o si expandAll) ***
        <div className="space-y-8">
          {tabs.map(t => (
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