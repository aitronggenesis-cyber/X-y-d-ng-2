import { useState } from "react";
import { playSound, PARTICLE_SETS, Block, Particle, SpriteActor, Theme, getT } from "./types";

// ── PARTICLES ──────────────────────────────
let pid = 1;
export function spawnParticles(type:string, x:number, y:number, set:React.Dispatch<React.SetStateAction<Particle[]>>) {
  const emojis = PARTICLE_SETS[type as keyof typeof PARTICLE_SETS]||PARTICLE_SETS.stars;
  const newP:Particle[] = Array.from({length:8}).map(()=>({
    id:pid++, x:x+(Math.random()-0.5)*20, y:y+(Math.random()-0.5)*10,
    vx:(Math.random()-0.5)*3, vy:-(Math.random()*3+1),
    life:1, emoji:emojis[Math.floor(Math.random()*emojis.length)], size:14+Math.random()*12,
  }));
  set(p=>[...p,...newP]);
  let f=0;
  const animate=()=>{
    f++;
    set(p=>p.map(x=>({...x,y:x.y+x.vy*0.8,x:x.x+x.vx*0.8,life:x.life-0.04})).filter(x=>x.life>0));
    if(f<30) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

// ── ENGINE ─────────────────────────────────
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
    await new Promise(r=>setTimeout(r,480));
    const val=b.value?Number(b.value)||b.value:10;
    switch(b.blockId){
      case "on_start":   push("🎮 Bắt đầu!"); break;
      case "on_tap":     push("👆 Chờ chạm..."); break;
      case "move_right": cb.setPos((p:any)=>({...p,x:Math.min(p.x+Number(val),78)})); push("▶ Đi phải"); break;
      case "move_left":  cb.setPos((p:any)=>({...p,x:Math.max(p.x-Number(val),5)}));  push("◀ Đi trái"); break;
      case "move_up":    cb.setPos((p:any)=>({...p,y:Math.max(p.y-14,10)})); push("⬆ Lên"); break;
      case "move_down":  cb.setPos((p:any)=>({...p,y:Math.min(p.y+14,80)})); push("⬇ Xuống"); break;
      case "jump":
        cb.setPos((p:any)=>({...p,y:p.y-24})); playSound("jump");
        spawnParticles("stars",cb.pos.x,cb.pos.y,cb.setParticles);
        await new Promise(r=>setTimeout(r,300));
        cb.setPos((p:any)=>({...p,y:p.y+24})); push("⬆ Nhảy!"); break;
      case "spin":     cb.setRotation((r:number)=>r+360); push("🔄 Xoay!"); break;
      case "teleport": cb.setPos({x:Math.random()*70+5,y:55}); push("🌀 Dịch!"); break;
      case "say":
        cb.setBubble(b.value||"Xin chào!"); push("💬 "+(b.value||"Xin chào!"));
        await new Promise(r=>setTimeout(r,1200)); cb.setBubble(null); break;
      case "grow":    cb.setScale((s:number)=>Math.min(s+0.3,2.2)); push("🔍 To"); break;
      case "shrink":  cb.setScale((s:number)=>Math.max(s-0.3,0.4)); push("🔎 Nhỏ"); break;
      case "hide":    cb.setHidden(true);  push("👻 Ẩn"); break;
      case "show":    cb.setHidden(false); push("👁️ Hiện"); break;
      case "flash":   cb.setFlash(true); await new Promise(r=>setTimeout(r,400)); cb.setFlash(false); push("✨ Flash!"); break;
      case "play_jump":  playSound("jump"); push("🔊 Jump!"); break;
      case "play_win":   playSound("win");  push("🏆 Win!"); break;
      case "play_pop":   playSound("pop");  push("💥 Pop!"); break;
      case "particle_stars":  spawnParticles("stars",cb.pos.x,cb.pos.y,cb.setParticles);  push("⭐"); break;
      case "particle_fire":   spawnParticles("fire",cb.pos.x,cb.pos.y,cb.setParticles);   push("🔥"); break;
      case "particle_hearts": spawnParticles("hearts",cb.pos.x,cb.pos.y,cb.setParticles); push("❤️"); break;
      case "particle_coins":  spawnParticles("coins",cb.pos.x,cb.pos.y,cb.setParticles); playSound("pop"); push("💰"); break;
      case "score_add":
        cb.setScore((s:number)=>s+1);
        spawnParticles("coins",cb.pos.x,cb.pos.y,cb.setParticles);
        playSound("pop"); push("⭐ +1!"); break;
      case "repeat": push("🔁 Lặp "+(b.value||3)); break;
      case "wait":   push("⏳ Chờ..."); await new Promise(r=>setTimeout(r,(Number(b.value)||1)*1000)); break;
      case "stop":   stopped=true; push("⏹ Dừng!"); break;
    }
  }
  if(!stopped){ playSound("win"); spawnParticles("stars",50,50,cb.setParticles); push("🏁 Xong!"); }
  cb.setRunning(false);
}

