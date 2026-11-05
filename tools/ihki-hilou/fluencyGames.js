/** Sound-responsive toys, not a stuttering/tension detector.
 * RMS is microphone energy. Autocorrelation is an approximate periodicity/pitch
 * cue, affected by noise, consonants, automatic gain and microphone distance.
 * Silence pauses movement without resetting progress or taking stars away.
 */
export const GAMES=[
 {id:'turtle',title:'على مهلك يا سلحفاة',technique:'الإطالة والتأني',short:'نمدّ الصوت قليلًا، ونترك للكلمة وقتها.',instructions:'مدّ صوت المد قليلًا على راحتك. يمكنك التوقف متى شئت.',color:'mint'},
 {id:'breeze',title:'نسمة وبداية لطيفة',technique:'البداية السهلة',short:'نفس لطيف… ثم كلمة على راحتنا.',instructions:'نفس لطيف، ثم ابدأ الكلمة على مهلك، مع المرافق.',color:'blue'},
 {id:'feather',title:'خفيفة مثل الريشة',technique:'اللمس المخرجي اللطيف',short:'نجرب ب، ت، ك بلمسة خفيفة.',instructions:'لمسة خفيفة للشفتين أو اللسان، كما يريك المرافق.',color:'amber'},
 {id:'bridge',title:'جسر الكلمات',technique:'وصل الكلمات براحة',short:'نصل كلماتنا، ونستريح حين نحتاج.',instructions:'صل الكلمات براحة، وخذ وقتك بينها حين تحتاج.',color:'coral'},
 {id:'balloon',title:'منطاد على مهل',technique:'التنفس المريح',short:'شهيق هادئ، وزفير أطول قليلًا.',instructions:'شهيق لطيف وزفير هادئ، إن كان مريحًا. توقف متى أحببت.',color:'violet'}
];
const svg=body=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 300" aria-hidden="true">${body}</svg>`;
export function gameArtwork(id){
 const floor='<path d="M55 244H585" stroke="#e8eff4" stroke-width="3" stroke-linecap="round"/>';
 if(id==='turtle')return svg(`${floor}<path d="M100 205H540" stroke="#cce8d7" stroke-width="8" stroke-linecap="round" stroke-dasharray="2 18"/><g data-actor transform="translate(510 155)"><ellipse cx="0" cy="28" rx="47" ry="32" fill="#8ed0a5"/><path d="M-37 24Q0-41 37 24Z" fill="#47a676"/><path d="M-20 22L-9 3 10 3 22 22M-9 3L-14-10M10 3L14-10" fill="none" stroke="#287d57" stroke-width="3"/><ellipse cx="-53" cy="30" rx="22" ry="18" fill="#8ed0a5"/><circle cx="-59" cy="25" r="3" fill="#224b3a"/><path d="M-67 33q5 4 10 0" stroke="#224b3a" fill="none" stroke-width="2"/><ellipse cx="-24" cy="52" rx="11" ry="8" fill="#63b98a"/><ellipse cx="24" cy="52" rx="11" ry="8" fill="#63b98a"/></g><path d="M102 165v45" stroke="#c29f68" stroke-width="4"/><path d="M102 165l-29 10 29 10" fill="#f5c15d"/><circle cx="153" cy="77" r="7" fill="#f7d789"/><path d="M222 82h28m-14-14v28" stroke="#bddfe8" stroke-width="4" stroke-linecap="round"/>`);
 if(id==='breeze')return svg(`${floor}<g data-sun transform="translate(160 117)"><g stroke="#efb95a" stroke-width="5" stroke-linecap="round"><path d="M0-60v-12M0 60v12M-60 0h-12M60 0h12M-44-44l-8-8M44-44l8-8M-44 44l-8 8M44 44l8 8"/></g><circle r="43" fill="#ffdc8d"/><circle cx="-13" cy="-4" r="3" fill="#735a2a"/><circle cx="13" cy="-4" r="3" fill="#735a2a"/><path d="M-12 10q12 14 24 0" fill="none" stroke="#735a2a" stroke-width="3" stroke-linecap="round"/></g><g data-breeze fill="none" stroke="#84cbe9" stroke-width="7" stroke-linecap="round"><path d="M520 110H330q-35 0-25-23t39-4"/><path d="M550 145H300"/><path d="M500 180H345q-25 0-20 18t26 12"/></g><path d="M485 225q-20-25-43-8 5 23 43 8" fill="#a8d8bd"/>`);
 if(id==='feather')return svg(`${floor}<g fill="none" stroke-width="3"><circle data-bubble="0" cx="135" cy="115" r="30" stroke="#78bde1" fill="#eaf6ff"/><circle data-bubble="1" cx="240" cy="173" r="36" stroke="#8fc5a5" fill="#eef9f1"/><circle data-bubble="2" cx="363" cy="91" r="26" stroke="#ecc271" fill="#fff7e6"/><circle data-bubble="3" cx="492" cy="160" r="40" stroke="#e9a4ae" fill="#fff0f3"/></g><g data-feather transform="translate(334 166) rotate(-28)"><path d="M0-58c64 0 35 84 0 110-40-40-46-110 0-110" fill="#efc482"/><path d="M0-37v105m0-82l19-12M0 7L-22-8M0 24l18-12" fill="none" stroke="#b7894f" stroke-width="3" stroke-linecap="round"/></g>`);
 if(id==='bridge')return svg(`${floor}<path d="M62 200H578" stroke="#a5d4bd" stroke-width="9" stroke-linecap="round"/><path d="M90 202v39m90-39v39m90-39v39m90-39v39m90-39v39m90-39v39" stroke="#d3e8dd" stroke-width="7"/><path d="M70 263q60-22 120 0t120 0 120 0 120 0" stroke="#c6e8f8" stroke-width="5" fill="none"/><g data-actor transform="translate(510 158)"><rect x="-40" y="-21" width="66" height="45" rx="12" fill="#f3a7a5"/><rect x="-31" y="-12" width="19" height="18" rx="5" fill="#fff4ec"/><rect x="-5" y="-12" width="19" height="18" rx="5" fill="#fff4ec"/><path d="M-40 15l-20 12h20" fill="#cf7d80"/><circle cx="-23" cy="26" r="10" fill="#576d83"/><circle cx="12" cy="26" r="10" fill="#576d83"/></g><path d="M145 89q30-25 59-1" stroke="#c7dfe9" stroke-width="4" fill="none" stroke-linecap="round"/>`);
 return svg(`${floor}<g data-balloon transform="translate(320 135) scale(.75)"><path d="M-46 40l25 40m67-40L21 80" stroke="#c2a475" stroke-width="3"/><path d="M-27 77h54l-7 34h-40z" fill="#dfb987"/><ellipse cy="-12" rx="68" ry="81" fill="#b9b1e8"/><path d="M0-93c-44 34-42 122 0 162 42-40 44-128 0-162" fill="#dcd7f5"/><path d="M-68-12h136" stroke="#a49bd7" stroke-width="3"/><path d="M-21 91h42" stroke="#be9568" stroke-width="3"/></g><path d="M142 91h42m-21-21v42" stroke="#f0d594" stroke-width="4" stroke-linecap="round"/><circle cx="480" cy="186" r="9" fill="#e9b8c2"/>`);
}
export function faceSVG(value){const colors=['#f6dedf','#ffead5','#fff1ce','#ddf1e7','#dceffa'];const mouth=value<3?'<path d="M17 31q7-7 14 0"/>':value===3?'<path d="M17 29h14"/>':'<path d="M17 27q7 10 14 0"/>';return`<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="${colors[value-1]}"/><g fill="#435b6c"><circle cx="17" cy="19" r="2"/><circle cx="31" cy="19" r="2"/></g><g stroke="#435b6c" stroke-width="2" fill="none" stroke-linecap="round">${mouth}</g></svg>`;}
export const RATINGS=['صعب جدًا / مشدود','صعب قليلًا','وسط','مريح','سلس ومريح جدًا'];
export function analyzeFrame(buffer,sampleRate,noise=.006){
 let energy=0,mean=0;for(const x of buffer)mean+=x;mean/=buffer.length;for(const x of buffer)energy+=(x-mean)**2;
 const rms=Math.sqrt(energy/buffer.length),gate=Math.max(.006,noise*2.4);let pitch=null,confidence=0;
 if(rms>gate){
  const min=Math.floor(sampleRate/700),max=Math.min(Math.ceil(sampleRate/75),Math.floor(buffer.length/2)-1),size=Math.min(1024,buffer.length-max);
  let previous=0,before=0;
  for(let lag=min;lag<=max;lag++){
   let cross=0,a=0,b=0;for(let i=0;i<size;i++){const x=buffer[i]-mean,y=buffer[i+lag]-mean;cross+=x*y;a+=x*x;b+=y*y;}
   const correlation=cross/Math.sqrt(a*b||1);
   if(previous>.7&&previous>before&&previous>=correlation){const peak=lag-1,delta=.5*(before-correlation)/(before-2*previous+correlation||1);pitch=sampleRate/(peak+Math.max(-.5,Math.min(.5,delta)));confidence=previous;break;}
   before=previous;previous=correlation;
  }
 }
 return{rms,pitch,confidence,active:rms>gate,voiced:rms>gate&&confidence>.7};
}
export function breathPhase(seconds,hold=0){const cycle=10+hold,t=seconds%cycle;if(t<4)return{phase:'inhale',fraction:t/4,scale:.65+.45*t/4};if(t<4+hold)return{phase:'hold',fraction:(t-4)/hold,scale:1.1};return{phase:'exhale',fraction:(t-4-hold)/6,scale:1.1-.45*(t-4-hold)/6};}
export class FluencyGame{
 constructor(stage,wave){this.stage=stage;this.wave=wave;this.running=false;}
 render(id){this.id=id;this.stage.innerHTML=gameArtwork(id);}
 start({stream,context,manual=false,duration=12,hold=0,sensitivity='normal',onFrame,onEnd}){
  this.stop();this.running=true;this.started=performance.now();let last=this.started,lastPitch=0,lastVoice=0,progress=0,frames=0,voicedMs=0,noise=.006,smooth=0,peak=0;const quiet=[];
  if(stream&&context){this.source=context.createMediaStreamSource(stream);this.analyser=context.createAnalyser();this.analyser.fftSize=2048;this.analyser.smoothingTimeConstant=.7;this.source.connect(this.analyser);}
  const samples=new Float32Array(2048),ctx=this.wave.getContext('2d');
  const tick=now=>{
   if(!this.running)return;const elapsed=(now-this.started)/1000,dt=Math.min(now-last,100);last=now;let data={rms:0,pitch:null,voiced:false,active:false,confidence:0};const calibrating=!manual&&this.id!=='balloon'&&elapsed<1.2;
   if(this.analyser){this.analyser.getFloatTimeDomainData(samples);if(now-lastPitch>90){this.lastAnalysis=analyzeFrame(samples,context.sampleRate,noise);lastPitch=now;}data=this.lastAnalysis||data;
    if(calibrating)quiet.push(data.rms);else if(quiet.length){quiet.sort((a,b)=>a-b);noise=Math.max(.002,quiet[Math.floor(quiet.length*.35)]);quiet.length=0;}
   }
   let level=manual?Math.max(0,Math.sin(elapsed*2.2))*.65:Math.max(0,Math.min(1,(data.rms-noise)/(sensitivity==='high'?.045:sensitivity==='low'?.18:.09)));
   smooth+=.2*(level-smooth);if(!calibrating&&!manual){frames++;peak=Math.max(peak,data.rms);if(data.voiced)voicedMs+=dt;}
   if(data.voiced||manual&&level>.15)lastVoice=now;
   if(!calibrating&&(data.voiced||now-lastVoice<300||manual))progress=Math.min(1,progress+dt/(manual?duration*1000:6500));
   const actor=this.stage.querySelector('[data-actor]');if(actor)actor.setAttribute('transform',`translate(${510-progress*400} ${this.id==='turtle'?155:158})`);
   const sun=this.stage.querySelector('[data-sun]');if(sun)sun.setAttribute('transform',`translate(160 117) scale(${.75+smooth*.4})`);
   const breeze=this.stage.querySelector('[data-breeze]');if(breeze)breeze.setAttribute('opacity',String(.3+smooth*.7));
   this.stage.querySelectorAll('[data-bubble]').forEach((b,i)=>b.setAttribute('r',String([30,36,26,40][i]+smooth*7)));
   const feather=this.stage.querySelector('[data-feather]');if(feather)feather.setAttribute('transform',`translate(334 ${166-smooth*20}) rotate(${-28+smooth*10})`);
   const breath=breathPhase(elapsed,hold),balloon=this.stage.querySelector('[data-balloon]');if(balloon)balloon.setAttribute('transform',`translate(320 135) scale(${breath.scale})`);
   ctx.clearRect(0,0,this.wave.width,this.wave.height);ctx.strokeStyle='#8bc5e5';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<samples.length;i+=8){const x=i/(samples.length-1)*this.wave.width,y=this.wave.height/2+(manual?0:samples[i])*this.wave.height*.9;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
   onFrame?.({elapsed,remaining:Math.max(0,duration-elapsed),level:smooth,pitch:manual?null:data.pitch,calibrating,phase:breath.phase,manual});
   this.stats=manual?{manual:true,duration:elapsed}:{manual:false,duration:elapsed,analysisAvailable:!!this.analyser,voicedMs:this.analyser?Math.round(voicedMs):null,peakRms:this.analyser?peak:null,analyzedFrames:this.analyser?frames:0};
   if(elapsed>=duration){const stats=this.stats;this.stop();onEnd?.(stats);return;}this.frame=requestAnimationFrame(tick);
  };
  this.frame=requestAnimationFrame(tick);
 }
 stop(){this.running=false;cancelAnimationFrame(this.frame);try{this.source?.disconnect();this.analyser?.disconnect();}catch{}this.source=this.analyser=null;return this.stats||{};}
}
