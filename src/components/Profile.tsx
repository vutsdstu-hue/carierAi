import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar,
  Award,
  TrendingUp,
  Target,
  BookOpen,
  Star,
  Edit,
  Download,
  Eye,
  Trash2
} from "lucide-react";
import { ProfileEdit } from "./ProfileEdit";
import { useAuth } from "@/auth/AuthContext";
import { apiFetch } from "@/auth/api";
import type { JobApplication, Skill, TestResult, User as UserType } from "@/types";
import { toast } from "@/hooks/use-toast";

export const Profile = ({ onRequireAuth }: { onRequireAuth?: () => void }) => {
  const { user, loading: authLoading, refreshMe } = useAuth();

  const [userData, setUserData] = useState<UserType | null>(null);
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);

  const [recommendations, setRecommendations] = useState<string[]>([
    "Изучите TypeScript более глубоко - это повысит ваши шансы на Senior позицию",
    "Рассмотрите изучение Next.js для fullstack разработки",
    "Пройдите тест по системному дизайну для роста до Lead позиции",
  ]);
  const [moreRecsLoading, setMoreRecsLoading] = useState(false);

  const fetchAll = async () => {
    if (!user) return;
    const [profileRes, testsRes, appsRes] = await Promise.all([
      apiFetch<{ user: UserType; skills: Skill[] }>("/api/profile"),
      apiFetch<TestResult[]>("/api/tests"),
      apiFetch<JobApplication[]>("/api/job-applications"),
    ]);
    setUserData(profileRes.user);
    setUserSkills(profileRes.skills);
    setTestResults(testsRes);
    setJobApplications(appsRes);
  };

  useEffect(() => {
    if (!user) return;
    void fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSaveProfile = async (newUserData: UserType, newSkills: Skill[]) => {
    await apiFetch("/api/profile", {
      method: "PUT",
      body: JSON.stringify({ user: newUserData, skills: newSkills }),
    });
    await refreshMe();
    await fetchAll();
    setIsEditing(false);
  };

  const handleDeleteTest = async (testId: string) => {
    if (!window.confirm("Удалить результат теста?")) return;
    try {
      await apiFetch(`/api/tests/${encodeURIComponent(testId)}`, { method: "DELETE" });
      setTestResults((prev) => prev.filter((t) => t.testId !== testId));
      toast({ title: "Тест удален" });
    } catch (e) {
      toast({ title: "Ошибка удаления", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const handleDeleteJobApplication = async (jobId: string) => {
    if (!window.confirm("Удалить отклик на вакансию?")) return;
    try {
      await apiFetch(`/api/job-applications/${encodeURIComponent(jobId)}`, { method: "DELETE" });
      setJobApplications((prev) => prev.filter((a) => a.jobId !== jobId));
      toast({ title: "Отклик удален" });
    } catch (e) {
      toast({ title: "Ошибка удаления", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const achievements = [
    { name: "JavaScript Master", description: "Сдал продвинутый тест по JavaScript", icon: "🏆", date: "15.03.2024" },
    { name: "React Expert", description: "100% правильных ответов в тесте React", icon: "⭐", date: "10.03.2024" },
    { name: "First Steps", description: "Прошел первый тест на платформе", icon: "🎯", date: "05.03.2024" }
  ];

  const generateMoreRecommendations = () => {
    const skills = new Set(userSkills.map((s) => s.name.toLowerCase()));
    const recs: string[] = [];

    if (!skills.has("docker")) recs.push("Добавьте Docker в стек: контейнеризация часто требуется даже на junior/middle позициях.");
    if (!skills.has("sql") && !skills.has("postgresql")) recs.push("Подтяните SQL и PostgreSQL: это ускорит рост до fullstack/lead уровней.");
    if (!skills.has("testing") && !skills.has("jest") && !skills.has("vitest")) recs.push("Прокачайте тестирование (unit/integration): это повысит качество и доверие к вашим фичам.");

    const lastTest = testResults[0];
    if (lastTest && lastTest.score < 70) {
      recs.push(`Пересдайте тест «${lastTest.testTitle}» после повторения темы — цель: 80%+.`);
    } else if (testResults.length === 0) {
      recs.push("Пройдите 1-2 теста по вашей специализации и сохраните результаты в профиле — это усилит резюме.");
    }

    const inProgressApps = jobApplications.filter((a) => a.status === "В процессе").length;
    if (inProgressApps > 0) {
      recs.push("Сделайте follow-up по откликам «В процессе»: короткое письмо/сообщение повышает шанс ответа.");
    }

    // remove duplicates and already shown
    const existing = new Set(recommendations);
    return recs.filter((r) => !existing.has(r));
  };

  const handleMoreRecommendations = async () => {
    setMoreRecsLoading(true);
    try {
      const more = generateMoreRecommendations();
      if (more.length === 0) {
        toast({ title: "Рекомендации", description: "Пока нет новых рекомендаций — вы уже многое закрыли." });
        return;
      }
      // add at most 3 at a time for UX
      setRecommendations((prev) => [...prev, ...more.slice(0, 3)]);
    } finally {
      setMoreRecsLoading(false);
    }
  };

  const downloadResume = () => {
    if (!userData) return;

    const lines: string[] = [];
    lines.push(`# Резюме: ${userData.name}`);
    lines.push("");
    lines.push(`- **Должность**: ${userData.position}`);
    lines.push(`- **Локация**: ${userData.location}`);
    lines.push(`- **Email**: ${userData.email}`);
    lines.push(`- **Уровень**: ${userData.level}`);
    lines.push(`- **Опыт**: ${userData.experience}`);
    lines.push(`- **Дата регистрации**: ${userData.joinDate}`);
    lines.push("");

    lines.push("## Навыки");
    if (userSkills.length === 0) {
      lines.push("- —");
    } else {
      for (const s of userSkills) {
        lines.push(`- **${s.name}** (${s.category}) — ${s.level}%`);
      }
    }
    lines.push("");

    lines.push("## Результаты тестов");
    if (testResults.length === 0) {
      lines.push("- —");
    } else {
      for (const t of testResults) {
        lines.push(`- **${t.testTitle}** — ${t.score}% (${t.date}), время: ${t.timeSpent} мин`);
      }
    }
    lines.push("");

    lines.push("## Отклики на вакансии");
    if (jobApplications.length === 0) {
      lines.push("- —");
    } else {
      for (const a of jobApplications) {
        lines.push(`- **${a.position}** — ${a.company} — ${a.status} (${a.date}), jobId: \`${a.jobId}\``);
      }
    }
    lines.push("");

    lines.push("## Рекомендации");
    for (const r of recommendations) lines.push(`- ${r}`);
    lines.push("");

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = userData.name.replace(/[^\p{L}\p{N}\s_-]+/gu, "").trim().replace(/\s+/g, "-") || "resume";
    a.href = url;
    a.download = `resume-${safeName}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background py-8 text-center text-muted-foreground">Загрузка...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Профиль</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Чтобы просматривать и сохранять данные, выполните вход.
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

  if (isEditing) {
    if (!userData) return null;
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <ProfileEdit 
            userData={userData}
            userSkills={userSkills}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  if (!userData) {
    return <div className="min-h-screen bg-background py-8 text-center text-muted-foreground">Загрузка профиля...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                  {userData.avatar}
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
                      <p className="text-lg text-muted-foreground mb-2">{userData.position}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          {userData.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {userData.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          Присоединился: {userData.joinDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 lg:mt-0">
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit size={16} className="mr-2" />
                        Редактировать
                      </Button>
                      <Button className="bg-gradient-to-r from-primary to-accent" onClick={downloadResume}>
                        <Download size={16} className="mr-2" />
                        Скачать резюме
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge className="bg-gradient-to-r from-success to-accent text-white">
                      {userData.level} уровень
                    </Badge>
                    <Badge variant="secondary">
                      {userData.experience} опыта
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  Навыки и компетенции
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userSkills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{skill.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {skill.category}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen size={20} />
                  Недавние тесты
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.slice(0, 3).map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <h4 className="font-medium">{test.testTitle}</h4>
                        <p className="text-sm text-muted-foreground">{test.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{test.score}%</div>
                        <Badge 
                          variant={test.score >= 90 ? "default" : test.score >= 70 ? "secondary" : "destructive"}
                          className={test.score >= 90 ? "bg-success" : ""}
                        >
                          {test.score >= 90 ? 'Отлично' : test.score >= 70 ? 'Хорошо' : 'Плохо'}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void handleDeleteTest(test.testId)}
                        aria-label="Удалить тест"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                  {testResults.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Вы еще не проходили тесты. Начните с раздела "Тестирование"!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} />
                  Отклики на вакансии
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobApplications.map((app, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <h4 className="font-medium">{app.position}</h4>
                        <p className="text-sm text-muted-foreground">{app.company} • {app.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            app.status === "Получен ответ" ? "default" :
                            app.status === "В процессе" ? "secondary" :
                            "outline"
                          }
                          className={app.status === "Получен ответ" ? "bg-success" : ""}
                        >
                          {app.status}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedApplication(app)} aria-label="Подробнее об отклике">
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void handleDeleteJobApplication(app.jobId)}
                          aria-label="Удалить отклик"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {jobApplications.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      У вас пока нет откликов. Найдите подходящие вакансии в разделе "Вакансии"!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award size={20} />
                  Достижения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        <p className="text-xs text-muted-foreground">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star size={20} />
                  ИИ Рекомендации
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                      <p className="text-sm leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-gradient-to-r from-primary to-accent" onClick={() => void handleMoreRecommendations()} disabled={moreRecsLoading}>
                  Получить больше рекомендаций
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="sm:max-w-[680px]">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle>Отклик на вакансию</DialogTitle>
                <DialogDescription>Детали вашего отклика.</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Позиция</div>
                  <div className="font-medium">{selectedApplication.position}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Компания</div>
                    <div className="font-medium">{selectedApplication.company}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Дата</div>
                    <div className="font-medium">{selectedApplication.date}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Статус</div>
                    <Badge variant="secondary">{selectedApplication.status}</Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Job ID</div>
                    <div className="font-mono text-sm">{selectedApplication.jobId}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                    Закрыть
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      void handleDeleteJobApplication(selectedApplication.jobId);
                      setSelectedApplication(null);
                    }}
                  >
                    Удалить отклик
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};