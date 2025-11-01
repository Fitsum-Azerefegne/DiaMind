import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Calendar, User, AlertTriangle, Edit3 } from "lucide-react";

export const PersonalizationSection = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    diagnosisDate: "",
    routine: "",
    triggers: ""
  });

  const handleSave = () => {
    setIsEditing(false);
    // Save to localStorage or backend
  };

  return (
    <Card className="border border-blue-200/50 bg-gradient-to-br from-white/80 to-blue-50/30 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-light text-gray-800 flex items-center justify-between" style={{fontFamily: 'Poppins, system-ui, sans-serif'}}>
          Your Diabetes Journey
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="h-4 w-4 text-blue-500" />
            When were you diagnosed?
          </Label>
          {isEditing ? (
            <Input
              type="date"
              value={profile.diagnosisDate}
              onChange={(e) => setProfile(prev => ({ ...prev, diagnosisDate: e.target.value }))}
              className="border-blue-200 focus:border-blue-400"
            />
          ) : (
            <p className="text-gray-600 text-sm">
              {profile.diagnosisDate || "Not set - click edit to add"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <User className="h-4 w-4 text-green-500" />
            What's your daily wellness routine?
          </Label>
          {isEditing ? (
            <Textarea
              placeholder="e.g., Morning glucose check, evening walk, meditation..."
              value={profile.routine}
              onChange={(e) => setProfile(prev => ({ ...prev, routine: e.target.value }))}
              className="border-blue-200 focus:border-blue-400"
              rows={3}
            />
          ) : (
            <p className="text-gray-600 text-sm">
              {profile.routine || "Not set - click edit to add your routine"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            What usually makes your blood sugar spike?
          </Label>
          {isEditing ? (
            <Textarea
              placeholder="e.g., Stress, certain foods, lack of sleep..."
              value={profile.triggers}
              onChange={(e) => setProfile(prev => ({ ...prev, triggers: e.target.value }))}
              className="border-blue-200 focus:border-blue-400"
              rows={3}
            />
          ) : (
            <p className="text-gray-600 text-sm">
              {profile.triggers || "Not set - click edit to add your triggers"}
            </p>
          )}
        </div>

        {isEditing && (
          <Button onClick={handleSave} className="w-full bg-gradient-to-r from-blue-500 to-blue-600">
            Save Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
};