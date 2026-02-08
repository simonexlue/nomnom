import { NavLink } from "react-router-dom";

export function SideNav() {
  const base =
    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition";
  const inactive = "text-gray-700 hover:bg-gray-100";
  const active = "bg-gray-100 text-gray-900";
  return (
    <nav className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <div className="text-base font-semibold tracking-tight text-gray-900">
          NomNom
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Your receipes, organized
        </div>
      </div>

      {/* Home */}
      <div>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${base} ${isActive ? active : inactive}`
          }
        >
          Home
        </NavLink>
      </div>
    </nav>
  );
}
