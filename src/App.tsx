import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// \u2500\u2500\u2500 SUPABASE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const SUPABASE_URL = "https://mqaksaroqkrhkahxhffe.supabase.co";
const SUPABASE_KEY = "sb_publishable_tH-P5KX8miYwC5qWT8H3qQ_j9CAoDzt";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// \u2500\u2500\u2500 TYPES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
interface Block {
  id: number;
  blockId: string;
  label: string;
  color: string;
}

interface Game {
  id: string;
  name: string;
  thumb: string;
  sprite: string;
  blocks: Block[];
  user_id?: string;
  is_public?: boolean;
  plays?: number;
  likes?: number;
  created_at?: string;
}

interface BlockDef {
  id: string;
  label: string;
}

interface BlockCategory {
  label: string;
  color: string;
  bg: string;
  blocks: BlockDef[];
}

interface LeaderboardEntry {
  id: string;
  username: string;
  games_created: number;
  total_plays: number;
}

// \u2500\u2500\u2500 CONSTANTS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const CATEGORIES: string[] = [
  "\ud83d\udd25 Trending","\ud83c\udfc3 Action","\ud83e\udde9 Puzzle","\ud83c\udf0d Adventure","\u2694\ufe0f RPG","\ud83c\udfce\ufe0f Racing"
];

const THUMBNAILS: string[] = [
  "\ud83c\udf0b","\ud83c\udfdd\ufe0f","\ud83c\udf0c","\ud83c\udfd9\ufe0f","\ud83c\udf32","\ud83c\udfd4\ufe0f","\ud83c\udf0a","\ud83c\udfaa","\ud83d\udef8","\ud83c\udff0","\ud83c\udfad","\ud83c\udf08"
];

const SPRITES: string[] = [
  "\ud83d\udc31","\ud83d\udc36","\ud83d\udc38","\ud83d\ude80","\u2b50","\ud83e\udd8a","\ud83d\udc32","\ud83e\udd16","\ud83d\udc7e","\ud83e\uddb8"
];

const BLOCK_CATEGORIES: Record<string, BlockCategory> = {
  events: {
    label: "\u26a1 S\u1ef1 ki\u1ec7n", color: "#FFB829", bg: "#2a1e00",
    blocks: [
      { id: "on_start", label: "\ud83c\udfae Khi b\u1eaft \u0111\u1ea7u game" },
      { id: "on_tap",   label: "\ud83d\udc46 Khi ch\u1ea1m v\u00e0o" },
      { id: "on_key",   label: "\u2328\ufe0f Khi nh\u1ea5n ph\u00edm" },
    ],
  },
  motion: {
    label: "\ud83c\udfc3 Di chuy\u1ec3n", color: "#4F8EF7", bg: "#0d1e3a",
    blocks: [
      { id: "move_right", label: "\u27a1 \u0110i ph\u1ea3i 10" },
      { id: "move_left",  label: "\u2b05 \u0110i tr\u00e1i 10" },
      { id: "jump",       label: "\u2b06 Nh\u1ea3y l\u00ean" },
      { id: "move_up",    label: "\u2b06 \u0110i l\u00ean 10" },
      { id: "move_down",  label: "\u2b07 \u0110i xu\u1ed1ng 10" },
      { id: "spin",       label: "\ud83d\udd04 Xoay tr\u00f2n" },
    ],
  },
  looks: {
    label: "\ud83d\udc40 Ngo\u1ea1i h\u00ecnh", color: "#A259FF", bg: "#1a0d3a",
    blocks: [
      { id: "say",   label: "\ud83d\udcac N\u00f3i Xin ch\u00e0o!" },
      { id: "grow",  label: "\ud83d\udd0d Ph\u00f3ng to" },
      { id: "shrink",label: "\ud83d\udd0e Thu nh\u1ecf" },
      { id: "hide",  label: "\ud83d\udc7b \u1ea8n \u0111i" },
      { id: "show",  label: "\ud83d\udc41\ufe0f Hi\u1ec7n ra" },
      { id: "flash", label: "\u2728 Nh\u1ea5p nh\u00e1y" },
    ],
  },
  sound: {
    label: "\ud83d\udd0a \u00c2m thanh", color: "#00E5FF", bg: "#001e22",
    blocks: [
      { id: "play_jump", label: "\ud83d\udd0a \u00c2m nh\u1ea3y" },
      { id: "play_win",  label: "\ud83c\udfc6 \u00c2m th\u1eafng" },
      { id: "play_pop",  label: "\ud83d\udca5 \u00c2m pop" },
    ],
  },
  control: {
    label: "\ud83d\udd04 \u0110i\u1ec1u khi\u1ec3n", color: "#FF6B6B", bg: "#2a0d0d",
    blocks: [
      { id: "repeat",    label: "\ud83d\udd01 L\u1eb7p l\u1ea1i 3 l\u1ea7n" },
      { id: "wait",      label: "\u23f3 Ch\u1edd 1 gi\u00e2y" },
      { id: "if_touch",  label: "\ud83e\udd14 N\u1ebfu ch\u1ea1m t\u01b0\u1eddng" },
      { id: "score_add", label: "\u2b50 +1 \u0111i\u1ec3m" },
    ],
  },
};

