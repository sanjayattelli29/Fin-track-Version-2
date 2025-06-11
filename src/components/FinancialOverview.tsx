
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/format';

interface Transaction {
  date: string;
  amount: number;
  type: 'income' | 'expense' | 'toBeCredit' | 'salary' | 'debt' | 'interest';
  id?: string;
}

interface FinancialOverviewProps {
  transactions: Transaction[];
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ transactions = [] }) => {
  const dailyData = React.useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    
    const groupedByDate = transactions.reduce((acc, transaction) => {
      const { date, amount, type } = transaction;
      
      if (!acc[date]) {
        acc[date] = {
          date,
          income: 0,
          expense: 0,
          toBeCredit: 0,
          salary: 0,
          debt: 0,
          interest: 0,
          balance: 0
        };
      }
      
      if (type === 'income') {
        acc[date].income += amount;
        acc[date].balance += amount;
      } else if (type === 'expense') {
        acc[date].expense += Math.abs(amount);
        acc[date].balance += amount;
      } else if (type === 'toBeCredit') {
        acc[date].toBeCredit += amount;
        acc[date].balance += amount;
      } else if (type === 'salary') {
        acc[date].salary += amount;
        acc[date].balance += amount;
      } else if (type === 'debt') {
        acc[date].debt += amount;
        acc[date].balance += amount;
      } else if (type === 'interest') {
        acc[date].interest += Math.abs(amount);
        acc[date].balance += amount;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(groupedByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [transactions]);

  // Custom formatter for tooltip to handle both number and string values
  const customTooltipFormatter = (value: any) => {
    if (typeof value === 'number') {
      return formatCurrency(value);
    }
    return value;
  };

  const yAxisTickFormatter = (value: number) => {
    // Format without 0 and currency symbol
    if (value === 0) return '0';
    return formatCurrency(value).replace('₹', '');
  };

  if (dailyData.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5 mt-6 animate-fade-up" style={{ animationDelay: '500ms' }}>
        <h3 className="text-xl font-semibold mb-4">Financial Overview</h3>
        <p className="text-center py-10">No data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5 mt-6 animate-fade-up" style={{ animationDelay: '500ms' }}>
      <h3 className="text-xl font-semibold mb-4">Financial Overview</h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={dailyData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={yAxisTickFormatter} />
            <Tooltip formatter={customTooltipFormatter} />
            <Legend />
            <Area type="monotone" dataKey="income" stackId="1" stroke="#10B981" fill="#10B981" name="Income" />
            <Area type="monotone" dataKey="expense" stackId="2" stroke="#EF4444" fill="#EF4444" name="Expense" />
            <Area type="monotone" dataKey="toBeCredit" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" name="To Be Credit" />
            <Area type="monotone" dataKey="salary" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Salary" />
            {dailyData.some(data => data.debt > 0) && (
              <Area type="monotone" dataKey="debt" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Debt" />
            )}
            {dailyData.some(data => data.interest > 0) && (
              <Area type="monotone" dataKey="interest" stackId="2" stroke="#DC2626" fill="#DC2626" name="Interest" />
            )}
            <Area type="monotone" dataKey="balance" stroke="#6366F1" fill="none" name="Balance" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialOverview;
