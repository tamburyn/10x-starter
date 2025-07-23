import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatItem {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

interface DashboardStatsProps {
  stats: StatItem[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            {stat.icon && (
              <div className="text-gray-400">
                {stat.icon}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stat.value}
            </div>
            {stat.description && (
              <p className="text-xs text-gray-600 mt-1">
                {stat.description}
              </p>
            )}
            {stat.trend && (
              <div className="flex items-center mt-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    stat.trend.isPositive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  vs poprzedni miesiąc
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 