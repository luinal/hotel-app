import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "HotelApp - Encontre seu Quarto Ideal",
  description: "Busque e filtre quartos de hotel com facilidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="antialiased">
      <body className={`${inter.className} bg-black text-slate-100`}>
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                HotelApp
              </h1>
              {/* Espaço para navegação futura, se necessário */}
            </div>
          </div>
        </header>
        <main className="py-8 sm:py-12">
          {/* O conteúdo da página será inserido aqui */}
          {children}
        </main>
        <footer className="bg-slate-800 border-t border-slate-700 mt-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} HotelApp. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
