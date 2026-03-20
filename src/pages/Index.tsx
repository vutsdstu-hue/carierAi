import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { JobSearch } from "@/components/JobSearch";
import { TestCenter } from "@/components/TestCenter";
import { Profile } from "@/components/Profile";
import { AIChat } from "@/components/AIChat";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/auth/AuthContext";
import { ModeratorPanel } from "@/components/ModeratorPanel";
import { AdminPanel } from "@/components/AdminPanel";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [authOpen, setAuthOpen] = useState(false);
  const { user, logout } = useAuth();

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return <Hero />;
      case "jobs":
        return <JobSearch onRequireAuth={() => setAuthOpen(true)} />;
      case "tests":
        return <TestCenter onRequireAuth={() => setAuthOpen(true)} />;
      case "profile":
        return <Profile onRequireAuth={() => setAuthOpen(true)} />;
      case "ai-chat":
        return <AIChat />;
      case "moderator":
        return <ModeratorPanel />;
      case "admin":
        return <AdminPanel />;
      default:
        return <Hero />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={() => {
          logout();
          setActiveSection("home");
        }}
      />
      {renderContent()}
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default Index;
