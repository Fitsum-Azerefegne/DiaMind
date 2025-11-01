import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Phone, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { FlowingRibbon } from "@/components/FlowingRibbon";

const Contact = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "Thank you for reaching out. We'll get back to you soon.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/20 relative overflow-hidden">
      <FlowingRibbon />
      <div className="relative z-10">
        <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-800">
            Contact & Crisis Support
          </h1>
          
          <Alert className="mb-8 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-base">
              <strong>Important:</strong> DiaMind does not provide professional medical advice or emergency support. 
              If you're experiencing a medical or mental health emergency, please contact emergency services immediately.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-red-50/50 border-red-200/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Phone className="h-8 w-8 text-red-600" />
                  <CardTitle className="text-2xl text-gray-800">Crisis Helplines</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Suicide & Crisis Lifeline (US)</h3>
                  <p className="text-muted-foreground">Call or text: <span className="font-semibold text-foreground">988</span></p>
                  <p className="text-sm text-muted-foreground">Available 24/7</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Crisis Text Line</h3>
                  <p className="text-muted-foreground">Text "HELLO" to <span className="font-semibold text-foreground">741741</span></p>
                  <p className="text-sm text-muted-foreground">Available 24/7</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">SAMHSA National Helpline</h3>
                  <p className="text-muted-foreground"><span className="font-semibold text-foreground">1-800-662-4357</span></p>
                  <p className="text-sm text-muted-foreground">Mental health and substance abuse support</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">International Crisis Lines</h3>
                  <p className="text-muted-foreground">
                    <a href="https://www.iasp.info/resources/Crisis_Centres/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Find support in your country
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-blue-200/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Mail className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-2xl text-gray-800">Get in Touch</CardTitle>
                    <CardDescription className="text-base mt-1 text-blue-600/70">
                      For feedback, partnerships, or general inquiries
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" required />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" required />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What is this about?" required />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Your message..." 
                      rows={5}
                      required 
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Contact;
