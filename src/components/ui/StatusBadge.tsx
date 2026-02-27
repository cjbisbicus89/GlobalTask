"use client";

interface StatusBadgeProps {
  statusId: number;
}

export const StatusBadge = ({ statusId }: StatusBadgeProps) => {
  const config: Record<number, { label: string; dot: string; bg: string; text: string }> = {
    1: { label: "Solicitud Recibida", dot: "bg-blue-400", bg: "bg-blue-50", text: "text-blue-700" },
    2: { label: "Validación de Identidad", dot: "bg-indigo-400", bg: "bg-indigo-50", text: "text-indigo-700" },
    3: { label: "Analizando Perfil Financiero", dot: "bg-purple-400", bg: "bg-purple-50", text: "text-purple-700" },
    4: { label: "En Revisión de Crédito", dot: "bg-cyan-400", bg: "bg-cyan-50", text: "text-cyan-700" },
    5: { label: "Pendiente Aprobación", dot: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-700" },
    6: { label: "Pendiente Firma Pagaré", dot: "bg-orange-400", bg: "bg-orange-50", text: "text-orange-700" },
    7: { label: "Crédito Aprobado", dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
    8: { label: "No Aprobado", dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-700" },
  };

  const status = config[statusId] || { 
    label: "Desconocido", 
    dot: "bg-gray-400", 
    bg: "bg-gray-50", 
    text: "text-gray-600" 
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${status.bg} ${status.text} border border-white/50 shadow-sm whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status.dot} shrink-0`} />
      <span className="text-[10px] font-black uppercase tracking-tight">
        {status.label}
      </span>
    </div>
  );
};