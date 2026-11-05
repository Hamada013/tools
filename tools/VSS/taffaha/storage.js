// Guest display preferences. Child-specific progress is stored by progress.js.
export function readPreferences(){try{return JSON.parse(localStorage.getItem('taffaha-preferences'))||{};}catch{return{};}}
export function savePreferences(value){
 try{localStorage.setItem('taffaha-preferences',JSON.stringify({lastWord:value.lastWord,pace:value.pace,testLevel:value.testLevel,testKind:value.testKind,practiceRhythm:value.practiceRhythm}));return true;}
 catch{return false;}
}
