"use client";
import { useState, useRef, useEffect } from "react";

const TypingIndicator = () => (
  <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "12px 16px" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 8, height: 8, borderRadius: "50%", background: "#00ff88",
        animation: "pulse 1.2s ease-in-out infinite",
        animationDelay: `${i * 0.2}s`
      }} />
    ))}
  </div>
);

const Message = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 16,
      animation: "slideIn 0.3s ease-out"
    }}>
      {!isUser && (
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #00ff88, #00b4d8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, marginRight: 10, flexShrink: 0, marginTop: 4,
          boxShadow: "0 0 12px rgba(0,255,136,0.4)"
        }}>⚡</div>
      )}
      <div style={{
        maxWidth: "75%",
        background: isUser
          ? "linear-gradient(135deg, #0077ff, #00b4d8)"
          : "rgba(255,255,255,0.05)",
        border: isUser ? "none" : "1px solid rgba(0,255,136,0.15)",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        padding: "12px 16px",
        color: "#e8f4f8",
        fontSize: 14,
        lineHeight: 1.7,
        whiteSpace: "pre-wrap",
        backdropFilter: "blur(10px)"
      }}>
        {msg.content}
      </div>
      {isUser && (
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #0077ff, #6600ff)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, marginLeft: 10, flexShrink: 0, marginTop: 4,
          fontWeight: 700, color: "#fff"
        }}>M</div>
      )}
    </div>
  );
};

