import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, getT, iStyle, sBtn, timeAgo, fmtNum, addXP, getLevelFromXP, getXPProgress, LEVEL_TITLES, AVATARS, Game, Comment, Notification, Theme } from "./types";

// ── MODAL ──────────────────────────────────
export function Modal({children,onClose,theme}:{children:React.ReactNode;onClose:()=>void;theme:Theme}) {
  const t=getT(theme);
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300,animation:"fadeIn 0.15s ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:t.bg2,borderRadius:"24px 24px 0 0",padding:"20px 18px 40px",width:"100%",maxWidth:480,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.4)",animation:"slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <div style={{width:44,height:5,background:t.border,borderRadius:99,margin:"0 auto 18px"}}/>
        {children}
      </div>
    </div>
  );
}

// ── XP BAR ─────────────────────────────────
export function XPBar({xp,theme}:{xp:number;theme:Theme}) {
  const t=getT(theme);
  const level=getLevelFromXP(xp);
  const prog=getXPProgress(xp);
  const title=LEVEL_TITLES[Math.min(level,LEVEL_TITLES.length-1)]||"👑";
  return(
    <div style={{background:t.bg3,borderRadius:14,padding:"10px 14px",border:"1px solid "+t.border}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontWeight:800,fontSize:13,color:t.text}}>{title} Lv.{level}</span>
        <span style={{fontSize:11,color:"#FFB829",fontWeight:700,background:"#FFB82922",padding:"2px 8px",borderRadius:99}}>{xp} XP</span>
      </div>
      <div style={{background:t.border,borderRadius:99,height:7,overflow:"hidden"}}>
        <div style={{background:"linear-gradient(90deg,#FFB829,#FF6B35)",height:"100%",width:String(prog)+"%",borderRadius:99,transition:"width 0.6s ease",boxShadow:"0 0 8px #FFB82966"}}/>
      </div>
      <div style={{fontSize:10,color:t.text2,marginTop:3,textAlign:"right"}}>{prog}% → Lv.{level+1}</div>
    </div>
  );
}

