/** Safari requires the AudioContext to be created/resumed in a user gesture.
 * One engine owns all playback. Cancellation settles every pending promise,
 * and detaches native audio to prevent overlapping cues.
 */
export class AudioEngine{
 constructor(){this.context=null;this.cancelCurrent=null;this.durations=new Map();}
 unlock(){
  const Context=globalThis.AudioContext||globalThis.webkitAudioContext;
  try{if((!this.context||this.context.state==='closed')&&Context)this.context=new Context();}catch{this.context=null;}
  // iOS can report "interrupted" after an audio route/phone-call change.
  // Resume that state too; resuming only "suspended" leaves playback stuck.
  if(this.context&&this.context.state!=='running')this.context.resume().catch(()=>{});
  if(this.context){try{const b=this.context.createBuffer(1,1,22050),s=this.context.createBufferSource();s.buffer=b;s.connect(this.context.destination);s.onended=()=>s.disconnect();s.start();}catch{}}
 }

 stop(){this.cancelCurrent?.();this.cancelCurrent=null;}
 async duration(source,{signal}={}){
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  if(this.durations.has(source))return this.durations.get(source);
  let duration;
  if(this.context){
   const response=await fetch(source,{signal});if(!response.ok)throw Error('الصوت غير موجود في المكتبة.');
   const buffer=await this.context.decodeAudioData(await response.arrayBuffer());duration=buffer.duration;
  }else{
   duration=await new Promise((resolve,reject)=>{
    const audio=new Audio();audio.preload='metadata';let done=false;
    const finish=(error,value)=>{if(done)return;done=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);audio.onloadedmetadata=null;audio.onerror=null;audio.removeAttribute('src');audio.load();error?reject(error):resolve(value);};
    const abort=()=>finish(new DOMException('Cancelled','AbortError')),timer=setTimeout(()=>finish(Error('تعذر تحميل الصوت.')),10000);
    audio.onloadedmetadata=()=>finish(null,audio.duration);audio.onerror=()=>finish(Error('تعذر تحميل الصوت.'));signal?.addEventListener('abort',abort,{once:true});audio.src=source;
   });
  }
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  if(!Number.isFinite(duration)||duration<=0)throw Error('تعذر تحميل الصوت.');
  this.durations.set(source,duration);return duration;
 }
 beat({signal}={}){
  // A short, decaying wooden click generated locally, including when offline.
  if(!this.beatClip){
   const rate=22050,length=Math.round(rate*.1),buffer=new ArrayBuffer(44+length*2),view=new DataView(buffer);
   const text=(offset,value)=>{for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i));};
   text(0,'RIFF');view.setUint32(4,36+length*2,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,length*2,true);
   for(let i=0;i<length;i++){const t=i/rate,envelope=Math.min(1,t/.002)*Math.exp(-70*t),sample=(Math.sin(2*Math.PI*1000*t)+.35*Math.sin(2*Math.PI*1800*t))*envelope*.35;view.setInt16(44+i*2,sample*32767,true);}
   this.beatClip=new Blob([buffer],{type:'audio/wav'});
  }
  return this.play(this.beatClip,{signal});
 }
 async play(source,{signal,onStart=()=>{}}={}){
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  // Web Audio buffers, rather than repeated HTMLMediaElement.play() calls, keep
  // sequential syllables working after the initial iOS user activation expires.
  if(this.context){
   const response=typeof source==='string'?await fetch(source,{signal}):null;
   if(response&&!response.ok)throw Error('الصوت غير موجود في المكتبة.');
   const bytes=await(source instanceof Blob?source.arrayBuffer():response.arrayBuffer());
   const buffer=await this.context.decodeAudioData(bytes.slice(0));
   if(typeof source==='string')this.durations.set(source,buffer.duration);
   if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
   if(this.context.state!=='running')throw Error('المس زر الاستماع مجددًا لتفعيل الصوت.');
   return new Promise((resolve,reject)=>{
    const node=this.context.createBufferSource();node.buffer=buffer;node.connect(this.context.destination);let done=false;
    const finish=e=>{if(done)return;done=true;signal?.removeEventListener('abort',abort);node.onended=null;try{node.stop();}catch{}node.disconnect();if(this.cancelCurrent===abort)this.cancelCurrent=null;e?reject(e):resolve();};
    const abort=()=>finish(new DOMException('Cancelled','AbortError'));
    node.onended=()=>finish();this.cancelCurrent=abort;signal?.addEventListener('abort',abort,{once:true});node.start();onStart();
   });
  }
  const owned=source instanceof Blob,url=owned?URL.createObjectURL(source):source;
  try{await new Promise((resolve,reject)=>{
   const audio=new Audio(url);audio.preload='auto';let done=false;
   const finish=e=>{if(done)return;done=true;clearTimeout(timer);audio.onplaying=null;audio.pause();audio.removeAttribute('src');audio.load();signal?.removeEventListener('abort',abort);if(this.cancelCurrent===abort)this.cancelCurrent=null;e?reject(e):resolve();};
   const abort=()=>finish(new DOMException('Cancelled','AbortError')),timer=setTimeout(()=>finish(Error('تعذر تشغيل الصوت.')),20000);
   audio.onplaying=onStart;audio.onended=()=>finish();audio.onerror=()=>finish(Error('تعذر تشغيل الصوت.'));this.cancelCurrent=abort;signal?.addEventListener('abort',abort,{once:true});audio.play().catch(finish);
  });}finally{if(owned)URL.revokeObjectURL(url);}
 }
}