export default function ARIAAgent() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello Modified! I'm ARIA — your AI Research Intelligence Agent. 🤖\n\nI'm ready to:\n• 📰 Deliver your daily AI briefing\n• 🔍 Scan & summarize forum content from Moltbook\n• 💡 Answer questions about the AI space\n\nTry asking: \"Give me today's AI summary\" or paste any Moltbook forum content for me to analyze!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [forumMode, setForumMode] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (customMessage) => {
    const userText = customMessage || input.trim();
    if (!userText || loading) return;

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages
            .filter(m => m.role !== "assistant" || newMessages.indexOf(m) > 0)
            .map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.text || data.error || "Something went wrong, try again!"
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "📰 Daily AI Briefing", msg: "Give me today's daily AI summary — breaking news, new releases, research, and anything interesting in the AI space." },
    { label: "🔥 Breaking AI News", msg: "What is the most breaking, urgent AI news happening right now today?" },
    { label: "🚀 New Model Releases", msg: "What new AI models have been released or announced recently?" },
    { label: "📋 Paste Forum Content", action: () => setForumMode(true) }
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020b18 0%, #041428 50%, #020b18 100%)",
      fontFamily: "'Courier New', monospace",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{`
        @keyframes pulse { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes slideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(0,255,136,0.3)} 50%{box-shadow:0 0 40px rgba(0,255,136,0.6)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        textarea:focus { outline:none; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(0,255,136,0.3); border-radius:2px; }
        .quick-btn:hover { background:rgba(0,255,136,0.15) !important; transform:translateY(-1px); }
        .send-btn:hover { opacity:0.85; }
      `}</style>

      <div style={{
        position:"fixed",top:0,left:0,right:0,height:"2px",
        background:"linear-gradient(90deg,transparent,rgba(0,255,136,0.15),transparent)",
        animation:"scanline 8s linear infinite",pointerEvents:"none",zIndex:999
      }}/>
      <div style={{
        position:"fixed",inset:0,pointerEvents:"none",
        backgroundImage:`linear-gradient(rgba(0,255,136,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.03) 1px,transparent 1px)`,
        backgroundSize:"40px 40px"
      }}/>

      {/* Header */}
      <div style={{
        padding:"16px 24px",borderBottom:"1px solid rgba(0,255,136,0.15)",
        background:"rgba(0,0,0,0.4)",backdropFilter:"blur(20px)",
        display:"flex",alignItems:"center",gap:16,position:"relative",zIndex:10
      }}>
        <div style={{
          width:44,height:44,borderRadius:"50%",
          background:"linear-gradient(135deg,#00ff88,#00b4d8)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:22,animation:"glow 3s ease-in-out infinite"
        }}>⚡</div>
        <div>
          <div style={{color:"#00ff88",fontWeight:700,fontSize:18,letterSpacing:3}}>ARIA</div>
          <div style={{color:"rgba(0,255,136,0.5)",fontSize:10,letterSpacing:2}}>
            AI RESEARCH INTELLIGENCE AGENT
            <span style={{marginLeft:8,animation:"blink 1s infinite"}}>▌</span>
          </div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#00ff88",boxShadow:"0 0 8px #00ff88"}}/>
          <span style={{color:"rgba(0,255,136,0.6)",fontSize:11,letterSpacing:1}}>ONLINE</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        padding:"12px 20px",display:"flex",gap:8,flexWrap:"wrap",
        borderBottom:"1px solid rgba(0,255,136,0.08)",
        background:"rgba(0,0,0,0.2)",position:"relative",zIndex:10
      }}>
        {quickActions.map((qa,i)=>(
          <button key={i} className="quick-btn" onClick={()=>qa.action?qa.action():sendMessage(qa.msg)} disabled={loading}
            style={{
              background:"rgba(0,255,136,0.05)",border:"1px solid rgba(0,255,136,0.2)",
              borderRadius:20,padding:"6px 14px",color:"rgba(0,255,136,0.8)",
              fontSize:11,cursor:"pointer",transition:"all 0.2s",letterSpacing:0.5,fontFamily:"inherit"
            }}>{qa.label}</button>
        ))}
      </div>

      {/* Forum Modal */}
      {forumMode && (
        <div style={{
          position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:100,
          display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)"
        }}>
          <div style={{
            background:"#041428",border:"1px solid rgba(0,255,136,0.3)",
            borderRadius:16,padding:28,width:"90%",maxWidth:560,
            boxShadow:"0 0 40px rgba(0,255,136,0.1)"
          }}>
            <div style={{color:"#00ff88",fontWeight:700,marginBottom:8,letterSpacing:2,fontSize:13}}>
              📋 PASTE MOLTBOOK FORUM CONTENT
            </div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginBottom:16}}>
              Copy posts from Moltbook and paste them below. ARIA will analyze and summarize.
            </div>
            <textarea ref={textareaRef} rows={8} placeholder="Paste forum posts here..."
              style={{
                width:"100%",boxSizing:"border-box",background:"rgba(0,0,0,0.5)",
                border:"1px solid rgba(0,255,136,0.2)",borderRadius:8,padding:12,
                color:"#e8f4f8",fontSize:13,resize:"vertical",fontFamily:"inherit",lineHeight:1.6,outline:"none"
              }}/>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <button onClick={()=>{
                const content=textareaRef.current?.value;
                if(content?.trim()){setForumMode(false);sendMessage(`Please analyze these Moltbook forum posts and give me a structured summary of the most important AI developments, breaking news, and interesting discussions:\n\n${content}`);}
              }} style={{
                flex:1,background:"linear-gradient(135deg,#00ff88,#00b4d8)",border:"none",
                borderRadius:8,padding:"10px 0",color:"#041428",fontWeight:700,
                cursor:"pointer",fontSize:13,letterSpacing:1
              }}>ANALYZE ⚡</button>
              <button onClick={()=>setForumMode(false)} style={{
                background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:8,padding:"10px 20px",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:13
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"20px",position:"relative",zIndex:5}}>
        {messages.map((msg,i)=><Message key={i} msg={msg}/>)}
        {loading && (
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <div style={{
              width:36,height:36,borderRadius:"50%",
              background:"linear-gradient(135deg,#00ff88,#00b4d8)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:16,boxShadow:"0 0 12px rgba(0,255,136,0.4)"
            }}>⚡</div>
            <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(0,255,136,0.15)",borderRadius:"18px 18px 18px 4px",backdropFilter:"blur(10px)"}}>
              <TypingIndicator/>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{
        padding:"16px 20px",borderTop:"1px solid rgba(0,255,136,0.1)",
        background:"rgba(0,0,0,0.4)",backdropFilter:"blur(20px)",
        display:"flex",gap:10,alignItems:"flex-end",position:"relative",zIndex:10
      }}>
        <div style={{
          flex:1,background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(0,255,136,0.2)",borderRadius:16,padding:"12px 16px"
        }}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}}
            placeholder="Ask ARIA anything about AI... (Enter to send)"
            rows={1}
            style={{
              width:"100%",background:"transparent",border:"none",color:"#e8f4f8",
              fontSize:14,resize:"none",fontFamily:"inherit",lineHeight:1.6,
              maxHeight:120,overflowY:"auto",outline:"none"
            }}/>
        </div>
        <button className="send-btn" onClick={()=>sendMessage()} disabled={loading||!input.trim()}
          style={{
            width:46,height:46,borderRadius:"50%",
            background:input.trim()?"linear-gradient(135deg,#00ff88,#00b4d8)":"rgba(255,255,255,0.05)",
            border:"none",display:"flex",alignItems:"center",justifyContent:"center",
            cursor:input.trim()?"pointer":"default",fontSize:18,transition:"all 0.2s",flexShrink:0,color:"#041428",fontWeight:700
          }}>{loading?"⏳":"→"}</button>
      </div>
    </div>
  );
}
