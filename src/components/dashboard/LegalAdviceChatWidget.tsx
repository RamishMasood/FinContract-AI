import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, ChevronDown, ChevronUp, Send, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
type ChatMsg = {
  role: "user" | "ai";
  content: string;
};
type ChatSession = {
  id: string;
  created_at: string;
  title: string | null;
  chat: ChatMsg[];
};
function isChatMsgArray(arg: any): arg is ChatMsg[] {
  return Array.isArray(arg) && arg.every(v => v && (v.role === "user" || v.role === "ai") && typeof v.content === "string");
}
function normalizeChatArray(chat: any): ChatMsg[] {
  // Best effort to cast chat to ChatMsg[]
  if (isChatMsgArray(chat)) {
    return chat;
  }
  // Try to coerce/correct (in case role is 'User'/'AI' or just string)
  if (Array.isArray(chat)) {
    return chat.map(v => {
      let role: "user" | "ai" = "user";
      if (typeof v.role === "string") {
        if (v.role.toLowerCase() === "user") role = "user";else if (v.role.toLowerCase() === "ai") role = "ai";
      }
      if (typeof v.content === "string") {
        return {
          role,
          content: v.content
        } as ChatMsg;
      }
      return null;
    }).filter(Boolean) as ChatMsg[];
  }
  return [];
}

// --- Update fetchLegalAdvice to take full chat ---
// Accepts full chat dialog and passes to the edge function
async function fetchLegalAdvice(fullChat: ChatMsg[]) {
  const {
    data,
    error
  } = await supabase.functions.invoke("legal-widgets", {
    body: {
      type: "legal_advice",
      chat: fullChat
    }
  });
  if (error) return {
    error: error.message || "Failed to call legal-widgets."
  };
  return data;
}
async function getAllLegalChats(userId: string): Promise<ChatSession[]> {
  const {
    data,
    error
  } = await supabase.from("legal_chat_histories").select("*").eq("user_id", userId).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  // Normalize and ensure correct type
  return (data || []).map(s => ({
    id: s.id,
    created_at: s.created_at,
    title: s.title,
    chat: normalizeChatArray(s.chat)
  }));
}
async function createChat({
  userId,
  chat
}: {
  userId: string;
  chat: ChatMsg[];
}): Promise<ChatSession> {
  const {
    data,
    error
  } = await supabase.from("legal_chat_histories").insert([{
    user_id: userId,
    chat
  }]).select().single();
  if (error) throw new Error(error.message);
  // Important to normalize after insert
  return {
    id: data.id,
    created_at: data.created_at,
    title: data.title,
    chat: normalizeChatArray(data.chat)
  };
}
async function updateChat({
  id,
  chat
}: {
  id: string;
  chat: ChatMsg[];
}): Promise<ChatSession> {
  const {
    data,
    error
  } = await supabase.from("legal_chat_histories").update({
    chat
  }).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    created_at: data.created_at,
    title: data.title,
    chat: normalizeChatArray(data.chat)
  };
}

