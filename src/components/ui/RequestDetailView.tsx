"use client";
import { useRouter } from "next/navigation";
import { useCreditDetail } from "@/hooks/useCreditDetail";
import { InfoCard, DetailItem, FinancialMetric } from "./DetailComponents";

interface RequestDetailViewProps {
  id: string;
}

export const RequestDetailView = ({ id }: RequestDetailViewProps) => {
  const router = useRouter();
  const { data, loading, error } = useCreditDetail(id);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-8 border-gray-100 border-t-[#0f0b36] rounded-full animate-spin mx-auto mb-6" />
        <p className="font-black text-[#0f0b36] tracking-[0.4em] text-[10px] uppercase">Cargando Expediente</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="p-20 text-center">
      <p className="text-red-500 font-black uppercase tracking-widest">{error || "Error de conexión"}</p>
    </div>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* HEADER GIGANTE */}
      <header className="mb-16">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 hover:text-[#ff7a3d] mb-10 group transition-all"
        >
          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm group-hover:bg-[#ff7a3d] group-hover:text-white transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"/></svg>
          </div>
          Volver al centro de gestión
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <h1 className="text-7xl font-black text-[#0f0b36] tracking-tight leading-none">
              Detalle <span className="text-gray-300"> {data.piiData.docNumber}</span>
            </h1>
            <p className="text-gray-400 font-mono text-sm tracking-[0.1em] uppercase">Global Tracking ID: {data.id}</p>
          </div>
          <div className="flex items-center gap-6 bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="text-right px-4">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Estado Operativo</p>
              <p className="text-xl font-black text-[#0f0b36] uppercase">{data.status.nameUser}</p>
            </div>
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* COLUMNA IZQUIERDA: CONTENIDO */}
        <div className="lg:col-span-8 space-y-12">
          
          <InfoCard title="Información del Solicitante" iconColor="bg-indigo-600">
            <DetailItem label="Nombre Completo" value={data.piiData.fullName} />
            <DetailItem label="Identificación" value={`${data.piiData.docType} ${data.piiData.docNumber}`} />
            <DetailItem label="Email" value={data.piiData.email} />
            <DetailItem label="Telefono" value={data.piiData.phone} />
          </InfoCard>

          <section className="bg-white rounded-[50px] border border-gray-100 p-14 shadow-[0_30px_80px_rgba(0,0,0,0.03)]">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400 mb-14">Métricas Financieras</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <FinancialMetric label="Monto solicitado" amount={data.amount} currency={data.currencyCode} />
              <FinancialMetric label="Ingreso Comprobable" amount={data.monthlyIncome} currency={data.currencyCode} />
            </div>
          </section>

          <section className="bg-white rounded-[50px] border border-gray-100 p-14 shadow-[0_30px_80px_rgba(0,0,0,0.03)]">
             <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400 mb-14 text-center">Historial de estados</h2>
             <div className="max-w-xl mx-auto space-y-12">
                {data.history.map((h: any, idx: number) => (
                  <div key={h.idHistory} className="flex gap-10">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full border-4 border-white shadow-md ${idx === 0 ? 'bg-[#ff7a3d] scale-125' : 'bg-gray-200'}`} />
                      {idx !== data.history.length - 1 && <div className="w-[3px] h-20 bg-gray-50 mt-2" />}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-[#0f0b36]">{h.metadata.message}</p>
                      <p className="text-xs font-black text-gray-300 uppercase tracking-widest mt-2">
                        {new Date(h.changedAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))}
             </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: SNAPSHOT */}
        <aside className="lg:col-span-4">
          <div className="sticky top-10 space-y-8">
            <div className="bg-[#0f0b36] rounded-[60px] p-14 text-white shadow-2xl shadow-[#0f0b36]/30">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-12 text-center">Metadata de Auditoría</p>
              
              <div className="space-y-10">
                <div className="flex justify-between items-center border-b border-white/10 pb-6">
                  <span className="text-[10px] font-black text-white/40 uppercase">País</span>
                  <span className="text-lg font-bold">{data.countryCode}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-6">
                  <span className="text-[10px] font-black text-white/40 uppercase">Currency</span>
                  <span className="text-lg font-bold">{data.currencyCode}</span>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-[#ff7a3d] uppercase tracking-widest">Detalle de la solicitud</p>
                  <p className="text-lg font-medium italic text-white/80 leading-relaxed">
                    "{data.status.userDescription}"
                  </p>
                </div>
              </div>

              <button className="w-full mt-14 bg-[#ff7a3d] hover:bg-[#ff8b57] text-white font-black uppercase tracking-[0.2em] py-6 rounded-3xl transition-all active:scale-95 shadow-lg shadow-[#ff7a3d]/20">
                Imprimir Expediente
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-[40px] p-10 border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Referencia Externa</p>
               <code className="text-xs font-mono text-gray-400 break-all">{data.externalReferenceId || 'NULL_REFERENCE_KEY'}</code>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};