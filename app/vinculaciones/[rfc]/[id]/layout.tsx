import { VinculacionProvider } from "@/contexts/VinculacionProvider";

export default function DetalleVinculacionLayout({
  params,
  children,
}: {
  params: { id: string; rfc: string };
  children: React.ReactNode;
}) {
  const { id, rfc } = params;
  return (
    <VinculacionProvider id={id} rfc={rfc} prefetch={false}>
      <section className="flex flex-col items-left justify-left">
        <div className="inline-block max-w-full text-center justify-center">
          {children}
        </div>
      </section>
    </VinculacionProvider>
  );
}
