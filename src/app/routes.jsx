import { createBrowserRouter } from "react-router-dom";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Home from "../features/home/Home";
import NewRecipe from "../features/recipes/NewRecipe";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import { AppLayout } from "../components/layout/AppLayout";
import RecipeDetails from "../features/recipes/RecipeDetails";

// Optional placeholders so your nav links don't 404
function ComingSoon({ title }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-gray-600">Coming soon.</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Home /> },

      // Replace these with real pages later
      { path: "recipes", element: <ComingSoon title="Recipes" /> },
      { path: "recipes/new", element: <NewRecipe /> },
      { path: "recipes/:slug", element: <RecipeDetails /> },
      { path: "collections", element: <ComingSoon title="Collections" /> },
    ],
  },
]);
