const fs = require('fs');
const path = require('path');

function mulberry32(a) {
  return function () { a |= 0; a = a + 0x6d2b79f5 | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const targets = [[42,38,13,7],[28,22,18,32],[45,28,15,12],[38,18,25,19],[48,25,20,7],[32,35,10,23],[35,30,22,13],[12,40,28,20]];
const correct = [1,1,1,1,1,1,1,1];
const qLabels = ['Q1_本质认知','Q2_适用条件','Q3_等时通过谬误','Q4_升力解释边界','Q5_因果关系','Q6_可压缩性','Q7_理论来源','Q8_应用边界'];
const opts = ['A','B','C','D'];

const rng = mulberry32(20260715);
const pools = targets.map(tc => { const p = []; tc.forEach((c,i) => { for(let j=0;j<c;j++) p.push(i); }); for(let i=p.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [p[i],p[j]]=[p[j],p[i]]; } return p; });
const respondents = []; for(let i=0;i<100;i++){ const a=pools.map(p=>p[i]); respondents.push({id:i+1,answers:a,score:a.reduce((s,x,qi)=>s+(x===correct[qi]?1:0),0)}); }

// Stats
const perQ = qLabels.map((l,qi)=>{ const c=[0,0,0,0]; respondents.forEach(r=>c[r.answers[qi]]++); return {q:l,counts:c,correctRate:((c[correct[qi]]/100)*100).toFixed(1)+'%'}; });
const scoreDist = new Array(9).fill(0); respondents.forEach(r=>scoreDist[r.score]++);
const avg = (respondents.reduce((s,r)=>s+r.score,0)/100).toFixed(2);

// CSV
const csv = '﻿受访者编号,'+qLabels.map(l=>l+'_选项').join(',')+','+qLabels.map(l=>l+'_正误').join(',')+',总分\n'+respondents.map(r=>[r.id,...r.answers.map(a=>opts[a]),...r.answers.map((a,qi)=>a===correct[qi]?'✓':'✗'),r.score].join(',')).join('\n');
fs.writeFileSync(path.join(__dirname,'survey-data-100.csv'),csv,'utf-8');

// JSON
fs.writeFileSync(path.join(__dirname,'survey-data-100.json'),JSON.stringify({meta:{title:'伯努利原理认知调研模拟数据集',sampleSize:100,seed:20260715,generatedAt:new Date().toISOString()},perQuestionStats:perQ,scoreDistribution:scoreDist.map((c,i)=>({score:i,count:c})),summary:{averageScore:avg,lowScorePct:scoreDist.slice(0,4).reduce((a,b)=>a+b,0)+'%'},respondents:respondents.map(r=>({id:r.id,answers:r.answers.map((a,qi)=>({question:qLabels[qi],choice:opts[a],correct:opts[correct[qi]],isCorrect:a===correct[qi]})),score:r.score}))},null,2),'utf-8');

// JS data file for index.html
const raw = respondents.map(r=>r.answers);
const js = `// 伯努利原理认知调研 — 100人模拟样本数据
// 种子:20260715 | 生成:${new Date().toISOString()}
window.__SURVEY_RAW__=${JSON.stringify(raw)};
window.__SURVEY_META__=${JSON.stringify({seed:20260715,generatedAt:new Date().toISOString(),n:100,correctAnswers:correct,questionLabels:qLabels,optionLabels:opts})};
`;
fs.writeFileSync(path.join(__dirname,'survey-data.js'),js,'utf-8');

console.log('✅ survey-data-100.csv');
console.log('✅ survey-data-100.json');
console.log('✅ survey-data.js');
perQ.forEach(q=>console.log(`  ${q.q}: ${q.correctRate}`));
