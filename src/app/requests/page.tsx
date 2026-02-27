"use client";
import { useRouter } from "next/navigation";
import { useCreditsList } from "@/hooks/useCreditsList";
import { StatusBadge } from "@/components/ui/StatusBadge";

const FilterGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">{label}</label>
    {children}
  </div>
);

const ActionButton = ({ title, icon, colorClass, onClick, disabled }: { title: string; icon: React.ReactNode; colorClass: string; onClick?: () => void; disabled?: boolean }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`p-2.5 rounded-2xl transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none ${colorClass}`} 
    title={title}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {icon}
    </svg>
  </button>
);

const NavButton = ({ onClick, disabled, icon }: { onClick: () => void; disabled: boolean; icon: React.ReactNode }) => (
  <button 
    onClick={onClick} 
    disabled={disabled} 
    className="p-3 rounded-xl border border-gray-200 bg-white disabled:opacity-20 hover:bg-gray-50 transition-all flex items-center justify-center shadow-sm"
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {icon}
    </svg>
  </button>
);

export default function ListRequestsPage() {
  const router = useRouter();
  const { 
    data, filters, updateFilter, 
    currentPage, setCurrentPage, totalPages, totalResults, isLoading,
    updateRequestStatus 
  } = useCreditsList();

  const handleStatusChange = async (id: string, nextStatus: number, actionLabel: string) => {
    const confirmed = window.confirm(`¿Está seguro que desea ${actionLabel} esta solicitud?`);
    if (confirmed) {
      await updateRequestStatus(id, nextStatus);
    }
  };
  const statusOptions = [
    { id: 1, label: 'Solicitud Recibida' },
    { id: 2, label: 'Validación de Identidad' },
    { id: 3, label: 'Analizando Perfil Financiero' },
    { id: 4, label: 'En Revisión de Crédito' },
    { id: 5, label: 'Pendiente Aprobación' },
    { id: 6, label: 'Pendiente Firma Pagaré' },
    { id: 7, label: 'Crédito Aprobado' },
    { id: 8, label: 'No Aprobado' }
  ];

  return (
    <div className="w-full animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0f0b36]">Solicitudes</h1>
          <p className="text-gray-500 text-sm">Gestiona el historial y las acciones de créditos.</p>
        </div>
        <div className="bg-[#0f0b36] text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest">
          {isLoading ? "..." : `${totalResults} Registros`}
        </div>
      </header>

      {/* FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <FilterGroup label="País">
          <select 
            value={filters.country} 
            onChange={(e) => updateFilter("country", e.target.value)}
            className="bg-gray-50 p-3.5 rounded-2xl text-sm font-bold text-[#0f0b36] border-none outline-none focus:ring-2 focus:ring-[#0f0b36]/5"
          >
            <option value="">Todos los Países</option>
            <option value="ES">España</option>
            <option value="PT">Portugal</option>
            <option value="IT">Italia</option>
            <option value="MX">México</option>
            <option value="CO">Colombia</option>
            <option value="BR">Brasil</option>
          </select>
        </FilterGroup>

        <FilterGroup label="Estado">
          <select 
            value={filters.status} 
            onChange={(e) => updateFilter("status", e.target.value)}
            className="bg-gray-50 p-3.5 rounded-2xl text-sm font-bold text-[#0f0b36] border-none outline-none focus:ring-2 focus:ring-[#0f0b36]/5"
          >
            <option value="">Todos los Estados</option>
            {statusOptions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </FilterGroup>

        <FilterGroup label="Desde">
          <input 
            type="date" 
            value={filters.start} 
            onChange={(e) => updateFilter("start", e.target.value)}
            className="bg-gray-50 p-3.5 rounded-2xl text-sm font-bold text-[#0f0b36] border-none outline-none"
          />
        </FilterGroup>

        <FilterGroup label="Hasta">
          <input 
            type="date" 
            value={filters.end} 
            onChange={(e) => updateFilter("end", e.target.value)}
            className="bg-gray-50 p-3.5 rounded-2xl text-sm font-bold text-[#0f0b36] border-none outline-none"
          />
        </FilterGroup>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Solicitud</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Fecha</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium">
                    Cargando solicitudes...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium">
                    No se encontraron resultados para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                data.map((req) => (
                  <tr key={req.id} className="hover:bg-[#fcfaff] transition-all group">
                    <td className="px-8 py-7 font-mono text-[11px] text-gray-400 group-hover:text-[#0f0b36]">
                      {req.id.split('-')[0]}...
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-[#0f0b36]">
                          {new Intl.NumberFormat('es-ES').format(Number(req.amount))}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 tracking-tighter">{req.currencyCode}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <StatusBadge statusId={req.currentStatusId} />
                    </td>
                    <td className="px-8 py-7 text-right">
                      <span className="text-xs font-bold text-gray-500">
                        {new Date(req.requestedAt).toLocaleDateString('es-ES')}
                      </span>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center justify-center gap-3">
                        <ActionButton 
                          title="Ver Detalle" 
                          colorClass="hover:bg-blue-50 text-blue-600"
                          onClick={() => router.push(`/requests/${req.id}`)}
                          icon={<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>}
                        />
                        <ActionButton 
                          title="Aprobar Solicitud" 
                          colorClass="hover:bg-emerald-50 text-emerald-600"
                          onClick={() => handleStatusChange(req.id, 7, "APROBAR")}
                          icon={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>}
                        />
                        <ActionButton 
                          title="Rechazar Solicitud" 
                          colorClass="hover:bg-rose-50 text-rose-600"
                          onClick={() => handleStatusChange(req.id, 8, "RECHAZAR")}
                          icon={<><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {!isLoading && data.length > 0 && (
          <div className="p-6 flex items-center justify-between bg-gray-50/30 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Página <span className="text-[#0f0b36]">{currentPage}</span> de {totalPages}
            </span>
            <div className="flex gap-3">
              <NavButton 
                onClick={() => setCurrentPage(p => p - 1)} 
                disabled={currentPage === 1} 
                icon={<polyline points="15 18 9 12 15 6"/>} 
              />
              <NavButton 
                onClick={() => setCurrentPage(p => p + 1)} 
                disabled={currentPage === totalPages} 
                icon={<polyline points="9 18 15 12 9 6"/>} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}