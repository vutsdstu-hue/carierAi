import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  ClipboardList, 
  User, 
  MessageCircle, 
  Home,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  UserRoundCog
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { AuthUser } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navigation = ({ activeSection, onSectionChange, user, onOpenAuth, onLogout }: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const navigationItems = [
    { id: "home", label: "Главная", icon: Home },
    { id: "jobs", label: "Вакансии", icon: Search },
    { id: "tests", label: "Тестирование", icon: ClipboardList },
    { id: "profile", label: "Профиль", icon: User },
    { id: "ai-chat", label: "ИИ Помощник", icon: MessageCircle },
  ];

  if (user?.role === "MODERATOR" || user?.role === "ADMIN") {
    navigationItems.push({ id: "moderator", label: "Модерация", icon: UserRoundCog });
  }
  if (user?.role === "ADMIN") {
    navigationItems.push({ id: "admin", label: "Админ", icon: ShieldCheck });
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-md bg-card/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              IT Career Hub
            </h1>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    onClick={() => onSectionChange(item.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Auth controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
                <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
                  <LogOut size={16} />
                  Выйти
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={onOpenAuth}>
                Войти
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMobile && mobileMenuOpen && (
          <div className="pb-4 space-y-2">
            {!user && (
              <Button variant="outline" className="w-full" onClick={onOpenAuth}>
                Войти / Регистрация
              </Button>
            )}
            {user && (
              <div className="flex items-center justify-between gap-3">
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
                <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
                  <LogOut size={16} />
                  Выйти
                </Button>
              </div>
            )}
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  onClick={() => {
                    onSectionChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-start space-x-2"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};