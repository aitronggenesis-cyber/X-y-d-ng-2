import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import {
  supabase, getT, iStyle, sBtn, fmtNum, getLevelFromXP, getXPProgress,
  LEVEL_NAMES, CATEGORIES, DEMO_GAMES, GAME_TEMPLATES, Avatar,
  Game, Theme, AVATAR_COLORS, SPRITE_EMOJIS,
} from "./types";
import {
  IconHome, IconGrid, IconCompass, IconBell, IconUser, IconSettings,
  IconPlay, IconPlus, IconSearch, IconX, IconHeart, IconMessage,
  IconTrash, IconStar, IconSun, IconMoon, IconChevronRight,
  IconTrophy, IconGamepad, GameThumb,
} from "./icons";
import { Modal, AuthScreen, CommentsSheet, NotifSheet, ProfileEditor, XPBar } from "./components";
import { Editor } from "./editor";
import { Player } from "./player";

// ── SIDEBAR ──────────────────────────────────
function Sidebar({active,onNav,theme,unread}:{active:string;onNav:(s:string)=>void;theme:Theme;unread:number}) {
  const t = getT(theme);
  const items = [
    {id:"home",    label:"Home",    Icon:IconHome},
    {id:"explore", label:"Explore", Icon:IconCompass},
    {id:"create",  label:"Create",  Icon:IconGrid},
    {id:"notifs",  label:"Alerts",  Icon:IconBell, badge:unread},
    {id:"profile", label:"Profile", Icon:IconUser},
  ];
  return(
    <div style={{
      position:"fixed", left:0, top:0, bottom:0, width:64,
      background:t.sidebar, borderRight:"1px solid "+t.border,
      display:"flex", flexDirection:"column", alignItems:"center",
      paddingTop:12, paddingBottom:16, zIndex:100,
      boxShadow:"2px 0 16px rgba(0,0,0,0.15)",
    }}>
      {/* Logo */}
      <div style={{marginBottom:24,padding:"8px 0"}}>
        <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <IconGamepad size={20} color="#fff"/>
        </div>
      </div>

      {/* Nav items */}
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:4,width:"100%",padding:"0 8px"}}>
        {items.map(({id,label,Icon,badge})=>{
          const isActive = active===id;
          return(
            <button key={id} onClick={()=>onNav(id)} style={{
              position:"relative",width:"100%",padding:"10px 0",border:"none",cursor:"pointer",
              background:isActive?"linear-gradient(135deg,#4F8EF722,#7C3AED22)":"transparent",
              borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",gap:3,
              color:isActive?"#4F8EF7":t.text2,transition:"all 0.15s",
              borderLeft:isActive?"2px solid #4F8EF7":"2px solid transparent",
            }}>
              <Icon size={18} color={isActive?"#4F8EF7":t.text2}/>
              <span style={{fontSize:9,fontWeight:isActive?700:400,letterSpacing:0.3}}>{label}</span>
              {badge&&badge>0?(
                <span style={{position:"absolute",top:6,right:6,background:"#EF4444",borderRadius:"50%",width:14,height:14,fontSize:8,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>{badge}</span>
              ):null}
            </button>
          );
        })}
      </div>

      {/* Bottom: theme toggle */}
      <button onClick={()=>{}} style={{background:"transparent",border:"none",cursor:"pointer",padding:8,color:t.text2}}>
        <IconSettings size={18} color={t.text2}/>
      </button>
    </div>
  );
}