// ── GAME CARD ──────────────────────────────
export function GameCard({game,onClick,onPlay,onComment,onDelete,showDelete,theme}:{
  game:Game; onClick:()=>void; onPlay?:()=>void; onComment?:()=>void;
  onDelete?:(e:React.MouseEvent)=>void; showDelete?:boolean; theme:Theme;
}) {
  const t=getT(theme);
  const catColors:Record<string,string>={Action:"#FF6B6B",Puzzle:"#A259FF",Adventure:"#4F8EF7",RPG:"#FFB829",Racing:"#00E676"};
  return(
    <div style={{background:t.card,borderRadius:18,overflow:"hidden",cursor:"pointer",
      border:"1px solid "+t.border,position:"relative",
      boxShadow:"0 4px 20px rgba(0,0,0,0.2)",transition:"transform 0.15s, box-shadow 0.15s"}}
      onClick={onClick}>
      {/* Thumbnail */}
      <div style={{background:"linear-gradient(135deg,#1e1e4a 0%,#0d0d2a 50%,#1a1a3e 100%)",height:90,display:"flex",alignItems:"center",justifyContent:"center",fontSize:46,position:"relative"}}>
        {game.thumb}
        {/* Badges */}
        <div style={{position:"absolute",bottom:6,right:6,display:"flex",gap:3}}>
          {(game.actors||[]).length>0&&<span style={{background:"rgba(79,142,247,0.9)",borderRadius:6,padding:"1px 5px",fontSize:8,color:"#fff",fontWeight:700}}>+{(game.actors||[]).length}🎭</span>}
          {(game.variables||[]).length>0&&<span style={{background:"rgba(0,200,83,0.9)",borderRadius:6,padding:"1px 5px",fontSize:8,color:"#fff",fontWeight:700}}>{(game.variables||[]).length}📊</span>}
          {game.bgMusic&&game.bgMusic!=="none"&&<span style={{background:"rgba(0,229,255,0.9)",borderRadius:6,padding:"1px 5px",fontSize:8,color:"#000",fontWeight:700}}>🎵</span>}
        </div>
        {game.is_public&&<div style={{position:"absolute",top:6,left:6,background:"linear-gradient(135deg,#00C853,#69F0AE)",borderRadius:8,padding:"2px 7px",fontSize:9,fontWeight:800,color:"#000"}}>PUBLIC</div>}
      </div>
      {/* Info */}
      <div style={{padding:"8px 10px 10px"}}>
        <div style={{fontWeight:800,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:t.text,marginBottom:2}}>{game.name}</div>
        {game.username&&<div style={{fontSize:10,color:t.text2,marginBottom:5}}>{"@"+game.username}</div>}
        {(game.plays!==undefined||game.likes!==undefined)&&(
          <div style={{display:"flex",gap:8,marginBottom:5}}>
            {game.plays!==undefined&&<span style={{fontSize:10,color:"#4F8EF7",fontWeight:700}}>▶ {fmtNum(game.plays)}</span>}
            {game.likes!==undefined&&<span style={{fontSize:10,color:"#FF6B6B",fontWeight:700}}>❤️ {fmtNum(game.likes)}</span>}
          </div>
        )}
        {(onPlay||onComment||showDelete)&&(
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            {onPlay&&<button onClick={e=>{e.stopPropagation();onPlay();}} style={{background:"linear-gradient(135deg,#00C853,#69F0AE)",border:"none",borderRadius:8,padding:"3px 10px",fontSize:10,color:"#000",cursor:"pointer",fontWeight:800,fontFamily:"inherit"}}>▶ Chơi</button>}
            {onComment&&<button onClick={e=>{e.stopPropagation();onComment();}} style={{background:"#4F8EF722",border:"1px solid #4F8EF744",borderRadius:8,padding:"3px 8px",fontSize:10,color:"#4F8EF7",cursor:"pointer",fontWeight:700,fontFamily:"inherit"}}>💬</button>}
            {showDelete&&onDelete&&<button onClick={onDelete} style={{marginLeft:"auto",background:"transparent",border:"none",color:t.text2,fontSize:13,cursor:"pointer",padding:"0 2px"}}>🗑</button>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── AUTH ───────────────────────────────────
export function AuthScreen({onAuth,theme}:{onAuth:(u:User)=>void;theme:Theme}) {
  const [mode,setMode]=useState<"login"|"signup">("login");
  const [email,setEmail]=useState(""); const [pass,setPass]=useState(""); const [name,setName]=useState("");
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const t=getT(theme); const iS=iStyle(theme);
  const submit=async()=>{
    setErr("");setLoading(true);
    if(mode==="login"){const{data,error}=await supabase.auth.signInWithPassword({email,password:pass});if(error)setErr(error.message);else if(data.user)onAuth(data.user);}
    else{const{data,error}=await supabase.auth.signUp({email,password:pass,options:{data:{username:name,avatar:"😎"}}});if(error)setErr(error.message);else if(data.user)onAuth(data.user);else setErr("Kiểm tra email!");}
    setLoading(false);
  };
  return(
    <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Nunito',sans-serif",color:t.text}}>
      <div style={{fontSize:60,marginBottom:8,filter:"drop-shadow(0 4px 16px #4F8EF766)"}}>🎮</div>
      <div style={{fontWeight:900,fontSize:28,marginBottom:4,background:"linear-gradient(90deg,#4F8EF7,#A259FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>GameBuilder</div>
      <div style={{fontSize:12,color:t.text2,marginBottom:36,letterSpacing:1.5}}>TẠO GAME KHÔNG CẦN CODE</div>
      <div style={{width:"100%",maxWidth:380,background:t.bg2,borderRadius:24,padding:24,boxShadow:"0 8px 40px rgba(0,0,0,0.25)",border:"1px solid "+t.border}}>
        <div style={{display:"flex",gap:4,marginBottom:22,background:t.bg3,borderRadius:14,padding:4}}>
          {(["login","signup"] as const).map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"9px",borderRadius:12,border:"none",background:mode===m?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"transparent",color:mode===m?"#fff":t.text2,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",boxShadow:mode===m?"0 2px 12px #4F8EF755":"none"}}>
              {m==="login"?"Đăng nhập":"Đăng ký"}
            </button>
          ))}
        </div>
        {mode==="signup"&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Tên hiển thị..." style={iS}/>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email..." type="email" style={iS}/>
        <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Mật khẩu..." type="password" style={iS} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        {err&&<div style={{color:"#ff6b6b",fontSize:12,marginBottom:10,textAlign:"center",padding:"6px",background:"#ff6b6b11",borderRadius:8}}>{err}</div>}
        <button onClick={submit} disabled={loading||!email||!pass} style={{width:"100%",padding:"14px",background:!email||!pass?"#2a2a4a":"linear-gradient(135deg,#4F8EF7,#7C3AED)",border:"none",borderRadius:14,color:"#fff",fontWeight:900,fontSize:15,cursor:!email||!pass?"not-allowed":"pointer",fontFamily:"inherit",boxShadow:!email||!pass?"none":"0 4px 20px #4F8EF755",transition:"all 0.2s"}}>
          {loading?"⏳...":(mode==="login"?"🚀 Đăng nhập":"✨ Đăng ký")}
        </button>
      </div>
    </div>
  );
}

// ── PROFILE EDITOR ─────────────────────────
export function ProfileEditor({user,onClose,theme}:{user:User;onClose:()=>void;theme:Theme}) {
  const c=user.user_metadata;
  const [name,setName]=useState((c?.username as string)||"");
  const [avatar,setAvatar]=useState((c?.avatar as string)||"😎");
  const [bio,setBio]=useState((c?.bio as string)||"");
  const [saving,setSaving]=useState(false);
  const [done,setDone]=useState(false);
  const t=getT(theme); const iS=iStyle(theme);
  const save=async()=>{setSaving(true);await supabase.auth.updateUser({data:{username:name,avatar,bio}});setSaving(false);setDone(true);setTimeout(()=>{setDone(false);onClose();},1200);};
  return(
    <Modal onClose={onClose} theme={theme}>
      <div style={{fontWeight:900,fontSize:17,marginBottom:16,textAlign:"center",color:t.text}}>✏️ Chỉnh Profile</div>
      <div style={{textAlign:"center",marginBottom:14}}>
        <div style={{fontSize:56,marginBottom:10,filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.3))"}}>{avatar}</div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",justifyContent:"center"}}>
          {AVATARS.map(a=>(
            <button key={a} onClick={()=>setAvatar(a)} style={{background:avatar===a?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"transparent",border:avatar===a?"2px solid #4F8EF7":"2px solid "+t.border,borderRadius:12,padding:"6px 8px",fontSize:22,cursor:"pointer",transition:"all 0.15s",transform:avatar===a?"scale(1.15)":"scale(1)"}}>{a}</button>
          ))}
        </div>
      </div>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Tên..." style={iS}/>
      <input value={bio} onChange={e=>setBio(e.target.value)} placeholder="Bio..." style={iS}/>
      {done?<div style={{textAlign:"center",padding:14,color:"#00c853",fontWeight:800,fontSize:15}}>✅ Đã lưu!</div>
        :<button onClick={save} disabled={saving||!name.trim()} style={{width:"100%",padding:"13px",background:name.trim()?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"#2a2a4a",border:"none",borderRadius:14,color:"#fff",fontWeight:900,fontSize:15,cursor:name.trim()?"pointer":"not-allowed",fontFamily:"inherit",boxShadow:name.trim()?"0 4px 20px #4F8EF755":"none"}}>{saving?"⏳ Đang lưu...":"💾 Lưu"}</button>
      }
    </Modal>
  );
}

// ── COMMENTS ───────────────────────────────
export function CommentsSheet({game,user,onClose,theme}:{game:Game;user:User;onClose:()=>void;theme:Theme}) {
  const [list,setList]=useState<Comment[]>([]); const [text,setText]=useState(""); const [loading,setLoading]=useState(true);
  const t=getT(theme); const iS=iStyle(theme);
  const uname=(user.user_metadata?.username as string)||user.email?.split("@")[0]||"Bạn";
  useEffect(()=>{supabase.from("comments").select("*").eq("game_id",game.id).order("created_at",{ascending:true}).then(({data})=>{if(data)setList(data as Comment[]);setLoading(false);});} ,[game.id]);
  const send=async()=>{
    if(!text.trim())return;
    const{data}=await supabase.from("comments").insert({game_id:game.id,user_id:user.id,username:uname,content:text.trim()}).select().single();
    if(data)setList(p=>[...p,data as Comment]);
    setText("");
    if(game.user_id&&game.user_id!==user.id) await supabase.from("notifications").insert({user_id:game.user_id,type:"comment",message:uname+" bình luận: "+text.trim().slice(0,40)});
  };
  return(
    <Modal onClose={onClose} theme={theme}>
      <div style={{fontWeight:900,fontSize:16,marginBottom:12,color:t.text}}>{"💬 "+game.name}</div>
      <div style={{maxHeight:260,overflowY:"auto",marginBottom:12}}>
        {loading?<div style={{textAlign:"center",color:t.text2,padding:20}}>⏳</div>
         :list.length===0?<div style={{textAlign:"center",color:t.text2,padding:20,fontSize:13}}>Chưa có bình luận</div>
         :list.map(c=>(
          <div key={c.id} style={{background:t.bg3,borderRadius:14,padding:"10px 12px",marginBottom:8,border:"1px solid "+t.border}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontWeight:800,fontSize:12,color:"#4F8EF7"}}>{"@"+c.username}</span>
              <span style={{fontSize:10,color:t.text2}}>{timeAgo(c.created_at)}</span>
            </div>
            <div style={{fontSize:13,color:t.text}}>{c.content}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Bình luận..." onKeyDown={e=>e.key==="Enter"&&send()} style={{...iS,marginBottom:0,flex:1}}/>
        <button onClick={send} disabled={!text.trim()} style={{background:text.trim()?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"#2a2a4a",border:"none",borderRadius:12,padding:"0 16px",color:"#fff",fontWeight:900,cursor:"pointer",fontFamily:"inherit",boxShadow:text.trim()?"0 2px 12px #4F8EF755":"none"}}>Gửi</button>
      </div>
    </Modal>
  );
}

// ── NOTIFICATIONS ──────────────────────────
export function NotifSheet({user,onClose,theme}:{user:User;onClose:()=>void;theme:Theme}) {
  const [list,setList]=useState<Notification[]>([]);
  const t=getT(theme);
  useEffect(()=>{
    supabase.from("notifications").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(30).then(({data})=>{if(data)setList(data as Notification[]);});
    supabase.from("notifications").update({is_read:true}).eq("user_id",user.id).eq("is_read",false).then(()=>{});
  },[user.id]);
  const icons:Record<string,string>={comment:"💬",follow:"👥",like:"❤️",system:"📢"};
  return(
    <Modal onClose={onClose} theme={theme}>
      <div style={{fontWeight:900,fontSize:16,marginBottom:12,color:t.text}}>🔔 Thông báo</div>
      {list.length===0
        ?<div style={{textAlign:"center",color:t.text2,padding:"24px 0"}}><div style={{fontSize:36}}>🔔</div><div style={{marginTop:8,fontSize:13}}>Chưa có thông báo</div></div>
        :list.map(n=>(
          <div key={n.id} style={{background:n.is_read?t.bg3:t.bg2,borderRadius:14,padding:"10px 12px",marginBottom:8,display:"flex",gap:10,border:"1px solid "+(n.is_read?t.border:"#4F8EF755"),boxShadow:n.is_read?"none":"0 2px 12px #4F8EF722"}}>
            <span style={{fontSize:22}}>{icons[n.type]||"📢"}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:t.text,lineHeight:1.4}}>{n.message}</div>
              <div style={{fontSize:10,color:t.text2,marginTop:3}}>{timeAgo(n.created_at)}</div>
            </div>
            {!n.is_read&&<div style={{width:8,height:8,borderRadius:"50%",background:"#4F8EF7",flexShrink:0,marginTop:4}}/>}
          </div>
        ))
      }
    </Modal>
  );
}
