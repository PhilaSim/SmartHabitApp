import { UserBadge } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Award } from 'lucide-react';

interface BadgeDisplayProps {
  badges: UserBadge[];
}

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  if (badges.length === 0) {
    return (
      <Card className="text-center py-8">
        <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No badges yet</h3>
        <p className="text-gray-600">Complete habits to earn your first badge!</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge) => (
        <Card key={badge.id} className="text-center p-4 hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-2">{badge.badge_icon}</div>
          <h4 className="font-semibold text-gray-900 text-sm mb-1">{badge.badge_name}</h4>
          <p className="text-xs text-gray-600">{badge.badge_description}</p>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(badge.earned_at).toLocaleDateString()}
          </p>
        </Card>
      ))}
    </div>
  );
}