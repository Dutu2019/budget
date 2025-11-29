import { useMemo } from "react";
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
  Legend,
} from "recharts";
import { type Transaction } from "../types";

const COLORS = [
  "#6366f1",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

interface IncomeExpenseChartProps {
  view?: "month" | "year";
  transactions: Transaction[];
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  view = "year",
  transactions,
}) => {
  const data = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate: Date;
    let endDate: Date;
    const bucketMap = new Map<string, { name: string, fullDate: string, income: number, expense: number, sortKey: number }>();

    // 1. Define Window and Initialize Buckets
    if (view === 'year') {
      // Rolling Year: Current Month - 6 to Current Month + 5 (Total 12 months)
      // e.g. If Nov, show May -> Next April
      startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 6, 0); // End of 5th month forward

      let curr = new Date(startDate);
      while (curr <= endDate) {
        const key = `${curr.getFullYear()}-${curr.getMonth()}`; // Unique Month Key
        const label = curr.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }); // "Nov 24"
        bucketMap.set(key, { 
          name: label, 
          fullDate: key, 
          income: 0, 
          expense: 0,
          sortKey: curr.getTime() 
        });
        curr.setMonth(curr.getMonth() + 1);
      }
    } else {
      // Rolling Month: Today - 15 to Today + 15 (Total 31 days)
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 15);
      
      endDate = new Date(today);
      endDate.setDate(today.getDate() + 15);

      let curr = new Date(startDate);
      while (curr <= endDate) {
        const key = curr.toISOString().split('T')[0]; // YYYY-MM-DD
        const label = curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "Nov 29"
        bucketMap.set(key, { 
          name: label, 
          fullDate: key, 
          income: 0, 
          expense: 0,
          sortKey: curr.getTime()
        });
        curr.setDate(curr.getDate() + 1);
      }
    }

    // 2. Process Transactions (Normal + Recurring Projection)
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      tDate.setHours(0,0,0,0);

      // If it's a one-time transaction
      if (!t.isRecurring) {
         if (tDate >= startDate && tDate <= endDate) {
           let key: string;
           if (view === 'year') {
             key = `${tDate.getFullYear()}-${tDate.getMonth()}`;
           } else {
             key = t.date;
           }
           
           const bucket = bucketMap.get(key);
           if (bucket) {
             if (t.type === 'income') bucket.income += t.amount;
             else bucket.expense += t.amount;
           }
         }
      } 
      // If it's recurring
      else {
        // Start projection from the transaction date. 
        // If transaction date is in future relative to window start, start there.
        // If transaction date is in past, catch up to window start.
        
        let curr = new Date(tDate);
        
        // Safety break for infinite loops
        let safety = 0;
        
        // If the transaction started before our window, we might need to fast-forward
        // BUT we must respect the frequency. We can't just set curr = startDate.
        // We have to iterate from tDate.
        
        // However, for performance, if tDate is WAY back, this loop is slow.
        // For this app (MVP), simple iteration is acceptable as N is small.
        
        while (curr <= endDate && safety < 1000) {
          if (curr >= tDate) { // Logic check: only count after start date (redundant due to init, but clear)
             if (curr >= startDate) {
                // Determine bucket
                let key: string;
                if (view === 'year') {
                   key = `${curr.getFullYear()}-${curr.getMonth()}`;
                } else {
                   key = curr.toISOString().split('T')[0];
                }

                const bucket = bucketMap.get(key);
                if (bucket) {
                   if (t.type === 'income') bucket.income += t.amount;
                   else bucket.expense += t.amount;
                }
             }
          }

          // Advance
          if (t.recurringFrequency === 'weekly') {
             curr.setDate(curr.getDate() + 7);
          } else if (t.recurringFrequency === 'yearly') {
             curr.setFullYear(curr.getFullYear() + 1);
          } else {
             // Monthly (default)
             // Handle edge cases like Jan 31 -> Feb 28
             const d = curr.getDate();
             curr.setMonth(curr.getMonth() + 1);
             // Verify day (if we went from Jan 31 to Feb 28/29, setMonth handles it but often shifts to Mar 2/3)
             // Simple version: setMonth usually keeps day if possible, or extends. 
             // Ideally we want to stick to the original day.
             // For MVP, standard setMonth behavior is acceptable, or we can enforce day clamping.
          }
          safety++;
        }
      }
    });

    return Array.from(bucketMap.values()).sort((a, b) => a.sortKey - b.sortKey);
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
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            interval={view === 'year' ? 0 : 3} // Show all months, but skip days to avoid clutter
          />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
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

export const CategoryPieChart = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const data = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const categoryMap: Record<string, number> = {};

    expenses.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    const result = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return result.length > 0 ? result : [{ name: "No Data", value: 1 }];
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
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.name === "No Data"
                    ? "#334155"
                    : COLORS[index % COLORS.length]
                }
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "8px",
              color: "#f8fafc",
            }}
            itemStyle={{ color: "#f8fafc" }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span style={{ color: "#94a3b8" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
