import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://mqaksaroqkrhkahxhffe.supabase.co",
  "sb_publishable_tH-P5KX8miYwC5qWT8H3qQ_j9CAoDzt"
);

export interface Block { id: number; blockId: string; label: string; color: string; }

export interface SpriteActor {
  id: number;
  emoji: string;
  name: string;
  blocks: Block[];
  pos: { x: number; y: number };
  scale: number;
  rotation: number;
  hidden: boolean;
  color: string;
}

export interface Game {
  id: string; name: string; thumb: string; sprite: string; blocks: Block[];
  actors?: SpriteActor[];
  user_id?: string; username?: string; is_public?: boolean;
  plays?: number; likes?: number; liked?: boolean; created_at?: string;
}
export interface Comment {
  id: string; game_id: string; user_id: string;
  username: string; content: string; created_at: string;
}
export interface Notification {
  id: string; user_id: string; type: string;
  message: string; is_read: boolean; created_at: string;
}
export interface Profile {
  id: string; username: string; avatar: string; bio: string;
}
export interface Particle {
  id: number; x: number; y: number;
  vx: number; vy: number; life: number;
  emoji: string; size: number;
}

export type Theme = "dark" | "light";

export const THUMBNAILS = ["🌋","🏝️","🌌","🏙️","🌲","🏔️","🌊","🎪","🛸","🏰","🎭","🌈"];
export const SPRITES    = ["🐱","🐶","🐸","🚀","⭐","🦊","🐲","🤖","👾","🦸","🐯","🦁"];
export const AVATARS    = ["😎","🧑","👩","🧙","🦸","🤖","👾","🐱","🦊","🐲","🌟","💎"];
export const CATEGORIES = ["🔥 Trending","🏃 Action","🧩 Puzzle","🌍 Adventure","⚔️ RPG","🏎️ Racing"];
export const PARTICLE_SETS = {
  stars:  ["⭐","✨","💫","🌟"],
  fire:   ["🔥","💥","✨","🌟"],
  snow:   ["❄️","⛄","💨","🌨️"],
  hearts: ["❤️","💕","💖","💗"],
  coins:  ["💰","💎","⭐","✨"],
};

export const BLOCK_CATS: Record<string,{label:string;color:string;bg:string;blocks:{id:string;label:string}[]}> = {
  events:  {label:"⚡ Sự kiện",   color:"#FFB829",bg:"#2a1e00",
    blocks:[{id:"on_start",label:"🎮 Khi bắt đầu"},{id:"on_tap",label:"👆 Khi chạm"},{id:"on_key",label:"⌨️ Khi nhấn"}]},
  motion:  {label:"🏃 Di chuyển", color:"#4F8EF7",bg:"#0d1e3a",
    blocks:[{id:"move_right",label:"➡ Đi phải"},{id:"move_left",label:"⬅ Đi trái"},{id:"jump",label:"⬆ Nhảy"},{id:"move_up",label:"⬆ Lên"},{id:"move_down",label:"⬇ Xuống"},{id:"spin",label:"🔄 Xoay"}]},
  looks:   {label:"👀 Ngoại hình",color:"#A259FF",bg:"#1a0d3a",
    blocks:[{id:"say",label:"💬 Nói xin chào"},{id:"grow",label:"🔍 To ra"},{id:"shrink",label:"🔎 Nhỏ lại"},{id:"hide",label:"👻 Ẩn"},{id:"show",label:"👁️ Hiện"},{id:"flash",label:"✨ Nháy"}]},
  sound:   {label:"🔊 Âm thanh",  color:"#00E5FF",bg:"#001e22",
    blocks:[{id:"play_jump",label:"🔊 Âm nhảy"},{id:"play_win",label:"🏆 Âm thắng"},{id:"play_pop",label:"💥 Âm pop"}]},
  effects: {label:"✨ Hiệu ứng",  color:"#FF6BCB",bg:"#2a001e",
    blocks:[{id:"particle_stars",label:"⭐ Tung sao"},{id:"particle_fire",label:"🔥 Phun lửa"},{id:"particle_hearts",label:"❤️ Tim bay"},{id:"particle_coins",label:"💰 Mưa coin"}]},
  control: {label:"🔄 Điều khiển",color:"#FF6B6B",bg:"#2a0d0d",
    blocks:[{id:"repeat",label:"🔁 Lặp 3 lần"},{id:"wait",label:"⏳ Chờ 1s"},{id:"score_add",label:"⭐ +1 điểm"}]},
};

