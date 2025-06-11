
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus, Divide, Equal } from 'lucide-react';

type Operation = '+' | '-' | '*' | '/' | '=' | null;

interface CalculationHistory {
  calculation: string;
  result: string;
  timestamp: Date;
}

const CalculatorTool = () => {
  const [display, setDisplay] = useState('0');
  const [secondaryDisplay, setSecondaryDisplay] = useState('');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load calculator history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('calculator_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error parsing calculator history:', error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('calculator_history', JSON.stringify(history));
  }, [history]);

  const clearAll = () => {
    setDisplay('0');
    setSecondaryDisplay('');
    setFirstOperand(null);
    setOperation(null);
    setWaitingForSecondOperand(false);
  };

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (nextOperation: Operation) => {
    const inputValue = parseFloat(display);

    // Update the secondary display to show the calculation
    if (operation && firstOperand !== null) {
      setSecondaryDisplay(`${firstOperand} ${getOperationSymbol(operation)} ${inputValue}`);
    } else {
      setSecondaryDisplay(`${inputValue} ${getOperationSymbol(nextOperation)}`);
    }

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operation) {
      const result = performCalculation();
      
      // Add to history
      const calculationString = `${firstOperand} ${getOperationSymbol(operation)} ${inputValue}`;
      setHistory(prev => [
        {
          calculation: calculationString,
          result: String(result),
          timestamp: new Date()
        },
        ...prev.slice(0, 19) // Keep only the 20 most recent calculations
      ]);
      
      setDisplay(String(result));
      setFirstOperand(result);
      
      // Update secondary display with the full calculation
      if (nextOperation === '=') {
        setSecondaryDisplay(`${calculationString} = ${result}`);
      } else {
        setSecondaryDisplay(`${result} ${getOperationSymbol(nextOperation)}`);
      }
    }

    setWaitingForSecondOperand(true);
    setOperation(nextOperation === '=' ? null : nextOperation);
  };

  const getOperationSymbol = (op: Operation): string => {
    switch (op) {
      case '+': return '+';
      case '-': return '-';
      case '*': return '×';
      case '/': return '÷';
      default: return '';
    }
  };

  const performCalculation = (): number => {
    if (firstOperand === null || operation === null) return parseFloat(display);
    
    const secondOperand = parseFloat(display);
    
    switch (operation) {
      case '+':
        return firstOperand + secondOperand;
      case '-':
        return firstOperand - secondOperand;
      case '*':
        return firstOperand * secondOperand;
      case '/':
        return secondOperand !== 0 ? firstOperand / secondOperand : NaN;
      default:
        return secondOperand;
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('calculator_history');
  };

  return (
    <div className="calculator-container bg-[#0a0f1d] rounded-lg">
      {/* Display */}
      <div className="bg-[#0f172a] text-white p-4 rounded-md mb-4 border border-[#1e293b]">
        <div className="text-sm text-gray-400 text-right overflow-x-auto whitespace-nowrap">
          {secondaryDisplay}
        </div>
        <div className="text-3xl font-mono overflow-x-auto whitespace-nowrap text-right">
          {display}
        </div>
      </div>

      {/* History toggle */}
      <div className="flex justify-between mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className="border-[#1e293b] text-white"
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </Button>
        
        {showHistory && history.length > 0 && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={clearHistory}
          >
            Clear History
          </Button>
        )}
      </div>

      {/* History section */}
      {showHistory && (
        <div className="history-section mb-4 max-h-40 overflow-y-auto bg-[#0f172a] dark:bg-[#0f172a] rounded-md p-2 border border-[#1e293b]">
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-2">No calculation history</p>
          ) : (
            <ul className="space-y-2">
              {history.map((item, index) => (
                <li key={index} className="text-sm border-b border-[#1e293b] pb-1">
                  <div className="flex justify-between">
                    <span className="text-white">{item.calculation} = <strong>{item.result}</strong></span>
                    <span className="text-muted-foreground text-xs">{formatDate(new Date(item.timestamp))}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Calculator buttons */}
      <div className="grid grid-cols-4 gap-2">
        {/* First row */}
        <Button variant="destructive" onClick={clearAll} className="col-span-1">C</Button>
        <Button variant="secondary" onClick={() => setDisplay(String(parseFloat(display) * -1))}>+/-</Button>
        <Button variant="secondary" onClick={() => handleOperation('/')}><Divide className="h-4 w-4" /></Button>
        <Button variant="secondary" onClick={() => handleOperation('*')}>×</Button>

        {/* Second row */}
        <Button onClick={() => inputDigit('7')} className="bg-[#1e293b] hover:bg-[#2d3748] text-white">7</Button>
        <Button onClick={() => inputDigit('8')} className="bg-[#1e293b] hover:bg-[#2d3748] text-white">8</Button>
        <Button onClick={() => inputDigit('9')} className="bg-[#1e293b] hover:bg-[#2d3748] text-white">9</Button>
        <Button variant="secondary" onClick={() => handleOperation('-')}><Minus className="h-4 w-4" /></Button>

        {/* Third row */}
        <Button onClick={() => inputDigit('4')} className="bg-[#1e293b] hover:bg-[#2d3748] text-white">4</Button>
        <Button onClick={() => inputDigit('5')} className="bg-[#1e293b] hover:bg-[#2d3748] text-white">5</Button>
        <Button onClick={() => inputDigit('6')} className="bg-[#1e293b] hover:bg-[#2d3748] text-white">6</Button>
        <Button variant="secondary" onClick={() => handleOperation('+')}><Plus className="h-4 w-4" /></Button>

        {/* Fourth row */}
        <Button onClick={() => inputDigit('1')} className="bg-[#1e293b] hover:bg-[#2d3748] text-white">1</Button>
        <Button onClick={() => inputDigit('2')} className="bg-[#1e293b] hover:bg-[#2d3748] text-white">2</Button>
        <Button onClick={() => inputDigit('3')} className="bg-[#1e293b] hover:bg-[#2d3748] text-white">3</Button>
        <Button variant="default" onClick={() => handleOperation('=')} className="bg-blue-500 hover:bg-blue-600 text-white"><Equal className="h-4 w-4" /></Button>

        {/* Fifth row */}
        <Button onClick={() => inputDigit('0')} className="col-span-2 bg-[#1e293b] hover:bg-[#2d3748] text-white">0</Button>
        <Button onClick={inputDecimal} className="bg-[#1e293b] hover:bg-[#2d3748] text-white">.</Button>
      </div>
    </div>
  );
};

export default CalculatorTool;
