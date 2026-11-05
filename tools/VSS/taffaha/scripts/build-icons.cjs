const fs=require('node:fs'),path=require('node:path');
const sharp=require(process.env.TAFFAHA_SHARP||'sharp');
(async()=>{
 const dir=path.resolve(__dirname,'../assets/icons');
 for(const [filename,size,scale]of [['icon-192.png',192,.9],['icon-512.png',512,.9],['apple-touch-icon.png',180,.9],['maskable-512.png',512,.65]]){
  const n=Math.round(size*scale),logo=await sharp(path.join(dir,'logo.webp')).resize(n,n,{fit:'inside'}).png().toBuffer();
  await sharp({create:{width:size,height:size,channels:3,background:'#f8fafc'}}).composite([{input:logo,gravity:'center'}]).png().toFile(path.join(dir,filename));
 }
 console.log('Built app icons.');
})().catch(e=>{console.error(e);process.exitCode=1;});
