import React from "react";

// 1. Contenedor de sección (Card)
export const InfoCard = ({ 
  title, 
  children, 
  iconColor = "bg-blue-600" 
}: { 
  title: string; 
  children: React.ReactNode; 
  iconColor?: string;
}) => (
  <section className="bg-white rounded-[50px] border border-gray-100 p-14 shadow-[0_30px_80px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_40px_90px_rgba(0,0,0,0.05)]">
    <h2 className="text-[12px] font-black uppercase tracking-[0.25em] text-gray-400 mb-14 flex items-center gap-5">
      <span className={`w-2.5 h-10 ${iconColor} rounded-full`} /> 
      {title}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-14 gap-x-24">
      {children}
    </div>
  </section>
);

// 2. Item de detalle estándar
export const DetailItem = ({ 
  label, 
  value, 
  isMono = false 
}: { 
  label: string; 
  value?: string | null; 
  isMono?: boolean;
}) => (
  <div className="space-y-4">
    <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.15em]">{label}</p>
    <p className={`text-2xl font-bold text-[#0f0b36] leading-tight ${isMono ? 'font-mono text-sm break-all bg-gray-50 p-4 rounded-2xl' : ''}`}>
      {value || "—"}
    </p>
  </div>
);

// 3. Métrica financiera resaltada (Para montos e ingresos)
export const FinancialMetric = ({ 
  label, 
  amount, 
  currency 
}: { 
  label: string; 
  amount: string | number; 
  currency: string;
}) => (
  <div className="p-12 bg-[#fcfcfd] rounded-[45px] border border-gray-100/80 group hover:bg-white hover:border-[#ff7a3d]/20 transition-all duration-500">
    <p className="text-[11px] font-black text-gray-400 uppercase mb-6 tracking-[0.2em]">{label}</p>
    <div className="flex items-baseline gap-4">
      <p className="text-7xl font-black text-[#0f0b36] tracking-tighter group-hover:text-[#ff7a3d] transition-colors">
        {new Intl.NumberFormat('es-ES').format(Number(amount))}
      </p>
      <p className="text-2xl font-black text-gray-300 uppercase">{currency}</p>
    </div>
  </div>
);

// 4. Item de la línea de tiempo (History)
export const HistoryItem = ({ 
  message, 
  date, 
  isFirst 
}: { 
  message: string; 
  date: string; 
  isFirst: boolean;
}) => (
  <div className="flex gap-10 group">
    <div className="flex flex-col items-center">
      <div className={`w-7 h-7 rounded-full border-[6px] border-white shadow-xl transition-transform group-hover:scale-125 ${isFirst ? 'bg-[#ff7a3d] ring-8 ring-[#ff7a3d]/10' : 'bg-gray-200'}`} />
      <div className="w-[3px] flex-grow bg-gray-50 mt-3 group-last:hidden" />
    </div>
    <div className="pb-14">
      <p className={`text-2xl font-black tracking-tight ${isFirst ? 'text-[#0f0b36]' : 'text-gray-400'}`}>
        {message}
      </p>
      <p className="text-xs font-black text-gray-300 uppercase tracking-[0.1em] mt-3">
        {new Date(date).toLocaleString('es-ES', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </p>
    </div>
  </div>
);