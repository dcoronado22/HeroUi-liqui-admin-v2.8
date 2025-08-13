"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  Tab,
  Input,
  Chip,
  Accordion,
  AccordionItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
  cn,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";

// =====================
// Types
// =====================
export type LogRow = {
  service: string;
  startAt: string | Date;
  endAt: string | Date;
  status: string; // "Exitoso", "Fallido", "Parcial", etc.
  reason?: string;
};

export type DocumentFile = {
  name: string;
  updatedAt: string | Date;
  path: string;
  onView?: () => void; // opcional; si no viene, usaremos fetchFileText
};

export type DocumentGroup = {
  provider: string; // e.g. "miFiel", "mega", "expedienteAzul"
  files: DocumentFile[];
  defaultOpen?: boolean;
};

export type FetchLogsParams = {
  query: string;
  page: number;
  pageSize: number;
  context?: { type?: string; id?: string | number;[k: string]: any };
};

export type FetchDocumentsParams = {
  context?: { type?: string; id?: string | number;[k: string]: any };
};

export type LogsViewerModalProps = {
  /** Title of the modal */
  title?: string;
  /** Initial selected tab */
  initialTab?: "logs" | "documents";
  /** Default search text */
  defaultQuery?: string;
  /** Page size for logs (purely client-side here, but passed to your fetcher) */
  pageSize?: number;
  /** Locale for date formatting */
  dateLocale?: string; // default "es-CO"
  /** DateTimeFormat options */
  dateFormatOptions?: Intl.DateTimeFormatOptions;
  /** Fetchers provided by parent */
  fetchLogs: (p: FetchLogsParams) => Promise<LogRow[]>;
  fetchDocuments: (p: FetchDocumentsParams) => Promise<DocumentGroup[]>;
  /** Fetch combinado opcional que retorna logs y documentos en una sola llamada */
  fetchAll?: (p: FetchLogsParams) => Promise<{ logs: LogRow[]; documents: DocumentGroup[] }>;
  /** Obtener el contenido del archivo para el visor */
  fetchFileText?: (args: {
    path: string;
    name: string;
    provider?: string;
    context?: FetchLogsParams["context"];
  }) => Promise<string>;
  /** Optional external context you can pass when opening */
  context?: FetchLogsParams["context"];
  /** Optional className for ModalContent */
  className?: string;
};

export type LogsViewerModalHandle = {
  open: (ctx?: FetchLogsParams["context"]) => void;
  close: () => void;
  setTab: (t: "logs" | "documents") => void;
  setQuery: (q: string) => void;
};

// =====================
// Helpers
// =====================
const statusToColor = (status: string): "success" | "danger" | "warning" | "default" => {
  const s = status.toLowerCase();
  if (/(exito|éxito|ok|success)/.test(s)) return "success";
  if (/(error|fail|fallido|failed)/.test(s)) return "danger";
  if (/(parcial|warn|warning)/.test(s)) return "warning";
  return "default";
};

const fmtDate = (
  d: string | Date,
  locale: string,
  opts: Intl.DateTimeFormatOptions
) => new Intl.DateTimeFormat(locale, opts).format(typeof d === "string" ? new Date(d) : d);

// =====================
// Component
// =====================
const DEFAULT_DATE_OPTS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
};

