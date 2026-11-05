/** Safari requires the AudioContext to be created/resumed in a user gesture.
 * One engine owns all playback. Cancellation settles every pending promise,
 * detaches native audio, and stops speech synthesis to prevent overlapping cues.
 */
export class AudioEngine{
 constructor(){this.context=null;this.cancelCurrent=null;this.generation=0;this.unlockedMedia=false;}
 unlock(){
  const Context=globalThis.AudioContext||globalThis.webkitAudioContext;
  try{if((!this.context||this.context.state==='closed')&&Context)this.context=new Context();}catch{this.context=null;}
  // iOS can report "interrupted" after an audio route/phone-call change.
  // Resume that state too; resuming only "suspended" leaves playback stuck.
  if(this.context&&this.context.state!=='running')this.context.resume().catch(()=>{});
  if(this.context){try{const b=this.context.createBuffer(1,1,22050),s=this.context.createBufferSource();s.buffer=b;s.connect(this.context.destination);s.onended=()=>s.disconnect();s.start();}catch{}}
 }

 stop(){this.generation++;this.cancelCurrent?.();this.cancelCurrent=null;globalThis.speechSynthesis?.cancel();}
 async play(source,{signal}={}){
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  // Web Audio buffers, rather than repeated HTMLMediaElement.play() calls, keep
  // sequential syllables working after the initial iOS user activation expires.
  if(this.context){
   const response=typeof source==='string'?await fetch(source,{signal}):null;
   if(response&&!response.ok)throw Error('الصوت غير موجود في المكتبة.');
   const bytes=await(source instanceof Blob?source.arrayBuffer():response.arrayBuffer());
   const buffer=await this.context.decodeAudioData(bytes.slice(0));
   if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
   if(this.context.state!=='running')throw Error('المس زر الاستماع مجددًا لتفعيل الصوت.');
   return new Promise((resolve,reject)=>{
    const node=this.context.createBufferSource();node.buffer=buffer;node.connect(this.context.destination);let done=false;
    const finish=e=>{if(done)return;done=true;signal?.removeEventListener('abort',abort);node.onended=null;try{node.stop();}catch{}node.disconnect();if(this.cancelCurrent===abort)this.cancelCurrent=null;e?reject(e):resolve();};
    const abort=()=>finish(new DOMException('Cancelled','AbortError'));
    node.onended=()=>finish();this.cancelCurrent=abort;signal?.addEventListener('abort',abort,{once:true});node.start();
   });
  }
  const owned=source instanceof Blob,url=owned?URL.createObjectURL(source):source;
  try{await new Promise((resolve,reject)=>{
   const audio=new Audio(url);audio.preload='auto';let done=false;
   const finish=e=>{if(done)return;done=true;clearTimeout(timer);audio.pause();audio.removeAttribute('src');audio.load();signal?.removeEventListener('abort',abort);if(this.cancelCurrent===abort)this.cancelCurrent=null;e?reject(e):resolve();};
   const abort=()=>finish(new DOMException('Cancelled','AbortError')),timer=setTimeout(()=>finish(Error('تعذر تشغيل الصوت.')),20000);
   audio.onended=()=>finish();audio.onerror=()=>finish(Error('تعذر تشغيل الصوت.'));this.cancelCurrent=abort;signal?.addEventListener('abort',abort,{once:true});audio.play().catch(finish);
  });}finally{if(owned)URL.revokeObjectURL(url);}
 }
 speak(text,{signal}={}){
  const synth=globalThis.speechSynthesis;if(!synth)throw Error('لا يوجد صوت جهاز هنا. سجّل نموذج المرافق.');
  const voice=synth.getVoices().find(v=>v.lang.toLowerCase().startsWith('ar'));
  if(!voice)throw Error('صوت عربي غير متاح على الجهاز. أضفه من إعدادات الجهاز أو سجّل نموذج المرافق.');
  return new Promise((resolve,reject)=>{
   const utterance=new SpeechSynthesisUtterance(text);utterance.lang=voice.lang;utterance.voice=voice;utterance.rate=.75;let done=false;
   const finish=e=>{if(done)return;done=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);if(this.cancelCurrent===abort)this.cancelCurrent=null;e?reject(e):resolve();};
   const abort=()=>{synth.cancel();finish(new DOMException('Cancelled','AbortError'));};
   const timer=setTimeout(()=>{synth.cancel();finish(Error('تعذر تشغيل صوت الجهاز. سجّل نموذج المرافق.'));},15000);
   utterance.onend=()=>finish();utterance.onerror=()=>finish(Error('صوت الجهاز غير متاح الآن. سجّل نموذج المرافق للتشغيل دون إنترنت.'));
   this.cancelCurrent=abort;signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)return abort();synth.speak(utterance);
  });
 }
}

