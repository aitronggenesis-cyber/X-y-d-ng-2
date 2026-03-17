import { useState, useEffect, useRef } from "react";
import { User } from "@supabase/supabase-js";
import {
  supabase, playSound, timeAgo, fmtNum,
  makeInputStyle, makeSmallBtn, getThemeColors,
  Block, Game, Comment, Notification, SpriteActor, Particle, Theme,
  BLOCK_CATS, SPRITES, AVATARS, PARTICLE_SETS,
} from "./types";

// ── MODAL ────────────────────────────────────
export function Modal({children,onClose,theme}:{children:React.ReactNode;onClose:()=>void;theme:Theme}) {
  const t = getThemeColors(theme);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",
      display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}}>
      <div onClick={e=>e.stopPropagation()} style={{background:t.bg2,borderRadius:"22px 22px 0 0",
        padding:"20px 18px 36px",width:"100%",maxWidth:480,maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{width:40,height:4,background:t.border,borderRadius:2,margin:"0 auto 16px"}}/>
        {children}
      </div>
    </div>
  );
}

// ── PARTICLES ────────────────────────────────
export function ParticleLayer({particles}:{particles:Particle[]}) {
  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:20}}>
      {particles.map(p=>(
        <div key={p.id} style={{
          position:"absolute",
          left:String(p.x)+"%",
          top:String(p.y)+"%",
          fontSize:p.size,
          opacity:p.life,
          transition:"none",
          transform:"translate(-50%,-50%)",
        }}>{p.emoji}</div>
      ))}
    </div>
  );
}

// ── STAGE ────────────────────────────────────
export interface StageProps {
  sprite:string; pos:{x:number;y:number}; scale:number;
  hidden:boolean; flash:boolean; rotation:number;
  bubble:string|null; score:number; running:boolean;
  particles:Particle[];
  actors:SpriteActor[];
  theme:Theme;
}
export function Stage({sprite,pos,scale,hidden,flash,rotation,bubble,score,running,particles,actors,theme}:StageProps) {
  const isDark = theme==="dark";
  return (
    <div style={{position:"relative",width:"100%",height:"100%",overflow:"hidden",
      background:isDark?"linear-gradient(180deg,#0a1628,#0d1e36 70%,#0a1010)":
                        "linear-gradient(180deg,#87CEEB,#98D8C8 70%,#90EE90)"}}>
      {isDark&&[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(i=>(
        <div key={i} style={{position:"absolute",
          width:i%3===0?3:2,height:i%3===0?3:2,
          background:"#fff",borderRadius:"50%",
          left:String((i*43+7)%94)+"%",
          top:String((i*31+8)%78)+"%",opacity:0.3}}/>
      ))}
      {!isDark&&[0,1,2,3,4].map(i=>(
        <div key={i} style={{position:"absolute",
          width:String(40+i*20)+"px",height:String(20+i*10)+"px",
          background:"rgba(255,255,255,0.7)",borderRadius:"50%",
          left:String((i*23+5)%80)+"%",top:String(10+i*5)+"%"}}/>
      ))}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:32,
        background:isDark?"linear-gradient(180deg,#163016,#0a1a0a)":
                          "linear-gradient(180deg,#228B22,#1a6b1a)",
        borderTop:isDark?"2px solid #2a5a2a":"2px solid #1a5a1a"}}/>

      {/* Extra actors */}
      {actors.map(a=>(
        a.hidden?null:
        <div key={a.id} style={{
          position:"absolute",
          left:String(a.pos.x)+"%",
          bottom:String(100-a.pos.y)+"%",
          fontSize:28*a.scale,
          transform:"rotate("+String(a.rotation)+"deg)",
          transition:"all 0.3s ease",
          filter:running?"drop-shadow(0 0 6px "+a.color+")":"none",
          zIndex:5,
        }}>{a.emoji}</div>
      ))}

      {bubble&&(
        <div style={{position:"absolute",
          left:String(Math.min(pos.x+6,58))+"%",
          top:String(Math.max(pos.y-26,4))+"%",
          background:"#fff",color:"#000",padding:"4px 10px",borderRadius:10,
          fontSize:12,fontWeight:800,whiteSpace:"nowrap",zIndex:15}}>
          {bubble}
          <div style={{position:"absolute",bottom:-7,left:10,width:0,height:0,
            borderLeft:"7px solid transparent",borderRight:"7px solid transparent",
            borderTop:"7px solid #fff"}}/>
        </div>
      )}
      <div style={{position:"absolute",
        left:String(pos.x)+"%",
        bottom:String(100-pos.y)+"%",
        fontSize:34*scale,
        transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        transform:"rotate("+String(rotation)+"deg)",
        opacity:hidden?0:flash?0.2:1,
        filter:running?"drop-shadow(0 0 10px #4F8EF7)":"none",
        zIndex:10,
      }}>{sprite}</div>

      <ParticleLayer particles={particles}/>

      <div style={{position:"absolute",top:6,left:8,background:"rgba(0,0,0,0.55)",
        borderRadius:8,padding:"2px 8px",fontSize:12,fontWeight:800,color:"#fff",zIndex:20}}>
        {"⭐ "+score}
      </div>
    </div>
  );
}

