import ItemView from "@/components/ItemView";
export const dynamic = "force-dynamic";
// Full page version (direct links, refresh). Clicking an item from the site opens the modal version instead.
export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <main className="mx-auto max-w-2xl px-5 pb-0 pt-6"><ItemView slug={slug} /></main>;
}
