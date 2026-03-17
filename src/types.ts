import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://mqaksaroqkrhkahxhffe.supabase.co",
  "sb_publishable_tH-P5KX8miYwC5qWT8H3qQ_j9CAoDzt"
);

// ── TYPES ────────────────────────────────────
export interface Block { id: number; blockId: string; label: string; color: string; value?: string; }

export interface GameVariable {
  id: string; name: string; defaultValue: string; varType: "number"|"text"|"boolean";
}

export interface SpriteActor {
  id: number; emoji: string; name: string; blocks: Block[];
  pos: {x:number;y:number}; scale: number; rotation: number;
  hidden: boolean; color: string; autoRun: boolean;
}

export interface Game {
  id: string; name: string; thumb: string; sprite: string; blocks: Block[];
  actors?: SpriteActor[]; variables?: GameVariable[];
  bgMusic?: string; bgColor?: string; groundColor?: string;
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

export interface UserStats {
  id: string; username: string; avatar: string;
  xp: number; level: number; games_created: number; total_plays: number;
}

export interface Particle {
  id: number; x: number; y: number;
  vx: number; vy: number; life: number; emoji: string; size: number;
}

export type Theme = "dark"|"light";

// ── CONSTANTS ────────────────────────────────
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

export const BG_COLORS = [
  {label:"🌌 Vũ trụ", sky:"linear-gradient(180deg,#0a1628,#0d1e36)", ground:"linear-gradient(180deg,#163016,#0a1a0a)", groundBorder:"#2a5a2a"},
  {label:"🌅 Hoàng hôn", sky:"linear-gradient(180deg,#ff7043,#ff8a65 50%,#ffb74d)", ground:"linear-gradient(180deg,#4a2400,#2a1400)", groundBorder:"#6a3400"},
  {label:"🌊 Đại dương", sky:"linear-gradient(180deg,#0288d1,#29b6f6 50%,#81d4fa)", ground:"linear-gradient(180deg,#1a3a1a,#0d2a0d)", groundBorder:"#2a6a2a"},
  {label:"🌸 Mùa xuân", sky:"linear-gradient(180deg,#f8bbd9,#fce4ec 50%,#fff9c4)", ground:"linear-gradient(180deg,#2e7d32,#1b5e20)", groundBorder:"#4caf50"},
  {label:"❄️ Tuyết", sky:"linear-gradient(180deg,#b3e5fc,#e1f5fe 50%,#ffffff)", ground:"linear-gradient(180deg,#e0e0e0,#bdbdbd)", groundBorder:"#9e9e9e"},
];

export const MUSIC_TRACKS = [
  {id:"none",   label:"🔇 Không nhạc"},
  {id:"happy",  label:"🎵 Vui tươi"},
  {id:"epic",   label:"⚔️ Hùng tráng"},
  {id:"chill",  label:"🌊 Nhẹ nhàng"},
  {id:"spooky", label:"👻 Bí ẩn"},
];

// ── GAME TEMPLATES ────────────────────────────
export const GAME_TEMPLATES: {id:string;name:string;thumb:string;desc:string;sprite:string;blocks:Block[];variables:GameVariable[]}[] = [
  {
    id:"runner",name:"🏃 Auto Runner",thumb:"🌌",desc:"Nhân vật tự chạy, nhảy tránh vật cản",
    sprite:"🐱",
    blocks:[
      {id:1,blockId:"on_start",label:"🎮 Khi bắt đầu",color:"#FFB829"},
      {id:2,blockId:"say",label:"💬 Nói xin chào",color:"#A259FF"},
      {id:3,blockId:"repeat",label:"🔁 Lặp 3 lần",color:"#FF6B6B"},
      {id:4,blockId:"move_right",label:"➡ Đi phải",color:"#4F8EF7"},
      {id:5,blockId:"jump",label:"⬆ Nhảy",color:"#4F8EF7"},
      {id:6,blockId:"score_add",label:"⭐ +1 điểm",color:"#FF6B6B"},
      {id:7,blockId:"play_win",label:"🏆 Âm thắng",color:"#00E5FF"},
    ],
    variables:[{id:"v1",name:"speed",defaultValue:"5",varType:"number"},{id:"v2",name:"lives",defaultValue:"3",varType:"number"}],
  },
  {
    id:"adventure",name:"🗺️ Adventure",thumb:"🏰",desc:"Khám phá thế giới, thu thập điểm",
    sprite:"🦸",
    blocks:[
      {id:1,blockId:"on_start",label:"🎮 Khi bắt đầu",color:"#FFB829"},
      {id:2,blockId:"move_right",label:"➡ Đi phải",color:"#4F8EF7"},
      {id:3,blockId:"move_right",label:"➡ Đi phải",color:"#4F8EF7"},
      {id:4,blockId:"score_add",label:"⭐ +1 điểm",color:"#FF6B6B"},
      {id:5,blockId:"particle_coins",label:"💰 Mưa coin",color:"#FF6BCB"},
      {id:6,blockId:"jump",label:"⬆ Nhảy",color:"#4F8EF7"},
      {id:7,blockId:"score_add",label:"⭐ +1 điểm",color:"#FF6B6B"},
    ],
    variables:[{id:"v1",name:"score",defaultValue:"0",varType:"number"},{id:"v2",name:"level",defaultValue:"1",varType:"number"},{id:"v3",name:"player_name",defaultValue:"Hero",varType:"text"}],
  },
  {
    id:"dance",name:"💃 Dance Show",thumb:"🎭",desc:"Nhân vật nhảy múa theo nhịp",
    sprite:"🎭",
    blocks:[
      {id:1,blockId:"on_start",label:"🎮 Khi bắt đầu",color:"#FFB829"},
      {id:2,blockId:"spin",label:"🔄 Xoay",color:"#4F8EF7"},
      {id:3,blockId:"particle_hearts",label:"❤️ Tim bay",color:"#FF6BCB"},
      {id:4,blockId:"grow",label:"🔍 To ra",color:"#A259FF"},
      {id:5,blockId:"particle_stars",label:"⭐ Tung sao",color:"#FF6BCB"},
      {id:6,blockId:"shrink",label:"🔎 Nhỏ lại",color:"#A259FF"},
      {id:7,blockId:"play_win",label:"🏆 Âm thắng",color:"#00E5FF"},
    ],
    variables:[{id:"v1",name:"beat",defaultValue:"120",varType:"number"}],
  },
  {
    id:"blank",name:"⬜ Trống",thumb:"🌟",desc:"Bắt đầu từ đầu",
    sprite:"🐱",blocks:[],variables:[],
  },
];

// ── XP SYSTEM ────────────────────────────────
export function xpForLevel(level: number): number { return level * 100; }
export function getLevelFromXP(xp: number): number {
  let level = 1;
  let total = 0;
  while (total + xpForLevel(level) <= xp) { total += xpForLevel(level); level++; }
  return level;
}
export function getXPProgress(xp: number): number {
  const level = getLevelFromXP(xp);
  let total = 0;
  for(let i=1;i<level;i++) total+=xpForLevel(i);
  const current = xp - total;
  const needed = xpForLevel(level);
  return Math.round((current/needed)*100);
}
export const LEVEL_TITLES = ["","🌱 Mầm","🌿 Lá","🌸 Hoa","⭐ Sao","💫 Siêu sao","🏆 Huyền thoại","💎 Thần","👑 Vua","🌟 Bất tử","🔥 Vô địch"];

// ── BLOCK CATEGORIES ─────────────────────────
export const BLOCK_CATS: Record<string,{label:string;color:string;bg:string;blocks:{id:string;label:string;hasValue?:boolean}[]}> = {
  events:  {label:"⚡ Sự kiện",   color:"#FFB829",bg:"#2a1e00",
    blocks:[{id:"on_start",label:"🎮 Khi bắt đầu"},{id:"on_tap",label:"👆 Khi chạm"},{id:"on_key",label:"⌨️ Khi nhấn"},{id:"on_score",label:"🎯 Khi đủ điểm"}]},
  motion:  {label:"🏃 Di chuyển", color:"#4F8EF7",bg:"#0d1e3a",
    blocks:[{id:"move_right",label:"➡ Đi phải",hasValue:true},{id:"move_left",label:"⬅ Đi trái",hasValue:true},{id:"jump",label:"⬆ Nhảy"},{id:"move_up",label:"⬆ Lên",hasValue:true},{id:"move_down",label:"⬇ Xuống",hasValue:true},{id:"spin",label:"🔄 Xoay"},{id:"teleport",label:"🌀 Dịch chuyển"}]},
  looks:   {label:"👀 Ngoại hình",color:"#A259FF",bg:"#1a0d3a",
    blocks:[{id:"say",label:"💬 Nói xin chào",hasValue:true},{id:"grow",label:"🔍 To ra"},{id:"shrink",label:"🔎 Nhỏ lại"},{id:"hide",label:"👻 Ẩn"},{id:"show",label:"👁️ Hiện"},{id:"flash",label:"✨ Nháy"},{id:"change_color",label:"🎨 Đổi màu"}]},
  sound:   {label:"🔊 Âm thanh",  color:"#00E5FF",bg:"#001e22",
    blocks:[{id:"play_jump",label:"🔊 Âm nhảy"},{id:"play_win",label:"🏆 Âm thắng"},{id:"play_pop",label:"💥 Âm pop"},{id:"play_sad",label:"😢 Âm thua"}]},
  effects: {label:"✨ Hiệu ứng",  color:"#FF6BCB",bg:"#2a001e",
    blocks:[{id:"particle_stars",label:"⭐ Tung sao"},{id:"particle_fire",label:"🔥 Phun lửa"},{id:"particle_hearts",label:"❤️ Tim bay"},{id:"particle_coins",label:"💰 Mưa coin"},{id:"particle_snow",label:"❄️ Tuyết rơi"}]},
  variables:{label:"📊 Biến số",  color:"#00C853",bg:"#001a00",
    blocks:[{id:"score_add",label:"⭐ +1 điểm"},{id:"score_set",label:"📌 Đặt điểm",hasValue:true},{id:"var_add",label:"📈 Tăng biến",hasValue:true},{id:"show_score",label:"💯 Hiện điểm"},{id:"if_score",label:"🎯 Nếu điểm >= ",hasValue:true}]},
  control: {label:"🔄 Điều khiển",color:"#FF6B6B",bg:"#2a0d0d",
    blocks:[{id:"repeat",label:"🔁 Lặp",hasValue:true},{id:"wait",label:"⏳ Chờ",hasValue:true},{id:"if_touch",label:"🤔 Nếu chạm"},{id:"forever",label:"♾️ Lặp mãi"},{id:"stop",label:"⏹ Dừng"}]},
};

export const DEMO_GAMES: Game[] = [
  {id:"t1",name:"Sky Runner",  thumb:"🌌",sprite:"🚀",blocks:[],plays:2400000,likes:98000,username:"@nova",  is_public:true},
  {id:"t2",name:"Dungeon Quest",thumb:"🏰",sprite:"🐲",blocks:[],plays:1100000,likes:54000,username:"@dark",  is_public:true},
  {id:"t3",name:"Island Hop",  thumb:"🏝️",sprite:"🐸",blocks:[],plays:890000, likes:41000,username:"@beach", is_public:true},
  {id:"t4",name:"Speed Drift", thumb:"🏎️",sprite:"🤖",blocks:[],plays:670000, likes:33000,username:"@racer", is_public:true},
];

// ── HELPERS ──────────────────────────────────
export function playSound(type: "jump"|"win"|"pop"|"sad"): void {
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
    if(type==="sad"){
      o.frequency.setValueAtTime(400,ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(200,ctx.currentTime+0.3);
      g.gain.setValueAtTime(0.3,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.4);
      o.start(); o.stop(ctx.currentTime+0.4);
    }
  }catch(e){}
}

export function playBgMusic(trackId: string): OscillatorNode|null {
  if(trackId==="none") return null;
  try {
    const ctx = new (window.AudioContext||(window as any).webkitAudioContext)();
    const freqs: Record<string,number[]> = {
      happy:  [523,659,784,659],
      epic:   [220,277,330,220],
      chill:  [440,494,523,494],
      spooky: [196,220,196,185],
    };
    const notes = freqs[trackId]||freqs.happy;
    let i=0;
    const play=()=>{
      const o=ctx.createOscillator(); const g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value=notes[i%notes.length];
      g.gain.setValueAtTime(0.05,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);
      o.start(); o.stop(ctx.currentTime+0.4);
      i++;
      setTimeout(play,500);
    };
    play();
    return null;
  }catch(e){ return null; }
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
    bg:"#f0f2ff",bg2:"#ffffff",bg3:"#e8eaf6",
    border:"#d0d4f0",text:"#1a1a3e",text2:"#555577",
    card:"#ffffff",nav:"#ffffff",input:"#f0f2ff",
  };
  return {
    bg:"#0a0a18",bg2:"#16162e",bg3:"#111128",
    border:"#2a2a4a",text:"#ffffff",text2:"#aaaacc",
    card:"#16162e",nav:"#111128",input:"#1a1a3a",
  };
}
export function makeInputStyle(theme: Theme): React.CSSProperties {
  const t=getThemeColors(theme);
  return {width:"100%",padding:"11px 12px",borderRadius:10,
    background:t.input,border:"2px solid "+t.border,
    color:t.text,fontSize:14,outline:"none",
    marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"};
}
export function makeSmallBtn(theme: Theme): React.CSSProperties {
  const t=getThemeColors(theme);
  return {background:t.bg3,border:"1px solid "+t.border,borderRadius:9,
    padding:"5px 10px",color:t.text2,fontSize:12,cursor:"pointer",fontFamily:"inherit"};
}

export async function addXP(userId: string, amount: number, username: string, avatar: string) {
  const {data}=await supabase.from("user_stats").select("*").eq("id",userId).single();
  if(data){
    await supabase.from("user_stats").update({
      xp:(data.xp||0)+amount,
      level:getLevelFromXP((data.xp||0)+amount),
      updated_at:new Date().toISOString(),
    }).eq("id",userId);
  } else {
    await supabase.from("user_stats").insert({
      id:userId,username,avatar,xp:amount,level:getLevelFromXP(amount),
      games_created:0,total_plays:0,
    });
  }
}
