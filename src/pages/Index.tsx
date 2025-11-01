import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, LogOut, User } from "lucide-react";
import Navigation from "@/components/Navigation";
import { FlowingRibbon } from "@/components/FlowingRibbon";
import { WellnessChecklist } from "@/components/WellnessChecklist";
import { DynamicGreeting } from "@/components/DynamicGreeting";

import { PersonalizationSection } from "@/components/PersonalizationSection";
import { AchievementTracker } from "@/components/AchievementTracker";
import { DailyFact } from "@/components/DailyFact";
import { ChatTimeline } from "@/components/ChatTimeline";
import { ChatModal } from "@/components/ChatModal";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [allTasksCompleted, setAllTasksCompleted] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleSelectConversation = (conversationId: string, date: Date) => {
    setSelectedConversationId(conversationId);
    setSelectedDate(date);
    setChatModalOpen(true);
  };

  const handleOpenNewChat = () => {
    setSelectedConversationId(null);
    setSelectedDate(undefined);
    setChatModalOpen(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/20 relative overflow-hidden">
      <FlowingRibbon />
      <div className="relative z-10">
        <Navigation />
      

        
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-50/50 via-white/80 to-blue-50/30 backdrop-blur-sm border-b border-blue-200/30">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-lg border-2 border-blue-300/50">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-light text-gray-800" style={{fontFamily: 'Poppins, system-ui, sans-serif'}}>
                    Welcome back, {user?.user_metadata?.username || user?.email?.split('@')[0] || 'Friend'}!
                  </h1>
                  <p className="text-blue-600/70">Your wellness journey continues</p>
                </div>
              </div>
              <Button variant="ghost" onClick={handleSignOut} className="rounded-full hover:bg-blue-50">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
            

          </div>
        </div>

        {/* Main Dashboard */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <WellnessChecklist onCompletionChange={setAllTasksCompleted} />
              <AchievementTracker />
            </div>
            
            {/* Middle Column */}
            <div className="space-y-6">
              <PersonalizationSection />
              <DailyFact allTasksCompleted={allTasksCompleted} />

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <ChatTimeline 
                userId={user.id} 
                onSelectConversation={handleSelectConversation}
              />
              
              {/* Single Chat Button */}
              <Card className="border border-blue-200/50 bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-light mb-2 text-gray-800">
                    Start Chat
                  </h3>
                  <Button 
                    onClick={handleOpenNewChat}
                    className="w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    Talk with DiaMind
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Chat Modal */}
        <ChatModal
          open={chatModalOpen}
          onOpenChange={setChatModalOpen}
          userId={user.id}
          conversationId={selectedConversationId}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
};
export default Index;