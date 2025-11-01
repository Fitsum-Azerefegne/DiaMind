import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { Droplets, Activity, Moon, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WellnessItem {
  id: string;
  label: string;
  icon: any;
  color: string;
  completed: boolean;
  note: string;
}

interface WellnessChecklistProps {
  onCompletionChange?: (allCompleted: boolean) => void;
}

export const WellnessChecklist = ({ onCompletionChange }: WellnessChecklistProps) => {
  const { toast } = useToast();
  const [items, setItems] = useState<WellnessItem[]>([
    {
      id: "hydration",
      label: "Stayed hydrated (8+ glasses)",
      icon: Droplets,
      color: "text-blue-500",
      completed: false,
      note: ""
    },
    {
      id: "glucose",
      label: "Checked blood sugar levels",
      icon: Activity,
      color: "text-green-500",
      completed: false,
      note: ""
    },
    {
      id: "rest",
      label: "Got quality sleep (7-8 hours)",
      icon: Moon,
      color: "text-purple-500",
      completed: false,
      note: ""
    },
    {
      id: "mindfulness",
      label: "Practiced mindfulness/calm time",
      icon: Heart,
      color: "text-pink-500",
      completed: false,
      note: ""
    }
  ]);

  const toggleItem = (id: string) => {
    setItems(prev => {
      const newItems = prev.map(item => {
        if (item.id === id) {
          const newCompleted = !item.completed;
          if (newCompleted) {
            toast({
              title: "Great job! ✨",
              description: `${item.label} completed`,
            });
          }
          return { ...item, completed: newCompleted };
        }
        return item;
      });
      
      const newAllCompleted = newItems.every(item => item.completed);
      onCompletionChange?.(newAllCompleted);
      
      return newItems;
    });
  };

  const updateNote = (id: string, note: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, note } : item
    ));
  };

  const completedCount = items.filter(item => item.completed).length;
  const allCompleted = completedCount === items.length;

  return (
    <Card className="border border-blue-200/50 bg-gradient-to-br from-white/80 to-blue-50/30 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-light text-gray-800 flex items-center justify-between" style={{fontFamily: 'Poppins, system-ui, sans-serif'}}>
          Today's Wellness
          <span className="text-sm font-normal text-blue-600">
            {completedCount}/{items.length} completed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={item.id}
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <div className={`p-2 rounded-lg ${item.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <label
                  htmlFor={item.id}
                  className={`text-sm font-medium cursor-pointer flex-1 ${
                    item.completed ? 'text-green-700 line-through' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </label>
              </div>
              
              <Textarea
                placeholder="Add a note about how you're feeling..."
                value={item.note}
                onChange={(e) => updateNote(item.id, e.target.value)}
                className="text-xs border-blue-200/50 focus:border-blue-400 bg-white/60 resize-none"
                rows={2}
              />
            </div>
          );
        })}
        
        {allCompleted && (
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-700 font-medium">🎉 All wellness goals completed!</p>
            <p className="text-green-600 text-sm">Today's fact is now unlocked!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};