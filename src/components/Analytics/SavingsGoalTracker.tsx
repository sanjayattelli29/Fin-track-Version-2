
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/format';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Save, Trophy } from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface SavingsGoalTrackerProps {
  transactions: any[];
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

const GOAL_CATEGORIES = [
  { name: 'Emergency Fund', color: '#F59E0B' },
  { name: 'Vacation', color: '#3B82F6' },
  { name: 'Home', color: '#10B981' },
  { name: 'Car', color: '#EC4899' },
  { name: 'Education', color: '#8B5CF6' },
  { name: 'Retirement', color: '#14B8A6' },
  { name: 'Other', color: '#9CA3AF' }
];

const SavingsGoalTracker: React.FC<SavingsGoalTrackerProps> = ({ transactions }) => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState<Omit<SavingsGoal, 'id'>>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: '',
    category: 'Emergency Fund'
  });
  
  const { toast } = useToast();
  
  // Load saved goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('savings_goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (error) {
        console.error("Error loading savings goals:", error);
      }
    }
  }, []);
  
  // Calculate total savings from transactions
  const totalSavings = React.useMemo(() => {
    const monthlySavings = transactions.reduce((acc, t) => {
      const income = (t.earnings || 0) + (t.salary || 0) + (t.toBeCredit || 0);
      const expenses = (t.spending || 0) + (t.investment || 0);
      return acc + (income - expenses);
    }, 0);
    
    return Math.max(0, monthlySavings); // Ensure we don't go negative
  }, [transactions]);
  
  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savings_goals', JSON.stringify(goals));
  }, [goals]);
  
  const handleAddGoal = () => {
    if (!newGoal.name || newGoal.targetAmount <= 0) {
      toast({
        title: "Missing information",
        description: "Please provide a name and target amount.",
        variant: "destructive"
      });
      return;
    }
    
    const goal: SavingsGoal = {
      ...newGoal,
      id: uuidv4()
    };
    
    setGoals([...goals, goal]);
    setNewGoal({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: '',
      category: 'Emergency Fund'
    });
    setIsAddingGoal(false);
    
    toast({
      title: "Goal added",
      description: `Your savings goal "${goal.name}" has been added.`
    });
  };
  
  const handleEditGoal = (goal: SavingsGoal) => {
    setNewGoal({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline,
      category: goal.category,
    });
    setIsEditingGoal(goal.id);
  };
  
  const handleUpdateGoal = () => {
    if (!isEditingGoal) return;
    
    setGoals(goals.map(goal => 
      goal.id === isEditingGoal 
        ? { ...goal, ...newGoal, id: goal.id } 
        : goal
    ));
    
    setNewGoal({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: '',
      category: 'Emergency Fund'
    });
    
    setIsEditingGoal(null);
    
    toast({
      title: "Goal updated",
      description: "Your savings goal has been updated successfully."
    });
  };
  
  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
    
    toast({
      title: "Goal deleted",
      description: "Your savings goal has been deleted."
    });
  };
  
  // Automatically allocate available savings to goals
  const handleAllocateSavings = () => {
    if (totalSavings <= 0 || goals.length === 0) {
      toast({
        title: "Cannot allocate savings",
        description: "You need positive savings and at least one goal to allocate savings.",
        variant: "destructive"
      });
      return;
    }
    
    // First, calculate how much is needed to complete all goals
    const totalNeeded = goals.reduce((sum, goal) => {
      const remaining = goal.targetAmount - goal.currentAmount;
      return sum + (remaining > 0 ? remaining : 0);
    }, 0);
    
    // If we have enough to complete all goals
    if (totalSavings >= totalNeeded) {
      const updatedGoals = goals.map(goal => {
        return {
          ...goal,
          currentAmount: goal.targetAmount // Complete the goal
        };
      });
      
      setGoals(updatedGoals);
      
      toast({
        title: "All goals funded!",
        description: `You had enough savings to fully fund all your goals! (${formatCurrency(totalSavings)})`,
      });
    } else {
      // Distribute proportionally if we can't complete all goals
      let remainingSavings = totalSavings;
      
      const updatedGoals = goals.map(goal => {
        const remaining = goal.targetAmount - goal.currentAmount;
        
        if (remaining <= 0) return goal; // Goal already completed
        
        // Calculate proportional allocation
        const allocation = Math.min(
          remaining,
          (remaining / totalNeeded) * totalSavings
        );
        
        remainingSavings -= allocation;
        
        return {
          ...goal,
          currentAmount: goal.currentAmount + allocation
        };
      });
      
      setGoals(updatedGoals);
      
      toast({
        title: "Savings allocated",
        description: `${formatCurrency(totalSavings)} has been allocated across your goals.`,
      });
    }
  };
  
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };
  
  // Get category color
  const getCategoryColor = (category: string) => {
    const foundCategory = GOAL_CATEGORIES.find(c => c.name === category);
    return foundCategory?.color || '#9CA3AF';
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Savings Goals</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleAllocateSavings}
            disabled={totalSavings <= 0 || goals.length === 0}
          >
            <Trophy className="mr-1 h-4 w-4" />
            Allocate Savings
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddingGoal(true)}
          >
            <PlusCircle className="mr-1 h-4 w-4" />
            Add Goal
          </Button>
        </div>
      </div>
      
      {goals.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-2">No savings goals yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create savings goals to track your financial progress
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddingGoal(true)}
          >
            <PlusCircle className="mr-1 h-4 w-4" />
            Create First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {goals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const formattedProgress = Math.min(100, Math.round(progress));
            const isCompleted = formattedProgress >= 100;
            const categoryColor = getCategoryColor(goal.category);
            
            return (
              <Card key={goal.id} className={`${isCompleted ? 'border-green-500' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: categoryColor }}
                      ></div>
                      <CardTitle className="text-base">{goal.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => handleEditGoal(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      {goal.category}
                      {goal.deadline && ` • Due: ${goal.deadline}`}
                    </span>
                    <span className="font-medium">
                      {formattedProgress}%
                    </span>
                  </div>
                  <Progress value={formattedProgress} className="h-2" />
                  <div className="flex justify-between mt-2">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                </CardContent>
                {isCompleted && (
                  <CardFooter className="pt-0">
                    <div className="text-green-500 text-sm font-medium flex items-center">
                      <Trophy className="h-4 w-4 mr-1" />
                      Goal achieved!
                    </div>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}
      
      <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Savings Goal</DialogTitle>
            <DialogDescription>
              Create a new goal to track your savings progress.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. New Car, Emergency Fund" 
                value={newGoal.name}
                onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newGoal.category}
                onValueChange={(value) => setNewGoal({...newGoal, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map(category => (
                    <SelectItem key={category.name} value={category.name}>
                      <div className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-2" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount</Label>
                <Input 
                  id="targetAmount" 
                  type="number" 
                  placeholder="50000" 
                  value={newGoal.targetAmount || ''}
                  onChange={(e) => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentAmount">Current Amount</Label>
                <Input 
                  id="currentAmount" 
                  type="number" 
                  placeholder="10000" 
                  value={newGoal.currentAmount || ''}
                  onChange={(e) => setNewGoal({...newGoal, currentAmount: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (Optional)</Label>
              <Input 
                id="deadline" 
                type="date" 
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingGoal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>
              <Save className="mr-2 h-4 w-4" />
              Save Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!isEditingGoal} onOpenChange={(open) => !open && setIsEditingGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Savings Goal</DialogTitle>
            <DialogDescription>
              Update your savings goal information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Goal Name</Label>
              <Input 
                id="edit-name" 
                placeholder="e.g. New Car, Emergency Fund" 
                value={newGoal.name}
                onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={newGoal.category}
                onValueChange={(value) => setNewGoal({...newGoal, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map(category => (
                    <SelectItem key={category.name} value={category.name}>
                      <div className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-2" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-targetAmount">Target Amount</Label>
                <Input 
                  id="edit-targetAmount" 
                  type="number" 
                  placeholder="50000" 
                  value={newGoal.targetAmount || ''}
                  onChange={(e) => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-currentAmount">Current Amount</Label>
                <Input 
                  id="edit-currentAmount" 
                  type="number" 
                  placeholder="10000" 
                  value={newGoal.currentAmount || ''}
                  onChange={(e) => setNewGoal({...newGoal, currentAmount: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-deadline">Deadline (Optional)</Label>
              <Input 
                id="edit-deadline" 
                type="date" 
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingGoal(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGoal}>
              <Save className="mr-2 h-4 w-4" />
              Update Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {totalSavings > 0 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Available for allocation</h4>
                <p className="text-sm text-muted-foreground">Current monthly savings</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-green-500">
                  {formatCurrency(totalSavings)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavingsGoalTracker;
