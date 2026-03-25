import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/auth/api";
import { useAuth, type Role } from "@/auth/AuthContext";
import { Pencil, Trash2 } from "lucide-react";
import type { Job } from "@/types";
import type { JobApplicationLog } from "@/types";

type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: Role;
  location: string;
  avatar: string;
  position: string;
  experience: string;
  level: string;
  joinDate: string;
};

type AdminJobLogRow = JobApplicationLog;

const roleOptions: Role[] = ["USER", "MODERATOR", "ADMIN"];
const tabs = ["users", "jobs", "logs", "tests"] as const;

export function AdminPanel({ onDone }: { onDone?: () => void }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("users");

  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    users: { USER: number; MODERATOR: number; ADMIN: number };
    skillsCount: number;
    testsCount: number;
    jobApplicationsCount: number;
  } | null>(null);

  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [logsLoading, setLogsLoading] = useState(false);
  const [logs, setLogs] = useState<AdminJobLogRow[]>([]);
  const [logJobId, setLogJobId] = useState("");

  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createJobLoading, setCreateJobLoading] = useState(false);
  const [createTestLoading, setCreateTestLoading] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showLogsPanel, setShowLogsPanel] = useState(false);
  const [dialog, setDialog] = useState<
    | null
    | { kind: "createUser" }
    | { kind: "editUser"; userId: string }
    | { kind: "createJob" }
    | { kind: "editJob"; jobId: string }
    | { kind: "createTest" }
    | { kind: "editTest"; testId: string }
    | { kind: "editLog"; logId: string }
  >(null);

  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
    name: "",
    location: "—",
    position: "—",
    experience: "—",
    level: "—",
    joinDate: new Date().toISOString().slice(0, 10),
    role: "USER" as Role,
  });

  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    type: "",
    description: "",
    skills: "",
    postedTime: "",
    aiMatch: "",
  });

  const [testsLoading, setTestsLoading] = useState(false);
  const [testsRows, setTestsRows] = useState<
    Array<{
      id: string;
      title: string;
      category: string;
      difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
      timeLimit: number;
      description: string;
      questions: unknown;
      createdAt: string;
    }>
  >([]);

  const [testForm, setTestForm] = useState({
    id: "",
    title: "",
    category: "",
    difficulty: "BEGINNER" as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT",
    timeLimit: "20",
    description: "",
    questionsJson: `[
  {
    "id": 1,
    "question": "Вопрос...",
    "options": ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"],
    "correctAnswer": 0,
    "explanation": "Пояснение (необязательно)"
  }
]`,
  });

  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [logNoteDraft, setLogNoteDraft] = useState("");

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserAvatarFile, setEditUserAvatarFile] = useState<File | null>(null);
  const [editUserPassword, setEditUserPassword] = useState("");
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    location: "—",
    position: "—",
    experience: "—",
    level: "—",
    joinDate: new Date().toISOString().slice(0, 10),
    role: "USER" as Role,
    avatar: "—",
  });

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<AdminUserRow[]>(`/api/admin/users`);
      setRows(res);
    } catch (e) {
      toast({ title: "Ошибка загрузки", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiFetch<NonNullable<typeof stats>>(`/api/admin/stats`);
      setStats(res);
    } catch (e) {
      toast({ title: "Ошибка загрузки статистики", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await apiFetch<Job[]>(`/api/admin/jobs`);
      setJobs(res);
    } catch (e) {
      toast({ title: "Ошибка загрузки вакансий", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const suffix = logJobId ? `?jobId=${encodeURIComponent(logJobId)}` : "";
      const res = await apiFetch<AdminJobLogRow[]>(`/api/admin/job-application-logs${suffix}`);
      setLogs(res);
    } catch (e) {
      toast({ title: "Ошибка загрузки логов", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchTests = async () => {
    setTestsLoading(true);
    try {
      const res = await apiFetch<typeof testsRows>(`/api/admin/tests`);
      setTestsRows(res);
    } catch (e) {
      toast({ title: "Ошибка загрузки тестов", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setTestsLoading(false);
    }
  };

  const deleteJob = async (id: string) => {
    if (!window.confirm("Удалить вакансию?")) return;
    try {
      await apiFetch(`/api/admin/jobs/${encodeURIComponent(id)}`, { method: "DELETE" });
      toast({ title: "Вакансия удалена" });
      await fetchJobs();
    } catch (e) {
      toast({ title: "Ошибка удаления", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const startEditJob = (j: Job) => {
    setEditingJobId(j.id);
    setDialog({ kind: "editJob", jobId: j.id });
    setJobForm({
      title: j.title,
      company: j.company,
      location: j.location,
      salary: j.salary,
      type: j.type,
      description: j.description,
      skills: j.skills.join(", "),
      postedTime: j.postedTime,
      aiMatch: j.aiMatch != null ? String(j.aiMatch) : "",
    });
  };

  const saveJob = async () => {
    if (!editingJobId) return;
    const skills = jobForm.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!jobForm.title.trim() || !jobForm.company.trim() || !jobForm.location.trim() || skills.length === 0) {
      toast({ title: "Заполните поля", description: "Название, компания, локация и навыки обязательны.", variant: "destructive" });
      return;
    }
    setCreateJobLoading(true);
    try {
      const aiMatch = jobForm.aiMatch.trim() ? Number(jobForm.aiMatch.trim()) : undefined;
      await apiFetch(`/api/admin/jobs/${encodeURIComponent(editingJobId)}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: jobForm.title,
          company: jobForm.company,
          location: jobForm.location,
          salary: jobForm.salary.trim() || "—",
          type: jobForm.type.trim() || "—",
          description: jobForm.description.trim() || "—",
          skills,
          postedTime: jobForm.postedTime.trim() || "—",
          aiMatch: aiMatch !== undefined && Number.isFinite(aiMatch) ? aiMatch : undefined,
        }),
      });
      toast({ title: "Вакансия обновлена" });
      setEditingJobId(null);
      setShowCreateJobForm(false);
      await fetchJobs();
    } catch (e) {
      toast({ title: "Ошибка сохранения", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setCreateJobLoading(false);
    }
  };

  const startEditTest = (t: (typeof testsRows)[number]) => {
    setEditingTestId(t.id);
    setDialog({ kind: "editTest", testId: t.id });
    setTestForm({
      id: t.id,
      title: t.title,
      category: t.category,
      difficulty: t.difficulty,
      timeLimit: String(t.timeLimit),
      description: t.description,
      questionsJson: JSON.stringify(t.questions ?? [], null, 2),
    });
  };

  const saveTest = async () => {
    if (!editingTestId) return;
    const timeLimit = Number(testForm.timeLimit);
    let questions: unknown;
    try {
      questions = JSON.parse(testForm.questionsJson);
    } catch {
      toast({ title: "Неверный JSON", description: "Поле вопросов должно быть валидным JSON-массивом.", variant: "destructive" });
      return;
    }
    setCreateTestLoading(true);
    try {
      await apiFetch(`/api/admin/tests/${encodeURIComponent(editingTestId)}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: testForm.title,
          category: testForm.category,
          difficulty: testForm.difficulty,
          timeLimit,
          description: testForm.description,
          questions,
        }),
      });
      toast({ title: "Тест обновлён" });
      setEditingTestId(null);
      setShowCreateTestForm(false);
      await fetchTests();
    } catch (e) {
      toast({ title: "Ошибка сохранения теста", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setCreateTestLoading(false);
    }
  };

  const deleteLog = async (id: string) => {
    if (!window.confirm("Удалить лог? Это удалит запись истории.")) return;
    try {
      await apiFetch(`/api/admin/job-application-logs/${encodeURIComponent(id)}`, { method: "DELETE" });
      toast({ title: "Лог удалён" });
      await fetchLogs();
    } catch (e) {
      toast({ title: "Ошибка удаления", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const startEditLog = (l: AdminJobLogRow) => {
    setEditingLogId(l.id);
    setDialog({ kind: "editLog", logId: l.id });
    setLogNoteDraft(l.note ?? "");
  };

  const saveLog = async () => {
    if (!editingLogId) return;
    try {
      await apiFetch(`/api/admin/job-application-logs/${encodeURIComponent(editingLogId)}`, {
        method: "PATCH",
        body: JSON.stringify({ note: logNoteDraft }),
      });
      toast({ title: "Лог обновлён" });
      setEditingLogId(null);
      await fetchLogs();
    } catch (e) {
      toast({ title: "Ошибка сохранения", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const hideLog = async (id: string) => {
    try {
      await apiFetch(`/api/admin/job-application-logs/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ hidden: true }),
      });
      toast({ title: "Лог скрыт" });
      await fetchLogs();
    } catch (e) {
      toast({ title: "Ошибка", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const startEditUser = (u: AdminUserRow) => {
    setEditingUserId(u.id);
    setDialog({ kind: "editUser", userId: u.id });
    setEditUserPassword("");
    setEditUserAvatarFile(null);
    setEditUserForm({
      name: u.name,
      location: u.location,
      position: u.position,
      experience: u.experience,
      level: u.level,
      joinDate: u.joinDate,
      role: u.role,
      avatar: u.avatar,
    });
  };

  const saveUser = async () => {
    if (!editingUserId) return;
    if (!editUserForm.name.trim()) {
      toast({ title: "Имя обязательно", variant: "destructive" });
      return;
    }
    const fd = new FormData();
    fd.append("name", editUserForm.name);
    fd.append("location", editUserForm.location.trim() || "—");
    fd.append("position", editUserForm.position.trim() || "—");
    fd.append("experience", editUserForm.experience.trim() || "—");
    fd.append("level", editUserForm.level.trim() || "—");
    fd.append("joinDate", editUserForm.joinDate.trim() || new Date().toISOString().slice(0, 10));
    fd.append("role", editUserForm.role);
    fd.append("avatar", editUserForm.avatar || "—");
    if (editUserPassword.trim()) fd.append("password", editUserPassword.trim());
    if (editUserAvatarFile) fd.append("avatar", editUserAvatarFile);

    try {
      await apiFetch(`/api/admin/users/${encodeURIComponent(editingUserId)}`, { method: "PATCH", body: fd });
      toast({ title: "Пользователь обновлён" });
      setEditingUserId(null);
      await fetchRows();
    } catch (e) {
      toast({ title: "Ошибка сохранения", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") void fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === "ADMIN") void fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    if (activeTab === "jobs") void fetchJobs();
    if (activeTab === "logs" && showLogsPanel) void fetchLogs();
    if (activeTab === "tests") void fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.role, showLogsPanel]);

  const updateRole = async (userId: string, role: Role) => {
    try {
      await apiFetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      toast({ title: "Роль обновлена", description: `Теперь пользователь имеет роль ${role}` });
      await fetchRows();
      onDone?.();
    } catch (e) {
      toast({ title: "Ошибка изменения роли", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("Удалить пользователя?")) return;
    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      toast({ title: "Пользователь удален" });
      await fetchRows();
      await fetchStats();
    } catch (e) {
      toast({ title: "Ошибка удаления", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const createUser = async () => {
    if (!userForm.email.trim() || !userForm.password.trim() || !userForm.name.trim()) {
      toast({ title: "Заполните поля", description: "Имя, email и пароль обязательны.", variant: "destructive" });
      return;
    }

    const locationValue = userForm.location.trim() || "—";
    const positionValue = userForm.position.trim() || "—";
    const experienceValue = userForm.experience.trim() || "—";
    const levelValue = userForm.level.trim() || "—";
    const joinDateValue = userForm.joinDate.trim() || new Date().toISOString().slice(0, 10);

    setCreateUserLoading(true);
    try {
      const fd = new FormData();
      fd.append("email", userForm.email);
      fd.append("password", userForm.password);
      fd.append("name", userForm.name);
      fd.append("location", locationValue);
      fd.append("position", positionValue);
      fd.append("experience", experienceValue);
      fd.append("level", levelValue);
      fd.append("joinDate", joinDateValue);
      fd.append("role", userForm.role);
      if (avatarFile) fd.append("avatar", avatarFile);

      await apiFetch(`/api/admin/users`, {
        method: "POST",
        body: fd,
      });
      toast({ title: "Пользователь создан" });
      setUserForm((p) => ({ ...p, password: "" }));
      setAvatarFile(null);
      setDialog(null);
      await fetchRows();
      await fetchStats();
    } catch (e) {
      toast({ title: "Ошибка создания пользователя", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setCreateUserLoading(false);
    }
  };

  const createJob = async () => {
    if (!jobForm.title.trim() || !jobForm.company.trim() || !jobForm.location.trim()) {
      toast({ title: "Заполните поля", description: "Титул, компания и локация обязательны.", variant: "destructive" });
      return;
    }

    const skills = jobForm.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (skills.length === 0) {
      toast({ title: "Нужны навыки", description: "Укажите хотя бы один навык через запятую.", variant: "destructive" });
      return;
    }

    setCreateJobLoading(true);
    try {
      const aiMatch = jobForm.aiMatch.trim() ? Number(jobForm.aiMatch.trim()) : undefined;
      await apiFetch(`/api/admin/jobs`, {
        method: "POST",
        body: JSON.stringify({
          title: jobForm.title,
          company: jobForm.company,
          location: jobForm.location,
          salary: jobForm.salary.trim() || "—",
          type: jobForm.type.trim() || "—",
          description: jobForm.description.trim() || "—",
          skills,
          postedTime: jobForm.postedTime.trim() || "—",
          aiMatch: aiMatch !== undefined && Number.isFinite(aiMatch) ? aiMatch : undefined,
        }),
      });
      toast({ title: "Вакансия создана" });
      setJobForm({
        title: "",
        company: "",
        location: "",
        salary: "",
        type: "",
        description: "",
        skills: "",
        postedTime: "",
        aiMatch: "",
      });
      await fetchJobs();
      setDialog(null);
      onDone?.();
    } catch (e) {
      toast({ title: "Ошибка создания вакансии", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setCreateJobLoading(false);
    }
  };

  const createTest = async () => {
    if (!testForm.id.trim() || !testForm.title.trim() || !testForm.category.trim() || !testForm.description.trim()) {
      toast({ title: "Заполните поля", description: "ID, название, категория и описание обязательны.", variant: "destructive" });
      return;
    }

    const timeLimit = Number(testForm.timeLimit);
    if (!Number.isFinite(timeLimit) || timeLimit <= 0) {
      toast({ title: "Неверное время", description: "timeLimit должен быть числом > 0.", variant: "destructive" });
      return;
    }

    let questions: unknown;
    try {
      questions = JSON.parse(testForm.questionsJson);
    } catch {
      toast({ title: "Неверный JSON", description: "Поле вопросов должно быть валидным JSON-массивом.", variant: "destructive" });
      return;
    }

    setCreateTestLoading(true);
    try {
      await apiFetch(`/api/admin/tests`, {
        method: "POST",
        body: JSON.stringify({
          id: testForm.id,
          title: testForm.title,
          category: testForm.category,
          difficulty: testForm.difficulty,
          timeLimit,
          description: testForm.description,
          questions,
        }),
      });
      toast({ title: "Тест добавлен" });
      setDialog(null);
      await fetchTests();
      onDone?.();
    } catch (e) {
      toast({ title: "Ошибка добавления теста", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setCreateTestLoading(false);
    }
  };

  const deleteTest = async (id: string) => {
    if (!window.confirm("Удалить тест?")) return;
    try {
      await apiFetch(`/api/admin/tests/${encodeURIComponent(id)}`, { method: "DELETE" });
      toast({ title: "Тест удалён" });
      await fetchTests();
    } catch (e) {
      toast({ title: "Ошибка удаления", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const canUse = !!user && user.role === "ADMIN";

  if (!canUse) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Админ панель</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">Доступ запрещен. Требуется роль ADMIN.</CardContent>
      </Card>
    );
  }

  const jobsCount = useMemo(() => jobs.length, [jobs.length]);
  const testsCount = useMemo(() => testsRows.length, [testsRows.length]);

  const logActionRu = (a: string) => {
    if (a === "CREATED") return "Создано";
    if (a === "UPDATED") return "Обновлено";
    if (a === "STATUS_CHANGED") return "Статус изменён";
    if (a === "DELETED") return "Удалено";
    return a;
  };

  const difficultyRu = (d: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT") => {
    if (d === "BEGINNER") return "Начальный";
    if (d === "INTERMEDIATE") return "Средний";
    if (d === "ADVANCED") return "Продвинутый";
    return "Эксперт";
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Админ панель</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Управление пользователями, вакансиями и логами откликов.</p>
            </div>
            <Button variant="outline" onClick={() => void fetchRows()} disabled={loading}>
              Обновить
            </Button>
          </CardHeader>
          <CardContent>
            {stats && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">USER</div>
                  <div className="text-2xl font-bold">{stats.users.USER}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">MODERATOR</div>
                  <div className="text-2xl font-bold">{stats.users.MODERATOR}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">ADMIN</div>
                  <div className="text-2xl font-bold">{stats.users.ADMIN}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Тесты/Отклики</div>
                  <div className="text-2xl font-bold">
                    {stats.testsCount}/{stats.jobApplicationsCount}
                  </div>
                </div>
              </div>
            )}

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as (typeof tabs)[number])}
            >
              <TabsList className="grid grid-cols-4 w-full mb-6">
                <TabsTrigger value="users">Пользователи</TabsTrigger>
                <TabsTrigger value="jobs">Вакансии ({jobsCount})</TabsTrigger>
                <TabsTrigger value="logs">Логи откликов</TabsTrigger>
                <TabsTrigger value="tests">Тесты ({testsCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                {loading ? (
                  <div className="text-muted-foreground">Загрузка...</div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <Button onClick={() => setDialog({ kind: "createUser" })} className="bg-gradient-to-r from-primary to-accent">
                        Создать пользователя
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="text-left">
                            <th className="py-2 border-b px-3">Пользователь</th>
                            <th className="py-2 border-b px-3">Email</th>
                            <th className="py-2 border-b px-3">Роль</th>
                            <th className="py-2 border-b px-3">Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r) => (
                            <tr key={r.id} className="border-b">
                              <td className="py-3 px-3">
                                <div className="font-medium">{r.name}</div>
                                <div className="text-xs text-muted-foreground">{r.id.slice(0, 8)}...</div>
                              </td>
                              <td className="py-3 px-3">{r.email}</td>
                              <td className="py-3 px-3">
                                <Select value={r.role} onValueChange={(v) => void updateRole(r.id, v as Role)}>
                                  <SelectTrigger className="w-[220px]">
                                    <SelectValue placeholder="Выберите роль" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roleOptions.map((role) => (
                                      <SelectItem key={role} value={role}>
                                        {role}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="icon" aria-label="Редактировать" onClick={() => startEditUser(r)}>
                                    <Pencil size={16} />
                                  </Button>
                                <Button variant="ghost" size="icon" aria-label="Удалить пользователя" onClick={() => void deleteUser(r.id)}>
                                  <Trash2 size={16} />
                                </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {rows.length === 0 && (
                            <tr>
                              <td className="py-5 px-3 text-muted-foreground" colSpan={4}>
                                Пользователи отсутствуют.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="jobs">
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <Button onClick={() => setDialog({ kind: "createJob" })} className="bg-gradient-to-r from-primary to-accent">
                      Создать вакансию
                    </Button>
                  </div>

                  {jobsLoading ? (
                    <div className="text-muted-foreground">Загрузка...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="text-left">
                            <th className="py-2 border-b px-3">ID</th>
                            <th className="py-2 border-b px-3">Название</th>
                            <th className="py-2 border-b px-3">Компания</th>
                            <th className="py-2 border-b px-3">Локация</th>
                            <th className="py-2 border-b px-3">Навыки</th>
                            <th className="py-2 border-b px-3">Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jobs.map((j) => (
                            <tr key={j.id} className="border-b">
                              <td className="py-3 px-3 text-xs text-muted-foreground">{j.id.slice(0, 8)}...</td>
                              <td className="py-3 px-3">{j.title}</td>
                              <td className="py-3 px-3">{j.company}</td>
                              <td className="py-3 px-3">{j.location}</td>
                              <td className="py-3 px-3">
                                {j.skills.slice(0, 4).join(", ")}
                                {j.skills.length > 4 ? "..." : ""}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="icon" aria-label="Редактировать" onClick={() => startEditJob(j)}>
                                    <Pencil size={16} />
                                  </Button>
                                  <Button variant="ghost" size="icon" aria-label="Удалить" onClick={() => void deleteJob(j.id)}>
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {jobs.length === 0 && (
                            <tr>
                              <td className="py-5 px-3 text-muted-foreground" colSpan={6}>
                                Нет вакансий в БД. Создайте первую.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="logs">
                <div className="space-y-4">
                  {!showLogsPanel ? (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          setShowLogsPanel(true);
                          void fetchLogs();
                        }}
                        className="bg-gradient-to-r from-primary to-accent"
                      >
                        Открыть логи откликов
                      </Button>
                    </div>
                  ) : (
                    <Card className="p-4">
                      <div className="flex flex-col md:flex-row gap-3 items-start md:items-end justify-between">
                        <div className="w-full md:max-w-xl">
                          <Label htmlFor="log-jobId">Фильтр по ID вакансии (jobId)</Label>
                          <Input id="log-jobId" value={logJobId} onChange={(e) => setLogJobId(e.target.value)} placeholder="например job-1" />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setLogJobId("");
                              setShowLogsPanel(false);
                            }}
                            disabled={logsLoading}
                          >
                            Скрыть
                          </Button>
                          <Button variant="outline" onClick={() => void setLogJobId("")} disabled={logsLoading}>
                            Очистить
                          </Button>
                          <Button onClick={() => void fetchLogs()} disabled={logsLoading} className="bg-gradient-to-r from-primary to-accent">
                            Обновить
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {logsLoading ? (
                    <div className="text-muted-foreground">Загрузка...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="text-left">
                            <th className="py-2 border-b px-3">Отклик</th>
                            <th className="py-2 border-b px-3">Job ID</th>
                            <th className="py-2 border-b px-3">Заявитель</th>
                            <th className="py-2 border-b px-3">Кто изменил</th>
                            <th className="py-2 border-b px-3">Событие</th>
                            <th className="py-2 border-b px-3">Дата</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.map((l) => (
                            <tr key={l.id} className="border-b">
                              <td className="py-3 px-3 text-xs text-muted-foreground">{l.jobApplicationId.slice(0, 8)}...</td>
                              <td className="py-3 px-3">{l.jobId}</td>
                              <td className="py-3 px-3">
                                <div className="font-medium">{l.applicant.name}</div>
                                <div className="text-xs text-muted-foreground">{l.applicant.email}</div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-medium">{l.actor.name}</div>
                                <div className="text-xs text-muted-foreground">{l.actor.email}</div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-medium">{logActionRu(l.action)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {l.fromStatus ?? "—"} {"→"} {l.toStatus ?? "—"}
                                </div>
                                {editingLogId === l.id ? (
                                  <div className="mt-2">
                                    <Textarea value={logNoteDraft} onChange={(e) => setLogNoteDraft(e.target.value)} placeholder="Заметка (необязательно)" />
                                    <div className="mt-2 flex gap-2">
                                      <Button size="sm" variant="outline" onClick={() => setEditingLogId(null)}>Отмена</Button>
                                      <Button size="sm" onClick={() => void saveLog()} className="bg-gradient-to-r from-primary to-accent">Сохранить</Button>
                                    </div>
                                  </div>
                                ) : (
                                  l.note ? <div className="text-xs text-muted-foreground mt-2">Заметка: {l.note}</div> : null
                                )}
                              </td>
                              <td className="py-3 px-3 text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleString("ru-RU")}</td>
                              <td className="py-3 px-3">
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="icon" aria-label="Редактировать" onClick={() => startEditLog(l)}>
                                    <Pencil size={16} />
                                  </Button>
                                  <Button variant="ghost" size="icon" aria-label="Скрыть" onClick={() => void hideLog(l.id)}>
                                    Скрыть
                                  </Button>
                                  <Button variant="ghost" size="icon" aria-label="Удалить" onClick={() => void deleteLog(l.id)}>
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {logs.length === 0 && (
                            <tr>
                              <td className="py-5 px-3 text-muted-foreground" colSpan={6}>
                                Логи отсутствуют.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tests">
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <Button onClick={() => setDialog({ kind: "createTest" })} className="bg-gradient-to-r from-primary to-accent">
                      Добавить тест
                    </Button>
                  </div>

                  {testsLoading ? (
                    <div className="text-muted-foreground">Загрузка...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="text-left">
                            <th className="py-2 border-b px-3">ID</th>
                            <th className="py-2 border-b px-3">Название</th>
                            <th className="py-2 border-b px-3">Категория</th>
                            <th className="py-2 border-b px-3">Сложность</th>
                            <th className="py-2 border-b px-3">Время</th>
                            <th className="py-2 border-b px-3">Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {testsRows.map((t) => (
                            <tr key={t.id} className="border-b">
                              <td className="py-3 px-3 text-muted-foreground">{t.id}</td>
                              <td className="py-3 px-3">{t.title}</td>
                              <td className="py-3 px-3">{t.category}</td>
                              <td className="py-3 px-3">{difficultyRu(t.difficulty)}</td>
                              <td className="py-3 px-3">{t.timeLimit} мин</td>
                              <td className="py-3 px-3">
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="icon" aria-label="Редактировать тест" onClick={() => startEditTest(t)}>
                                    <Pencil size={16} />
                                  </Button>
                                  <Button variant="ghost" size="icon" aria-label="Удалить тест" onClick={() => void deleteTest(t.id)}>
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {testsRows.length === 0 && (
                            <tr>
                              <td className="py-5 px-3 text-muted-foreground" colSpan={6}>
                                Тестов в БД нет.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="sm:max-w-[760px]">
          {dialog?.kind === "createUser" && (
            <>
              <DialogHeader>
                <DialogTitle>Создать пользователя</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dlg-user-email">Email *</Label>
                  <Input id="dlg-user-email" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="dlg-user-password">Пароль *</Label>
                  <Input id="dlg-user-password" type="password" value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="dlg-user-name">Имя *</Label>
                  <Input id="dlg-user-name" value={userForm.name} onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Роль</Label>
                  <Select value={userForm.role} onValueChange={(v) => setUserForm((p) => ({ ...p, role: v as Role }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Местоположение</Label>
                  <Input value={userForm.location} onChange={(e) => setUserForm((p) => ({ ...p, location: e.target.value }))} />
                </div>
                <div>
                  <Label>Должность</Label>
                  <Input value={userForm.position} onChange={(e) => setUserForm((p) => ({ ...p, position: e.target.value }))} />
                </div>
                <div>
                  <Label>Опыт</Label>
                  <Input value={userForm.experience} onChange={(e) => setUserForm((p) => ({ ...p, experience: e.target.value }))} />
                </div>
                <div>
                  <Label>Уровень</Label>
                  <Input value={userForm.level} onChange={(e) => setUserForm((p) => ({ ...p, level: e.target.value }))} />
                </div>
                <div>
                  <Label>Join date</Label>
                  <Input value={userForm.joinDate} onChange={(e) => setUserForm((p) => ({ ...p, joinDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Аватар (файл)</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} />
                </div>
              </div>
              <div className="mt-4 flex justify-between gap-3">
                <Button variant="outline" onClick={() => { setDialog(null); setAvatarFile(null); }} disabled={createUserLoading}>Отмена</Button>
                <Button className="bg-gradient-to-r from-primary to-accent" onClick={() => void createUser()} disabled={createUserLoading}>Сохранить</Button>
              </div>
            </>
          )}

          {dialog?.kind === "editUser" && (
            <>
              <DialogHeader>
                <DialogTitle>Редактировать пользователя</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Имя</Label>
                  <Input value={editUserForm.name} onChange={(e) => setEditUserForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Роль</Label>
                  <Select value={editUserForm.role} onValueChange={(v) => setEditUserForm((p) => ({ ...p, role: v as Role }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Местоположение</Label>
                  <Input value={editUserForm.location} onChange={(e) => setEditUserForm((p) => ({ ...p, location: e.target.value }))} />
                </div>
                <div>
                  <Label>Должность</Label>
                  <Input value={editUserForm.position} onChange={(e) => setEditUserForm((p) => ({ ...p, position: e.target.value }))} />
                </div>
                <div>
                  <Label>Опыт</Label>
                  <Input value={editUserForm.experience} onChange={(e) => setEditUserForm((p) => ({ ...p, experience: e.target.value }))} />
                </div>
                <div>
                  <Label>Уровень</Label>
                  <Input value={editUserForm.level} onChange={(e) => setEditUserForm((p) => ({ ...p, level: e.target.value }))} />
                </div>
                <div>
                  <Label>Join date</Label>
                  <Input value={editUserForm.joinDate} onChange={(e) => setEditUserForm((p) => ({ ...p, joinDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Новый пароль (опционально)</Label>
                  <Input type="password" value={editUserPassword} onChange={(e) => setEditUserPassword(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Аватар (файл)</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setEditUserAvatarFile(e.target.files?.[0] ?? null)} />
                </div>
              </div>
              <div className="mt-4 flex justify-between gap-3">
                <Button variant="outline" onClick={() => setDialog(null)}>Отмена</Button>
                <Button className="bg-gradient-to-r from-primary to-accent" onClick={() => void saveUser()}>Сохранить</Button>
              </div>
            </>
          )}

          {(dialog?.kind === "createJob" || dialog?.kind === "editJob") && (
            <>
              <DialogHeader>
                <DialogTitle>{dialog.kind === "createJob" ? "Создать вакансию" : "Редактировать вакансию"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Название</Label>
                  <Input value={jobForm.title} onChange={(e) => setJobForm((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <Label>Компания</Label>
                  <Input value={jobForm.company} onChange={(e) => setJobForm((p) => ({ ...p, company: e.target.value }))} />
                </div>
                <div>
                  <Label>Локация</Label>
                  <Input value={jobForm.location} onChange={(e) => setJobForm((p) => ({ ...p, location: e.target.value }))} />
                </div>
                <div>
                  <Label>Зарплата</Label>
                  <Input value={jobForm.salary} onChange={(e) => setJobForm((p) => ({ ...p, salary: e.target.value }))} />
                </div>
                <div>
                  <Label>Тип</Label>
                  <Input value={jobForm.type} onChange={(e) => setJobForm((p) => ({ ...p, type: e.target.value }))} />
                </div>
                <div>
                  <Label>Опубликовано</Label>
                  <Input value={jobForm.postedTime} onChange={(e) => setJobForm((p) => ({ ...p, postedTime: e.target.value }))} />
                </div>
                <div>
                  <Label>ИИ совпадение (%)</Label>
                  <Input value={jobForm.aiMatch} onChange={(e) => setJobForm((p) => ({ ...p, aiMatch: e.target.value }))} />
                </div>
                <div>
                  <Label>Навыки (через запятую)</Label>
                  <Input value={jobForm.skills} onChange={(e) => setJobForm((p) => ({ ...p, skills: e.target.value }))} />
                </div>
              </div>
              <div className="mt-4">
                <Label>Описание</Label>
                <Textarea value={jobForm.description} onChange={(e) => setJobForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="mt-4 flex justify-between gap-3">
                <Button variant="outline" onClick={() => { setDialog(null); setEditingJobId(null); }} disabled={createJobLoading}>Отмена</Button>
                <Button
                  className="bg-gradient-to-r from-primary to-accent"
                  onClick={() => (dialog.kind === "createJob" ? void createJob() : void saveJob())}
                  disabled={createJobLoading}
                >
                  Сохранить
                </Button>
              </div>
            </>
          )}

          {(dialog?.kind === "createTest" || dialog?.kind === "editTest") && (
            <>
              <DialogHeader>
                <DialogTitle>{dialog.kind === "createTest" ? "Добавить тест" : "Редактировать тест"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>ID</Label>
                  <Input value={testForm.id} onChange={(e) => setTestForm((p) => ({ ...p, id: e.target.value }))} disabled={dialog.kind === "editTest"} />
                </div>
                <div>
                  <Label>Название</Label>
                  <Input value={testForm.title} onChange={(e) => setTestForm((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <Label>Категория</Label>
                  <Input value={testForm.category} onChange={(e) => setTestForm((p) => ({ ...p, category: e.target.value }))} />
                </div>
                <div>
                  <Label>Сложность</Label>
                  <Select value={testForm.difficulty} onValueChange={(v) => setTestForm((p) => ({ ...p, difficulty: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Начальный</SelectItem>
                      <SelectItem value="INTERMEDIATE">Средний</SelectItem>
                      <SelectItem value="ADVANCED">Продвинутый</SelectItem>
                      <SelectItem value="EXPERT">Эксперт</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Время (мин)</Label>
                  <Input value={testForm.timeLimit} onChange={(e) => setTestForm((p) => ({ ...p, timeLimit: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Описание</Label>
                  <Textarea value={testForm.description} onChange={(e) => setTestForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Вопросы (JSON)</Label>
                  <Textarea value={testForm.questionsJson} onChange={(e) => setTestForm((p) => ({ ...p, questionsJson: e.target.value }))} className="min-h-[220px]" />
                </div>
              </div>
              <div className="mt-4 flex justify-between gap-3">
                <Button variant="outline" onClick={() => { setDialog(null); setEditingTestId(null); }} disabled={createTestLoading}>Отмена</Button>
                <Button
                  className="bg-gradient-to-r from-primary to-accent"
                  onClick={() => (dialog.kind === "createTest" ? void createTest() : void saveTest())}
                  disabled={createTestLoading}
                >
                  Сохранить
                </Button>
              </div>
            </>
          )}

          {dialog?.kind === "editLog" && (
            <>
              <DialogHeader>
                <DialogTitle>Редактировать лог</DialogTitle>
              </DialogHeader>
              <div>
                <Label>Заметка</Label>
                <Textarea value={logNoteDraft} onChange={(e) => setLogNoteDraft(e.target.value)} placeholder="Заметка (необязательно)" />
              </div>
              <div className="mt-4 flex justify-between gap-3">
                <Button variant="outline" onClick={() => setDialog(null)}>Отмена</Button>
                <Button className="bg-gradient-to-r from-primary to-accent" onClick={() => void saveLog()}>Сохранить</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

