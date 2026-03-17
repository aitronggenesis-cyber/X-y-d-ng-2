import { useState, useRef, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import {
  supabase, playSound, fmtNum, timeAgo, inputStyle, smallBtn,
  CATEGORIES, THUMBNAILS, SPRITES, BLOCK_CATEGORIES, TRENDING_GAMES,
  Game, Block, Comment, Notification,
} from "./types";

// ─── MODAL ──────────────────────────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.85)",
      display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:300,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:"#16162e", borderRadius:"22px 22px 0 0",
        padding:"20px 18px 36px", width:"100%", maxWidth:480, maxHeight:"88vh", overflowY:"auto",
      }}>
        <div style={{width:40,height:4,background:"#3a3a6a",borderRadius:2,margin:"0 auto 16px"}}/>
        {children}
      </div>
    </div>
  );
}

// ─── STAGE (no backticks!) ───────────────────
interface StageProps {
  sprite:string; pos:{x:number;y:number}; scale:number;
  hidden:boolean; flash:boolean; rotation:number;
  bubble:string|null; score:number; running:boolean;
}
function Stage({sprite,pos,scale,hidden,flash,rotation,bubble,score,running}:StageProps) {
  const starData = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
  return (
    <div style={{position:"relative",width:"100%",height:"100%",overflow:"hidden",
      background:"linear-gradient(180deg,#0a1628,#0d1e36 70%,#0a1010)"}}>
      {starData.map(i => (
        <div key={i} style={{
          position:"absolute",
          width: i%3===0 ? 3 : 2,
          height: i%3===0 ? 3 : 2,
          background:"#fff", borderRadius:"50%",
          left: String((i*43+7)%94)+"%",
          top:  String((i*31+8)%78)+"%",
          opacity:0.3,
        }}/>
      ))}
      <div style={{
        position:"absolute",bottom:0,left:0,right:0,height:32,
        background:"linear-gradient(180deg,#163016,#0a1a0a)",borderTop:"2px solid #2a5a2a",
      }}/>
      {bubble && (
        <div style={{
          position:"absolute",
          left: String(Math.min(pos.x+6,58))+"%",
          top:  String(Math.max(pos.y-26,4))+"%",
          background:"#fff",color:"#000",padding:"4px 10px",
          borderRadius:10,fontSize:12,fontWeight:800,
          whiteSpace:"nowrap",boxShadow:"0 2px 8px rgba(0,0,0,0.4)",zIndex:10,
        }}>
          {bubble}
          <div style={{position:"absolute",bottom:-7,left:10,width:0,height:0,
            borderLeft:"7px solid transparent",borderRight:"7px solid transparent",borderTop:"7px solid #fff"}}/>
        </div>
      )}
      <div style={{
        position:"absolute",
        left: String(pos.x)+"%",
        bottom: String(100-pos.y)+"%",
        fontSize: 34*scale,
        transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        transform:"rotate("+String(rotation)+"deg)",
        opacity: hidden ? 0 : flash ? 0.2 : 1,
        filter: running ? "drop-shadow(0 0 10px #4F8EF7)" : "none",
      }}>{sprite}</div>
      <div style={{
        position:"absolute",top:6,left:8,background:"rgba(0,0,0,0.55)",
        borderRadius:8,padding:"2px 8px",fontSize:12,fontWeight:800,color:"#fff",
      }}>{"⭐ "+score}</div>
    </div>
  );
}

