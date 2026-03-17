import { useState, useEffect, useRef } from "react";
import { User } from "@supabase/supabase-js";
import {
  supabase, playSound, playBgMusic, timeAgo, fmtNum, addXP,
  makeInputStyle, makeSmallBtn, getThemeColors,
  getLevelFromXP, getXPProgress, xpForLevel, LEVEL_TITLES,
  Block, Game, Comment, Notification, SpriteActor, Particle, Theme,
  GameVariable, BLOCK_CATS, SPRITES, AVATARS, PARTICLE_SETS,
  BG_COLORS, MUSIC_TRACKS, GAME_TEMPLATES,
} from "./types";

// ── MODAL ────────────────────────────────────
export function Modal({children,onClose,theme}:{children:React.ReactNode;onClose:()=>void;theme:Theme}) {
  const t=getThemeColors(theme);
  return(
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

// ── XP BAR ───────────────────────────────────
export function XPBar({xp,theme}:{xp:number;theme:Theme}) {
  const t=getThemeColors(theme);
  const level=getLevelFromXP(xp);
  const progress=getXPProgress(xp);
  const title=LEVEL_TITLES[Math.min(level,LEVEL_TITLES.length-1)]||"👑";
  return(
    <div style={{background:t.bg3,borderRadius:12,padding:"8px 12px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <span style={{fontWeight:800,fontSize:13,color:t.text}}>{title} Lv.{level}</span>
        <span style={{fontSize:11,color:"#FFB829",fontWeight:700}}>{xp} XP</span>
      </div>
      <div style={{background:t.border,borderRadius:99,height:8,overflow:"hidden"}}>
        <div style={{background:"linear-gradient(90deg,#FFB829,#FF6B6B)",
          height:"100%",width:String(progress)+"%",
          borderRadius:99,transition:"width 0.5s ease"}}/>
      </div>
      <div style={{fontSize:10,color:t.text2,marginTop:3,textAlign:"right"}}>
        {progress}% tới Lv.{level+1}
      </div>
    </div>
  );
}

// ── PARTICLES ────────────────────────────────
export function ParticleLayer({particles}:{particles:Particle[]}) {
  return(
    <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:20}}>
      {particles.map(p=>(
        <div key={p.id} style={{
          position:"absolute",
          left:String(p.x)+"%",top:String(p.y)+"%",
          fontSize:p.size,opacity:p.life,
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
  particles:Particle[]; actors:SpriteActor[]; theme:Theme;
  bgColor?:string; groundColor?:string; groundBorder?:string;
  variables?:Record<string,number|string>;
}
export function Stage({sprite,pos,scale,hidden,flash,rotation,bubble,score,running,particles,actors,theme,bgColor,groundColor,groundBorder,variables}:StageProps) {
  const isDark=theme==="dark";
  const defaultBg=isDark?"linear-gradient(180deg,#0a1628,#0d1e36 70%,#0a1010)":"linear-gradient(180deg,#87CEEB,#98D8C8 70%,#90EE90)";
  const defaultGround=isDark?"linear-gradient(180deg,#163016,#0a1a0a)":"linear-gradient(180deg,#228B22,#1a6b1a)";
  return(
    <div style={{position:"relative",width:"100%",height:"100%",overflow:"hidden",
      background:bgColor||defaultBg}}>
      {(!bgColor||bgColor.includes("#0a1628"))&&[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(i=>(
        <div key={i} style={{position:"absolute",
          width:i%3===0?3:2,height:i%3===0?3:2,
          background:"#fff",borderRadius:"50%",
          left:String((i*43+7)%94)+"%",
          top:String((i*31+8)%78)+"%",opacity:0.3}}/>
      ))}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:32,
        background:groundColor||defaultGround,
        borderTop:"2px solid "+(groundBorder||(isDark?"#2a5a2a":"#1a5a1a"))}}/>
      {actors.map(a=>(
        a.hidden?null:
        <div key={a.id} style={{position:"absolute",
          left:String(a.pos.x)+"%",bottom:String(100-a.pos.y)+"%",
          fontSize:28*a.scale,transform:"rotate("+String(a.rotation)+"deg)",
          transition:"all 0.3s ease",
          filter:running?"drop-shadow(0 0 6px "+a.color+")":"none",zIndex:5}}>
          {a.emoji}
        </div>
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
        left:String(pos.x)+"%",bottom:String(100-pos.y)+"%",
        fontSize:34*scale,transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        transform:"rotate("+String(rotation)+"deg)",
        opacity:hidden?0:flash?0.2:1,
        filter:running?"drop-shadow(0 0 10px #4F8EF7)":"none",zIndex:10}}>
        {sprite}
      </div>
      <ParticleLayer particles={particles}/>
      <div style={{position:"absolute",top:6,left:8,background:"rgba(0,0,0,0.6)",
        borderRadius:8,padding:"2px 8px",fontSize:12,fontWeight:800,color:"#fff",zIndex:20}}>
        {"⭐ "+score}
      </div>
      {variables&&Object.keys(variables).length>0&&(
        <div style={{position:"absolute",top:6,right:8,background:"rgba(0,0,0,0.6)",
          borderRadius:8,padding:"2px 8px",fontSize:10,color:"#aaa",zIndex:20}}>
          {Object.entries(variables).slice(0,2).map(([k,v])=>k+": "+v).join(" | ")}
        </div>
      )}
    </div>
  );
}

// ── GAME ENGINE ──────────────────────────────
let particleId=1;
export function spawnParticles(type:string,x:number,y:number,setParticles:React.Dispatch<React.SetStateAction<Particle[]>>) {
  const set=PARTICLE_SETS[type as keyof typeof PARTICLE_SETS]||PARTICLE_SETS.stars;
  const newP:Particle[]=Array.from({length:8}).map(()=>({
    id:particleId++,
    x:x+(Math.random()-0.5)*20,y:y+(Math.random()-0.5)*10,
    vx:(Math.random()-0.5)*3,vy:-(Math.random()*3+1),
    life:1,emoji:set[Math.floor(Math.random()*set.length)],size:14+Math.random()*12,
  }));
  setParticles(p=>[...p,...newP]);
  let frame=0;
  const animate=()=>{
    frame++;
    setParticles(p=>p.map(x=>({...x,y:x.y+x.vy*0.8,x:x.x+x.vx*0.8,life:x.life-0.04})).filter(x=>x.life>0));
    if(frame<30) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

export async function runEngine(
  blocks:Block[], sprite:string,
  cb:{setPos:Function;setScale:Function;setBubble:Function;setHidden:Function;
      setScore:Function;setRotation:Function;setFlash:Function;setLog:Function;
      setRunning:Function;setParticles:Function;setVars:Function;
      pos:{x:number;y:number};vars:Record<string,number|string>;}
) {
  const l:string[]=[];
  const push=(m:string)=>{l.push(m);cb.setLog([...l]);};
  let stopped=false;
  for(const b of blocks){
    if(stopped) break;
    await new Promise(r=>setTimeout(r,b.blockId==="forever"?100:480));
    const val=b.value?Number(b.value)||b.value:10;
    switch(b.blockId){
      case "on_start":   push("🎮 Bắt đầu!"); break;
      case "on_tap":     push("👆 Chờ chạm..."); break;
      case "on_key":     push("⌨️ Chờ phím..."); break;
      case "on_score":   push("🎯 Kiểm tra điểm..."); break;
      case "move_right": cb.setPos((p:any)=>({...p,x:Math.min(p.x+Number(val),78)})); push("▶ Đi phải "+val); break;
      case "move_left":  cb.setPos((p:any)=>({...p,x:Math.max(p.x-Number(val),5)}));  push("◀ Đi trái "+val); break;
      case "move_up":    cb.setPos((p:any)=>({...p,y:Math.max(p.y-Number(val),10)})); push("⬆ Lên "+val); break;
      case "move_down":  cb.setPos((p:any)=>({...p,y:Math.min(p.y+Number(val),80)})); push("⬇ Xuống "+val); break;
      case "jump":
        cb.setPos((p:any)=>({...p,y:p.y-24})); playSound("jump");
        spawnParticles("stars",cb.pos.x,cb.pos.y,cb.setParticles);
        await new Promise(r=>setTimeout(r,300));
        cb.setPos((p:any)=>({...p,y:p.y+24})); push("⬆ Nhảy!"); break;
      case "teleport": cb.setPos({x:Math.random()*70+5,y:55}); push("🌀 Dịch chuyển!"); break;
      case "spin":     cb.setRotation((r:number)=>r+360); push("🔄 Xoay!"); break;
      case "say":      cb.setBubble(b.value||"Xin chào!"); push("💬 "+(b.value||"Xin chào!"));
        await new Promise(r=>setTimeout(r,1200)); cb.setBubble(null); break;
      case "grow":     cb.setScale((s:number)=>Math.min(s+0.3,2.2)); push("🔍 To ra"); break;
      case "shrink":   cb.setScale((s:number)=>Math.max(s-0.3,0.4)); push("🔎 Nhỏ"); break;
      case "hide":     cb.setHidden(true);  push("👻 Ẩn"); break;
      case "show":     cb.setHidden(false); push("👁️ Hiện"); break;
      case "flash":    cb.setFlash(true); await new Promise(r=>setTimeout(r,400)); cb.setFlash(false); push("✨ Flash!"); break;
      case "change_color": push("🎨 Đổi màu!"); break;
      case "play_jump": playSound("jump"); push("🔊 Jump!"); break;
      case "play_win":  playSound("win");  push("🏆 Win!"); break;
      case "play_pop":  playSound("pop");  push("💥 Pop!"); break;
      case "play_sad":  playSound("sad");  push("😢 Sad!"); break;
      case "particle_stars":  spawnParticles("stars",cb.pos.x,cb.pos.y,cb.setParticles);  push("⭐ Sao!"); break;
      case "particle_fire":   spawnParticles("fire",cb.pos.x,cb.pos.y,cb.setParticles);   push("🔥 Lửa!"); break;
      case "particle_hearts": spawnParticles("hearts",cb.pos.x,cb.pos.y,cb.setParticles); push("❤️ Tim!"); break;
      case "particle_coins":  spawnParticles("coins",cb.pos.x,cb.pos.y,cb.setParticles);  playSound("pop"); push("💰 Coin!"); break;
      case "particle_snow":   spawnParticles("snow",cb.pos.x,cb.pos.y,cb.setParticles);   push("❄️ Tuyết!"); break;
      case "score_add":
        cb.setScore((s:number)=>s+1);
        spawnParticles("coins",cb.pos.x,cb.pos.y,cb.setParticles);
        playSound("pop"); push("⭐ +1!"); break;
      case "score_set": cb.setScore(Number(val)); push("📌 Điểm = "+val); break;
      case "var_add":   cb.setVars((v:any)=>({...v,score:(Number(v.score||0)+Number(val))})); push("📈 +"+val); break;
      case "show_score":push("💯 Hiện điểm"); break;
      case "if_score":  push("🎯 Nếu điểm >= "+val); break;
      case "repeat":    push("🔁 Lặp "+(b.value||3)+" lần"); break;
      case "wait":      push("⏳ Chờ "+(b.value||1)+"s"); await new Promise(r=>setTimeout(r,(Number(b.value)||1)*1000)); break;
      case "if_touch":  push("🤔 Kiểm tra va chạm..."); break;
      case "forever":   push("♾️ Lặp mãi..."); break;
      case "stop":      stopped=true; push("⏹ Dừng!"); break;
    }
  }
  if(!stopped){ playSound("win"); spawnParticles("stars",50,50,cb.setParticles); push("🏁 Xong!"); }
  cb.setRunning(false);
}

// ── TEMPLATE PICKER ──────────────────────────
export function TemplatePicker({onSelect,onClose,theme}:{onSelect:(t:typeof GAME_TEMPLATES[0])=>void;onClose:()=>void;theme:Theme}) {
  const t=getThemeColors(theme);
  return(
    <Modal onClose={onClose} theme={theme}>
      <div style={{fontWeight:900,fontSize:17,marginBottom:14,textAlign:"center",color:t.text}}>
        🎮 Chọn Template
      </div>
      {GAME_TEMPLATES.map(tmp=>(
        <div key={tmp.id} onClick={()=>onSelect(tmp)} style={{
          background:t.bg3,borderRadius:14,padding:"12px 14px",marginBottom:10,
          cursor:"pointer",border:"1px solid "+t.border,
          display:"flex",gap:12,alignItems:"center",
        }}>
          <span style={{fontSize:36}}>{tmp.thumb}</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:14,color:t.text}}>{tmp.name}</div>
            <div style={{fontSize:12,color:t.text2,marginTop:2}}>{tmp.desc}</div>
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <span style={{fontSize:10,color:"#4F8EF7"}}>{tmp.blocks.length} blocks</span>
              <span style={{fontSize:10,color:"#00C853"}}>{tmp.variables.length} biến</span>
            </div>
          </div>
          <span style={{fontSize:20}}>→</span>
        </div>
      ))}
    </Modal>
  );
}

// ── GAME SETTINGS ────────────────────────────
export function GameSettings({game,onSave,onClose,theme}:{
  game:Game; onSave:(g:Partial<Game>)=>void; onClose:()=>void; theme:Theme;
}) {
  const t=getThemeColors(theme);
  const iS=makeInputStyle(theme);
  const [name,setName]     = useState(game.name);
  const [bgIdx,setBgIdx]   = useState(0);
  const [music,setMusic]   = useState(game.bgMusic||"none");
  const [isPublic,setIsPublic] = useState(game.is_public||false);
  const [variables,setVariables] = useState<GameVariable[]>(game.variables||[]);
  const [newVarName,setNewVarName] = useState("");

  const addVar=()=>{
    if(!newVarName.trim()) return;
    setVariables(p=>[...p,{id:"v"+Date.now(),name:newVarName.trim(),defaultValue:"0",varType:"number"}]);
    setNewVarName("");
  };

  return(
    <Modal onClose={onClose} theme={theme}>
      <div style={{fontWeight:900,fontSize:17,marginBottom:14,textAlign:"center",color:t.text}}>
        ⚙️ Cài đặt Game
      </div>

      {/* Name */}
      <div style={{fontSize:11,color:t.text2,letterSpacing:1,marginBottom:5}}>TÊN GAME</div>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Tên game..." style={iS}/>

      {/* Background */}
      <div style={{fontSize:11,color:t.text2,letterSpacing:1,marginBottom:8}}>NỀN SÂN KHẤU</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {BG_COLORS.map((bg,i)=>(
          <button key={i} onClick={()=>setBgIdx(i)} style={{
            background:bg.sky,border:bgIdx===i?"3px solid #4F8EF7":"2px solid transparent",
            borderRadius:10,padding:"6px 10px",cursor:"pointer",fontSize:12,
            color:"#fff",fontWeight:700,fontFamily:"inherit",textShadow:"0 1px 3px rgba(0,0,0,0.8)",
          }}>{bg.label}</button>
        ))}
      </div>

      {/* Music */}
      <div style={{fontSize:11,color:t.text2,letterSpacing:1,marginBottom:8}}>NHẠC NỀN</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {MUSIC_TRACKS.map(tr=>(
          <button key={tr.id} onClick={()=>setMusic(tr.id)} style={{
            background:music===tr.id?"#4F8EF7":t.bg3,
            border:"1px solid "+(music===tr.id?"#4F8EF7":t.border),
            borderRadius:20,padding:"5px 10px",cursor:"pointer",
            fontSize:12,color:music===tr.id?"#fff":t.text2,
            fontWeight:700,fontFamily:"inherit",
          }}>{tr.label}</button>
        ))}
      </div>

      {/* Variables */}
      <div style={{fontSize:11,color:t.text2,letterSpacing:1,marginBottom:8}}>BIẾN NGƯỜI CHƠI</div>
      {variables.map((v,i)=>(
        <div key={v.id} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
          <div style={{flex:1,background:t.bg3,borderRadius:10,padding:"8px 12px",
            border:"1px solid "+t.border,display:"flex",justifyContent:"space-between"}}>
            <span style={{fontWeight:700,color:"#00C853"}}>📊 {v.name}</span>
            <span style={{color:t.text2,fontSize:12}}>= {v.defaultValue}</span>
          </div>
          <button onClick={()=>setVariables(p=>p.filter((_,j)=>j!==i))} style={{
            background:"transparent",border:"none",color:"#ff6b6b",fontSize:16,cursor:"pointer",
          }}>✕</button>
        </div>
      ))}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <input value={newVarName} onChange={e=>setNewVarName(e.target.value)}
          placeholder="Tên biến (vd: lives, speed...)"
          onKeyDown={e=>e.key==="Enter"&&addVar()}
          style={{...iS,marginBottom:0,flex:1}}/>
        <button onClick={addVar} disabled={!newVarName.trim()} style={{
          background:"#00C853",border:"none",borderRadius:10,padding:"0 14px",
          color:"#000",fontWeight:900,cursor:"pointer",fontFamily:"inherit",
        }}>+</button>
      </div>

      {/* Public toggle */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        background:t.bg3,borderRadius:12,padding:"12px 14px",marginBottom:12}}>
        <div>
          <div style={{fontWeight:700,fontSize:14,color:t.text}}>🌍 Public</div>
          <div style={{fontSize:11,color:t.text2}}>Cho phép mọi người chơi</div>
        </div>
        <button onClick={()=>setIsPublic(p=>!p)} style={{
          background:isPublic?"#00C853":"#3a3a6a",border:"none",
          borderRadius:99,width:48,height:26,cursor:"pointer",
          display:"flex",alignItems:"center",padding:2,
          transition:"background 0.2s",
        }}>
          <div style={{width:22,height:22,borderRadius:"50%",background:"#fff",
            marginLeft:isPublic?22:2,transition:"margin 0.2s"}}/>
        </button>
      </div>

      <button onClick={()=>onSave({
        name,bgColor:BG_COLORS[bgIdx].sky,groundColor:BG_COLORS[bgIdx].ground,
        groundBorder:BG_COLORS[bgIdx].groundBorder,bgMusic:music,is_public:isPublic,variables,
      })} style={{
        width:"100%",padding:"13px",
        background:"linear-gradient(135deg,#4F8EF7,#A259FF)",
        border:"none",borderRadius:12,color:"#fff",fontWeight:900,fontSize:15,
        cursor:"pointer",fontFamily:"inherit",
      }}>💾 Lưu cài đặt</button>
    </Modal>
  );
}

// ── ACTORS PANEL ─────────────────────────────
export function ActorsPanel({actors,setActors,activeActorId,setActiveActorId,theme}:{
  actors:SpriteActor[];setActors:React.Dispatch<React.SetStateAction<SpriteActor[]>>;
  activeActorId:number;setActiveActorId:(id:number)=>void;theme:Theme;
}) {
  const t=getThemeColors(theme);
  const colors=["#4F8EF7","#A259FF","#FFB829","#FF6B6B","#00E5FF","#00c853"];
  const addActor=()=>{
    const id=Date.now();
    setActors(p=>[...p,{id,emoji:"🐶",name:"NV "+(p.length+2),blocks:[],
      pos:{x:60,y:55},scale:1,rotation:0,hidden:false,
      color:colors[p.length%colors.length],autoRun:false}]);
    setActiveActorId(id);
  };
  return(
    <div style={{borderBottom:"1px solid "+t.border,padding:"8px 10px",flexShrink:0}}>
      <div style={{fontSize:9,color:t.text2,letterSpacing:1,marginBottom:5}}>NHÂN VẬT</div>
      <div style={{display:"flex",gap:5,overflowX:"auto"}}>
        <button onClick={()=>setActiveActorId(0)} style={{
          background:activeActorId===0?"#4F8EF722":"transparent",
          border:activeActorId===0?"2px solid #4F8EF7":"2px solid "+t.border,
          borderRadius:10,padding:"4px 8px",cursor:"pointer",flexShrink:0,
          display:"flex",flexDirection:"column",alignItems:"center",gap:1,
        }}>
          <span style={{fontSize:20}}>🎭</span>
          <span style={{fontSize:8,color:t.text2}}>Chính</span>
        </button>
        {actors.map(a=>(
          <div key={a.id} style={{position:"relative",flexShrink:0}}>
            <button onClick={()=>setActiveActorId(a.id)} style={{
              background:activeActorId===a.id?a.color+"22":"transparent",
              border:activeActorId===a.id?"2px solid "+a.color:"2px solid "+t.border,
              borderRadius:10,padding:"4px 8px",cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",gap:1,
            }}>
              <span style={{fontSize:20}}>{a.emoji}</span>
              <div style={{display:"flex",gap:2,alignItems:"center"}}>
                <s