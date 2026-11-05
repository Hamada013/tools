module.exports=async context=>context.addInitScript(()=>{
 if(!localStorage.getItem('voc-children-v1'))localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'taffaha-qa',children:[{id:'taffaha-qa',name:'اختبار',role:'child'}]}));
});