// ─── GAME ENGINE LOGIC ───────────────────────
async function runBlocks(
  blocks: Block[],
  sprite: string,
  callbacks: {
    setPos: React.Dispatch<React.SetStateAction<{x:number;y:number}>>;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    setBubble: React.Dispatch<React.SetStateAction<string|null>>;
    setHidden: React.Dispatch<React.SetStateAction<boolean>>;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    setRotation: React.Dispatch<React.SetStateAction<number>>;
    setFlash: React.Dispatch<React.SetStateAction<boolean>>;
    setLog: React.Dispatch<React.SetStateAction<string[]>>;
    setRunning: React.Dispatch<React.SetStateAction<boolean>>;
  }
) {
  const {setPos,setScale,setBubble,setHidden,setScore,setRotation,setFlash,setLog,setRunning} = callbacks;
  const l: string[] = [];
  const push = (msg:string) => { l.push(msg); setLog([...l]); };
  for (const b of blocks) {
    await new Promise(r => setTimeout(r,480));
    switch(b.blockId) {
      case "on_start":   push("🎮 Bắt đầu!"); break;
      case "on_tap":     push("👆 Chờ chạm..."); break;
      case "on_key":     push("⌨️ Chờ phím..."); break;
      case "move_right": setPos(p=>({...p,x:Math.min(p.x+18,78)})); push("▶ Đi phải"); break;
      case "move_left":  setPos(p=>({...p,x:Math.max(p.x-18,5)}));  push("◀ Đi trái"); break;
      case "move_up":    setPos(p=>({...p,y:Math.max(p.y-14,10)})); push("⬆ Đi lên"); break;
      case "move_down":  setPos(p=>({...p,y:Math.min(p.y+14,80)})); push("⬇ Đi xuống"); break;
      case "jump":
        setPos(p=>({...p,y:p.y-24})); playSound("jump");
        await new Promise(r=>setTimeout(r,300));
        setPos(p=>({...p,y:p.y+24})); push("⬆ Nhảy!"); break;
      case "spin": setRotation(r=>r+360); push("🔄 Xoay!"); break;
      case "say":
        setBubble("Xin chào!"); push("💬 Xin chào!");
        await new Promise(r=>setTimeout(r,1200)); setBubble(null); break;
      case "grow":   setScale(s=>Math.min(s+0.3,2.2)); push("🔍 To ra"); break;
      case "shrink": setScale(s=>Math.max(s-0.3,0.4)); push("🔎 Nhỏ lại"); break;
      case "hide":   setHidden(true);  push("👻 Ẩn"); break;
      case "show":   setHidden(false); push("👁️ Hiện"); break;
      case "flash":
        setFlash(true); await new Promise(r=>setTimeout(r,400));
        setFlash(false); push("✨ Flash!"); break;
      case "play_jump": playSound("jump"); push("🔊 Jump!"); break;
      case "play_win":  playSound("win");  push("🏆 Win!"); break;
      case "play_pop":  playSound("pop");  push("💥 Pop!"); break;
      case "repeat": push("🔁 Lặp 3 lần"); break;
      case "wait":   push("⏳ Chờ..."); await new Promise(r=>setTimeout(r,1000)); break;
      case "score_add": setScore(s=>s+1); playSound("pop"); push("⭐ +1!"); break;
    }
  }
  playSound("win"); push("🏁 Xong!"); setRunning(false);
}

