import React, { useState, useRef } from 'react';
import { Client, Loan, LoanStatus, ItemCategory } from '../types';
import { Search, Eye, ArrowLeft, Phone, Mail, Star, Calendar, FileText, User, Plus, Calculator, Percent, DollarSign, Coins, ToggleLeft, ToggleRight, Upload, X, Camera, Wallet } from 'lucide-react';

interface AdminClientsProps {
  clients: Client[];
  loans: Loan[];
  onRegisterClient: (client: Client, loan: Loan) => void;
  onAddLoan: (loan: Loan) => void;
}

const AdminClients: React.FC<AdminClientsProps> = ({ clients, loans, onRegisterClient, onAddLoan }) => {
  const [view, setView] = useState<'LIST' | 'DETAILS' | 'NEW' | 'ADD_LOAN'>('LIST');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Loan Form State
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemImages, setItemImages] = useState<string[]>([]); // Changed to array for multiple images
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('5'); // Default 5%
  
  // New Fields configuration
  const [currency, setCurrency] = useState<'NIO' | 'USD'>('NIO');
  const [frequency, setFrequency] = useState<'Diario' | 'Semanal' | 'Quincenal' | 'Mensual'>('Mensual');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [createLoan, setCreateLoan] = useState(true); // Toggle for creating loan or just info
  
  // Payment Rules State
  const [monthlyDay, setMonthlyDay] = useState<number>(1); // 1-31
  const [biWeeklyDay1, setBiWeeklyDay1] = useState<number>(15);
  const [biWeeklyDay2, setBiWeeklyDay2] = useState<number>(30);
  const [weeklyDay, setWeeklyDay] = useState<string>('Lunes');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientLoans = (clientId: string) => loans.filter(l => l.clientId === clientId);

  // Helper to generate days 1-31
  const daysInMonth = Array.from({length: 31}, (_, i) => i + 1);
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const calculateNextDueDate = (): Date => {
    const today = new Date();
    const nextDate = new Date(today);

    if (frequency === 'Diario') {
      nextDate.setDate(today.getDate() + 1);
      return nextDate;
    }

    if (frequency === 'Semanal') {
      // 0 (Sun) to 6 (Sat)
      const dayMap: {[key: string]: number} = { 'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6 };
      const targetDay = dayMap[weeklyDay];
      const currentDay = today.getDay();
      
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7; // If today is Tuesday and we want Monday, add 6 days
      
      nextDate.setDate(today.getDate() + daysToAdd);
      return nextDate;
    }

    if (frequency === 'Mensual') {
      // Find next occurrence of specific day
      // If today is 5th and target is 1st, go to next month
      // If today is 5th and target is 20th, stay in this month
      if (today.getDate() >= monthlyDay) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      nextDate.setDate(monthlyDay);
      return nextDate;
    }

    if (frequency === 'Quincenal') {
      // Find the closest next date between day1 and day2
      const target1 = new Date(today);
      if (today.getDate() >= biWeeklyDay1) target1.setMonth(target1.getMonth() + 1);
      target1.setDate(biWeeklyDay1);

      const target2 = new Date(today);
      if (today.getDate() >= biWeeklyDay2) target2.setMonth(target2.getMonth() + 1);
      target2.setDate(biWeeklyDay2);

      // We need strictly future dates relative to today
      const d1 = new Date(today); d1.setDate(biWeeklyDay1); 
      if (d1 <= today) d1.setMonth(d1.getMonth() + 1);

      const d2 = new Date(today); d2.setDate(biWeeklyDay2);
      if (d2 <= today) d2.setMonth(d2.getMonth() + 1);

      return d1 < d2 ? d1 : d2;
    }

    return nextDate;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (itemImages.length >= 4) {
        alert("Máximo 4 imágenes permitidas");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
    // Reset input to allow selecting the same file again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setItemImages(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setItemName('');
    setItemDescription('');
    setItemImages([]);
    setLoanAmount('');
    setInterestRate('5');
    setCurrency('NIO');
    setFrequency('Mensual');
    setMonthlyDay(1);
    setBiWeeklyDay1(15);
    setBiWeeklyDay2(30);
    setWeeklyDay('Lunes');
    setDurationMonths(1);
    setCreateLoan(true);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !itemName) return;
    if (createLoan && !loanAmount) return;

    const newClientId = `U-${Date.now()}`;
    const newClient: Client = {
      id: newClientId,
      name: `${firstName} ${lastName}`,
      email: email,
      phone: phone,
      rating: 5.0, // New clients start with 5
      joinDate: new Date().toISOString(),
      totalLoans: createLoan ? 1 : 0
    };

    const amount = createLoan ? parseFloat(loanAmount) : 0;
    const rate = createLoan ? parseFloat(interestRate) : 0;
    const interestAmount = amount * (rate / 100);
    const totalDue = amount + interestAmount;

    // Calculate initial Due Date
    const dueDate = createLoan ? calculateNextDueDate() : new Date();

    const newLoan: Loan = {
      id: `CTR-${Math.floor(Math.random() * 10000)}`,
      clientId: newClientId,
      clientName: newClient.name,
      item: {
        id: `I-${Date.now()}`,
        name: itemName,
        description: itemDescription || 'Sin descripción',
        category: ItemCategory.OTHER,
        condition: 10,
        images: itemImages.length > 0 ? itemImages : ['https://picsum.photos/200'],
        marketValue: amount > 0 ? amount * 2 : 0
      },
      loanAmount: amount,
      interestRate: rate / 100,
      startDate: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
      status: createLoan ? LoanStatus.ACTIVE : LoanStatus.PENDING,
      amountDue: totalDue,
      currency: currency,
      paymentFrequency: frequency,
      duration: createLoan ? durationMonths : 0
    };

    onRegisterClient(newClient, newLoan);
    
    resetForm();
    setView('LIST');
  };

  const handleAddLoanToClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    const amount = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100;
    const interest = amount * rate;
    const totalDue = amount + interest;
    
    const dueDate = calculateNextDueDate(); 

    const newLoan: Loan = {
      id: `CTR-${Date.now()}`,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      item: {
        id: `I-${Date.now()}`,
        name: itemName,
        description: itemDescription || 'Sin descripción',
        category: ItemCategory.OTHER,
        condition: 10,
        images: itemImages.length > 0 ? itemImages : ['https://picsum.photos/200'],
        marketValue: amount * 2
      },
      loanAmount: amount,
      interestRate: rate,
      startDate: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
      status: LoanStatus.ACTIVE,
      amountDue: totalDue,
      currency: currency,
      paymentFrequency: frequency,
      duration: durationMonths
    };

    onAddLoan(newLoan);
    resetForm();
    setView('DETAILS');
  };

  const openAddLoanView = () => {
      resetForm();
      setCreateLoan(true); // Always true for adding loan to existing client
      setView('ADD_LOAN');
  }


  // Calculation display
  const numAmount = parseFloat(loanAmount) || 0;
  const numRate = parseFloat(interestRate) || 0;
  const calculatedInterest = numAmount * (numRate / 100);
  const calculatedTotal = numAmount + calculatedInterest;
  const currencySymbol = currency === 'NIO' ? 'C$' : '$';
  
  // Calculate End Date
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + durationMonths);


  if (view === 'NEW') {
    return (
      <div className="animate-in fade-in slide-in-from-right duration-300">
        <button 
          onClick={() => setView('LIST')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Cancelar</span>
        </button>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Registrar Nuevo Cliente y Préstamo</h2>
          
          <form onSubmit={handleCreateClient} className="space-y-8">
            {/* Section 1: Client Data */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-500" />
                Datos Personales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input required value={firstName} onChange={e => setFirstName(e.target.value)} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                  <input required value={lastName} onChange={e => setLastName(e.target.value)} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                  <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input required value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {/* Section 2: Loan Data (Duplicate logic but for new client flow) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-emerald-500" />
                Detalles del Préstamo Inicial
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   {/* Image Upload Section */}
                   <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Fotografías del Artículo ({itemImages.length}/4)
                      </label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef}
                        onChange={handleImageUpload} 
                        className="hidden"
                      />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {itemImages.map((img, idx) => (
                           <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                              <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors"
                              >
                                <X size={14} />
                              </button>
                           </div>
                        ))}
                        
                        {itemImages.length < 4 && (
                           <button 
                             type="button"
                             onClick={() => fileInputRef.current?.click()}
                             className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors bg-slate-50"
                           >
                             <Camera size={24} className="mb-1" />
                             <span className="text-xs font-medium">Agregar</span>
                           </button>
                        )}
                      </div>
                   </div>

                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Objeto en Empeño</label>
                    <input required value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Ej. Laptop HP, Anillo Oro" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descripción / Notas de Deuda (Opcional)</label>
                    <textarea value={itemDescription} onChange={e => setItemDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" />
                  </div>
                  
                  {/* Payment Schedule Configuration */}
                  <div className={`bg-slate-50 p-4 rounded-xl border ${createLoan ? 'border-slate-200' : 'border-slate-100'} transition-all`}>
                     <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-bold text-slate-800">Plan de Pagos</label>
                        <button 
                          type="button"
                          onClick={() => setCreateLoan(!createLoan)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${createLoan ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}
                        >
                          {createLoan ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                          {createLoan ? 'Generar Préstamo' : 'Solo Registro'}
                        </button>
                     </div>
                     
                     {createLoan ? (
                       <div className="animate-in fade-in slide-in-from-top-2">
                         <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Frecuencia</label>
                              <select 
                                value={frequency} 
                                onChange={(e) => setFrequency(e.target.value as any)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 font-medium"
                              >
                                <option value="Diario">Diario</option>
                                <option value="Semanal">Semanal</option>
                                <option value="Quincenal">Quincenal</option>
                                <option value="Mensual">Mensual</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Plazo (Meses)</label>
                              <input 
                                type="number"
                                min="1"
                                value={durationMonths}
                                onChange={(e) => setDurationMonths(parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 font-medium"
                              />
                            </div>
                         </div>
                       </div>
                     ) : (
                       <p className="text-xs text-slate-500 italic py-2">
                         Se registrará el artículo y el cliente en la base de datos sin generar una deuda activa ni cronograma de pagos.
                       </p>
                     )}
                  </div>
                </div>

                <div className={`bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-100 h-fit ${!createLoan ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                   {/* Financial Inputs (Same as ADD_LOAN) */}
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Moneda</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrency('NIO')}
                          className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-colors flex items-center justify-center gap-2 ${currency === 'NIO' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                        >
                          <Coins size={16} /> Córdobas (C$)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrency('USD')}
                          className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-colors flex items-center justify-center gap-2 ${currency === 'USD' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                        >
                          <DollarSign size={16} /> Dólares ($)
                        </button>
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Monto del Préstamo</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">{currencySymbol}</span>
                        <input required={createLoan} disabled={!createLoan} value={loanAmount} onChange={e => setLoanAmount(e.target.value)} type="number" min="0" className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tasa de Interés (%)</label>
                      <div className="relative">
                         <input required={createLoan} disabled={!createLoan} value={interestRate} onChange={e => setInterestRate(e.target.value)} type="number" min="0" step="0.1" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 pr-8" />
                         <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                   </div>
                   <div className="pt-2 border-t border-slate-200 mt-2">
                      <div className="flex justify-between items-center text-sm text-slate-500 mb-1">
                        <span>Interés Generado (Mes):</span>
                        <span className="font-medium">+{currencySymbol}{calculatedInterest.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">Pago 1° Cuota:</span>
                        <span className="font-bold text-xl text-blue-600">{currencySymbol}{calculatedTotal.toFixed(2)}</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setView('LIST')} className="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button type="submit" className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                Registrar Cliente
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ADD LOAN VIEW
  if (view === 'ADD_LOAN' && selectedClient) {
      const currencySymbol = currency === 'NIO' ? 'C$' : '$';
      const interestAmount = (parseFloat(loanAmount) || 0) * ((parseFloat(interestRate) || 0) / 100);
      const totalFirst = (parseFloat(loanAmount) || 0) + interestAmount;

      return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
               <button 
                onClick={() => setView('DETAILS')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
                >
                <ArrowLeft size={20} />
                <span className="font-medium">Cancelar y Volver</span>
                </button>

                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Plus className="text-blue-600" /> Nuevo Empeño para {selectedClient.name}
                    </h2>

                    <form onSubmit={handleAddLoanToClient} className="space-y-8">
                        {/* Section: Item Details */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-emerald-500" />
                                Detalles del Artículo
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                     <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Fotografías ({itemImages.length}/4)
                                        </label>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            ref={fileInputRef}
                                            onChange={handleImageUpload} 
                                            className="hidden"
                                        />
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {itemImages.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                                                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            {itemImages.length < 4 && (
                                                <button 
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors bg-slate-50"
                                                >
                                                    <Camera size={24} className="mb-1" />
                                                    <span className="text-xs font-medium">Agregar</span>
                                                </button>
                                            )}
                                        </div>
                                     </div>

                                     <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Objeto en Empeño</label>
                                        <input required value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Ej. Laptop HP, Anillo Oro" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                     </div>
                                     <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                                        <textarea value={itemDescription} onChange={e => setItemDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" />
                                     </div>
                                </div>
                                
                                {/* Financials */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Financiero</h3>
                                    
                                     <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Moneda</label>
                                        <div className="flex gap-2">
                                            <button
                                            type="button"
                                            onClick={() => setCurrency('NIO')}
                                            className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-colors flex items-center justify-center gap-2 ${currency === 'NIO' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                                            >
                                            <Coins size={16} /> Córdobas (C$)
                                            </button>
                                            <button
                                            type="button"
                                            onClick={() => setCurrency('USD')}
                                            className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-colors flex items-center justify-center gap-2 ${currency === 'USD' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                                            >
                                            <DollarSign size={16} /> Dólares ($)
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Monto del Préstamo</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">{currencySymbol}</span>
                                            <input required value={loanAmount} onChange={e => setLoanAmount(e.target.value)} type="number" min="0" className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Tasa de Interés (%)</label>
                                        <div className="relative">
                                            <input required value={interestRate} onChange={e => setInterestRate(e.target.value)} type="number" min="0" step="0.1" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 pr-8" />
                                            <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </div>

                                     <div className="grid grid-cols-2 gap-4">
                                         <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Frecuencia</label>
                                            <select 
                                                value={frequency} 
                                                onChange={(e) => setFrequency(e.target.value as any)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            >
                                                <option value="Diario">Diario</option>
                                                <option value="Semanal">Semanal</option>
                                                <option value="Quincenal">Quincenal</option>
                                                <option value="Mensual">Mensual</option>
                                            </select>
                                         </div>
                                         <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Duración (Meses)</label>
                                            <input 
                                                type="number" 
                                                min="1"
                                                value={durationMonths}
                                                onChange={(e) => setDurationMonths(parseInt(e.target.value) || 1)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                         </div>
                                     </div>
                                     
                                     {/* Summary Box */}
                                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                                        <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                                            <span>Capital:</span>
                                            <span>{currencySymbol}{parseFloat(loanAmount || '0').toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-slate-600 mb-2 border-b border-slate-200 pb-2">
                                            <span>Interés ({interestRate}%):</span>
                                            <span>+{currencySymbol}{interestAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-800">Total a Pagar:</span>
                                            <span className="font-bold text-blue-600 text-lg">{currencySymbol}{totalFirst.toFixed(2)}</span>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button 
                                type="button" 
                                onClick={() => setView('DETAILS')} 
                                className="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
                            >
                                Crear Empeño
                            </button>
                        </div>
                    </form>
                </div>
          </div>
      );
  }

  if (view === 'DETAILS' && selectedClient) {
    const clientLoans = getClientLoans(selectedClient.id);
    const activeLoansCount = clientLoans.filter(l => l.status === LoanStatus.ACTIVE || l.status === LoanStatus.OVERDUE).length;
    const totalDebt = clientLoans
      .filter(l => l.status === LoanStatus.ACTIVE || l.status === LoanStatus.OVERDUE)
      .reduce((acc, curr) => acc + curr.amountDue, 0);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
        <button 
          onClick={() => { setSelectedClient(null); setView('LIST'); }}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Volver a la lista</span>
        </button>

        {/* Client Header Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border-2 border-white shadow-md">
               <User size={40} />
            </div>
            <div className="flex-1">
               <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                 <h2 className="text-2xl font-bold text-slate-800">{selectedClient.name}</h2>
                 <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium border border-yellow-100">
                    <Star size={14} fill="currentColor" /> {selectedClient.rating}
                 </span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                     <Mail size={16} /> {selectedClient.email}
                  </div>
                  <div className="flex items-center gap-2">
                     <Phone size={16} /> {selectedClient.phone}
                  </div>
                  <div className="flex items-center gap-2">
                     <Calendar size={16} /> Cliente desde: {new Date(selectedClient.joinDate).toLocaleDateString()}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-xs text-slate-500 font-medium uppercase">Préstamos Activos</p>
              <p className="text-2xl font-bold text-slate-800">{activeLoansCount}</p>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-xs text-slate-500 font-medium uppercase">Deuda Total</p>
              <p className="text-2xl font-bold text-red-600">${totalDebt.toLocaleString()}</p>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-xs text-slate-500 font-medium uppercase">Histórico Total</p>
              <p className="text-2xl font-bold text-blue-600">{clientLoans.length}</p>
           </div>
        </div>

        {/* Loan History */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">Historial de Empeños</h3>
              </div>
              <button 
                onClick={openAddLoanView}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                  <Plus size={16} /> Añadir
              </button>
           </div>
           <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-700 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">ID Contrato</th>
                  <th className="px-6 py-4">Artículo</th>
                  <th className="px-6 py-4">Fecha Inicio</th>
                  <th className="px-6 py-4">Monto</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientLoans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No hay registros de préstamos para este cliente.
                    </td>
                  </tr>
                ) : (
                  clientLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-xs">{loan.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{loan.item.name}</td>
                      <td className="px-6 py-4">{new Date(loan.startDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {loan.currency === 'NIO' ? 'C$' : '$'}
                        {loan.loanAmount}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold
                          ${loan.status === LoanStatus.ACTIVE ? 'bg-blue-100 text-blue-700' : ''}
                          ${loan.status === LoanStatus.OVERDUE ? 'bg-red-100 text-red-700' : ''}
                          ${loan.status === LoanStatus.REDEEMED ? 'bg-emerald-100 text-emerald-700' : ''}
                          ${loan.status === LoanStatus.PENDING ? 'bg-slate-100 text-slate-600' : ''}
                        `}>
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h4 className="text-lg font-semibold text-slate-800">Directorio de Clientes</h4>
          <div className="flex gap-2 w-full md:w-auto">
             <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button 
              onClick={() => { resetForm(); setView('NEW'); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
            >
               <Plus size={16} /> Nuevo Cliente
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-700 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Calificación</th>
                <th className="px-6 py-4">Antigüedad</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {client.name.substring(0, 2).toUpperCase()}
                       </div>
                       <div>
                          <div className="font-medium text-slate-800">{client.name}</div>
                          <div className="text-xs text-slate-500">ID: {client.id}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-xs">
                         <Mail size={12} className="text-slate-400" /> {client.email}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                         <Phone size={12} className="text-slate-400" /> {client.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                       <Star size={14} className="text-yellow-400 fill-yellow-400" />
                       <span className="font-medium text-slate-700">{client.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(client.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setSelectedClient(client); setView('DETAILS'); }}
                      className="inline-flex items-center gap-1 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm"
                    >
                      <Eye size={14} /> Detalles
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                 <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                       No se encontraron clientes.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminClients;