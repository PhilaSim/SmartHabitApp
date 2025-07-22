import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../ui/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DayData {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

export function HabitCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCalendarData = async () => {
    if (!user) return;

    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const days = eachDayOfInterval({ start, end });

      const data = await Promise.all(
        days.map(async (day) => {
          const dateStr = format(day, 'yyyy-MM-dd');

          // Get all habits for the user that existed on this date
          const { data: habits } = await supabase
            .from('habits')
            .select('id')
            .eq('user_id', user.id)
            .lte('created_at', `${dateStr}T23:59:59.999Z`);

          const totalHabits = habits?.length || 0;

          if (totalHabits === 0) {
            return {
              date: dateStr,
              completed: 0,
              total: 0,
              percentage: 0,
            };
          }

          // Get completed habits for this date
          const { data: logs } = await supabase
            .from('habit_logs')
            .select('habit_id')
            .eq('date', dateStr)
            .eq('completed', true)
            .in('habit_id', habits?.map(h => h.id) || []);

          const completedHabits = logs?.length || 0;
          const percentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

          return {
            date: dateStr,
            completed: completedHabits,
            total: totalHabits,
            percentage,
          };
        })
      );

      setCalendarData(data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, user]);

  const getIntensityColor = (percentage: number) => {
    if (percentage === 0) return 'bg-gray-100';
    if (percentage <= 25) return 'bg-green-200';
    if (percentage <= 50) return 'bg-green-300';
    if (percentage <= 75) return 'bg-green-400';
    return 'bg-green-500';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayData = calendarData.find(d => d.date === dateStr);
          const intensity = dayData?.percentage || 0;

          return (
            <div
              key={dateStr}
              className={cn(
                'aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all hover:scale-105',
                getIntensityColor(intensity),
                isToday(day) && 'ring-2 ring-blue-500',
                !isSameMonth(day, currentDate) && 'opacity-30'
              )}
              title={dayData ? `${dayData.completed}/${dayData.total} habits completed (${intensity}%)` : 'No data'}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-6 text-sm text-gray-600">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
        </div>
        <span>More</span>
      </div>
    </Card>
  );
}