
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_KEY as string
);

export interface Block { id:number; blockId:string; label:string; color:string; value?:string; }
export interface GameVariable { id:string; name:string; defaultValue:string; varType:"number"|"text"|"boolean"; }
export interface SpriteActor { id:number; emoji:string; name:string; blocks:Block[]; pos:{x:number;y:number}; scale:number; rotation:number; hidden:boolean; color:string; autoRun:boolean; }
export interface Game { id:string; name:string; thumb:string; sprite:string; blocks:Block[]; actors?:SpriteActor[]; variables?:GameVariable[]; bgMusic?:string; bgColor?:string; groundColor?:string; groundBorder?:string; user_id?:string; username?:string; is_public?:boolean; plays?:number; likes?:number; liked?:boolean; created_at?:string; }
export interface Comment { id:string; game_id:string; user_id:string; username:string; content:string; created_at:string; }
export interface Notification { id:string; user_id:string; type:string; message:string; is_read:boolean; created_at:string; }
export interface Particle { id:number; x:number; y:number; vx:number; vy:number; life:number; emoji:string; size:number; }
export type Theme = "dark"|"light";

export const SPRITES    = ["cat","dog","frog","rocket","star","fox","dragon","robot","alien","hero","tiger","lion"];
export const SPRITE_EMOJIS: Record<string,string> = {cat:"🐱",dog:"🐶",frog:"🐸",rocket:"🚀",star:"⭐",fox:"🦊",dragon:"🐲",robot:"🤖",alien:"👾",hero:"🦸",tiger:"🐯",lion:"🦁"};
export const AVATAR_COLORS = ["#4F8EF7","#A259FF","#00C853","#FF6B6B","#FFB829","#00E5FF","#FF6BCB","#43e97b","#fa709a","#667eea","#1de9b6","#fd7043"];
export const CATEGORIES = ["Trending","Action","Puzzle","Adventure","RPG","Racing"];
export const PARTICLE_SETS = { stars:["⭐","✨","💫","🌟"], fire:["🔥","💥","✨","🌟"], snow:["❄️","⛄","💨"], hearts:["❤️","💕","💖"], coins:["💰","💎","⭐"] };
export const BG_COLORS = [
  {label:"Space",      sky:"linear-gradient(180deg,#0a1628,#0d1e36 70%,#0a1010)", ground:"linear-gradient(180deg,#163016,#0a1a0a)", groundBorder:"#2a5a2a"},
  {label:"Sunset",     sky:"linear-gradient(180deg,#ff7043,#ff8a65 50%,#ffb74d)", ground:"linear-gradient(180deg,#4a2400,#2a1400)", groundBorder:"#6a3400"},
  {label:"Ocean",      sky:"linear-gradient(180deg,#0288d1,#29b6f6 50%,#81d4fa)", ground:"linear-gradient(180deg,#1a3a1a,#0d2a0d)", groundBorder:"#2a6a2a"},
  {label:"Spring",     sky:"linear-gradient(180deg,#f8bbd9,#fce4ec 50%,#fff9c4)", ground:"linear-gradient(180deg,#2e7d32,#1b5e20)", groundBorder:"#4caf50"},
  {label:"Snow",       sky:"linear-gradient(180deg,#b3e5fc,#e1f5fe 50%,#ffffff)", ground:"linear-gradient(180deg,#e0e0e0,#bdbdbd)", groundBorder:"#9e9e9e"},
];
export const MUSIC_TRACKS = [{id:"none",label:"Off"},{id:"happy",label:"Happy"},{id:"epic",label:"Epic"},{id:"chill",label:"Chill"},{id:"spooky",label:"Spooky"}];
export const BLOCK_CATS: Record<string,{label:string;color:string;bg:string;blocks:{id:string;label:string;hasValue?:boolean}[]}> = {
  events:  {label:"Events",   color:"#FFB829",bg:"#2a1e00", blocks:[{id:"on_start",label:"On Start"},{id:"on_tap",label:"On Tap"},{id:"on_key",label:"On Key Press"}]},
  motion:  {label:"Motion",   color:"#4F8EF7",bg:"#0d1e3a", blocks:[{id:"move_right",label:"Move Right",hasValue:true},{id:"move_left",label:"Move Left",hasValue:true},{id:"jump",label:"Jump"},{id:"spin",label:"Spin"},{id:"teleport",label:"Teleport"}]},
  looks:   {label:"Looks",    color:"#A259FF",bg:"#1a0d3a", blocks:[{id:"say",label:"Say",hasValue:true},{id:"grow",label:"Grow"},{id:"shrink",label:"Shrink"},{id:"hide",label:"Hide"},{id:"show",label:"Show"},{id:"flash",label:"Flash"}]},
  sound:   {label:"Sound",    color:"#00E5FF",bg:"#001e22", blocks:[{id:"play_jump",label:"Play Jump"},{id:"play_win",label:"Play Win"},{id:"play_pop",label:"Play Pop"}]},
  effects: {label:"Effects",  color:"#FF6BCB",bg:"#2a001e", blocks:[{id:"particle_stars",label:"Burst Stars"},{id:"particle_fire",label:"Burst Fire"},{id:"particle_hearts",label:"Burst Hearts"},{id:"particle_coins",label:"Burst Coins"}]},
  control: {label:"Control",  color:"#FF6B6B",bg:"#2a0d0d", blocks:[{id:"score_add",label:"Score +1"},{id:"repeat",label:"Repeat",hasValue:true},{id:"wait",label:"Wait",hasValue:true},{id:"stop",label:"Stop"}]},
};
export const DEMO_GAMES:Game[] = [
  {id:"t1",name:"Sky Runner",   thumb:"t1",sprite:"rocket",blocks:[],plays:2400000,likes:98000,username:"nova",  is_public:true},
  {id:"t2",name:"Dungeon Quest",thumb:"t2",sprite:"dragon",blocks:[],plays:1100000,likes:54000,username:"dark",  is_public:true},
  {id:"t3",name:"Island Hop",   thumb:"t3",sprite:"frog",  blocks:[],plays:890000, likes:41000,username:"beach", is_public:true},
  {id:"t4",name:"Speed Drift",  thumb:"t4",sprite:"robot", blocks:[],plays:670000, likes:33000,username:"racer", is_public:true},
];
export const GAME_TEMPLATES = [
  {id:"runner",  name:"Auto Runner",  thumb:"runner",  desc:"Character auto-runs and jumps", sprite:"cat",   blocks:[{id:1,blockId:"on_start",label:"On Start",color:"#FFB829"},{id:2,blockId:"move_right",label:"Move Right",color:"#4F8EF7",value:"15"},{id:3,blockId:"jump",label:"Jump",color:"#4F8EF7"},{id:4,blockId:"score_add",label:"Score +1",color:"#FF6B6B"},{id:5,blockId:"play_win",label:"Play Win",color:"#00E5FF"}],variables:[{id:"v1",name:"lives",defaultValue:"3",varType:"number" as const}]},
  {id:"adventure",name:"Adventure",   thumb:"adventure",desc:"Explore and collect points",    sprite:"hero",  blocks:[{id:1,blockId:"on_start",label:"On Start",color:"#FFB829"},{id:2,blockId:"move_right",label:"Move Right",color:"#4F8EF7"},{id:3,blockId:"score_add",label:"Score +1",color:"#FF6B6B"},{id:4,blockId:"particle_coins",label:"Burst Coins",color:"#FF6BCB"},{id:5,blockId:"jump",label:"Jump",color:"#4F8EF7"}],variables:[{id:"v1",name:"score",defaultValue:"0",varType:"number" as const},{id:"v2",name:"level",defaultValue:"1",varType:"number" as const}]},
  {id:"dance",   name:"Dance Show",   thumb:"dance",   desc:"Character dances to the beat",  sprite:"star",  blocks:[{id:1,blockId:"on_start",label:"On Start",color:"#FFB829"},{id:2,blockId:"spin",label:"Spin",color:"#4F8EF7"},{id:3,blockId:"particle_hearts",label:"Burst Hearts",color:"#FF6BCB"},{id:4,blockId:"grow",label:"Grow",color:"#A259FF"},{id:5,blockId:"play_win",label:"Play Win",color:"#00E5FF"}],variables:[]},
  {id:"blank",   name:"Blank",        thumb:"blank",   desc:"Start from scratch",            sprite:"cat",   blocks:[],variables:[]},
];

