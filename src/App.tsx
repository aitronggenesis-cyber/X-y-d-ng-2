import { useState, useRef, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import {
  supabase, fmtNum, makeInputStyle, makeSmallBtn, getThemeColors,
  THUMBNAILS, SPRITES, CATEGORIES, BLOCK_CATS, DEMO_GAMES,
  Game, Block, SpriteActor, Particle, Theme,
} from "./types";
import {
  Modal, Stage, AuthScreen, CommentsSheet, NotifSheet,
  ProfileEditor, ActorsPanel, runEngine, spawnParticles, StageProps,
} from "./components";

// ── EDITOR ───────────────────────────────────
function Editor({game,user,onBack,onSave,theme}:{
  game:Game; user:User; onBack:()=>void; onSave:(g:Game)=>void; theme:Theme;
}) {
  const [tab,setTab]         = useState<"blocks"|"script"|"preview">("blocks");
  const [cat,setCat]         = useState("events");
  const [blocks,setBlocks]   = useState<Block[]>(game.blocks||[]);
  const [sprite,setSprite]   = useState(game.sprite||"🐱");
  const [actors,setActors]   = useState<SpriteActor[]>(game.actors||[]);
  const [activeActorId,setActiveActorId] = useState(0);
  const [running,setRunning] = useState(false);
  const [log,setLog]         = useState<string[]>([]);
  const [pos,setPos]         = useState({x:40,y:55});
  const [scale,setScale]     = useState(1);
  const [bubble,setBubble]   = useState<string|null>(null);
  const [hidden,setHidden]   = useState(false);
  const [score,setScore]     = useState(0);
  const [rotation,setRotation] = useState(0);
  const [flash,setFlash]     = useState(false);
  const [particles,setParticles] = useState<Particle[]>([]);
  const [saving,setSaving]   = useState(false);
  const [fs,setFs]           = useState(false);
  const posRef = useRef({x:40,y:55});
  const nid = useRef(100);
  const t = getThemeColors(theme);
  const sBtn = makeSmallBtn(theme);

  useEffect(()=>{ posRef.current=pos; },[pos]);

  const currentBlocks = activeActorId===0
    ? blocks
    : actors.find(a=>a.id===activeActorId)?.blocks||[];

  const setCurrentBlocks=(fn:Function)=>{
    if(activeActorId===0) setBlocks(fn as any);
    else setActors(p=>p.map(a=>a.id===activeActorId?{...a,blocks:fn(a.blocks)}:a));
  };

  const addBlock=(b:{id:string;label:string},ck:string)=>{
    setCurrentBlocks((p:Block[])=>[...p,{id:nid.current++,blockId:b.id,label:b.label,color:BLOCK_CATS[ck].color}]);
    setTab("script");
  };

  const run=async()=>{
    setRunning(true); setLog([]); setParticles([]);
    setPos({x:40,y:55}); setScale(1); setBubble(null);
    setHidden(false); setScore(0); setRotation(0); setFlash(false);
    setTab("preview");
    await runEngine(blocks,sprite,{
      setPos,setScale,setBubble,setHidden,setScore,
      setRotation,setFlash,setLog,setRunning,setParticles,
      pos:posRef.current,
    });
  };

  const save=async()=>{
    setSaving(true);
    const payload={name:game.name,thumb:game.thumb,sprite,blocks,actors,user_id:user.id};
    let updated={...game,sprite,blocks,actors};
    if(game.id&&!game.id.startsWith("local")){
      await supabase.from("games").update(payload).eq("id",game.id);
    } else {
      const {data}=await supabase.from("games").insert({...payload,is_public:false}).select().single();
      if(data) updated={...updated,id:(data as Game).id};
    }
    setSaving(false); onSave(updated);
  };

  const share=async()=>{
    if(!game.id||game.id.startsWith("local")){alert("Lưu trước!");return;}
    await supabase.from("games").update({is_public:true}).eq("id",game.id);
    const link=window.location.origin+"?game="+game.id;
    if(navigator.share) navigator.share({title:game.name,url:link});
    else {navigator.clipboard?.writeText(link);alert("Đã copy: "+link);}
  };

  const sp:StageProps={sprite,pos,scale,hidden,flash,rotation,bubble,score,running,particles,actors,theme};

  if(fs&&tab==="preview") return(
    <div style={{position:"fixed",inset:0,background:"#000",zIndex:500,display:"flex",flexDirection:"column"}}>
      <div style={{flex:1,position:"relative"}}><Stage {...sp}/></div>
      <button onClick={()=>setFs(false)} style={{position:"absolute",top:12,right:12,
        background:"rgba(0,0,0,0.7)",border:"none",borderRadius:10,
        padding:"6px 12px",color:"#fff",fontSize:13,cursor:"pointer"}}>✕ Thu nhỏ</button>
      <div style={{background:"#111128",padding:"6px 12px",maxHeight:80,overflowY:"auto"}}>
        {log.slice(-3).map((l,i)=><div key={i} style={{fontSize:12,color:"#8a8aaa"}}>{l}</div>)}
      </div>
    </div>
  );

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",
      background:t.bg,color:t.text,fontFamily:"'Nunito',sans-serif",maxWidth:480,margin:"0 auto"}}>
      {/* Header */}
      <div style={{background:t.bg2,borderBottom:"2px solid "+t.border,
        padding:"8px 10px",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        <button onClick={onBack} style={sBtn}>← Về</button>
        <span style={{fontSize:20}}>{game.thumb}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:900,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:t.text}}>{game.name}</div>
          <div style={{fontSize:9,color:t.text2}}>EDITOR</div>
        </div>
        <button onClick={share} style={sBtn}>🔗</button>
        <button onClick={save} disabled={saving} style={{...sBtn,background:"#00c853",color:"#000",fontWeight:900}}>
          {saving?"⏳":"💾"}
        </button>
        <button onClick={run} disabled={running||blocks.length===0} style={{
          ...sBtn,background:running?"#1a1a3a":"#4F8EF7",color:running?"#555":"#fff",fontWeight:900,
        }}>{running?"⏳":"▶"}</button>
      </div>

      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {/* BLOCKS */}
        {tab==="blocks"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <ActorsPanel actors={actors} setActors={setActors}
              activeActorId={activeActorId} setActiveActorId={setActiveActorId} theme={theme}/>
            {activeActorId===0&&(
              <div style={{padding:"6px 10px 0",borderBottom:"1px solid "+t.border,flexShrink:0}}>
                <div style={{fontSize:9,color:t.text2,marginBottom:5}}>SPRITE CHÍNH</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {SPRITES.map(s=>(
                    <button key={s} onClick={()=>setSprite(s)} style={{
                      background:sprite===s?"#2a2a5a":"transparent",
                      border:sprite===s?"2px solid #4F8EF7":"2px solid "+t.border,
                      borderRadius:8,padding:"3px 5px",fontSize:18,cursor:"pointer"}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:4,padding:"6px 8px 0",overflowX:"auto",flexShrink:0}}>
              {Object.entries(BLOCK_CATS).map(([key,c])=>(
                <button key={key} onClick={()=>setCat(key)} style={{
                  background:cat===key?c.color:t.bg3,border:"none",borderRadius:16,
                  padding:"5px 10px",color:cat===key?"#000":t.text2,
                  fontSize:11,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"inherit",
                }}>{c.label}</button>
              ))}
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"7px 9px"}}>
              {BLOCK_CATS[cat]?.blocks.map(b=>(
                <button key={b.id} onClick={()=>addBlock(b,cat)} style={{
                  width:"100%",background:BLOCK_CATS[cat].bg,
                  border:"2px solid "+BLOCK_CATS[cat].color+"44",
                  borderLeft:"5px solid "+BLOCK_CATS[cat].color,
                  borderRadius:11,padding:"12px",marginBottom:6,cursor:"pointer",
                  fontSize:14,fontWeight:700,color:"#fff",textAlign:"left",
                  display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"inherit",
                }}>
                  {b.label}<span style={{fontSize:18,color:BLOCK_CATS[cat].color}}>+</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SCRIPT */}
        {tab==="script"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"8px 10px",borderBottom:"1px solid "+t.border,flexShrink:0,
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:t.text2}}>
                {activeActorId===0?"🎭 Chính":"🎭 "+actors.find(a=>a.id===activeActorId)?.name}
                {" · "+currentBlocks.length+" blocks"}
              </span>
              <button onClick={()=>setCurrentBlocks(()=>[])} style={{...sBtn,color:"#aa4444"}}>🗑</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"9px 10px"}}>
              {currentBlocks.length===0
                ?<div style={{textAlign:"center",color:t.text2,marginTop:50}}>
                  <div style={{fontSize:38}}>🧩</div>
                  <div style={{fontWeight:700,marginTop:6}}>Chưa có block</div>
                 </div>
                :currentBlocks.map((b,i)=>(
                  <div key={b.id} style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:t.bg3,
                      border:"1px solid "+t.border,display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:10,color:t.text2,flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1,background:b.color+"18",border:"2px solid "+b.color+"44",
                      borderLeft:"5px solid "+b.color,borderRadius:11,padding:"10px 12px",
                      fontSize:13,fontWeight:700,color:t.text,display:"flex",alignItems:"center",
                      justifyContent:"space-between",
                      boxShadow:running?"0 0 8px "+b.color+"33":"none"}}>
                      <span>{b.label}</span>
                      <button onClick={()=>setCurrentBlocks((p:Block[])=>p.filter(x=>x.id!==b.id))}
                        style={{background:"transparent",border:"none",color:t.text2,fontSize:16,cursor:"pointer"}}>✕</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* PREVIEW */}
        {tab==="preview"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{flex:"0 0 50%",position:"relative"}}>
              <Stage {...sp}/>
              <button onClick={()=>setFs(true)} style={{position:"absolute",top:8,right:8,
                background:"rgba(0,0,0,0.6)",border:"none",borderRadius:8,
                padding:"3px 8px",color:"#fff",fontSize:11,cursor:"pointer"}}>⛶ Full</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"7px 10px",borderTop:"1px solid "+t.border}}>
              <div style={{fontSize:9,color:t.text2,letterSpacing:1.5,marginBottom:5}}>CONSOLE</div>
              {log.length===0
                ?<div style={{color:t.text2,fontSize:12,textAlign:"center",marginTop:10}}>Nhấn ▶ Run</div>
                :log.map((l,i)=>(
                  <div key={i} style={{fontSize:12,padding:"2px 6px",borderRadius:5,marginBottom:2,
                    color:i===log.length-1?t.text:t.text2,
                    borderLeft:i===log.length-1?"3px solid #4F8EF7":"3px solid transparent"}}>{l}</div>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{display:"flex",background:t.nav,borderTop:"2px solid "+t.border,flexShrink:0}}>
        {([{key:"blocks" as const,icon:"🧩",label:"Blocks"},
           {key:"script" as const,icon:"📝",label:"Script",badge:currentBlocks.length},
           {key:"preview" as const,icon:"▶",label:"Preview"}]).map(tb=>(
          <button key={tb.key} onClick={()=>setTab(tb.key)} style={{
            flex:1,padding:"9px 0 6px",background:"transparent",border:"none",cursor:"pointer",
            borderTop:tab===tb.key?"3px solid #4F8EF7":"3px solid transparent",
            display:"flex",flexDirection:"column",alignItems:"center",gap:1,fontFamily:"inherit",
          }}>
            <span style={{fontSize:17}}>{tb.icon}</span>
            <span style={{fontSize:9,color:tab===tb.key?"#4F8EF7":t.text2,fontWeight:700}}>
              {"badge" in tb&&tb.badge>0?tb.label+" ("+tb.badge+")":tb.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── PLAYER ───────────────────────────────────
function Player({game,user,onBack,theme}:{game:Game;user:User|null;onBack:()=>void;theme:Theme}) {
  const [running,setRunning]   = useState(false);
  const [log,setLog]           = useState<string[]>([]);
  const [pos,setPos]           = useState({x:40,y:55});
  const [scale,setScale]       = useState(1);
  const [bubble,setBubble]     = useState<string|null>(null);
  const [hidden,setHidden]     = useState(false);
  const [score,setScore]       = useState(0);
  const [rotation,setRotation] = useState(0);
  const [flash,setFlash]       = useState(false);
  const [particles,setParticles] = useState<Particle[]>([]);
  const [actors]               = useState<SpriteActor[]>(game.actors||[]);
  const [done,setDone]         = useState(false);
  const [liked,setLiked]       = useState(false);
  const [likes,setLikes]       = useState(game.likes||0);
  const [showC,setShowC]       = useState(false);
  const posRef = useRef({x:40,y:55});
  const t = getThemeColors(theme);
  const sBtn = makeSmallBtn(theme);

  useEffect(()=>{ posRef.current=pos; },[pos]);

  const reset=()=>{setPos({x:40,y:55});setScale(1);setBubble(null);setHidden(false);
    setScore(0);setRotation(0);setFlash(false);setDone(false);setParticles([]);};

  const play=async()=>{
    if(running) return;
    setRunning(true); setLog([]); reset();
    await runEngine(game.blocks,game.sprite,{
      setPos,setScale,setBubble,setHidden,setScore,
      setRotation,setFlash,setLog,setRunning,setParticles,
      pos:posRef.current,
    });
    setDone(true);
    if(game.id&&!game.id.startsWith("t"))
      await supabase.from("games").update({plays:(game.plays||0)+1}).eq("id",game.id);
  };

  const toggleLike=async()=>{
    if(!user) return;
    const nl=!liked; setLiked(nl); setLikes(c=>nl?c+1:Math.max(c-1,0));
    spawnParticles("hearts",80,20,setParticles);
    if(game.id&&!game.id.startsWith("t"))
      await supabase.from("games").update({likes:nl?likes+1:Math.max(likes-1,0)}).eq("id",game.id);
  };

  const sp:StageProps={sprite:game.sprite,pos,scale,hidden,flash,rotation,bubble,score,running,particles,actors,theme};

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",
      background:t.bg,color:t.text,fontFamily:"'Nunito',sans-serif",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:t.bg2,borderBottom:"2px solid "+t.border,
        padding:"10px 14px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <button onClick={onBack} style={sBtn}>← Về</button>
        <span style={{fontSize:22}}>{game.thumb}</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:900,fontSize:15,color:t.text}}>{game.name}</div>
          <div style={{fontSize:10,color:t.text2}}>{"by "+(game.username||"ẩn danh")}</div>
        </div>
        <button onClick={toggleLike} style={{
          background:liked?"#ff6b6b22":t.bg3,
          border:liked?"1px solid #ff6b6b66":"1px solid "+t.border,
          borderRadius:10,padding:"6px 10px",cursor:"pointer",
          color:liked?"#ff6b6b":t.text2,fontSize:12,fontFamily:"inherit",
        }}>{(liked?"❤️":"🤍")+" "+fmtNum(likes)}</button>
        <button onClick={()=>setShowC(true)} style={sBtn}>💬</button>
        <button onClick={play} disabled={running} style={{
          background:running?"#1a1a3a":"linear-gradient(135deg,#00c853,#00e676)",
          border:"none",borderRadius:12,padding:"8px 16px",
          color:running?"#555":"#000",fontWeight:900,fontSize:14,
          cursor:running?"not-allowed":"pointer",fontFamily:"inherit",
          boxShadow:running?"none":"0 0 16px #00c85344",
        }}>{running?"⏳":"▶ Chơi"}</button>
      </div>
      <div style={{flex:"0 0 55%",position:"relative"}}>
        <Stage {...sp}/>
        {done&&(
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.65)",
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
            <div style={{fontSize:48}}>🏆</div>
            <div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{"Xong! ⭐ "+score}</div>
            <button onClick={play} style={{background:"linear-gradient(135deg,#4F8EF7,#A259FF)",
              border:"none",borderRadius:12,padding:"10px 24px",color:"#fff",
              fontWeight:900,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>🔄 Chơi lại</button>
          </div>
        )}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"8px 12px",borderTop:"1px solid "+t.border}}>
        {log.length===0
          ?<div style={{color:t.text2,fontSize:12,textAlign:"center",marginTop:10}}>Nhấn ▶ Chơi</div>
          :log.map((l,i)=>(
            <div key={i} style={{fontSize:12,padding:"2px 6px",borderRadius:5,marginBottom:2,
              color:i===log.length-1?t.text:t.text2,
              borderLeft:i===log.length-1?"3px solid #4F8EF7":"3px solid transparent"}}>{l}</div>
          ))
        }
      </div>
      {showC&&user&&<CommentsSheet game={game} user={user} onClose={()=>setShowC(false)} theme={theme}/>}
    </div>
  );
}

// ── HOME ─────────────────────────────────────
export default function App() {
  const [user,setUser]     = useState<User|null>(null);
  const [loading,setLoading] = useState(true);
  const [theme,setTheme]   = useState<Theme>("dark");
  const [screen,setScreen] = useState<"home"|"editor"|"play">("home");
  const [activeGame,setActiveGame] = useState<Game|null>(null);
  const [myGames,setMyGames] = useState<Game[]>([]);
  const [homeTab,setHomeTab] = useState<"mine"|"explore">("mine");
  const [showCreate,setShowCreate] = useState(false);
  const [showProfile,setShowProfile] = useState(false);
  const [showEditProfile,setShowEditProfile] = useState(false);
  const [showNotifs,setShowNotifs]   = useState(false);
  const [showC,setShowC]   = useState(false);
  const [cGame,setCGame]   = useState<Game|null>(null);
  const [unread,setUnread] = useState(0);
  const [newName,setNewName] = useState("");
  const [newThumb,setNewThumb] = useState("🌋");
  const [q,setQ]           = useState("");
  const [results,setResults] = useState<Game[]>([]);
  const [publicGames,setPublicGames] = useState<Game[]>([]);

  const t = getThemeColors(theme);
  const iS = makeInputStyle(theme);
  const sBtn = makeSmallBtn(theme);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setUser(session?.user??null);setLoading(false);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>setUser(s?.user??null));
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!user) return;
    supabase.from("games").select("*").eq("user_id",user.id).order("created_at",{ascending:false})
      .then(({data})=>{if(data)setMyGames(data as Game[]);});
    supabase.from("notifications").select("id").eq("user_id",user.id).eq("is_read",false)
      .then(({data})=>{if(data)setUnread(data.length);});
  },[user]);

  useEffect(()=>{
    supabase.from("games").select("*").eq("is_public",true).order("plays",{ascending:false}).limit(20)
      .then(({data})=>{if(data)setPublicGames(data as Game[]);});
  },[]);

  useEffect(()=>{
    if(!q.trim()){setResults([]);return;}
    const timer=setTimeout(async()=>{
      const {data}=await