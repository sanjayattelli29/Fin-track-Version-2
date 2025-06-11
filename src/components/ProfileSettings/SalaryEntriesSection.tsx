
import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SalaryEntry {
  id?: string;
  name: string;
  purpose: string;
  amount: number;
  date: string;
}

interface SalaryEntriesSectionProps {
  salaryEntries: SalaryEntry[];
  onDeleteSalaryEntry: (id: string | undefined) => Promise<void>;
  onEditSalaryEntry: (entry: SalaryEntry) => Promise<void>;
  onExportEntries: () => void;
}

const SalaryEntriesSection: React.FC<SalaryEntriesSectionProps> = ({
  salaryEntries,
  onDeleteSalaryEntry,
  onEditSalaryEntry,
  onExportEntries,
}) => {
  return (
    <div className="glass-card p-6 rounded-xl mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Salary Entries</h2>
        <Button onClick={onExportEntries}>
          <FileDown className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaryEntries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-4"
                >
                  No salary entries found.
                </TableCell>
              </TableRow>
            ) : (
              salaryEntries.map((entry) => (
                <TableRow key={entry.id || entry.date + entry.name}>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.purpose || "-"}</TableCell>
                  <TableCell>{entry.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditSalaryEntry(entry)}
                        className="h-8 w-8"
                        title="Edit entry"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteSalaryEntry(entry.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Delete entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SalaryEntriesSection;
