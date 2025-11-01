import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { MessageCircle, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ChatTimelineProps {
  userId: string;
  onSelectConversation: (conversationId: string, date: Date) => void;
}

export const ChatTimeline = ({ userId, onSelectConversation }: ChatTimelineProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [conversations, setConversations] = useState<any[]>([]);
  const [datesWithChats, setDatesWithChats] = useState<Date[]>([]);

  useEffect(() => {
    loadConversations();
  }, [userId]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) {
      setConversations(data);
      const dates = data.map(c => new Date(c.created_at));
      setDatesWithChats(dates);
    }
  };

  const getConversationsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return conversations.filter(c => {
      const convDate = format(new Date(c.created_at), "yyyy-MM-dd");
      return convDate === dateStr;
    });
  };

  const selectedConversations = getConversationsForDate(selectedDate);
  const todayConversations = getConversationsForDate(new Date());

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-primary" />
          Chat Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-xl border"
            modifiers={{
              hasChat: datesWithChats
            }}
            modifiersStyles={{
              hasChat: {
                fontWeight: "bold",
                textDecoration: "underline",
                color: "hsl(var(--primary))"
              }
            }}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              {format(selectedDate, "MMMM d, yyyy")}
            </h3>
            {selectedConversations.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {selectedConversations.length} chat{selectedConversations.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {selectedConversations.length > 0 ? (
            <div className="space-y-2">
              {selectedConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id, selectedDate)}
                  className="w-full text-left p-3 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{conv.title || "Chat"}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(conv.created_at), "h:mm a")}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chats on this date</p>
            </div>
          )}
        </div>

        {todayConversations.length > 0 && format(selectedDate, "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd") && (
          <Button
            variant="outline"
            onClick={() => setSelectedDate(new Date())}
            className="w-full"
          >
            Go to Today
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
