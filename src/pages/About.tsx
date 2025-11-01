import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Brain, Shield } from "lucide-react";
import { FlowingRibbon } from "@/components/FlowingRibbon";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/20 relative overflow-hidden">
      <FlowingRibbon />
      <div className="relative z-10">
        <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-800 pb-2">
            About DiaMind
          </h1>
          
          <p className="text-xl text-center text-blue-600/70 mb-12 max-w-2xl mx-auto">
            Your compassionate AI companion for emotional wellness on your diabetes journey
          </p>

          <Card className="mb-12 border border-blue-200/50 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                At DiaMind, we believe caring for your mental health is just as important as managing your blood sugar.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                DiaMind helps users navigate the emotional side of diabetes—stress, anxiety, burnout, and motivation. 
                We provide non-clinical emotional support using AI-driven empathy and education, creating a safe space 
                where you can express your feelings and receive understanding, encouragement, and practical coping strategies.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center border border-blue-200/50 hover:shadow-xl transition-all duration-500 group bg-white/80 backdrop-blur-sm rounded-3xl">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center transition-all duration-500">
                  <Heart className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Empathy First</h3>
                <p className="text-blue-600/70">
                  We understand the emotional challenges of living with diabetes
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border border-blue-200/50 hover:shadow-xl transition-all duration-500 group bg-white/80 backdrop-blur-sm rounded-3xl">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center transition-all duration-500">
                  <Brain className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Evidence-Based</h3>
                <p className="text-blue-600/70">
                  Our guidance is rooted in psychological research and diabetes education
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border border-blue-200/50 hover:shadow-xl transition-all duration-500 group bg-white/80 backdrop-blur-sm rounded-3xl">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center transition-all duration-500">
                  <Shield className="h-10 w-10 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Safe & Private</h3>
                <p className="text-blue-600/70">
                  Your conversations are confidential and secure
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/30 backdrop-blur-sm border border-primary/30 rounded-2xl mb-12">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 text-primary">Why Diamind Exists</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Living with diabetes can feel isolating and overwhelming. The constant monitoring, lifestyle changes, 
                and worry about complications can take a significant toll on mental health. Diamind was created to 
                fill the gap between clinical care and emotional support—to be there for you whenever you need 
                encouragement, validation, or simply someone who understands what you're going through.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/8 to-accent/8 backdrop-blur-sm border border-primary/20 rounded-3xl mb-12">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 text-secondary">About the Creator</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Diamind was created by a type 1 diabetic who has lived with the condition for 10 years. 
                This project embodies perseverance, clarity, and balance — showing that managing your health 
                and caring for your mind can coexist beautifully.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/8 to-primary/8 backdrop-blur-sm border border-accent/20 rounded-3xl shadow-glow">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 text-secondary">Why the Arctic Tern?</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                The Arctic Tern, known for its extraordinary long-distance migration, symbolizes endurance, freedom, 
                and transformation. Making over 44,000 miles annually from Arctic to Antarctic and back, this remarkable 
                bird represents the ultimate journey of resilience.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                It was chosen as the emblem of Diamind to represent the journey of strength and growth — living with 
                purpose, moving forward, and finding calm along the way. Just as the Arctic Tern navigates vast distances 
                with grace and determination, Diamind guides you through your wellness journey with steady support, 
                clarity, and hope.
              </p>
            </CardContent>
          </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default About;
