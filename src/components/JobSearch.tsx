import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Heart,
  Search,
  Filter,
  Briefcase,
  X,
  SlidersHorizontal
} from "lucide-react";
import { jobsDatabase, popularSkills, cities, experienceLevels } from "@/data/jobsData";
import { Job, JobApplication, JobFilter } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/AuthContext";
import { apiFetch } from "@/auth/api";

export const JobSearch = ({ onRequireAuth }: { onRequireAuth?: () => void }) => {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  
  const [filters, setFilters] = useState<JobFilter>({
    query: "",
    location: "",
    experience: "",
    skills: [],
    salary: { min: 0, max: 500000 }
  });

  useEffect(() => {
    if (!user) {
      setApplications([]);
      return;
    }
    if (authLoading) return;
    void apiFetch<JobApplication[]>("/api/job-applications")
      .then(setApplications)
      .catch(() => setApplications([]));
  }, [user?.id, authLoading]);

  // Filter jobs based on search and filters
  const filteredJobs = jobsDatabase.filter(job => {
    const matchesQuery = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLocation = !filters.location || 
      job.location.toLowerCase().includes(filters.location.toLowerCase());

    const matchesSkills = filters.skills.length === 0 || 
      filters.skills.some(skill => job.skills.includes(skill));

    return matchesQuery && matchesLocation && matchesSkills;
  });

  const handleSaveJob = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(prev => prev.filter(id => id !== jobId));
      toast({
        title: "Вакансия удалена",
        description: "Вакансия удалена из сохраненных",
      });
    } else {
      setSavedJobs(prev => [...prev, jobId]);
      toast({
        title: "Вакансия сохранена",
        description: "Вакансия добавлена в сохраненные",
      });
    }
  };

  const handleApplyJob = (job: Job) => {
    const existingApplication = applications.find(app => app.jobId === job.id);
    
    if (existingApplication) {
      toast({
        title: "Уже отправлен отклик",
        description: "Вы уже откликнулись на эту вакансию",
        variant: "destructive"
      });
      return;
    }

    void (async () => {
      const saved = await apiFetch<JobApplication>("/api/job-applications", {
        method: "POST",
        body: JSON.stringify({
          jobId: job.id,
          company: job.company,
          position: job.title,
          status: "Отклик отправлен",
          date: new Date().toLocaleDateString("ru-RU"),
        }),
      });
      setApplications((prev) => [saved, ...prev.filter((a) => a.jobId !== saved.jobId)]);
      toast({
        title: "Отклик отправлен!",
        description: `Ваш отклик на позицию ${job.title} в ${job.company} отправлен`,
      });
    })();
  };

  const handleSkillFilter = (skill: string) => {
    if (filters.skills.includes(skill)) {
      setFilters(prev => ({
        ...prev,
        skills: prev.skills.filter(s => s !== skill)
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      location: "",
      experience: "",
      skills: [],
      salary: { min: 0, max: 500000 }
    });
    setSearchQuery("");
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
              <CardTitle>Вакансии</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Чтобы отправлять отклики и сохранять их в базе данных, выполните вход.
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-center">
            Поиск IT вакансий с
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> ИИ-подбором</span>
          </h1>
          <p className="text-center text-muted-foreground text-lg mb-8">
            Найдите идеальную работу с помощью персональных рекомендаций
          </p>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Search className="text-muted-foreground" size={20} />
                    <Input
                      placeholder="Должность, навыки, компания..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 text-lg focus-visible:ring-0"
                    />
                    <Button className="bg-gradient-to-r from-primary to-accent">
                      Найти
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} className="mr-2" />
                Фильтры
                {(filters.skills.length > 0 || filters.location || filters.experience) && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.skills.length + (filters.location ? 1 : 0) + (filters.experience ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Фильтры поиска</span>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Очистить все
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Город</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    >
                      <option value="">Все города</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Опыт работы</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={filters.experience}
                      onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                    >
                      <option value="">Любой опыт</option>
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Зарплата от {filters.salary.min.toLocaleString()} ₽
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="500000"
                      step="10000"
                      value={filters.salary.min}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        salary: { ...prev.salary, min: parseInt(e.target.value) }
                      }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Технологии и навыки</label>
                  <div className="flex flex-wrap gap-2">
                    {popularSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant={filters.skills.includes(skill) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleSkillFilter(skill)}
                      >
                        {skill}
                        {filters.skills.includes(skill) && (
                          <X size={14} className="ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Filters */}
          {(filters.skills.length > 0 || filters.location || filters.experience) && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {filters.location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Город: {filters.location}
                    <X 
                      size={14} 
                      className="cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, location: "" }))}
                    />
                  </Badge>
                )}
                {filters.experience && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Опыт: {filters.experience}
                    <X 
                      size={14} 
                      className="cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, experience: "" }))}
                    />
                  </Badge>
                )}
                {filters.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X 
                      size={14} 
                      className="cursor-pointer" 
                      onClick={() => handleSkillFilter(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Найдено {filteredJobs.length} {filteredJobs.length === 1 ? 'вакансия' : 'вакансий'}
            </p>
          </div>
        </div>

        {/* Job Results */}
        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.map((job) => {
            const isApplied = applications.some(app => app.jobId === job.id);
            const isSaved = savedJobs.includes(job.id);
            
            return (
              <Card key={job.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer">
                          {job.title}
                        </CardTitle>
                        {job.aiMatch && (
                          <Badge className="bg-gradient-to-r from-success to-accent text-white">
                            ИИ совпадение: {job.aiMatch}%
                          </Badge>
                        )}
                        {isApplied && (
                          <Badge variant="secondary">
                            Отклик отправлен
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building size={14} />
                          {job.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase size={14} />
                          {job.type}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`transition-colors ${isSaved ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                      onClick={() => handleSaveJob(job.id)}
                    >
                      <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {job.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-success font-semibold">
                        <DollarSign size={14} />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock size={14} />
                        {job.postedTime}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline">
                        Подробнее
                      </Button>
                      <Button 
                        className={`${isApplied ? 'bg-muted text-muted-foreground' : 'bg-gradient-to-r from-primary to-accent'}`}
                        disabled={isApplied}
                        onClick={() => handleApplyJob(job)}
                      >
                        {isApplied ? 'Отклик отправлен' : 'Откликнуться'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredJobs.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Вакансии не найдены</h3>
              <p className="text-muted-foreground mb-4">
                Попробуйте изменить критерии поиска или очистить фильтры
              </p>
              <Button onClick={clearFilters} variant="outline">
                Очистить фильтры
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Load More */}
        {filteredJobs.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Показать больше вакансий
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};