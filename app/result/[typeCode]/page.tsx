import { notFound } from 'next/navigation';
import { getType } from '@/data/types';
import ResultClient from '@/components/ResultClient';

export default async function ResultPage({ params }: { params: Promise<{ typeCode: string }> }) {
  const { typeCode } = await params;
  const type = getType(typeCode);
  if (!type) notFound();
  return <ResultClient type={type} />;
}
