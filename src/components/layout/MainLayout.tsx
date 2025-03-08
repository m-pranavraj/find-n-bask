
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
  footerBackground?: boolean;
}

const MainLayout = ({ children, footerBackground = false }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="pt-16 flex-1">
        {children}
      </main>
      <Footer solidBackground={footerBackground} />
    </div>
  );
};

export default MainLayout;
