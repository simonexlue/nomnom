import { Outlet } from "react-router-dom";
import { SideNav } from "./SideNav";

export function AppLayout() {
  return (
    <div className="h-screen bg-[#f4efe4]">
      <div className="h-full w-full px-4 py-6">
        <div className="grid h-full gap-4 lg:grid-cols-[240px_1fr]">
          {/* Sidebar hidden on mobile */}
          <aside className="hidden lg:block h-full">
            <SideNav />
          </aside>

          {/* Page content renders here */}
          <main className="min-w-0 h-full overflow-y-auto pr-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}