export class VoiceRecorder{
 constructor(engine){this.engine=engine;this.active=false;this.pending=false;this.cancelled=false;}
 async start(){
  if(this.active||this.pending)throw Error('هناك تسجيل قيد التشغيل.');
  if(!isSecureContext||!navigator.mediaDevices?.getUserMedia)throw Error('الميكروفون يحتاج اتصال HTTPS أو localhost ومتصفحًا يدعم التسجيل.');
  this.pending=true;this.cancelled=false;this.engine.unlock();let stream;
  try{
   stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
   if(this.cancelled){stream.getTracks().forEach(t=>t.stop());throw new DOMException('Cancelled','AbortError');}
   this.stream=stream;this.active=true;this.started=Date.now();this.chunks=[];this.recorder=null;
   for(const track of stream.getTracks())track.addEventListener('ended',()=>{if(this.active)this.onInterrupted?.();},{once:true});
   if(globalThis.MediaRecorder){
    // Safari prefers MP4/AAC; Chromium usually supports WebM/Opus. Do not force
    // a MIME type the current browser cannot encode; persist the actual result.
    const types=['audio/webm;codecs=opus','audio/mp4','audio/webm','audio/ogg;codecs=opus'];
    const mime=types.find(t=>MediaRecorder.isTypeSupported?.(t));
    try{
     this.recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);const native=this.recorder,chunks=this.chunks;
     this.result=new Promise((resolve,reject)=>{
      native.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      native.onerror=()=>{const error=Error('توقف الميكروفون. حاول التسجيل مرة أخرى.');if(this.recorder===native){this.cleanup();this.onFailure?.(error);}reject(error);};
      native.onstop=()=>{const blob=new Blob(chunks,{type:native.mimeType||chunks[0]?.type||'audio/mp4'});if(this.recorder===native)this.cleanup();blob.size?resolve(blob):reject(Error('التسجيل فارغ. حاول مرة أخرى.'));};
     });
     // Attach a rejection handler immediately, even before the stop button.
     this.result.catch(()=>{});this.recorder.start(250);return;
    }catch{this.recorder=null;}
   }
   // Fallback for older iOS/browser versions: capture PCM via Web Audio and
   // encode a mono WAV. ScriptProcessor is deliberately used only as fallback
   // because AudioWorklet support varies on older Safari versions.
   const context=this.engine.context;if(!context)throw Error('هذا المتصفح لا يدعم تسجيل الصوت. جرّب Safari أو Chrome محدثًا.');
   let resumeTimer;try{await Promise.race([context.resume(),new Promise((_,reject)=>{resumeTimer=setTimeout(()=>reject(Error('تعذر تفعيل الصوت. أوقف التطبيقات الصوتية الأخرى ثم اضغط تسجيل مجددًا.')),5000);})]);}finally{clearTimeout(resumeTimer);}if(this.cancelled)throw new DOMException('Cancelled','AbortError');this.sampleRate=context.sampleRate;this.samples=[];this.source=context.createMediaStreamSource(stream);this.processor=context.createScriptProcessor(4096,1,1);this.mute=context.createGain();this.mute.gain.value=0;
   this.processor.onaudioprocess=e=>{if(this.active)this.samples.push(new Float32Array(e.inputBuffer.getChannelData(0)));};
   this.source.connect(this.processor);this.processor.connect(this.mute);this.mute.connect(context.destination);
  }catch(e){stream?.getTracks().forEach(t=>t.stop());this.cleanup();throw e;}finally{this.pending=false;}
 }
 cancelPending(){this.cancelled=true;if(this.active)this.cleanup();}
 cleanup(){this.active=false;this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;for(const n of [this.source,this.processor,this.mute]){try{n?.disconnect();}catch{}}if(this.processor)this.processor.onaudioprocess=null;this.source=this.processor=this.mute=null;}
 async stop(){
  if(!this.active)throw Error('لا يوجد تسجيل نشط.');
  if(this.recorder){
   const result=this.result;this.recorder.stop();let timer;
   try{return await Promise.race([result,new Promise((_,reject)=>{timer=setTimeout(()=>{this.cleanup();reject(Error('تعذر إنهاء التسجيل. حاول مجددًا.'));},8000);})]);}
   finally{clearTimeout(timer);}
  }
  const samples=this.samples||[],rate=this.sampleRate;this.cleanup();const length=samples.reduce((n,a)=>n+a.length,0);if(!length)throw Error('التسجيل فارغ. حاول مرة أخرى.');
  const buffer=new ArrayBuffer(44+length*2),view=new DataView(buffer);const text=(offset,value)=>{for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i));};
  text(0,'RIFF');view.setUint32(4,36+length*2,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,length*2,true);
  let offset=44;for(const part of samples)for(const v of part){const value=Math.max(-1,Math.min(1,v));view.setInt16(offset,value<0?value*32768:value*32767,true);offset+=2;}
  return new Blob([buffer],{type:'audio/wav'});
 }
}
export function micError(error){
 if(error.name==='NotAllowedError'||error.name==='SecurityError')return 'لم يُسمح بالميكروفون. اسمح له من إعدادات الموقع في المتصفح ثم حاول مجددًا.';
 if(error.name==='NotFoundError')return 'لم نعثر على ميكروفون متصل بهذا الجهاز.';
 if(error.name==='NotReadableError')return 'الميكروفون مشغول. أغلق التطبيقات التي تستخدمه وحاول مجددًا.';
 return error.message||'تعذر التسجيل. حاول مرة أخرى.';
}
