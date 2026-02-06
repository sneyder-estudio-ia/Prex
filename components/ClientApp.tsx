import React, { useState, useRef, useEffect } from 'react';
import { Loan, MarketplaceItem, ValuationResult, LoanStatus } from '../types';
import { appraiseItem } from '../services/geminiService';
import { Calculator, ShoppingBag, CreditCard, Bell, Camera, Loader2, ArrowRight, CheckCircle, AlertTriangle, Tag, Clock, ChevronRight, Eye, Wallet, HelpCircle, ArrowLeft, Percent, Info, Calendar, FileText, ClipboardList, Printer, Download, History, X } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ClientAppProps {
  loans: Loan[];
  marketplaceItems: MarketplaceItem[];
  currentUserId: string;
}

const NOTIFICATIONS = [
  { 
    id: 1, 
    title: 'Recordatorio de Pago', 
    message: 'Tu préstamo del PlayStation 5 vence en 3 días. Evita recargos por mora.', 
    date: 'Hace 2 horas', 
    type: 'ALERT', 
    read: false 
  },
  { 
    id: 2, 
    title: '¡Oferta Especial!', 
    message: 'Tenemos un descuento del 10% en intereses si refrendas tu contrato hoy.', 
    date: 'Hace 1 día', 
    type: 'OFFER', 
    read: true 
  },
  { 
    id: 3, 
    title: 'Pago Confirmado', 
    message: 'Hemos recibido tu abono de $50.00 correctamente. Tu saldo se ha actualizado.', 
    date: 'Hace 5 días', 
    type: 'SUCCESS', 
    read: true 
  },
  {
    id: 4,
    title: 'Artículo Vendido',
    message: 'El artículo que marcaste como "Interesado" ya no está disponible.',
    date: 'Hace 1 semana',
    type: 'INFO',
    read: true
  }
];

