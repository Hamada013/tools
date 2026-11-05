// Preserve links saved before Aswati was separated into two standalone apps.
function redirect(){const route=location.hash.replace(/^#\/?/,'');const module=route.split('/')[0];if(module==='arabic'||module==='around'){const folder=module==='arabic'?'arabicsounds':'auditory-rehabilitation';location.replace(`../${folder}/index.html#/${route}`);}}
redirect();window.addEventListener('hashchange',redirect);
if(isSecureContext&&'serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{});
