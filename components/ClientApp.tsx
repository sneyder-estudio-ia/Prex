import React, { useState, useRef } from 'react';
import { Loan, MarketplaceItem, ValuationResult, LoanStatus } from '../types';
import { appraiseItem } from '../services/geminiService';
import { Calculator, ShoppingBag, CreditCard, Bell, Camera, Loader2, ArrowRight, CheckCircle, AlertTriangle, Tag, Clock, ChevronRight, Eye, Wallet, HelpCircle, ArrowLeft, Percent, Info } from 'lucide-react';

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
  
  // State to track interest payment modal
  const [interestPaymentLoanId, setInterestPaymentLoanId] = useState<string | null>(null);

  // State to track the step of the payment process
  const [paymentStep, setPaymentStep] = useState<'SELECT_TYPE' | 'ENTER_AMOUNT' | 'CONFIRM_DEPOSIT'>('SELECT_TYPE');
  
  // State to track payment details
  const [paymentType, setPaymentType] = useState<'NORMAL' | 'CUSTOM'>('NORMAL');
  const [customAmount, setCustomAmount] = useState('');

  // State to track loans that have a pending payment verification (orange button)
  const [pendingLoanIds, setPendingLoanIds] = useState<string[]>([]);
  
  const userLoans = loans.filter(l => l.clientId === currentUserId);
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

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


  return (
    // Updated container: w-full h-full on mobile (native feel), constrained on desktop (phone mock)
    <div className="w-full h-full flex flex-col bg-slate-50 md:max-w-md md:mx-auto md:border md:border-slate-200 md:rounded-2xl md:h-[800px] md:shadow-2xl overflow-hidden relative">
      
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
        
        {activeTab === 'loans' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-slate-800">Mis Empeños Activos</h2>
            {userLoans.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                <p>No tienes préstamos activos.</p>
              </div>
            ) : (
              userLoans.map(loan => {
                const isPending = pendingLoanIds.includes(loan.id);

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
  
                     <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Total a Pagar</p>
                          <p className="text-xl font-bold text-slate-900">${loan.amountDue}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-xs text-slate-500 mb-1">Vence</p>
                           <p className="text-sm font-medium text-slate-700">{new Date(loan.dueDate).toLocaleDateString()}</p>
                        </div>
                     </div>
  
                     <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
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
                        <button className="w-full bg-slate-50 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition flex items-center justify-center gap-2">
                           <Eye size={16} /> Ver Detalles
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