// ─── GAME PLAYER ────────────────────────────
function GamePlayer({game,user,onBack}:{game:Game;user:User|null;onBack:()=>void}) {
  const [running,setRunning] = useState(false);
  const [log,setLog]         = useState<string[]>([]);
  const [pos,setPos]         = useState({x:40,y:55});
  const [scale,setScale]     = useState(1);
  const [bubble,setBubble]   = useState<string|null>(null);
  const [hidden,setHidden]   = useState(false);
  const [score,setScore]     = useState(0);
  const [rotation,setRotation] = useState(0);
  const [flash,setFlash]     = useState(false);
  const [done,setDone]       = useState(false);
  const [liked,setLiked]     = useState(game.liked||false);
  const [likeCount,setLikeCount] = useState(game.likes||0);
  const [showComments,setShowComments] = useState(false);

  const resetState = () => {
    setPos({x:40,y:55}); setScale(1); setBubble(null);
    setHidden(false); setScore(0); setRotation(0); setFlash(false); setDone(false);
  };

  const play = async () => {
    if(running) return;
    setRunning(true); setLog([]); resetState();
    await runBlocks(game.blocks,"",{setPos,setScale,setBubble,setHidden,setScore,setRotation,setFlash,setLog,setRunning});
    setDone(true);
    if(game.id && !game.id.startsWith("t")) {
      await supabase.from("games").update({plays:(game.plays||0)+1}).eq("id",game.id);
    }
  };

  const toggleLike = async () => {
    if(!user) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(c => newLiked ? c+1 : c-1);
    if(game.id && !game.id.startsWith("t")) {
      await supabase.from("games").update({likes: newLiked ? (game.likes||0)+1 : Math.max((game.likes||0)-1,0)}).eq("id",game.id);
    }
  };

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",
      background:"#0a0a18",color:"#fff",fontFamily:"'Nunito',sans-serif",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:"linear-gradient(135deg,#1a1a3e,#16213e)",borderBottom:"2px solid #2a2a5a",
        padding:"10px 14px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <button onClick={onBack} style={smallBtn}>← Về</button>
        <span style={{fontSize:22}}>{game.thumb}</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:900,fontSize:15}}>{game.name}</div>
          <div style={{fontSize:10,color:"#7c7caa"}}>{"by "+(game.username||"ẩn danh")}</div>
        </div>
        <button onClick={toggleLike} style={{
          background: liked ? "#ff6b6b22" : "#1a1a3a",
          border: liked ? "1px solid #ff6b6b66" : "1px solid #3a3a6a",
          borderRadius:10, padding:"6px 10px", cursor:"pointer",
          color: liked ? "#ff6b6b" : "#aaa", fontSize:12, fontFamily:"inherit",
        }}>
          {liked ? "❤️" : "🤍"}{" "+fmtNum(likeCount)}
        </button>
        <button onClick={()=>setShowComments(true)} style={{...smallBtn,fontSize:12}}>💬</button>
        <button onClick={play} disabled={running} style={{
          background: running ? "#1a1a3a" : "linear-gradient(135deg,#00c853,#00e676)",
          border:"none",borderRadius:12,padding:"8px 16px",
          color: running ? "#555" : "#000",fontWeight:900,fontSize:14,
          cursor: running ? "not-allowed" : "pointer",
          boxShadow: running ? "none" : "0 0 16px #00c85344",
          fontFamily:"inherit",
        }}>{running ? "⏳" : "▶ Chơi"}</button>
      </div>

      <div style={{flex:"0 0 55%",position:"relative"}}>
        <Stage sprite={game.sprite} pos={pos} scale={scale} hidden={hidden}
          flash={flash} rotation={rotation} bubble={bubble} score={score} running={running}/>
        {done && (
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.65)",
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
            <div style={{fontSize:48}}>🏆</div>
            <div style={{fontSize:20,fontWeight:900}}>{"Xong! ⭐ "+score+" điểm"}</div>
            <button onClick={play} style={{
              background:"linear-gradient(135deg,#4F8EF7,#A259FF)",border:"none",
              borderRadius:12,padding:"10px 24px",color:"#fff",fontWeight:900,
              fontSize:15,cursor:"pointer",fontFamily:"inherit",
            }}>🔄 Chơi lại</button>
          </div>
        )}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"8px 12px",borderTop:"1px solid #2a2a4a"}}>
        <div style={{fontSize:9,color:"#4a4a7a",letterSpacing:1.5,marginBottom:5}}>LOG</div>
        {log.length===0
          ? <div style={{color:"#3a3a6a",fontSize:12,textAlign:"center",marginTop:10}}>Nhấn ▶ Chơi để bắt đầu</div>
          : log.map((l,i)=>(
            <div key={i} style={{fontSize:12,padding:"2px 6px",borderRadius:5,marginBottom:2,
              color:i===log.length-1?"#ccd":"#6a6a8a",
              borderLeft:i===log.length-1?"3px solid #4F8EF7":"3px solid transparent"}}>{l}</div>
          ))
        }
      </div>

      {showComments && user && (
        <CommentsSheet game={game} user={user} onClose={()=>setShowComments(false)}/>
      )}
    </div>
  );
}

