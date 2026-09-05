import type { Metadata } from 'next';
import { ResumeBuilder } from '@/components/ResumeBuilder';

export const metadata: Metadata = {
  title: 'ヲタク履歴書',
  description: '推し活のプロフィールを1枚のカードに。推し・推し歴・沼落ちのきっかけ・推し活ポリシーをまとめて、画像で保存・シェアできます。入力内容は端末内だけで処理します。',
  openGraph: {
    title: 'ヲタク履歴書｜OSHICOA 16',
    description: '推し活のプロフィールを1枚のカードに。あなたのヲタク履歴書を作ろう。',
    images: ['/api/og/resume'],
  },
  twitter: { card: 'summary_large_image', images: ['/api/og/resume'] },
};

export default function ResumePage() {
  return (
    <main className="shell section resumePage">
      <div className="resumeHead">
        <p className="eyebrow">OTAKU RESUME</p>
        <h1>ヲタク履歴書</h1>
        <p className="lead">
          あなたの推し活を、1枚のカードに。
          <br />
          書けるところだけ埋めれば、そのまま保存できます。
        </p>
      </div>

      <ResumeBuilder />
    </main>
  );
}
