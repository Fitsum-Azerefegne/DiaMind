import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Heart, BookOpen, Users, Phone } from "lucide-react";
import { ArcticTern } from "@/components/ArcticTern";

const Resources = () => {
  const resources = [
    {
      title: "American Diabetes Association",
      description: "Comprehensive diabetes information, research, and support programs",
      url: "https://diabetes.org",
      icon: Heart,
      category: "Diabetes Care"
    },
    {
      title: "Mental Health America",
      description: "Mental health resources, screenings, and support networks",
      url: "https://mhanational.org",
      icon: Users,
      category: "Mental Health"
    },
    {
      title: "Beyond Type 1",
      description: "Community, education, and advocacy for people with Type 1 diabetes",
      url: "https://beyondtype1.org",
      icon: Heart,
      category: "Diabetes Care"
    },
    {
      title: "JDRF",
      description: "Type 1 diabetes research, advocacy, and community support",
      url: "https://jdrf.org",
      icon: BookOpen,
      category: "Diabetes Care"
    },
    {
      title: "National Alliance on Mental Illness (NAMI)",
      description: "Education, support groups, and advocacy for mental health",
      url: "https://nami.org",
      icon: Users,
      category: "Mental Health"
    },
    {
      title: "Diabetes Daily",
      description: "Community forum and resources for diabetes management",
      url: "https://diabetesdaily.com",
      icon: Users,
      category: "Community"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ArcticTern />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-foreground">
            Support Resources
          </h1>
          
          <p className="text-xl text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Trusted organizations and communities for diabetic mental health support
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-8 w-8 text-primary" />
                        <div>
                          <CardTitle className="text-xl mb-1">{resource.title}</CardTitle>
                          <span className="text-sm text-muted-foreground">{resource.category}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {resource.description}
                    </CardDescription>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      Visit Website
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-primary/10 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Phone className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Need Immediate Support?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">National Suicide Prevention Lifeline (US)</h3>
                  <p className="text-muted-foreground">Call or text: <span className="font-semibold text-foreground">988</span></p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Crisis Text Line</h3>
                  <p className="text-muted-foreground">Text "HELLO" to <span className="font-semibold text-foreground">741741</span></p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">International Association for Suicide Prevention</h3>
                  <p className="text-muted-foreground">Find helplines worldwide at <a href="https://www.iasp.info/resources/Crisis_Centres/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">iasp.info</a></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Resources;