// ─── COMMENTS ───────────────────────────────
function CommentsSheet({game,user,onClose}:{game:Game;user:User;onClose:()=>void}) {
  const [comments,setComments] = useState<Comment[]>([]);
  const [text,setText]         = useState("");
  const [loading,setLoading]   = useState(true);
  const username = (user.user_metadata?.username as string)||user.email?.split("@")[0]||"Bạn";

  useEffect(()=>{
    supabase.from("comments").select("*").eq("game_id",game.id)
      .order("created_at",{ascending:true})
      .then(({data})=>{if(data)setComments(data as Comment[]);setLoading(false);});
  },[game.id]);

  const send = async () => {
    if(!text.trim()) return;
    const c={game_id:game.id,user_id:user.id,username,content:text.trim()};
    const {data}=await supabase.from("comments").insert(c).select().single();
    if(data) setComments(prev=>[...prev,data as Comment]);
    setText("");
    if(game.user_id && game.user_id!==user.id) {
      await supabase.from("notifications").insert({
        user_id:game.user_id, type:"comment",
        message:username+" bình luận game "+game.name+": "+text.trim().slice(0,40),
      });
    }
  };

  return (
    <Modal onClose={onClose}>
      <div style={{fontWeight:900,fontSize:16,marginBottom:12}}>{"💬 Bình luận · "+game.name}</div>
      <div style={{maxHeight:280,overflowY:"auto",marginBottom:12}}>
        {loading
          ? <div style={{textAlign:"center",color:"#555",padding:20}}>⏳ Đang tải...</div>
          : comments.length===0
          ? <div style={{textAlign:"center",color:"#555",padding:20,fontSize:13}}>Chưa có bình luận nào!</div>
          : comments.map(c=>(
            <div key={c.id} style={{background:"#1a1a3a",borderRadius:12,padding:"10px 12px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontWeight:800,fontSize:13,color:"#4F8EF7"}}>{"@"+c.username}</span>
                <span style={{fontSize:10,color:"#555"}}>{timeAgo(c.created_at)}</span>
              </div>
              <div style={{fontSize:13,color:"#ccd"}}>{c.content}</div>
            </div>
          ))
        }
      </div>
      <div style={{display:"flex",gap:8}}>
        <input value={text} onChange={e=>setText(e.target.value)}
          placeholder="Viết bình luận..."
          onKeyDown={e=>e.key==="Enter"&&send()}
          style={{...inputStyle,marginBottom:0,flex:1}}/>
        <button onClick={send} disabled={!text.trim()} style={{
          background:text.trim()?"#4F8EF7":"#2a2a4a",border:"none",
          borderRadius:10,padding:"0 16px",color:"#fff",fontWeight:900,
          fontSize:14,cursor:"pointer",fontFamily:"inherit",
        }}>Gửi</button>
      </div>
    </Modal>
  );
}

// ─── NOTIFICATIONS ──────────────────────────
function NotifSheet({user,onClose}:{user:User;onClose:()=>void}) {
  const [notifs,setNotifs] = useState<Notification[]>([]);
  useEffect(()=>{
    supabase.from("notifications").select("*").eq("user_id",user.id)
      .order("created_at",{ascending:false}).limit(30)
      .then(({data})=>{if(data)setNotifs(data as Notification[]);});
    supabase.from("notifications").update({is_read:true}).eq("user_id",user.id).eq("is_read",false).then(()=>{});
  },[user.id]);
  const icons:Record<string,string>={comment:"💬",follow:"👥",like:"❤️",system:"📢"};
  return (
    <Modal onClose={onClose}>
      <div style={{fontWeight:900,fontSize:16,marginBottom:12}}>🔔 Thông báo</div>
      {notifs.length===0
        ? <div style={{textAlign:"center",color:"#555",padding:"24px 0"}}>
            <div style={{fontSize:32}}>🔔</div>
            <div style={{marginTop:8,fontSize:13}}>Chưa có thông báo</div>
          </div>
        : notifs.map(n=>(
          <div key={n.id} style={{
            background:n.is_read?"#1a1a3a":"#1e1e4a",borderRadius:12,
            padding:"10px 12px",marginBottom:8,
            borderLeft:n.is_read?"3px solid transparent":"3px solid #4F8EF7",
            display:"flex",gap:10,alignItems:"flex-start",
          }}>
            <span style={{fontSize:20}}>{icons[n.type]||"📢"}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:"#ccd",lineHeight:1.4}}>{n.message}</div>
              <div style={{fontSize:10,color:"#555",marginTop:3}}>{timeAgo(n.created_at)}</div>
            </div>
          </div>
        ))
      }
    </Modal>
  );
}

