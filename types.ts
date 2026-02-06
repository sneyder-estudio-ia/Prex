export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  OVERDUE = 'OVERDUE',
  REDEEMED = 'REDEEMED',
  DEFAULTED = 'DEFAULTED', // Passed to shop
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