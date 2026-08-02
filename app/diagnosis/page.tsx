'use client';

import { useRouter } from 'next/navigation';
import { useDiagnosisStore } from '@/stores/diagnosis';

const selects: [string, string, string[]][] = [
  ['genre', 'ジャンル', ['男性アイドル', '女性アイドル', 'アーティスト', '俳優', '声優', 'VTuber', '配信者', 'アニメ・ゲームキャラクター', 'スポーツ選手', 'その他']],
  ['duration', '推している期間', ['1か月未満', '1〜6か月', '6か月〜1年', '1〜3年', '3〜5年', '5年以上']],
  ['frequency', '現場頻度', ['ほとんど行かない', '年に数回', '2〜3か月に1回', '月1回程度', '月2〜3回', '行ける限り行く']],
];

export default function Diagnosis() {
  const router = useRouter();
  const { profile, setProfile, reset } = useDiagnosisStore();
  const update = (key: string, value: string) => setProfile({ ...profile, [key]: value });

  return (
    <main className="shell form">
      <p className="eyebrow">BEFORE THE ANALYSIS</p>
      <h1>推しのこと、<br />よければ教えて。</h1>
      <p className="lead">入力はぜんぶ任意です。書かなくても診断できます。入力した内容は、この端末のなかだけで使われます。</p>

      <div className="formCard">
        <div className="field">
          <label htmlFor="oshi-name">推しの名前</label>
          <input id="oshi-name" value={profile.name || ''} onChange={event => update('name', event.target.value)} placeholder="〇〇くん、〇〇ちゃん、〇〇さん" />
        </div>
        {selects.map(([key, label, values]) => (
          <div className="field" key={key}>
            <label htmlFor={`oshi-${key}`}>{label}</label>
            <select id={`oshi-${key}`} value={profile[key as keyof typeof profile] || ''} onChange={event => update(key, event.target.value)}>
              <option value="">選択しない</option>
              {values.map(value => <option key={value}>{value}</option>)}
            </select>
          </div>
        ))}
        <button className="button" onClick={() => { reset(true); router.push('/diagnosis/questions'); }}>24問の解析をはじめる →</button>
      </div>

      <p className="note"><span>⏱ 約3分</span><span>💗 課金額で判定しません</span><span>🔒 サーバーに送りません</span></p>
    </main>
  );
}
