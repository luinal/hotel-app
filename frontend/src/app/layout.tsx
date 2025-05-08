import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';

// Carrega a fonte Inter usando o sistema de fontes do Next.js
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
    <html lang="pt-BR">
      <body className={inter.className}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar position="sticky" color="default" elevation={1}>
              <Toolbar>
                <Typography marginLeft={8} fontSize={28} variant="h6" component="h1" color="primary" fontWeight={700} sx={{ flexGrow: 1 }}>
                  HotelApp
                </Typography>
                {/* Espaço para navegação futura, se necessário */}
              </Toolbar>
            </AppBar>
            <Box component="main" sx={{ py: { xs: 4, sm: 6 } }}>
              {/* O conteúdo da página será inserido aqui */}
              {children}
            </Box>
            <Box component="footer" sx={{ bgcolor: 'grey.900', borderTop: 1, borderColor: 'grey.800', mt: 6 }}>
              <Container sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  © {new Date().getFullYear()} HotelApp. Todos os direitos reservados.
                </Typography>
              </Container>
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
