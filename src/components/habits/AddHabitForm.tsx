import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Clock } from 'lucide-react';
import { HabitCategory } from '../../lib/supabase';

interface AddHabitFormProps {
  onAddHabit: (habitData: {
    name: string;
    category_id?: string;
    difficulty_level: 'easy' | 'medium' | 'hard';
    priority_level: 'low' | 'medium' | 'high';
    reminder_time?: string;
  }) => Promise<void>;
  categories: HabitCategory[];
}

export function AddHabitForm({ onAddHabit, categories }: AddHabitFormProps) {
  const [habitName, setHabitName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [reminderTime, setReminderTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    setLoading(true);
    try {
      await onAddHabit({
        name: habitName.trim(),
        category_id: categoryId || undefined,
        difficulty_level: difficulty,
        priority_level: priority,
        reminder_time: reminderTime || undefined,
      });
      setHabitName('');
      setCategoryId('');
      setDifficulty('medium');
      setPriority('medium');
      setReminderTime('');
    } catch (error) {
      console.error('Error adding habit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Habit</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Habit Name"
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          placeholder="e.g., Drink 8 glasses of water, Exercise for 30 minutes..."
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category (Optional)
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/80 backdrop-blur-sm"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/80 backdrop-blur-sm"
            >
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/80 backdrop-blur-sm"
            >
              <option value="low">⬇️ Low</option>
              <option value="medium">➡️ Medium</option>
              <option value="high">⬆️ High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Reminder Time (Optional)
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/80 backdrop-blur-sm"
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </form>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for Great Habits</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Start small and be specific</li>
          <li>• Focus on consistency over intensity</li>
          <li>• Link new habits to existing routines</li>
          <li>• Track your progress daily</li>
        </ul>
      </div>
    </Card>
  );
}