import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, Download, DollarSign, TrendingDown, TrendingUp, CreditCard, Award, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
interface Transaction {
  date: string;
  investment: number;
  earnings: number;
  spending: number;
  toBeCredit: number;
}
interface YearlyAnalysisProps {
  transactions: Transaction[];
  onExport: () => void;
}
const YearlyAnalysis: React.FC<YearlyAnalysisProps> = ({
  transactions,
  onExport
}) => {
  // Calculate total investment, earnings, and profit/loss
  const totalInvestment = transactions.reduce((sum, t) => sum + t.investment, 0);
  const totalEarnings = transactions.reduce((sum, t) => sum + t.earnings, 0);
  const totalSpending = transactions.reduce((sum, t) => sum + t.spending, 0);
  const totalToBeCredit = transactions.reduce((sum, t) => sum + t.toBeCredit, 0);
  const netProfit = totalEarnings - totalInvestment - totalSpending + totalToBeCredit;

  // Calculate ROI
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment * 100).toFixed(2) : '0.00';

  // Group transactions by month for performance analysis
  const getMonthlyPerformance = () => {
    const monthlyData: Record<string, {
      month: string;
      year: number;
      investment: number;
      earnings: number;
      spending: number;
      toBeCredit: number;
      profit: number;
      roi: number;
    }> = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleString('default', {
        month: 'short'
      });
      if (!monthlyData[key]) {
        monthlyData[key] = {
          month: monthName,
          year: date.getFullYear(),
          investment: 0,
          earnings: 0,
          spending: 0,
          toBeCredit: 0,
          profit: 0,
          roi: 0
        };
      }
      monthlyData[key].investment += t.investment;
      monthlyData[key].earnings += t.earnings;
      monthlyData[key].spending += t.spending;
      monthlyData[key].toBeCredit += t.toBeCredit;
    });

    // Calculate profit and ROI for each month
    Object.values(monthlyData).forEach(data => {
      data.profit = data.earnings - data.investment - data.spending + data.toBeCredit;
      data.roi = data.investment > 0 ? data.profit / data.investment * 100 : 0;
    });
    return Object.values(monthlyData).sort((a, b) => {
      return b.roi - a.roi; // Sort by ROI in descending order
    });
  };
  const monthlyPerformance = getMonthlyPerformance();

  // Get best and worst performing months
  const bestMonth = monthlyPerformance.length > 0 ? monthlyPerformance[0] : null;
  const worstMonth = monthlyPerformance.length > 0 ? monthlyPerformance[monthlyPerformance.length - 1] : null;

  // Prepare data for line chart - sort by date
  const chartData = [...monthlyPerformance].sort((a, b) => {
    const monthsOrder = {
      'Jan': 0,
      'Feb': 1,
      'Mar': 2,
      'Apr': 3,
      'May': 4,
      'Jun': 5,
      'Jul': 6,
      'Aug': 7,
      'Sep': 8,
      'Oct': 9,
      'Nov': 10,
      'Dec': 11
    };
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    return monthsOrder[a.month as keyof typeof monthsOrder] - monthsOrder[b.month as keyof typeof monthsOrder];
  }).map(data => ({
    name: `${data.month}`,
    profit: data.profit,
    earnings: data.earnings,
    investment: data.investment,
    spending: data.spending,
    roi: data.roi
  }));

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({
    active,
    payload,
    label
  }: any) => {
    if (active && payload && payload.length) {
      return <div className="bg-[#0f172a] p-3 border border-[#1e293b] rounded shadow-lg">
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-green-400">Earnings: {formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-blue-400">Investment: {formatCurrency(payload[1].value)}</p>
          <p className="text-xs text-red-400">Spending: {formatCurrency(payload[2].value)}</p>
          <p className="text-xs text-purple-400">Net Profit: {formatCurrency(payload[3].value)}</p>
          <p className="text-xs text-yellow-400">ROI: {payload[4].value.toFixed(2)}%</p>
        </div>;
    }
    return null;
  };
  return <div className="glass-card rounded-xl p-5 mb-6 animate-fade-up bg-[#0f172a] border-[#1e293b]" style={{
    animationDelay: '700ms'
  }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Yearly Analysis</h3>
        
        <Button variant="outline" size="sm" onClick={onExport} className="border-[#1e293b] text-white hover:bg-[#1e293b]">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {bestMonth && <div className="bg-[#0a2b22] rounded-lg p-4 border border-[#0d3928]">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-green-500" />
              <h4 className="text-sm font-medium text-green-400">Best Performing Month</h4>
            </div>
            <p className="text-lg font-semibold text-white">{bestMonth.month}-{bestMonth.year}</p>
            <p className="text-sm text-green-500 font-medium mt-1">ROI: +{bestMonth.roi.toFixed(2)}%</p>
          </div>}
        
        {worstMonth && <div className="bg-[#2b0a1a] rounded-lg p-4 border border-[#3d102b]">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h4 className="text-sm font-medium text-red-400">Challenging Month</h4>
            </div>
            <p className="text-lg font-semibold text-white">{worstMonth.month}-{worstMonth.year}</p>
            <p className="text-sm text-red-500 font-medium mt-1">ROI: {worstMonth.roi.toFixed(2)}%</p>
          </div>}
      </div>

      {/* Line Chart for Yearly Performance Analysis */}
      <div className="h-72 mb-8 bg-[#0f172a]/50 p-4 rounded-lg border border-[#1e293b]">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Yearly Performance Trends</h4>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={chartData} margin={{
          top: 5,
          right: 20,
          left: 10,
          bottom: 5
        }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{
            fill: '#94a3b8'
          }} />
            <YAxis yAxisId="left" tick={{
            fill: '#94a3b8'
          }} tickFormatter={value => `₹${value / 1000}K`} />
            <YAxis yAxisId="right" orientation="right" domain={[-100, 100]} tick={{
            fill: '#94a3b8'
          }} tickFormatter={value => `${value}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="earnings" stroke="#10b981" activeDot={{
            r: 8
          }} strokeWidth={2} name="Earnings" dot={{
            r: 4
          }} />
            <Line yAxisId="left" type="monotone" dataKey="investment" stroke="#3b82f6" strokeWidth={2} name="Investment" dot={{
            r: 4
          }} />
            <Line yAxisId="left" type="monotone" dataKey="spending" stroke="#ef4444" strokeWidth={2} name="Spending" dot={{
            r: 4
          }} />
            <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#a855f7" strokeWidth={2.5} name="Net Profit" dot={{
            r: 4
          }} />
            <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#eab308" strokeWidth={2} name="ROI (%)" dot={{
            r: 4
          }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#0f172a] rounded-lg p-4 border border-[#1e293b]">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-blue-500" />
            <h4 className="text-xs font-medium text-gray-400">Total Investment</h4>
          </div>
          <p className="text-lg font-semibold text-white">{formatCurrency(totalInvestment)}</p>
        </div>
        
        <div className="bg-[#0f172a] rounded-lg p-4 border border-[#1e293b]">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUp className="h-4 w-4 text-green-500" />
            <h4 className="text-xs font-medium text-gray-400">Total Earnings</h4>
          </div>
          <p className="text-lg font-semibold text-white">{formatCurrency(totalEarnings)}</p>
        </div>
        
        <div className="bg-[#0f172a] rounded-lg p-4 border border-[#1e293b]">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDown className="h-4 w-4 text-red-500" />
            <h4 className="text-xs font-medium text-gray-400">Total Spending</h4>
          </div>
          <p className="text-lg font-semibold text-red-500">{formatCurrency(totalSpending)}</p>
        </div>
        
        <div className="bg-[#0f172a] rounded-lg p-4 border border-[#1e293b]">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-purple-500" />
            <h4 className="text-xs font-medium text-gray-400">To Be Credited</h4>
          </div>
          <p className="text-lg font-semibold text-purple-500">{formatCurrency(totalToBeCredit)}</p>
        </div>
        
        <div className="bg-[#0f172a] rounded-lg p-4 border border-[#1e293b]">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <h4 className="text-xs font-medium text-gray-400">ROI</h4>
          </div>
          <p className={`text-lg font-semibold ${parseFloat(roi) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {roi}%
          </p>
        </div>
      </div>
      
      {/* Net Changes Card - Added from the image example */}
      
    </div>;
};
export default YearlyAnalysis;