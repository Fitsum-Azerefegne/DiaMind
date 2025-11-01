import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Clock, Play, RotateCcw } from "lucide-react";
import { FlowingRibbon } from "@/components/FlowingRibbon";
import { useToast } from "@/hooks/use-toast";

interface GameCard {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const Games = () => {
  const { toast } = useToast();
  const [scores, setScores] = useState<Record<string, number>>({
    memory: 0,
    breathing: 0,
    puzzle: 0,
  });
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [memoryCards, setMemoryCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);

  const symbols = ["🌊", "🌸", "🌙", "⭐", "🦋", "🌿"];

  const initializeMemoryGame = () => {
    const gameCards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        value: symbol,
        isFlipped: false,
        isMatched: false,
      }));
    setMemoryCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
  };

  const handleMemoryCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || memoryCards[cardId].isFlipped || memoryCards[cardId].isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setMemoryCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      const [first, second] = newFlippedCards;
      
      if (memoryCards[first].value === memoryCards[second].value) {
        setTimeout(() => {
          setMemoryCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true } 
              : card
          ));
          setFlippedCards([]);
          
          if (memoryCards.filter(c => !c.isMatched).length === 2) {
            const score = Math.max(100 - moves * 5, 10);
            setScores(prev => ({ ...prev, memory: Math.max(prev.memory, score) }));
            toast({ title: "Game Complete!", description: `Score: ${score}` });
          }
        }, 500);
      } else {
        setTimeout(() => {
          setMemoryCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isFlipped: false } 
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const startBreathingExercise = () => {
    setBreathingActive(true);
    setBreathingCount(0);
    setBreathingPhase('inhale');
  };

  useEffect(() => {
    if (!breathingActive) return;

    const phases = {
      inhale: { duration: 4000, next: 'hold' as const },
      hold: { duration: 2000, next: 'exhale' as const },
      exhale: { duration: 4000, next: 'inhale' as const }
    };

    const timer = setTimeout(() => {
      const currentPhase = phases[breathingPhase];
      setBreathingPhase(currentPhase.next);
      
      if (breathingPhase === 'exhale') {
        const newCount = breathingCount + 1;
        setBreathingCount(newCount);
        
        if (newCount >= 5) {
          setBreathingActive(false);
          const score = 50;
          setScores(prev => ({ ...prev, breathing: prev.breathing + score }));
          toast({ title: "Breathing Complete!", description: "Well done! +50 points" });
        }
      }
    }, phases[breathingPhase].duration);

    return () => clearTimeout(timer);
  }, [breathingActive, breathingPhase, breathingCount]);

  const games = [
    {
      id: "memory",
      title: "Memory Match",
      description: "Test your memory with this calming card matching game",
      icon: "🧠",
      color: "from-blue-100 to-blue-200",
    },
    {
      id: "breathing",
      title: "Breathing Exercise",
      description: "Interactive breathing guidance for relaxation",
      icon: "🌬️",
      color: "from-green-100 to-green-200",
    },
    {
      id: "puzzle",
      title: "Color Puzzle",
      description: "Arrange colors in a soothing pattern",
      icon: "🎨",
      color: "from-purple-100 to-purple-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/20 relative overflow-hidden">
      <FlowingRibbon />
      <div className="relative z-10">
        <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gamepad2 className="h-12 w-12 text-primary animate-float" />
              <h1 className="text-4xl font-bold">Wellness Games</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Take a mindful break with games designed to reduce stress and improve focus
            </p>
          </div>

          {!activeGame ? (
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {games.map((game, index) => (
                <Card
                  key={game.id}
                  className="hover:shadow-xl transition-all duration-300 border-blue-200/50 bg-white/80 backdrop-blur-sm"
                >
                  <CardHeader>
                    <div className={`w-full h-32 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center text-6xl mb-4`}>
                      {game.icon}
                    </div>
                    <CardTitle className="text-xl text-gray-800">{game.title}</CardTitle>
                    <CardDescription className="text-blue-600/70">{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600/70 flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Score:
                      </span>
                      <span className="font-semibold text-gray-800">{scores[game.id]}</span>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" 
                      onClick={() => {
                        setActiveGame(game.id);
                        if (game.id === 'memory') initializeMemoryGame();
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {games.find(g => g.id === activeGame)?.title}
                </h2>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveGame(null)}
                  className="border-blue-200 hover:bg-blue-50"
                >
                  Back to Games
                </Button>
              </div>
              
              <Card className="border-blue-200/50 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  {activeGame === 'memory' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600">Moves: {moves}</span>
                        <Button onClick={initializeMemoryGame} variant="outline" size="sm">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          New Game
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        {memoryCards.map(card => (
                          <Card
                            key={card.id}
                            className={`aspect-square cursor-pointer transition-all duration-300 ${
                              card.isFlipped || card.isMatched 
                                ? "bg-blue-100 border-blue-300" 
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                            onClick={() => handleMemoryCardClick(card.id)}
                          >
                            <CardContent className="p-0 h-full flex items-center justify-center text-2xl">
                              {card.isFlipped || card.isMatched ? card.value : "?"}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeGame === 'breathing' && (
                    <div className="text-center space-y-6">
                      <div className={`w-32 h-32 mx-auto rounded-full border-4 transition-all duration-1000 flex items-center justify-center ${
                        breathingActive 
                          ? breathingPhase === 'inhale' 
                            ? 'border-blue-400 bg-blue-100 scale-110' 
                            : breathingPhase === 'hold'
                            ? 'border-yellow-400 bg-yellow-100 scale-110'
                            : 'border-green-400 bg-green-100 scale-90'
                          : 'border-gray-300 bg-gray-100'
                      }`}>
                        <span className="text-2xl">
                          {breathingActive ? 
                            breathingPhase === 'inhale' ? '↑' : 
                            breathingPhase === 'hold' ? '⏸' : '↓'
                            : '🌬️'
                          }
                        </span>
                      </div>
                      
                      <div>
                        <p className="text-lg font-medium text-gray-800 mb-2">
                          {breathingActive ? 
                            breathingPhase === 'inhale' ? 'Breathe In...' :
                            breathingPhase === 'hold' ? 'Hold...' : 'Breathe Out...'
                            : 'Ready to start breathing exercise?'
                          }
                        </p>
                        <p className="text-blue-600/70">Cycles completed: {breathingCount}/5</p>
                      </div>
                      
                      {!breathingActive && (
                        <Button onClick={startBreathingExercise} className="bg-gradient-to-r from-green-500 to-green-600">
                          Start Exercise
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {activeGame === 'puzzle' && (
                    <div className="text-center space-y-4">
                      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                        {Array.from({length: 9}, (_, i) => (
                          <div 
                            key={i}
                            className={`aspect-square rounded-lg cursor-pointer transition-all duration-300 ${
                              i % 2 === 0 ? 'bg-gradient-to-br from-purple-200 to-purple-300' : 'bg-gradient-to-br from-pink-200 to-pink-300'
                            } hover:scale-105`}
                            onClick={() => {
                              const score = 25;
                              setScores(prev => ({ ...prev, puzzle: prev.puzzle + score }));
                              toast({ title: "Nice!", description: "+25 points" });
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-blue-600/70">Click tiles to create patterns and earn points!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {!activeGame && (
            <Card className="border-blue-200/50 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-blue-600/70">Your wellness game progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(scores).map(([game, score]) => (
                    <div key={game} className="flex justify-between items-center">
                      <span className="text-gray-700 capitalize">{game}</span>
                      <span className="font-semibold text-blue-600">{score} pts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;