export function playSound(type:"jump"|"win"|"pop"|"sad"):void{try{const ctx=new(window.AudioContext||(window as any).webkitAudioContext)();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);if(type==="jump"){o.frequency.setValueAtTime(300,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(600,ctx.currentTime+0.1);g.gain.setValueAtTime(0.3,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.2);o.start();o.stop(ctx.currentTime+0.2);}if(type==="win"){[523,659,784,1047].forEach((f,i)=>{const o2=ctx.createOscillator();const g2=ctx.createGain();o2.connect(g2);g2.connect(ctx.destination);o2.frequency.value=f;g2.gain.setValueAtTime(0.2,ctx.currentTime+i*0.1);g2.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+i*0.1+0.15);o2.start(ctx.currentTime+i*0.1);o2.stop(ctx.currentTime+i*0.1+0.15);});}if(type==="pop"){o.frequency.setValueAtTime(800,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(200,ctx.currentTime+0.1);g.gain.setValueAtTime(0.4,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.15);o.start();o.stop(ctx.currentTime+0.15);}if(type==="sad"){o.frequency.setValueAtTime(400,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(200,ctx.currentTime+0.3);g.gain.setValueAtTime(0.3,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.4);o.start();o.stop(ctx.currentTime+0.4);}}catch(e){}}
export function playBgMusic(trackId:string):void{if(trackId==="none")return;try{const ctx=new(window.AudioContext||(window as any).webkitAudioContext)();const freqs:Record<string,number[]>={happy:[523,659,784,659],epic:[220,277,330,220],chill:[440,494,523,494],spooky:[196,220,196,185]};const notes=freqs[trackId]||freqs.happy;let i=0;const play=()=>{const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=notes[i%notes.length];g.gain.setValueAtTime(0.04,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);o.start();o.stop(ctx.currentTime+0.4);i++;setTimeout(play,500);};play();}catch(e){}}
export function fmtNum(n:number):string{if(n>=1000000)return(n/1000000).toFixed(1)+"M";if(n>=1000)return(n/1000).toFixed(0)+"K";return String(n);}
export function timeAgo(d:string):string{const m=Math.floor((Date.now()-new Date(d).getTime())/60000);if(m<1)return"just now";if(m<60)return m+"m";const h=Math.floor(m/60);if(h<24)return h+"h";return Math.floor(h/24)+"d";}
export function getLevelFromXP(xp:number):number{let l=1,t=0;while(t+l*100<=xp){t+=l*100;l++;}return l;}
export function getXPProgress(xp:number):number{const l=getLevelFromXP(xp);let t=0;for(let i=1;i<l;i++)t+=i*100;return Math.round(((xp-t)/(l*100))*100);}
export const LEVEL_NAMES=["","Seed","Leaf","Blossom","Star","Super Star","Legend","Diamond","King","Immortal","Champion"];
export async function addXP(uid:string,xp:number,uname:string,av:string){const{data}=await supabase.from("user_stats").select("xp").eq("id",uid).single();if(data){await supabase.from("user_stats").update({xp:(data.xp||0)+xp,level:getLevelFromXP((data.xp||0)+xp)}).eq("id",uid);}else{await supabase.from("user_stats").insert({id:uid,username:uname,avatar:av,xp,level:getLevelFromXP(xp),games_created:0,total_plays:0});}}

export function getT(theme:Theme){
  if(theme==="light")return{bg:"#f0f4ff",bg2:"#ffffff",bg3:"#e8edf8",border:"#d0d8f0",text:"#0f0f23",text2:"#6670aa",card:"#ffffff",nav:"#ffffff",inp:"#f0f4ff",sidebar:"#ffffff"};
  return{bg:"#0a0a18",bg2:"#13132a",bg3:"#1a1a32",border:"#2a2a50",text:"#f0f0ff",text2:"#8888bb",card:"#13132a",nav:"#0d0d22",inp:"#1a1a32",sidebar:"#0d0d22"};
}
export function iStyle(theme:Theme):React.CSSProperties{const t=getT(theme);return{width:"100%",padding:"11px 14px",borderRadius:10,background:t.inp,border:"1.5px solid "+t.border,color:t.text,fontSize:14,outline:"none",marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"};}
export function sBtn(theme:Theme,active=false):React.CSSProperties{const t=getT(theme);return{background:active?"linear-gradient(135deg,#4F8EF7,#7C3AED)":t.bg3,border:active?"none":"1.5px solid "+t.border,borderRadius:10,padding:"7px 14px",color:active?"#fff":t.text2,fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:active?700:400,transition:"all 0.15s"};}

// Avatar: colored circle with initials — no emoji
export function Avatar({name,color,size=36}:{name:string;color:string;size?:number}){
  const initials = name.slice(0,2).toUpperCase();
  return(
    <div style={{width:size,height:size,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:800,color:"#fff",flexShrink:0,letterSpacing:-0.5}}>
      {initials}
    </div>
  );
}
