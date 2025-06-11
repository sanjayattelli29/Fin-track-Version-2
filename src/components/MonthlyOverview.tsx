
import React, { useState } from 'react';
import { format, subYears, subMonths, addMonths } from 'date-fns';
import { ArrowRight, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  date: string;
  investment: number;
  earnings: number;
  spending: number;
  toBeCredit: number;
  salary?: number;
}

interface MonthlyOverviewProps {
  transactions: Transaction[];
  onExport?: () => void;
}

const MonthlyOverview: React.FC<MonthlyOverviewProps> = ({ transactions, onExport }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrevYear = () => {
    setCurrentDate(subYears(currentDate, 1));
  };

  const handleNextYear = () => {
    setCurrentDate(addMonths(currentDate, 12));
  };

  // Generate all months of the year
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentYear, i, 1);
    return {
      name: format(date, 'MMMM'),
      year: currentYear,
      monthIndex: i
    };
  });

  // Get monthly sums
  const monthlySums = months.map(month => {
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === month.monthIndex && 
             transactionDate.getFullYear() === month.year;
    });

    const totalInvestment = monthTransactions.reduce((sum, t) => sum + t.investment, 0);
    const totalSales = monthTransactions.reduce((sum, t) => sum + t.earnings, 0);
    const totalSpending = monthTransactions.reduce((sum, t) => sum + t.spending, 0);
    const totalSalary = monthTransactions.reduce((sum, t) => sum + (t.salary || 0), 0);
    const netTotal = totalSales - totalInvestment - totalSpending + totalSalary;

    return {
      ...month,
      investment: totalInvestment,
      sales: totalSales,
      spending: totalSpending,
      salary: totalSalary,
      netTotal: netTotal
    };
  });

  const totalInvestment = monthlySums.reduce((sum, month) => sum + month.investment, 0);
  const totalSales = monthlySums.reduce((sum, month) => sum + month.sales, 0);
  const totalSpending = monthlySums.reduce((sum, month) => sum + month.spending, 0);
  const totalSalary = monthlySums.reduce((sum, month) => sum + month.salary, 0);
  const totalNetAmount = totalSales - totalInvestment - totalSpending + totalSalary;
  
  const handleExportClick = () => {
    if (onExport) {
      onExport();
    }
  };

  return (
    <div className="glass-card rounded-xl p-5 mb-6 animate-fade-up bg-[#0f172a] border-[#1e293b]" style={{ animationDelay: '400ms' }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Monthly Overview</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrevYear}
            className="text-white hover:bg-[#1e293b]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-white">{currentYear}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNextYear}
            className="text-white hover:bg-[#1e293b]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          {onExport && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 ml-2 border-[#1e293b] text-white hover:bg-[#1e293b]"
              onClick={handleExportClick}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#1e293b]">
              <TableHead className="text-white">Month</TableHead>
              <TableHead className="text-right text-blue-400">Investment</TableHead>
              <TableHead className="text-right text-green-400">Sales</TableHead>
              <TableHead className="text-right text-red-400">Spending</TableHead>
              <TableHead className="text-right text-purple-400">Salary</TableHead>
              <TableHead className="text-right text-yellow-400">Net</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlySums.map((month) => (
              <TableRow key={month.monthIndex} className="border-b border-[#1e293b]/30">
                <TableCell className="font-medium text-white">
                  {month.name}
                </TableCell>
                <TableCell className="text-right text-blue-400">
                  {formatCurrency(month.investment)}
                </TableCell>
                <TableCell className="text-right text-green-400">
                  {formatCurrency(month.sales)}
                </TableCell>
                <TableCell className="text-right text-red-400">
                  {formatCurrency(month.spending)}
                </TableCell>
                <TableCell className="text-right text-purple-400">
                  {formatCurrency(month.salary)}
                </TableCell>
                <TableCell className={`text-right ${month.netTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(month.netTotal)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t border-t-[#1e293b] font-medium">
              <TableCell className="text-white">Total</TableCell>
              <TableCell className="text-right text-blue-400">{formatCurrency(totalInvestment)}</TableCell>
              <TableCell className="text-right text-green-400">{formatCurrency(totalSales)}</TableCell>
              <TableCell className="text-right text-red-400">{formatCurrency(totalSpending)}</TableCell>
              <TableCell className="text-right text-purple-400">{formatCurrency(totalSalary)}</TableCell>
              <TableCell className={`text-right ${totalNetAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(totalNetAmount)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MonthlyOverview;
