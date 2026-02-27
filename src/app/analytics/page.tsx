"use client";

import { useState, useEffect } from 'react';
import { api } from "@/lib/api";

interface CountryMetric {
  name: string;
  total: number;
  percentage: number;
  color: string;
}

interface StatusMetric {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsData {
  byCountry: CountryMetric[];
  byStatus: StatusMetric[];
  totalCredits: number;
}


const COUNTRY_NAMES: Record<string, string> = {
  'ES': 'España', 'PT': 'Portugal', 'IT': 'Italia',
  'MX': 'México', 'CO': 'Colombia', 'BR': 'Brasil'
};


const CountryBar = ({ name, total, percentage, color }: CountryBarProps) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end">
      <span className="text-lg font-bold text-[#0f0b36]">{name}</span>
      <span className="text-sm font-black text-gray-400">{total} Solicitudes</span>
    </div>
    <div className="w-full h-4 bg-gray-50 rounded-full overflow-hidden">
      <div 
        className="h-full transition-all duration-1000 ease-out"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const StatusColumn = ({ name, value, color }: StatusMetric) => (
  <div className="flex-1 flex flex-col items-center gap-4">
    <div className="w-full bg-gray-50 rounded-3xl flex items-end overflow-hidden h-48">
      <div 
        className="w-full transition-all duration-1000 shadow-lg"
        style={{ height: `${value}%`, backgroundColor: color }}
      />
    </div>
    <div className="text-center">
      <p className="text-2xl font-black text-[#0f0b36]">{value}%</p>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{name}</p>
    </div>
  </div>
);

const useAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMetrics = async () => {
      try {
        const response = await api.get('/credits?start=2026-01-01&end=2026-12-31');
        const credits = response.data.data;

        if (isMounted) {
         
          const countryCounts: Record<string, number> = {};
          credits.forEach((c: any) => {
            const name = COUNTRY_NAMES[c.countryCode] || c.countryCode;
            countryCounts[name] = (countryCounts[name] || 0) + 1;
          });

          const maxVal = Math.max(...Object.values(countryCounts)) || 1;
          const byCountry = Object.entries(countryCounts).map(([name, total]) => ({
            name,
            total,
            percentage: (total / maxVal) * 100,
            color: name === 'España' ? '#0f0b36' : '#ff7a3d'
          })).sort((a, b) => b.total - a.total);

          const stats = { approved: 0, rejected: 0, process: 0 };
          credits.forEach((c: any) => {
            if (c.currentStatusId === 7) stats.approved++;
            else if (c.currentStatusId === 8) stats.rejected++;
            else stats.process++;
          });

          const total = credits.length || 1;
          const byStatus = [
            { name: 'Aprobados', value: Math.round((stats.approved / total) * 100), color: '#10b981' },
            { name: 'En Proceso', value: Math.round((stats.process / total) * 100), color: '#f59e0b' },
            { name: 'Rechazados', value: Math.round((stats.rejected / total) * 100), color: '#ef4444' },
          ];

          setData({ byCountry, byStatus, totalCredits: credits.length });
        }
      } catch (err) {
        if (isMounted) setError("Error al sincronizar métricas operativas.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMetrics();
    return () => { isMounted = false; };
  }, []);

  return { data, loading, error };
};


export default function AnalyticsPage() {
  const { data, loading, error } = useAnalytics();

  if (loading) return (
    <div className="flex h-screen items-center justify-center font-black text-[#0f0b36] animate-pulse uppercase tracking-[0.3em]">
      Analizando Datos de Créditos...
    </div>
  );

  if (error || !data) return (
    <div className="flex h-screen items-center justify-center text-red-500 font-black uppercase">
      {error}
    </div>
  );

  return (
    <div className="p-10 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-12">
        <h1 className="text-5xl font-black text-[#0f0b36] tracking-tight">Métricas Operativas</h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">
          GlobalTask Fintech • {data.totalCredits} Solicitudes en 2026 
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* GRÁFICA: POR PAÍS */}
        <section className="bg-white rounded-[50px] p-12 border border-gray-100 shadow-sm">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-10 flex items-center gap-3">
            <span className="w-2 h-6 bg-[#0f0b36] rounded-full" />
           Solicitudes por pais
          </h2>
          <div className="space-y-8">
            {data.byCountry.map((item) => (
              <CountryBar key={item.name} {...item} />
            ))}
          </div>
        </section>

        {/* GRÁFICA: POR ESTADO */}
        <section className="bg-white rounded-[50px] p-12 border border-gray-100 shadow-sm">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-10 flex items-center gap-3">
            <span className="w-2 h-6 bg-[#ff7a3d] rounded-full" />
           solicitudes por estado
          </h2>
          <div className="flex items-end justify-center h-64 gap-10">
            {data.byStatus.map((status) => (
              <StatusColumn key={status.name} {...status} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}


interface CountryBarProps extends CountryMetric {}