const TRENDING_GAMES: Game[] = [
  { id:"t1", name:"Sky Runner",    thumb:"\ud83c\udf0c", sprite:"\ud83d\ude80", blocks:[], author:"@nova",  plays:2400000, likes:98000 } as any,
  { id:"t2", name:"Dungeon Quest", thumb:"\ud83c\udff0", sprite:"\ud83d\udc32", blocks:[], author:"@dark",  plays:1100000, likes:54000 } as any,
  { id:"t3", name:"Island Hop",    thumb:"\ud83c\udfdd\ufe0f", sprite:"\ud83d\udc38", blocks:[], author:"@beach", plays:890000,  likes:41000 } as any,
  { id:"t4", name:"Speed Drift",   thumb:"\ud83c\udfce\ufe0f", sprite:"\ud83e\udd16", blocks:[], author:"@racer", plays:670000,  likes:33000 } as any,
];

// \u2500\u2500\u2500 SOUND ENGINE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function playSound(type: "jump" | "win" | "pop"): void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    if (type === "jump") {
      o.frequency.setValueAtTime(300, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      o.start(); o.stop(ctx.currentTime + 0.2);
    }
    if (type === "win") {
      [523, 659, 784, 1047].forEach((freq, i) => {
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

// \u2500\u2500\u2500 SHARED STYLES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 12px", borderRadius: 10,
  background: "#1a1a3a", border: "2px solid #2a2a5a",
  color: "#fff", fontSize: 14, outline: "none",
  marginBottom: 10, boxSizing: "border-box",
};

const smallBtn: React.CSSProperties = {
  background: "#1a1a3a", border: "1px solid #3a3a6a",
  borderRadius: 9, padding: "5px 10px",
  color: "#aaa", fontSize: 12, cursor: "pointer",
};

// \u2500\u2500\u2500 COMPONENTS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
interface ModalProps { children: React.ReactNode; onClose: () => void; }
function Modal({ children, onClose }: ModalProps) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#16162e", borderRadius: "22px 22px 0 0",
        padding: "20px 18px 36px", width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto",
      }}>
        <div style={{ width: 40, height: 4, background: "#3a3a6a", borderRadius: 2, margin: "0 auto 16px" }} />
        {children}
      </div>
    </div>
  );
}

interface TagProps { label: string; color: string; }
function Tag({ label, color }: TagProps) {
  return (
    <span style={{
      background: `${color}22`, border: `1px solid ${color}55`,
      borderRadius: 20, padding: "2px 8px", fontSize: 10, color, fontWeight: 700,
    }}>{label}</span>
  );
}