export default React.forwardRef<LogsViewerModalHandle, LogsViewerModalProps>(function LogsViewerModal(
  {
    title = "Logs de Vinculación",
    initialTab = "logs",
    defaultQuery = "",
    pageSize = 50,
    dateLocale = "es-CO",
    dateFormatOptions = DEFAULT_DATE_OPTS,
    fetchLogs,
    fetchDocuments,
    fetchAll,
    fetchFileText,
    context,
    className,
  },
  ref
) {
  const disclosure = useDisclosure();
  const [tab, setTab] = React.useState<"logs" | "documents">(initialTab);
  const [query, setQuery] = React.useState<string>(defaultQuery);
  const [page, setPage] = React.useState<number>(1);
  const [isLoadingLogs, setIsLoadingLogs] = React.useState<boolean>(false);
  const [isLoadingDocs, setIsLoadingDocs] = React.useState<boolean>(false);
  const [logs, setLogs] = React.useState<LogRow[]>([]);
  const [groups, setGroups] = React.useState<DocumentGroup[]>([]);
  const [allLogs, setAllLogs] = React.useState<LogRow[]>([]);
  const [allGroups, setAllGroups] = React.useState<DocumentGroup[]>([]);
  const [hasLoaded, setHasLoaded] = React.useState<boolean>(false);
  const ctxRef = React.useRef<LogsViewerModalProps["context"] | undefined>(context);

  // JSON Viewer state
  const viewer = useDisclosure();
  const [viewerTitle, setViewerTitle] = React.useState<string>("");
  const [viewerText, setViewerText] = React.useState<string>("");
  const [viewerLoading, setViewerLoading] = React.useState<boolean>(false);

  // Imperative API
  React.useImperativeHandle(
    ref,
    (): LogsViewerModalHandle => ({
      open: (ctx) => {
        if (ctx) ctxRef.current = { ...(ctxRef.current ?? {}), ...ctx };
        disclosure.onOpen();
        loadAll(query, 1);
      },
      close: () => disclosure.onClose(),
      setTab: (t) => setTab(t),
      setQuery: (q) => setQuery(q),
    }),
    [disclosure, query]
  );

  // Debounced search for Logs (filtrado local, sin nuevo fetch)
  const debounceRef = React.useRef<number | undefined>(undefined);
  React.useEffect(() => {
    if (!disclosure.isOpen) return;
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      // Filtrar localmente por servicio (case-insensitive)
      const q = query.trim().toLowerCase();
      const filtered = q
        ? allLogs.filter((r) => (r.service || "").toLowerCase().includes(q))
        : allLogs;
      setLogs(filtered);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(debounceRef.current);
  }, [query, allLogs, disclosure.isOpen]);

  const loadAll = async (q: string, p: number) => {
    try {
      setIsLoadingLogs(true);
      setIsLoadingDocs(true);
      if (fetchAll) {
        const { logs: l, documents: d } = await fetchAll({ query: q, page: p, pageSize, context: ctxRef.current });
        setAllLogs(l);
        setLogs(l);
        setAllGroups(d);
        setGroups(d);
      } else {
        const [l, d] = await Promise.all([
          fetchLogs({ query: q, page: p, pageSize, context: ctxRef.current }),
          fetchDocuments({ context: ctxRef.current }),
        ]);
        setAllLogs(l);
        setLogs(l);
        setAllGroups(d);
        setGroups(d);
      }
      setPage(p);
      setHasLoaded(true);
    } finally {
      setIsLoadingLogs(false);
      setIsLoadingDocs(false);
    }
  };

  // No refetch on tab change; datos ya están en memoria

  // Resetear estado cuando el modal se cierra y volver al primer tab
  const wasOpenRef = React.useRef<boolean>(false);
  React.useEffect(() => {
    if (wasOpenRef.current && !disclosure.isOpen) {
      setTab("logs");
      setQuery(defaultQuery);
      setPage(1);
      setLogs([]);
      setGroups([]);
      setAllLogs([]);
      setAllGroups([]);
      setHasLoaded(false);
      viewer.onClose();
      setViewerTitle("");
      setViewerText("");
      setViewerLoading(false);
      ctxRef.current = context;
    }
    wasOpenRef.current = disclosure.isOpen;
  }, [disclosure.isOpen, defaultQuery, context]);

  const handleViewFile = async (provider: string, f: DocumentFile) => {
    // Si el archivo ya trae su propio onView, úsalo
    if (f.onView) return f.onView();
    try {
      setViewerTitle(`${provider} / ${f.name}`);
      setViewerText("");
      viewer.onOpen();
      setViewerLoading(true);
      let text = "";
      if (fetchFileText) {
        text = await fetchFileText({ path: f.path, name: f.name, provider, context: ctxRef.current });
      } else {
        // fallback: intenta leer desde /mock
        const safe = f.path.startsWith("/") ? f.path : `/mock/${f.path}`;
        const res = await fetch(safe, { cache: "no-store" });
        if (!res.ok) throw new Error("No se pudo cargar el archivo");
        text = await res.text();
      }
      // intenta pretty JSON
      try {
        const obj = JSON.parse(text);
        text = JSON.stringify(obj, null, 2);
      } catch {
        // deja el texto como venga
      }
      setViewerText(text);
    } catch (e: any) {
      setViewerText(`Error: ${e?.message ?? e}`);
    } finally {
      setViewerLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(viewerText);
    } catch { }
  };

  const downloadFile = () => {
    const blob = new Blob([viewerText], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = viewerTitle.replace(/[^a-z0-9._-]+/gi, "_") || "file.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Fix: render condicional para evitar overlays pegados y bloquear scroll manualmente */}
      {disclosure.isOpen && (
        <Modal
          isOpen={disclosure.isOpen}
          scrollBehavior="inside"
          onOpenChange={disclosure.onOpenChange}
          shouldBlockScroll={false}
        >
          <ModalContent className={cn("max-w-[1200px]", className)}>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <span className="text-xl font-semibold">{title}</span>
                </ModalHeader>

                <ModalBody>
                  <Tabs selectedKey={tab} size="md" color="primary" variant="bordered" onSelectionChange={(k) => setTab(k as any)} className="px-1">
                    <Tab key="logs" title="Logs">
                      <div className="flex flex-col gap-3">
                        <Input
                          isClearable
                          placeholder="Buscar por servicio..."
                          startContent={<Icon icon="solar:magnifer-linear" className="text-default-500" />}
                          value={query}
                          onValueChange={setQuery}
                        />

                        <div className="rounded-medium border border-default-200 overflow-hidden">
                          <div className="max-h-[47vh] overflow-auto">
                            <Table removeWrapper aria-label="Tabla de logs" classNames={{ th: "bg-default-100" }}>
                              <TableHeader>
                                <TableColumn>Servicio</TableColumn>
                                <TableColumn>Inicio</TableColumn>
                                <TableColumn>Fin</TableColumn>
                                <TableColumn>Estado</TableColumn>
                                <TableColumn>Razón</TableColumn>
                              </TableHeader>
                              <TableBody
                                emptyContent={isLoadingLogs ? "Cargando..." : "Sin resultados"}
                                isLoading={isLoadingLogs}
                                loadingContent={<div className="flex flex-col items-center justify-center mt-15 w-full">
                                  <Spinner label="Cargando..." />
                                </div>}
                              >
                                {logs.map((row, i) => (
                                  <TableRow key={i}>
                                    <TableCell className="font-medium">{row.service}</TableCell>
                                    <TableCell>{fmtDate(row.startAt, dateLocale, dateFormatOptions)}</TableCell>
                                    <TableCell>{fmtDate(row.endAt, dateLocale, dateFormatOptions)}</TableCell>
                                    <TableCell>
                                      <Chip size="sm" variant="flat" color={statusToColor(row.status)}>
                                        {row.status}
                                      </Chip>
                                    </TableCell>
                                    <TableCell className="text-default-600">{row.reason ?? "—"}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    </Tab>

                    <Tab key="documents" title="Documentos">
                      <div className="flex flex-col gap-3">
                        <div className="rounded-medium border border-default-200 overflow-hidden">
                          <div className="max-h-[60vh] overflow-auto p-2">
                            {isLoadingDocs && <div className="flex flex-col items-center justify-center mt-20 w-full">
                              <Spinner label="Cargando..." />
                            </div>}
                            {!isLoadingDocs && groups.length === 0 && (
                              <div className="text-default-500 p-2">Sin documentos</div>
                            )}
                            <Accordion selectionMode="multiple" variant="light" className="mx-2">
                              {groups.map((g, idx) => (
                                <AccordionItem
                                  key={g.provider + idx}
                                  title={g.provider}
                                  aria-label={g.provider}
                                  startContent={<Icon icon="solar:folder-2-linear" width={18} height={18} />}
                                >
                                  <Table removeWrapper aria-label={`Archivos de ${g.provider}`}>
                                    <TableHeader>
                                      <TableColumn>Nombre</TableColumn>
                                      <TableColumn>Fecha Última Modificación</TableColumn>
                                      <TableColumn align="end">Acciones</TableColumn>
                                    </TableHeader>
                                    <TableBody emptyContent="Sin archivos">
                                      {g.files.map((f, fi) => (
                                        <TableRow key={fi}>
                                          <TableCell className="font-medium">{f.name}</TableCell>
                                          <TableCell>{fmtDate(f.updatedAt, dateLocale, dateFormatOptions)}</TableCell>
                                          <TableCell className="flex justify-end">
                                            <Button
                                              size="sm"
                                              variant="shadow"
                                              color="primary"
                                              startContent={<Icon icon="heroicons:magnifying-glass-16-solid" />}
                                              onPress={() => handleViewFile(g.provider, f)}
                                            >
                                              Ver
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </div>
                        </div>
                      </div>
                    </Tab>
                  </Tabs>
                </ModalBody>

                <ModalFooter>
                  <Button variant="ghost" color="danger" onPress={onClose}>
                    Cerrar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}

      {/* Viewer Modal (condicional para evitar overlays pegados) */}
      {viewer.isOpen && (
        <Modal isOpen={viewer.isOpen} onOpenChange={viewer.onOpenChange} scrollBehavior="inside" shouldBlockScroll={false}>
          <ModalContent className="max-w-[900px]">
            {(onClose) => (
              <>
                <ModalHeader className="flex items-center justify-between gap-2">
                  <span className="text-medium font-semibold truncate">{viewerTitle}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="flat" onPress={copyToClipboard} startContent={<Icon icon="solar:copy-linear" />}>
                      Copiar
                    </Button>
                    <Button size="sm" variant="flat" onPress={downloadFile} startContent={<Icon icon="solar:download-linear" />}>
                      Descargar
                    </Button>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {viewerLoading ? (
                    <div className="text-default-500">Cargando archivo…</div>
                  ) : (
                    <pre className="bg-default-100 rounded-medium p-3 text-xs overflow-auto max-h-[70vh] whitespace-pre-wrap break-words">
                      {viewerText}
                    </pre>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Cerrar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
});