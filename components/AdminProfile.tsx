import React, { useState, useEffect, useRef } from 'react';
import { Loan, LoanStatus, Client, ItemCategory } from '../types';
import { Save, Check, X, Building, Settings, Bell, Shield, UserCheck, AlertCircle, Calendar, DollarSign, Percent, ArrowLeft, ChevronRight, FileText, Lock, Maximize2, ChevronLeft, AlertTriangle, Clock, Mail, Phone, Star, User, Receipt, CalendarCheck, Wallet, Plus, Camera, Coins, Printer, History, Download, Edit3 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface AdminProfileProps {
  loans: Loan[];
  clients: Client[];
  onUpdateLoan: (loan: Loan) => void;
  onDeleteLoan: (loanId: string) => void;
  onAddLoan: (loan: Loan) => void;
  onDefaultLoan: (loan: Loan) => void;
}

type ProfileView = 'MENU' | 'REQUESTS' | 'SETTINGS' | 'STATS' | 'SECURITY' | 'ACTIVE_LOANS' | 'OVERDUE_LOANS' | 'CLIENT_DETAILS' | 'LOAN_DETAILS' | 'NEW_LOAN';

const AdminProfile: React.FC<AdminProfileProps> = ({ loans, clients, onUpdateLoan, onDeleteLoan, onAddLoan, onDefaultLoan }) => {
  const [currentView, setCurrentView] = useState<ProfileView>('MENU');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showInstallments, setShowInstallments] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptMode, setReceiptMode] = useState<'FULL' | 'LAST'>('LAST');
  const [installments, setInstallments] = useState<any[]>([]);

  // Custom Payment State
  const [customPayModal, setCustomPayModal] = useState<{isOpen: boolean, index: number | null}>({isOpen: false, index: null});
  const [customAmount, setCustomAmount] = useState('');

  // Business Settings State
  const [businessName, setBusinessName] = useState('PrestaValor Sucursal Central');
  const [address, setAddress] = useState('Av. Principal #123, Managua');
  const [defaultRate, setDefaultRate] = useState(5.0);
  const [gracePeriod, setGracePeriod] = useState(5);
  const [lateFeePerDay, setLateFeePerDay] = useState(0.5); // New state for late fee
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Image Viewer State
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // NEW LOAN FORM STATE
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImages, setNewItemImages] = useState<string[]>([]);
  const [newLoanAmount, setNewLoanAmount] = useState('');
  const [newInterestRate, setNewInterestRate] = useState('5.0');
  const [newCurrency, setNewCurrency] = useState<'NIO' | 'USD'>('NIO');
  const [newFrequency, setNewFrequency] = useState<'Diario' | 'Semanal' | 'Quincenal' | 'Mensual'>('Mensual');
  const [newDuration, setNewDuration] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter Loans
  const pendingLoans = loans.filter(l => l.status === LoanStatus.PENDING);
  const activeLoans = loans.filter(l => l.status === LoanStatus.ACTIVE);
  const overdueLoans = loans.filter(l => l.status === LoanStatus.OVERDUE);
  
  // Client Stats
  const topClients = [...clients].sort((a, b) => b.rating - a.rating).slice(0, 5);

  const handleApprove = (loan: Loan) => {
    const updatedLoan = { ...loan, status: LoanStatus.ACTIVE };
    onUpdateLoan(updatedLoan);
    alert(`Préstamo para ${loan.clientName} ha sido aprobado y activado.`);
  };

  const handleReject = (loan: Loan) => {
    if (confirm('¿Estás seguro de rechazar y eliminar esta solicitud?')) {
      onDeleteLoan(loan.id);
    }
  };

  const handleLostProduct = () => {
      if (!selectedLoan) return;
      
      // Double check function exists
      if (typeof onDefaultLoan !== 'function') {
          alert("Error: Función de reporte no conectada.");
          return;
      }

      if (window.confirm("¡ATENCIÓN!\n\n¿Estás seguro que deseas marcar este producto como PERDIDO?\n\n- El préstamo se cerrará.\n- El producto se enviará a la Tienda.\n- El precio de venta será el MONTO ORIGINAL DEL PRÉSTAMO.")) {
          onDefaultLoan(selectedLoan);
          setSelectedLoan(null);
          setCurrentView('CLIENT_DETAILS');
      }
  };

  // New Loan Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (newItemImages.length >= 4) {
            alert("Máximo 4 imágenes permitidas");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewItemImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
      setNewItemImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitNewLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedClient) return;

    const amount = parseFloat(newLoanAmount);
    const rate = parseFloat(newInterestRate) / 100;
    const interest = amount * rate;
    const totalDue = amount + interest;

    const newLoan: Loan = {
        id: `CTR-${Date.now()}`,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        item: {
            id: `I-${Date.now()}`,
            name: newItemName,
            description: newItemDesc,
            category: ItemCategory.OTHER,
            condition: 10,
            images: newItemImages.length > 0 ? newItemImages : ['https://picsum.photos/200'],
            marketValue: amount * 2
        },
        loanAmount: amount,
        interestRate: rate,
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: LoanStatus.ACTIVE,
        amountDue: totalDue,
        currency: newCurrency,
        paymentFrequency: newFrequency,
        duration: newDuration
    };

    onAddLoan(newLoan);
    
    // Reset form
    setNewItemName('');
    setNewItemDesc('');
    setNewItemImages([]);
    setNewLoanAmount('');
    setNewInterestRate('5.0');
    setNewDuration(1);
    
    // Go back
    setCurrentView('CLIENT_DETAILS');
  };


  // Image Viewer Logic
  const openViewer = (images: string[]) => {
    setViewerImages(images);
    setCurrentImageIndex(0);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setViewerImages([]);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % viewerImages.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + viewerImages.length) % viewerImages.length);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowRight') setCurrentImageIndex((prev) => (prev + 1) % viewerImages.length);
      if (e.key === 'ArrowLeft') setCurrentImageIndex((prev) => (prev - 1 + viewerImages.length) % viewerImages.length);
    };
    if (isViewerOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isViewerOpen, viewerImages.length]);


  // Helper to generate mock installments based on loan data
  const generateMockInstallments = (loan: Loan) => {
    const inst = [];
    const count = loan.duration || 1;
    const amountPerInstallment = (loan.amountDue / count).toFixed(2);
    const startDate = new Date(loan.startDate);
    
    for (let i = 1; i <= count; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        
        let status = 'PENDING';
        if (loan.status === LoanStatus.REDEEMED) status = 'PAID';
        else if (i === 1 && loan.status === LoanStatus.ACTIVE) status = 'PAID'; // Simulate first one paid
        else if (loan.status === LoanStatus.OVERDUE && i === 1) status = 'OVERDUE';

        inst.push({
            number: i,
            date: date.toLocaleDateString(),
            amount: amountPerInstallment,
            status: status
        });
    }
    return inst;
  };

  // Initialize installments when a loan is selected
  useEffect(() => {
    if (selectedLoan) {
        setInstallments(generateMockInstallments(selectedLoan));
    }
  }, [selectedLoan]);

  const handlePayInstallment = (index: number) => {
      const updated = [...installments];
      updated[index].status = 'PAID';
      setInstallments(updated);
  };

  const handleOpenCustomPay = (index: number, currentAmount: string) => {
      setCustomAmount(currentAmount);
      setCustomPayModal({ isOpen: true, index });
  };

  const submitCustomPayment = () => {
      if (customPayModal.index === null) return;
      
      const updated = [...installments];
      updated[customPayModal.index].amount = parseFloat(customAmount).toFixed(2);
      updated[customPayModal.index].status = 'PAID';
      
      setInstallments(updated);
      setCustomPayModal({ isOpen: false, index: null });
      setCustomAmount('');
  };

  const handleDownloadReceipt = async () => {
    const element = document.getElementById('printable-receipt');
    if (element) {
        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher resolution
                backgroundColor: '#ffffff',
                logging: false,
            });
            const data = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = data;
            link.download = `Recibo-${selectedLoan?.id}-${receiptMode}.png`;
            link.click();
        } catch (error) {
            console.error("Error generating receipt image:", error);
            alert("Error al generar la imagen del recibo.");
        }
    }
  };

  // --- SUB-PAGES ---

  const renderMenu = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
      
      {/* Card: Solicitudes */}
      <div 
        onClick={() => setCurrentView('REQUESTS')}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Bell size={100} className="text-blue-600" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
            <Bell size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Solicitudes</h3>
          <p className="text-sm text-slate-500 mb-4">Gestionar peticiones de préstamos</p>
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${pendingLoans.length > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
              {pendingLoans.length} Pendientes
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Card: Contratos Activos (NUEVO) */}
      <div 
        onClick={() => setCurrentView('ACTIVE_LOANS')}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-cyan-300 transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <FileText size={100} className="text-cyan-600" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Contratos Activos</h3>
          <p className="text-sm text-slate-500 mb-4">Préstamos vigentes y al día</p>
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700">
              {activeLoans.length} Activos
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Card: Morosos (NUEVO) */}
      <div 
        onClick={() => setCurrentView('OVERDUE_LOANS')}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-red-300 transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <AlertTriangle size={100} className="text-red-600" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Cartera Vencida</h3>
          <p className="text-sm text-slate-500 mb-4">Clientes en mora o riesgo</p>
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${overdueLoans.length > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
              {overdueLoans.length} En Mora
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Card: Ajustes */}
      <div 
        onClick={() => setCurrentView('SETTINGS')}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-slate-400 transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Settings size={100} className="text-slate-600" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-4 group-hover:scale-110 transition-transform">
            <Settings size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Configuración</h3>
          <p className="text-sm text-slate-500 mb-4">Datos del negocio y tasas</p>
          <div className="flex items-center justify-end mt-auto">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Card: Clientes Top */}
      <div 
        onClick={() => setCurrentView('STATS')}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <UserCheck size={100} className="text-emerald-600" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
            <UserCheck size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Mejores Clientes</h3>
          <p className="text-sm text-slate-500 mb-4">Análisis y métricas de usuarios</p>
           <div className="flex items-center justify-end mt-auto">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>

       {/* Card: Seguridad */}
       <div 
        onClick={() => setCurrentView('SECURITY')}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-purple-300 transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Shield size={100} className="text-purple-600" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Seguridad</h3>
          <p className="text-sm text-slate-500 mb-4">Contraseñas y accesos</p>
           <div className="flex items-center justify-end mt-auto">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderActiveLoans = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <button 
        onClick={() => setCurrentView('MENU')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Volver al Menú</span>
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-cyan-50/30">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <FileText className="text-cyan-600" /> Contratos Activos
            </h2>
            <p className="text-slate-500">Listado de préstamos vigentes y al corriente</p>
          </div>
          <div className="bg-cyan-100 text-cyan-800 px-4 py-2 rounded-lg font-bold">
            {activeLoans.length} {activeLoans.length === 1 ? 'Contrato' : 'Contratos'}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {activeLoans.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
              <p className="text-lg font-medium">No hay contratos activos actualmente.</p>
            </div>
          ) : (
            activeLoans.map(loan => (
              <div key={loan.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-50 transition-colors">
                 {/* Image */}
                 <div 
                  className="w-full md:w-32 h-32 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 relative group cursor-pointer"
                  onClick={() => openViewer(loan.item.images)}
                >
                  <img 
                    src={loan.item.images[0]} 
                    alt={loan.item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <Maximize2 className="text-white" size={24} />
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                   <div className="flex justify-between">
                      <h4 className="font-bold text-slate-800 text-lg">{loan.item.name}</h4>
                      <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">{loan.id}</span>
                   </div>
                   <p className="text-slate-600 text-sm">Cliente: <span className="font-semibold text-slate-800">{loan.clientName}</span></p>
                   
                   <div className="flex flex-wrap gap-4 mt-2">
                      <div className="bg-cyan-50 px-3 py-1.5 rounded-lg border border-cyan-100">
                         <span className="block text-xs text-cyan-600 uppercase font-bold">Monto Prestado</span>
                         <span className="block font-bold text-cyan-800">{loan.currency === 'NIO' ? 'C$' : '$'}{loan.loanAmount}</span>
                      </div>
                      <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                         <span className="block text-xs text-slate-500 uppercase font-bold">Vencimiento</span>
                         <span className="block font-medium text-slate-700">{new Date(loan.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                         <span className="block text-xs text-slate-500 uppercase font-bold">Frecuencia</span>
                         <span className="block font-medium text-slate-700">{loan.paymentFrequency}</span>
                      </div>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderOverdueLoans = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <button 
        onClick={() => setCurrentView('MENU')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Volver al Menú</span>
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-red-50/30">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <AlertTriangle className="text-red-600" /> Cartera Vencida (Morosos)
            </h2>
            <p className="text-slate-500">Contratos con pagos atrasados que requieren atención</p>
          </div>
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold">
            {overdueLoans.length} {overdueLoans.length === 1 ? 'Contrato' : 'Contratos'}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {overdueLoans.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
              <Check className="text-emerald-400 mb-2" size={48} />
              <p className="text-lg font-medium">¡Excelente! No hay morosos actualmente.</p>
            </div>
          ) : (
            overdueLoans.map(loan => (
              <div key={loan.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-red-50/20 transition-colors border-l-4 border-l-red-500">
                 {/* Image */}
                 <div 
                  className="w-full md:w-32 h-32 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-red-200 relative group cursor-pointer"
                  onClick={() => openViewer(loan.item.images)}
                >
                  <img 
                    src={loan.item.images[0]} 
                    alt={loan.item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <Maximize2 className="text-white" size={24} />
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                   <div className="flex justify-between">
                      <h4 className="font-bold text-slate-800 text-lg">{loan.item.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                           <Clock size={12} /> ATRASADO
                        </span>
                        <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">{loan.id}</span>
                      </div>
                   </div>
                   <p className="text-slate-600 text-sm">Cliente: <span className="font-semibold text-slate-800">{loan.clientName}</span></p>
                   
                   <div className="flex flex-wrap gap-4 mt-2">
                      <div className="bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                         <span className="block text-xs text-red-600 uppercase font-bold">Total a Pagar</span>
                         <span className="block font-bold text-red-800">{loan.currency === 'NIO' ? 'C$' : '$'}{loan.amountDue}</span>
                      </div>
                      <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                         <span className="block text-xs text-slate-500 uppercase font-bold">Venció el</span>
                         <span className="block font-medium text-slate-700">{new Date(loan.dueDate).toLocaleDateString()}</span>
                      </div>
                   </div>

                   <div className="flex gap-2 mt-4 pt-2">
                      <button className="text-xs bg-white border border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium transition-colors">
                         Contactar Cliente
                      </button>
                      <button className="text-xs bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-lg font-medium transition-colors shadow-sm">
                         Enviar a Remate
                      </button>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <button 
        onClick={() => setCurrentView('MENU')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Volver al Menú</span>
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-blue-50/30">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <Bell className="text-blue-600" /> Solicitudes Pendientes
            </h2>
            <p className="text-slate-500">Revisión y aprobación de nuevos empeños</p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold">
            {pendingLoans.length} {pendingLoans.length === 1 ? 'Solicitud' : 'Solicitudes'}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {pendingLoans.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Check size={32} className="text-slate-300" />
              </div>
              <p className="text-lg font-medium">¡Todo al día!</p>
              <p className="text-sm">No hay solicitudes pendientes por revisar.</p>
            </div>
          ) : (
            pendingLoans.map(loan => (
              <div key={loan.id} className="p-6 flex flex-col lg:flex-row gap-6 hover:bg-slate-50 transition-colors">
                {/* Item Image - Interactive */}
                <div 
                  className="w-full lg:w-48 h-48 lg:h-auto bg-slate-900 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 relative group cursor-pointer"
                  onClick={() => openViewer(loan.item.images)}
                >
                  <img 
                    src={loan.item.images[0]} 
                    alt={loan.item.name} 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500" 
                  />
                  
                  {/* Overlay Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="text-white drop-shadow-md" size={32} />
                  </div>

                  {/* Multiple Images Indicator */}
                  {loan.item.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-md font-bold flex items-center gap-1">
                      <FileText size={10} /> +{loan.item.images.length - 1}
                    </div>
                  )}

                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                    {loan.item.category}
                  </div>
                </div>
                
                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">{loan.item.name}</h4>
                      <p className="text-sm text-slate-500">Solicitado por: <span className="font-medium text-slate-700">{loan.clientName}</span></p>
                    </div>
                    <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">
                      ID: {loan.id}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
                    "{loan.item.description}"
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                      <p className="text-xs text-emerald-600 font-medium uppercase">Monto Préstamo</p>
                      <p className="text-lg font-bold text-emerald-700">{loan.currency === 'NIO' ? 'C$' : '$'}{loan.loanAmount}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 font-medium uppercase">Valor Mercado</p>
                      <p className="text-lg font-bold text-slate-700">{loan.currency === 'NIO' ? 'C$' : '$'}{loan.item.marketValue}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 font-medium uppercase">Tasa Interés</p>
                      <p className="text-lg font-bold text-slate-700">{loan.interestRate * 100}%</p>
                    </div>
                     <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 font-medium uppercase">Estado Estético</p>
                      <p className="text-lg font-bold text-slate-700">{loan.item.condition}/10</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6 min-w-[140px]">
                  <button 
                    onClick={() => handleApprove(loan)}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-bold transition shadow-md hover:shadow-lg"
                  >
                    <Check size={18} /> Aprobar
                  </button>
                  <button 
                    onClick={() => handleReject(loan)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl text-sm font-medium transition"
                  >
                    <X size={18} /> Rechazar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 max-w-4xl mx-auto">
      <button 
        onClick={() => setCurrentView('MENU')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Volver al Menú</span>
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Settings className="text-slate-600" /> Ajustes del Negocio
          </h2>
          <p className="text-slate-500 mt-1">Configura la información general y las reglas de préstamo.</p>
        </div>
        
        <div className="p-8 space-y-8">
           {/* Section 1 */}
           <div>
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Información General</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Negocio</label>
                  <div className="relative">
                    <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dirección Principal</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                  />
                </div>
             </div>
           </div>

           {/* Section 2 */}
           <div>
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Reglas Financieras</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Interés Base Mensual (%)</label>
                    <div className="relative">
                      <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number" 
                        value={defaultRate}
                        onChange={(e) => setDefaultRate(parseFloat(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none font-medium text-slate-800"
                      />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Días de Gracia</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number" 
                        value={gracePeriod}
                        onChange={(e) => setGracePeriod(parseInt(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none font-medium text-slate-800"
                      />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Interés Diario por Retraso (%)</label>
                    <div className="relative">
                      <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number" 
                        value={lateFeePerDay}
                        step="0.1"
                        onChange={(e) => setLateFeePerDay(parseFloat(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none font-medium text-slate-800"
                      />
                    </div>
                </div>
                <div className="flex items-end">
                  <div className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><Bell size={16}/> Notificaciones</span>
                    <button 
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
             </div>
           </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button className="bg-slate-800 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-slate-700 transition flex items-center gap-2 shadow-lg">
            <Save size={18} /> Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );

  const renderNewLoanForm = () => {
      const currencySymbol = newCurrency === 'NIO' ? 'C$' : '$';
      const interestAmount = (parseFloat(newLoanAmount) || 0) * ((parseFloat(newInterestRate) || 0) / 100);
      const totalFirst = (parseFloat(newLoanAmount) || 0) + interestAmount;

      return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
               <button 
                onClick={() => setCurrentView('CLIENT_DETAILS')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
                >
                <ArrowLeft size={20} />
                <span className="font-medium">Cancelar y Volver</span>
                </button>

                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Plus className="text-blue-600" /> Nuevo Empeño para {selectedClient?.name}
                    </h2>

                    <form onSubmit={handleSubmitNewLoan} className="space-y-8">
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
                                            Fotografías ({newItemImages.length}/4)
                                        </label>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            ref={fileInputRef}
                                            onChange={handleImageUpload} 
                                            className="hidden"
                                        />
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {newItemImages.map((img, idx) => (
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
                                            {newItemImages.length < 4 && (
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
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Artículo</label>
                                        <input required value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Ej. Laptop HP, Anillo Oro" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                     </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                                    <textarea value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Financials */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Wallet size={20} className="text-blue-500" />
                                Detalles Financieros
                            </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                     <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Moneda</label>
                                        <div className="flex gap-2">
                                            <button
                                            type="button"
                                            onClick={() => setNewCurrency('NIO')}
                                            className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-colors flex items-center justify-center gap-2 ${newCurrency === 'NIO' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                                            >
                                            <Coins size={16} /> Córdobas (C$)
                                            </button>
                                            <button
                                            type="button"
                                            onClick={() => setNewCurrency('USD')}
                                            className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-colors flex items-center justify-center gap-2 ${newCurrency === 'USD' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                                            >
                                            <DollarSign size={16} /> Dólares ($)
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Monto del Préstamo</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">{currencySymbol}</span>
                                            <input required value={newLoanAmount} onChange={e => setNewLoanAmount(e.target.value)} type="number" min="0" className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Tasa de Interés (%)</label>
                                        <div className="relative">
                                            <input required value={newInterestRate} onChange={e => setNewInterestRate(e.target.value)} type="number" min="0" step="0.1" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 pr-8" />
                                            <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                     <div className="grid grid-cols-2 gap-4">
                                         <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Frecuencia</label>
                                            <select 
                                                value={newFrequency} 
                                                onChange={(e) => setNewFrequency(e.target.value as any)}
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
                                                value={newDuration}
                                                onChange={(e) => setNewDuration(parseInt(e.target.value) || 1)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                         </div>
                                     </div>
                                     
                                     {/* Summary Box */}
                                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                                        <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                                            <span>Capital:</span>
                                            <span>{currencySymbol}{parseFloat(newLoanAmount || '0').toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-slate-600 mb-2 border-b border-slate-200 pb-2">
                                            <span>Interés ({newInterestRate}%):</span>
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
                                onClick={() => setCurrentView('CLIENT_DETAILS')} 
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
  };

  const renderLoanDetails = () => {
    if(!selectedLoan) return null;
    const currencySym = selectedLoan.currency === 'NIO' ? 'C$' : '$';
    const paidInstallments = installments.filter(i => i.status === 'PAID');
    const totalPaid = paidInstallments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const balance = selectedLoan.amountDue - totalPaid;
    
    // Last payment logic
    const lastPayment = paidInstallments.length > 0 ? paidInstallments[paidInstallments.length - 1] : null;

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
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
            <button 
                onClick={() => { setSelectedLoan(null); setCurrentView('CLIENT_DETAILS'); }}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">Volver a Detalles del Cliente</span>
            </button>

            {/* Header / Main Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6">
                <div 
                  className="w-full md:w-48 h-48 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 relative group cursor-pointer border border-slate-200"
                  onClick={() => openViewer(selectedLoan.item.images)}
                >
                    <img src={selectedLoan.item.images[0]} alt="Item" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Maximize2 className="text-white" size={24} />
                    </div>
                    {selectedLoan.item.images.length > 1 && (
                        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">+{selectedLoan.item.images.length -1}</span>
                    )}
                </div>
                
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{selectedLoan.item.name}</h2>
                            <p className="text-slate-500 font-mono text-sm">Contrato #{selectedLoan.id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border 
                             ${selectedLoan.status === LoanStatus.ACTIVE ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                             ${selectedLoan.status === LoanStatus.OVERDUE ? 'bg-red-50 text-red-700 border-red-200' : ''}
                             ${selectedLoan.status === LoanStatus.REDEEMED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                        `}>
                            {selectedLoan.status === LoanStatus.ACTIVE ? 'ACTIVO' : selectedLoan.status === LoanStatus.OVERDUE ? 'MORA' : selectedLoan.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="block text-xs text-slate-500 uppercase font-bold">Monto Original</span>
                            <span className="block text-lg font-bold text-slate-800">{currencySym}{selectedLoan.loanAmount}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="block text-xs text-slate-500 uppercase font-bold">Saldo Pendiente</span>
                            <span className="block text-lg font-bold text-red-600">{currencySym}{selectedLoan.amountDue}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <span className="block text-xs text-slate-500 uppercase font-bold">Fecha Inicio</span>
                             <span className="block text-lg font-medium text-slate-700">{new Date(selectedLoan.startDate).toLocaleDateString()}</span>
                        </div>
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <span className="block text-xs text-slate-500 uppercase font-bold">Fecha Vencimiento</span>
                             <span className="block text-lg font-medium text-slate-700">{new Date(selectedLoan.dueDate).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Vertical Button Stack */}
                    <div className="flex flex-col gap-3 pt-4">
                        <button 
                            onClick={() => setShowInstallments(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                        >
                            <Receipt size={20} /> Ver Plan de Pagos
                        </button>
                        <button 
                            onClick={() => setShowReceipt(true)}
                            className="w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 py-4 rounded-xl font-medium transition flex items-center justify-center gap-2"
                        >
                            <Printer size={20} /> Generar Recibo / Estado
                        </button>
                        {(selectedLoan.status === LoanStatus.ACTIVE || selectedLoan.status === LoanStatus.OVERDUE) && (
                            <button 
                                onClick={handleLostProduct}
                                className="w-full bg-red-600 text-white hover:bg-red-700 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-red-200 mt-2"
                            >
                                <AlertTriangle size={20} /> REPORTAR PRODUCTO PERDIDO
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Installments Modal */}
            {showInstallments && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                             <div>
                                <h3 className="text-xl font-bold flex items-center gap-2"><Wallet size={20} className="text-emerald-400"/> Plan de Pagos</h3>
                                <p className="text-slate-400 text-sm">Contrato: {selectedLoan.id} - {selectedLoan.item.name}</p>
                             </div>
                             <button onClick={() => setShowInstallments(false)} className="text-slate-400 hover:text-white transition">
                                <X size={24} />
                             </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs sticky top-0 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4"># Cuota</th>
                                        <th className="px-6 py-4">Fecha Programada</th>
                                        <th className="px-6 py-4">Monto</th>
                                        <th className="px-6 py-4">Estado</th>
                                        <th className="px-6 py-4 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {installments.map((inst, index) => (
                                        <tr key={inst.number} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-bold text-slate-700">{inst.number}</td>
                                            <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                                                <CalendarCheck size={14} className="text-slate-400"/> {inst.date}
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-slate-800">{currencySym}{inst.amount}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border
                                                    ${inst.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}
                                                    ${inst.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                                    ${inst.status === 'OVERDUE' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                                `}>
                                                    {inst.status === 'PAID' ? 'PAGADO' : inst.status === 'PENDING' ? 'PENDIENTE' : 'ATRASADO'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {inst.status !== 'PAID' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handlePayInstallment(index)}
                                                            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                                                        >
                                                            Registrar Pago
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenCustomPay(index, inst.amount)}
                                                            className="p-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-blue-600 transition"
                                                            title="Pago Personalizado / Abono"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-emerald-600 text-xs font-bold flex items-center justify-end gap-1">
                                                        <Check size={14} /> Completado
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
                            <button onClick={() => setShowInstallments(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Payment Modal */}
            {customPayModal.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-xl shadow-xl p-6 border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Pago Personalizado</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Ingrese el monto exacto que está abonando el cliente. Esto puede ser diferente a la cuota programada.
                        </p>
                        
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Monto a Registrar ({currencySym})</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                className="w-full text-lg p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setCustomPayModal({isOpen: false, index: null})}
                                className="flex-1 py-2 text-slate-600 font-medium bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={submitCustomPayment}
                                className="flex-1 py-2 text-white font-bold bg-emerald-600 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Save size={16} /> Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {showReceipt && (
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
                        
                        {/* CONDITIONAL CONTENT */}
                        {receiptMode === 'LAST' ? (
                            lastPayment ? (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">
                                    <div className="text-xs text-slate-500 mb-1">Pago Realizado</div>
                                    <div className="text-2xl font-black text-slate-900 mb-2">{currencySym}{lastPayment.amount}</div>
                                    <div className="text-xs text-slate-600">Cuota #{lastPayment.number} - {lastPayment.date}</div>
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
                                            <span>Cuota #{inst.number} ({inst.date})</span>
                                            <span className="font-bold">{currencySym}{inst.amount}</span>
                                        </div>
                                    ))}
                                    </div>
                                )
                        )}
                        </div>

                        <div className="border-t-2 border-dashed border-slate-200 pt-4 space-y-2 font-mono text-sm">
                        {receiptMode === 'FULL' && (
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
                        )}
                        
                        <div className="flex justify-between text-lg font-black mt-2 pt-2 border-t border-slate-100">
                            <span>SALDO RESTANTE:</span>
                            <span>{currencySym}{balance.toFixed(2)}</span>
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
        </div>
    );
  };

  const renderClientDetails = () => {
    if (!selectedClient) return null;
    
    const clientLoans = loans.filter(l => l.clientId === selectedClient.id);
    const activeLoansCount = clientLoans.filter(l => l.status === LoanStatus.ACTIVE || l.status === LoanStatus.OVERDUE).length;
    const totalDebt = clientLoans
      .filter(l => l.status === LoanStatus.ACTIVE || l.status === LoanStatus.OVERDUE)
      .reduce((acc, curr) => acc + curr.amountDue, 0);

    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
         <button 
          onClick={() => { setSelectedClient(null); setCurrentView('STATS'); }}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Volver a Mejores Clientes</span>
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
                     <Calendar size={16} /> Desde: {new Date(selectedClient.joinDate).toLocaleDateString()}
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
              <p className="text-2xl font-bold text-red-600">
                 {activeLoansCount > 0 && (clientLoans[0]?.currency === 'NIO' ? 'C$' : '$')}
                 {totalDebt.toLocaleString()}
              </p>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-xs text-slate-500 font-medium uppercase">Histórico Total</p>
              <p className="text-2xl font-bold text-blue-600">{clientLoans.length}</p>
           </div>
        </div>

        {/* Loan History Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">Historial de Empeños</h3>
                <p className="text-xs text-slate-400 mt-1">Haga clic en un contrato para ver detalles y cuotas.</p>
              </div>
              <button 
                onClick={() => setCurrentView('NEW_LOAN')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                  <Plus size={16} /> Añadir
              </button>
           </div>
           <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-700 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Artículo</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Monto</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientLoans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No hay registros.
                    </td>
                  </tr>
                ) : (
                  clientLoans.map((loan) => (
                    <tr 
                        key={loan.id} 
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                        onClick={() => { setSelectedLoan(loan); setCurrentView('LOAN_DETAILS'); }}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-blue-600 font-medium">{loan.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{loan.item.name}</td>
                      <td className="px-6 py-4">{new Date(loan.startDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        {loan.currency === 'NIO' ? 'C$' : '$'}{loan.loanAmount}
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
                      <td className="px-6 py-4 text-right text-slate-400 group-hover:text-blue-600">
                          <ChevronRight size={18} />
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
  };

  const renderStats = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 max-w-4xl mx-auto">
      <button 
        onClick={() => setCurrentView('MENU')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Volver al Menú</span>
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6">
          <UserCheck className="text-emerald-600" /> Mejores Clientes
        </h2>

        <div className="space-y-4">
          {topClients.map((client, index) => (
            <div 
                key={client.id} 
                onClick={() => { setSelectedClient(client); setCurrentView('CLIENT_DETAILS'); }}
                className="bg-white rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group overflow-hidden cursor-pointer"
            >
               <div className="overflow-x-auto scrollbar-thin">
                   <div className="flex items-center gap-4 p-4 min-w-[500px] md:min-w-0">
                      <div className="w-8 font-bold text-slate-300 text-lg flex-shrink-0">#{index + 1}</div>
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 text-lg border border-emerald-100 flex-shrink-0">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-slate-800 whitespace-nowrap">{client.name}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500 whitespace-nowrap">
                           <span>{client.totalLoans} préstamos completados</span>
                           <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                           <span>Cliente desde {new Date(client.joinDate).getFullYear()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                         <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full text-yellow-700 border border-yellow-100">
                            <span className="font-bold">{client.rating}</span> <span className="text-yellow-400">★</span>
                         </div>
                         <span className="text-xs text-slate-400">Rating</span>
                      </div>
                   </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 max-w-2xl mx-auto">
       <button 
        onClick={() => setCurrentView('MENU')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Volver al Menú</span>
      </button>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
         <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white">
            <Shield size={48} className="mb-4 text-purple-400" />
            <h2 className="text-2xl font-bold">Seguridad y Acceso</h2>
            <p className="text-slate-400">Gestiona tus credenciales y sesiones activas.</p>
         </div>
         
         <div className="p-8 space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
               <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" />
               <div>
                  <h4 className="font-bold text-amber-800 text-sm">Recomendación de seguridad</h4>
                  <p className="text-amber-700 text-sm mt-1">Tu contraseña no se ha cambiado en 90 días. Se recomienda actualizarla.</p>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña Actual</label>
                  <div className="relative">
                     <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nueva Contraseña</label>
                  <div className="relative">
                     <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
               </div>
            </div>

            <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition">
               Actualizar Credenciales
            </button>

            <div className="pt-6 border-t border-slate-100">
               <h4 className="text-sm font-bold text-slate-800 mb-3">Sesiones Activas</h4>
               <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                     <span className="text-slate-600">Windows PC - Chrome (Actual)</span>
                  </div>
                  <span className="text-slate-400">Managua, NI</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[600px]">
      {currentView === 'MENU' && renderMenu()}
      {currentView === 'REQUESTS' && renderRequests()}
      {currentView === 'ACTIVE_LOANS' && renderActiveLoans()}
      {currentView === 'OVERDUE_LOANS' && renderOverdueLoans()}
      {currentView === 'SETTINGS' && renderSettings()}
      {currentView === 'STATS' && renderStats()}
      {currentView === 'SECURITY' && renderSecurity()}
      {currentView === 'CLIENT_DETAILS' && renderClientDetails()}
      {currentView === 'LOAN_DETAILS' && renderLoanDetails()}
      {currentView === 'NEW_LOAN' && renderNewLoanForm()}

      {/* Full Screen Image Viewer Modal */}
      {isViewerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200" onClick={closeViewer}>
          
          {/* Close Button */}
          <button 
            onClick={closeViewer}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[110]"
          >
            <X size={32} />
          </button>

          {/* Navigation Left */}
          {viewerImages.length > 1 && (
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-[110]"
            >
              <ChevronLeft size={48} />
            </button>
          )}

          {/* Main Image */}
          <div className="relative max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img 
              src={viewerImages[currentImageIndex]} 
              alt="Full view" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            {/* Image Counter */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white font-medium bg-white/10 px-4 py-1 rounded-full backdrop-blur-sm">
               Imagen {currentImageIndex + 1} de {viewerImages.length}
            </div>
          </div>

          {/* Navigation Right */}
          {viewerImages.length > 1 && (
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-[110]"
            >
              <ChevronRight size={48} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProfile;