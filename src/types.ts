import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  "https://mqaksaroqkrhkahxhffe.supabase.co",
  "sb_publishable_tH-P5KX8miYwC5qWT8H3qQ_j9CAoDzt"
);

export interface Block { id:number; blockId:string; label:string; color:string; value?:string; }
export interface GameVariable { id:string; name:string; defaultValue:string; varType:"number"|"text"|"boolean"; }
export interface SpriteActor { id:number; emoji:string; name:string; blocks:Block[]; pos:{x:number;y:number}; scale:number; rotation:number; hidden:boolean; color:string; autoRun:boolean; }
export interface Game { id:string; name:string; thumb:string; sprite:string; blocks:Block[]; actors?:SpriteActor[]; variables?:GameVariable[]; bgMusic?:string; bgColor?:string; groundColor?:string; groundBorder?:string; user_id?:string; username?:string; is_public?:boolean; plays?:number; likes?:number; liked?:boolean; created_at?:string; }
export interface Comment { id:string; game_id:string; user_id:string; username:string; content:string; created_at:string; }
export interface Notification { id:string; user_id:string; type:string; message:string; is_read:boolean; created_at:string; }
export interface Particle { id:number; x:number; y:number; vx:number; vy:number; life:number; emoji:string; size:number; }
export type Theme = "dark"|"light";

