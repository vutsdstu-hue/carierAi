import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/auth/api";
import { useAuth, type Role } from "@/auth/AuthContext";
import { Trash2 } from "lucide-react";

type AdminUserRow = { id: string; email: string; name: string; role: Role };

const roleOptions: Role[] = ["USER", "MODERATOR", "ADMIN"];

export function AdminPanel({ onDone }: { onDone?: () => void }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    users: { USER: number; MODERATOR: number; ADMIN: number };
    skillsCount: number;
    testsCount: number;
    jobApplicationsCount: number;
  } | null>(null);

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

  useEffect(() => {
    if (user?.role === "ADMIN") void fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === "ADMIN") void fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

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

  if (!user || user.role !== "ADMIN") {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Админ панель</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">Доступ запрещен. Требуется роль ADMIN.</CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Админ панель</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Управление пользователями и ролями.</p>
            </div>
            <Button variant="outline" onClick={() => void fetchRows()} disabled={loading}>
              Обновить
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground">Загрузка...</div>
            ) : (
              <div className="overflow-x-auto">
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
                          <Button variant="ghost" size="icon" aria-label="Удалить пользователя" onClick={() => void deleteUser(r.id)}>
                            <Trash2 size={16} />
                          </Button>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

