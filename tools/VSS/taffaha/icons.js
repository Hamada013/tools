// Local SVG icons keep controls readable offline, with no icon font/CDN.
const paths={
 profile:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3"/>',
 report:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 16v-3m4 3V8m4 8v-5"/>',
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 test:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6m-6 5 2 2 4-4"/>',
 count:'<circle cx="6" cy="7" r="3"/><circle cx="18" cy="7" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/>',
 music:'<path d="M9 18V5l12-2v13M9 9l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/>',
 picture:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
 level:'<path d="M4 20v-5m8 5V9m8 11V3"/>',
 easy:'<path d="M6 20V13m6 7V8m6 12V3" opacity=".2"/><path d="M6 20V13"/>',
 moderate:'<path d="M18 20V3" opacity=".2"/><path d="M6 20V13m6 7V8"/>',
 hard:'<path d="M6 20V13m6 7V8m6 12V3"/>',
 check:'<path d="m4 12 5 5L20 6"/>',

 library:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
 speaker:'<path d="m11 4-6 5H2v6h3l6 5zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
 next:'<path d="m14 5-7 7 7 7"/>',previous:'<path d="m10 5 7 7-7 7"/>',
 shuffle:'<path d="M3 5h3c5 0 7 14 12 14h3m-4-4 4 4-4 4M3 19h3c2 0 4-3 6-7 2-4 4-7 6-7h3m-4-4 4 4-4 4"/>',
 sequence:'<path d="m8 5 11 7-11 7z"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>'
};
export function icon(name){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||''}</svg>`;}
export function applyIcons(){for(const node of document.querySelectorAll('[data-icon]'))node.innerHTML=icon(node.dataset.icon);}
