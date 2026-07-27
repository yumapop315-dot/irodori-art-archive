import Feed from "@/components/Feed";

export const metadata = { title: "お気に入り" };

export default function FavoritesPage() {
  return (
    <div>
      <h1 className="ba-heading mb-4 text-xl">お気に入り</h1>
      <Feed source={{ kind: "favorites" }} />
    </div>
  );
}
