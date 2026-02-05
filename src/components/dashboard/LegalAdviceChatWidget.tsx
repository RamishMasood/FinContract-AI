import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";
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
    return <MarkdownRenderer content={content} />;
  }
  return <div>
      {isLongMessage && !isExpanded ? <>
          <span>{content.substring(0, 300)}...</span>
          <Button variant="link" size="sm" onClick={() => setIsExpanded(true)} className="text-xs p-0 h-auto ml-1">
            Show more
          </Button>
        </> : <>
          <span>{content}</span>
          {isLongMessage && <Button variant="link" size="sm" onClick={() => setIsExpanded(false)} className="text-xs p-0 h-auto ml-1">
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
  return <section className="bg-white rounded-lg shadow-sm border p-5 my-4">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-slate-900">
        <Activity className="h-5 w-5 text-blue-600" /> Regulatory Risk Chat
      </h3>
      <div className="flex items-center justify-between mb-2">
        <Button size="sm" variant="secondary" onClick={handleNewChat} className="mr-2 bg-[#1e3a5f] hover:bg-[#2563eb] text-slate-50">
          New Chat
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowHistory(show => !show)} className="flex items-center">
          {showHistory ? <>
              <ChevronUp className="w-4 h-4 mr-1" /> Hide History
            </> : <>
              <ChevronDown className="w-4 h-4 mr-1" /> Previous Chats
            </>}
        </Button>
      </div>
      {showHistory && <div className="mb-3 border-b pb-2">
          {loadingChats && <div className="text-sm text-gray-500">Loading previous chats...</div>}
          {!loadingChats && sessions.length === 0 && <div className="text-sm text-gray-400">No previous chats.</div>}
          {!loadingChats && sessions.length > 0 && sessions.map(s => <Button variant={currentSession?.id === s.id ? "outline" : "ghost"} size="sm" className="block w-full text-left truncate my-[2px]" key={s.id} onClick={() => handleSelectSession(s)}>
                {s.chat.length > 0 ? s.chat[0].content.slice(0, 45) + (s.chat[0].content.length > 45 ? "..." : "") : "Untitled"}
                <span className="ml-2 text-xs text-gray-400">
                  {new Date(s.created_at).toLocaleString()}
                </span>
              </Button>)}
        </div>}

      <p className="text-sm text-legal-muted mb-3">
        Ask a legal question (e.g., "Can my client legally delay payment if they said it’s net-15?").
        Your conversations are saved so you can review them later.
      </p>
      <div className="flex gap-2 mb-2">
        <Input value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g. Is this leverage clause MiFID II compliant?" onKeyDown={e => {
        if (e.key === "Enter" && !loading) handleSend();
      }} disabled={loading} />
        <Button size="sm" onClick={handleSend} disabled={loading}>
          {loading ? "Asking..." : "Ask"}
        </Button>
      </div>
      
      {/* Updated chat container: resizable and scrolls to bottom */}
      <div
        ref={chatContainerRef}
        className="rounded bg-gray-50 min-h-[180px] max-h-[600px] overflow-y-auto mb-1 py-[12px] px-[11px] resize-y"
        style={{ minHeight: 180, maxHeight: 600 }}
      >
        {chat.length === 0 && <p className="text-gray-400 text-sm">No chat yet.</p>}
        {chat.map((msg, idx) => <div key={idx} className="py-[2px] my-[10px]">
            <div className={`inline-block px-3 py-2 rounded-lg max-w-[90%] break-words ${msg.role === "user" ? "bg-[#1e3a5f] text-white" : "bg-slate-200 text-slate-800"}`}>
              {msg.role === "ai" ? <ExpandableMessage content={msg.content} isAI={true} /> : <ExpandableMessage content={msg.content} />}
            </div>
          </div>)}
        {loading && <div className="text-xs text-gray-500 italic">AI is typing…</div>}
      </div>
    </section>;
}