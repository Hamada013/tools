// Preserve links saved before Aswati was separated into two standalone apps.
function redirect(){const route=location.hash.replace(/^#\/?/,'');const module=route.split('/')[0];if(module==='arabic'||module==='around'){location.replace(module==='arabic'?`https://hamada013.github.io/arabic-sounds/index.html#/${route}`:`https://hamada013.github.io/non-speech-sounds-rehab/index.html#/${route}`);}}
redirect();window.addEventListener('hashchange',redirect);
if(isSecureContext&&'serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{});
