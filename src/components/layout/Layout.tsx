import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type LayoutProps = {
  children: React.ReactNode;
};

/**
 * Layout component - wraps pages with consistent navigation and footer
 * Tokens-first styling, responsive design
 */
function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;