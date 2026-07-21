// OKLCH -> sRGB -> WCAG relative luminance
function oklchToSrgb(L, C, hDeg) {
  const h = hDeg * Math.PI / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774*a + 0.2158037573*b;
  const m_ = L - 0.1055613458*a - 0.0638541728*b;
  const s_ = L - 0.0894841775*a - 1.2914855480*b;
  const l = l_**3, m = m_**3, s = s_**3;
  const lr =  4.0767416621*l - 3.3077115913*m + 0.2309699292*s;
  const lg = -1.2684380046*l + 2.6097574011*m - 0.3413193965*s;
  const lb = -0.0041960863*l - 0.7034186147*m + 1.7076147010*s;
  return [lr, lg, lb];
}
const clamp01 = v => Math.min(1, Math.max(0, v));
function lin2srgb(c){ c=clamp01(c); return c<=0.0031308 ? 12.92*c : 1.055*Math.pow(c,1/2.4)-0.055; }
function hex(L,C,h){ return '#'+oklchToSrgb(L,C,h).map(v=>Math.round(lin2srgb(v)*255).toString(16).padStart(2,'0')).join(''); }
function lum(L,C,h){ const [r,g,b]=oklchToSrgb(L,C,h).map(clamp01); return 0.2126*r+0.7152*g+0.0722*b; }
function ratio(a,b){ const [x,y]=[lum(...a),lum(...b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); }
const T={brass:[0.74,0.115,80],brassDeep:[0.48,0.095,70],brassHover:[0.63,0.12,78],
 ink:[0.18,0.008,75],inkMuted:[0.44,0.006,75],white:[1,0,0],dark:[0.21,0.012,75],
 onDark:[0.96,0.004,75],mutedOnDark:[0.74,0.006,75],stroke:[0.64,0.006,75],
 destructive:[0.577,0.245,27.325],destructiveDark:[0.68,0.19,27.325],
 success:[0.50,0.13,150],successDark:[0.75,0.15,150]};
const checks=[
 ['ink on white',T.ink,T.white,4.5],['inkMuted on white',T.inkMuted,T.white,4.5],
 ['brassDeep on white',T.brassDeep,T.white,4.5],['stroke on white (UI)',T.stroke,T.white,3.0],
 ['ink on brass (btn)',T.ink,T.brass,4.5],['ink on brassHover',T.ink,T.brassHover,4.5],
 ['destructive on white',T.destructive,T.white,4.5],['success on white',T.success,T.white,4.5],
 ['onDark on dark',T.onDark,T.dark,4.5],['mutedOnDark on dark',T.mutedOnDark,T.dark,4.5],
 ['brass on dark (figures)',T.brass,T.dark,4.5],['onDark ring on dark (UI)',T.onDark,T.dark,3.0],
 ['destructiveDark on dark',T.destructiveDark,T.dark,4.5],['successDark on dark',T.successDark,T.dark,4.5],
];
let fail=0;
for(const [n,a,b,min] of checks){const r=ratio(a,b);const ok=r>=min;if(!ok)fail++;
 console.log(`${ok?'PASS':'FAIL'}  ${n.padEnd(26)} ${r.toFixed(2)}:1 (min ${min})`);}
const shift=ratio(T.brass,T.brassHover);
console.log(`${shift>=1.5?'PASS':'FAIL'}  ${'brass->hover shift'.padEnd(26)} ${shift.toFixed(2)}:1 (min 1.5)`);
if(shift<1.5)fail++;
console.log(fail===0?"\nALL PASS":`\n${fail} FAILURES`);
process.exit(fail===0?0:1);
