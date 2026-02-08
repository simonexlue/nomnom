import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Alert from "../../../components/ui/Alert";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `http://localhost:5173/login`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccessMsg("Check your email to confirm your account.");
  }

  const inputClass =
    "w-full rounded-xl bg-gray-200 px-4 py-2.5 outline-none ring-2 ring-transparent focus:ring-yellow-300";
  const buttonClass =
    "w-full rounded-xl bg-yellow-400 py-2.5 font-medium shadow-sm hover:bg-yellow-300 hover:shadow active:scale-[0.98] transition disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="min-h-screen w-full bg-gray-100">
      {/* MOBILE/TABLET */}
      <div className="lg:hidden min-h-screen w-full flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-black/5 hover:shadow-xl transition-shadow">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create account
            </h1>
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-yellow-400" />
            <p className="mt-2 text-sm text-gray-500">
              Sign up to start saving recipes in NomNom
            </p>
          </div>

          <form onSubmit={handleSignup} className="mt-8 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500">Email</span>
              <input
                className={inputClass}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500">
                Password
              </span>
              <input
                className={inputClass}
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {error && <Alert variant="error">{error}</Alert>}
            {successMsg && <Alert variant="success">{successMsg}</Alert>}

            <button type="submit" disabled={loading} className={buttonClass}>
              {loading ? "Creating account..." : "Sign up"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a
                className="font-medium text-gray-900 underline underline-offset-4 hover:text-yellow-600 transition"
                href="/login"
              >
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* DESKTOP (lg): split screen, left no-card form + right purple panel */}
      <div className="hidden lg:grid min-h-screen grid-cols-2">
        {/* LEFT */}
        <div className="bg-white flex items-center justify-center px-10">
          <div className="w-full max-w-md">
            <div className="text-left">
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                Create account
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Sign up to start saving recipes in NomNom
              </p>
            </div>

            <form onSubmit={handleSignup} className="mt-8 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500">Email</span>
                <input
                  className={inputClass}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500">
                  Password
                </span>
                <input
                  className={inputClass}
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              {error && <Alert variant="error">{error}</Alert>}
              {successMsg && <Alert variant="success">{successMsg}</Alert>}

              <button type="submit" disabled={loading} className={buttonClass}>
                {loading ? "Creating account..." : "Sign up"}
              </button>

              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a
                  className="font-medium text-gray-900 underline underline-offset-4 hover:text-yellow-600 transition"
                  href="/login"
                >
                  Log in
                </a>
              </p>
            </form>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 flex items-center justify-center p-10">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative w-full max-w-lg text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-medium">
              🍓 NomNom
              <span className="opacity-80">Start your recipe vault</span>
            </div>

            <h2 className="mt-6 text-4xl font-semibold leading-tight">
              Save recipes fast,
              <br />
              cook with confidence.
            </h2>
            <p className="mt-4 text-white/85">
              Keep everything in one place. Add notes, tags, and build
              collections you can actually reuse.
            </p>

            {/* Image slot */}
            <div className="mt-10 flex items-center gap-6">
              <div className="h-12 w-12 rounded-2xl bg-white/15 grid place-items-center">
                ✨
              </div>
              <div className="text-sm text-white/90">
                Tip: After signing up, check your email to confirm your account.
              </div>
            </div>

            {/* image background for later:
                1) put an image in /public (ex: /public/image.png)
                2) uncomment below
            */}
            {/*
            <img
              src="/image.png"
              alt="NomNom signup"
              className="mt-10 w-full max-w-md"
            />
            */}
          </div>
        </div>
      </div>
    </div>
  );
}
