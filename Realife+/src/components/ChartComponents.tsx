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

const incomeData = [
  { name: 'Jan', income: 4000, expense: 2400 },
  { name: 'Feb', income: 3000, expense: 1398 },
  { name: 'Mar', income: 2000, expense: 9800 },
  { name: 'Apr', income: 2780, expense: 3908 },
  { name: 'May', income: 1890, expense: 4800 },
  { name: 'Jun', income: 2390, expense: 3800 },
  { name: 'Jul', income: 3490, expense: 4300 },
];

const categoryData = [
  { name: 'Housing', value: 1200 },
  { name: 'Food', value: 800 },
  { name: 'Tech', value: 450 },
  { name: 'Transport', value: 300 },
  { name: 'Ent', value: 200 },
];

const COLORS = ['#6366f1', '#ec4899', '#06b6d4', '#8b5cf6', '#10b981'];

export const IncomeExpenseChart = () => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={incomeData}
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
          />
          <Area 
            type="monotone" 
            dataKey="expense" 
            stroke="#ec4899" 
            fillOpacity={1} 
            fill="url(#colorExpense)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryPieChart = () => {
  return (
    <div className="h-64 w-full">
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