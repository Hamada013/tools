// Classify the actual recordings by their strongest spectral-energy band.
// Broad environmental recordings are not pure tones or hearing thresholds.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),size=2048,rate=16000;
function spectrum(samples){
 const energy=new Float64Array(size/2),real=new Float64Array(size),imag=new Float64Array(size);
 for(let offset=0;offset+size<=samples.length;offset+=size){
  for(let i=0;i<size;i++){real[i]=samples[offset+i]*(.5-.5*Math.cos(2*Math.PI*i/(size-1)));imag[i]=0;}
  for(let i=1,j=0;i<size;i++){let bit=size>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j)[real[i],real[j]]=[real[j],real[i]];}
  for(let length=2;length<=size;length*=2){
   const angle=-2*Math.PI/length,wr=Math.cos(angle),wi=Math.sin(angle);
   for(let start=0;start<size;start+=length){let ur=1,ui=0;
    for(let j=0;j<length/2;j++){const a=start+j,b=a+length/2,tr=real[b]*ur-imag[b]*ui,ti=real[b]*ui+imag[b]*ur;real[b]=real[a]-tr;imag[b]=imag[a]-ti;real[a]+=tr;imag[a]+=ti;[ur,ui]=[ur*wr-ui*wi,ur*wi+ui*wr];}
   }
  }
  for(let i=3;i<energy.length;i++)energy[i]+=real[i]**2+imag[i]**2;
 }
 return energy;
}
function classify(samples){
 const energy=spectrum(samples),bands=[0,0,0];
 for(let i=3;i<energy.length;i++){const hz=i*rate/size;bands[hz<500?0:hz<2000?1:2]+=energy[i];}
 const total=bands.reduce((a,b)=>a+b,0);if(!total)throw Error('Empty recording');
 return {band:['low','middle','high'][bands.indexOf(Math.max(...bands))],energy:bands.map(value=>Math.round(value/total*1000)/1000)};
}
if(require.main===module){
 const records={};
 for(let id=1;id<=50;id++){
  const source=path.join(root,`sounds/${id}.m4a`),bytes=cp.execFileSync('ffmpeg',['-v','error','-i',source,'-ac','1','-ar',String(rate),'-f','f32le','pipe:1'],{maxBuffer:32*1024*1024});
  const samples=new Float32Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
  records[id]={...classify(samples),sha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex')};
 }
 fs.writeFileSync(path.join(root,'assets/sound-pitch.js'),'// Generated from the 50 full recordings; see docs/auditory-rehabilitation.md.\nexport const SOUND_PITCH='+JSON.stringify(records,null,2)+';\n');
 console.log('Pitch library:',Object.fromEntries(['low','middle','high'].map(band=>[band,Object.values(records).filter(row=>row.band===band).length])));
}
module.exports={classify};
