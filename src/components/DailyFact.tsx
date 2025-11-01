import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Lightbulb, BookOpen, Lock } from "lucide-react";

interface DailyFactProps {
  allTasksCompleted: boolean;
}

export const DailyFact = ({ allTasksCompleted }: DailyFactProps) => {
  const [factRead, setFactRead] = useState(false);
  const [progress] = useState(127); // Days read out of 365

  const todaysFact = "Did you know? Laughter can actually help lower blood sugar levels by reducing stress hormones and improving insulin sensitivity. A good laugh is great medicine! 😄";

  const handleReadFact = () => {
    setFactRead(true);
  };

  return (
    <Card className="border border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-white backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-light text-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Daily Diabetes Fact
          </div>
          <div className="text-sm text-purple-600">{progress}/365</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <div className="w-12 h-12 mx-auto">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 365)}`}
                className="text-purple-500"
              />
            </svg>
          </div>
        </div>
        
        {allTasksCompleted ? (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">{todaysFact}</p>
            
            {!factRead ? (
              <Button 
                onClick={handleReadFact}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Mark as Read
              </Button>
            ) : (
              <p className="text-center text-green-600 text-sm font-medium">
                ✨ Added to your Fact Library!
              </p>
            )}
          </>
        ) : (
          <div className="text-center space-y-3">
            <Lock className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-500">
              Complete all wellness activities to unlock today's fact!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};