import { supabase } from "../../lib/supabaseClient";

export default function Home() {
  return (
    <div className="min-h-screen">
      <h1>NomNom Home</h1>
      <button onClick={() => supabase.auth.signOut()}>Log Out</button>
    </div>
  );
}
