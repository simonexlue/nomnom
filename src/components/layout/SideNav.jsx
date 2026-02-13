import { NavLink } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useState } from "react";

export function SideNav() {
  const [q, setQ] = useState("");

  const base =
    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition";
  const inactive =
    "text-white/80 hover:bg-white/10 hover:text-white";
  const active =
    "bg-white/12 text-white";

  const primaryBtn =
    "w-full rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black shadow-sm hover:bg-yellow-300 hover:shadow active:scale-[0.98] transition";

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <nav className="flex h-[calc(100vh-3rem)] flex-col rounded-3xl bg-[#7e8f7a] p-4 shadow-lg ring-1 ring-black/10">
      <div>
        {/* Brand */}
        <div className="mb-4">
          <div className="flex items-center gap-2">

            <div>
              <div className="text-base font-semibold tracking-tight text-white">
                NomNom
              </div>
              <div className="text-xs text-white/70">
                Your recipes, organized
              </div>
            </div>
          </div>
        </div>

        {/* Search (visual only for now) */}
        <div className="mb-4">
          <div className="flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 ring-1 ring-white/15">
            <span className="text-white/70">⌕</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
            />
          </div>
        </div>

        {/* Nav */}
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
