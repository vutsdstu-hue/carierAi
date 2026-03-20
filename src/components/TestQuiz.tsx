import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  ArrowRight,
  Trophy,
  RotateCcw
} from "lucide-react";
import { Test, TestResult } from "@/types";
import { toast } from "@/hooks/use-toast";

interface TestQuizProps {
  test: Test;
  onComplete: (result: TestResult) => void;
  onBack: () => void;
}

export const TestQuiz = ({ test, onComplete, onBack }: TestQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(test.questions.length).fill(-1));
  const [timeLeft, setTimeLeft] = useState(test.timeLimit * 60); // Convert to seconds
  const [showResults, setShowResults] = useState(false);
  const [testStartTime] = useState(Date.now());

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 && !showResults) {
      handleFinishTest();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    test.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / test.questions.length) * 100);
  };

  const handleFinishTest = () => {
    const score = calculateScore();
    const timeSpent = Math.round((Date.now() - testStartTime) / 1000 / 60); // in minutes
    
    const result: TestResult = {
      testId: test.id,
      testTitle: test.title,
      score,
      date: new Date().toLocaleDateString('ru-RU'),
      answers: selectedAnswers,
      timeSpent
    };

    // Show toast
    toast({
      title: "Тест завершен!",
      description: `Ваш результат: ${score}%`,
    });

    setShowResults(true);
    onComplete(result);
  };

  const handleRetakeTest = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(test.questions.length).fill(-1));
    setTimeLeft(test.timeLimit * 60);
    setShowResults(false);
  };

  if (showResults) {
    const score = calculateScore();
    const correctAnswers = test.questions.filter((question, index) => 
      selectedAnswers[index] === question.correctAnswer
    ).length;

    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-success to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="text-white" size={40} />
          </div>
          <CardTitle className="text-3xl mb-2">Тест завершен!</CardTitle>
          <Badge 
            className={`text-lg px-4 py-2 ${
              score >= 90 ? 'bg-success' : 
              score >= 70 ? 'bg-warning' : 
              'bg-destructive'
            }`}
          >
            {score}%
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-8">
            <p className="text-xl mb-4">
              Правильных ответов: {correctAnswers} из {test.questions.length}
            </p>
            <p className="text-muted-foreground">
              {score >= 90 ? 'Отличный результат! 🏆' :
               score >= 70 ? 'Хороший результат! 👍' :
               'Есть над чем поработать 📚'}
            </p>
          </div>

          {/* Question Review */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-semibold mb-4">Разбор вопросов:</h3>
            {test.questions.map((question, index) => {
              const isCorrect = selectedAnswers[index] === question.correctAnswer;
              const userAnswer = selectedAnswers[index];
              
              return (
                <Card key={index} className={`border-l-4 ${isCorrect ? 'border-l-success' : 'border-l-destructive'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      {isCorrect ? (
                        <CheckCircle className="text-success mt-0.5" size={20} />
                      ) : (
                        <XCircle className="text-destructive mt-0.5" size={20} />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-2">{question.question}</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            Ваш ответ: <span className={isCorrect ? 'text-success' : 'text-destructive'}>
                              {userAnswer >= 0 ? question.options[userAnswer] : 'Не отвечено'}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-muted-foreground">
                              Правильный ответ: <span className="text-success">
                                {question.options[question.correctAnswer]}
                              </span>
                            </p>
                          )}
                          {question.explanation && (
                            <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded">
                              💡 {question.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleRetakeTest}>
              <RotateCcw size={16} className="mr-2" />
              Пройти заново
            </Button>
            <Button onClick={onBack}>
              Вернуться к тестам
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQ = test.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;
  const answeredCount = selectedAnswers.filter(answer => answer !== -1).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft size={16} className="mr-2" />
              Назад к тестам
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} />
                <span className={timeLeft <= 300 ? 'text-destructive font-semibold' : ''}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Badge variant="secondary">
                {answeredCount}/{test.questions.length} отвечено
              </Badge>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">{test.title}</h2>
              <span className="text-sm text-muted-foreground">
                {currentQuestion + 1} из {test.questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Вопрос {currentQuestion + 1}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-lg leading-relaxed whitespace-pre-line">
              {currentQ.question}
            </p>
          </div>

          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border transition-all hover:shadow-md ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft size={16} className="mr-2" />
              Предыдущий
            </Button>

            <div className="flex gap-2">
              {currentQuestion === test.questions.length - 1 ? (
                <Button 
                  onClick={handleFinishTest}
                  className="bg-gradient-to-r from-success to-accent"
                  disabled={answeredCount === 0}
                >
                  <Trophy size={16} className="mr-2" />
                  Завершить тест
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  disabled={currentQuestion === test.questions.length - 1}
                >
                  Следующий
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};