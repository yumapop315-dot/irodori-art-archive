import Feed from "@/components/Feed";
import { isAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export const metadata = { title: "お気に入り" };

export default async function FavoritesPage() {
  return (
    <div>
      <h1 className="ba-heading mb-4 text-xl">お気に入り</h1>
      <Feed source={{ kind: "favorites" }} isAdmin={await isAdminRequest()} />
    </div>
  );
}
