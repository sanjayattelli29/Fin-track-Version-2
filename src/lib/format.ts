
/**
 * Get user's preferred currency from local storage or use default
 */
export const getUserCurrency = (): { code: string, symbol: string } => {
  const savedProfile = localStorage.getItem("user_profile");
  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    const currencyString = profile.currency || "INR (₹)";
    
    // Extract currency code and symbol
    if (currencyString.includes("INR")) return { code: "INR", symbol: "₹" };
    if (currencyString.includes("USD")) return { code: "USD", symbol: "$" };
    if (currencyString.includes("EUR")) return { code: "EUR", symbol: "€" };
    if (currencyString.includes("GBP")) return { code: "GBP", symbol: "£" };
  }
  
  // Default to INR
  return { code: "INR", symbol: "₹" };
};

/**
 * Format currency values consistently throughout the application
 * @param amount Numeric value to format as currency
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number) => {
  // Don't append a zero for whole amounts
  const maximumFractionDigits = Number.isInteger(amount) ? 0 : 2;
  const { code, symbol } = getUserCurrency();
  
  let formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: maximumFractionDigits,
  }).format(amount);
  
  // Handle specific formatting for different currencies if needed
  if (code === "USD") {
    formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: maximumFractionDigits,
    }).format(amount);
  } else if (code === "EUR") {
    formattedAmount = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: maximumFractionDigits,
    }).format(amount);
  } else if (code === "GBP") {
    formattedAmount = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: maximumFractionDigits,
    }).format(amount);
  }
  
  return formattedAmount;
};

/**
 * Format percentage values consistently throughout the application
 * @param value Numeric value to format as percentage
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 2) => {
  return `${value.toFixed(decimals)}%`;
};
