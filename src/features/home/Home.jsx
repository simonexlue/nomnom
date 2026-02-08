import RecentRecipesSection from "../../components/home/RecentRecipesSection";
import CollectionsSection from "../../components/home/CollectionsSection";

export default function Home() {
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

  const recipes = [
    {
      id: "1",
      title: "Spicy Peanut Noodles",
      notes:
        "10 min weeknight meal. Add cucumber + chili oil. PLUS A WHOLE LOT OF OTHER STUFF",
      tags: ["dinner", "quick"],
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Air Fryer Salmon",
      notes: null,
      tags: ["healthy"],
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Home
        </h1>
        <div className="mt-2 h-1 w-10 rounded-full bg-yellow-400" />
      </div>

      <RecentRecipesSection loading={loading} recipes={recipes} />
      <CollectionsSection loading={loading} collections={collections} />

      {/* TODO */}
      {/* <CollectionsSection loading={false} collections={[]} /> */}
    </div>
  );
}