// ── GAME ENGINE ──────────────────────────────
let particleId = 1;
export function spawnParticles(
  type: string,
  x: number, y: number,
  setParticles: React.Dispatch<React.SetStateAction<Particle[]>>
) {
  const set = PARTICLE_SETS[type as keyof typeof PARTICLE_SETS] || PARTICLE_SETS.stars;
  const newP: Particle[] = Array.from({length:8}).map(()=>({
    id: particleId++,
    x: x + (Math.random()-0.5)*20,
    y: y + (Math.random()-0.5)*10,
    vx: (Math.random()-0.5)*3,
    vy: -(Math.random()*3+1),
    life: 1,
    emoji: set[Math.floor(Math.random()*set.length)],
    size: 14+Math.random()*12,
  }));
  setParticles(p=>[...p,...newP]);
  let frame = 0;
  const animate = () => {
    frame++;
    setParticles(p=>p
      .map(x=>({...x,y:x.y+x.vy*0.8,x:x.x+x.vx*0.8,life:x.life-0.04}))
      .filter(x=>x.life>0)
    );
    if(frame<30) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

export async function runEngine(
  blocks: Block[],
  sprite: string,
  cb: {
    setPos:Function; setScale:Function; setBubble:Function;
    setHidden:Function; setScore:Function; setRotation:Function;
    setFlash:Function; setLog:Function; setRunning:Function;
    setParticles:Function; pos:{x:number;y:number};
  }
) {
  const l:string[]=[];
  const push=(m:string)=>{l.push(m);cb.setLog([...l]);};
  for(const b of blocks){
    await new Promise(r=>setTimeout(r,480));
    switch(b.blockId){
      case "on_start":   push("🎮 Bắt đầu!"); break;
      case "on_tap":     push("👆 Chờ chạm..."); break;
      case "on_key":     push("⌨️ Chờ phím..."); break;
      case "move_right": cb.setPos((p:any)=>({...p,x:Math.min(p.x+18,78)})); push("▶ Đi phải"); break;
      case "move_left":  cb.setPos((p:any)=>({...p,x:Math.max(p.x-18,5)}));  push("◀ Đi trái"); break;
      case "move_up":    cb.setPos((p:any)=>({...p,y:Math.max(p.y-14,10)})); push("⬆ Lên"); break;
      case "move_down":  cb.setPos((p:any)=>({...p,y:Math.min(p.y+14,80)})); push("⬇ Xuống"); break;
      case "jump":
        cb.setPos((p:any)=>({...p,y:p.y-24})); playSound("jump");
        spawnParticles("stars",cb.pos.x,cb.pos.y,cb.setParticles);
        await new Promise(r=>setTimeout(r,300));
        cb.setPos((p:any)=>({...p,y:p.y+24})); push("⬆ Nhảy!"); break;
      case "spin": cb.setRotation((r:number)=>r+360); push("🔄 Xoay!"); break;
      case "say":
        cb.setBubble("Xin chào!"); push("💬 Xin chào!");
        await new Promise(r=>setTimeout(r,1200)); cb.setBubble(null); break;
      case "grow":   cb.setScale((s:number)=>Math.min(s+0.3,2.2)); push("🔍 To ra"); break;
      case "shrink": cb.setScale((s:number)=>Math.max(s-0.3,0.4)); push("🔎 Nhỏ"); break;
      case "hide":   cb.setHidden(true);  push("👻 Ẩn"); break;
      case "show":   cb.setHidden(false); push("👁️ Hiện"); break;
      case "flash":
        cb.setFlash(true); await new Promise(r=>setTimeout(r,400));
        cb.setFlash(false); push("✨ Flash!"); break;
      case "play_jump": playSound("jump"); push("🔊 Jump!"); break;
      case "play_win":  playSound("win");  push("🏆 Win!"); break;
      case "play_pop":  playSound("pop");  push("💥 Pop!"); break;
      case "particle_stars":
        spawnParticles("stars",cb.pos.x,cb.pos.y,cb.setParticles);
        push("⭐ Tung sao!"); break;
      case "particle_fire":
        spawnParticles("fire",cb.pos.x,cb.pos.y,cb.setParticles);
        push("🔥 Phun lửa!"); break;
      case "particle_hearts":
        spawnParticles("hearts",cb.pos.x,cb.pos.y,cb.setParticles);
        push("❤️ Tim bay!"); break;
      case "particle_coins":
        spawnParticles("coins",cb.pos.x,cb.pos.y,cb.setParticles);
        playSound("pop"); push("💰 Coin!"); break;
      case "repeat": push("🔁 Lặp 3 lần"); break;
      case "wait":   push("⏳ Chờ..."); await new Promise(r=>setTimeout(r,1000)); break;
      case "score_add":
        cb.setScore((s:number)=>s+1);
        spawnParticles("coins",cb.pos.x,cb.pos.y,cb.setParticles);
        playSound("pop"); push("⭐ +1!"); break;
    }
  }
  playSound("win");
  spawnParticles("stars",50,50,cb.setParticles);
  push("🏁 Xong!"); cb.setRunning(false);
}

// ── AUTH ─────────────────────────────────────
export function AuthScreen({onAuth,theme}:{onAuth:(u:User)=>void;theme:Theme}) {
  const [mode,setMode]   = useState<"login"|"signup">("login");
  const [email,setEmail] = useState("");
  const [pass,setPass]   = useState("");
  const [name,setName]   = useState("");
  const [err,setErr]     = useState("");
  const [loading,setLoading] = useState(false);
  const t = getThemeColors(theme);
  const iS = makeInputStyle(theme);
  const submit=async()=>{
    setErr(""); setLoading(true);
    if(mode==="login"){
      const {data,error}=await supabase.auth.signInWithPassword({email,password:pass});
      if(error) setErr(error.message); else if(data.user) onAuth(data.user);
    } else {
      const {data,error}=await supabase.auth.signUp({email,password:pass,options:{data:{username:name,avatar:"😎"}}});
      if(error) setErr(error.message);
      else if(data.user) onAuth(data.user);
      else setErr("Kiểm tra email!");
    }
    setLoading(false);
  };
  return(
    <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Nunito',sans-serif",color:t.text}}>
      <div style={{fontSize:52,marginBottom:8}}>🎮</div>
      <div style={{fontWeight:900,fontSize:26,marginBottom:4,
        background:"linear-gradient(90deg,#4F8EF7,#A259FF)",
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>GameBuilder</div>
      <div style={{fontSize:11,color:t.text2,marginBottom:32,letterSpacing:1}}>TẠO GAME KHÔNG CẦN CODE</div>
      <div style={{width:"100%",maxWidth:380,background:t.bg2,borderRadius:20,padding:24,
        boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",gap:4,marginBottom:20,background:t.bg3,borderRadius:12,padding:4}}>
          {(["login","signup"] as const).map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{
              flex:1,padding:"8px",borderRadius:10,border:"none",
              background:mode===m?"#4F8EF7":"transparent",
              color:mode===m?"#fff":t.text2,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit",
            }}>{m==="login"?"Đăng nhập":"Đăng ký"}</button>
          ))}
        </div>
        {mode==="signup"&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Tên hiển thị..." style={iS}/>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email..." type="email" style={iS}/>
        <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Mật khẩu..." type="password" style={iS}
          onKeyDown={e=>e.key==="Enter"&&submit()}/>
        {err&&<div style={{color:"#ff6b6b",fontSize:12,marginBottom:10,textAlign:"center"}}>{err}</div>}
        <button onClick={submit} disabled={loading||!email||!pass} style={{
          width:"100%",padding:"13px",
          background:!email||!pass?"#2a2a4a":"linear-gradient(135deg,#4F8EF7,#A259FF)",
          border:"none",borderRadius:12,color:"#fff",fontWeight:900,fontSize:15,
          cursor:!email||!pass?"not-allowed":"pointer",fontFamily:"inherit",
        }}>{loading?"⏳...":mode==="login"?"🚀 Đăng nhập":"✨ Đăng ký"}</button>
      </div>
    </div>
  );
}

// ── PROFILE EDITOR ───────────────────────────
export function ProfileEditor({user,onClose,theme}:{user:User;onClose:()=>void;theme:Theme}) {
  const current = user.user_metadata;
  const [name,setName]   = useState((current?.username as string)||"");
  const [avatar,setAvatar] = useState((current?.avatar as string)||"😎");
  const [bio,setBio]     = useState((current?.bio as string)||"");
  const [saving,setSaving] = useState(false);
  const [done,setDone]   = useState(false);
  const t = getThemeColors(theme);
  const iS = makeInputStyle(theme);

  const save=async()=>{
    setSaving(true);
    await supabase.auth.updateUser({data:{username:name,avatar,bio}});
    setSaving(false); setDone(true);
    setTimeout(()=>{setDone(false);onClose();},1200);
  };

  return(
    <Modal onClose={onClose} theme={theme}>
      <div style={{fontWeight:900,fontSize:17,marginBottom:16,textAlign:"center",color:t.text}}>
        ✏️ Chỉnh sửa Profile
      </div>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:56,marginBottom:8}}>{avatar}</div>
        <div style={{fontSize:10,color:t.text2,letterSpacing:1,marginBottom:8}}>CHỌN AVATAR</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
          {AVATARS.map(a=>(
            <button key={a} onClick={()=>setAvatar(a)} style={{
              background:avatar===a?"#4F8EF7":"transparent",
              border:avatar===a?"2px solid #4F8EF7":"2px solid "+t.border,
              borderRadius:10,padding:"5px 8px",fontSize:24,cursor:"pointer",
            }}>{a}</button>
          ))}
        </div>
      </div>
      <div style={{fontSize:10,color:t.text2,letterSpacing:1,marginBottom:5}}>TÊN HIỂN THỊ</div>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Tên của bạn..." style={iS}/>
      <div style={{fontSize:10,color:t.text2,letterSpacing:1,marginBottom:5}}>BIO</div>
      <input value={bio} onChange={e=>setBio(e.target.value)} placeholder="Giới thiệu bản thân..." style={iS}/>
      {done
        ?<div style={{textAlign:"center",padding:12,color:"#00c853",fontWeight:800}}>✅ Đã lưu!</div>
        :<button onClick={save} disabled={saving||!name.trim()} style={{
          width:"100%",padding:"13px",
          background:name.trim()?"linear-gradient(135deg,#4F8EF7,#A259FF)":"#2a2a4a",
          border:"none",borderRadius:12,color:"#fff",fontWeight:900,fontSize:15,
          cursor:name.trim()?"pointer":"not-allowed",fontFamily:"inherit",
        }}>{saving?"⏳ Đang lưu...":"💾 Lưu Profile"}</button>
      }
    </Modal>
  );
}

// ── COMMENTS ─────────────────────────────────
export function CommentsSheet({game,user,onClose,theme}:{game:Game;user:User;onClose:()=>void;theme:Theme}) {
  const [list,setList]   = useState<Comment[]>([]);
  const [text,setText]   = useState("");
  const [loading,setLoading] = useState(true);
  const t = getThemeColors(theme);
  const iS = makeInputStyle(theme);
  const uname=(user.user_metadata?.username as string)||user.email?.split("@")[0]||"Bạn";

  useEffect(()=>{
    supabase.from("comments").select("*").eq("game_id",game.id)
      .order("created_at",{ascending:true})
      .then(({data})=>{if(data)setList(data as Comment[]);setLoading(false);});
  },[game.id]);

  const send=async()=>{
    if(!text.trim()) return;
    const {data}=await supabase.from("comments")
      .insert({game_id:game.id,user_id:user.id,username:uname,content:text.trim()})
      .select().single();
    if(data) setList(p=>[...p,data as Comment]);
    setText("");
    if(game.user_id&&game.user_id!==user.id)
      await supabase.from("notifications").insert({
        user_id:game.user_id,type:"comment",
        message:uname+" bình luận: "+text.trim().slice(0,40),
      });
  };

  return(
    <Modal onClose={onClose} theme={theme}>
      <div style={{fontWeight:900,fontSize:16,marginBottom:12,color:t.text}}>{"💬 "+game.name}</div>
      <div style={{maxHeight:260,overflowY:"auto",marginBottom:12}}>
        {loading?<div style={{textAlign:"center",color:t.text2,padding:16}}>⏳</div>
         :list.length===0?<div style={{textAlign:"center",color:t.text2,padding:16,fontSize:13}}>Chưa có bình luận</div>
         :list.map(c=>(
          <div key={c.id} style={{background:t.bg3,borderRadius:12,padding:"9px 11px",marginBottom:7}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontWeight:800,fontSize:12,color:"#4F8EF7"}}>{"@"+c.username}</span>
              <span style={{fontSize:10,color:t.text2}}>{timeAgo(c.created_at)}</span>
            </div>
            <div style={{fontSize:13,color:t.text}}>{c.content}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <input value={text} onChange={e=>setText(e.target.value)}
          placeholder="Bình luận..." onKeyDown={e=>e.key==="Enter"&&send()}
          style={{...iS,marginBottom:0,flex:1}}/>
        <button onClick={send} disabled={!text.trim()} style={{
          background:text.trim()?"#4F8EF7":"#2a2a4a",border:"none",borderRadius:10,
          padding:"0 14px",color:"#fff",fontWeight:900,cursor:"pointer",fontFamily:"inherit",
        }}>Gửi</button>
      </div>
    </Modal>
  );
}

// ── NOTIFICATIONS ────────────────────────────
export function NotifSheet({user,onClose,theme}:{user:User;onClose:()=>void;theme:Theme}) {
  const [list,setList] = useState<Notification[]>([]);
  const t = getThemeColors(theme);
  useEffect(()=>{
    supabase.from("notifications").select("*").eq("user_id",user.id)
      .order("created_at",{ascending:false}).limit(30)
      .then(({data})=>{if(data)setList(data as Notification[]);});
    supabase.from("notifications").update({is_read:true}).eq("user_id",user.id).eq("is_read",false).then(()=>{});
  },[user.id]);
  const icons:Record<string,string>={comment:"💬",follow:"👥",like:"❤️",system:"📢"};
  return(
    <Modal onClose={onClose} theme={theme}>
      <div style={{fontWeight:900,fontSize:16,marginBottom:12,color:t.text}}>🔔 Thông báo</div>
      {list.length===0
        ?<div style={{textAlign:"center",color:t.text2,padding:"20px 0"}}>
          <div style={{fontSize:32}}>🔔</div>
          <div style={{marginTop:8,fontSize:13}}>Chưa có thông báo</div>
         </div>
        :list.map(n=>(
          <div key={n.id} style={{background:n.is_read?t.bg3:t.bg2+"ee",borderRadius:12,
            padding:"10px 12px",marginBottom:8,display:"flex",gap:10,
            borderLeft:n.is_read?"3px solid transparent":"3px solid #4F8EF7"}}>
            <span style={{fontSize:20}}>{icons[n.type]||"📢"}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:t.text,lineHeight:1.4}}>{n.message}</div>
              <div style={{fontSize:10,color:t.text2,marginTop:3}}>{timeAgo(n.created_at)}</div>
            </div>
          </div>
        ))
      }
    </Modal>
  );
}

// ── MULTI-SPRITE EDITOR ──────────────────────
export function ActorsPanel({
  actors, setActors, activeActorId, setActiveActorId, theme,
}: {
  actors: SpriteActor[];
  setActors: React.Dispatch<React.SetStateAction<SpriteActor[]>>;
  activeActorId: number;
  setActiveActorId: (id:number)=>void;
  theme: Theme;
}) {
  const t = getThemeColors(theme);
  const actorColors = ["#4F8EF7","#A259FF","#FFB829","#FF6B6B","#00E5FF","#00c853"];

  const addActor=()=>{
    const id = Date.now();
    setActors(p=>[...p,{
      id, emoji:"🐶", name:"Nhân vật "+(p.length+2),
      blocks:[], pos:{x:60,y:55}, scale:1, rotation:0, hidden:false,
      color: actorColors[p.length%actorColors.length],
    }]);
    setActiveActorId(id);
  };

  return(