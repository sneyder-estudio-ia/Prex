import React, { useState } from 'react';
import { Loan, LoanStatus, ItemCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, FileText, Package, AlertTriangle, CheckCircle, Search } from 'lucide-react';

interface AdminDashboardProps {
  loans: Loan[];
  onAddLoan: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ loans, onAddLoan }) => {
  const [filter, setFilter] = useState('ALL');

  // Stats calculation
  const totalActiveLoans = loans.filter(l => l.status === LoanStatus.ACTIVE).length;
  const totalLoanedAmount = loans.reduce((acc, curr) => acc + (curr.status === LoanStatus.ACTIVE ? curr.loanAmount : 0), 0);
  const potentialInterest = loans.reduce((acc, curr) => acc + (curr.status === LoanStatus.ACTIVE ? (curr.amountDue - curr.loanAmount) : 0), 0);

  const filteredLoans = filter === 'ALL' ? loans : loans.filter(l => l.status === filter);

  const pieData = [
    { name: 'Activos', value: loans.filter(l => l.status === LoanStatus.ACTIVE).length },
    { name: 'Vencidos', value: loans.filter(l => l.status === LoanStatus.OVERDUE).length },
    { name: 'Redimidos', value: loans.filter(l => l.status === LoanStatus.REDEEMED).length },
    { name: 'Remate', value: loans.filter(l => l.status === LoanStatus.DEFAULTED).length },
  ];

  const barData = [
    { name: 'Enero', prestado: 4000, recuperado: 2400 },
    { name: 'Feb', prestado: 3000, recuperado: 1398 },
    { name: 'Mar', prestado: 2000, recuperado: 9800 },
    { name: 'Abr', prestado: 2780, recuperado: 3908 },
    { name: 'May', prestado: 1890, recuperado: 4800 },
    { name: 'Jun', prestado: 2390, recuperado: 3800 },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Capital Prestado</p>
              <h3 className="text-2xl font-bold text-slate-800">${totalLoanedAmount.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Interés Proyectado</p>
              <h3 className="text-2xl font-bold text-emerald-600">+${potentialInterest.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Contratos Activos</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalActiveLoans}</h3>
            </div>
            <div className="p-2 bg-purple-100 rounded-full text-purple-600">
              <FileText size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Mora / Remate</p>
              <h3 className="text-2xl font-bold text-red-600">
                {loans.filter(l => l.status === LoanStatus.OVERDUE || l.status === LoanStatus.DEFAULTED).length}
              </h3>
            </div>
            <div className="p-2 bg-red-100 rounded-full text-red-600">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 h-64 md:h-80">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Flujo de Caja (Semestral)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} width={30} />
              <Tooltip />
              <Bar dataKey="prestado" fill="#3b82f6" name="Prestado" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recuperado" fill="#10b981" name="Recuperado" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 h-64 md:h-80">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Estado de Cartera</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500 mt-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loan Management Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h4 className="text-lg font-semibold text-slate-800">Gestión de Empeños</h4>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="w-full md:w-64 pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button 
              onClick={onAddLoan}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              + Nuevo
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-700 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4">ID</th>
                <th className="px-4 md:px-6 py-3 md:py-4 min-w-[150px]">Cliente / Artículo</th>
                <th className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">Vencimiento</th>
                <th className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">Monto / Deuda</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Estado</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4 font-mono text-xs">{loan.id}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="font-medium text-slate-800">{loan.clientName}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[120px]">{loan.item.name}</div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="text-slate-800 text-xs md:text-sm">{new Date(loan.dueDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="text-slate-800 font-medium text-xs md:text-sm">${loan.amountDue.toLocaleString()}</div>
                    <div className="text-[10px] md:text-xs text-slate-500">Prestado: ${loan.loanAmount.toLocaleString()}</div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-semibold whitespace-nowrap
                      ${loan.status === LoanStatus.ACTIVE ? 'bg-blue-100 text-blue-700' : ''}
                      ${loan.status === LoanStatus.OVERDUE ? 'bg-red-100 text-red-700' : ''}
                      ${loan.status === LoanStatus.REDEEMED ? 'bg-emerald-100 text-emerald-700' : ''}
                      ${loan.status === LoanStatus.DEFAULTED ? 'bg-gray-100 text-gray-700' : ''}
                    `}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                     <button className="text-blue-600 hover:underline text-xs whitespace-nowrap">Ver Detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;