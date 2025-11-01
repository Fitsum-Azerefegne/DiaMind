import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import { Send, Heart, Sparkles, LogOut, User } from "lucide-react";
import { FlowingRibbon } from "@/components/FlowingRibbon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { streamChat, Message } from "@/utils/chatStream";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConsent, setShowConsent] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadOrCreateConversation();
    }
  }, [user]);

  const loadOrCreateConversation = async () => {
    if (!user) return;

    // Get most recent conversation
    const { data: conversations } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (conversations && conversations.length > 0) {
      setConversationId(conversations[0].id);
      loadMessages(conversations[0].id);
    } else {
      // Create new conversation
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title: "New Chat" })
        .select()
        .single();

      if (newConv) {
        setConversationId(newConv.id);
      }
    }
  };

  const loadMessages = async (convId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
    }
  };

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!conversationId) return;

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role,
      content,
    });
  };

  const examplePrompts = [
    "How can I manage diabetes-related stress?",
    "I'm feeling overwhelmed with my blood sugar management",
    "Can you suggest some mindfulness exercises?",
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !conversationId) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    
    const newUserMsg: Message = { role: "user", content: userMessage };
    setMessages(prev => [...prev, newUserMsg]);
    await saveMessage("user", userMessage);

    setIsLoading(true);
    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    await streamChat({
      messages: [...messages, newUserMsg],
      onDelta: updateAssistant,
      onDone: async () => {
        setIsLoading(false);
        await saveMessage("assistant", assistantContent);
      },
      onError: (error) => {
        setIsLoading(false);
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    });
  };

  const handleExampleClick = (prompt: string) => {
    setInputMessage(prompt);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/20 flex flex-col relative overflow-hidden">
      <FlowingRibbon />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation />

      <AlertDialog open={showConsent} onOpenChange={setShowConsent}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Welcome to DiaMind
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left">
              <p>
                DiaMind is here to provide emotional support and guidance for managing the mental
                aspects of diabetes.
              </p>
              <p className="font-medium">
                Important: DiaMind is not a replacement for professional medical or mental health
                care.
              </p>
              <p>
                If you're experiencing a medical emergency or crisis, please contact your healthcare
                provider or emergency services immediately.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>I Understand</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

        <div className="flex-1 container mx-auto py-8 px-4 max-w-4xl flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 animate-fade-in text-gray-800">
                <Heart className="h-8 w-8 text-blue-600" />
                Welcome back, {user?.user_metadata?.username || user?.email?.split('@')[0]}
              </h1>
              <p className="text-blue-600/70">Your compassionate AI companion for emotional wellness</p>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="border-blue-200 hover:bg-blue-50">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-fade-in">
            <div className="text-center space-y-4 max-w-2xl">
              <Sparkles className="h-12 w-12 text-primary mx-auto animate-float" />
              <h2 className="text-2xl font-semibold">How can I support you today?</h2>
              <p className="text-muted-foreground">
                Start a conversation about your feelings, challenges, or ask for mindfulness guidance.
              </p>
            </div>

            <div className="grid gap-3 w-full max-w-2xl">
              <p className="text-sm font-medium text-muted-foreground">Try asking:</p>
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(prompt)}
                  className="text-left p-4 rounded-lg border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
                >
                  <p className="text-sm group-hover:text-primary transition-colors">{prompt}</p>
                </button>
              ))}
            </div>

            <Alert className="max-w-2xl">
              <Heart className="h-4 w-4" />
              <AlertDescription>
                DiaMind provides supportive guidance but is not a substitute for professional medical
                or mental health care.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in gap-3`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-secondary" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-5 py-3">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="sticky bottom-0 bg-background pt-4 border-t">
          <div className="flex gap-3">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Share what's on your mind..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="lg"
              className="px-6"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;