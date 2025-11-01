import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Droplets, Activity, Brain, Heart, Award, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  icon: any;
  points: number;
  completed: boolean;
  color: string;
}

export const WellnessGames = () => {
  const { toast } = useToast();
  const [totalPoints, setTotalPoints] = useState(250);
  const [dailyTasks, setDailyTasks] = useState<Task[]>([
    { id: "hydration", title: "Log Water Intake", icon: Droplets, points: 10, completed: false, color: "text-blue-500" },
    { id: "glucose", title: "Check Blood Sugar", icon: Activity, points: 15, completed: false, color: "text-diabetes-blue" },
    { id: "meditation", title: "5-Min Meditation", icon: Brain, points: 20, completed: false, color: "text-primary" },
    { id: "gratitude", title: "Write Gratitude Note", icon: Heart, points: 15, completed: false, color: "text-pink-500" },
  ]);

  const completedCount = dailyTasks.filter(t => t.completed).length;
  const progressPercent = (completedCount / dailyTasks.length) * 100;

  const handleTaskComplete = (taskId: string) => {
    setDailyTasks(prev => prev.map(task => {
      if (task.id === taskId && !task.completed) {
        setTotalPoints(p => p + task.points);
        toast({
          title: "Task Completed! 🎉",
          description: `+${task.points} points earned`,
        });
        return { ...task, completed: true };
      }
      return task;
    }));
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary animate-shimmer" />
            Daily Wellness Tasks
          </span>
          <Badge variant="secondary" className="text-lg px-4 py-1">
            {totalPoints} pts
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Daily Progress</span>
            <span className="font-semibold">{completedCount}/{dailyTasks.length} tasks</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        <div className="space-y-3">
          {dailyTasks.map(task => {
            const Icon = task.icon;
            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  task.completed
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${task.completed ? "opacity-50" : ""}`}>
                    <Icon className={`h-5 w-5 ${task.color}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">+{task.points} points</p>
                  </div>
                </div>
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleTaskComplete(task.id)}
                    className="rounded-full"
                  >
                    Complete
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <p className="text-sm text-center text-muted-foreground">
            Complete all tasks to unlock special avatar accessories! 🎀
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
