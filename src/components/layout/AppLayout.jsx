import { Outlet } from "react-router-dom";
import { SideNav } from "./SideNav";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full px-4 py-6 ">
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          {/* Sidebar hidden on mobile */}
          <aside className="hidden lg:block">
            <SideNav />
          </aside>

          {/* Page content renders here */}
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
