import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { type Transaction } from '../types';

const COLORS = ['#6366f1', '#ec4899', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

interface IncomeExpenseChartProps {
  view?: 'month' | 'year';
  transactions: Transaction[];
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ view = 'year', transactions }) => {
  
  const data = useMemo(() => {
    if (view === 'year') {
      // Group by Month (last 12 months usually, but for simplicity, grouped by month name of all tx)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const grouped = months.map(m => ({ name: m, income: 0, expense: 0 }));

      transactions.forEach(t => {
        const date = new Date(t.date);
        const monthIndex = date.getMonth();
        if (t.type === 'income') {
          grouped[monthIndex].income += t.amount;
        } else {
          grouped[monthIndex].expense += t.amount;
        }
      });
      return grouped;
    } else {
      // Month View: Filter for current month, group by date
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const currentMonthTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      // Group by specific date
      const daysMap: Record<string, { income: number, expense: number }> = {};
      
      currentMonthTx.forEach(t => {
        const day = new Date(t.date).getDate();
        const key = `Day ${day}`;
        if (!daysMap[key]) daysMap[key] = { income: 0, expense: 0 };
        
        if (t.type === 'income') daysMap[key].income += t.amount;
        else daysMap[key].expense += t.amount;
      });

      // If no data for current month, return at least one empty point
      if (Object.keys(daysMap).length === 0) {
        return [{ name: 'Today', income: 0, expense: 0 }];
      }

      return Object.entries(daysMap)
        .sort((a, b) => parseInt(a[0].split(' ')[1]) - parseInt(b[0].split(' ')[1]))
        .map(([name, vals]) => ({ name, ...vals }));
    }
  }, [view, transactions]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
          />
          <Area 
            type="monotone" 
            dataKey="income" 
            stroke="#06b6d4" 
            fillOpacity={1} 
            fill="url(#colorIncome)" 
            strokeWidth={2}
            animationDuration={1000}
          />
          <Area 
            type="monotone" 
            dataKey="expense" 
            stroke="#ec4899" 
            fillOpacity={1} 
            fill="url(#colorExpense)" 
            strokeWidth={2}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryPieChart = ({ transactions }: { transactions: Transaction[] }) => {
  const data = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryMap: Record<string, number> = {};
    
    expenses.forEach(t => {
       categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    const result = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return result.length > 0 ? result : [{ name: 'No Data', value: 1 }];
  }, [transactions]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
             itemStyle={{ color: '#f8fafc' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};