// ─── EDITOR ─────────────────────────────────
function Editor({game,user,onBack,onSave}:{game:Game;user:User;onBack:()=>void;onSave:(g:Game)=>void}) {
  const [tab,setTab]           = useState<"blocks"|"script"|"preview">("blocks");
  const [cat,setCat]           = useState("events");
  const [blocks,setBlocks]     = useState<Block[]>(game.blocks||[]);
  const [sprite,setSprite]     = useState(game.sprite||"🐱");
  const [running,setRunning]   = useState(false);
  const [log,setLog]           = useState<string[]>([]);
  const [pos,setPos]           = useState({x:40,y:55});
  const [scale,setScale]       = useState(1);
  const [bubble,setBubble]     = useState<string|null>(null);
  const [hidden,setHidden]     = useState(false);
  const [score,setScore]       = useState(0);
  const [rotation,setRotation] = useState(0);
  const [flash,setFlash]       = useState(false);
  const [saving,setSaving]     = useState(false);
  const [fullscreen,setFullscreen] = useState(false);
  const nid = useRef(100);

  const addBlock = (b:{id:string;label:string},catKey:string) => {
    setBlocks(prev=>[...prev,{id:nid.current++,blockId:b.id,label:b.label,color:BLOCK_CATEGORIES[catKey].color}]);
    setTab("script");
  };

  const run = async () => {
    setRunning(true); setLog([]);
    setPos({x:40,y:55}); setScale(1); setBubble(null);
    setHidden(false); setScore(0); setRotation(0); setFlash(false); setTab("preview");
    await runBlocks(blocks,sprite,{setPos,setScale,setBubble,setHidden,setScore,setRotation,setFlash,setLog,setRunning});
  };

  const save = async () => {
    setSaving(true);
    const payload={name:game.name,thumb:game.thumb,sprite,blocks,user_id:user.id};
    let updated={...game,sprite,blocks};
    if(game.id && !game.id.startsWith("local")) {
      await supabase.from("games").update(payload).eq("id",game.id);
    } else {
      const {data}=await supabase.from("games").insert({...payload,is_public:false}).select().single();
      if(data) updated={...updated,id:(data as Game).id};
    }
    setSaving(false); onSave(updated);
  };

  const shareGame = async () => {
    if(!game.id||game.id.startsWith("local")){alert("Lưu game trước!");return;}
    await supabase.from("games").update({is_public:true}).eq("id",game.id);
    const link=window.location.origin+"?game="+game.id;
    if(navigator.share) navigator.share({title:game.name,url:link});
    else {navigator.clipboard?.writeText(link);alert("Đã copy: "+link);}
  };

  if(fullscreen && tab==="preview") {
    return (
      <div style={{position:"fixed",inset:0,background:"#000",zIndex:500,display:"flex",flexDirection:"column"}}>
        <div style={{flex:1,position:"relative"}}>
          <Stage sprite={sprite} pos={pos} scale={scale} hidden={hidden}
            flash={flash} rotation={rotation} bubble={bubble} score={score} running={running}/>
        </div>
        <button onClick={()=>setFullscreen(false)} style={{
          position:"absolute",top:12,right:12,background:"rgba(0,0,0,0.7)",
          border:"none",borderRadius:10,padding:"6px 12px",color:"#fff",fontSize:13,cursor:"pointer",
        }}>✕ Thu nhỏ</button>
        <div style={{background:"#111128",padding:"6px 12px",maxHeight:80,overflowY:"auto"}}>
          {log.slice(-3).map((l,i)=>(
            <div key={i} style={{fontSize:12,color:"#8a8aaa",padding:"1px 0"}}>{l}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",
      background:"#0d0d1a",color:"#fff",fontFamily:"'Nunito',sans-serif",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:"linear-gradient(135deg,#1a1a3e,#16213e)",borderBottom:"2px solid #2a2a5a",
        padding:"8px 10px",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        <button onClick={onBack} style={smallBtn}>← Về</button>
        <span style={{fontSize:20}}>{game.thumb}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:900,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{game.name}</div>
          <div style={{fontSize:9,color:"#7c7caa",letterSpacing:1}}>EDITOR</div>
        </div>
        <button onClick={shareGame} style={smallBtn}>🔗</button>
        <button onClick={save} disabled={saving} style={{..