export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  OVERDUE = 'OVERDUE',
  REDEEMED = 'REDEEMED',
  DEFAULTED = 'DEFAULTED', // Passed to shop
  PENDING = 'PENDING', // Info only / No active loan
}

export enum ItemCategory {
  ELECTRONICS = 'Electrónica',
  JEWELRY = 'Joyería',
  TOOLS = 'Herramientas',
  VEHICLES = 'Vehículos',
  MUSICAL = 'Instrumentos',
  OTHER = 'Otros',
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  condition: number; // 1-10
  images: string[];
  marketValue: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number; // 1-5
  joinDate: string;
  totalLoans: number;
}

export interface Loan {
  id: string;
  clientId: string;
  clientName: string;
  item: Item;
  loanAmount: number; // The amount given to user
  interestRate: number; // Monthly percentage
  startDate: string; // ISO Date
  dueDate: string; // ISO Date
  status: LoanStatus;
  amountDue: number; // Total to pay to redeem
  currency: 'NIO' | 'USD';
  paymentFrequency: 'Diario' | 'Semanal' | 'Quincenal' | 'Mensual';
  duration: number; // Loan duration in months
}

export interface MarketplaceItem extends Item {
  price: number;
  loanId: string; // Origin loan
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
}

export interface ValuationResult {
  estimatedValue: number;
  suggestedLoan: number;
  riskAssessment: string;
  category: string;
}

export interface ChartData {
  name: string;
  value: number;
}