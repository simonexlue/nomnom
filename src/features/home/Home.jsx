import { supabase } from "../../lib/supabaseClient";
import { HomeHeader } from "../../components/home/HomeHeader";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            NomNom Home
          </h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm"
          >
            Log Out
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6 text-sm text-gray-600">
          Home content goes here (Recent Recipes + Collections).
        </div>
      </div>
    </div>
  );
}
