import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Droplets, Activity, Moon, Heart, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WellnessMetric {
  id: string;
  label: string;
  friendlyLabel: string;
  icon: any;
  current: number;
  goal: number;
  unit: string;
  color: string;
  encouragement: string;
}

export const WellnessTracker = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<WellnessMetric[]>([
    { 
      id: "hydration", 
      label: "Water Intake",
      friendlyLabel: "💧 Stay Hydrated", 
      icon: Droplets, 
      current: 6, 
      goal: 8, 
      unit: "glasses", 
      color: "text-blue-500",
      encouragement: "Great job! Keep sipping!"
    },
    { 
      id: "glucose", 
      label: "Blood Sugar",
      friendlyLabel: "📊 In Range", 
      icon: Activity, 
      current: 120, 
      goal: 140, 
      unit: "mg/dL", 
      color: "text-green-500",
      encouragement: "Looking good!"
    },
    { 
      id: "rest", 
      label: "Sleep",
      friendlyLabel: "😴 Rest Well", 
      icon: Moon, 
      current: 7, 
      goal: 8, 
      unit: "hours", 
      color: "text-purple-500",
      encouragement: "Almost there!"
    },
    { 
      id: "calm", 
      label: "Mindfulness",
      friendlyLabel: "🧘 Find Peace", 
      icon: Heart, 
      current: 15, 
      goal: 20, 
      unit: "minutes", 
      color: "text-pink-500",
      encouragement: "You're doing great!"
    },
  ]);

  const updateMetric = (id: string, increment: number) => {
    setMetrics(prev => prev.map(metric => {
      if (metric.id === id) {
        const newValue = Math.max(0, Math.min(metric.goal, metric.current + increment));
        if (newValue >= metric.goal) {
          toast({
            title: "Goal Achieved! 🎉",
            description: metric.encouragement,
          });
        }
        return { ...metric, current: newValue };
      }
      return metric;
    }));
  };

  return (
    <Card className="border border-blue-200/50 bg-gradient-to-br from-white/80 to-blue-50/30 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-light text-gray-800" style={{fontFamily: 'Poppins, system-ui, sans-serif'}}>
          Today's Wellness Journey
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map(metric => {
          const Icon = metric.icon;
          const percentage = (metric.current / metric.goal) * 100;
          const isComplete = percentage >= 100;
          
          return (
            <div key={metric.id} className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              isComplete ? 'bg-green-50/50 border-green-200' : 'bg-gray-50/30 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isComplete ? 'bg-green-100' : 'bg-white'
                  }`}>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-800">{metric.label}</span>
                    <p className="text-xs text-gray-500">{metric.friendlyLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${
                    isComplete ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {metric.current} / {metric.goal} {metric.unit}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateMetric(metric.id, 1)}
                    className="h-6 w-6 p-0 rounded-full"
                    disabled={isComplete}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Progress 
                  value={percentage} 
                  className={`h-2 ${
                    isComplete ? '[&>div]:bg-green-500' : '[&>div]:bg-blue-500'
                  }`} 
                />
                {isComplete && (
                  <p className="text-xs text-green-600 font-medium">✨ {metric.encouragement}</p>
                )}
              </div>
            </div>
          );
        })}
        
        <div className="text-center pt-2">
          <p className="text-xs text-blue-600/70">
            Tap + to update your progress throughout the day
          </p>
        </div>
      </CardContent>
    </Card>
  );
};