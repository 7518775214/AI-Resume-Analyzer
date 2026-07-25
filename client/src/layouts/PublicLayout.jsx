import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar isAppLayout={false} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
