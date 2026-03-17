import { useState, useRef, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import {
  supabase, fmtNum, addXP, makeInputStyle, makeSmallBtn, getThemeColors,
  getLevelFromXP, LEVEL_TITLES, THUMBNAILS, SPRITES, CATEGORIES,
  BLOCK_CATS, DEMO_GAMES, Game, Block, SpriteActor, Particle,
  GameVariable, Theme, playBgMusic, GAME_TEMPLATES,
} from "./types";
import {
  Modal, Stage, AuthScreen, CommentsSheet, NotifSheet, ProfileEditor,
  ActorsPanel, GameSettings, TemplatePicker, XPBar,
  runEngine, spawnParticles, StageProps,
} from "./components";

// ── EDITOR ───────────────────────────────────
function Editor({game,user,onBack,onSave,theme}:{
  game:Game;user:User;onBack:()=>void;onSave:(g:Game)=>void;theme:Theme;
}) {
  const [tab,setTab]           = useState<"blocks"|"script"|"preview">("blocks");
  const [cat,setCat]           = useState("events");
  const [blocks,setBlocks]     = useState<Block[]>(game.blocks||[]);
  const [sprite,setSprite]     = useState(game.sprite||"🐱");
  const [actors,setActors]     = useState<SpriteActor[]>(game.actors||[]);
  const [activeActorId,setActiveActorId] = useState(0);
  const [gameSettings,setGameSettings]   = useState<Partial<Game>>({
    name:game.name, bgColor:game.bgColor, groundColor:game.groundColor,
    groundBorder:game.groundBorder, bgMusic:game.bgMusic||"none",
    is_public:game.is_public||false, variables:game.variables||[],
  });
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
  const [vars,setVars]         = useState<Record<string,number|string>>({});
  const [saving,setSaving]     = useState(false);
  const [fs,setFs]             = useState(false);
  const [showSettings,setShowSettings] = useState(false);
  const [editBlockId,setEditBlockId]   = useState<number|null>(null);
  const [editBlockVal,setEditBlockVal] = useState("");
  const posRef = useRef({x:40,y:55});
  const nid    = useRef(100);
  const t      = getThemeColors(theme);
  const sBtn   = makeSmallBtn(theme);
  const iS     = makeInputStyle(theme);

  useEffect(()=>{ posRef.current=pos; },[pos]);

  const currentBlocks = activeActorId===0
    ? blocks
    : actors.find(a=>a.id===activeActorId)?.blocks||[];

  const setCurrentBlocks=(fn:Function)=>{
    if(activeActorId===0) setBlocks(fn as any);
    else setActors(p=>p.map(a=>a.id===activeActorId?{...a,blocks:fn(a.blocks)}:a));
  };

  const addBlock=(b:{id:string;label:string;hasValue?:boolean},ck:string)=>{
    const newBlock:Block={id:nid.current++,blockId:b.id,label:b.label,
      color:BLOCK_CATS[ck].color,value:b.hasValue?"10":undefined};
    setCurrentBlocks((p:Block[])=>[...p,newBlock]);
    setTab("script");
  };

  const run=async()=>{
    setRunning(true); setLog([]); setParticles([]);
    setPos({x:40,y:55}); setScale(1); setBubble(null);
    setHidden(false); setScore(0); setRotation(0); setFlash(false);
    const initVars:Record<string,number|string>={};
    (gameSettings.variables||[]).forEach(v=>{ initVars[v.name]=v.varType==="number"?Number(v.defaultValue):v.defaultValue; });
    setVars(initVars);
    setTab("preview");
    if(gameSettings.bgMusic&&gameSettings.bgMusic!=="none") playBgMusic(gameSettings.bgMusic);
    await runEngine(blocks,sprite,{
      setPos,setScale,setBubble,setHidden,setScore,
      setRotation,setFlash,setLog,setRunning,setParticles,setVars,
      pos:posRef.current,vars:initVars,
    });
    await addXP(user.id,10,
      (user.user_metadata?.username as string)||"Bạn",
      (user.user_metadata?.avatar as string)||"😎");
  };

  const save=async()=>{
    setSaving(true);
    const payload={...gameSettings,sprite,blocks,actors,user_id:user.id};
    let updated={...game,...gameSettings,sprite,blocks,actors};
    if(game.id&&!game.id.startsWith("local")){
      await supabase.from("games").update(payload).eq("id",game.id);
    } else {
      const {data}=await supabase.from("games").insert({...payload,is_public:gameSettings.is_public||false}).select().single();
      if(data) updated={...updated,id:(data as Game).id};
    }
    await addXP(user.id,5,
      (user.user_metadata?.username as string)||"Bạn",
      (user.user_metadata?.avatar as string)||"😎");
    setSaving(false); onSave(updated);
  };

  const sp:StageProps={
    sprite,pos,scale,hidden,flash,rotation,bubble,score,running,particles,actors,theme,
    bgColor:gameSettings.bgColor,groundColor:gameSettings.groundColor,
    groundBorder:gameSettings.groundBorder,variables:vars,
  };

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
        padding:"8px 10px",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
        <button onClick={onBack} style={sBtn}>← Về</button>
        <span style={{fontSize:18}}>{game.thumb}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:900,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",
            textOverflow:"ellipsis",color:t.text}}>{gameSettings.name||game.name}</div>
          <div style={{fontSize:9,color:t.text2}}>
            {actors.length>0?"+"+actors.length+"🎭 ":""}
            {(gameSettings.variables||[]).length>0?"+"+( gameSettings.variables||[]).length+"📊 ":""}
            {gameSettings.bgMusic!=="none"?"🎵 ":""}
          </div>
        </div>
        <button onClick={()=>setShowSettings(true)} style={sBtn}>⚙️</button>
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
              <div style={{padding:"6px 10px 4px",borderBottom:"1px solid "+t.border,flexShrink:0}}>
                <div style={{fontSize:9,color:t.text2,marginBottom:4}}>SPRITE CHÍNH</div>
                <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                  {SPRITES.map(s=>(
                    <button key={s} onClick={()=>setSprite(s)} style={{
                      background:sprite===s?"#2a2a5a":"transparent",
                      border:sprite===s?"2px solid #4F8EF7":"2px solid "+t.border,
                      borderRadius:7,padding:"2px 4px",fontSize:17,cursor:"pointer"}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:4,padding:"5px 8px 0",overflowX:"auto",flexShrink:0}}>
              {Object.entries(BLOCK_CATS).map(([key,c])=>(
                <button key={key} onClick={()=>setCat(key)} style={{
                  background:cat===key?c.color:t.bg3,border:"none",borderRadius:14,
                  padding:"4px 9px",color:cat===key?"#000":t.text2,
                  fontSize:10,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"inherit",
                }}>{c.label}</button>
              ))}
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"6px 9px"}}>
              {BLOCK_CATS[cat]?.blocks.map(b=>(
                <button key={b.id} onClick={()=>addBlock(b,cat)} style={{
                  width:"100%",background:BLOCK_CATS[cat].bg,
                  border:"2px solid "+BLOCK_CATS[cat].color+"44",
                  borderLeft:"5px solid "+BLOCK_CATS[cat].color,
                  borderRadius:10,padding:"10px 12px",marginBottom:5,cursor:"pointer",
                  fontSize:13,fontWeight:700,color:"#fff",textAlign:"left",
                  display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"inherit",
                }}>
                  <span>{b.label}</span>
                  <span style={{fontSize:16,color:BLOCK_CATS[cat].color}}>+</span>
                </button>
              ))}
              {/* Variables hint */}
              {(gameSettings.variables||[]).length>0&&cat==="variables"&&(
                <div style={{background:t.bg3,borderRadius:10,padding:"8px 10px",marginTop:4}}>
                  <div style={{fontSize:10,color:t.text2,marginBottom:4}}>BIẾN HIỆN TẠI:</div>
                  {(gameSettings.variables||[]).map(v=>(
                    <div key={v.id} style={{fontSize:12,color:"#00C853",fontWeight:700}}>
                      {"📊 "+v.name+" = "+v.defaultValue}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCRIPT */}
        {tab==="script"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"7px 10px",borderBottom:"1px solid "+t.border,flexShrink:0,
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:t.text2}}>
                {activeActorId===0?"🎭 Chính":"🎭 "+actors.find(a=>a.id===activeActorId)?.name}
                {" · "+currentBlocks.length}
              </span>
              <button onClick={()=>setCurrentBlocks(()=>[])} style={{...sBtn,color:"#aa4444"}}>🗑</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"8px 10px"}}>
              {currentBlocks.length===0
                ?<div style={{textAlign:"center",color:t.text2,marginTop:40}}>
                  <div style={{fontSize:36}}>🧩</div>
                  <div style={{fontWeight:700,marginTop:6}}>Chưa có block</div>
                 </div>
                :currentBlocks.map((b,i)=>(
                  <div key={b.id} style={{display:"flex",gap:5,marginBottom:5,alignItems:"center"}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:t.bg3,
                      border:"1px solid "+t.border,display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:10,color:t.text2,flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1}}>
                      <div style={{background:b.color+"18",border:"2px solid "+b.color+"44",
                        borderLeft:"5px solid "+b.color,borderRadius:10,padding:"8px 10px",
                        fontSize:12,fontWeight:700,color:t.text,
                        display:"flex",alignItems:"center",justifyContent:"space-between",
                        boxShadow:running?"0 0 8px "+b.color+"33":"none"}}>
                        <span>{b.label}</span>
                        <div style={{display:"flex",gap:4}}>
                          {b.value!==undefined&&(
                            <button onClick={()=>{setEditBlockId(b.id);setEditBlockVal(b.value||"");}}
                              style={{background:t.bg3,border:"1px solid "+b.color+"66",borderRadius:6,
                                padding:"1px 7px",fontSize:11,color:b.color,cursor:"pointer",fontWeight:700,fontFamily:"inherit"}}>
                              {b.value||"?"}
                            </button>
                          )}
                          <button onClick={()=>setCurrentBlocks((p:Block[])=>p.filter(x=>x.id!==b.id))}
                            style={{background:"transparent",border:"none",color:t.text2,fontSize:15,cursor:"pointer"}}>✕</button>
                        </div>
                      </div>
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
                padding:"3px 8px",color:"#fff",fontSize:11,cursor:"pointer"}}>⛶</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"6px 10px",borderTop:"1px solid "+t.border}}>
              <div style={{fontSize:9,color:t.text2,letterSpacing:1.5,marginBottom:4}}>CONSOLE</div>
              {log.length===0
                ?<div style={{color:t.text2,fontSize:12,textAlign:"center",marginTop:8}}>Nhấn ▶</div>
                :log.map((l,i)=>(
                  <div key={i} style={{fontSize:11,padding:"2px 5px",borderRadius:4,marginBottom:1,
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
            flex:1,padding:"8px 0 5px",background:"transparent",border:"none",cursor:"pointer",
            borderTop:tab===tb.key?"3px solid #4F8EF7":"3px solid transparent",
            display:"flex",flexDirection:"column",alignItems:"center",gap:1,fontFamily:"inherit",
          }}>
            <span style={{fontSize:16}}>{tb.icon}</span>
            <span style={{fontSize:9,color:tab===tb.key?"#4F8EF7":t.text2,fontWeight:700}}>
              {"badge" in tb&&tb.badge>0?tb.label+" ("+tb.badge+")":tb.label}
            </span>
          </button>
        ))}
      </div>

      {/* Settings modal */}
      {showSettings&&(
        <GameSettings game={{...game,...gameSettings,variables:gameSettings.variables||[]}}
          onSave={s=>{setGameSettings(prev=>({...prev,...s}));setShowSettings(false);}}
          onClose={()=>setShowSettings(false)} theme={theme}/>
      )}

      {/* Edit block value */}
      {editBlockId!==null&&(
        <Modal onClose={()=>setEditBlockId(null)} theme={theme}>
          <div style={{fontWeight:900,fontSize:16,marginBottom:12,color:t.text}}>✏️ Chỉnh giá trị block</div>
          <input value={editBlockVal} onChange={e=>setEditBlockVal(e.target.value)}
            placeholder="Nhập giá trị..." style={iS}
            onKeyDown={e=>{
              if(e.key==="Enter"){
                setCurrentBlocks((p:Block[])=>p.map(b=>b.id===editBlockId?{...b,value:editBlockVal}:b));
                setEditBlockId(null);
              }
            }}/>
          <button onClick={()=>{
            setCurrentBlocks((p:Block[])=>p.map(b=>b.id===editBlockId?{...b,value:editBlockVal}:b));
            setEditBlockId(null);
          }} style={{width:"100%",padding:"12px",background:"#4F8EF7",border:"none",borderRadius:12,
            color:"#fff",fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>
            ✅ Xác nhận
          </button>
        </Modal>
      )}
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
  const [vars,setVars]         = useState<Record<string,number|string>>({});
  const [done,setDone]         = useState(false);
  const [liked,setLiked]       = useState(false);
  const [likes,setLikes]       = useState(game.likes||0);
  const [showC,setShowC]       = useState(false);
  const posRef = useRef({x:40,y:55});
  const t      = getThemeColors(theme);
  const sBtn   = makeSmallBtn(theme);

  useEffect(()=>{ posRef.current=pos; },[pos]);

  const reset=()=>{
    setPos({x:40,y:55});setScale(1);setBubble(null);setHidden(false);
    setScore(0);setRotation(0);setFlash(false);setDone(false);setParticles([]);
    const initVars:Record<string,number|string>={};
    (game.variables||[]).forEach(v=>{ initVars[v.name]=v.varType==="number"?Number(v.defaultValue):v.defaultValue; });
    setVars(initVars);
  };

  const play=async()=>{
    if(running) return;
    setRunning(true); setLog([]); reset();
    if(game.bgMusic&&game.bgMusic!=="none") playBgMusic(game.bgMusic);
    await runEngine(game.blocks,game.sprite,{
      setPos,setScale,setBubble,setHidden,setScore,
      setRotation,setFlash,setLog,setRunning,setParticles,setVars,
      pos:posRef.current,vars,
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

  const sp:StageProps={
    sprite:game.sprite,pos,scale,hidden,flash,rotation,bubble,score,running,
    particles,actors,theme,bgColor:game.bgColor,groundColor:game.groundColor,
    groundBorder:game.groundBorder,variables:vars,
  };

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",
      background:t.bg,color:t.text,fontFamily:"'Nunito',sans-serif",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:t.bg2,borderBottom:"2px solid "+t.border,
        padding:"10px 14px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <button onClick={onBack} style={sBtn}>← Về</button>
        <span style={{fontSize:22}}>{game.thumb}</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:900,fontSize:15,color:t.text}}