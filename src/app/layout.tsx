import "./globals.css";
import Sidebar from "@/components/ui/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-white text-[#0f0b36] antialiased">
        {/* HEADER SUPERIOR: Logo globaltask a la izquierda */}
        <header className="fixed top-0 w-full h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 z-50">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="globaltask" className="h-8" /> 
            <span className="font-bold text-xl tracking-tighter">Creditos</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium">
         
            <a href="#" className="text-gray-600">Salir</a>
            <button className="border border-[#ff7a3d] text-[#ff7a3d] px-4 py-2 rounded-lg font-bold"></button>
          </nav>
        </header>

        <div className="flex pt-20">
          {/* SIDEBAR: Menú lateral izquierdo */}
          <Sidebar />
          
          {/* CONTENIDO: Donde se renderizan las páginas */}
          <main className="flex-1 ml-64 p-12">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}