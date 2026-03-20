import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Zap, Target, Users } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const features = [
    {
      icon: Zap,
      title: "ИИ-подбор вакансий",
      description: "Умный алгоритм найдет идеальную работу для ваших навыков"
    },
    {
      icon: Target,
      title: "Персональные тесты",
      description: "Оцените свои знания и получите рекомендации по развитию"
    },
    {
      icon: Users,
      title: "HR-консультации",
      description: "Получите советы экспертов по карьерному росту"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-16">
        {/* Main Hero Content */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Найдите свою
            <span className="block bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              IT-карьеру мечты
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            ИИ-сервис для поиска вакансий, профессионального тестирования 
            и персональных рекомендаций по развитию карьеры в IT
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="p-2 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="flex items-center space-x-2">
                  <Search className="text-muted-foreground ml-4" size={20} />
                  <Input
                    placeholder="Введите желаемую позицию: Frontend, Backend, DevOps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent text-lg focus-visible:ring-0"
                  />
                  <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-8">
                    Найти
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5000+</div>
              <div className="text-muted-foreground">Активных вакансий</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">98%</div>
              <div className="text-muted-foreground">Точность ИИ-подбора</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-success mb-2">1200+</div>
              <div className="text-muted-foreground">Успешных трудоустройств</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="text-primary" size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div className="text-center mt-16">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-8 py-3">
              Начать поиск работы
            </Button>
            <Button size="lg" variant="outline" className="font-semibold px-8 py-3">
              Пройти тестирование
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};