// src/components/ui/Sidebar.tsx
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 fixed left-0 h-[calc(100vh-64px)] bg-white border-r border-gray-100 p-6">
      <nav className="flex flex-col gap-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Menú Principal</p>

        <Link href="/analytics" className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold hover:bg-orange-50 hover:text-[#ff7a3d] transition-all group">
          <span className="text-lg group-hover:scale-110 transition-transform">📊</span>
          Métricas y dashboards
        </Link>
        
        <Link href="/requests/new" className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold hover:bg-orange-50 hover:text-[#ff7a3d] transition-all group">
          <span className="text-lg group-hover:scale-110 transition-transform">＋</span>
          Crear solicitud
        </Link>

        <Link href="/requests" className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold hover:bg-orange-50 hover:text-[#ff7a3d] transition-all group">
          <span className="text-lg group-hover:scale-110 transition-transform">☰</span>
          Listar solicitudes
        </Link>
      </nav>
    </aside>
  );
}