export const DEMO_GAMES: Game[] = [
  {id:"t1",name:"Sky Runner",   thumb:"🌌",sprite:"🚀",blocks:[],plays:2400000,likes:98000,username:"@nova",  is_public:true},
  {id:"t2",name:"Dungeon Quest",thumb:"🏰",sprite:"🐲",blocks:[],plays:1100000,likes:54000,username:"@dark",  is_public:true},
  {id:"t3",name:"Island Hop",   thumb:"🏝️",sprite:"🐸",blocks:[],plays:890000, likes:41000,username:"@beach", is_public:true},
  {id:"t4",name:"Speed Drift",  thumb:"🏎️",sprite:"🤖",blocks:[],plays:670000, likes:33000,username:"@racer", is_public:true},
];

export function playSound(type: "jump"|"win"|"pop"): void {
  try {
    const ctx = new (window.AudioContext||(window as any).webkitAudioContext)();
    const o=ctx.createOscillator(); const g=ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if(type==="jump"){
      o.frequency.setValueAtTime(300,ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(600,ctx.currentTime+0.1);
      g.gain.setValueAtTime(0.3,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.2);
      o.start(); o.stop(ctx.currentTime+0.2);
    }
    if(type==="win"){
      [523,659,784,1047].forEach((f,i)=>{
        const o2=ctx.createOscillator(); const g2=ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination); o2.frequency.value=f;
        g2.gain.setValueAtTime(0.2,ctx.currentTime+i*0.1);
        g2.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+i*0.1+0.15);
        o2.start(ctx.currentTime+i*0.1); o2.stop(ctx.currentTime+i*0.1+0.15);
      });
    }
    if(type==="pop"){
      o.frequency.setValueAtTime(800,ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(200,ctx.currentTime+0.1);
      g.gain.setValueAtTime(0.4,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.15);
      o.start(); o.stop(ctx.currentTime+0.15);
    }
  }catch(e){}
}

export function fmtNum(n:number):string {
  if(n>=1000000) return (n/1000000).toFixed(1)+"M";
  if(n>=1000) return (n/1000).toFixed(0)+"K";
  return String(n);
}
export function timeAgo(d:string):string {
  const m=Math.floor((Date.now()-new Date(d).getTime())/60000);
  if(m<1) return "vừa xong";
  if(m<60) return m+"p trước";
  const h=Math.floor(m/60);
  if(h<24) return h+"h trước";
  return Math.floor(h/24)+"d trước";
}

export function getThemeColors(theme: Theme) {
  if(theme==="light") return {
    bg:"#f0f2ff", bg2:"#ffffff", bg3:"#e8eaf6",
    border:"#d0d4f0", text:"#1a1a3e", text2:"#555577",
    card:"#ffffff", nav:"#ffffff", input:"#f0f2ff",
  };
  return {
    bg:"#0a0a18", bg2:"#16162e", bg3:"#111128",
    border:"#2a2a4a", text:"#ffffff", text2:"#aaaacc",
    card:"#16162e", nav:"#111128", input:"#1a1a3a",
  };
}

export function makeInputStyle(theme: Theme): React.CSSProperties {
  const t = getThemeColors(theme);
  return {
    width:"100%", padding:"11px 12px", borderRadius:10,
    background:t.input, border:"2px solid "+t.border,
    color:t.text, fontSize:14, outline:"none",
    marginBottom:10, boxSizing:"border-box", fontFamily:"inherit",
  };
}
export function makeSmallBtn(theme: Theme): React.CSSProperties {
  const t = getThemeColors(theme);
  return {
    background:t.bg3, border:"1px solid "+t.border,
    borderRadius:9, padding:"5px 10px",
    color:t.text2, fontSize:12, cursor:"pointer", fontFamily:"inherit",
  };
}
