'use client';

import { forwardRef, ReactNode } from 'react';
import { BaseAbilityId } from '@/types';
import { DiagnosisDocument } from '@/lib/diagnosis/document';

const abilityLabels: Record<BaseAbilityId,string> = {field:'現場行動力',spending:'積み耐性',evangelism:'布教力',analysis:'解釈力',community:'同担連帯力',recognition:'認知欲',afterglow:'余韻持続力',archive:'記録保存力'};
const abilityKeys = Object.keys(abilityLabels) as BaseAbilityId[];

function Lines({text,x,y,size=28,max=22,line=1.35,anchor='start',weight=400}:{text:string;x:number;y:number;size?:number;max?:number;line?:number;anchor?:'start'|'middle';weight?:number}) {
  const rows=[] as string[];
  for(let i=0;i<text.length;i+=max) rows.push(text.slice(i,i+max));
  return <text x={x} y={y} fontSize={size} fill="#473d69" textAnchor={anchor} fontWeight={weight}>{rows.map((row,i)=><tspan x={x} dy={i?size*line:0} key={`${row}-${i}`}>{row}</tspan>)}</text>;
}

function Decorations({width,height}:{width:number;height:number}) {
  return <g opacity=".9"><path d={`M35 120 Q110 50 180 105`} fill="none" stroke="#eec4db" strokeWidth="4"/><text x={42} y={72} fontSize="34" fill="#d7a44a">✦</text><text x={width-105} y={95} fontSize="42" fill="#d985b6">♡</text><text x={width-78} y={height-70} fontSize="34" fill="#8c74cf">✧</text><circle cx={width-52} cy={180} r="16" fill="#f5d9e9"/><circle cx="55" cy={height-135} r="12" fill="#dcd3f5"/></g>;
}

function CharacterArtwork({document,x,y,width,height}:{document:DiagnosisDocument;x:number;y:number;width:number;height:number}) {
  return <image
    href={document.characterImage}
    x={x}
    y={y}
    width={width}
    height={height}
    preserveAspectRatio="xMidYMax meet"
    aria-label={`${document.type.name}のキャラクター`}
  />;
}

function RadarGraphic({document,cx,cy,r}:{document:DiagnosisDocument;cx:number;cy:number;r:number}) {
  const point=(i:number,value:number)=>{const a=-Math.PI/2+i*Math.PI*2/8;return `${cx+Math.cos(a)*r*value/100},${cy+Math.sin(a)*r*value/100}`};
  const ring=(value:number)=>abilityKeys.map((_,i)=>point(i,value)).join(' ');
  return <g>{[25,50,75,100].map(v=><polygon key={v} points={ring(v)} fill={v===100?'#fbf8ff':'none'} stroke="#d7caea" strokeWidth="2"/>)}{abilityKeys.map((key,i)=>{const a=-Math.PI/2+i*Math.PI*2/8;return <g key={key}><line x1={cx} y1={cy} x2={cx+Math.cos(a)*r} y2={cy+Math.sin(a)*r} stroke="#ded3ee"/><text x={cx+Math.cos(a)*(r+38)} y={cy+Math.sin(a)*(r+28)} fontSize="18" textAnchor="middle" fill="#66557f">{abilityLabels[key]}</text></g>})}<polygon points={abilityKeys.map((key,i)=>point(i,document.abilities[key])).join(' ')} fill="#c278d555" stroke="#8b5cc7" strokeWidth="5"/></g>;
}

function Frame({width,height,children,label}:{width:number;height:number;children:ReactNode;label:string}) {return <><rect width={width} height={height} fill="#f6f0ff"/><rect x="24" y="24" width={width-48} height={height-48} rx="38" fill="#fffafeee" stroke="#cbb9e5" strokeWidth="4"/><Decorations width={width} height={height}/><g><rect x="58" y="52" width="265" height="54" rx="27" fill="#7658b8"/><text x="190" y="88" textAnchor="middle" fontSize="25" fontWeight="800" fill="#fff">OSHICOA 16</text><text x={width-60} y="86" textAnchor="end" fontSize="21" fontWeight="700" fill="#a586c8">{label}</text></g>{children}</>}

