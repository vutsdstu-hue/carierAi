import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/auth/api";
import { useAuth, type Role } from "@/auth/AuthContext";
import { Trash2 } from "lucide-react";

type JobAppRow = {
  id: string;
  jobId: string;
  company: string;
  position: string;
  status: "Отклик отправлен" | "В процессе" | "Получен ответ" | "Отклонен";
  date: string;
  user: { id: string; name: string; email: string };
};

const statuses: JobAppRow["status"][] = ["Отклик отправлен", "В процессе", "Получен ответ", "Отклонен"];

const statusBadgeClass = (s: JobAppRow["status"]) => {
  if (s === "Получен ответ") return "bg-success text-white";
  if (s === "В процессе") return "bg-muted";
  if (s === "Отклонен") return "bg-destructive text-white";
  return "";
};

export function ModeratorPanel() {
  const { user } = useAuth();
  const [rows, setRows] = useState<JobAppRow[]>([]);
  const [testRows, setTestRows] = useState<
    Array<{
      id: string;
      user: { id: string; name: string; email: string };
      testId: string;
      testTitle: string;
      score: number;
      date: string;
      timeSpent: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"job-applications" | "test-results" | "vacancies-approval">(
    "job-applications"
  );

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<JobAppRow[]>(`/api/moderation/job-applications`);
      setRows(res);
      setTab("job-applications");
    } catch (e) {
      toast({ title: "Ошибка загрузки", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchTestRows = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<
        Array<{
          id: string;
          user: { id: string; name: string; email: string };
          testId: string;
          testTitle: string;
          score: number;
          date: string;
          timeSpent: number;
        }>
      >("/api/moderation/test-results");
      setTestRows(res);
      setTab("test-results");
    } catch (e) {
      toast({ title: "Ошибка загрузки", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "MODERATOR" || user?.role === "ADMIN") void fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const updateStatus = async (id: string, status: JobAppRow["status"]) => {
    try {
      await apiFetch(`/api/moderation/job-applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast({ title: "Статус обновлен", description: `Теперь: ${status}` });
      await fetchRows();
    } catch (e) {
      toast({ title: "Ошибка обновления", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const deleteJobApplication = async (id: string) => {
    if (!window.confirm("Удалить отклик?")) return;
    try {
      await apiFetch(`/api/moderation/job-applications/${id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Отклик удален" });
    } catch (e) {
      toast({ title: "Ошибка удаления", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const deleteTestResult = async (id: string) => {
    if (!window.confirm("Удалить результат теста?")) return;
    try {
      await apiFetch(`/api/moderation/test-results/${id}`, { method: "DELETE" });
      setTestRows((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Результат удален" });
    } catch (e) {
      toast({ title: "Ошибка удаления", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const allowed = useMemo(() => user?.role === "MODERATOR" || user?.role === "ADMIN", [user?.role]);

  const vacancies = useMemo(() => {
    const map = new Map<
      string,
      {
        jobId: string;
        company: string;
        position: string;
        total: number;
        approved: number; // "Получен ответ"
        rejected: number; // "Отклонен"
        inProgress: number; // "В процессе"
        submitted: number; // "Отклик отправлен"
      }
    >();

    for (const r of rows) {
      const key = r.jobId;
      const prev =
        map.get(key) ??
        ({
          jobId: r.jobId,
          company: r.company,
          position: r.position,
          total: 0,
          approved: 0,
          rejected: 0,
          inProgress: 0,
          submitted: 0,
        } as const);

      const next = {
        ...prev,
        company: prev.company || r.company,
        position: prev.position || r.position,
        total: prev.total + 1,
        approved: prev.approved + (r.status === "Получен ответ" ? 1 : 0),
        rejected: prev.rejected + (r.status === "Отклонен" ? 1 : 0),
        inProgress: prev.inProgress + (r.status === "В процессе" ? 1 : 0),
        submitted: prev.submitted + (r.status === "Отклик отправлен" ? 1 : 0),
      };
      map.set(key, next);
    }

    return [...map.values()];
  }, [rows]);

  const approveOrRejectVacancy = async (jobId: string, status: JobAppRow["status"]) => {
    const label = status === "Получен ответ" ? "одобрить" : "отклонить";
    if (!window.confirm(`Вакансию ${jobId}: ${label} все отклики?`)) return;

    try {
      await apiFetch(`/api/moderation/job-applications/by-job/${encodeURIComponent(jobId)}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast({ title: "Готово", description: `Статус для вакансии ${jobId}: ${status}` });
      await fetchRows();
    } catch (e) {
      toast({ title: "Ошибка", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  if (!allowed) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Модератор</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">Доступ запрещен. Требуется роль MODERATOR.</CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Панель модерации</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Управление откликами на вакансии.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (tab === "job-applications") void fetchRows();
                else void fetchTestRows();
              }}
              disabled={loading}
            >
              Обновить
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs
              value={tab}
              onValueChange={(v) => {
                const next =
                  v === "test-results"
                    ? "test-results"
                    : v === "vacancies-approval"
                      ? "vacancies-approval"
                      : "job-applications";
                setTab(next);
                if (next === "test-results" && testRows.length === 0) void fetchTestRows();
                if (next === "vacancies-approval" && rows.length === 0) void fetchRows();
              }}
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="job-applications">Отклики</TabsTrigger>
                <TabsTrigger value="test-results">Результаты тестов</TabsTrigger>
                <TabsTrigger value="vacancies-approval">Вакансии (одобрение)</TabsTrigger>
              </TabsList>

              <TabsContent value="job-applications">
                {loading ? (
                  <div className="text-muted-foreground">Загрузка...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-left">
                          <th className="py-2 border-b px-3">Пользователь</th>
                          <th className="py-2 border-b px-3">Вакансия</th>
                          <th className="py-2 border-b px-3">Статус</th>
                          <th className="py-2 border-b px-3">Дата</th>
                          <th className="py-2 border-b px-3">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.id} className="border-b">
                            <td className="py-3 px-3">
                              <div className="font-medium">{r.user.name}</div>
                              <div className="text-xs text-muted-foreground">{r.user.email}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-medium">{r.position}</div>
                              <div className="text-xs text-muted-foreground">{r.company}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                <Badge className={statusBadgeClass(r.status)} variant="secondary">
                                  {r.status}
                                </Badge>
                                <Select
                                  value={r.status}
                                  onValueChange={(v) => void updateStatus(r.id, v as JobAppRow["status"])}
                                >
                                  <SelectTrigger className="w-[220px]">
                                    <SelectValue placeholder="Выберите статус" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {statuses.map((s) => (
                                      <SelectItem key={s} value={s}>
                                        {s}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-muted-foreground">{r.date}</td>
                            <td className="py-3 px-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Удалить отклик"
                                onClick={() => void deleteJobApplication(r.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {rows.length === 0 && (
                          <tr>
                            <td className="py-5 px-3 text-muted-foreground" colSpan={5}>
                              Нет откликов для модерации.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="test-results">
                {loading ? (
                  <div className="text-muted-foreground">Загрузка...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-left">
                          <th className="py-2 border-b px-3">Пользователь</th>
                          <th className="py-2 border-b px-3">Тест</th>
                          <th className="py-2 border-b px-3">Баллы</th>
                          <th className="py-2 border-b px-3">Дата</th>
                          <th className="py-2 border-b px-3">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testRows.map((r) => (
                          <tr key={r.id} className="border-b">
                            <td className="py-3 px-3">
                              <div className="font-medium">{r.user.name}</div>
                              <div className="text-xs text-muted-foreground">{r.user.email}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-medium">{r.testTitle}</div>
                              <div className="text-xs text-muted-foreground">{r.testId}</div>
                            </td>
                            <td className="py-3 px-3">
                              <Badge variant="secondary">{r.score}%</Badge>
                            </td>
                            <td className="py-3 px-3 text-muted-foreground">{r.date}</td>
                            <td className="py-3 px-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Удалить тест"
                                onClick={() => void deleteTestResult(r.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {testRows.length === 0 && (
                          <tr>
                            <td className="py-5 px-3 text-muted-foreground" colSpan={5}>
                              Нет результатов тестов.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="vacancies-approval">
                {loading ? (
                  <div className="text-muted-foreground">Загрузка...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-left">
                          <th className="py-2 border-b px-3">Компания</th>
                          <th className="py-2 border-b px-3">Позиция</th>
                          <th className="py-2 border-b px-3">Job ID</th>
                          <th className="py-2 border-b px-3">Всего</th>
                          <th className="py-2 border-b px-3">Одобрено</th>
                          <th className="py-2 border-b px-3">Отклонено</th>
                          <th className="py-2 border-b px-3">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vacancies.length === 0 ? (
                          <tr>
                            <td className="py-5 px-3 text-muted-foreground" colSpan={7}>
                              Нет данных для одобрения вакансий.
                            </td>
                          </tr>
                        ) : (
                          vacancies.map((v) => (
                            <tr key={v.jobId} className="border-b">
                              <td className="py-3 px-3">
                                <div className="font-medium">{v.company}</div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-medium">{v.position}</div>
                              </td>
                              <td className="py-3 px-3 text-muted-foreground">{v.jobId}</td>
                              <td className="py-3 px-3">{v.total}</td>
                              <td className="py-3 px-3">{v.approved}</td>
                              <td className="py-3 px-3">{v.rejected}</td>
                              <td className="py-3 px-3">
                                <div className="flex gap-2">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => void approveOrRejectVacancy(v.jobId, "Получен ответ")}
                                  >
                                    Одобрить
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => void approveOrRejectVacancy(v.jobId, "Отклонен")}
                                  >
                                    Отклонить
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

