import { useState } from 'react';
import { HabitWithCompletion } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Check, Flame, Target, Trash2, Clock, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

interface HabitCardProps {
  habit: HabitWithCompletion;
  onToggle: (habitId: string, completed: boolean, notes?: string) => void;
  onDelete: (habitId: string) => void;
}

export function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(habit.id);
    } catch (error) {
      console.error('Error deleting habit:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = () => {
    if (!habit.completed_today && showNotes) {
      onToggle(habit.id, true, notes);
      setNotes('');
      setShowNotes(false);
    } else {
      onToggle(habit.id, !habit.completed_today);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };
  return (
    <Card className={cn(
      'transition-all duration-300 hover:shadow-2xl',
      habit.completed_today && 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {habit.category && (
              <span 
                className="px-2 py-1 rounded-lg text-xs font-medium"
                style={{ 
                  backgroundColor: `${habit.category.color}20`,
                  color: habit.category.color 
                }}
              >
                {habit.category.icon} {habit.category.name}
              </span>
            )}
            <span className={cn('px-2 py-1 rounded-lg text-xs font-medium', getDifficultyColor(habit.difficulty_level))}>
              {habit.difficulty_level}
            </span>
            <span className={cn('px-2 py-1 rounded-lg text-xs font-medium', getPriorityColor(habit.priority_level))}>
              {habit.priority_level}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {habit.habit_name}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Flame className={cn(
                'w-4 h-4',
                habit.current_streak > 0 ? 'text-orange-500' : 'text-gray-400'
              )} />
              <span>{habit.current_streak} day streak</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4 text-blue-500" />
              <span>{habit.total_completions} total</span>
            </div>
            {habit.reminder_time && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>{habit.reminder_time}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!habit.completed_today && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              className="text-gray-600 hover:text-gray-800"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant={habit.completed_today ? 'primary' : 'outline'}
            size="sm"
            onClick={handleToggle}
            className={cn(
              'transition-all duration-200',
              habit.completed_today && 'bg-green-600 hover:bg-green-700'
            )}
          >
            <Check className="w-4 h-4 mr-1" />
            {habit.completed_today ? 'Done' : 'Mark Done'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            loading={isDeleting}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {showNotes && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a note about completing this habit..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={2}
          />
        </div>
      )}
    </Card>
  );
}