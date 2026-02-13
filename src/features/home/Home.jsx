import RecentRecipesSection from "../../components/home/RecentRecipesSection";
import CollectionsSection from "../../components/home/CollectionsSection";
import { useEffect, useState } from "react";
import { getAllRecipes } from "../../lib/recipes";
import { getAllCollections } from "../../lib/collections";
import { useAuth } from "../../app/AuthProvider";

export default function Home() {
  const [recipeData, setRecipeData] = useState([]);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState("");
  const [collectionData, setCollectionData] = useState([])
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [collectionError, setCollectionError] = useState("")
  const userId = useAuth().user.id
  const loading = false;

  useEffect(() => {
    loadAllRecipes();
    loadAllCollections();
  }, [])

  async function loadAllRecipes() {
    setRecipeError("")
    setRecipeLoading(true)
    try {
      const data = await getAllRecipes({ userId });
      setRecipeData(data)
    } catch (error) {
      setRecipeError("Error fetching all recipes.")
    } finally {
      setRecipeLoading(false)
    }
  }

  async function loadAllCollections() {
    setCollectionError("")
    setCollectionLoading(true)

    try {
      const data = await getAllCollections({ userId });
      setCollectionData(data)
    } catch (error) {
      setCollectionError("Error fetching all collections.")
    } finally {
      setCollectionLoading(false);
    }
  }

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

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="rounded-full bg-white/70 px-3 py-1 text-sm text-gray-700 ring-1 ring-black/5">
          🍽️ {recipeData.length} recipes
        </div>
        <div className="rounded-full bg-white/70 px-3 py-1 text-sm text-gray-700 ring-1 ring-black/5">
          📚 {collectionData.length} collections
        </div>
        <div className="rounded-full bg-white/70 px-3 py-1 text-sm text-gray-700 ring-1 ring-black/5">
          ⭐ Keep saving your favorites
        </div>
      </div>

      {/* Sections */}
      <RecentRecipesSection loading={recipeLoading} recipes={recipeData} />
      <CollectionsSection loading={collectionLoading} collections={collectionData} />
    </div>
  );
}
