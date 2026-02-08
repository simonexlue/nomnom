import { NavLink } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export function SideNav() {
  const base =
    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition";
  const inactive = "text-gray-700 hover:bg-gray-100";
  const active = "bg-gray-100 text-gray-900";

  const primaryBtn =
    "w-full rounded-xl bg-yellow-400 px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-yellow-300 hover:shadow active:scale-[0.98] transition";

  async function handleLogout() {
    await supabase.auth.signOut();
    // ProtectedRoute will redirect when session becomes null
  }

  return (
    <nav className="flex h-[calc(100vh-3rem)] flex-col rounded-2xl border border-gray-200 bg-white p-4">
      <div>
        <div className="mb-4">
          <div className="text-base font-semibold tracking-tight text-gray-900">
            NomNom
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Your recipes, organized
          </div>
        </div>

        <div className="space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            Home
          </NavLink>

          {/* ADD LATER X2 */}
          <NavLink
            to="/recipes"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            Recipes
          </NavLink>

          <NavLink
            to="/collections"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            Collections
          </NavLink>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="mt-auto pt-4">
        <button onClick={handleLogout} className={primaryBtn}>
          Log Out
        </button>
      </div>
    </nav>
  );
}
