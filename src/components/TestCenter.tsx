import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Code, 
  Database, 
  Server, 
  Smartphone,
  Brain,
  Award,
  Clock,
  Users,
  TrendingUp,
  Play
} from "lucide-react";
import { TestQuiz } from "./TestQuiz";
import { testCategories, tests } from "@/data/testData";
import { Test, TestResult } from "@/types";
import { useAuth } from "@/auth/AuthContext";
import { apiFetch } from "@/auth/api";

export const TestCenter = ({ onRequireAuth }: { onRequireAuth?: () => void }) => {
  const { user, loading: authLoading } = useAuth();
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  useEffect(() => {
    if (!user) {
      setTestResults([]);
      return;
    }
    if (authLoading) return;
    void apiFetch<TestResult[]>("/api/tests")
      .then(setTestResults)
      .catch(() => setTestResults([]));
  }, [user?.id, authLoading]);

  const iconMap = {
    Code,
    Server,
    Database,
    Smartphone,
    TrendingUp,
    Brain
  };

  const handleTestComplete = async (result: TestResult) => {
    const saved = await apiFetch<TestResult>("/api/tests/results", {
      method: "POST",
      body: JSON.stringify(result),
    });
    const updatedResults = [...testResults.filter((r) => r.testId !== saved.testId), saved];
    setTestResults(updatedResults);
    setSelectedTest(null);
  };

  const handleBackToTests = () => {
    setSelectedTest(null);
  };

  const userStats = {
    testsCompleted: testResults.length,
    avgScore: testResults.length > 0 
      ? Math.round(testResults.reduce((sum, result) => sum + result.score, 0) / testResults.length)
      : 0,
    certificates: testResults.filter(r => r.score >= 90).length,
    ranking: testResults.length > 0 ? "Топ 15%" : "Новичок"
  };

  // If a test is selected, show the quiz
  if (selectedTest) {
    if (!user) {
      return null;
    }
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <TestQuiz 
            test={selectedTest}
            onComplete={handleTestComplete}
            onBack={handleBackToTests}
          />
        </div>
      </div>
    );
  }

  if (authLoading) {
    return <div className="min-h-screen bg-background py-8 text-center text-muted-foreground">Загрузка...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Тестирование</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Чтобы сохранять результаты тестов в базе данных, выполните вход.
              <div className="mt-4">
                <Button className="bg-gradient-to-r from-primary to-accent" onClick={onRequireAuth}>
                  Войти / Регистрация
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Центр тестирования
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> навыков</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Проверьте свои знания и получите персональные рекомендации по развитию
          </p>

          {/* User Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">{userStats.testsCompleted}</div>
                <div className="text-sm text-muted-foreground">Тестов пройдено</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success mb-1">{userStats.avgScore}%</div>
                <div className="text-sm text-muted-foreground">Средний балл</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent mb-1">{userStats.certificates}</div>
                <div className="text-sm text-muted-foreground">Сертификатов</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning mb-1">{userStats.ranking}</div>
                <div className="text-sm text-muted-foreground">Рейтинг</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Выберите направление</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testCategories.map((category) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Code;
              const testsCount = category.tests.length;
              const avgTime = testsCount > 0 
                ? Math.round(category.tests.reduce((sum, test) => sum + test.timeLimit, 0) / testsCount)
                : 25;
              
              return (
                <Card 
                  key={category.id} 
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                  onClick={() => testsCount > 0 && setSelectedTest(category.tests[0])}
                >
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="text-white" size={24} />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      {category.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Тестов:</span>
                        <span className="font-medium">{testsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Время:</span>
                        <span className="font-medium">{avgTime} мин</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Уровень:</span>
                        <span className="font-medium">Начальный - Эксперт</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4 bg-gradient-to-r from-primary to-accent"
                      disabled={testsCount === 0}
                    >
                      <Play size={16} className="mr-2" />
                      {testsCount > 0 ? 'Начать тестирование' : 'Скоро доступно'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Available Tests */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Доступные тесты</h2>
          <div className="grid grid-cols-1 gap-4">
            {tests.map((test) => {
              const userResult = testResults.find(r => r.testId === test.id);
              
              return (
                <Card key={test.id} className="hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{test.title}</h3>
                          <Badge variant="secondary">{test.category}</Badge>
                          <Badge 
                            variant="outline"
                            className={
                              test.difficulty === "Начальный" ? "border-green-500 text-green-600" :
                              test.difficulty === "Средний" ? "border-yellow-500 text-yellow-600" :
                              test.difficulty === "Продвинутый" ? "border-orange-500 text-orange-600" :
                              "border-red-500 text-red-600"
                            }
                          >
                            {test.difficulty}
                          </Badge>
                          {userResult && (
                            <Badge className="bg-success text-white">
                              Пройден: {userResult.score}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Award size={14} />
                            {test.questions.length} вопросов
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {test.timeLimit} мин
                          </div>
                          {userResult && (
                            <div className="flex items-center gap-1">
                              <Users size={14} />
                              Последний результат: {userResult.date}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        className="bg-gradient-to-r from-primary to-accent"
                        onClick={() => setSelectedTest(test)}
                      >
                        {userResult ? 'Пройти заново' : 'Пройти тест'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};