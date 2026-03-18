import { useState, useRef, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, getT, iStyle, sBtn, SPRITES, BLOCK_CATS, BG_COLORS, MUSIC_TRACKS, Game, Block, SpriteActor, Particle, GameVariable, Theme, addXP } from "./types";
import { Stage, StageProps, runEngine, spawnParticles } from "./engine";
import { Modal } from "./components";

export function Editor({game,user,onBack,onSave,theme}:{game:Game;user:User;onBack:()=>void;onSave:(g:Game)=>void;theme:Theme}) {
  const [tab,setTab]     = useState<"blocks"|"script"|"preview">("blocks");
  const [cat,setCat]     = useState("events");
  const [blocks,setBlocks] = useState<Block[]>(game.blocks||[]);
  const [sprite,setSprite] = useState(game.sprite||"🐱");
  const [actors,setActors] = useState<SpriteActor[]>(game.actors||[]);
  const [settings,setSettings] = useState({name:game.name,bgColor:game.bgColor,groundColor:game.groundColor,groundBorder:game.groundBorder,bgMusic:game.bgMusic||"none",is_public:game.is_public||false,variables:game.variables||[] as GameVariable[]});
  const [running,setRunning] = useState(false);
  const [log,setLog]     = useState<string[]>([]);
  const [pos,setPos]     = useState({x:40,y:55});
  const [scale,setScale] = useState(1);
  const [bubble,setBubble] = useState<string|null>(null);
  const [hidden,setHidden] = useState(false);
  const [score,setScore] = useState(0);
  const [rotation,setRotation] = useState(0);
  const [flash,setFlash] = useState(false);
  const [particles,setParticles] = useState<Particle[]>([]);
  const [vars,setVars]   = useState<Record<string,number|string>>({});
  const [saving,setSaving] = useState(false);
  const [fs,setFs]       = useState(false);
  const [showCfg,setShowCfg] = useState(false);
  const [editId,setEditId]   = useState<number|null>(null);
  const [editVal,setEditVal] = useState("");
  const [newVar,setNewVar]   = useState("");
  const posRef = useRef({x:40,y:55});
  const nid    = useRef(200);
  const t      = getT(theme);
  const sB     = sBtn(theme);
  const iS     = iStyle(theme);
  useEffect(()=>{posRef.current=pos;},[pos]);

  const run=async()=>{
    setRunning(true);setLog([]);setParticles([]);
    setPos({x:40,y:55});setScale(1);setBubble(null);setHidden(false);setScore(0);setRotation(0);setFlash(false);
    const iv:Record<string,number|string>={};(settings.variables||[]).forEach(v=>{iv[v.name]=v.varType==="number"?Number(v.defaultValue):v.defaultValue;});setVars(iv);
    setTab("preview");
    await runEngine(blocks,sprite,{setPos,setScale,setBubble,setHidden,setScore,setRotation,setFlash,setLog,setRunning,setParticles,setVars,pos:posRef.current,vars:iv});
    await addXP(user.id,10,(user.user_metadata?.username as string)||"Bạn",(user.user_metadata?.avatar as string)||"😎");
  };

  const save=async()=>{
    setSaving(true);
    const payload={...settings,sprite,blocks,actors,user_id:user.id};
    let updated={...game,...settings,sprite,blocks,actors};
    if(game.id&&!game.id.startsWith("local")){await supabase.from("games").update(payload).eq("id",game.id);}
    else{const{data}=await supabase.from("games").insert({...payload,is_public:settings.is_public||false}).select().single();if(data)updated={...updated,id:(data as Game).id};}
    await addXP(user.id,5,(user.user_metadata?.username as string)||"Bạn",(user.user_metadata?.avatar as string)||"😎");
    setSaving(false);onSave(updated);
  };

  const sp:StageProps={sprite,pos,scale,hidden,flash,rotation,bubble,score,running,particles,actors,theme,bgColor:settings.bgColor,groundColor:settings.groundColor,groundBorder:settings.groundBorder,vars};

  if(fs&&tab==="preview") return(
    <div style={{position:"fixed",inset:0,background:"#000",zIndex:500,display:"flex",flexDirection:"column"}}>
      <div style={{flex:1,position:"relative"}}><Stage {...sp}/></div>
      <button onClick={()=>setFs(false)} style={{position:"absolute",top:14,right:14,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,padding:"7px 14px",color:"#fff",fontSize:13,cursor:"pointer"}}>✕</button>
      <div style={{background:"rgba(0,0,0,0.85)",padding:"6px 12px",maxHeight:80,overflowY:"auto"}}>
        {log.slice(-3).map((l,i)=><div key={i} style={{fontSize:12,color:"#8888bb"}}>{l}</div>)}
      </div>
    </div>
  );

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:t.bg,color:t.text,fontFamily:"'Nunito',sans-serif",maxWidth:480,margin:"0 auto"}}>
      {/* Header */}
      <div style={{background:t.bg2,borderBottom:"1px solid "+t.border,padding:"10px 12px",display:"flex",alignItems:"center",gap:8,flexShrink:0,boxShadow:"0 2px 12px rgba(0,0,0,0.15)"}}>
        <button onClick={onBack} style={sB}>← Về</button>
        <span style={{fontSize:20}}>{game.thumb}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:900,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:t.text}}>{settings.name}</div>
          <div style={{fontSize:9,color:t.text2,display:"flex",gap:6}}>
            {actors.length>0&&<span>+{actors.length}🎭</span>}
            {(settings.variables||[]).length>0&&<span>{(settings.variables||[]).length}📊</span>}
            {settings.bgMusic!=="none"&&<span>🎵</span>}
          </div>
        </div>
        <button onClick={()=>setShowCfg(true)} style={sB}>⚙️</button>
        <button onClick={save} disabled={saving} style={{...sB,background:"linear-gradient(135deg,#00C853,#69F0AE)",color:"#000",fontWeight:900,border:"none",boxShadow:saving?"none":"0 2px 12px #00C85344"}}>{saving?"⏳":"💾"}</button>
        <button onClick={run} disabled={running||blocks.length===0} style={{...sB,background:running?"#1a1a3a":"linear-gradient(135deg,#4F8EF7,#7C3AED)",color:running?"#555":"#fff",fontWeight:900,border:"none",boxShadow:running?"none":"0 2px 12px #4F8EF755"}}>{running?"⏳":"▶"}</button>
      </div>

      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {tab==="blocks"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            {/* Sprite row */}
            <div style={{padding:"8px 10px 6px",borderBottom:"1px solid "+t.border,flexShrink:0}}>
              <div style={{fontSize:9,color:t.text2,letterSpacing:1,marginBottom:5}}>NHÂN VẬT</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {SPRITES.map(s=>(
                  <button key={s} onClick={()=>setSprite(s)} style={{background:sprite===s?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"transparent",border:sprite===s?"2px solid #4F8EF7":"2px solid "+t.border,borderRadius:10,padding:"3px 5px",fontSize:18,cursor:"pointer",transition:"all 0.15s",transform:sprite===s?"scale(1.1)":"scale(1)"}}>{s}</button>
                ))}
              </div>
            </div>
            {/* Cat tabs */}
            <div style={{display:"flex",gap:4,padding:"6px 8px 0",overflowX:"auto",flexShrink:0}}>
              {Object.entries(BLOCK_CATS).map(([key,c])=>(
                <button key={key} onClick={()=>setCat(key)} style={{background:cat===key?c.color:t.bg3,border:"none",borderRadius:20,padding:"5px 11px",color:cat===key?"#000":t.text2,fontSize:11,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"inherit",transition:"all 0.15s",boxShadow:cat===key?"0 2px 10px "+c.color+"55":"none"}}>{c.label}</button>
              ))}
            </div>
            {/* Blocks */}
            <div style={{flex:1,overflowY:"auto",padding:"7px 9px"}}>
              {BLOCK_CATS[cat]?.blocks.map(b=>(
                <button key={b.id} onClick={()=>{setBlocks(p=>[...p,{id:nid.current++,blockId:b.id,label:b.label,color:BLOCK_CATS[cat].color,value:b.hasValue?"10":undefined}]);setTab("script");}} style={{width:"100%",background:BLOCK_CATS[cat].bg,border:"1.5px solid "+BLOCK_CATS[cat].color+"44",borderLeft:"5px solid "+BLOCK_CATS[cat].color,borderRadius:12,padding:"12px",marginBottom:6,cursor:"pointer",fontSize:13,fontWeight:700,color:"#fff",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"inherit",transition:"all 0.15s"}}>
                  {b.label}<span style={{fontSize:16,color:BLOCK_CATS[cat].color,fontWeight:900}}>+</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab==="script"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"8px 12px",borderBottom:"1px solid "+t.border,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:t.text2}}>{"📝 "+sprite+" · "+blocks.length+" blocks"}</span>
              <button onClick={()=>setBlocks([])} style={{...sB,color:"#EF4444",fontSize:11}}>🗑 Xóa</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"9px 10px"}}>
              {blocks.length===0
                ?<div style={{textAlign:"center",color:t.text2,marginTop:50}}><div style={{fontSize:42}}>🧩</div><div style={{fontWeight:700,marginTop:8}}>Chưa có block</div></div>
                :blocks.map((b,i)=>(
                  <div key={b.id} style={{display:"flex",gap:6,marginBottom:7,alignItems:"center"}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:t.bg3,border:"1px solid "+t.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:t.text2,flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1,background:b.color+"18",border:"1.5px solid "+b.color+"44",borderLeft:"5px solid "+b.color,borderRadius:12,padding:"10px 12px",fontSize:13,fontWeight:700,color:t.text,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:running?"0 0 10px "+b.color+"44":"none",transition:"box-shadow 0.3s"}}>
                      <span>{b.label}</span>
                      <div style={{display:"flex",gap:4}}>
                        {b.value!==undefined&&(
                          <button onClick={()=>{setEditId(b.id);setEditVal(b.value||"");}} style={{background:t.bg3,border:"1px solid "+b.color+"66",borderRadius:8,padding:"1px 8px",fontSize:11,color:b.color,cursor:"pointer",fontWeight:800,fontFamily:"inherit"}}>{b.value||"?"}</button>
                        )}
                        <button onClick={()=>setBlocks(p=>p.filter(x=>x.id!==b.id))} style={{background:"transparent",border:"none",color:t.text2,fontSize:16,cursor:"pointer"}}>✕</button>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {tab==="preview"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{flex:"0 0 50%",position:"relative"}}><Stage {...sp}/><button onClick={()=>setFs(true)} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"4px 9px",color:"#fff",fontSize:11,cursor:"pointer"}}>⛶ Full</button></div>
            <div style={{flex:1,overflowY:"auto",padding:"7px 10px",borderTop:"1px solid "+t.border}}>
              <div style={{fontSize:9,color:t.text2,letterSpacing:1.5,marginBottom:5}}>CONSOLE</div>
              {log.length===0?<div style={{color:t.text2,fontSize:12,textAlign:"center",marginTop:10}}>Nhấn ▶ Run</div>
                :log.map((l,i)=><div key={i} style={{fontSize:12,padding:"2px 6px",borderRadius:6,marginBottom:2,color:i===log.length-1?t.text:t.text2,borderLeft:i===log.length-1?"3px solid #4F8EF7":"3px solid transparent",background:i===log.length-1?t.bg3:"transparent"}}>{l}</div>)}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{display:"flex",background:t.nav,borderTop:"1px solid "+t.border,flexShrink:0,boxShadow:"0 -4px 20px rgba(0,0,0,0.1)"}}>
        {([{key:"blocks" as const,icon:"🧩",label:"Blocks"},{key:"script" as const,icon:"📝",label:"Script",badge:blocks.length},{key:"preview" as const,icon:"▶",label:"Preview"}]).map(tb=>(
          <button key={tb.key} onClick={()=>setTab(tb.key)} style={{flex:1,padding:"10px 0 7px",background:"transparent",border:"none",cursor:"pointer",borderTop:tab===tb.key?"3px solid #4F8EF7":"3px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:2,fontFamily:"inherit",transition:"all 0.15s"}}>
            <span style={{fontSize:18}}>{tb.icon}</span>
            <span style={{fontSize:9,color:tab===tb.key?"#4F8EF7":t.text2,fontWeight:700}}>{"badge" in tb&&tb.badge>0?tb.label+" ("+tb.badge+")":tb.label}</span>
          </button>
        ))}
      </div>

      {/* Settings modal */}
      {showCfg&&(
        <Modal onClose={()=>setShowCfg(false)} theme={theme}>
          <div style={{fontWeight:900,fontSize:17,marginBottom:14,textAlign:"center",color:t.text}}>⚙️ Cài đặt Game</div>
          <div style={{fontSize:10,color:t.text2,letterSpacing:1,marginBottom:5}}>TÊN</div>
          <input value={settings.name} onChange={e=>setSettings(s=>({...s,name:e.target.value}))} style={iS}/>
          <div style={{fontSize:10,color:t.text2,letterSpacing:1,marginBottom:7}}>NỀN SÂN KHẤU</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {BG_COLORS.map((bg,i)=>(
              <button key={i} onClick={()=>setSettings(s=>({...s,bgColor:bg.sky,groundColor:bg.ground,groundBorder:bg.groundBorder}))} style={{background:bg.sky,border:settings.bgColor===bg.sky?"3px solid #4F8EF7":"2px solid transparent",borderRadius:10,padding:"6px 10px",cursor:"pointer",fontSize:11,color:"#fff",fontWeight:700,fontFamily:"inherit",textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}>{bg.label}</button>
            ))}
          </div>
          <div style={{fontSize:10,color:t.text2,letterSpacing:1,marginBottom:7}}>NHẠC NỀN</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
            {MUSIC_TRACKS.map(tr=>(
              <button key={tr.id} onClick={()=>setSettings(s=>({...s,bgMusic:tr.id}))} style={{background:settings.bgMusic===tr.id?"linear-gradient(135deg,#4F8EF7,#7C3AED)":t.bg3,border:"1px solid "+(settings.bgMusic===tr.id?"#4F8EF7":t.border),borderRadius:20,padding:"5px 10px",cursor:"pointer",fontSize:11,color:settings.bgMusic===tr.id?"#fff":t.text2,fontWeight:700,fontFamily:"inherit"}}>{tr.label}</button>
            ))}
          </div>
          <div style={{fontSize:10,color:t.text2,letterSpacing:1,marginBottom:7}}>BIẾN NGƯỜI CHƠI</div>
          {(settings.variables||[]).map((v,i)=>(
            <div key={v.id} style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
              <div style={{flex:1,background:t.bg3,borderRadius:10,padding:"8px 12px",border:"1px solid "+t.border,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontWeight:700,color:"#00C853",fontSize:12}}>📊 {v.name}</span>
                <span style={{color:t.text2,fontSize:11}}>{v.defaultValue}</span>
              </div>
              <button onClick={()=>setSettings(s=>({...s,variables:(s.variables||[]).filter((_,j)=>j!==i)}))} style={{background:"transparent",border:"none",color:"#EF4444",fontSize:16,cursor:"pointer"}}>✕</button>
            </div>
          ))}
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            <input value={newVar} onChange={e=>setNewVar(e.target.value)} placeholder="Tên biến (lives, speed...)" onKeyDown={e=>{if(e.key==="Enter"&&newVar.trim()){setSettings(s=>({...s,variables:[...(s.variables||[]),{id:"v"+Date.now(),name:newVar.trim(),defaultValue:"0",varType:"number" as const}]}));setNewVar("");}}} style={{...iS,marginBottom:0,flex:1}}/>
            <button onClick={()=>{if(!newVar.trim())return;setSettings(s=>({...s,variables:[...(s.variables||[]),{id:"v"+Date.now(),name:newVar.trim(),defaultValue:"0",varType:"number" as const}]}));setNewVar("");}} style={{background:"#00C853",border:"none",borderRadius:10,padding:"0 14px",color:"#000",fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>+</button>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:t.bg3,borderRadius:12,padding:"12px 14px",marginBottom:12}}>
            <div><div style={{fontWeight:700,fontSize:14,color:t.text}}>🌍 Public</div><div style={{fontSize:11,color:t.text2}}>Cho mọi người chơi</div></div>
            <button onClick={()=>setSettings(s=>({...s,is_public:!s.is_public}))} style={{background:settings.is_public?"#00C853":"#3a3a6a",border:"none",borderRadius:99,width:48,height:26,cursor:"pointer",display:"flex",alignItems:"center",padding:2,transition:"background 0.2s"}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"#fff",marginLeft:settings.is_public?22:2,transition:"margin 0.2s"}}/>
            </button>
          </div>
          <button onClick={()=>setShowCfg(false)} style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",border:"none",borderRadius:14,color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 20px #4F8EF755"}}>✅ Xong</button>
        </Modal>
      )}

      {/* Edit block value */}
      {editId!==null&&(
        <Modal onClose={()=>setEditId(null)} theme={theme}>
          <div style={{fontWeight:900,fontSize:16,marginBottom:12,color:t.text}}>✏️ Chỉnh giá trị</div>
          <input value={editVal} onChange={e=>setEditVal(e.target.value)} placeholder="Giá trị..." style={iS} onKeyDown={e=>{if(e.key==="Enter"){setBlocks(p=>p.map(b=>b.id===editId?{...b,value:editVal}:b));setEditId(null);}}}/>
          <button onClick={()=>{setBlocks(p=>p.map(b=>b.id===editId?{...b,value:editVal}:b));setEditId(null);}} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",border:"none",borderRadius:14,color:"#fff",fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>✅ OK</button>
        </Modal>
      )}
    </div>
  );
}
