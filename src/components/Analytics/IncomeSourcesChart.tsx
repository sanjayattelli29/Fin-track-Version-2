
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/format';
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface IncomeSourcesChartProps {
  transactions: any[];
}

// Default income categories
const INCOME_CATEGORIES = [
  { name: 'Salary', color: '#3B82F6' },
  { name: 'Freelancing', color: '#10B981' },
  { name: 'Investments', color: '#8B5CF6' },
  { name: 'Side Business', color: '#F59E0B' },
  { name: 'Rental Income', color: '#EC4899' },
  { name: 'Dividends', color: '#14B8A6' },
  { name: 'Other Income', color: '#9CA3AF' }
];

const IncomeSourcesChart: React.FC<IncomeSourcesChartProps> = ({ transactions }) => {
  // Process transaction data to get income sources
  const incomeData = useMemo(() => {
    // Initialize income categories
    const incomeMap = INCOME_CATEGORIES.reduce((acc, category) => {
      acc[category.name] = { name: category.name, value: 0, color: category.color };
      return acc;
    }, {} as Record<string, { name: string, value: number, color: string }>);
    
    // Process all earnings (regular income)
    transactions.forEach(transaction => {
      if (transaction.earnings > 0) {
        incomeMap['Investments'].value += transaction.earnings;
      }
      
      // Process salary entries if they exist
      if (transaction.salary > 0) {
        incomeMap['Salary'].value += transaction.salary;
      }
      
      // Process "to be credit" as Freelancing income for demonstration
      if (transaction.toBeCredit > 0) {
        incomeMap['Freelancing'].value += transaction.toBeCredit;
      }
      
      // Process salary entries with specific purposes
      if (transaction.salaryEntries && Array.isArray(transaction.salaryEntries)) {
        transaction.salaryEntries.forEach((entry: any) => {
          const purpose = entry.purpose?.trim().toLowerCase();
          
          if (purpose) {
            if (purpose.includes('freelance') || purpose.includes('contract')) {
              incomeMap['Freelancing'].value += entry.amount;
            } else if (purpose.includes('invest') || purpose.includes('dividend')) {
              incomeMap['Investments'].value += entry.amount;
            } else if (purpose.includes('side') || purpose.includes('business')) {
              incomeMap['Side Business'].value += entry.amount;
            } else if (purpose.includes('rent') || purpose.includes('property')) {
              incomeMap['Rental Income'].value += entry.amount;
            } else {
              // Default to salary if no specific match
              incomeMap['Salary'].value += entry.amount;
            }
          } else {
            // No purpose specified, assume salary
            incomeMap['Salary'].value += entry.amount;
          }
        });
      }
    });
    
    // Convert to array and filter out zero values
    return Object.values(incomeMap).filter(item => item.value > 0);
  }, [transactions]);
  
  const totalIncome = useMemo(() => {
    return incomeData.reduce((sum, item) => sum + item.value, 0);
  }, [incomeData]);
  
  // For pie chart config
  const chartConfig = useMemo(() => {
    return incomeData.reduce((config, item) => {
      config[item.name] = { 
        color: item.color,
        label: item.name
      };
      return config;
    }, {} as Record<string, { color: string, label: string }>);
  }, [incomeData]);
  
  // If no income data available
  if (incomeData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground mb-2">No income data available</p>
        <p className="text-sm text-muted-foreground">
          Add earnings or salary transactions to see your income breakdown.
        </p>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Income Sources</h3>
      </div>
      
      <div className="h-[300px] mt-4">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={incomeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {incomeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value: number, name: string) => {
                      const percentage = Math.round((value / totalIncome) * 100);
                      return (
                        <div className="flex flex-col">
                          <span>{formatCurrency(value)}</span>
                          <span className="text-xs text-muted-foreground">{percentage}%</span>
                        </div>
                      );
                    }}
                  />
                } 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      <div className="mt-4 space-y-2">
        {incomeData.map((item) => (
          <Card key={item.name} className="overflow-hidden">
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span>{item.name}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-medium">{formatCurrency(item.value)}</span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round((item.value / totalIncome) * 100)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 mt-1.5">
                <div 
                  className="h-1.5 rounded-full" 
                  style={{ 
                    width: `${(item.value / totalIncome) * 100}%`,
                    backgroundColor: item.color 
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between">
          <span className="font-medium">Total Income:</span>
          <span className="font-bold">{formatCurrency(totalIncome)}</span>
        </div>
      </div>
    </div>
  );
};

export default IncomeSourcesChart;
