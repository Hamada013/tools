/* Each sound app owns its accounts and evidence. Legacy data is copied once. */
((root)=>{
 'use strict';
 const APPS=['arabicsounds','auditory-rehabilitation'];
 const registrations=child=>child.apps||{};
 const admin=child=>child?.role==='admin'||String(child?.name||'').normalize('NFKC').trim().toLowerCase()==='hamada';
 function create({app,storage}){
  if(!APPS.includes(app))throw Error('Unknown sound app');
  const KEY=`${app}-children-v1`;
  // Snapshot only this app’s existing accounts; never modify or follow the old store.
  try{if(storage.getItem(KEY)===null){
   const legacy=JSON.parse(storage.getItem('voc-children-v1'));
   const children=(legacy?.children||[]).filter(c=>!legacy.deletedChildren?.[c.id]&&(c.apps?.[app]===true||c.soundApps?.[app])).map(c=>({id:c.id,name:c.name,role:c.role,created:c.created,apps:{[app]:true},soundApps:c.soundApps?.[app]?{[app]:structuredClone(c.soundApps[app])}:{}}));
   storage.setItem(KEY,JSON.stringify({schema:1,active:children.some(c=>c.id===legacy?.active)?legacy.active:null,children}));
  }}catch{}
  let memory={schema:1,active:null,children:[]},storageOK=true;
  function read(){if(!storageOK)return structuredClone(memory);try{const saved=JSON.parse(storage.getItem(KEY));if(saved?.schema===1&&Array.isArray(saved.children))memory=saved;}catch{}return structuredClone(memory);}
  function write(data){memory=structuredClone(data);try{storage.setItem(KEY,JSON.stringify(data));storageOK=true;}catch{storageOK=false;}root.dispatchEvent?.(new Event('sound-progress-change'));}
  function ensure(){const data=read(),hamada=data.children.find(child=>String(child.name||'').normalize('NFKC').trim().toLowerCase()==='hamada');if(!hamada){data.children.push({id:'hamada-admin',name:'Hamada',role:'admin',created:new Date().toISOString(),apps:{}});write(data);}else if(hamada.role!=='admin'){hamada.role='admin';write(data);}}
  ensure();
  const children=()=>read().children;
  const active=()=>{const data=read();return data.children.find(child=>child.id===data.active)||null;};
  function register(){const data=read(),child=data.children.find(child=>child.id===data.active);if(!child||child.apps?.[app])return;child.apps={...registrations(child),[app]:true};write(data);}
  function activate(id){const data=read(),child=data.children.find(child=>child.id===id);if(!child||data.deletedChildren?.[id])return false;data.active=id;child.apps={...registrations(child),[app]:true};write(data);return true;}
  function add(name){name=String(name||'').normalize('NFKC').trim().slice(0,80);if(!name)return null;const data=read();let child=data.children.find(c=>c.name.normalize('NFKC').trim().toLocaleLowerCase()===name.toLocaleLowerCase());if(!child){child={id:root.crypto?.randomUUID?.()||`sound-child-${Date.now()}-${Math.random()}`,name,role:'child',created:new Date().toISOString(),apps:{[app]:true}};data.children.push(child);}data.active=child.id;child.apps={...registrations(child),[app]:true};write(data);return child;}
  function record(entry){
   const data=read(),child=data.children.find(c=>c.id===data.active);if(!child||data.deletedChildren?.[child.id]||(entry.owner&&entry.owner!==child.id)||!entry.label)return false;
   child.soundApps||={};const state=child.soundApps[app]||={sessions:[]};
   const id=entry.sessionId||`listen-${Date.now()}`,kind=entry.kind==='assessment'?'assessment':'practice';
   let session=state.sessions.find(s=>s.id===id);if(!session){session={id,date:new Date().toISOString(),activity:entry.activity||'الاستماع',skill:entry.skill||'listening',kind,partial:true,records:[]};state.sessions.push(session);}
   if(entry.id&&session.records.some(row=>row.id===entry.id))return false;
   session.records.push({id:entry.id||root.crypto?.randomUUID?.()||String(Math.random()),label:String(entry.label),target:String(entry.target||entry.label),correct:kind==='assessment'?entry.correct===true:null,response:entry.response??null,present:entry.present??null});write(data);return true;
  }
  function complete(id){const data=read(),child=data.children.find(c=>c.id===data.active),session=child?.soundApps?.[app]?.sessions.find(s=>s.id===id);if(session){session.partial=false;write(data);}}
  function report(id){const owner=active(),child=children().find(c=>c.id===(id||owner?.id));if(!owner||!child||(!admin(owner)&&owner.id!==child.id))return null;return {child,sessions:child.soundApps?.[app]?.sessions||[]};}
  function saveDetail(kind,detail){const data=read(),child=data.children.find(c=>c.id===data.active);if(!child||data.deletedChildren?.[child.id]||detail.owner!==child.id)return;child.soundApps||={};child.soundApps[app]||={sessions:[]};child.soundApps[app].details||={};child.soundApps[app].details[kind]=structuredClone(detail);write(data);}
  const detail=kind=>active()?.soundApps?.[app]?.details?.[kind]||null;
  register();return {saveDetail,detail,active,children,add,activate,register,record,complete,report,isAdmin:()=>admin(active()),storageOK:()=>storageOK};
 }
 if(typeof module!=='undefined')module.exports={create};
 root.SoundProgressModel={create};
})(globalThis);
