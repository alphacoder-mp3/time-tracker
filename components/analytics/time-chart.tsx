'use client';

import { Card } from '@/components/ui/card';
import { useTimeTrackingStore } from '@/lib/store';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function TimeChart() {
  const { categories, timeEntries } = useTimeTrackingStore();

  const categoryData = categories
    .map(category => {
      const categoryEntries = timeEntries.filter(
        entry => entry.categoryId === category.id
      );
      const totalMinutes = categoryEntries.reduce((acc, entry) => {
        return (
          acc +
          (entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60)
        );
      }, 0);

      return {
        name: category.name,
        value: totalMinutes,
        color: category.color,
      };
    })
    .filter(category => category.value > 0);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Time Distribution</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${Math.round(value)} minutes`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {categoryData.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">{entry.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
