import { useState, useEffect } from 'react';
import { api } from "@/lib/api";

/** * ESTRUCTURA DE DATOS (TIPADO)
 * Se definen interfaces claras para evitar el uso de 'any' y asegurar props claros.
 */
export interface CountryMetric {
  name: string;
  total: number;
  color: string;
}

export interface StatusMetric {
  name: string;
  value: number;
  color: string;
}

export interface AnalyticsData {
  byCountry: CountryMetric[];
  byStatus: StatusMetric[];
  totalCredits: number;
}

// Constantes de mapeo fuera del hook para evitar re-declaraciones en cada render
const COUNTRY_NAMES: Record<string, string> = {
  'ES': 'España', 'PT': 'Portugal', 'IT': 'Italia',
  'MX': 'México', 'CO': 'Colombia', 'BR': 'Brasil'
};

/**
 * LÓGICA DE NEGOCIO (TRANSFORMACIÓN)
 * Función pura encargada de la lógica compleja. 
 * Separada para facilitar pruebas y no ensuciar la UI.
 */
const transformCreditsToMetrics = (credits: any[]): AnalyticsData => {
  const total = credits.length;

  // 1. Agrupar por País
  const countryCounts: Record<string, number> = {};
  credits.forEach((c) => {
    const name = COUNTRY_NAMES[c.countryCode] || c.countryCode;
    countryCounts[name] = (countryCounts[name] || 0) + 1;
  });

  const byCountry = Object.entries(countryCounts)
    .map(([name, total]) => ({
      name,
      total,
      color: name === 'España' ? '#0f0b36' : '#ff7a3d'
    }))
    .sort((a, b) => b.total - a.total);

  // 2. Agrupar por Estado (7: Aprobado, 8: Rechazado, Otros: En Proceso)
  const stats = { approved: 0, rejected: 0, process: 0 };
  credits.forEach((c) => {
    if (c.currentStatusId === 7) stats.approved++;
    else if (c.currentStatusId === 8) stats.rejected++;
    else stats.process++;
  });

  const byStatus = [
    { name: 'Aprobados', value: Math.round((stats.approved / total) * 100) || 0, color: '#10b981' },
    { name: 'En Proceso', value: Math.round((stats.process / total) * 100) || 0, color: '#f59e0b' },
    { name: 'Rechazados', value: Math.round((stats.rejected / total) * 100) || 0, color: '#ef4444' },
  ];

  return { byCountry, byStatus, totalCredits: total };
};

/**
 * HOOK PERSONALIZADO
 * Maneja únicamente el estado, el ciclo de vida y la obtención de datos.
 */
export const useAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Flag para evitar actualizaciones de estado en componentes desmontados
    let isMounted = true;

    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/credits?start=2026-01-01&end=2026-12-31');
        
        if (isMounted && response.data?.success) {
          // La lógica pesada se delega a la función pura
          const metrics = transformCreditsToMetrics(response.data.data);
          setData(metrics);
        }
      } catch (err) {
        if (isMounted) {
          setError("Error al procesar las métricas operativas.");
          console.error("Fetch Analytics Error:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMetrics();

    // Cleanup: Previene mutaciones directas y errores de memoria
    return () => { isMounted = false; };
  }, []);

  return { data, loading, error };
};