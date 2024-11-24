import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  TrendingUp 
} from 'lucide-react';
import { BusinessMetrics } from '../types';

// This would be replaced with actual API call
const fetchMetrics = async (): Promise<BusinessMetrics> => {
  return {
    totalLeads: 150,
    responseRate: 85,
    averageResponseTime: 15,
    conversionRate: 45
  };
};

function Dashboard() {
  const { data: metrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics
  });

  const stats = [
    {
      name: 'Total Leads',
      value: metrics?.totalLeads || 0,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Response Rate',
      value: `${metrics?.responseRate || 0}%`,
      icon: MessageSquare,
      color: 'bg-green-500'
    },
    {
      name: 'Avg. Response Time',
      value: `${metrics?.averageResponseTime || 0}m`,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      name: 'Conversion Rate',
      value: `${metrics?.conversionRate || 0}%`,
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-lg bg-white p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className={`rounded-lg ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add recent leads and activity feed components here */}
    </div>
  );
}

export default Dashboard;