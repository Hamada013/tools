import { progress as syllables } from '../taffaha/progress.js';

// Each native adapter registers the same shared identity and initializes only
// its own progress. Existing work, including work in other tabs, is preserved.
const apps = [window.VocProgress, window.SenbProgress, syllables];
const accounts = {
  active: () => apps[0].active(),
  children: () => apps[0].children(),
  signIn(name) {
    let child;
    for (const app of apps) {
      const entered = app.signIn(name);
      if (!entered || !app.storageOK() || child && entered.id !== child.id) {
        throw Error('تعذّر حفظ الحساب في التطبيقات الثلاثة. تحقق من مساحة التخزين وإعدادات المتصفح، ثم أعد المحاولة.');
      }
      child = entered;
    }
    return child;
  }
};
const dialog = document.querySelector('#vss-accounts-dialog');
const input = document.querySelector('#vss-child-name');
const trigger = document.querySelector('[data-open-accounts]');
const homeError = document.querySelector('[data-account-error]');
const dialogError = document.querySelector('[data-dialog-error]');
let authorized = false, opening = false;

function update() {
  const name = accounts.active()?.name || 'اسم الطفل';
  document.querySelector('[data-account-name]').textContent = name;
  trigger.setAttribute('aria-label', `الحسابات: ${name}`);
}
function enter(name) {
  const child = accounts.signIn(name);
  homeError.hidden = true;
  dialogError.hidden = true;
  update();
  return child;
}
async function open() {
  if (opening || dialog.open) return;
  opening = true;
  authorized = false;
  const owner = accounts.active()?.id || null;
  try {
    if ((owner || accounts.children().some(child => child.role !== 'admin')) && !await window.ChildAccountGate.request()) return;
    if (owner !== (accounts.active()?.id || null)) return;
    authorized = true;
    input.value = accounts.active()?.name || '';
    dialogError.hidden = true;
    window.SuiteAccounts.render(document.querySelector('[data-saved-accounts]'), accounts.children(), child => {
      const select = document.createElement('button');
      select.type = 'button';
      select.onclick = () => submit(child.name);
      return window.SuiteAccounts.row(child, select);
    });
    dialog.showModal();
    input.focus();
    input.select();
  } finally { opening = false; }
}
function submit(name) {
  if (!authorized) return;
  if (!String(name).trim()) { input.focus(); return; }
  try { enter(name); dialog.close(); }
  catch (error) { dialogError.textContent = error.message; dialogError.hidden = false; }
}
trigger.addEventListener('click', open);
dialog.querySelector('form').addEventListener('submit', event => { event.preventDefault(); submit(input.value); });
dialog.querySelector('[data-accounts-close]').onclick = () => dialog.close();
dialog.addEventListener('close', () => { authorized = false; });

// Welcome and the homepage use exactly the same suite-wide registration flow.
window.SuiteWelcome.connect(accounts, enter);
update();
// A returning account is enrolled in every area without replacing its history.
if (accounts.active()) {
  try { enter(accounts.active().name); }
  catch (error) { homeError.textContent = error.message; homeError.hidden = false; }
}
