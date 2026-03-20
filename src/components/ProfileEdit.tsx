import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Save, 
  X, 
  Plus,
  Trash2
} from "lucide-react";
import { User as UserType, Skill } from "@/types";
import { toast } from "@/hooks/use-toast";

interface ProfileEditProps {
  userData: UserType;
  userSkills: Skill[];
  onSave: (userData: UserType, skills: Skill[]) => void;
  onCancel: () => void;
}

export const ProfileEdit = ({ userData, userSkills, onSave, onCancel }: ProfileEditProps) => {
  const [formData, setFormData] = useState(userData);
  const [skills, setSkills] = useState(userSkills);
  const [newSkill, setNewSkill] = useState({ name: '', level: 50, category: 'Frontend' });

  const handleInputChange = (field: keyof UserType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillChange = (index: number, field: keyof Skill, value: string | number) => {
    setSkills(prev => 
      prev.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    );
  };

  const addSkill = () => {
    if (newSkill.name.trim()) {
      setSkills(prev => [...prev, newSkill]);
      setNewSkill({ name: '', level: 50, category: 'Frontend' });
      toast({
        title: "Навык добавлен",
        description: `${newSkill.name} успешно добавлен в профиль`,
      });
    }
  };

  const removeSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Навык удален",
      description: "Навык успешно удален из профиля",
    });
  };

  const handleSave = () => {
    // Validation
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Ошибка валидации",
        description: "Заполните обязательные поля: имя и email",
        variant: "destructive"
      });
      return;
    }

    onSave(formData, skills);
    toast({
      title: "Профиль обновлен!",
      description: "Ваши данные успешно сохранены",
    });
  };

  const skillCategories = ['Frontend', 'Backend', 'Mobile', 'DevOps', 'Tools', 'Other'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={24} />
            Редактирование профиля
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Личная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Имя *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Введите ваше имя"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="example@email.com"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Местоположение</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Город, Страна"
              />
            </div>
            <div>
              <Label htmlFor="position">Должность</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Frontend Developer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="experience">Опыт работы</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="3 года"
              />
            </div>
            <div>
              <Label htmlFor="level">Уровень</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
              >
                <option value="Junior">Junior</option>
                <option value="Middle">Middle</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Навыки и компетенции</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Skills */}
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <Label>Навык</Label>
                    <Input
                      value={skill.name}
                      onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                      placeholder="Название навыка"
                    />
                  </div>
                  <div>
                    <Label>Категория</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={skill.category}
                      onChange={(e) => handleSkillChange(index, 'category', e.target.value)}
                    >
                      {skillCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Уровень: {skill.level}%</Label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={skill.level}
                      onChange={(e) => handleSkillChange(index, 'level', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeSkill(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Skill */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Добавить новый навык</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label>Навык</Label>
                <Input
                  value={newSkill.name}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Название навыка"
                />
              </div>
              <div>
                <Label>Категория</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newSkill.category}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                >
                  {skillCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Уровень: {newSkill.level}%</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newSkill.level}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <Button onClick={addSkill} disabled={!newSkill.name.trim()}>
                  <Plus size={16} className="mr-2" />
                  Добавить
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onCancel}>
              <X size={16} className="mr-2" />
              Отмена
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-accent">
              <Save size={16} className="mr-2" />
              Сохранить изменения
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
