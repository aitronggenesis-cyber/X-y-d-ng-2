// Pure SVG icon components — no emoji needed
export function IconHome({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
}
export function IconGrid({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}
export function IconCompass({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"/></svg>;
}
export function IconBell({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
}
export function IconUser({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
export function IconSettings({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
}
export function IconPlay({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><polygon points="5,3 19,12 5,21"/></svg>;
}
export function IconPlus({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
export function IconCode({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>;
}
export function IconStar({size=20,color="currentColor",filled=false}:{size?:number;color?:string;filled?:boolean}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={filled?color:"none"} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/></svg>;
}
export function IconHeart({size=20,color="currentColor",filled=false}:{size?:number;color?:string;filled?:boolean}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={filled?color:"none"} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
}
export function IconMessage({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
}
export function IconShare({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
}
export function IconTrash({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
}
export function IconSave({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>;
}
export function IconSearch({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
export function IconX({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
export function IconArrowLeft({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>;
}
export function IconSun({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}
export function IconMoon({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>;
}
export function IconChevronRight({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6"/></svg>;
}
export function IconTrophy({size=20,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="8,21 12,21 16,21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17v5a5 5 0 01-10 0V4z"/><path d="M7 9H3a1 1 0 01-1-1V6a1 1 0 011-1h4"/><path d="M17 9h4a1 1 0 001-1V6a1 1 0 00-1-1h-4"/></svg>;
}
export function IconGamepad({size=24,color="currentColor"}:{size?:number;color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="12" r="1" fill={color}/><circle cx="17" cy="10" r="1" fill={color}/><path d="M17 3H7a4 4 0 00-4 4v7a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4z"/></svg>;
}

// Game thumbnail — gradient by category, no emoji
const THUMB_GRADIENTS: Record<string, string> = {
  "0": "linear-gradient(135deg,#667eea,#764ba2)",
  "1": "linear-gradient(135deg,#f093fb,#f5576c)",
  "2": "linear-gradient(135deg,#4facfe,#00f2fe)",
  "3": "linear-gradient(135deg,#43e97b,#38f9d7)",
  "4": "linear-gradient(135deg,#fa709a,#fee140)",
  "5": "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "6": "linear-gradient(135deg,#ffecd2,#fcb69f)",
  "7": "linear-gradient(135deg,#ff9a9e,#fecfef)",
  "8": "linear-gradient(135deg,#a1c4fd,#c2e9fb)",
  "9": "linear-gradient(135deg,#fd7043,#ff8a65)",
  "10":"linear-gradient(135deg,#1de9b6,#1565c0)",
  "11":"linear-gradient(135deg,#e040fb,#7c4dff)",
};

export function GameThumb({id,size=44,height=90}:{id:string;size?:number;height?:number}) {
  const idx = String(Math.abs(id.split("").reduce((a,c)=>a+c.charCodeAt(0),0)) % 12);
  const grad = THUMB_GRADIENTS[idx];
  return(
    <div style={{background:grad,height,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
      {/* Decorative shapes */}
      <div style={{position:"absolute",width:size*2,height:size*2,borderRadius:"50%",background:"rgba(255,255,255,0.08)",top:-size*0.5,right:-size*0.5}}/>
      <div style={{position:"absolute",width:size,height:size,borderRadius:"50%",background:"rgba(255,255,255,0.06)",bottom:-size*0.3,left:-size*0.3}}/>
      <IconGamepad size={size} color="rgba(255,255,255,0.7)"/>
    </div>
  );
}
