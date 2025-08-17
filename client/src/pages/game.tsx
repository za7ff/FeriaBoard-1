import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Star } from "lucide-react";

const choices = ["rock", "paper", "scissors"] as const;
type Choice = typeof choices[number];

const getWinner = (playerChoice: Choice, computerChoice: Choice): "player" | "computer" | "tie" => {
  if (playerChoice === computerChoice) return "tie";
  
  const random = Math.random();
  
  // 65% chance for Feria to win, 35% for player
  if (random < 0.65) {
    return "computer";
  } else {
    return "player";
  }
};

const choiceEmojis = {
  rock: "🗿",
  paper: "📄", 
  scissors: "✂️"
};

export default function Game() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<string>("");
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [finalMessage, setFinalMessage] = useState("");

  const playGame = (choice: Choice) => {
    if (isPlaying || gameOver) return;
    
    setIsPlaying(true);
    setPlayerChoice(choice);
    setShowResult(false);
    
    // Animate computer choice
    let counter = 0;
    const interval = setInterval(() => {
      setComputerChoice(choices[Math.floor(Math.random() * choices.length)]);
      counter++;
      
      if (counter > 10) {
        clearInterval(interval);
        const finalComputerChoice = choices[Math.floor(Math.random() * choices.length)];
        setComputerChoice(finalComputerChoice);
        
        const winner = getWinner(choice, finalComputerChoice);
        
        setTimeout(() => {
          let newPlayerScore = playerScore;
          let newComputerScore = computerScore;
          
          if (winner === "player") {
            setResult("فزت! 🎉");
            newPlayerScore = playerScore + 1;
            setPlayerScore(newPlayerScore);
          } else if (winner === "computer") {
            setResult("خسرت يا هطف فزت انا ههههههه");
            newComputerScore = computerScore + 1;
            setComputerScore(newComputerScore);
          } else {
            setResult("تعادل");
          }
          
          const newAttemptsLeft = attemptsLeft - 1;
          setAttemptsLeft(newAttemptsLeft);
          
          if (newAttemptsLeft === 0) {
            setGameOver(true);
            if (newPlayerScore > newComputerScore) {
              setFinalMessage("🎉 مبروك! أنت الفائز!");
            } else if (newComputerScore > newPlayerScore) {
              setFinalMessage("برا ي هطففففففف ههههههههههههههههههه Ezzzzzzzzzzzz");
            } else {
              setFinalMessage("تعادل قهررر");
            }
          }
          
          setShowResult(true);
          setIsPlaying(false);
        }, 500);
      }
    }, 100);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult("");
    setPlayerScore(0);
    setComputerScore(0);
    setShowResult(false);
    setIsPlaying(false);
    setAttemptsLeft(5);
    setGameOver(false);
    setFinalMessage("");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="text-white hover:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة للرئيسية
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-white/20 text-white">
              <Trophy className="w-4 h-4 mr-1" />
              أنت: {playerScore}
            </Badge>
            <Badge variant="outline" className="border-white/20 text-white">
              <Star className="w-4 h-4 mr-1" />
              Feria: {computerScore}
            </Badge>
            <Badge variant="outline" className="border-orange-500/20 text-orange-400">
              المحاولات المتبقية: {attemptsLeft}
            </Badge>
          </div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mt-[22px] mb-[22px] pt-[10px] pb-[10px]">
            حجر ورقة مقص
          </h1>
          <p className="text-gray-400 text-lg">1vs1</p>
        </div>

        {/* Game Area */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Player Side */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-white">أنت</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center text-4xl">
                {playerChoice ? choiceEmojis[playerChoice] : "🤔"}
              </div>
              <p className="text-gray-400">
                {playerChoice ? `اخترت ${playerChoice === 'rock' ? 'حجر' : playerChoice === 'paper' ? 'ورقة' : 'مقص'}` : "اختار"}
              </p>
            </CardContent>
          </Card>

          {/* VS Section */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-4">VS</div>
              {showResult && !gameOver && (
                <div className="text-lg font-semibold text-center animate-bounce">
                  {result}
                </div>
              )}
              {gameOver && (
                <div className="text-xl font-bold text-center animate-pulse text-yellow-400">
                  {finalMessage}
                </div>
              )}
            </div>
          </div>

          {/* Computer Side */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Feria</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://cdn.discordapp.com/avatars/700928520716681237/adc96beeec6bdc6824d9584607682124.webp"
                  alt="Feria"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-gray-400">
                {computerChoice ? `اختار ${computerChoice === 'rock' ? 'حجر' : computerChoice === 'paper' ? 'ورقة' : 'مقص'}` : "يفكر..."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Game Controls */}
        <div className="text-center">
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
            {choices.map((choice) => (
              <Button
                key={choice}
                onClick={() => playGame(choice)}
                disabled={isPlaying || gameOver}
                className="h-20 text-4xl bg-gray-800 hover:bg-gray-700 border border-gray-600 disabled:opacity-50"
              >
                {choiceEmojis[choice]}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={resetGame}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >إعادة اللعبة</Button>
          </div>
        </div>

        
      </div>
    </div>
  );
}