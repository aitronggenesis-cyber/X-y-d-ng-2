// ─── types.ts ────────────────────────────────
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://mqaksaroqkrhkahxhffe.supabase.co";
export const SUPABASE_KEY = "sb_publishable_tH-P5KX8miYwC5qWT8H3qQ_j9CAoDzt";
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── TYPES ───────────────────────────────────
export interface Block {
  id: number;
  blockId: string;
  label: string;
  color: string;
}

export interface Game {
  id: string;
  name: string;
  thumb: string;
  sprite: string;
  blocks: Block[];
  user_id?: string;
  username?: string;
  is_public?: boolean;
  plays?: number;
  likes?: number;
  created_at?: string;
}

export interface Comment {
  id: string;
  game_id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  games_created: number;
  total_plays: number;
}

// ─── CONSTANTS ───────────────────────────────
export const CATEGORIES = [
  "🔥 Trending","🏃 Action","🧩 Puzzle","🌍 Adventure","⚔️ RPG","🏎️ Racing",
];

export const THUMBNAILS = [
  "🌋","🏝️","🌌","🏙️","🌲","🏔️","🌊","🎪","🛸","🏰","🎭","🌈",
];

export const SPRITES = [
  "🐱","🐶","🐸","🚀","⭐","🦊","🐲","🤖","👾","🦸",
];

export const BLOCK_CATEGORIES: Record<string, {
  label: string; color: string; bg: string;
  blocks: { id: string; label: string }[];
}> = {
  events: {
    label: "⚡ Sự kiện", color: "#FFB829", bg: "#2a1e00",
    blocks: [
      { id: "on_start", label: "🎮 Khi bắt đầu game" },
      { id: "on_tap",   label: "👆 Khi chạm vào" },
      { id: "on_key",   label: "⌨️ Khi nhấn phím" },
    ],
  },
  motion: {
    label: "🏃 Di chuyển", color: "#4F8EF7", bg: "#0d1e3a",
    blocks: [
      { id: "move_right", label: "➡ Đi phải 10" },
      { id: "move_left",  label: "⬅ Đi trái 10" },
      { id: "jump",       label: "⬆ Nhảy lên" },
      { id: "move_up",    label: "⬆ Đi lên 10" },
      { id: "move_down",  label: "⬇ Đi xuống 10" },
      { id: "spin",       label: "🔄 Xoay tròn" },
    ],
  },
  looks: {
    label: "👀 Ngoại hình", color: "#A259FF", bg: "#1a0d3a",
    blocks: [
      { id: "say",    label: "💬 Nói Xin chào!" },
      { id: "grow",   label: "🔍 Phóng to" },
      { id: "shrink", label: "🔎 Thu nhỏ" },
      { id: "hide",   label: "👻 Ẩn đi" },
      { id: "show",   label: "👁️ Hiện ra" },
      { id: "flash",  label: "✨ Nhấp nháy" },
    ],
  },
  sound: {
    label: "🔊 Âm thanh", color: "#00E5FF", bg: "#001e22",
    blocks: [
      { id: "play_jump", label: "🔊 Âm nhảy" },
      { id: "play_win",  label: "🏆 Âm thắng" },
      { id: "play_pop",  label: "💥 Âm pop" },
    ],
  },
  control: {
    label: "🔄 Điều khiển", color: "#FF6B6B", bg: "#2a0d0d",
    blocks: [
      { id: "repeat",    label: "🔁 Lặp lại 3 lần" },
      { id: "wait",      label: "⏳ Chờ 1 giây" },
      { id: "if_touch",  label: "🤔 Nếu chạm tường" },
      { id: "score_add", label: "⭐ +1 điểm" },
    ],
  },
};

export const TRENDING_GAMES: Game[] = [
  { id:"t1", name:"Sky Runner",    thumb:"🌌", sprite:"🚀", blocks:[], plays:2400000, likes:98000, username:"@nova" },
  { id:"t2", name:"Dungeon Quest", thumb:"🏰", sprite:"🐲", blocks:[], plays:1100000, likes:54000, username:"@dark" },
  { id:"t3", name:"Island Hop",    thumb:"🏝️", sprite:"🐸", blocks:[], plays:890000,  likes:41000, username:"@beach" },
  { id:"t4", name:"Speed Drift",   thumb:"🏎️", sprite:"🤖", blocks:[], plays:670000,  likes:33000, username:"@racer" },
];

// ─── HELPERS ─────────────────────────────────
export function playSound(type: "jump" | "win" | "pop"): void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if (type === "jump") {
      o.frequency.setValueAtTime(300, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      o.start(); o.stop(ctx.currentTime + 0.2);
    }
    if (type === "win") {
      [523,659,784,1047].forEach((freq, i) => {
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.value = freq;
        g2.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
        g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.15);
        o2.start(ctx.currentTime + i * 0.1);
        o2.stop(ctx.currentTime + i * 0.1 + 0.15);
      });
    }
    if (type === "pop") {
      o.frequency.setValueAtTime(800, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.4, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      o.start(); o.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {}
}

export function fmtNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return String(n);
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return m + " phút trước";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " giờ trước";
  return Math.floor(h / 24) + " ngày trước";
}

// ─── SHARED STYLES ───────────────────────────
export const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 12px", borderRadius: 10,
  background: "#1a1a3a", border: "2px solid #2a2a5a",
  color: "#fff", fontSize: 14, outline: "none",
  marginBottom: 10, boxSizing: "border-box",
};

export const smallBtn: React.CSSProperties = {
  background: "#1a1a3a", border: "1px solid #3a3a6a",
  borderRadius: 9, padding: "5px 10px",
  color: "#aaa", fontSize: 12, cursor: "pointer",
  fontFamily: "inherit",
};
  
