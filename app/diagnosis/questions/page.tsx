'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { questions } from '@/data/questions';
import { createResult, options } from '@/lib/diagnosis';
import { useDiagnosisStore } from '@/stores/diagnosis';
import { AnswerValue } from '@/types';

export default function Questions() {
  const router=useRouter();
  const {answers,answer,profile,setResult}=useDiagnosisStore();
  const [index,setIndex]=useState(Math.min(answers.length,23));
  const [loading,setLoading]=useState(false);
  const q=questions[index];

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
        }catch{router.push('/diagnosis')}
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

  if(loading)return <main className="shell question">
    <p className="loadingArt" aria-hidden>🔮</p>
    <p className="eyebrow" style={{display:'block',width:'fit-content',margin:'0 auto 10px'}}>ANALYSIS IN PROGRESS</p>
    <h1 style={{textAlign:'center',margin:'0 0 16px'}}>あなたのヲタク生態を解析中…</h1>
    <p className="lead" style={{textAlign:'center',margin:'auto'}}>愛の向かう先を計測<br/>現場行動パターンを照合<br/>ヲタクの業を抽出</p>
  </main>;

  return <main className="shell question">
    <div className="progress"><b style={{width:`${((index+1)/24)*100}%`}}/></div>
    <p className="progressMeta"><span>Q{index+1} / 24</span><span>のこり{24-index-1}問 ✧</span></p>
    <h1>{q.text}</h1>
    <div className="answers">{options.map(([label,value],i)=><button className="answer" key={label} onClick={()=>choose(value)}><small>{i+1}</small>{label}</button>)}</div>
    <div className="questionFoot">
      <button className="button ghost small" disabled={!index} onClick={()=>setIndex(current=>current-1)}>← 前の質問</button>
      <Link href="/">診断をやめる</Link>
    </div>
  </main>;
}