export const THUMBNAILS = ["🌋","🏝️","🌌","🏙️","🌲","🏔️","🌊","🎪","🛸","🏰","🎭","🌈"];
export const SPRITES    = ["🐱","🐶","🐸","🚀","⭐","🦊","🐲","🤖","👾","🦸","🐯","🦁"];
export const AVATARS    = ["😎","🧑","👩","🧙","🦸","🤖","👾","🐱","🦊","🐲","🌟","💎"];
export const PARTICLE_SETS = { stars:["⭐","✨","💫","🌟"], fire:["🔥","💥","✨","🌟"], snow:["❄️","⛄","💨"], hearts:["❤️","💕","💖"], coins:["💰","💎","⭐"] };
export const BG_COLORS = [
  {label:"🌌 Vũ trụ",   sky:"linear-gradient(180deg,#0a1628,#0d1e36 70%,#0a1010)", ground:"linear-gradient(180deg,#163016,#0a1a0a)", groundBorder:"#2a5a2a"},
  {label:"🌅 Hoàng hôn",sky:"linear-gradient(180deg,#ff7043,#ff8a65 50%,#ffb74d)", ground:"linear-gradient(180deg,#4a2400,#2a1400)", groundBorder:"#6a3400"},
  {label:"🌊 Đại dương", sky:"linear-gradient(180deg,#0288d1,#29b6f6 50%,#81d4fa)", ground:"linear-gradient(180deg,#1a3a1a,#0d2a0d)", groundBorder:"#2a6a2a"},
  {label:"🌸 Mùa xuân",  sky:"linear-gradient(180deg,#f8bbd9,#fce4ec 50%,#fff9c4)", ground:"linear-gradient(180deg,#2e7d32,#1b5e20)", groundBorder:"#4caf50"},
  {label:"❄️ Tuyết",     sky:"linear-gradient(180deg,#b3e5fc,#e1f5fe 50%,#ffffff)", ground:"linear-gradient(180deg,#e0e0e0,#bdbdbd)", groundBorder:"#9e9e9e"},
];
export const MUSIC_TRACKS = [{id:"none",label:"🔇 Tắt"},{id:"happy",label:"🎵 Vui"},{id:"epic",label:"⚔️ Hùng"},{id:"chill",label:"🌊 Chill"},{id:"spooky",label:"👻 Bí ẩn"}];
export const BLOCK_CATS: Record<string,{label:string;color:string;bg:string;blocks:{id:string;label:string;hasValue?:boolean}[]}> = {
  events:  {label:"⚡ Sự kiện",   color:"#FFB829",bg:"#2a1e00", blocks:[{id:"on_start",label:"🎮 Khi bắt đầu"},{id:"on_tap",label:"👆 Khi chạm"},{id:"on_key",label:"⌨️ Khi nhấn"}]},
  motion:  {label:"🏃 Di chuyển", color:"#4F8EF7",bg:"#0d1e3a", blocks:[{id:"move_right",label:"➡ Đi phải",hasValue:true},{id:"move_left",label:"⬅ Đi trái",hasValue:true},{id:"jump",label:"⬆ Nhảy"},{id:"spin",label:"🔄 Xoay"},{id:"teleport",label:"🌀 Dịch chuyển"}]},
  looks:   {label:"👀 Ngoại hình",color:"#A259FF",bg:"#1a0d3a", blocks:[{id:"say",label:"💬 Nói",hasValue:true},{id:"grow",label:"🔍 To ra"},{id:"shrink",label:"🔎 Nhỏ lại"},{id:"hide",label:"👻 Ẩn"},{id:"show",label:"👁️ Hiện"},{id:"flash",label:"✨ Nháy"}]},
  sound:   {label:"🔊 Âm thanh",  color:"#00E5FF",bg:"#001e22", blocks:[{id:"play_jump",label:"🔊 Nhảy"},{id:"play_win",label:"🏆 Thắng"},{id:"play_pop",label:"💥 Pop"}]},
  effects: {label:"✨ Hiệu ứng",  color:"#FF6BCB",bg:"#2a001e", blocks:[{id:"particle_stars",label:"⭐ Sao"},{id:"particle_fire",label:"🔥 Lửa"},{id:"particle_hearts",label:"❤️ Tim"},{id:"particle_coins",label:"💰 Coin"}]},
  control: {label:"🔄 Điều khiển",color:"#FF6B6B",bg:"#2a0d0d", blocks:[{id:"score_add",label:"⭐ +1 điểm"},{id:"repeat",label:"🔁 Lặp",hasValue:true},{id:"wait",label:"⏳ Chờ",hasValue:true},{id:"stop",label:"⏹ Dừng"}]},
};
export const DEMO_GAMES:Game[] = [
  {id:"t1",name:"Sky Runner",   thumb:"🌌",sprite:"🚀",blocks:[],plays:2400000,likes:98000,username:"@nova",  is_public:true},
  {id:"t2",name:"Dungeon Quest",thumb:"🏰",sprite:"🐲",blocks:[],plays:1100000,likes:54000,username:"@dark",  is_public:true},
  {id:"t3",name:"Island Hop",   thumb:"🏝️",sprite:"🐸",blocks:[],plays:890000, likes:41000,username:"@beach", is_public:true},
  {id:"t4",name:"Speed Drift",  thumb:"🏎️",sprite:"🤖",blocks:[],plays:670000, likes:33000,username:"@racer", is_public:true},
];
export const GAME_TEMPLATES = [
  {id:"runner",  name:"🏃 Auto Runner",  thumb:"🌌",desc:"Nhân vật tự chạy nhảy",sprite:"🐱",blocks:[{id:1,blockId:"on_start",label:"🎮 Khi bắt đầu",color:"#FFB829"},{id:2,blockId:"move_right",label:"➡ Đi phải",color:"#4F8EF7",value:"15"},{id:3,blockId:"jump",label:"⬆ Nhảy",color:"#4F8EF7"},{id:4,blockId:"score_add",label:"⭐ +1",color:"#FF6B6B"},{id:5,blockId:"play_win",label:"🏆 Thắng",color:"#00E5FF"}],variables:[{id:"v1",name:"lives",defaultValue:"3",varType:"number" as const}]},
  {id:"adventure",name:"🗺️ Adventure",  thumb:"🏰",desc:"Khám phá thu điểm",    sprite:"🦸",blocks:[{id:1,blockId:"on_start",label:"🎮 Khi bắt đầu",color:"#FFB829"},{id:2,blockId:"move_right",label:"➡ Đi phải",color:"#4F8EF7"},{id:3,blockId:"score_add",label:"⭐ +1",color:"#FF6B6B"},{id:4,blockId:"particle_coins",label:"💰 Coin",color:"#FF6BCB"},{id:5,blockId:"jump",label:"⬆ Nhảy",color:"#4F8EF7"}],variables:[{id:"v1",name:"score",defaultValue:"0",varType:"number" as const},{id:"v2",name:"level",defaultValue:"1",varType:"number" as const}]},
  {id:"dance",   name:"💃 Dance Show",   thumb:"🎭",desc:"Nhảy múa theo nhịp",   sprite:"🎭",blocks:[{id:1,blockId:"on_start",label:"🎮 Khi bắt đầu",color:"#FFB829"},{id:2,blockId:"spin",label:"🔄 Xoay",color:"#4F8EF7"},{id:3,blockId:"particle_hearts",label:"❤️ Tim",color:"#FF6BCB"},{id:4,blockId:"grow",label:"🔍 To ra",color:"#A259FF"},{id:5,blockId:"play_win",label:"🏆 Thắng",color:"#00E5FF"}],variables:[]},
  {id:"blank",   name:"⬜ Trống",        thumb:"🌟",desc:"Bắt đầu từ đầu",       sprite:"🐱",blocks:[],variables:[]},
];

