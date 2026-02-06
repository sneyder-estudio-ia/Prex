import React, { useState, useRef } from 'react';
import { Loan, MarketplaceItem, ValuationResult, LoanStatus } from '../types';
import { appraiseItem } from '../services/geminiService';
import { Calculator, ShoppingBag, CreditCard, Bell, Camera, Loader2, ArrowRight } from 'lucide-react';

interface ClientAppProps {
  loans: Loan[];
  marketplaceItems: MarketplaceItem[];
  currentUserId: string;
}

const ClientApp: React.FC<ClientAppProps> = ({ loans, marketplaceItems, currentUserId }) => {
  const [activeTab, setActiveTab] = useState<'loans' | 'calculator' | 'shop'>('loans');
  const userLoans = loans.filter(l => l.clientId === currentUserId);

  return (
    // Updated container: w-full h-full on mobile (native feel), constrained on desktop (phone mock)
    <div className="w-full h-full flex flex-col bg-slate-50 md:max-w-md md:mx-auto md:border md:border-slate-200 md:rounded-2xl md:h-[800px] md:shadow-2xl overflow-hidden relative">
      
      {/* Mobile Header */}
      <div className="bg-blue-600 p-4 text-white flex justify-between items-center sticky top-0 z-10 shadow-md flex-shrink-0">
        <h1 className="text-xl font-bold tracking-tight">PrestaValor</h1>
        <button className="p-2 bg-blue-500 rounded-full hover:bg-blue-400 transition relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full border border-blue-500"></span>
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
              userLoans.map(loan => (
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

                   <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                         Pagar Interés
                      </button>
                      <button className="flex-1 bg-white border border-blue-600 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition">
                         Rescatar
                      </button>
                   </div>
                </div>
              ))
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
      </div>

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