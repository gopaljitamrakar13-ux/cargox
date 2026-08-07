import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px]"></div>
      </div>

      {/* Navbar Placeholder */}
      <header className="w-full h-20 border-b border-white/10 flex items-center px-8 z-10 backdrop-blur-md bg-background/50">
        <div className="text-2xl font-display font-bold text-white tracking-wide">
          Cargo<span className="text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">X</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col relative z-10">
        <Outlet />
      </main>

      {/* Footer Placeholder */}
      <footer className="w-full h-16 border-t border-white/10 flex items-center justify-center text-sm text-textSecondary z-10 bg-background/80 backdrop-blur-md">
        &copy; {new Date().getFullYear()} CargoX. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
