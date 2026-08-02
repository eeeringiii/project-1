import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildCompatibilityMatrix, summarizeScores } from '@/lib/compatibility/matrix';
import { OSHICOA_CODES } from '@/lib/compatibility/validation';

export const metadata = { robots: { index: false, follow: false } };

/**
 * 開発用の相性マトリクス（本番では表示しません）。
 * 数値を調整したときの分布確認用です。
 */
export default function CompatibilityMatrixPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  const matrix = buildCompatibilityMatrix();
  const stats = summarizeScores(matrix.flat().map(result => result.overallScore));

  return (
    <main className="shell section">
      <p className="eyebrow">DEV ONLY</p>
      <h1 style={{ fontSize: 'clamp(26px,6vw,40px)' }}>相性マトリクス（16 × 16）</h1>
      <p className="note">
        <span>最低 {stats.min}</span>
        <span>最高 {stats.max}</span>
        <span>平均 {stats.average}</span>
        <span>中央値 {stats.median}</span>
        {stats.buckets.map(bucket => (
          <span key={bucket.label}>
            {bucket.label} {bucket.count}件
          </span>
        ))}
      </p>

      <div className="compatMatrixWrap">
        <table className="compatMatrix">
          <thead>
            <tr>
              <th scope="col">me \ partner</th>
              {OSHICOA_CODES.map(code => (
                <th scope="col" key={code}>
                  {code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map(row => (
              <tr key={row[0].firstType}>
                <th scope="row">{row[0].firstType}</th>
                {row.map(result => (
                  <td key={result.secondType}>
                    <Link href={`/compatibility?me=${result.firstType}&partner=${result.secondType}`}>
                      {result.overallScore}
                    </Link>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