const ClientApp: React.FC<ClientAppProps> = ({ loans, marketplaceItems, currentUserId }) => {
  const [activeTab, setActiveTab] = useState<'loans' | 'calculator' | 'shop' | 'notifications'>('loans');
  
  // State to track which loan is currently opening the modal
  const [confirmingLoanId, setConfirmingLoanId] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  
  // State to track interest payment modal
  const [interestPaymentLoanId, setInterestPaymentLoanId] = useState<string | null>(null);

  // State to track the step of the payment process
  const [paymentStep, setPaymentStep] = useState<'SELECT_TYPE' | 'ENTER_AMOUNT' | 'CONFIRM_DEPOSIT'>('SELECT_TYPE');
  
  // State to track payment details
  const [paymentType, setPaymentType] = useState<'NORMAL' | 'CUSTOM'>('NORMAL');
  const [customAmount, setCustomAmount] = useState('');

  // State to track loans that have a pending payment verification (orange button)
  const [pendingLoanIds, setPendingLoanIds] = useState<string[]>([]);
  
  // Receipt State
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptMode, setReceiptMode] = useState<'FULL' | 'LAST'>('LAST');

  const userLoans = loans.filter(l => l.clientId === currentUserId);
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  // Reset selected loan when tab changes
  useEffect(() => {
    if (activeTab !== 'loans') {
        setSelectedLoan(null);
    }
  }, [activeTab]);

  // --- HANDLERS FOR ABONAR (CAPITAL/CUSTOM) ---
  const handleAbonarClick = (loanId: string) => {
    setConfirmingLoanId(loanId);
    setPaymentStep('SELECT_TYPE'); // Start at type selection
    setPaymentType('NORMAL');
    setCustomAmount('');
  };

  const selectPaymentType = (type: 'NORMAL' | 'CUSTOM') => {
    setPaymentType(type);
    if (type === 'NORMAL') {
        setPaymentStep('CONFIRM_DEPOSIT');
    } else {
        setCustomAmount('');
        setPaymentStep('ENTER_AMOUNT');
    }
  };

  const submitCustomAmount = () => {
      if (!customAmount) return;
      setPaymentStep('CONFIRM_DEPOSIT');
  };

  const handleConfirmPayment = () => {
    if (confirmingLoanId) {
      setPendingLoanIds(prev => [...prev, confirmingLoanId]);
      setConfirmingLoanId(null);
      setPaymentStep('SELECT_TYPE'); // Reset for next time
    }
  };

  const cancelPayment = () => {
      setConfirmingLoanId(null);
      setPaymentStep('SELECT_TYPE');
      setCustomAmount('');
  };

  // --- HANDLERS FOR PAGAR INTERÉS ---
  const handleInterestClick = (loanId: string) => {
      setInterestPaymentLoanId(loanId);
  };

  const confirmInterestPayment = () => {
      if (interestPaymentLoanId) {
          setPendingLoanIds(prev => [...prev, interestPaymentLoanId]);
          setInterestPaymentLoanId(null);
      }
  };

  const selectedInterestLoan = loans.find(l => l.id === interestPaymentLoanId);

  // Helper to generate mock schedule for details view
  const generateSchedule = (loan: Loan) => {
     const count = loan.duration || 1;
     const items = [];
     const start = new Date(loan.startDate);
     const amount = loan.amountDue / count;
     
     for (let i = 1; i <= count; i++) {
        const d = new Date(start);
        d.setMonth(d.getMonth() + i);
        // Mock status: First one paid if active
        let status = 'PENDING';
        if (loan.status === LoanStatus.ACTIVE && i === 1) status = 'PAID';
        if (loan.status === LoanStatus.OVERDUE && i === 1) status = 'OVERDUE';
        
        items.push({
            num: i,
            date: d.toLocaleDateString(),
            amount: amount,
            status
        });
     }
     return items;
  };

  const handleDownloadReceipt = async () => {
    const element = document.getElementById('printable-receipt');
    if (element && selectedLoan) {
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
            });
            const data = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = data;
            link.download = `Recibo-${selectedLoan.id}-${receiptMode}.png`;
            link.click();
        } catch (error) {
            console.error("Error generating receipt:", error);
            alert("Error al descargar el recibo.");
        }
    }
  };


  return (
    // Updated container: w-full h-full on mobile (native feel), constrained on desktop (phone mock)
    <div className="w-full h-full flex flex-col bg-slate-50 md:max-w-md md:mx-auto md:border md:border-slate-200 md:rounded-2xl md:h-[800px] md:shadow-2xl overflow-hidden relative">
      <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-receipt, #printable-receipt * {
              visibility: visible;
            }
            #printable-receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white;
              color: black;
              padding: 20px;
              box-shadow: none !important;
              border: none !important;
            }
            /* Hide scrollbars during print */
            ::-webkit-scrollbar { display: none; }
          }
      `}</style>
      
      {/* Mobile Header */}
      <div className="bg-blue-600 p-4 text-white flex justify-between items-center sticky top-0 z-10 shadow-md flex-shrink-0">
        <h1 className="text-xl font-bold tracking-tight">PrestaValor</h1>
        <button 
          onClick={() => setActiveTab('notifications')}
          className="p-2 bg-blue-500 rounded-full hover:bg-blue-400 transition relative"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
             <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full border border-blue-500 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 scroll-smooth">
        
        {activeTab === 'loans' && !selectedLoan && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-slate-800">Mis Empeños Activos</h2>
            {userLoans.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                <p>No tienes préstamos activos.</p>
              </div>
            ) : (
              userLoans.map(loan => {
                const isPending = pendingLoanIds.includes(loan.id);
                const currencySym = loan.currency === 'NIO' ? 'C$' : '$';
                const interestAmount = loan.amountDue - loan.loanAmount;

                return (
                  <div key={loan.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 relative overflow-hidden">
                     {loan.status === LoanStatus.OVERDUE && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                     )}
                     {loan.status === LoanStatus.ACTIVE && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                     )}
                     
                     <div className="flex justify-between items-start mb-3">
                       <div>
                         <h3 className="font-semibold text-slate-800">{loan.item.name}</h3>
                         <p className="text-xs text-slate-500">Contrato #{loan.id}</p>
                       </div>
                       <span className={`text-xs font-bold px-2 py-1 rounded-md ${loan.status === LoanStatus.OVERDUE ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                         {loan.status === LoanStatus.OVERDUE ? 'PAGO ATRASADO' : 'AL DÍA'}
                       </span>
                     </div>
  
                     <div className="flex justify-between items-end mb-3">
                        <div className="text-right w-full">
                           <p className="text-xs text-slate-500 mb-1">Vence el</p>
                           <p className="text-sm font-medium text-slate-700">{new Date(loan.dueDate).toLocaleDateString()}</p>
                        </div>
                     </div>

                     {/* Desglose de Pago */}
                     <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 text-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Desglose de Cuota</p>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-500 text-xs">Capital Prestado</span>
                            <span className="font-medium text-slate-700">{currencySym}{loan.loanAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-500 text-xs">Interés Generado</span>
                            <span className="font-medium text-blue-600">+{currencySym}{interestAmount.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between items-center">
                            <span className="font-bold text-slate-800 text-xs uppercase">Total a Pagar</span>
                            <span className="font-black text-lg text-slate-900">{currencySym}{loan.amountDue.toFixed(2)}</span>
                        </div>
                     </div>
  
                     <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => !isPending && handleInterestClick(loan.id)}
                            disabled={isPending}
                            className={`flex-1 text-white py-2 rounded-lg text-sm font-medium transition ${
                                isPending 
                                ? 'bg-orange-500 cursor-not-allowed opacity-90' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                             {isPending ? 'En Espera' : 'Pagar Interés'}
                          </button>
                          <button 
                              onClick={() => !isPending && handleAbonarClick(loan.id)}
                              disabled={isPending}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium transition shadow-sm ${
                                isPending 
                                  ? 'bg-orange-500 text-white cursor-not-allowed opacity-90' 
                                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
                              }`}
                          >
                             {isPending ? 'En Espera' : 'Abonar'}
                          </button>
                        </div>
                        <button 
                            onClick={() => setSelectedLoan(loan)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition flex items-center justify-center gap-2"
                        >
                           <Eye size={16} /> Ver Detalles Completos
                        </button>
                     </div>
                  </div>
                );
              })
            )}
            
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg mt-6">
               <h3 className="font-bold text-lg mb-2">¿Necesitas dinero rápido?</h3>
               <p className="text-blue-100 text-sm mb-4">Cotiza tus artículos en segundos con nuestra IA.</p>
               <button 
                onClick={() => setActiveTab('calculator')}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-50 w-full"
               >
                 Cotizar Ahora
               </button>
            </div>
          </div>
        )}

        {/* DETAILS VIEW */}
        {activeTab === 'loans' && selectedLoan && (
            <div className="animate-in fade-in slide-in-from-right duration-300 pb-4">
                <button 
                    onClick={() => setSelectedLoan(null)} 
                    className="mb-4 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft size={20}/> <span className="font-medium">Volver a mis empeños</span>
                </button>
                
                {/* Hero Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="relative h-56 bg-slate-200">
                        <img 
                            src={selectedLoan.item.images[0]} 
                            alt={selectedLoan.item.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                            <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/30 mb-2 inline-block">
                                {selectedLoan.item.category}
                            </span>
                            <h2 className="text-2xl font-bold leading-tight">{selectedLoan.item.name}</h2>
                        </div>
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm
                            ${selectedLoan.status === LoanStatus.ACTIVE ? 'bg-emerald-500 text-white' : 
                              selectedLoan.status === LoanStatus.OVERDUE ? 'bg-red-500 text-white' : 'bg-slate-500 text-white'}`}>
                            {selectedLoan.status === LoanStatus.ACTIVE ? 'ACTIVO' : 
                             selectedLoan.status === LoanStatus.OVERDUE ? 'EN MORA' : selectedLoan.status}
                        </div>
                    </div>
                    
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nº Contrato</p>
                                <p className="text-slate-800 font-mono font-medium">{selectedLoan.id}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fecha Inicio</p>
                                <p className="text-slate-800 font-medium">{new Date(selectedLoan.startDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                            "{selectedLoan.item.description}"
                        </p>
                    </div>
                </div>

                {/* Financial Breakdown Expanded */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Wallet size={18} />
                        </div>
                        <h3 className="font-bold text-slate-800">Detalle Financiero</h3>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                            <span className="text-slate-500">Préstamo Original</span> 
                            <span className="font-bold text-slate-700">
                                {selectedLoan.currency === 'NIO' ? 'C$' : '$'}{selectedLoan.loanAmount.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                            <span className="text-slate-500">Tasa de Interés</span> 
                            <span className="font-bold text-slate-700">{(selectedLoan.interestRate * 100).toFixed(1)}% Mensual</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                            <span className="text-slate-500">Interés Acumulado</span> 
                            <span className="font-bold text-blue-600">
                                +{selectedLoan.currency === 'NIO' ? 'C$' : '$'}{(selectedLoan.amountDue - selectedLoan.loanAmount).toFixed(2)}
                            </span>
                        </div>
                        
                        <div className="border-t border-slate-100 pt-4 mt-2">
                             <div className="flex justify-between items-end">
                                <span className="font-bold text-slate-800 text-lg">Total a Pagar</span>
                                <span className="font-black text-2xl text-slate-900 bg-emerald-50 px-3 py-1 rounded-lg text-emerald-700">
                                    {selectedLoan.currency === 'NIO' ? 'C$' : '$'}{selectedLoan.amountDue.toFixed(2)}
                                </span>
                             </div>
                             <p className="text-right text-xs text-slate-400 mt-1">Vence el {new Date(selectedLoan.dueDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Download Receipt Button */}
                <button 
                    onClick={() => setShowReceipt(true)}
                    className="w-full bg-white border border-slate-300 text-slate-600 py-3 rounded-xl font-medium mb-6 hover:bg-slate-50 transition flex items-center justify-center gap-2 shadow-sm"
                >
                    <Printer size={18} /> Descargar Recibo / Estado de Cuenta
                </button>

                {/* Payment Schedule */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-24">
                    <div className="flex items-center gap-2 mb-4">
                         <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Calendar size={18} />
                        </div>
                        <h3 className="font-bold text-slate-800">Cronograma de Pagos</h3>
                    </div>

                    <div className="space-y-3">
                        {generateSchedule(selectedLoan).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                        ${item.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {item.num}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{item.date}</p>
                                        <p className="text-xs text-slate-400">{item.status === 'PAID' ? 'Pagado' : item.status === 'OVERDUE' ? 'Atrasado' : 'Pendiente'}</p>
                                    </div>
                                </div>
                                <span className={`font-mono font-medium ${item.status === 'OVERDUE' ? 'text-red-500' : 'text-slate-600'}`}>
                                    {selectedLoan.currency === 'NIO' ? 'C$' : '$'}{item.amount.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sticky Actions Footer */}
                <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 z-30 md:absolute md:rounded-b-2xl">
                     <div className="flex gap-3 max-w-md mx-auto">
                        {(() => {
                            const isPending = pendingLoanIds.includes(selectedLoan.id);
                            return (
                                <>
                                    <button 
                                        onClick={() => !isPending && handleInterestClick(selectedLoan.id)}
                                        disabled={isPending}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex flex-col items-center justify-center gap-1
                                            ${isPending ? 'bg-orange-100 text-orange-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
                                    >
                                        <span>Pagar Interés</span>
                                        <span className="text-[10px] font-normal opacity-80">
                                            {selectedLoan.currency === 'NIO' ? 'C$' : '$'}{(selectedLoan.amountDue - selectedLoan.loanAmount).toFixed(2)}
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => !isPending && handleAbonarClick(selectedLoan.id)}
                                        disabled={isPending}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex flex-col items-center justify-center gap-1
                                            ${isPending ? 'bg-orange-100 text-orange-600 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95'}`}
                                    >
                                        <span>Abonar Capital</span>
                                        <span className="text-[10px] font-normal opacity-80">Reducir deuda</span>
                                    </button>
                                </>
                            );
                        })()}
                     </div>
                </div>
            </div>
        )}

        {activeTab === 'calculator' && (
          <LoanCalculator onBack={() => setActiveTab('loans')} />
        )}

        {activeTab === 'shop' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Tienda de Oportunidades</h2>
                <span className="text-xs font-medium text-slate-500">{marketplaceItems.length} artículos</span>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                {marketplaceItems.map(item => (
                   <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                      <div className="aspect-square bg-slate-200 relative">
                        <img 
                          src={item.images[0]} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                           {item.condition}/10
                        </span>
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                         <div className="text-xs text-blue-600 font-semibold mb-1 truncate">{item.category}</div>
                         <h3 className="text-sm font-medium text-slate-800 leading-tight mb-2 line-clamp-2 min-h-[2.5em]">{item.name}</h3>
                         <div className="mt-auto pt-2 flex items-center justify-between">
                            <span className="text-lg font-bold text-slate-900">${item.price}</span>
                            <button className="bg-emerald-500 text-white p-2 rounded-full shadow-sm hover:bg-emerald-600">
                               <ShoppingBag size={16} />
                            </button>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'notifications' && (
           <div className="space-y-4 animate-in fade-in slide-in-from-right duration-500">
              <h2 className="text-lg font-bold text-slate-800 px-1">Centro de Mensajes</h2>
              <div className="space-y-3">
                 {NOTIFICATIONS.map(notif => (
                    <div key={notif.id} className={`bg-white p-4 rounded-xl border relative overflow-hidden transition-all ${!notif.read ? 'border-blue-200 shadow-sm' : 'border-slate-100 opacity-90'}`}>
                       {!notif.read && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                       )}
                       <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 
                             ${notif.type === 'ALERT' ? 'bg-red-50 text-red-500' : ''}
                             ${notif.type === 'OFFER' ? 'bg-purple-50 text-purple-500' : ''}
                             ${notif.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-500' : ''}
                             ${notif.type === 'INFO' ? 'bg-blue-50 text-blue-500' : ''}
                          `}>
                             {notif.type === 'ALERT' && <AlertTriangle size={20} />}
                             {notif.type === 'OFFER' && <Tag size={20} />}
                             {notif.type === 'SUCCESS' && <CheckCircle size={20} />}
                             {notif.type === 'INFO' && <Bell size={20} />}
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-start mb-1">
                                <h3 className={`text-sm font-bold ${!notif.read ? 'text-slate-800' : 'text-slate-600'}`}>{notif.title}</h3>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                   <Clock size={10} /> {notif.date}
                                </span>
                             </div>
                             <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                          </div>
                       </div>
                       {!notif.read && (
                          <div className="flex justify-end mt-2">
                             <button className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">
                                Marcar como leído <ChevronRight size={10} />
                             </button>
                          </div>
                       )}
                    </div>
                 ))}
              </div>
              <p className="text-center text-xs text-slate-400 mt-4">No tienes más notificaciones.</p>
           </div>
        )}

      </div>

      {/* Pay Interest Modal */}
      {selectedInterestLoan && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white w-full max-w-xs rounded-xl shadow-2xl p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <Percent size={28} />
                </div>
                <h3 className="text-lg font-bold text-center text-slate-800 mb-2">Pago de Interés</h3>
                
                <div className="text-center mb-6">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Monto a Pagar</p>
                    <p className="text-3xl font-black text-slate-900">
                        ${(selectedInterestLoan.loanAmount * selectedInterestLoan.interestRate).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        Corresponde a la cuota actual
                    </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 mb-6">
                    <Info className="text-amber-600 flex-shrink-0" size={20} />
                    <p className="text-xs text-amber-800 leading-relaxed">
                        <span className="font-bold">Importante:</span> Este pago solo cubre los intereses. Su capital de <span className="font-bold text-slate-900">${selectedInterestLoan.loanAmount.toFixed(2)}</span> sigue siendo el mismo.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setInterestPaymentLoanId(null)}
                        className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={confirmInterestPayment}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
                    >
                        Ya hice el depósito
                    </button>
                </div>
             </div>
        </div>
      )}

      {/* Payment Process Modal (Abonar / Capital) */}
      {confirmingLoanId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xs rounded-xl shadow-2xl p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                
                {/* Step 1: Selection Type */}
                {paymentStep === 'SELECT_TYPE' && (
                  <>
                     <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                        <Wallet size={28} />
                     </div>
                     <h3 className="text-lg font-bold text-center text-slate-800 mb-2">Abono a Capital</h3>
                     <p className="text-sm text-center text-slate-500 mb-6">
                        Este pago reducirá su deuda total.
                     </p>
                     <div className="flex flex-col gap-3">
                        <button
                           onClick={() => selectPaymentType('NORMAL')}
                           className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-200 transition flex items-center justify-center gap-2"
                        >
                           <CreditCard size={18} /> Cuota Completa
                        </button>
                        <button
                           onClick={() => selectPaymentType('CUSTOM')}
                           className="w-full py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition flex items-center justify-center gap-2"
                        >
                           <HelpCircle size={18} /> Otro Monto
                        </button>
                        <button
                           onClick={cancelPayment}
                           className="mt-2 text-xs text-slate-400 hover:text-slate-600 underline text-center w-full"
                        >
                           Cancelar Operación
                        </button>
                     </div>
                  </>
                )}

                {/* Step 2: Enter Custom Amount (Only if Custom Type Selected) */}
                {paymentStep === 'ENTER_AMOUNT' && (
                  <>
                     <div className="mb-4">
                         <button onClick={() => setPaymentStep('SELECT_TYPE')} className="text-slate-400 hover:text-slate-600">
                            <ArrowLeft size={20} />
                         </button>
                     </div>
                     <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                        <DollarSign size={28} />
                     </div>
                     <h3 className="text-lg font-bold text-center text-slate-800 mb-2">Ingresar Monto</h3>
                     <p className="text-sm text-center text-slate-500 mb-4">
                        ¿Cuánto depositó?
                     </p>
                     
                     <div className="mb-6 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                        <input 
                            type="number" 
                            autoFocus
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="0.00"
                        />
                     </div>

                     <div className="flex gap-3">
                        <button
                            onClick={submitCustomAmount}
                            disabled={!customAmount}
                            className="w-full py-2.5 bg-purple-600 disabled:bg-slate-300 text-white rounded-lg font-bold text-sm hover:bg-purple-700 shadow-lg shadow-purple-200 transition"
                        >
                            Continuar
                        </button>
                     </div>
                  </>
                )}

                {/* Step 3: Confirmation */}
                {paymentStep === 'CONFIRM_DEPOSIT' && (
                  <>
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                        <CheckCircle size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-center text-slate-800 mb-2">Confirmar Depósito</h3>
                    <p className="text-sm text-center text-slate-500 mb-6">
                        ¿Ya hizo el depósito{paymentType === 'CUSTOM' && customAmount ? ` de $${customAmount}` : ''}? Si es así, dele en Aceptar.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={cancelPayment}
                            className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirmPayment}
                            className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition"
                        >
                            Aceptar
                        </button>
                    </div>
                  </>
                )}
            </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && selectedLoan && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-200 flex flex-col gap-4 bg-slate-50">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><Printer size={18}/> Opciones de Recibo</h3>
                        <button onClick={() => setShowReceipt(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                    </div>
                    {/* Toggle Buttons */}
                    <div className="flex bg-slate-200 p-1 rounded-lg">
                        <button 
                            onClick={() => setReceiptMode('LAST')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition ${receiptMode === 'LAST' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Clock size={14} /> Último Abono
                        </button>
                        <button 
                            onClick={() => setReceiptMode('FULL')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition ${receiptMode === 'FULL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <History size={14} /> Historial Completo
                        </button>
                    </div>
                </div>
                
                {/* Printable Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-white" id="printable-receipt">
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-1">PRESTAVALOR</h1>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                            {receiptMode === 'LAST' ? 'COMPROBANTE DE PAGO' : 'ESTADO DE CUENTA'}
                        </p>
                        <div className="mt-2 text-xs font-mono text-slate-500">
                            {new Date().toLocaleString()}
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-slate-200 py-4 space-y-2 font-mono text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Contrato:</span>
                            <span className="font-bold text-slate-800">{selectedLoan.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Cliente:</span>
                            <span className="font-bold text-slate-800">{selectedLoan.clientName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Artículo:</span>
                            <span className="font-bold text-slate-800 truncate max-w-[150px]">{selectedLoan.item.name}</span>
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-slate-200 py-4 font-mono text-sm">
                        <h4 className="font-bold text-center mb-3 text-slate-800">
                            {receiptMode === 'LAST' ? 'DETALLE DEL ABONO' : 'HISTORIAL DE PAGOS'}
                        </h4>
                        
                        {(() => {
                            const schedule = generateSchedule(selectedLoan);
                            const paidInstallments = schedule.filter(s => s.status === 'PAID');
                            const currencySym = selectedLoan.currency === 'NIO' ? 'C$' : '$';
                            const lastPayment = paidInstallments.length > 0 ? paidInstallments[paidInstallments.length - 1] : null;

                            return receiptMode === 'LAST' ? (
                                lastPayment ? (
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">
                                        <div className="text-xs text-slate-500 mb-1">Pago Realizado</div>
                                        <div className="text-2xl font-black text-slate-900 mb-2">{currencySym}{lastPayment.amount.toFixed(2)}</div>
                                        <div className="text-xs text-slate-600">Cuota #{lastPayment.num} - {lastPayment.date}</div>
                                    </div>
                                ) : (
                                    <p className="text-center text-red-400 italic text-xs">No se encontraron pagos recientes.</p>
                                )
                            ) : (
                                paidInstallments.length === 0 ? (
                                    <p className="text-center text-slate-400 italic">No hay pagos registrados.</p>
                                    ) : (
                                    <div className="space-y-2">
                                        {paidInstallments.map((inst, i) => (
                                            <div key={i} className="flex justify-between text-xs">
                                                <span>Cuota #{inst.num} ({inst.date})</span>
                                                <span className="font-bold">{currencySym}{inst.amount.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    )
                            );
                        })()}
                    </div>

                    <div className="border-t-2 border-dashed border-slate-200 pt-4 space-y-2 font-mono text-sm">
                        {receiptMode === 'FULL' && (() => {
                             const schedule = generateSchedule(selectedLoan);
                             const paidInstallments = schedule.filter(s => s.status === 'PAID');
                             const totalPaid = paidInstallments.reduce((acc, curr) => acc + curr.amount, 0);
                             const currencySym = selectedLoan.currency === 'NIO' ? 'C$' : '$';
                             
                             return (
                                <>
                                <div className="flex justify-between text-slate-600">
                                    <span>Total Deuda:</span>
                                    <span>{currencySym}{selectedLoan.amountDue.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Total Pagado:</span>
                                    <span>{currencySym}{totalPaid.toFixed(2)}</span>
                                </div>
                                </>
                             );
                        })()}
                        
                        <div className="flex justify-between text-lg font-black mt-2 pt-2 border-t border-slate-100">
                            <span>SALDO RESTANTE:</span>
                            <span>
                                {selectedLoan.currency === 'NIO' ? 'C$' : '$'}
                                {(selectedLoan.amountDue - generateSchedule(selectedLoan).filter(s => s.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0)).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <div className="font-handwriting text-3xl text-slate-700 mb-2 font-bold italic" style={{fontFamily: '"Brush Script MT", cursive'}}>
                            Sneyder Studio
                        </div>
                        <div className="border-t-2 border-slate-300 w-48 mx-auto mb-2"></div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Firma Autorizada</p>
                    </div>

                    <div className="mt-8 text-center text-[10px] text-slate-400">
                        <p>Gracias por su preferencia.</p>
                        <p>PrestaValor - Soluciones Rápidas</p>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                    <button 
                        onClick={() => setShowReceipt(false)}
                        className="flex-1 py-2.5 border border-slate-300 bg-white text-slate-600 rounded-lg font-bold hover:bg-slate-100 transition"
                    >
                        Cerrar
                    </button>
                    <button 
                        onClick={handleDownloadReceipt}
                        className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-black transition flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Download size={18} /> Descargar Imagen
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-slate-200 p-2 flex justify-around items-center sticky bottom-0 pb-6 md:pb-2 flex-shrink-0 z-20">
        <NavButton 
          active={activeTab === 'loans'} 
          onClick={() => setActiveTab('loans')} 
          icon={<CreditCard size={24} />} 
          label="Mis Préstamos" 
        />
        <NavButton 
          active={activeTab === 'calculator'} 
          onClick={() => setActiveTab('calculator')} 
          icon={<Calculator size={24} />} 
          label="Cotizar" 
        />
        <NavButton 
          active={activeTab === 'shop'} 
          onClick={() => setActiveTab('shop')} 
          icon={<ShoppingBag size={24} />} 
          label="Tienda" 
        />
      </div>
    </div>
  );
};

const DollarSign = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 w-24 ${active ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const LoanCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState(8);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValuationResult | null>(null);

  const handleCalculate = async () => {
    if (!description) return;
    setLoading(true);
    const res = await appraiseItem(description, condition);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right duration-300 h-full flex flex-col">
       <div className="mb-4">
         <h2 className="text-xl font-bold text-slate-800">Cotizador IA</h2>
         <p className="text-sm text-slate-500">Describe tu artículo para recibir una oferta instantánea.</p>
       </div>

       {!result ? (
         <div className="space-y-6 flex-1">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">¿Qué quieres empeñar?</label>
             <textarea 
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none text-sm"
               placeholder="Ej: Laptop Dell XPS 13, Core i7, 16GB RAM, Año 2022, pequeños rayones en la tapa."
             />
           </div>

           <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Estado Estético</label>
                <span className="text-sm font-bold text-blue-600">{condition}/10</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={condition} 
                onChange={(e) => setCondition(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                 <span>Malo</span>
                 <span>Nuevo</span>
              </div>
           </div>

           <div className="pt-4">
             <button 
               onClick={handleCalculate}
               disabled={loading || !description}
               className="w-full bg-blue-600 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-2"
             >
               {loading ? <Loader2 className="animate-spin" /> : <Camera size={20} />}
               {loading ? 'Analizando...' : 'Calcular Préstamo'}
             </button>
           </div>
         </div>
       ) : (
         <div className="flex-1 flex flex-col">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 text-center mb-6">
               <p className="text-sm text-slate-500 font-medium uppercase tracking-wide mb-2">Oferta PrestaValor</p>
               <h3 className="text-4xl font-extrabold text-slate-900 mb-1">${result.suggestedLoan}</h3>
               <p className="text-xs text-emerald-600 font-medium bg-emerald-50 inline-block px-2 py-1 rounded-full">
                  Valor Mercado: ${result.estimatedValue}
               </p>

               <div className="mt-6 flex flex-col gap-2 text-left bg-slate-50 p-4 rounded-xl">
                  <div className="flex justify-between text-sm">
                     <span className="text-slate-500">Categoría</span>
                     <span className="font-medium text-slate-800">{result.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-slate-500">Riesgo</span>
                     <span className="font-medium text-slate-800">{result.riskAssessment}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-slate-500">Interés Mensual</span>
                     <span className="font-medium text-slate-800">5.0%</span>
                  </div>
               </div>
            </div>

            <button className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:bg-emerald-600 transition mb-3">
               Aceptar Oferta
            </button>
            <button 
              onClick={() => setResult(null)}
              className="w-full bg-transparent text-slate-500 py-3 rounded-xl font-medium text-sm hover:text-slate-700"
            >
               Volver a cotizar
            </button>
         </div>
       )}
    </div>
  );
}

export default ClientApp;