import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb,
  Target,
  TrendingUp,
  MessageSquare,
  Sparkles
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
}

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Привет! Я ваш ИИ-консультант по карьере в IT. Помогу найти идеальную работу, подготовиться к собеседованию и составить план развития. О чем хотите поговорить?",
      sender: 'ai',
      timestamp: new Date(),
      suggestions: [
        "Как подготовиться к собеседованию?",
        "Какие навыки изучать в 2024?",
        "Составить план карьерного роста",
        "Оптимизировать резюме"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    {
      title: "Анализ резюме",
      description: "Получите советы по улучшению резюме",
      icon: Target,
      action: "Проанализируй мое резюме и дай рекомендации"
    },
    {
      title: "План развития",
      description: "Составим персональный roadmap",
      icon: TrendingUp,
      action: "Составь план развития для Frontend разработчика"
    },
    {
      title: "Подготовка к собеседованию",
      description: "Практические советы и вопросы",
      icon: Lightbulb,
      action: "Как подготовиться к собеседованию на Senior позицию?"
    }
  ];

  const handleSendMessage = (text: string = inputValue) => {
    if (!text.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        {
          text: "Отличный вопрос! Для подготовки к собеседованию рекомендую:\n\n1. Изучите техническую базу вашей специальности\n2. Подготовьте примеры проектов с объяснением архитектурных решений\n3. Потренируйтесь решать алгоритмические задачи\n4. Изучите компанию и ее продукты\n5. Подготовьте вопросы интервьюеру",
          suggestions: ["Примеры технических вопросов", "Как рассказать о проектах?", "Вопросы про зарплату"]
        },
        {
          text: "Для Frontend разработчика в 2024 году актуальны:\n\n• **Фреймворки**: React, Vue.js, Svelte\n• **TypeScript** - обязательно к изучению\n• **State Management**: Redux Toolkit, Zustand\n• **Сборщики**: Vite, Webpack\n• **Тестирование**: Jest, Testing Library\n• **CSS**: Tailwind CSS, CSS-in-JS\n• **Мобильная разработка**: React Native",
          suggestions: ["План изучения TypeScript", "Проекты для портфолио", "Как изучать эффективно?"]
        },
        {
          text: "Ваш план развития как Frontend разработчика:\n\n**Месяц 1-2**: Углубленное изучение TypeScript\n**Месяц 3-4**: Освоение современных паттернов React\n**Месяц 5-6**: Изучение архитектуры приложений\n**Месяц 7-8**: Практика тестирования\n**Месяц 9-12**: Создание комплексного проекта\n\nКаждый этап включает практические задания и проекты для портфолио.",
          suggestions: ["Детальный план по TypeScript", "Проекты для портфолио", "Ресурсы для изучения"]
        }
      ];

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage: Message = {
        id: messages.length + 2,
        text: randomResponse.text,
        sender: 'ai',
        timestamp: new Date(),
        suggestions: randomResponse.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            ИИ Консультант по
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> карьере</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Получите персональные советы по развитию карьеры в IT
          </p>
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  onClick={() => handleSendMessage(action.action)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="text-primary" size={24} />
                    </div>
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <div className="text-lg">ИИ Карьерный консультант</div>
                <div className="text-sm text-muted-foreground font-normal">Онлайн • Готов помочь</div>
              </div>
            </CardTitle>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground ml-12'
                        : 'bg-muted mr-12'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {message.sender === 'ai' && (
                        <Bot size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      )}
                      {message.sender === 'user' && (
                        <User size={16} className="text-primary-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="whitespace-pre-line">{message.text}</div>
                        <div className={`text-xs mt-2 ${
                          message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Suggestions */}
                {message.sender === 'ai' && message.suggestions && (
                  <div className="flex flex-wrap gap-2 ml-6">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs hover:bg-primary hover:text-primary-foreground"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3 mr-12">
                  <div className="flex items-center gap-2">
                    <Bot size={16} className="text-primary" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Задайте вопрос о карьере в IT..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSendMessage()} 
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-primary to-accent"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};