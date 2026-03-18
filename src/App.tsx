import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, getT, iStyle, sBtn, fmtNum, getLevelFromXP, LEVEL_TITLES, THUMBNAILS, SPRITES, DEMO_GAMES, GAME_TEMPLATES, Game, Theme } from "./types";
import { Modal, AuthScreen, CommentsSheet, NotifSheet, ProfileEditor, XPBar, GameCard } from "./components";
import { Editor } from "./editor";
import { Player } from "./player";

export default function App() {
  const [user,setUser]     = useState<User|null>(null);
  const [loading,setLoading] = useState(true);
  const [theme,setTheme]   = useState<Theme>("dark");
  const [screen,setScreen] = useState<"home"|"editor"|"play">("home");
  const [activeGame,setActiveGame] = useState<Game|null>(null);
  const [myGames,setMyGames] = useState<Game[]>([]);
  const [publicGames,setPublicGames] = useState<Game[]>([]);
  const [userXP,setUserXP] = useState(0);
  const [homeTab,setHomeTab] = useState<"mine"|"explore">("mine");
  const [showCreate,setShowCreate]     = useState(false);
  const [showTemplate,setShowTemplate] = useState(false);
  const [showProfile,setShowProfile]   = useState(false);
  const [showEditProfile,setShowEditProfile] = useState(false);
  const [showNotifs,setShowNotifs]     = useState(false);
  const [showC,setShowC]   = useState(false);
  const [cGame,setCGame]   = useState<Game|null>(null);
  const [unread,setUnread] = useState(0);
  const [newName,setNewName] = useState("");
  const [newThumb,setNewThumb] = useState("🌋");
  const [selTemplate,setSelTemplate] = useState<typeof GAME_TEMPLATES[0]|null>(null);
  const [q,setQ]           = useState("");
  const [results,setResults] = useState<Game[]>([]);

  const t    = getT(theme);
  const iS   = iStyle(theme);
  const sB   = sBtn(theme);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setUser(session?.user??null);setLoading(false);});
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>setUser(s?.user??null));
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!user)return;
    supabase.from("games").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).then(({data})=>{if(data)setMyGames(data as Game[]);});
    supabase.from("notifications").select("id").eq("user_id",user.id).eq("is_read",false).then(({data})=>{if(data)setUnread(data.length);});
    supabase.from("user_stats").select("xp").eq("id",user.id).single().then(({data})=>{if(data)setUserXP((data as any).xp||0);});
  },[user]);

  useEffect(()=>{
    supabase.from("games").select("*").eq("is_public",true).order("plays",{ascending:false}).limit(20).then(({data})=>{if(data)setPublicGames(data as Game[]);});
  },[]);

  useEffect(()=>{
    if(!q.trim()){setResults([]);return;}
    const timer=setTimeout(async()=>{const{data}=await supabase.from("games").select("*").eq("is_public",true).ilike("name","%"+q+"%").limit(8);if(data)setResults(data as Game[]);},400);
    return()=>clearTimeout(timer);
  },[q]);

  const create=()=>{
    if(!newName.trim()||!user)return;
    const g:Game={id:"local_"+Date.now(),name:newName.trim(),thumb:newThumb,sprite:selTemplate?.sprite||"🐱",blocks:selTemplate?.blocks?.map((b,i)=>({...b,id:i+1}))||[],variables:selTemplate?.variables||[],actors:[],user_id:user.id};
    setShowCreate(false);setNewName("");setNewThumb("🌋");setSelTemplate(null);
    setActiveGame(g);setScreen("editor");
  };

  const saveGame=(updated:Game)=>{
    setMyGames(prev=>{const ex=prev.find(p=>p.id===updated.id);return ex?prev.map(p=>p.id===updated.id?updated:p):[updated,...prev];});
    setActiveGame(updated);
  };

  const del=async(id:string,e:React.MouseEvent)=>{
    e.stopPropagation();
    if(!id.startsWith("local"))await supabase.from("games").delete().eq("id",id);
    setMyGames(p=>p.filter(x=>x.id!==id));
  };

  const logout=async()=>{await supabase.auth.signOut();setShowProfile(false);setMyGames([]);};

  if(loading)return<div style={{minHeight:"100vh",background:t.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,filter:"drop-shadow(0 4px 16px #4F8EF766)"}}>🎮</div>;
  if(!user)return<AuthScreen onAuth={setUser} theme={theme}/>;
  if(screen==="editor"&&activeGame)return<Editor game={activeGame} user={user} onBack={()=>setScreen("home")} onSave={saveGame} theme={theme}/>;
  if(screen==="play"&&activeGame)return<Player game={activeGame} user={user} onBack={()=>setScreen("home")} theme={theme}/>;

  const uname=(user.user_metadata?.username as string)||user.email?.split("@")[0]||"Bạn";
  const uavatar=(user.user_metadata?.avatar as string)||"😎";
  const level=getLevelFromXP(userXP);
  const levelTitle=LEVEL_TITLES[Math.min(level,LEVEL_TITLES.length-1)]||"👑";

  return(
    <div style={{fontFamily:"'Nunito',sans-serif",background:t.bg,color:t.text,minHeight:"100vh",maxWidth:480,margin:"0 auto",paddingBottom:90}}>

      {/* TOP BAR */}
      <div style={{background:t.bg2,padding:"12px 16px 10px",position:"sticky",top:0,zIndex:10,borderBottom:"1px solid "+t.border,boxShadow:"0 2px 20px rgba(0,0,0,0.15)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:26,filter:"drop-shadow(0 2px 8px #4F8EF766)"}}>🎮</span>
            <div>
              <div style={{fontWeight:900,fontSize:20,background:"linear-gradient(90deg,#4F8EF7,#A259FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-0.5}}>GameBuilder</div>
              <div style={{fontSize:9,color:"#FFB829",fontWeight:700,letterSpacing:0.5}}>{levelTitle} Lv.{level}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={()=>setTheme(th=>th==="dark"?"light":"dark")} style={{...sB,fontSize:15,padding:"5px 8px"}}>{theme==="dark"?"☀️":"🌙"}</button>
            <button onClick={()=>{setShowNotifs(true);setUnread(0);}} style={{...sB,position:"relative",fontSize:16,padding:"5px 8px"}}>
              🔔{unread>0&&<span style={{position:"absolute",top:-3,right:-3,background:"linear-gradient(135deg,#EF4444,#FF6B6B)",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:"0 2px 8px #EF444488"}}>{unread}</span>}
            </button>
            {/* Avatar button */}
            <button onClick={()=>setShowProfile(true)} style={{background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",border:"2px solid rgba(255,255,255,0.2)",borderRadius:"50%",width:38,height:38,fontSize:20,cursor:"pointer",fontWeight:900,color:"#fff",fontFamily:"inherit",boxShadow:"0 3px 16px #4F8EF766",transition:"transform 0.15s"}}>{uavatar}</button>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{marginBottom:10}}><XPBar xp={userXP} theme={theme}/></div>

        {/* Search */}
        <div style={{position:"relative",marginBottom:8}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Tìm game..." style={{...iS,marginBottom:0,fontSize:13,paddingLeft:14}}/>
          {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:t.text2,fontSize:18,cursor:"pointer"}}>✕</button>}
        </div>
        {q&&(
          <div style={{background:t.bg2,borderRadius:16,border:"1px solid "+t.border,maxHeight:200,overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>
            {results.length===0?<div style={{padding:14,color:t.text2,fontSize:12,textAlign:"center"}}>Không tìm thấy</div>
              :results.map(g=>(
                <div key={g.id} onClick={()=>{setActiveGame(g);setScreen("play");setQ("");}} style={{display:"flex",gap:12,padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid "+t.border,alignItems:"center"}}>
                  <span style={{fontSize:26}}>{g.thumb}</span>
                  <div style={{flex:1}}><div style={{fontWeight:800,fontSize:13,color:t.text}}>{g.name}</div><div style={{fontSize:10,color:t.text2}}>{"▶ "+fmtNum(g.plays||0)}</div></div>
                </div>
              ))
            }
          </div>
        )}

        {!q&&(
          <div style={{display:"flex",gap:4,background:t.bg3,borderRadius:16,padding:4,border:"1px solid "+t.border}}>
            {([{key:"mine" as const,label:"🎒 Của tôi"},{key:"explore" as const,label:"🌍 Khám phá"}]).map(tb=>(
              <button key={tb.key} onClick={()=>setHomeTab(tb.key)} style={{flex:1,padding:"8px 0",borderRadius:13,border:"none",background:homeTab===tb.key?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"transparent",color:homeTab===tb.key?"#fff":t.text2,fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",boxShadow:homeTab===tb.key?"0 2px 12px #4F8EF755":"none"}}>{tb.label}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{padding:"0 14px"}}>
        {homeTab==="mine"&&!q&&(
          <div style={{marginTop:14}}>
            {myGames.length===0?(
              <div style={{background:t.card,borderRadius:20,padding:"28px",textAlign:"center",border:"2px dashed "+t.border,marginTop:6}}>
                <div style={{fontSize:40,marginBottom:8}}>🕹️</div>
                <div style={{fontWeight:700,color:t.text2,fontSize:15}}>Chưa có game nào</div>
                <div style={{fontSize:12,color:t.text2,marginTop:4}}>Nhấn + để tạo game đầu tiên</div>
              </div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {myGames.map(g=>(
                  <GameCard key={g.id} game={g} theme={theme}
                    onClick={()=>{setActiveGame(g);setScreen("editor");}}
                    onPlay={()=>{setActiveGame({...g,username:uname});setScreen("play");}}
                    onComment={()=>{setCGame(g);setShowC(true);}}
                    onDelete={e=>del(g.id,e)} showDelete={true}/>
                ))}
              </div>
            )}

            {/* Trending */}
            <div style={{marginTop:22}}>
              <div style={{fontWeight:900,fontSize:16,marginBottom:12,color:t.text,display:"flex",alignItems:"center",gap:6}}>🔥 <span>Thịnh hành</span></div>
              <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:6}}>
                {DEMO_GAMES.map(g=>(
                  <div key={g.id} onClick={()=>{setActiveGame(g);setScreen("play");}} style={{background:t.card,borderRadius:16,overflow:"hidden",flexShrink:0,width:130,border:"1px solid "+t.border,cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,0.15)",transition:"transform 0.15s"}}>
                    <div style={{background:"linear-gradient(135deg,#1e1e4a,#0d0d2a)",height:78,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38}}>{g.thumb}</div>
                    <div style={{padding:"7px 9px 9px"}}>
                      <div style={{fontWeight:800,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:t.text}}>{g.name}</div>
                      <div style={{fontSize:10,color:t.text2,marginTop:2}}>{g.username}</div>
                      <div style={{display:"flex",gap:6,marginTop:4}}>
                        <span style={{fontSize:9,color:"#4F8EF7",fontWeight:700}}>{"▶ "+fmtNum(g.plays||0)}</span>
                        <span style={{fontSize:9,color:"#EF4444",fontWeight:700}}>{"❤️ "+fmtNum(g.likes||0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div style={{marginTop:22,marginBottom:12}}>
              <div style={{fontWeight:900,fontSize:16,marginBottom:12,color:t.text}}>🗂️ Thể loại</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[{i:"🏃",l:"Action",c:"#EF4444",g:"linear-gradient(135deg,#EF4444,#FF6B6B)"},{i:"🧩",l:"Puzzle",c:"#A259FF",g:"linear-gradient(135deg,#7C3AED,#A259FF)"},{i:"🌍",l:"Adventure",c:"#4F8EF7",g:"linear-gradient(135deg,#2563EB,#4F8EF7)"},{i:"⚔️",l:"RPG",c:"#FFB829",g:"linear-gradient(135deg,#D97706,#FFB829)"},{i:"🏎️",l:"Racing",c:"#00E676",g:"linear-gradient(135deg,#059669,#00E676)"},{i:"🔫",l:"Shooter",c:"#FF4444",g:"linear-gradient(135deg,#DC2626,#FF4444)"}].map(x=>(
                  <div key={x.l} style={{background:t.card,borderRadius:14,padding:"12px 8px",textAlign:"center",cursor:"pointer",border:"1px solid "+x.c+"33",boxShadow:"0 2px 12px "+x.c+"22",transition:"transform 0.15s"}}>
                    <div style={{fontSize:24,marginBottom:4}}>{x.i}</div>
                    <div style={{fontSize:11,fontWeight:800,color:x.c}}>{x.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {homeTab==="explore"&&!q&&(
          <div style={{marginTop:14}}>
            <div style={{fontWeight:900,fontSize:16,marginBottom:12,color:t.text}}>🌍 Game cộng đồng</div>
            {publicGames.length===0?(
              <div style={{textAlign:"center",color:t.text2,padding:50}}><div style={{fontSize:40}}>🌍</div><div style={{marginTop:10,fontSize:14}}>Chưa có game public</div></div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {publicGames.map(g=>(
                  <GameCard key={g.id} game={g} theme={theme}
                    onClick={()=>{setActiveGame(g);setScreen("play");}}/>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={()=>setShowCreate(true)} style={{position:"fixed",bottom:28,right:22,width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",border:"2px solid rgba(255,255,255,0.2)",fontSize:28,cursor:"pointer",boxShadow:"0 6px 28px rgba(79,142,247,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,color:"#fff",fontFamily:"inherit",transition:"transform 0.15s"}}>+</button>

      {/* CREATE MODAL */}
      {showCreate&&(
        <Modal onClose={()=>setShowCreate(false)} theme={theme}>
          <div style={{fontWeight:900,fontSize:17,marginBottom:14,textAlign:"center",color:t.text}}>🎮 Tạo game mới</div>
          {/* Template */}
          <div style={{fontSize:10,color:t.text2,letterSpacing:1,marginBottom:6}}>TEMPLATE</div>
          <button onClick={()=>setShowTemplate(true)} style={{width:"100%",background:t.bg3,border:"1.5px solid "+(selTemplate?"#4F8EF7":t.border),borderRadius:14,padding:"10px 14px",marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",gap:10,fontFamily:"inherit",transition:"all 0.2s"}}>
            <span style={{fontSize:26}}>{selTemplate?.thumb||"📋"}</span>
            <div style={{flex:1,textAlign:"left"}}>
              <div style={{fontWeight:700,fontSize:13,color:t.text}}>{selTemplate?.name||"Chọn template..."}</div>
              {selTemplate&&<div style={{fontSize:11,color:t.text2}}>{selTemplate.blocks.length+" blocks · "+selTemplate.variables.length+" biến"}</div>}
            </div>
            <span style={{color:t.text2,fontSize:18}}>›</span>
          </button>
          {/* Thumbnail */}
          <div style={{fontSize:10,color:t.text2,letterSpacing:1,marginBottom:6}}>THUMBNAIL</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            {THUMBNAILS.map(tb=>(
              <button key={tb} onClick={()=>setNewThumb(tb)} style={{background:newThumb===tb?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"transparent",border:newThumb===tb?"2px solid #4F8EF7":"2px solid "+t.border,borderRadius:10,padding:"5px 7px",fontSize:20,cursor:"pointer",transition:"all 0.15s",transform:newThumb===tb?"scale(1.15)":"scale(1)"}}>{tb}</button>
            ))}
          </div>
          <div style={{background:"linear-gradient(135deg,#1e1e4a,#0d0d2a)",borderRadius:16,height:72,display:"flex",alignItems:"center",justifyContent:"center",fontSize:46,marginBottom:12,boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>{newThumb}</div>
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Tên game..." onKeyDown={e=>e.key==="Enter"&&create()} style={iS}/>
          <button onClick={create} disabled={!newName.trim()} style={{width:"100%",padding:"14px",background:newName.trim()?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"#2a2a4a",border:"none",borderRadius:14,color:"#fff",fontWeight:900,fontSize:15,cursor:newName.trim()?"pointer":"not-allowed",fontFamily:"inherit",boxShadow:newName.trim()?"0 4px 20px #4F8EF755":"none",transition:"all 0.2s"}}>🚀 Tạo &amp; Mở Editor</button>
        </Modal>
      )}

      {/* TEMPLATE PICKER */}
      {showTemplate&&(
        <Modal onClose={()=>setShowTemplate(false)} theme={theme}>
          <div style={{fontWeight:900,fontSize:17,marginBottom:14,textAlign:"center",color:t.text}}>📋 Chọn Template</div>
          {GAME_TEMPLATES.map(tmp=>(
            <div key={tmp.id} onClick={()=>{setSelTemplate(tmp);setShowTemplate(false);}} style={{background:t.bg3,borderRadius:16,padding:"12px 14px",marginBottom:10,cursor:"pointer",border:"1px solid "+t.border,display:"flex",gap:12,alignItems:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.1)",transition:"all 0.15s"}}>
              <span style={{fontSize:34}}>{tmp.thumb}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:14,color:t.text}}>{tmp.name}</div>
                <div style={{fontSize:12,color:t.text2,marginTop:2}}>{tmp.desc}</div>
                <div style={{display:"flex",gap:8,marginTop:4}}>
                  <span style={{fontSize:10,color:"#4F8EF7",fontWeight:700}}>{tmp.blocks.length} blocks</span>
                  <span style={{fontSize:10,color:"#00C853",fontWeight:700}}>{tmp.variables.length} biến</span>
                </div>
              </div>
              <span style={{fontSize:20,color:t.text2}}>→</span>
            </div>
          ))}
        </Modal>
      )}

      {/* PROFILE MODAL */}
      {showProfile&&(
        <Modal onClose={()=>setShowProfile(false)} theme={theme}>
          <div style={{textAlign:"center",paddingBottom:8}}>
            <div style={{fontSize:60,marginBottom:8,filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.3))"}}>{uavatar}</div>
            <div style={{fontWeight:900,fontSize:20,color:t.text}}>{uname}</div>
            <div style={{fontSize:12,color:t.text2,marginBottom:14}}>{user.email}</div>
            <div style={{marginBottom:14}}><XPBar xp={userXP} theme={theme}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[{label:"Game",value:myGames.length,color:"#4F8EF7",icon:"🎮"},{label:"Blocks",value:myGames.reduce((a,g)=>a+(g.blocks?.length||0),0),color:"#A259FF",icon:"🧩"}].map(s=>(
                <div key={s.label} style={{background:t.bg3,borderRadius:14,padding:"12px 8px",border:"1px solid "+t.border}}>
                  <div style={{fontSize:12,marginBottom:3}}>{s.icon}</div>
                  <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:11,color:t.text2}}>{s.label}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>{setShowProfile(false);setShowEditProfile(true);}} style={{width:"100%",padding:"11px",background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",border:"none",borderRadius:14,color:"#fff",fontSize:14,cursor:"pointer",fontWeight:700,fontFamily:"inherit",marginBottom:8,boxShadow:"0 3px 16px #4F8EF755"}}>✏️ Chỉnh Profile</button>
            <button onClick={logout} style={{width:"100%",padding:"11px",background:t.bg3,border:"1px solid #EF444444",borderRadius:14,color:"#EF4444",fontSize:14,cursor:"pointer",fontWeight:700,fo