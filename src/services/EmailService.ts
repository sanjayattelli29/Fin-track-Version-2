
import emailjs from '@emailjs/browser';

interface Transaction {
  id: string;
  date: string;
  investment: number;
  earnings: number;
  spending: number;
  toBeCredit: number;
  salary?: number;
  debt?: number;
  interestRate?: number;
  accountName?: string;
}

interface Account {
  id: string;
  name: string;
}

interface EmailResult {
  success: boolean;
  message?: string;
}

export class EmailService {
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private generateEmailData(
    username: string, 
    transactions: Transaction[], 
    accounts: Account[]
  ): Record<string, string> {
    const totalEarnings = transactions.reduce((sum, t) => sum + t.earnings, 0);
    const totalInvestment = transactions.reduce((sum, t) => sum + t.investment, 0);
    const totalSpending = transactions.reduce((sum, t) => sum + t.spending, 0);
    const totalToBeCredit = transactions.reduce((sum, t) => sum + t.toBeCredit, 0);
    const totalSalary = transactions.reduce((sum, t) => sum + (t.salary || 0), 0);
    const totalDebt = transactions.reduce((sum, t) => sum + (t.debt || 0), 0);
    const totalInterest = transactions.reduce((sum, t) => {
      if (t.debt && t.interestRate) {
        // Calculate monthly interest: (principal * annual rate) / (12 * 100)
        return sum + ((t.debt * t.interestRate) / (12 * 100));
      }
      return sum;
    }, 0);
    
    // Calculate commission and tax deductions (using average rates)
    const commissionTotal = transactions.reduce((sum, t) => sum + (t.earnings * 0.05), 0); // Assuming 5% average
    const taxTotal = transactions.reduce((sum, t) => sum + (t.earnings * 0.05), 0); // Assuming 5% average
    
    const totalProfit = totalEarnings - totalInvestment - totalSpending + totalToBeCredit + totalSalary - totalInterest;

    const financialSummary = `
Financial Report Summary:

Total Earnings: ${this.formatCurrency(totalEarnings)}
Total Investment: ${this.formatCurrency(totalInvestment)}
Total Spending: ${this.formatCurrency(totalSpending)}
Total To Be Credited: ${this.formatCurrency(totalToBeCredit)}
Total Salary: ${this.formatCurrency(totalSalary)}
${totalDebt > 0 ? `Total Debt: ${this.formatCurrency(totalDebt)}` : ''}
${totalInterest > 0 ? `Total Monthly Interest: ${this.formatCurrency(totalInterest)}` : ''}
${commissionTotal > 0 ? `Total Commission Deduction: ${this.formatCurrency(commissionTotal)}` : ''}
${taxTotal > 0 ? `Total Tax Deduction: ${this.formatCurrency(taxTotal)}` : ''}

Total Profit: ${this.formatCurrency(totalProfit)}
    `;

    return {
      name: username,
      time: new Date().toLocaleDateString(),
      message: financialSummary,
      total_earnings: this.formatCurrency(totalEarnings),
      total_investment: this.formatCurrency(totalInvestment),
      total_spending: this.formatCurrency(totalSpending),
      total_to_be_credit: this.formatCurrency(totalToBeCredit),
      total_salary: this.formatCurrency(totalSalary),
      total_debt: this.formatCurrency(totalDebt),
      total_interest: this.formatCurrency(totalInterest),
      total_commission: this.formatCurrency(commissionTotal),
      total_tax: this.formatCurrency(taxTotal),
      total_profit: this.formatCurrency(totalProfit)
    };
  }

  public async sendFinancialReport(
    email: string,
    username: string,
    transactions: Transaction[],
    accounts: Account[]
  ): Promise<EmailResult> {
    try {
      console.log(`Sending financial report email to ${email}`);
      
      const templateParams = this.generateEmailData(username, transactions, accounts);

      // Add the recipient email to template params
      const emailParams = {
        ...templateParams,
        to_email: email
      };

      console.log("Email template parameters:", emailParams);

      const response = await emailjs.send(
        "service_td76gkg",  // Service ID 
        "template_ugf8aqp", // Template ID
        emailParams,
        "4or4DfwkQKhEZgkL5" // Public Key
      );
      
      console.log("EmailJS Response:", response);
      
      return { 
        success: true,
        message: "Email has been sent successfully" 
      };
    } catch (error) {
      // Improved error handling
      let errorMessage = "An error occurred while sending the email";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Error sending email:", error);
      } else {
        console.error("Unknown error sending email:", error);
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }
}
