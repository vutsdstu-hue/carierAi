import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/AuthContext";

export function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { login, register } = useAuth();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const canLogin = useMemo(() => loginEmail.trim() && loginPassword.trim(), [loginEmail, loginPassword]);
  const canRegister = useMemo(() => regEmail.trim() && regPassword.trim().length >= 8 && regName.trim(), [regEmail, regPassword, regName]);

  const handleLogin = async () => {
    if (!canLogin || submitting) return;
    setSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      onOpenChange(false);
    } catch (e) {
      toast({ title: "Ошибка входа", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!canRegister || submitting) return;
    setSubmitting(true);
    try {
      await register({ email: regEmail, password: regPassword, name: regName });
      onOpenChange(false);
    } catch (e) {
      toast({ title: "Ошибка регистрации", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Авторизация</DialogTitle>
          <DialogDescription>Войдите или зарегистрируйтесь, чтобы сохранять данные в PostgreSQL.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginEmail">Email</Label>
              <Input id="loginEmail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} type="email" autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loginPassword">Пароль</Label>
              <Input id="loginPassword" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} type="password" autoComplete="current-password" />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => void handleLogin()} disabled={!canLogin || submitting} className="bg-gradient-to-r from-primary to-accent">
                Войти
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="regName">Имя</Label>
              <Input id="regName" value={regName} onChange={(e) => setRegName(e.target.value)} autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regEmail">Email</Label>
              <Input id="regEmail" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} type="email" autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regPassword">Пароль</Label>
              <Input id="regPassword" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} type="password" autoComplete="new-password" />
              <p className="text-xs text-muted-foreground">Минимум 8 символов.</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => void handleRegister()} disabled={!canRegister || submitting} className="bg-gradient-to-r from-primary to-accent">
                Зарегистрироваться
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

