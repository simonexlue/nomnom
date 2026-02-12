import RecentRecipesSection from "../../components/home/RecentRecipesSection";
import CollectionsSection from "../../components/home/CollectionsSection";
import { useEffect, useState } from "react";
import { getAllRecipes } from "../../lib/recipes";
import { useAuth } from "../../app/AuthProvider";

export default function Home() {
  const [recipeData, setRecipeData] = useState([]);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState("");
  const userId = useAuth().user.id
  const loading = false;
  const collections = [
    {
      id: "c1",
      name: "Weeknight Dinners",
      description: "Fast meals I can make in under 25 minutes.",
      created_at: new Date().toISOString(),
    },
    {
      id: "c2",
      name: "Meal Prep",
      description: "Recipes that scale well for 3–5 days.",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: "c3",
      name: "Desserts",
      description: null,
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
  ];

  useEffect(() => {
    setRecipeError("")
    setRecipeLoading(true)
    async function loadAllRecipes() {
      try {
        const data = await getAllRecipes({ userId });
        setRecipeData(data)
      } catch (error) {
        setRecipeError("Error fetching all recipes.")
      } finally {
        setRecipeLoading(false)
      }
    }
    loadAllRecipes();
  }, [])

  console.log(recipeData)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Home
        </h1>
        <div className="mt-2 h-1 w-10 rounded-full bg-yellow-400" />
      </div>

      {/* Sections */}
      <RecentRecipesSection loading={recipeLoading} recipes={recipeData} />
      <CollectionsSection loading={loading} collections={collections} />
    </div>
  );
}
