import RecentRecipesSection from "../../components/home/RecentRecipesSection";

export default function Home() {
  const loading = false;

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

      {/* TODO */}
      {/* <CollectionsSection loading={false} collections={[]} /> */}
    </div>
  );
}
