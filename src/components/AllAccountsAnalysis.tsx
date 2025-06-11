
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Download, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF } from '@/lib/pdf-export';

interface Transaction {
  id: string;
  date: string;
  investment: number;
  earnings: number;
  spending: number;
  toBeCredit: number;
  salary?: number;
}

interface AllAccountsAnalysisProps {
  accountTransactions: Record<string, Transaction[]>;
  accounts: { id: string; name: string }[];
  onSendEmail?: () => void;
}

const AllAccountsAnalysis: React.FC<AllAccountsAnalysisProps> = ({ 
  accountTransactions, 
  accounts,
  onSendEmail 
}) => {
  const [totalSummary, setTotalSummary] = useState({
    remaining: 0,
    income: 0,
    expenses: 0,
    toBeCredit: 0,
    salary: 0
  });
  
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [bestMonth, setBestMonth] = useState({ month: '', profit: 0 });
  const [worstMonth, setWorstMonth] = useState({ month: '', profit: 0 });
  const { toast } = useToast();

  useEffect(() => {
    calculateTotals();
    prepareYearlyData();
    prepareMonthlyData();
  }, [accountTransactions, accounts]);

  const calculateTotals = () => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalToBeCredit = 0;
    let totalSalary = 0;

    Object.values(accountTransactions).forEach(transactions => {
      transactions.forEach(t => {
        totalIncome += t.earnings;
        totalExpenses += (t.investment + t.spending);
        totalToBeCredit += t.toBeCredit;
        totalSalary += (t.salary || 0);
      });
    });

    const remaining = totalIncome - totalExpenses + totalToBeCredit + totalSalary;

    setTotalSummary({
      remaining,
      income: totalIncome,
      expenses: totalExpenses,
      toBeCredit: totalToBeCredit,
      salary: totalSalary
    });
  };

  const prepareYearlyData = () => {
    const yearData: Record<string, {
      earnings: number;
      investment: number;
      spending: number;
      toBeCredit: number;
      salary: number;
    }> = {};

    Object.values(accountTransactions).forEach(transactions => {
      transactions.forEach(t => {
        const year = new Date(t.date).getFullYear().toString();
        
        if (!yearData[year]) {
          yearData[year] = {
            earnings: 0,
            investment: 0,
            spending: 0,
            toBeCredit: 0,
            salary: 0
          };
        }
        
        yearData[year].earnings += t.earnings;
        yearData[year].investment += t.investment;
        yearData[year].spending += t.spending;
        yearData[year].toBeCredit += t.toBeCredit;
        yearData[year].salary += (t.salary || 0);
      });
    });

    const formattedData = Object.entries(yearData).map(([year, data]) => ({
      year,
      ...data,
      profit: data.earnings - data.investment - data.spending + data.toBeCredit + data.salary,
      roi: data.investment > 0 
        ? ((data.earnings / data.investment) * 100).toFixed(2) 
        : '0'
    }));

    setYearlyData(formattedData.sort((a, b) => parseInt(a.year) - parseInt(b.year)));
  };

  const prepareMonthlyData = () => {
    const monthData: Record<string, {
      earnings: number;
      investment: number;
      spending: number;
      toBeCredit: number;
      salary: number;
    }> = {};

    const currentYear = new Date().getFullYear();

    Object.values(accountTransactions).forEach(transactions => {
      transactions.forEach(t => {
        const date = new Date(t.date);
        if (date.getFullYear() !== currentYear) return;
        
        const month = format(date, 'MMM');
        const monthIndex = date.getMonth();
        const key = `${monthIndex}-${month}`;
        
        if (!monthData[key]) {
          monthData[key] = {
            earnings: 0,
            investment: 0,
            spending: 0,
            toBeCredit: 0,
            salary: 0
          };
        }
        
        monthData[key].earnings += t.earnings;
        monthData[key].investment += t.investment;
        monthData[key].spending += t.spending;
        monthData[key].toBeCredit += t.toBeCredit;
        monthData[key].salary += (t.salary || 0);
      });
    });

    const formattedData = Object.entries(monthData).map(([key, data]) => {
      const [index, month] = key.split('-');
      return {
        month,
        monthIndex: parseInt(index),
        ...data,
        profit: data.earnings - data.investment - data.spending + data.toBeCredit + data.salary,
        roi: data.investment > 0 
          ? ((data.earnings / data.investment) * 100).toFixed(2) 
          : '0'
      };
    });

    const sortedData = formattedData.sort((a, b) => a.monthIndex - b.monthIndex);
    
    // Find best and worst month
    if (sortedData.length > 0) {
      let highestProfit = sortedData[0];
      let lowestProfit = sortedData[0];
      
      sortedData.forEach(month => {
        if (month.profit > highestProfit.profit) {
          highestProfit = month;
        }
        if (month.profit < lowestProfit.profit) {
          lowestProfit = month;
        }
      });
      
      setBestMonth({
        month: highestProfit.month,
        profit: highestProfit.profit
      });
      
      setWorstMonth({
        month: lowestProfit.month,
        profit: lowestProfit.profit
      });
    }

    setMonthlyData(sortedData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportCSV = () => {
    const headers = ['Month', 'Income', 'Investment', 'Expenses', 'To Be Credited', 'Salary', 'Profit', 'ROI'];
    
    const rows = monthlyData.map(data => [
      data.month,
      data.earnings.toString(),
      data.investment.toString(),
      data.spending.toString(),
      data.toBeCredit.toString(),
      data.salary.toString(),
      data.profit.toString(),
      `${data.roi}%`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `all_accounts_analysis.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "All accounts analysis has been exported as CSV."
    });
  };

  const handleExportPDF = () => {
    const tableData = {
      headers: ['Month', 'Income', 'Investment', 'Spending', 'To Be Credited', 'Salary', 'Profit', 'ROI'],
      rows: monthlyData.map(data => [
        data.month,
        formatCurrency(data.earnings),
        formatCurrency(data.investment),
        formatCurrency(data.spending),
        formatCurrency(data.toBeCredit),
        formatCurrency(data.salary),
        formatCurrency(data.profit),
        `${parseFloat(data.roi).toFixed(2)}%`
      ])
    };

    exportToPDF('All Accounts Analysis', tableData, totalSummary);
    
    toast({
      title: "Export successful",
      description: "All accounts analysis has been exported as PDF."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">All Accounts Analysis</h2>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="glass-card p-5 bg-[#0f172a] border-[#1e293b]">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400">Remaining</p>
              <h3 className={`text-2xl font-bold mt-1 ${
                totalSummary.remaining < 0 ? "text-red-500" : "text-white"
              }`}>
                {formatCurrency(totalSummary.remaining)}
              </h3>
              <p className="text-xs text-green-500 flex items-center mt-1">
                <span className="inline-block mr-1">●</span> Combined balance
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-5 bg-[#0f172a] border-[#1e293b]">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400">Income</p>
              <h3 className="text-2xl font-bold mt-1 text-white">
                {formatCurrency(totalSummary.income)}
              </h3>
              <p className="text-xs text-green-500 flex items-center mt-1">
                <span className="inline-block mr-1">●</span> Total earnings
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-5 bg-[#0f172a] border-[#1e293b]">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400">Expenses</p>
              <h3 className="text-2xl font-bold mt-1 text-white">
                {formatCurrency(totalSummary.expenses)}
              </h3>
              <p className="text-xs text-red-500 flex items-center mt-1">
                <span className="inline-block mr-1">●</span> Total expenses
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-5 bg-[#0f172a] border-[#1e293b]">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400">To Be Credited</p>
              <h3 className="text-2xl font-bold mt-1 text-white">
                {formatCurrency(totalSummary.toBeCredit)}
              </h3>
              <p className="text-xs text-purple-500 flex items-center mt-1">
                <span className="inline-block mr-1">●</span> Pending credits
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-5 bg-[#0f172a] border-[#1e293b]">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400">Salary</p>
              <h3 className="text-2xl font-bold mt-1 text-white">
                {formatCurrency(totalSummary.salary)}
              </h3>
              <p className="text-xs text-blue-500 flex items-center mt-1">
                <span className="inline-block mr-1">●</span> Total salary
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sub-Account Analysis */}
      <Card className="glass-card p-5 bg-[#0f172a] border-[#1e293b]">
        <h3 className="text-xl font-semibold mb-4">Sub-Account Analysis</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={accounts.map(account => {
                const transactions = accountTransactions[account.id] || [];
                const income = transactions.reduce((sum, t) => sum + t.earnings, 0);
                const expenses = transactions.reduce((sum, t) => sum + (t.investment + t.spending), 0);
                const toBeCredit = transactions.reduce((sum, t) => sum + t.toBeCredit, 0);
                const salary = transactions.reduce((sum, t) => sum + (t.salary || 0), 0);
                const remaining = income - expenses + toBeCredit + salary;
                
                return {
                  name: account.name,
                  income,
                  expenses,
                  toBeCredit,
                  salary,
                  remaining
                };
              })}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
              <YAxis tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `₹${value/1000}k`} />
              <Tooltip 
                formatter={(value: any) => formatCurrency(value)}
                labelFormatter={(label) => `Account: ${label}`}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" name="Income" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="toBeCredit" stroke="#a855f7" name="To Be Credited" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="salary" stroke="#3b82f6" name="Salary" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="remaining" stroke="#f59e0b" name="Remaining" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Financial Overview */}
      <Card className="glass-card p-5 bg-[#0f172a] border-[#1e293b]">
        <h3 className="text-xl font-semibold mb-4">Financial Overview</h3>
        <div className="h-64">
          <ChartContainer
            config={{
              income: { color: "#10b981", label: "Income" },
              expenses: { color: "#ef4444", label: "Expenses" },
              toBeCredit: { color: "#a855f7", label: "To Be Credited" },
              salary: { color: "#3b82f6", label: "Salary" },
              profit: { color: "#f59e0b", label: "Profit" },
            }}
          >
            <LineChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
              <YAxis tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `₹${value/1000}k`} />
              <ChartTooltip />
              <Legend />
              <Line type="monotone" dataKey="earnings" stroke="var(--color-income)" name="Income" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="investment" stroke="var(--color-expenses)" name="Investment" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="spending" stroke="var(--color-expenses)" name="Spending" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="toBeCredit" stroke="var(--color-toBeCredit)" name="To Be Credited" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="salary" stroke="var(--color-salary)" name="Salary" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" name="Profit" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ChartContainer>
        </div>
      </Card>

      {/* Yearly Analysis */}
      <Card className="glass-card p-5 bg-[#0f172a] border-[#1e293b]">
        <h3 className="text-xl font-semibold mb-4">Yearly Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
            <p className="text-green-500 font-medium">Best Performance Month</p>
            <h4 className="text-white text-xl mt-1">{bestMonth.month}</h4>
            <p className="text-green-300 mt-1">Profit: {formatCurrency(bestMonth.profit)}</p>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
            <p className="text-red-500 font-medium">Worst Performance Month</p>
            <h4 className="text-white text-xl mt-1">{worstMonth.month}</h4>
            <p className="text-red-300 mt-1">Profit: {formatCurrency(worstMonth.profit)}</p>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={yearlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" tick={{ fill: '#94a3b8' }} />
              <YAxis tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `₹${value/1000}k`} />
              <Tooltip 
                formatter={(value: any) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
              />
              <Legend />
              <Line type="monotone" dataKey="earnings" stroke="#10b981" name="Income" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="investment" stroke="#ef4444" name="Investment" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="spending" stroke="#ef4444" name="Expenses" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="toBeCredit" stroke="#a855f7" name="To Be Credited" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="salary" stroke="#3b82f6" name="Salary" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="profit" stroke="#f59e0b" name="Profit" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Monthly Overview */}
      <Card className="glass-card p-5 bg-[#0f172a] border-[#1e293b]">
        <h3 className="text-xl font-semibold mb-4">Monthly Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs">
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left">Month</th>
                <th className="px-4 py-3 text-right">Income</th>
                <th className="px-4 py-3 text-right">Investment</th>
                <th className="px-4 py-3 text-right">Expenses</th>
                <th className="px-4 py-3 text-right">To Be Credited</th>
                <th className="px-4 py-3 text-right">Salary</th>
                <th className="px-4 py-3 text-right">Profit</th>
                <th className="px-4 py-3 text-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month, idx) => (
                <tr key={idx} className="border-b border-border/30">
                  <td className="px-4 py-3 font-medium">{month.month}</td>
                  <td className="px-4 py-3 text-right text-green-400">{formatCurrency(month.earnings)}</td>
                  <td className="px-4 py-3 text-right text-red-400">{formatCurrency(month.investment)}</td>
                  <td className="px-4 py-3 text-right text-red-400">{formatCurrency(month.spending)}</td>
                  <td className="px-4 py-3 text-right text-purple-400">{formatCurrency(month.toBeCredit)}</td>
                  <td className="px-4 py-3 text-right text-blue-400">{formatCurrency(month.salary)}</td>
                  <td className={`px-4 py-3 text-right ${month.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(month.profit)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {month.roi}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AllAccountsAnalysis;
