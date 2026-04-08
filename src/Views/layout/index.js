import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from "../../Components/header/header";
import Footer from "../../Components/footer/footer";
import Sidebar  from '../../Components/sidebar/sidebar';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 992) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {mobileSidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop d-lg-none"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <div className="app-main">
        <Header
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          isSidebarCollapsed={sidebarCollapsed}
        />

        <main className="app-content-wrap">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;