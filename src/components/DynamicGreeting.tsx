import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Heart, Smile, Meh, Frown } from "lucide-react";

interface DynamicGreetingProps {
  userName: string;
}

export const DynamicGreeting = ({ userName }: DynamicGreetingProps) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [showMoodInput, setShowMoodInput] = useState(false);

  const moods = [
    { id: "great", icon: Smile, color: "text-green-500", label: "Great" },
    { id: "good", icon: Heart, color: "text-blue-500", label: "Good" },
    { id: "okay", icon: Meh, color: "text-yellow-500", label: "Okay" },
    { id: "tough", icon: Frown, color: "text-red-500", label: "Tough" }
  ];

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    setShowMoodInput(true);
  };

  return (
    <Card className="border border-blue-200/50 bg-gradient-to-br from-white/90 to-blue-50/40 backdrop-blur-sm shadow-lg">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-light text-gray-800" style={{fontFamily: 'Poppins, system-ui, sans-serif'}}>
            Welcome back, {userName}! 👋
          </h2>
          <p className="text-blue-600/70">How are you feeling today?</p>
          
          {!selectedMood ? (
            <div className="flex justify-center gap-4 mt-4">
              {moods.map(mood => {
                const Icon = mood.icon;
                return (
                  <Button
                    key={mood.id}
                    variant="outline"
                    onClick={() => handleMoodSelect(mood.id)}
                    className="flex flex-col items-center gap-2 h-auto py-4 px-6 hover:bg-blue-50"
                  >
                    <Icon className={`h-6 w-6 ${mood.color}`} />
                    <span className="text-sm">{mood.label}</span>
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-green-600 font-medium">
                Thanks for sharing! 💙
              </p>
              {showMoodInput && (
                <Textarea
                  placeholder="Want to add a note about how you're feeling? (optional)"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  className="border-blue-200 focus:border-blue-400"
                  rows={3}
                />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};