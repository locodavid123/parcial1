import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext"; // Importar el CartProvider

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mi Tienda Online",
  description: "Proyecto de e-commerce",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <CartProvider>{children}</CartProvider> {/* Envolver la aplicación con el provider */}
      </body>
    </html>
  );
}