export const DiagnosisSheet = forwardRef<SVGSVGElement,{document:DiagnosisDocument;className?:string}>(({document,className},ref)=>{const {type}=document;return <svg ref={ref} className={className} viewBox="0 0 1080 1620" role="img" aria-label={`${type.name}のヲタク生態診断書`} xmlns="http://www.w3.org/2000/svg"><Frame width={1080} height={1620} label="OTAKU ECOLOGY SHEET"><CharacterArtwork document={document} x={255} y={105} width={570} height={365}/><text x="540" y="500" textAnchor="middle" fontSize="70" fontWeight="900" fill="#342858">{type.name}</text><text x="540" y="550" textAnchor="middle" fontSize="27" fontWeight="800" fill="#9a79c1">{type.code}　生態レア度 {'★'.repeat(document.rarity)}{'☆'.repeat(5-document.rarity)}</text><Lines text={type.catchphrase} x={540} y={610} size={31} max={28} anchor="middle" weight={700}/><g transform="translate(62 680)"><rect width="575" height="410" rx="28" fill="#ffffffcc" stroke="#dacded" strokeWidth="3"/><text x="30" y="52" fontSize="27" fontWeight="800" fill="#7b5aaa">生態プロフィール</text>{[['生息地',type.habitat],['主食',type.mainFood],['口癖',type.habitPhrase],['特殊能力',type.specialAbility],['弱点',type.weakness]].map(([label,value],i)=><g key={label} transform={`translate(30 ${88+i*64})`}><text fontSize="20" fontWeight="800" fill="#c45f95">{label}</text><Lines text={value} x={112} y={0} size={19} max={31}/></g>)}</g><RadarGraphic document={document} cx={850} cy={875} r={145}/><g transform="translate(62 1125)"><rect width="956" height="370" rx="28" fill="#fff" stroke="#dacded" strokeWidth="3"/><text x="30" y="52" fontSize="27" fontWeight="800" fill="#7b5aaa">あなたの業</text>{document.karmaTags.map((tag,i)=><g key={tag} transform={`translate(${30+i*300} 72)`}><rect width="280" height="50" rx="25" fill="#f3d9e9"/><text x="140" y="34" textAnchor="middle" fontSize="19" fontWeight="800" fill="#985078">#{tag}</text></g>)}<text x="30" y="176" fontSize="25" fontWeight="800" fill="#7b5aaa">限界になると</text><Lines text={type.extremeBehavior} x={30} y={220} size={23} max={48}/><text x="30" y="310" fontSize="18" fill="#9a8aaf">保存して、推し友にもあなたの生態を晒そう。</text></g></Frame></svg>});
DiagnosisSheet.displayName='DiagnosisSheet';

export const SquareShareCard = forwardRef<SVGSVGElement,{document:DiagnosisDocument;className?:string}>(({document,className},ref)=>{const {type}=document;return <svg ref={ref} className={className} viewBox="0 0 1200 1200" role="img" aria-label={`${type.name}のX共有カード`} xmlns="http://www.w3.org/2000/svg"><Frame width={1200} height={1200} label="MY OTAKU TYPE"><CharacterArtwork document={document} x={305} y={115} width={590} height={420}/><text x="600" y="585" textAnchor="middle" fontSize="82" fontWeight="900" fill="#342858">{type.name}</text><text x="600" y="640" textAnchor="middle" fontSize="29" fontWeight="800" fill="#9877be">{type.code}　生態レア度 {'★'.repeat(document.rarity)}{'☆'.repeat(5-document.rarity)}</text><Lines text={type.catchphrase} x={600} y={710} size={34} max={28} anchor="middle" weight={700}/><RadarGraphic document={document} cx={325} cy={920} r={150}/><g transform="translate(600 800)"><text fontSize="27" fontWeight="800" fill="#7b5aaa">あなたの業</text>{document.karmaTags.map((tag,i)=><g key={tag} transform={`translate(0 ${35+i*66})`}><rect width="480" height="52" rx="26" fill="#f3d9e9"/><text x="240" y="35" textAnchor="middle" fontSize="21" fontWeight="800" fill="#985078">#{tag}</text></g>)}</g><text x="1100" y="1140" textAnchor="end" fontSize="23" fontWeight="800" fill="#8b70b3">#OSHICOA16</text></Frame></svg>});
SquareShareCard.displayName='SquareShareCard';

export const StoryShareCard = forwardRef<SVGSVGElement,{document:DiagnosisDocument;className?:string}>(({document,className},ref)=>{const {type}=document;return <svg ref={ref} className={className} viewBox="0 0 1080 1920" role="img" aria-label={`${type.name}のストーリー共有カード`} xmlns="http://www.w3.org/2000/svg"><Frame width={1080} height={1920} label="STORY CARD"><text x="540" y="165" textAnchor="middle" fontSize="25" fill="#9277b4">私のヲタク生態は</text><CharacterArtwork document={document} x={190} y={190} width={700} height={540}/><text x="540" y="790" textAnchor="middle" fontSize="76" fontWeight="900" fill="#342858">{type.name}</text><text x="540" y="848" textAnchor="middle" fontSize="29" fontWeight="800" fill="#9877be">{type.code}　生態レア度 {'★'.repeat(document.rarity)}{'☆'.repeat(5-document.rarity)}</text><Lines text={type.catchphrase} x={540} y={930} size={34} max={27} anchor="middle" weight={700}/><g transform="translate(90 1030)"><rect width="900" height="320" rx="30" fill="#fff" stroke="#d7cae9" strokeWidth="3"/><text x="35" y="58" fontSize="29" fontWeight="800" fill="#7b5aaa">生態プロフィール</text><text x="35" y="120" fontSize="21" fontWeight="800" fill="#c45f95">生息地</text><Lines text={type.habitat} x={155} y={120} size={21} max={32}/><text x="35" y="205" fontSize="21" fontWeight="800" fill="#c45f95">特殊能力</text><Lines text={type.specialAbility} x={155} y={205} size={21} max={32}/></g><RadarGraphic document={document} cx={330} cy={1580} r={170}/><g transform="translate(610 1420)"><text fontSize="29" fontWeight="800" fill="#7b5aaa">あなたの業</text>{document.karmaTags.map((tag,i)=><g key={tag} transform={`translate(0 ${38+i*72})`}><rect width="370" height="56" rx="28" fill="#f3d9e9"/><text x="185" y="38" textAnchor="middle" fontSize="21" fontWeight="800" fill="#985078">#{tag}</text></g>)}</g><text x="540" y="1840" textAnchor="middle" fontSize="24" fontWeight="800" fill="#8b70b3">あなたも診断してみてね　#OSHICOA16</text></Frame></svg>});
StoryShareCard.displayName='StoryShareCard';

export {abilityKeys,abilityLabels};
