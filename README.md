# 💰 Money Harmony Keeper

A comprehensive personal finance management application built with modern web technologies. Track your income, expenses, manage multiple accounts, and gain valuable insights into your financial health with beautiful visualizations and automated reporting.

## 🚀 Features

### 📊 Financial Management
- **Transaction Tracking**: Record and categorize income and expenses
- **Multi-Account Support**: Manage checking, savings, credit cards, and investment accounts
- **Real-time Balance Updates**: Automatic calculations and balance tracking
- **Category Management**: Customizable expense and income categories

### 📈 Analytics & Insights
- **Interactive Dashboards**: Beautiful charts and graphs powered by modern visualization libraries
- **Monthly Analysis**: Detailed breakdowns of spending patterns and trends
- **Yearly Reports**: Annual financial summaries and year-over-year comparisons
- **Budget Tracking**: Set and monitor budget goals with progress indicators
- **Debt Management**: Track and visualize debt payoff progress

### 🔧 Advanced Features
- **Automated Email Reports**: Monthly and yearly financial summaries sent directly to your inbox
- **Data Export**: Export your financial data in various formats (CSV, PDF)
- **Dark/Light Mode**: Customizable interface themes
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Sync**: Cloud-based data storage with instant synchronization

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development

### Backend & Database
- **Supabase** - Backend-as-a-Service providing:
  - PostgreSQL database with real-time subscriptions
  - Authentication and user management
  - Row Level Security (RLS)
  - Auto-generated APIs
  - Real-time data synchronization

### Additional Libraries
- **EmailJS** - Client-side email sending for automated reports
- **Recharts** - Beautiful and customizable chart components
- **React Query** - Server state management and caching
- **React Router** - Client-side routing
- **Date-fns** - Modern date utility library
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation

## 📁 Project Structure

```
money-harmony-keeper/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   │   ├── charts/         # Chart components
│   │   └── forms/          # Form components
│   ├── pages/              # Main application pages
│   │   ├── Dashboard/      # Main dashboard
│   │   ├── Transactions/   # Transaction management
│   │   ├── Accounts/       # Account management
│   │   ├── Reports/        # Analytics and reports
│   │   └── Settings/       # User settings
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and configurations
│   │   ├── supabase.ts     # Supabase client configuration
│   │   ├── email.ts        # EmailJS configuration
│   │   └── utils.ts        # General utilities
│   ├── types/              # TypeScript type definitions
│   ├── store/              # State management
│   └── styles/             # Global styles and Tailwind config
├── public/                 # Static assets
├── supabase/              # Database migrations and functions
│   ├── migrations/        # SQL migration files
│   └── functions/         # Edge functions
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account
- EmailJS account (for email reports)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/money-harmony-keeper.git
   cd money-harmony-keeper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the database migrations:
     ```bash
     npx supabase db push
     ```

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 🗄️ Database Schema

### Core Tables
- **users** - User authentication and profile data
- **accounts** - Bank accounts, credit cards, etc.
- **transactions** - All financial transactions
- **categories** - Expense and income categories
- **budgets** - Budget goals and tracking
- **debts** - Debt accounts and payment tracking

### Key Features
- **Row Level Security (RLS)** - Data isolation per user
- **Real-time subscriptions** - Live data updates
- **Automated timestamps** - Created/updated tracking
- **Soft deletes** - Data recovery capabilities

## 📧 Email Configuration

Set up automated email reports using EmailJS:

1. Create an EmailJS account
2. Set up an email service (Gmail, Outlook, etc.)
3. Create email templates for:
   - Monthly financial summaries
   - Budget alerts
   - Debt payment reminders
4. Configure the environment variables

## 📊 Analytics Features

### Monthly Analysis
- Income vs. expenses comparison
- Category-wise spending breakdown
- Account balance trends
- Budget performance metrics

### Yearly Reports
- Annual financial summary
- Year-over-year growth analysis
- Tax-ready expense reports
- Investment performance tracking

### Visualizations
- Interactive pie charts for category distribution
- Line graphs for balance trends
- Bar charts for monthly comparisons
- Progress bars for debt payoff and savings goals

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
npx vercel --prod
```

### Netlify
```bash
npm run build
# Deploy the dist/ folder to Netlify
```

### Environment Variables for Production
Ensure all environment variables are set in your deployment platform.

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- 📧 Email: support@moneyharmonykeeper.com
- 💬 Discord: [Join our community](https://discord.gg/moneyharmony)
- 📖 Documentation: [Full documentation](https://docs.moneyharmonykeeper.com)

## 🙏 Acknowledgments

- Supabase team for the amazing backend platform
- EmailJS for simplified email integration
- The React and Vite communities for excellent tooling
- Open source contributors who make projects like this possible

---

**Money Harmony Keeper** - Take control of your financial future with intelligent insights and automated reporting.