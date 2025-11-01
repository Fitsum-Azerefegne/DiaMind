import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { User, Shirt, Feather, Sparkles } from "lucide-react";

interface AvatarBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (avatar: AvatarConfig) => void;
  currentAvatar: AvatarConfig;
}

export interface AvatarConfig {
  bodyColor: string;
  clothingStyle: string;
  wingStyle: string;
  accessories: string[];
}

const bodyColors = [
  { name: "Arctic White", value: "#F4F8FA" },
  { name: "Sky Blue", value: "#74BEE3" },
  { name: "Ocean Deep", value: "#4B6B88" },
  { name: "Ice Shimmer", value: "#C7E8F3" },
];

const clothingStyles = ["Casual", "Formal", "Athletic", "Cozy"];
const wingStyles = ["Classic", "Elegant", "Bold", "Subtle"];
const accessories = ["Ribbon", "Feathers", "Sparkles", "Crown"];

export const AvatarBuilder = ({ open, onOpenChange, onSave, currentAvatar }: AvatarBuilderProps) => {
  const [avatar, setAvatar] = useState<AvatarConfig>(currentAvatar);

  const handleSave = () => {
    onSave(avatar);
    onOpenChange(false);
  };

  const toggleAccessory = (accessory: string) => {
    setAvatar(prev => ({
      ...prev,
      accessories: prev.accessories.includes(accessory)
        ? prev.accessories.filter(a => a !== accessory)
        : [...prev.accessories, accessory]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6 text-primary" />
            Customize Your Avatar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview */}
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div 
                className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg transition-all duration-300"
                style={{ backgroundColor: avatar.bodyColor }}
              >
                <User className="h-16 w-16 text-foreground/60" />
              </div>
              <div className="flex justify-center gap-2">
                {avatar.accessories.map(acc => (
                  <span key={acc} className="text-2xl animate-float">
                    {acc === "Ribbon" && "🎀"}
                    {acc === "Feathers" && <Feather className="h-5 w-5 text-primary" />}
                    {acc === "Sparkles" && <Sparkles className="h-5 w-5 text-accent" />}
                    {acc === "Crown" && "👑"}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Body Color */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Body Color
            </Label>
            <div className="grid grid-cols-4 gap-3">
              {bodyColors.map(color => (
                <button
                  key={color.value}
                  onClick={() => setAvatar(prev => ({ ...prev, bodyColor: color.value }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    avatar.bodyColor === color.value
                      ? "border-primary shadow-glow"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div 
                    className="w-full h-12 rounded-lg mb-2"
                    style={{ backgroundColor: color.value }}
                  />
                  <p className="text-xs font-medium">{color.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Clothing Style */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <Shirt className="h-4 w-4" />
              Clothing Style
            </Label>
            <div className="grid grid-cols-4 gap-3">
              {clothingStyles.map(style => (
                <Button
                  key={style}
                  variant={avatar.clothingStyle === style ? "default" : "outline"}
                  onClick={() => setAvatar(prev => ({ ...prev, clothingStyle: style }))}
                  className="h-auto py-3"
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>

          {/* Wing Style */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <Feather className="h-4 w-4" />
              Wing Style
            </Label>
            <div className="grid grid-cols-4 gap-3">
              {wingStyles.map(style => (
                <Button
                  key={style}
                  variant={avatar.wingStyle === style ? "default" : "outline"}
                  onClick={() => setAvatar(prev => ({ ...prev, wingStyle: style }))}
                  className="h-auto py-3"
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>

          {/* Accessories */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" />
              Accessories
            </Label>
            <div className="grid grid-cols-4 gap-3">
              {accessories.map(accessory => (
                <Button
                  key={accessory}
                  variant={avatar.accessories.includes(accessory) ? "default" : "outline"}
                  onClick={() => toggleAccessory(accessory)}
                  className="h-auto py-3"
                >
                  {accessory}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Avatar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
