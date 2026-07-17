import { GenerateView } from "@/features/content/GenerateView";

export default async function GeneratePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GenerateView sourceId={id} />;
}
