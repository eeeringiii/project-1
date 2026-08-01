'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DiagnosisSheet, SquareShareCard, StoryShareCard, abilityKeys, abilityLabels } from '@/components/DiagnosisArtwork';
import { Share } from '@/components/Share';
import { createDiagnosisDocument, getCompatibilityName } from '@/lib/diagnosis/document';
import { downloadSvgAsPng } from '@/lib/download-svg';
import { getTypeTheme } from '@/lib/theme';
import { useDiagnosisStore } from '@/stores/diagnosis';
import { OshicoaType } from '@/types';

type CardKind='sheet'|'square'|'story';

export default function ResultClient({type}:{type:OshicoaType}){
  const {result,reset}=useDiagnosisStore();
  const current=result?.typeCode===type.code?result:undefined;
  const document=useMemo(()=>createDiagnosisDocument(type,current),[type,current]);
  const [active,setActive]=useState<CardKind>('sheet');
  const [saving,setSaving]=useState(false);
  // キャラクター画像（public/characters/コード.png）が用意できているかを確認し、
  // 無い場合はタイプのマークを表示する（画像を置けば自動で切り替わります）
  const [loadedCharacter,setLoadedCharacter]=useState<string>();
  useEffect(()=>{
    let alive=true;
    const src=document.characterImage;
    const image=new Image();
    image.onload=()=>{if(alive)setLoadedCharacter(src)};
    image.src=src;
    return()=>{alive=false};
  },[document.characterImage]);
  const hasCharacter=loadedCharacter===document.characterImage;
  const sheetRef=useRef<SVGSVGElement>(null),squareRef=useRef<SVGSVGElement>(null),storyRef=useRef<SVGSVGElement>(null);
  const cards={sheet:{ref:sheetRef,width:1080,height:1620,name:`oshicoa16-${type.code}-diagnosis.png`},square:{ref:squareRef,width:1200,height:1200,name:`oshicoa16-${type.code}-x.png`},story:{ref:storyRef,width:1080,height:1920,name:`oshicoa16-${type.code}-story.png`}};
  const save=async(kind:CardKind)=>{setSaving(true);try{const card=cards[kind];await downloadSvgAsPng(card.ref.current,card.width,card.height,card.name)}finally{setSaving(false)}};

  const theme=getTypeTheme(type.code);

  return <main className="resultPage">
    <section className="resultIntro shell">
      <p className="eyebrow">YOUR OTAKU ECOLOGY</p>
      <p>{document.oshiName?`${document.oshiName}を推しているときのあなたは…`:'あなたのヲタク生態は…'}</p>
      <div className="resultIdentity" style={{['--chip' as string]:theme.chip}}>
        <div className={hasCharacter?'characterSlot':'characterSlot isEmpty'}>
          {hasCharacter
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={document.characterImage} alt={`${type.name}のキャラクター`}/>
            : <span className="characterMark" aria-hidden>{theme.mark}</span>}
        </div>
        <div>
          <h1>{type.name}</h1>
          <p className="resultCode">{type.code}　生態レア度 {'★'.repeat(document.rarity)}{'☆'.repeat(5-document.rarity)}</p>
          <p className="catch">{type.catchphrase}</p>
        </div>
      </div>
      <div className="resultTags">{document.karmaTags.map(tag=><span className="tag" key={tag}>#{tag}</span>)}</div>
      <Share type={type} tags={current?.tags??[]} name={document.oshiName}/>
    </section>

    <section className="documentSection">
      <div className="shell">
        <p className="eyebrow">SAVE YOUR ECOLOGY</p><h2>ヲタク生態診断書</h2><p className="lead">診断結果と同じデータから、保存用・X用・ストーリー用のカードを生成します。</p>
        <div className="cardTabs" role="tablist" aria-label="保存カードの種類">
          {([['sheet','診断書'],['square','X用'],['story','Story用']] as [CardKind,string][]).map(([kind,label])=><button key={kind} role="tab" aria-selected={active===kind} className={active===kind?'active':''} onClick={()=>setActive(kind)}>{label}</button>)}
        </div>
        <div className={`artworkPreview ${active}`}>
          <div hidden={active!=='sheet'}><DiagnosisSheet ref={sheetRef} document={document} className="artwork"/></div>
          <div hidden={active!=='square'}><SquareShareCard ref={squareRef} document={document} className="artwork"/></div>
          <div hidden={active!=='story'}><StoryShareCard ref={storyRef} document={document} className="artwork"/></div>
        </div>
        <button className="button saveButton" disabled={saving} onClick={()=>save(active)}>{saving?'PNGを生成中…':active==='sheet'?'診断書を保存する':active==='square'?'X用画像を保存する':'Story用画像を保存する'}</button>
      </div>
    </section>

    <section className="shell ecologyProfile">
      <article className="profileCard"><p className="eyebrow">ECOLOGY PROFILE</p><h2>生態プロフィール</h2><dl><div><dt>生息地</dt><dd>{type.habitat}</dd></div><div><dt>主食</dt><dd>{type.mainFood}</dd></div><div><dt>口癖</dt><dd>{type.habitPhrase}</dd></div><div><dt>特殊能力</dt><dd>{type.specialAbility}</dd></div><div><dt>弱点</dt><dd>{type.weakness}</dd></div><div><dt>限界になると</dt><dd>{type.extremeBehavior}</dd></div></dl></article>
      <aside className="abilityCard"><p className="eyebrow">ABILITY PROFILE</p><h2>ヲタク能力</h2>{abilityKeys.map(key=><div className="abilityRow" key={key}><div><span>{abilityLabels[key]}</span><b>{document.abilities[key]}</b></div><progress max="100" value={document.abilities[key]} aria-label={`${abilityLabels[key]} ${document.abilities[key]}点`}/></div>)}</aside>
      <article className="profileCard"><p className="eyebrow">TOP 5</p><h2>この生態あるある</h2><ol>{type.top5.map(item=><li key={item}>{item}</li>)}</ol><h2>強み</h2><ul>{type.strengths.map(item=><li key={item}>{item}</li>)}</ul><h2>愛おしい業</h2><ul>{type.sins.map(item=><li key={item}>{item}</li>)}</ul></article>
      <aside className="profileCard"><p className="eyebrow">COMPATIBILITY</p><h2>相性がよい生態</h2><p><Link href={`/types/${type.compatibility.bestTypeCode}`}>{getCompatibilityName(type)}</Link> — {type.compatibility.description}</p>{current&&<div className="phaseNote"><b>現在の関係フェーズ：{current.phase.name}</b><p>{current.phase.description}<br/>{current.phase.advice}</p></div>}<Link className="button" href="/diagnosis" onClick={()=>reset(true)}>もう一度診断する</Link></aside>
    </section>
  </main>
}
