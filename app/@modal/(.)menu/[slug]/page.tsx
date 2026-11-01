import Modal from "@/components/Modal";
import ItemView from "@/components/ItemView";
export const dynamic = "force-dynamic";
export default async function ItemModal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Modal label="Item details"><ItemView slug={slug} /></Modal>;
}
