
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/format';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface SpendingBreakdownProps {
  transactions: any[];
}

// Default spending categories
const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#10B981' },
  { name: 'Travel', color: '#3B82F6' },
  { name: 'Rent', color: '#8B5CF6' },
  { name: 'Entertainment', color: '#F59E0B' },
  { name: 'Utilities', color: '#EC4899' },
  { name: 'Shopping', color: '#6366F1' },
  { name: 'Healthcare', color: '#EF4444' },
  { name: 'Education', color: '#14B8A6' },
  { name: 'Others', color: '#9CA3AF' }
];

const SpendingBreakdown: React.FC<SpendingBreakdownProps> = ({ transactions }) => {
  const [viewType, setViewType] = useState<'pie' | 'bar'>('pie');
  
  // Categorize spending based on purpose in salaryEntries
  const spendingData = useMemo(() => {
    // Initialize categories with zeros
    const categoryMap = DEFAULT_CATEGORIES.reduce((acc, category) => {
      acc[category.name] = { name: category.name, value: 0, color: category.color };
      return acc;
    }, {} as Record<string, { name: string, value: number, color: string }>);
    
    // Process all spending transactions
    transactions.forEach(transaction => {
      // Process regular spending
      if (transaction.spending > 0) {
        categoryMap['Others'].value += transaction.spending;
      }
      
      // Process salary entries if they exist (these often have purposes attached)
      if (transaction.salaryEntries && Array.isArray(transaction.salaryEntries)) {
        transaction.salaryEntries.forEach((entry: any) => {
          const purpose = entry.purpose?.trim();
          if (purpose) {
            // Try to match the purpose with one of our categories
            const matchedCategory = DEFAULT_CATEGORIES.find(
              cat => purpose.toLowerCase().includes(cat.name.toLowerCase())
            );
            
            if (matchedCategory) {
              categoryMap[matchedCategory.name].value += entry.amount;
            } else {
              categoryMap['Others'].value += entry.amount;
            }
          } else {
            // No purpose specified
            categoryMap['Others'].value += entry.amount;
          }
        });
      }
    });
    
    // Convert to array and filter out zero values
    return Object.values(categoryMap).filter(item => item.value > 0);
  }, [transactions]);
  
  const totalSpending = useMemo(() => {
    return spendingData.reduce((sum, item) => sum + item.value, 0);
  }, [spendingData]);
  
  // For pie chart config
  const chartConfig = useMemo(() => {
    return spendingData.reduce((config, item) => {
      config[item.name] = { 
        color: item.color,
        label: item.name
      };
      return config;
    }, {} as Record<string, { color: string, label: string }>);
  }, [spendingData]);
  
  // If no spending data is available
  if (spendingData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground mb-2">No spending data available</p>
        <p className="text-sm text-muted-foreground">
          Add some transactions with spending amounts to see your breakdown.
        </p>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Spending Categories</h3>
        <Select 
          value={viewType} 
          onValueChange={(value) => setViewType(value as 'pie' | 'bar')}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pie">Pie Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-[300px] mt-4">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={spendingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {spendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value: number, name: string) => {
                      const percentage = Math.round((value / totalSpending) * 100);
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
        {spendingData.map((item) => (
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
                    {Math.round((item.value / totalSpending) * 100)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 mt-1.5">
                <div 
                  className="h-1.5 rounded-full" 
                  style={{ 
                    width: `${(item.value / totalSpending) * 100}%`,
                    backgroundColor: item.color 
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SpendingBreakdown;