// ── GAME CARD ─────────────────────────────────
function GameCard({game,onClick,onPlay,onComment,onDelete,theme}:{
  game:Game;onClick:()=>void;onPlay?:()=>void;onComment?:()=>void;onDelete?:(e:React.MouseEvent)=>void;theme:Theme;
}) {
  const t = getT(theme);
  return(
    <div onClick={onClick} style={{background:t.card,borderRadius:16,overflow:"hidden",cursor:"pointer",border:"1px solid "+t.border,boxShadow:"0 2px 12px rgba(0,0,0,0.12)",transition:"transform 0.15s, box-shadow 0.15s"}}>
      <GameThumb id={game.id} height={88}/>
      <div style={{padding:"10px 12px 12px"}}>
        <div style={{fontWeight:700,fontSize:13,color:t.text,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{game.name}</div>
        {game.username&&<div style={{fontSize:11,color:t.text2,marginBottom:6}}>@{game.username}</div>}
        <div style={{display:"flex",gap:10,marginBottom:game.plays!==undefined?6:0}}>
          {game.plays!==undefined&&(
            <span style={{display:"flex",alignItems:"center",gap:3,fontSize:11,color:t.text2}}>
              <IconPlay size={10} color={t.text2}/>{fmtNum(game.plays)}
            </span>
          )}
          {game.likes!==undefined&&(
            <span style={{display:"flex",alignItems:"center",gap:3,fontSize:11,color:t.text2}}>
              <IconHeart size={10} color={t.text2}/>{fmtNum(game.likes)}
            </span>
          )}
        </div>
        {(onPlay||onComment||onDelete)&&(
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {onPlay&&(
              <button onClick={e=>{e.stopPropagation();onPlay();}} style={{display:"flex",alignItems:"center",gap:4,background:"#00C85322",border:"1px solid #00C85344",borderRadius:8,padding:"4px 10px",fontSize:11,color:"#00C853",cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>
                <IconPlay size={10} color="#00C853"/>Play
              </button>
            )}
            {onComment&&(
              <button onClick={e=>{e.stopPropagation();onComment();}} style={{background:t.bg3,border:"1px solid "+t.border,borderRadius:8,padding:"4px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}>
                <IconMessage size={12} color={t.text2}/>
              </button>
            )}
            {onDelete&&(
              <button onClick={onDelete} style={{marginLeft:"auto",background:"transparent",border:"none",cursor:"pointer",padding:4}}>
                <IconTrash size={13} color={t.text2}/>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── XP BAR ────────────────────────────────────
export function XPBar({xp,theme}:{xp:number;theme:Theme}) {
  const t = getT(theme);
  const level = getLevelFromXP(xp);
  const prog  = getXPProgress(xp);
  const name  = LEVEL_NAMES[Math.min(level,LEVEL_NAMES.length-1)]||"Champion";
  return(
    <div style={{background:t.bg3,borderRadius:12,padding:"10px 14px",border:"1px solid "+t.border}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <IconTrophy size={14} color="#FFB829"/>
          <span style={{fontWeight:700,fontSize:12,color:t.text}}>{name} · Lv.{level}</span>
        </div>
        <span style={{fontSize:11,color:"#FFB829",fontWeight:600}}>{xp} XP</span>
      </div>
      <div style={{background:t.border,borderRadius:99,height:6,overflow:"hidden"}}>
        <div style={{background:"linear-gradient(90deg,#FFB829,#FF6B35)",height:"100%",width:String(prog)+"%",borderRadius:99,transition:"width 0.6s ease"}}/>
      </div>
    </div>
  );
}

// ── HOME SCREEN ───────────────────────────────
export default function App() {
  const [user,setUser]     = useState<User|null>(null);
  const [loading,setLoading] = useState(true);
  const [theme,setTheme]   = useState<Theme>("dark");
  const [screen,setScreen] = useState<"home"|"editor"|"play">("home");
  const [activeGame,setActiveGame] = useState<Game|null>(null);
  const [sideTab,setSideTab] = useState("home");
  const [myGames,setMyGames] = useState<Game[]>([]);
  const [publicGames,setPublicGames] = useState<Game[]>([]);
  const [userXP,setUserXP] = useState(0);
  const [showCreate,setShowCreate]   = useState(false);
  const [showTemplate,setShowTemplate] = useState(false);
  const [showProfile,setShowProfile] = useState(false);
  const [showEditProfile,setShowEditProfile] = useState(false);
  const [showNotifs,setShowNotifs]   = useState(false);
  const [showC,setShowC]   = useState(false);
  const [cGame,setCGame]   = useState<Game|null>(null);
  const [unread,setUnread] = useState(0);
  const [newName,setNewName] = useState("");
  const [selTemplate,setSelTemplate] = useState<typeof GAME_TEMPLATES[0]|null>(null);
  const [q,setQ]           = useState("");
  const [results,setResults] = useState<Game[]>([]);

  const t   = getT(theme);
  const iS  = iStyle(theme);

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

  const handleNav=(id:string)=>{
    if(id==="create") {setShowCreate(true);return;}
    if(id==="notifs") {setShowNotifs(true);setUnread(0);return;}
    if(id==="profile"){setShowProfile(true);return;}
    setSideTab(id);
  };

  const create=()=>{
    if(!newName.trim()||!user)return;
    const g:Game={id:"local_"+Date.now(),name:newName.trim(),thumb:"local_"+Date.now(),sprite:selTemplate?.sprite||"cat",blocks:selTemplate?.blocks?.map((b,i)=>({...b,id:i+1}))||[],variables:selTemplate?.variables||[],actors:[],user_id:user.id};
    setShowCreate(false);setNewName("");setSelTemplate(null);
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

  if(loading)return(
    <div style={{minHeight:"100vh",background:t.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:48,height:48,borderRadius:14,background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <IconGamepad size={28} color="#fff"/>
      </div>
    </div>
  );

  if(!user)return<AuthScreen onAuth={setUser} theme={theme}/>;
  if(screen==="editor"&&activeGame)return<Editor game={activeGame} user={user} onBack={()=>setScreen("home")} onSave={saveGame} theme={theme}/>;
  if(screen==="play"&&activeGame)return<Player game={activeGame} user={user} onBack={()=>setScreen("home")} theme={theme}/>;

  const uname=(user.user_metadata?.username as string)||user.email?.split("@")[0]||"User";
  const uidx  = Math.abs(uname.split("").reduce((a,c)=>a+c.charCodeAt(0),0))%AVATAR_COLORS.length;
  const ucolor = AVATAR_COLORS[uidx];

  return(
    <div style={{fontFamily:"'Nunito',system-ui,sans-serif",background:t.bg,color:t.text,minHeight:"100vh",maxWidth:480,margin:"0 auto",position:"relative"}}>

      {/* SIDEBAR */}
      <Sidebar active={sideTab} onNav={handleNav} theme={theme} unread={unread}/>

      {/* MAIN CONTENT — offset by sidebar width */}
      <div style={{marginLeft:64,minHeight:"100vh",paddingBottom:24}}>

        {/* TOP BAR */}
        <div style={{background:t.bg2,padding:"14px 16px",position:"sticky",top:0,zIndex:10,borderBottom:"1px solid "+t.border,boxShadow:"0 2px 16px rgba(0,0,0,0.12)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            {/* Title */}
            <div>
              <div style={{fontWeight:800,fontSize:18,color:t.text,letterSpacing:-0.5}}>
                {sideTab==="home"?"Home":sideTab==="explore"?"Explore":"My Games"}
              </div>
              <div style={{fontSize:11,color:t.text2}}>
                {sideTab==="home"?"Welcome back, "+uname:sideTab==="explore"?"Discover games":"Your creations"}
              </div>
            </div>
            {/* Right actions */}
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={()=>setTheme(th=>th==="dark"?"light":"dark")} style={{background:t.bg3,border:"1px solid "+t.border,borderRadius:10,padding:8,cursor:"pointer",display:"flex",alignItems:"center"}}>
                {theme==="dark"?<IconSun size={16} color={t.text2}/>:<IconMoon size={16} color={t.text2}/>}
              </button>
              <Avatar name={uname} color={ucolor} size={34}/>
            </div>
          </div>

          {/* Search bar */}
          <div style={{position:"relative"}}>
            <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}>
              <IconSearch size={15} color={t.text2}/>
            </div>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search games..."
              style={{...iS,marginBottom:0,paddingLeft:36,fontSize:13,borderRadius:12}}/>
            {q&&(
              <button onClick={()=>setQ("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center"}}>
                <IconX size={14} color={t.text2}/>
              </button>
            )}
          </div>

          {/* Search results */}
          {q&&(
            <div style={{position:"absolute",left:64,right:0,background:t.bg2,borderRadius:"0 0 16px 16px",border:"1px solid "+t.border,borderTop:"none",maxHeight:220,overflowY:"auto",zIndex:20,boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>
              {results.length===0
                ?<div style={{padding:"14px 16px",color:t.text2,fontSize:12}}>No results found</div>
                :results.map(g=>(
                  <div key={g.id} onClick={()=>{setActiveGame(g);setScreen("play");setQ("");}} style={{display:"flex",gap:12,padding:"10px 16px",cursor:"pointer",borderBottom:"1px solid "+t.border,alignItems:"center",transition:"background 0.1s"}}>
                    <div style={{width:36,height:36,borderRadius:8,overflow:"hidden",flexShrink:0}}><GameThumb id={g.id} height={36} size={18}/></div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13,color:t.text}}>{g.name}</div>
                      <div style={{fontSize:10,color:t.text2,display:"flex",alignItems:"center",gap:4}}><IconPlay size={9} color={t.text2}/>{fmtNum(g.plays||0)}</div>
                    </div>
                    <IconChevronRight size={14} color={t.text2}/>
                  </div>
                ))
              }
            </div>
          )}

          {/* Tab switcher — only on home */}
          {!q&&sideTab==="home"&&(
            <div style={{display:"flex",gap:4,background:t.bg3,borderRadius:12,padding:3,marginTop:10,border:"1px solid "+t.border}}>
              {([{key:"mine",label:"My Games"},{key:"explore",label:"Explore"}]).map(tb=>(
                <button key={tb.key} onClick={()=>setSideTab(tb.key)} style={{flex:1,padding:"7px 0",borderRadius:10,border:"none",background:sideTab===tb.key?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"transparent",color:sideTab===tb.key?"#fff":t.text2,fontWeight:sideTab===tb.key?700:400,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",boxShadow:sideTab===tb.key?"0 2px 10px #4F8EF755":"none"}}>{tb.label}</button>
              ))}
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div style={{padding:"16px 14px"}}>

          {/* XP bar on home */}
          {(sideTab==="home"||sideTab==="mine")&&(
            <div style={{marginBottom:16}}><XPBar xp={userXP} theme={theme}/></div>
          )}

          {/* MY GAMES */}
          {(sideTab==="home"||sideTab==="mine")&&!q&&(
            <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <span style={{fontWeight:700,fontSize:14,color:t.text}}>My Games</span>
                <span style={{fontSize:12,color:t.text2}}>{myGames.length} games</span>
              </div>
              {myGames.length===0?(
                <div style={{background:t.card,borderRadius:16,padding:28,textAlign:"center",border:"2px dashed "+t.border,marginBottom:20}}>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><IconGrid size={32} color={t.text2}/></div>
                  <div style={{fontWeight:600,color:t.text2,fontSize:14}}>No games yet</div>
                  <div style={{fontSize:12,color:t.text2,marginTop:4}}>Click + in the sidebar to create</div>
                </div>
              ):(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
                  {myGames.map(g=>(
                    <GameCard key={g.id} game={g} theme={theme}
                      onClick={()=>{setActiveGame(g);setScreen("editor");}}
                      onPlay={()=>{setActiveGame({...g,username:uname});setScreen("play");}}
                      onComment={()=>{setCGame(g);setShowC(true);}}
                      onDelete={e=>del(g.id,e)}/>
                  ))}
                </div>
              )}

              {/* Trending section */}
              <div style={{marginBottom:8}}>
                <div style={{fontWeight:700,fontSize:14,color:t.text,marginBottom:12}}>Trending Now</div>
                <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:6}}>
                  {DEMO_GAMES.map(g=>(
                    <div key={g.id} onClick={()=>{setActiveGame(g);setScreen("play");}} style={{background:t.card,borderRadius:14,overflow:"hidden",flexShrink:0,width:136,border:"1px solid "+t.border,cursor:"pointer",boxShadow:"0 2px 10px rgba(0,0,0,0.1)"}}>
                      <GameThumb id={g.id} height={76} size={32}/>
                      <div style={{padding:"8px 10px 10px"}}>
                        <div style={{fontWeight:700,fontSize:12,color:t.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{g.name}</div>
                        <div style={{fontSize:10,color:t.text2,marginTop:2}}>@{g.username}</div>
                        <div style={{display:"flex",gap:8,marginTop:5}}>
                          <span style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:t.text2}}><IconPlay size={9} color={t.text2}/>{fmtNum(g.plays||0)}</span>
                          <span style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:t.text2}}><IconHeart size={9} color={t.text2}/>{fmtNum(g.likes||0)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div style={{marginTop:20}}>
                <div style={{fontWeight:700,fontSize:14,color:t.text,marginBottom:12}}>Categories</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {[{label:"Action",color:"#EF4444"},{label:"Puzzle",color:"#A259FF"},{label:"Adventure",color:"#4F8EF7"},{label:"RPG",color:"#FFB829"},{label:"Racing",color:"#00E676"},{label:"Shooter",color:"#FF6B6B"}].map(c=>(
                    <div key={c.label} style={{background:t.card,borderRadius:12,padding:"14px 10px",textAlign:"center",cursor:"pointer",border:"1px solid "+c.color+"33",transition:"transform 0.15s"}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:c.color,margin:"0 auto 6px"}}/>
                      <div style={{fontSize:11,fontWeight:600,color:t.text}}>{c.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* EXPLORE */}
          {sideTab==="explore"&&!q&&(
            <>
              <div style={{fontWeight:700,fontSize:14,color:t.text,marginBottom:12}}>Community Games</div>
              {publicGames.length===0?(
                <div style={{textAlign:"center",color:t.text2,padding:48}}>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><IconCompass size={36} color={t.text2}/></div>
                  <div style={{fontSize:14}}>No public games yet</div>
                </div>
              ):(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {publicGames.map(g=>(
                    <GameCard key={g.id} game={g} theme={theme} onClick={()=>{setActiveGame(g);setScreen("play");}}/>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* FAB */}
      <button onClick={()=>setShowCreate(true)} style={{position:"fixed",bottom:24,right:20,width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",border:"none",cursor:"pointer",boxShadow:"0 4px 20px rgba(79,142,247,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,transition:"transform 0.15s"}}>
        <IconPlus size={22} color="#fff"/>
      </button>

      {/* CREATE MODAL */}
      {showCreate&&(
        <Modal onClose={()=>setShowCreate(false)} theme={theme}>
          <div style={{fontWeight:800,fontSize:17,marginBottom:14,color:t.text}}>New Game</div>

          {/* Template */}
          <div style={{fontSize:11,color:t.text2,letterSpacing:0.5,marginBottom:6,textTransform:"uppercase"}}>Template</div>
          <button onClick={()=>setShowTemplate(true)} style={{width:"100%",background:t.bg3,border:"1.5px solid "+(selTemplate?"#4F8EF7":t.border),borderRadius:12,padding:"11px 14px",marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",gap:10,fontFamily:"inherit",transition:"all 0.2s"}}>
            <div style={{width:36,height:36,borderRadius:8,overflow:"hidden",flexShrink:0}}>
              <GameThumb id={selTemplate?.id||"blank"} height={36} size={18}/>
            </div>
            <div style={{flex:1,textAlign:"left"}}>
              <div style={{fontWeight:600,fontSize:13,color:t.text}}>{selTemplate?.name||"Choose a template"}</div>
              {selTemplate&&<div style={{fontSize:11,color:t.text2}}>{selTemplate.blocks.length+" blocks · "+selTemplate.variables.length+" variables"}</div>}
            </div>
            <IconChevronRight size={16} color={t.text2}/>
          </button>

          {/* Name */}
          <div style={{fontSize:11,color:t.text2,letterSpacing:0.5,marginBottom:6,textTransform:"uppercase"}}>Game Name</div>
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Enter game name..." onKeyDown={e=>e.key==="Enter"&&create()} style={iS}/>

          <button onClick={create} disabled={!newName.trim()} style={{width:"100%",padding:"13px",background:newName.trim()?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"#2a2a4a",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:15,cursor:newName.trim()?"pointer":"not-allowed",fontFamily:"inherit",boxShadow:newName.trim()?"0 4px 18px #4F8EF755":"none",transition:"all 0.2s"}}>
            Create &amp; Open Editor
          </button>
        </Modal>
      )}

      {/* TEMPLATE PICKER */}
      {showTemplate&&(
        <Modal onClose={()=>setShowTemplate(false)} theme={theme}>
          <div style={{fontWeight:800,fontSize:17,marginBottom:14,color:t.text}}>Choose Template</div>
          {GAME_TEMPLATES.map(tmp=>(
            <div key={tmp.id} onClick={()=>{setSelTemplate(tmp);setShowTemplate(false);}} style={{background:t.bg3,borderRadius:14,padding:"12px 14px",marginBottom:10,cursor:"pointer",border:"1px solid "+t.border,display:"flex",gap:12,alignItems:"center",transition:"all 0.15s"}}>
              <div style={{width:44,height:44,borderRadius:10,overflow:"hidden",flexShrink:0}}><GameThumb id={tmp.id} height={44} size={22}/></div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:t.text}}>{tmp.name}</div>
                <div style={{fontSize:12,color:t.text2,marginTop:2}}>{tmp.desc}</div>
                <div style={{display:"flex",gap:10,marginTop:5}}>
                  <span style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:"#4F8EF7",fontWeight:600}}><IconCode size={10} color="#4F8EF7"/>{tmp.blocks.length} blocks</span>
                  <span style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:"#00C853",fontWeight:600}}><IconStar size={10} color="#00C853"/>{tmp.variables.length} vars</span>
                </div>
              </div>
              <IconChevronRight size={16} color={t.text2}/>
            </div>
          ))}
        </Modal>
      )}

      {/* PROFILE MODAL */}
      {showProfile&&(
        <Modal onClose={()=>setShowProfile(false)} theme={theme}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
            <Avatar name={uname} color={ucolor} size={56}/>
            <div>
              <div style={{fontWeight:800,fontSize:18,color:t.text}}>{uname}</div>
              <div style={{fontSize:12,color:t.text2}}>{user.email}</div>
            </div>
          </div>
          <div style={{marginBottom:14}}><XPBar xp={userXP} theme={theme}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {[{label:"Games",value:myGames.length,color:"#4F8EF7"},{label:"Blocks",value:myGames.reduce((a,g)=>a+(g.blocks?.length||0),0),color:"#A259FF"}].map(s=>(
              <div key={s.label} style={{background:t.bg3,borderRadius:12,padding:"12px",border:"1px solid "+t.border,textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.value}</div>
                <div style={{fontSize:11,color:t.text2}}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>{setShowProfile(false);setShowEditProfile(true);}} style={{width:"100%",padding:"11px",background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",border:"none",borderRadius:12,color:"#fff",fontSize:14,cursor:"pointer",fontWeight:700,fontFamily:"inherit",marginBottom:8}}>Edit Profile</button>
          <button onClick={logout} style={{width:"100%",padding:"11px",background:t.bg3,border:"1px solid #EF444433",borderRadius:12,color:"#EF4444",fontSize:14,cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>Sign Out</button>
        </Modal>
      )}

      {showEditProfile&&user&&<ProfileEditor user={user} onClose={()=>setShowEditProfile(false)} theme={theme}/>}
      {showNotifs&&user&&<NotifSheet user={user} onClose={()=>setShowNotifs(false)} theme={theme}/>}
      {showC&&cGame&&user&&<CommentsSheet game={cGame} user={user} onClose={()=>setShowC(false)} theme={theme}/>}

      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:#4F8EF744;border-radius:99px;}
      `}</style>
    </div>
  );
}