// \u2500\u2500\u2500 AUTH SCREEN \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
interface AuthScreenProps { onAuth: (user: User) => void; }
function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode]     = useState<"login" | "signup">("login");
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [name, setName]     = useState("");
  const [err, setErr]       = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(""); setLoading(true);
    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) setErr(error.message);
      else if (data.user) onAuth(data.user);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email, password: pass, options: { data: { username: name } },
      });
      if (error) setErr(error.message);
      else if (data.user) onAuth(data.user);
      else setErr("Ki\u1ec3m tra email \u0111\u1ec3 x\u00e1c nh\u1eadn!");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a18", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "'Nunito',sans-serif", color: "#fff",
    }}>
      <div style={{ fontSize: 52, marginBottom: 8 }}>\ud83c\udfae</div>
      <div style={{
        fontWeight: 900, fontSize: 26, marginBottom: 4,
        background: "linear-gradient(90deg,#4F8EF7,#A259FF)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>GameBuilder</div>
      <div style={{ fontSize: 12, color: "#555", marginBottom: 32, letterSpacing: 1 }}>
        T\u1ea0O GAME KH\u00d4NG C\u1ea6N CODE
      </div>

      <div style={{ width: "100%", maxWidth: 380, background: "#16162e", borderRadius: 20, padding: 24 }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#0d0d1a", borderRadius: 12, padding: 4 }}>
          {(["login", "signup"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "8px", borderRadius: 10, border: "none",
              background: mode === m ? "#4F8EF7" : "transparent",
              color: mode === m ? "#fff" : "#555", fontWeight: 800, fontSize: 13, cursor: "pointer",
            }}>
              {m === "login" ? "\u0110\u0103ng nh\u1eadp" : "\u0110\u0103ng k\u00fd"}
            </button>
          ))}
        </div>

        {mode === "signup" && (
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="T\u00ean hi\u1ec3n th\u1ecb..." style={inputStyle} />
        )}
        <input value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email..." type="email" style={inputStyle} />
        <input value={pass} onChange={e => setPass(e.target.value)}
          placeholder="M\u1eadt kh\u1ea9u..." type="password" style={inputStyle}
          onKeyDown={e => e.key === "Enter" && submit()} />

        {err && <div style={{ color: "#ff6b6b", fontSize: 12, marginBottom: 10, textAlign: "center" }}>{err}</div>}

        <button onClick={submit} disabled={loading || !email || !pass} style={{
          width: "100%", padding: "13px",
          background: (!email || !pass) ? "#2a2a4a" : "linear-gradient(135deg,#4F8EF7,#A259FF)",
          border: "none", borderRadius: 12, color: "#fff", fontWeight: 900, fontSize: 15,
          cursor: (!email || !pass) ? "not-allowed" : "pointer",
        }}>
          {loading ? "\u23f3 \u0110ang x\u1eed l\u00fd..." : mode === "login" ? "\ud83d\ude80 \u0110\u0103ng nh\u1eadp" : "\u2728 T\u1ea1o t\u00e0i kho\u1ea3n"}
        </button>
      </div>
    </div>
  );
}

// \u2500\u2500\u2500 EDITOR \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
interface EditorProps {
  game: Game;
  user: User;
  onBack: () => void;
  onSave: (g: Game) => void;
}