// Add this new component for expandable messages
function ExpandableMessage({
  content,
  isAI = false
}: {
  content: string;
  isAI?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongMessage = content.length > 300;

  // For AI messages with markdown, we'll always show them in full to preserve formatting
  if (isAI) {
    return <div className="text-sm leading-relaxed"><MarkdownRenderer content={content} /></div>;
  }
  return <div className="text-sm">
      {isLongMessage && !isExpanded ? <>
          <span>{content.substring(0, 300)}...</span>
          <Button variant="link" size="sm" onClick={() => setIsExpanded(true)} className="text-xs p-0 h-auto ml-1 text-blue-600">
            Show more
          </Button>
        </> : <>
          <span>{content}</span>
          {isLongMessage && <Button variant="link" size="sm" onClick={() => setIsExpanded(false)} className="text-xs p-0 h-auto ml-1 text-blue-600">
              Show less
            </Button>}
        </>}
    </div>;
}
export default function LegalAdviceChatWidget() {
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  // Add ref for chat container
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  useEffect(() => {
    if (user?.id) {
      setLoadingChats(true);
      getAllLegalChats(user.id).then(chats => setSessions(chats)).catch(err => toast({
        title: "Could not load previous chats",
        description: err.message,
        variant: "destructive"
      })).finally(() => setLoadingChats(false));
    }
  }, [user?.id]);
  useEffect(() => {
    if (currentSession) {
      setChat(currentSession.chat);
    } else {
      setChat([]);
    }
  }, [currentSession]);
  // Scroll to bottom when chat or loading changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat, loading]);
  const handleSend = async () => {
    if (!question.trim()) return;
    const cleanUserMsg: ChatMsg = {
      role: "user",
      content: question
    };
    let updatedChat: ChatMsg[] = [...chat, cleanUserMsg];
    setChat(updatedChat);
    setLoading(true);

    // --- Call fetchLegalAdvice with full chat, so AI sees whole dialog ---
    const {
      result,
      error
    } = await fetchLegalAdvice(updatedChat);
    setLoading(false);
    const aiMsg: ChatMsg = {
      role: "ai",
      content: error ? typeof error === "string" ? error : "Error getting advice." : result || "No answer received."
    };
    updatedChat = [...updatedChat, aiMsg];
    setChat(updatedChat);
    setQuestion("");
    try {
      let session: ChatSession | null = currentSession;
      if (!session) {
        session = await createChat({
          userId: user!.id,
          chat: updatedChat
        });
        setCurrentSession(session);
        setSessions(prev => [session!, ...prev]);
      } else {
        const updatedSession = await updateChat({
          id: session.id,
          chat: updatedChat
        });
        setCurrentSession(updatedSession);
        setSessions(prev => prev.map(s => s.id === session!.id ? updatedSession : s));
      }
    } catch (e: any) {
      toast({
        title: "Chat history not saved!",
        description: e?.message ?? "Failed to save chat history.",
        variant: "destructive"
      });
    }
  };
  const handleNewChat = () => {
    setCurrentSession(null);
    setChat([]);
    setQuestion("");
  };
  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session);
    setShowHistory(false);
  };
  return <section className="bg-gradient-to-br from-slate-50 to-legal-primary/5 rounded-xl shadow-lg border border-legal-primary/20 p-6 my-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-legal-primary p-2 rounded-lg">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Regulatory Risk Advisor</h3>
        <span className="text-xs bg-legal-primary/10 text-legal-primary px-2 py-1 rounded-full font-medium ml-auto">AI-Powered</span>
      </div>
      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-legal-primary/20">
        <Button 
          size="sm" 
          onClick={handleNewChat} 
          className="bg-legal-primary hover:bg-legal-primary/90 text-white shadow-sm"
        >
          ✨ New Chat
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => setShowHistory(show => !show)}
          className="text-legal-primary hover:bg-legal-primary/5"
        >
          {showHistory ? <>
              <ChevronUp className="w-4 h-4 mr-1" /> Hide History
            </> : <>
              <ChevronDown className="w-4 h-4 mr-1" /> Previous Chats ({sessions.length})
            </>}
        </Button>
      </div>
      {/* Chat History Dropdown */}
      {showHistory && <div className="mb-4 bg-white rounded-lg border border-legal-primary/20 p-3 max-h-48 overflow-y-auto">
          {loadingChats && <div className="text-sm text-gray-500 p-2">Loading previous chats...</div>}
          {!loadingChats && sessions.length === 0 && <div className="text-sm text-gray-400 p-2">No previous chats.</div>}
          {!loadingChats && sessions.length > 0 && sessions.map(s => <Button 
            variant={currentSession?.id === s.id ? "default" : "ghost"} 
            size="sm" 
            className={`w-full text-left truncate mb-2 justify-start ${currentSession?.id === s.id ? 'bg-legal-primary text-white' : ''}`}
            key={s.id} 
            onClick={() => handleSelectSession(s)}
          >
                <span className="truncate flex-1">
                  {s.chat.length > 0 ? s.chat[0].content.slice(0, 45) + (s.chat[0].content.length > 45 ? "..." : "") : "Untitled"}
                </span>
                <span className={`text-xs ml-2 ${currentSession?.id === s.id ? 'text-legal-primary/60' : 'text-gray-400'}`}>
                  {new Date(s.created_at).toLocaleString()}
                </span>
              </Button>)}
        </div>}

      {/* Instruction Text */}
      <p className="text-sm text-slate-600 mb-4 bg-legal-primary/5 rounded-lg p-3 border border-legal-primary/20">
        💡 <strong>Ask about trading & compliance:</strong> "Does this CFD clause meet CFTC requirements?" or "Is this leverage term compliant under Malta law?" Your conversations are saved automatically.
      </p>
      
      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className="rounded-lg bg-white border border-legal-primary/20 min-h-[200px] max-h-[500px] overflow-y-auto mb-4 p-4 shadow-inner"
        style={{ minHeight: 200, maxHeight: 500 }}
      >
        {chat.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Bot className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Ask about trading compliance, leverage rules, and jurisdiction-specific regulations...</p>
            </div>
          </div>
        )}
        {chat.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 mb-4 animate-fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
              msg.role === "user" 
                ? "bg-legal-primary" 
                : "bg-legal-accent"
            }`}>
              {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            
            {/* Message Bubble */}
            <div className={`flex-1 max-w-xs lg:max-w-md ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-4 py-3 rounded-2xl ${
                msg.role === "user" 
                  ? "bg-legal-primary text-white rounded-br-none shadow-md" 
                  : "bg-slate-100 text-slate-800 rounded-bl-none shadow-sm border border-legal-primary/20"
              }`}>
                <ExpandableMessage content={msg.content} isAI={msg.role === "ai"} />
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 mb-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-legal-accent">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex gap-2 items-center bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-none border border-legal-primary/20">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-legal-accent/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-legal-accent/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-legal-accent/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs text-legal-primary ml-1">AI is thinking...</span>
            </div>
          </div>
        )}
      </div>
      {/* Input Area */}
      <div className="flex gap-2 bg-slate-50 rounded-lg p-3 border border-legal-primary/20">
        <Input 
          value={question} 
          onChange={e => setQuestion(e.target.value)} 
          placeholder="Ask about CFD clauses, leverage, FCA/CFTC/Malta rules..." 
          onKeyDown={e => {
            if (e.key === "Enter" && !loading) handleSend();
          }} 
          disabled={loading}
          className="bg-white border-legal-primary/20 focus:border-legal-primary focus:ring-legal-primary"
        />
        <Button 
          size="sm" 
          onClick={handleSend} 
          disabled={loading}
          className="bg-legal-primary hover:bg-legal-primary/90 text-white px-4 shadow-md"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </section>;
}