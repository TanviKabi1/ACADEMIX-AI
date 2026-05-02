import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ParticleBackground from "../components/ParticleBackground";
import { isAuthed } from "../lib/api";

export default function DashboardLayout() {
  const nav = useNavigate();
  useEffect(() => {
    if (!isAuthed()) nav("/login");
  }, [nav]);
  return (
    <div className="min-h-screen flex" data-testid="dashboard-layout">
      <ParticleBackground />
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