export function playSound(type:"jump"|"win"|"pop"|"sad"):void{try{const ctx=new(window.AudioContext||(window as any).webkitAudioContext)();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);if(type==="jump"){o.frequency.setValueAtTime(300,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(600,ctx.currentTime+0.1);g.gain.setValueAtTime(0.3,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.2);o.start();o.stop(ctx.currentTime+0.2);}if(type==="win"){[523,659,784,1047].forEach((f,i)=>{const o2=ctx.createOscillator();const g2=ctx.createGain();o2.connect(g2);g2.connect(ctx.destination);o2.frequency.value=f;g2.gain.setValueAtTime(0.2,ctx.currentTime+i*0.1);g2.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+i*0.1+0.15);o2.start(ctx.currentTime+i*0.1);o2.stop(ctx.currentTime+i*0.1+0.15);});}if(type==="pop"){o.frequency.setValueAtTime(800,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(200,ctx.currentTime+0.1);g.gain.setValueAtTime(0.4,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.15);o.start();o.stop(ctx.currentTime+0.15);}if(type==="sad"){o.frequency.setValueAtTime(400,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(200,ctx.currentTime+0.3);g.gain.setValueAtTime(0.3,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.4);o.start();o.stop(ctx.currentTime+0.4);}}catch(e){}}
export function playBgMusic(trackId:string):void{if(trackId==="none")return;try{const ctx=new(window.AudioContext||(window as any).webkitAudioContext)();const freqs:Record<string,number[]>={happy:[523,659,784,659],epic:[220,277,330,220],chill:[440,494,523,494],spooky:[196,220,196,185]};const notes=freqs[trackId]||freqs.happy;let i=0;const play=()=>{const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=notes[i%notes.length];g.gain.setValueAtTime(0.04,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);o.start();o.stop(ctx.currentTime+0.4);i++;setTimeout(play,500);};play();}catch(e){}}
export function fmtNum(n:number):string{if(n>=1000000)return(n/1000000).toFixed(1)+"M";if(n>=1000)return(n/1000).toFixed(0)+"K";return String(n);}
export function timeAgo(d:string):string{const m=Math.floor((Date.now()-new Date(d).getTime())/60000);if(m<1)return"vừa xong";if(m<60)return m+"p";const h=Math.floor(m/60);if(h<24)return h+"h";return Math.floor(h/24)+"d";}
export function getLevelFromXP(xp:number):number{let l=1,t=0;while(t+l*100<=xp){t+=l*100;l++;}return l;}
export function getXPProgress(xp:number):number{const l=getLevelFromXP(xp);let t=0;for(let i=1;i<l;i++)t+=i*100;return Math.round(((xp-t)/(l*100))*100);}
export const LEVEL_TITLES=["","🌱 Mầm","🌿 Lá","🌸 Hoa","⭐ Sao","💫 Siêu sao","🏆 HuyềnThoại","💎 Thần","👑 Vua","🌟 Bất tử","🔥 Vô địch"];
export async function addXP(uid:string,xp:number,uname:string,av:string){const{data}=await supabase.from("user_stats").select("xp").eq("id",uid).single();if(data){await supabase.from("user_stats").update({xp:(data.xp||0)+xp,level:getLevelFromXP((data.xp||0)+xp)}).eq("id",uid);}else{await supabase.from("user_stats").insert({id:uid,username:uname,avatar:av,xp,level:getLevelFromXP(xp),games_created:0,total_plays:0});}}

// Theme
export function getT(theme:Theme){
  if(theme==="light")return{bg:"#f0f4ff",bg2:"#ffffff",bg3:"#e8edf8",border:"#d0d8f0",text:"#1a1a3e",text2:"#6670aa",card:"#ffffff",nav:"#ffffff",inp:"#f0f4ff"};
  return{bg:"#0a0a18",bg2:"#13132a",bg3:"#1a1a32",border:"#2a2a50",text:"#f0f0ff",text2:"#8888bb",card:"#13132a",nav:"#0d0d22",inp:"#1a1a32"};
}
export function iStyle(theme:Theme):React.CSSProperties{const t=getT(theme);return{width:"100%",padding:"11px 14px",borderRadius:12,background:t.inp,border:"1.5px solid "+t.border,color:t.text,fontSize:14,outline:"none",marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"};}
export function sBtn(theme:Theme):React.CSSProperties{const t=getT(theme);return{background:t.bg3,border:"1.5px solid "+t.border,borderRadius:10,padding:"6px 12px",color:t.text2,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"};}
