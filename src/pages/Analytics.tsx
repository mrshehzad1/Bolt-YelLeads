import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Mon', leads: 4, responses: 3 },
  { name: 'Tue', leads: 3, responses: 2 },
  { name: 'Wed', leads: 6, responses: 5 },
  { name: 'Thu', leads: 8, responses: 7 },
  { name: 'Fri', leads: 5, responses: 4 },
  { name: 'Sat', leads: 2, responses: 2 },
  { name: 'Sun', leads: 1, responses: 1 },
];

function Analytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">
          Weekly Performance
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="leads" fill="#3B82F6" name="Leads" />
              <Bar dataKey="responses" fill="#10B981" name="Responses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Analytics;