function Editor({ game, user, onBack, onSave }: EditorProps) {
  const [tab, setTab]         = useState<"blocks" | "script" | "preview">("blocks");
  const [cat, setCat]         = useState("events");
  const [blocks, setBlocks]   = useState<Block[]>(game.blocks || []);
  const [sprite, setSprite]   = useState(game.sprite || "\ud83d\udc31");
  const [running, setRunning] = useState(false);
  const [log, setLog]         = useState<string[]>([]);
  const [pos, setPos]         = useState({ x: 40, y: 55 });
  const [scale, setScale]     = useState(1);
  const [bubble, setBubble]   = useState<string | null>(null);
  const [hidden, setHidden]   = useState(false);
  const [score, setScore]     = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flash, setFlash]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const nid = useRef(100);

  const addBlock = (b: BlockDef, catKey: string) => {
    const newBlock: Block = {
      id: nid.current++,
      blockId: b.id,
      label: b.label,
      color: BLOCK_CATEGORIES[catKey].color,
    };
    setBlocks(prev => [...prev, newBlock]);
    setTab("script");
  };

  const run = async () => {
    setRunning(true); setLog([]); setPos({ x: 40, y: 55 }); setScale(1);
    setBubble(null); setHidden(false); setScore(0); setRotation(0); setFlash(false);
    setTab("preview");

    const l: string[] = [];
    const push = (msg: string) => { l.push(msg); setLog([...l]); };

    for (const b of blocks) {
      await new Promise(r => setTimeout(r, 480));
      switch (b.blockId) {
        case "on_start":   push("\ud83c\udfae Game b\u1eaft \u0111\u1ea7u!"); break;
        case "on_tap":     push("\ud83d\udc46 Ch\u1edd ch\u1ea1m..."); break;
        case "on_key":     push("\u2328\ufe0f Ch\u1edd ph\u00edm..."); break;
        case "move_right": setPos(p => ({ ...p, x: Math.min(p.x + 18, 78) })); push(`\u25b6 ${sprite} \u0111i ph\u1ea3i`); break;
        case "move_left":  setPos(p => ({ ...p, x: Math.max(p.x - 18, 5) }));  push(`\u25c0 ${sprite} \u0111i tr\u00e1i`); break;
        case "move_up":    setPos(p => ({ ...p, y: Math.max(p.y - 14, 10) })); push(`\u2b06 ${sprite} \u0111i l\u00ean`); break;
        case "move_down":  setPos(p => ({ ...p, y: Math.min(p.y + 14, 80) })); push(`\u2b07 ${sprite} \u0111i xu\u1ed1ng`); break;
        case "jump":
          setPos(p => ({ ...p, y: p.y - 24 })); playSound("jump");
          await new Promise(r => setTimeout(r, 300));
          setPos(p => ({ ...p, y: p.y + 24 })); push(`\u2b06 ${sprite} nh\u1ea3y!`); break;
        case "spin":       setRotation(r => r + 360); push(`\ud83d\udd04 ${sprite} xoay!`); break;
        case "say":
          setBubble("Xin ch\u00e0o!"); push(`\ud83d\udcac ${sprite}: Xin ch\u00e0o!`);
          await new Promise(r => setTimeout(r, 1200)); setBubble(null); break;
        case "grow":       setScale(s => Math.min(s + 0.3, 2.2)); push("\ud83d\udd0d To ra"); break;
        case "shrink":     setScale(s => Math.max(s - 0.3, 0.4)); push("\ud83d\udd0e Nh\u1ecf l\u1ea1i"); break;
        case "hide":       setHidden(true);  push("\ud83d\udc7b \u1ea8n \u0111i"); break;
        case "show":       setHidden(false); push("\ud83d\udc41\ufe0f Hi\u1ec7n ra"); break;
        case "flash":
          setFlash(true); await new Promise(r => setTimeout(r, 400));
          setFlash(false); push("\u2728 Nh\u1ea5p nh\u00e1y!"); break;
        case "play_jump":  playSound("jump"); push("\ud83d\udd0a Jump!"); break;
        case "play_win":   playSound("win");  push("\ud83c\udfc6 Win!"); break;
        case "play_pop":   playSound("pop");  push("\ud83d\udca5 Pop!"); break;
        case "repeat":     push("\ud83d\udd01 L\u1eb7p 3 l\u1ea7n"); break;
        case "wait":       push("\u23f3 \u0110ang ch\u1edd..."); await new Promise(r => setTimeout(r, 1000)); break;
        case "if_touch":   push("\ud83e\udd14 Ki\u1ec3m tra va ch\u1ea1m..."); break;
        case "score_add":  setScore(s => s + 1); playSound("pop"); push("\u2b50 +1 \u0111i\u1ec3m!"); break;
      }
    }
    playSound("win"); push("\ud83c\udfc1 Xong!"); setRunning(false);
  };

  const save = async () => {
    setSaving(true);
    const payload = { name: game.name, thumb: game.thumb, sprite, blocks, user_id: user.id };
    let updated = { ...game, sprite, blocks };

    if (game.id && !game.id.startsWith("local")) {
      await supabase.from("games").update(payload).eq("id", game.id);
    } else {
      const { data } = await supabase.from("games").insert({ ...payload, is_public: false }).select().single();
      if (data) updated = { ...updated, id: data.id };
    }
    setSaving(false);
    onSave(updated);
  };

  const shareGame = async () => {
    if (!game.id || game.id.startsWith("local")) {
      alert("H\u00e3y l\u01b0u game tr\u01b0\u1edbc khi share!"); return;
    }
    await supabase.from("games").update({ is_public: true }).eq("id", game.id);
    const link = `${window.location.origin}?game=${game.id}`;
    if (navigator.share) navigator.share({ title: game.name, url: link });
    else { navigator.clipboard?.writeText(link); alert("\u0110\u00e3 copy link: " + link); }
  };

  const stageArea = (size: number) => (
    <div style={{
      background: "linear-gradient(180deg,#0a1628,#0d1e36 70%,#0a1010)",
      flex: `0 0 ${size}%`, position: "relative", overflow: "hidden",
    }}>
      {[...Array(14)].map((_, i) => (
        <div key={i} style={{
          position: "absolute", width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
          background: "#fff", borderRadius: "50%",
          left: `${(i *
