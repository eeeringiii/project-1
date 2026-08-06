import { questions } from '@/data/questions'; import { tags } from '@/data/tags'; import { phases } from '@/data/phases'; import { getType } from '@/data/types'; import { AnswerValue, AxisKey, ChartMetricId, DiagnosisAnswer, DiagnosisResult, OshiProfile, TypeCode } from '@/types';
const metrics:ChartMetricId[]=['event','spending','evangelism','interpretation','fandom','recognition','afterglow','archive'];
export function calculateAxes(answers:DiagnosisAnswer[]){const scores={R:0,C:0,E:0,P:0,G:0,M:0,T:0,S:0} as Record<AxisKey,number>; answers.forEach(a=>{const q=questions.find(x=>x.id===a.questionId); if(q) Object.entries(q.weights).forEach(([k,v])=>scores[k as AxisKey]+=v!*a.value)});return scores}
function pick<A extends AxisKey,B extends AxisKey>(a:A,b:B,s:Record<AxisKey,number>,answers:DiagnosisAnswer[], fallback:A|B):A|B{if(s[a]!==s[b])return s[a]>s[b]?a:b; const strength=(key:AxisKey)=>answers.reduce((n,x)=>n+(questions.find(q=>q.id===x.questionId)?.weights[key]?Math.abs(x.value):0),0); if(strength(a)!==strength(b))return strength(a)>strength(b)?a:b; return fallback}

// 型コードの先頭2文字は、軸の文字をそのまま並べたものではない。
// 第1軸が共鳴(R)のときだけ、第2軸の体験(E)を 'C' と表記する決まりで RCGT / RCGS … になっている。
// 共有URLとOG画像が既存コードに依存しているため（AGENTS.md）、表記は変えずに対応表を持つ。
const headCodes={R:{E:'RC',P:'RP'},C:{E:'CE',P:'CP'}} as const;

// 逆引き。コード文字をそのまま軸として読むと RC* が接続(C)判定になってしまうため、対応表から復元する。
const axisPairs={RC:['R','E'],RP:['R','P'],CE:['C','E'],CP:['C','P']} as const satisfies Record<string,readonly AxisKey[]>;
export function typeAxes(code:TypeCode):AxisKey[]{return [...axisPairs[code.slice(0,2) as keyof typeof axisPairs], code[2] as AxisKey, code[3] as AxisKey]}

export function determineType(scores:Record<AxisKey,number>,answers:DiagnosisAnswer[]):TypeCode{const head=headCodes[pick('R','C',scores,answers,'R')][pick('E','P',scores,answers,'E')];return `${head}${pick('G','M',scores,answers,'G')}${pick('T','S',scores,answers,'S')}`}

// determineType が返しうるコードの集合と、data/types.ts の16タイプが完全に一致することを型で保証する。
// 質問・軸・タイプコードのどれかを増減させて対応が崩れると、ここで `npm run build` が落ちる。
type GeneratedCode=`${(typeof headCodes)[keyof typeof headCodes][keyof (typeof headCodes)['R']]}${'G'|'M'}${'T'|'S'}`;
type Exact<A,B>=[A] extends [B]?([B] extends [A]?true:false):false;
export const TYPE_CODES_MATCH:Exact<GeneratedCode,TypeCode>=true;
export function calculateTags(answers:DiagnosisAnswer[]){const score=tags.map((tag,i)=>{let n=0,strong=0;answers.forEach(a=>{const q=questions.find(x=>x.id===a.questionId); const w=q?.tagWeights?.[tag.id]||0;n+=w*a.value;if(w&&a.value>1)strong+=a.value});return {tag,n,strong,i}}).sort((a,b)=>b.n-a.n||b.strong-a.strong||a.i-b.i); return score.filter(x=>x.n>=x.tag.threshold).slice(0,2).concat(score.filter(x=>x.n< x.tag.threshold).slice(0,2)).slice(0,2).map(x=>x.tag)}
export function determinePhase(answers:DiagnosisAnswer[],profile?:OshiProfile){const pos=(id:string)=>answers.find(a=>a.questionId===id)?.value||0;let id='steady'; if(profile?.duration==='1か月未満')id='new';else if(profile?.duration==='1〜6か月')id='dive';else if(profile?.duration==='5年以上')id='hall';else if(pos('q21')+pos('q24')>3)id='emotional';else if(pos('q14')+pos('q17')>3)id='deep';else if(pos('q13')+pos('q16')>3)id='invest';return phases.find(p=>p.id===id)!}
export function calculateChart(type:TypeCode,answers:DiagnosisAnswer[]){const base=getType(type)!.chartBaseValues;const out={...base};answers.forEach(a=>{const q=questions.find(x=>x.id===a.questionId);Object.entries(q?.chartWeights||{}).forEach(([m,w])=>out[m as ChartMetricId]+=Math.round(w!*a.value/6))}); metrics.forEach(m=>out[m]=Math.max(0,Math.min(100,out[m]))); return out}
export function createResult(answers:DiagnosisAnswer[],oshiProfile?:OshiProfile):DiagnosisResult {if(answers.length!==questions.length||new Set(answers.map(a=>a.questionId)).size!==questions.length)throw new Error('24問すべてに回答してください。');const axisScores=calculateAxes(answers),typeCode=determineType(axisScores,answers);return {typeCode,axisScores,tags:calculateTags(answers),phase:determinePhase(answers,oshiProfile),chartScores:calculateChart(typeCode,answers),answers,oshiProfile,completedAt:new Date().toISOString()}}
export const options:[string,AnswerValue][]=[['めちゃくちゃ当てはまる',3],['やや当てはまる',1],['あまり当てはまらない',-1],['まったく当てはまらない',-3]];