// ── STAGE ──────────────────────────────────
export interface StageProps {
  sprite:string; pos:{x:number;y:number}; scale:number;
  hidden:boolean; flash:boolean; rotation:number;
  bubble:string|null; score:number; running:boolean;
  particles:Particle[]; actors:SpriteActor[]; theme:Theme;
  bgColor?:string; groundColor?:string; groundBorder?:string;
  vars?:Record<string,number|string>;
}

export function Stage({sprite,pos,scale,hidden,flash,rotation,bubble,score,running,particles,actors,theme,bgColor,groundColor,groundBorder,vars}:StageProps) {
  const isDark=theme==="dark";
  return(
    <div style={{position:"relative",width:"100%",height:"100%",overflow:"hidden",
      background:bgColor||(isDark?"linear-gradient(180deg,#0a1628,#0d1e36 70%,#0a1010)":"linear-gradient(180deg,#87CEEB,#98D8C8 70%,#90EE90)")}}>
      {/* Stars */}
      {isDark&&!bgColor&&[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(i=>(
        <div key={i} style={{position:"absolute",width:i%3===0?3:2,height:i%3===0?3:2,background:"#fff",borderRadius:"50%",left:String((i*43+7)%94)+"%",top:String((i*31+8)%78)+"%",opacity:0.3}}/>
      ))}
      {/* Ground */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:34,
        background:groundColor||(isDark?"linear-gradient(180deg,#163016,#0a1a0a)":"linear-gradient(180deg,#228B22,#1a6b1a)"),
        borderTop:"2px solid "+(groundBorder||(isDark?"#2a5a2a":"#1a5a1a"))}}/>
      {/* Extra actors */}
      {actors.map(a=>a.hidden?null:(
        <div key={a.id} style={{position:"absolute",left:String(a.pos.x)+"%",bottom:String(100-a.pos.y)+"%",fontSize:28*a.scale,transform:"rotate("+String(a.rotation)+"deg)",transition:"all 0.3s ease",filter:running?"drop-shadow(0 0 6px "+a.color+")":"none",zIndex:5}}>{a.emoji}</div>
      ))}
      {/* Speech bubble */}
      {bubble&&(
        <div style={{position:"absolute",left:String(Math.min(pos.x+6,58))+"%",top:String(Math.max(pos.y-28,4))+"%",background:"#fff",color:"#000",padding:"5px 12px",borderRadius:12,fontSize:12,fontWeight:800,whiteSpace:"nowrap",zIndex:15,boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}>
          {bubble}
          <div style={{position:"absolute",bottom:-7,left:12,width:0,height:0,borderLeft:"7px solid transparent",borderRight:"7px solid transparent",borderTop:"7px solid #fff"}}/>
        </div>
      )}
      {/* Main sprite */}
      <div style={{position:"absolute",left:String(pos.x)+"%",bottom:String(100-pos.y)+"%",fontSize:36*scale,transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",transform:"rotate("+String(rotation)+"deg)",opacity:hidden?0:flash?0.2:1,filter:running?"drop-shadow(0 0 12px #4F8EF7) brightness(1.2)":"none",zIndex:10}}>{sprite}</div>
      {/* Particles */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:20}}>
        {particles.map(p=>(
          <div key={p.id} style={{position:"absolute",left:String(p.x)+"%",top:String(p.y)+"%",fontSize:p.size,opacity:p.life,transform:"translate(-50%,-50%)"}}>{p.emoji}</div>
        ))}
      </div>
      {/* Score */}
      <div style={{position:"absolute",top:8,left:10,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",borderRadius:20,padding:"3px 10px",fontSize:13,fontWeight:800,color:"#fff",zIndex:20,border:"1px solid rgba(255,255,255,0.15)"}}>{"⭐ "+score}</div>
      {/* Vars */}
      {vars&&Object.keys(vars).length>0&&(
        <div style={{position:"absolute",top:8,right:10,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",borderRadius:20,padding:"3px 10px",fontSize:10,color:"#aaf",zIndex:20,border:"1px solid rgba(255,255,255,0.1)"}}>
          {Object.entries(vars).slice(0,2).map(([k,v])=>k+":"+v).join(" | ")}
        </div>
      )}
    </div>
  );
}
