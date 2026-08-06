'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TypeCharacter, prefetchCharacter } from '@/components/TypeCharacter';
import { questions } from '@/data/questions';
import { oshicoaTypes } from '@/data/types';
import { createResult, options } from '@/lib/diagnosis';
import { useDiagnosisStore } from '@/stores/diagnosis';
import { AnswerValue } from '@/types';

/** 24問のあいだ、16タイプのキャラを順番に登場させる（見た目だけ。診断結果とは無関係） */
const castAt = (index: number) => oshicoaTypes[index % oshicoaTypes.length];

export default function Questions() {
  const router=useRouter();
  const {answers,answer,profile,setResult}=useDiagnosisStore();
  const [index,setIndex]=useState(Math.min(answers.length,23));
  const [loading,setLoading]=useState(false);
  const [failed,setFailed]=useState(false);
  const q=questions[index];
  const cast=castAt(index);

  const choose=useCallback((value:AnswerValue)=>{
    answer({questionId:q.id,value});
    if(index===23){
      setLoading(true);
      setTimeout(()=>{
        try{
          const ordered=[...answers.filter(item=>item.questionId!==q.id),{questionId:q.id,value}];
          const result=createResult(ordered,profile);
          setResult(result);
          router.push(`/result/${result.typeCode}`);
        }catch(error){
          // 解析に失敗しても /diagnosis へ飛ばさない。あちらの開始ボタンが回答を消してしまうため、
          // 24問はこの画面に残したまま、原因を出して再試行できるようにする。
          console.error('診断の解析に失敗しました',error);
          setLoading(false);setFailed(true);
        }
      },900);
    }else setIndex(current=>current+1);
  },[answer,answers,index,profile,q.id,router,setResult]);

  useEffect(()=>{
    const handleKey=(event:KeyboardEvent)=>{
      const number=Number(event.key);
      if(number>=1&&number<=4) choose(options[number-1][1]);
    };
    addEventListener('keydown',handleKey);
    return()=>removeEventListener('keydown',handleKey);
  },[choose]);

  // 次に出るキャラを裏で読み込んでおく（切り替わった瞬間の差し替わりを防ぐ）
  useEffect(()=>{
    [1,2].forEach(step=>prefetchCharacter(castAt(index+step).code));
  },[index]);

  if(loading)return <main className="shell question">
    <div className="loadingCast" aria-hidden>
      {[0,5,11].map(step=><TypeCharacter key={step} type={castAt(index+step)}/>)}
    </div>
    <p className="eyebrow" style={{display:'block',width:'fit-content',margin:'0 auto 10px'}}>ANALYSIS IN PROGRESS</p>
    <h1 style={{textAlign:'center',margin:'0 0 16px'}}>あなたのヲタク生態を解析中…</h1>
    <p className="lead" style={{textAlign:'center',margin:'auto'}}>愛の向かう先を計測<br/>現場行動パターンを照合<br/>ヲタクの業を抽出</p>
  </main>;

  if(failed)return <main className="shell question">
    <p className="eyebrow" style={{display:'block',width:'fit-content',margin:'0 auto 10px'}}>ANALYSIS FAILED</p>
    <h1 style={{textAlign:'center',margin:'0 0 16px'}}>解析につまずきました</h1>
    <p className="lead" style={{textAlign:'center',margin:'0 auto 24px'}}>24問の回答はこの端末に残っています。<br/>もう一度おためしください。</p>
    <div className="questionFoot" style={{justifyContent:'center'}}>
      <button className="button" onClick={()=>{setFailed(false);choose(answers.find(item=>item.questionId===q.id)?.value??1)}}>もう一度解析する</button>
    </div>
  </main>;

  return <main className="shell question">
    <div className="progress"><b style={{width:`${((index+1)/24)*100}%`}}/></div>
    <p className="progressMeta"><span>Q{index+1} / 24</span><span>のこり{24-index-1}問 ✧</span></p>
    <div className="questionCast" key={cast.code}>
      <TypeCharacter type={cast} className="questionCharacter"/>
      <p className="castMeta">
        <span className="castNo">生態サンプル {String((index%oshicoaTypes.length)+1).padStart(2,'0')} / 16</span>
        <b>{cast.name}</b>
        <span className="castCatch">{cast.shortDescription}</span>
      </p>
    </div>
    <h1>{q.text}</h1>
    <div className="answers">{options.map(([label,value],i)=><button className="answer" key={label} onClick={()=>choose(value)}><small>{i+1}</small>{label}</button>)}</div>
    <div className="questionFoot">
      <button className="button ghost small" disabled={!index} onClick={()=>setIndex(current=>current-1)}>← 前の質問</button>
      <Link href="/">診断をやめる</Link>
    </div>
  </main>;
}
