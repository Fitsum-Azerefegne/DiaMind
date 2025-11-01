import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2, Trophy } from "lucide-react";

export const AchievementTracker = () => {
  const achievements = [
    "Logged hydration",
    "Played breathing exercise", 
    "Added gratitude entry",
    "Checked blood sugar"
  ];

  return (
    <Card className="border border-green-200/50 bg-gradient-to-br from-green-50/50 to-white backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-light text-gray-800 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          You did it! 🎉
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">Today you:</p>
        <div className="space-y-2">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500 animate-pulse" />
              <span className="text-gray-700">{achievement}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};