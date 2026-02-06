import React, { useState, useEffect } from 'react';
import { Loan, LoanStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, FileText, Package, AlertTriangle, CheckCircle, Search, ArrowLeft, Maximize2, Receipt, Wallet, X, CalendarCheck, ChevronLeft, ChevronRight, Check, Printer, Download, History, Clock, Edit3, Save, XCircle } from 'lucide-react';
import html2canvas from 'html2canvas';

interface AdminDashboardProps {
  loans: Loan[];
  onAddLoan: () => void;
  onDefaultLoan: (loan: Loan) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ loans, onAddLoan, onDefaultLoan }) => {
  const [filter, setFilter] = useState('ALL');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showInstallments, setShowInstallments] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptMode, setReceiptMode] = useState<'FULL' | 'LAST'>('LAST');
  
  // Installments State
  const [installments, setInstallments] = useState<any[]>([]);

  // Custom Payment State
  const [customPayModal, setCustomPayModal] = useState<{isOpen: boolean, index: number | null}>({isOpen: false, index: null});
  const [customAmount, setCustomAmount] = useState('');

  // Image Viewer State
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // Helper to generate mock installments
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
        else if (i === 1 && loan.status === LoanStatus.ACTIVE) status = 'PAID'; 
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
      }
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowRight') setCurrentImageIndex((prev) => (prev + 1) % viewerImages.length);
      if (e.key === 'ArrowLeft') setCurrentImageIndex((prev) => (prev - 1 + viewerImages.length) % viewerImages.length);
    };
    if (isViewerOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isViewerOpen, viewerImages.length]);


  // --- RENDER LOAN DETAILS VIEW ---
  if (selectedLoan) {
    const currencySym = selectedLoan.currency === 'NIO' ? 'C$' : '$';
    const paidInstallments = installments.filter(i => i.status === 'PAID');
    const totalPaid = paidInstallments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const balance = selectedLoan.amountDue - totalPaid;
    
    // Last payment logic
    const lastPayment = paidInstallments.length > 0 ? paidInstallments[paidInstallments.length - 1] : null;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300 pb-8">
         <button 
            onClick={() => setSelectedLoan(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
        >
            <ArrowLeft size={20} />
            <span className="font-medium">Volver al Dashboard</span>
        </button>

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
                        <p className="text-slate-600 text-sm mt-1">Cliente: <span className="font-semibold">{selectedLoan.clientName}</span></p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border 
                         ${selectedLoan.status === LoanStatus.ACTIVE ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                         ${selectedLoan.status === LoanStatus.OVERDUE ? 'bg-red-50 text-red-700 border-red-200' : ''}
                         ${selectedLoan.status === LoanStatus.REDEEMED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                         ${selectedLoan.status === LoanStatus.PENDING ? 'bg-slate-50 text-slate-600 border-slate-200' : ''}
                         ${selectedLoan.status === LoanStatus.DEFAULTED ? 'bg-gray-100 text-gray-600 border-gray-200' : ''}
                    `}>
                        {selectedLoan.status}
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
                            <p className="text-slate-400 text-sm">Contrato: {selectedLoan.id}</p>
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

        {/* Full Screen Image Viewer Modal */}
        {isViewerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200" onClick={closeViewer}>
          <button 
            onClick={closeViewer}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[110]"
          >
            <X size={32} />
          </button>
          {viewerImages.length > 1 && (
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-[110]"
            >
              <ChevronLeft size={48} />
            </button>
          )}
          <div className="relative max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img 
              src={viewerImages[currentImageIndex]} 
              alt="Full view" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white font-medium bg-white/10 px-4 py-1 rounded-full backdrop-blur-sm">
               Imagen {currentImageIndex + 1} de {viewerImages.length}
            </div>
          </div>
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
  }

  // --- RENDER DASHBOARD ---
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
                      ${loan.status === LoanStatus.PENDING ? 'bg-slate-100 text-slate-600' : ''}
                    `}>
                      {loan.status === LoanStatus.PENDING ? 'SOLO REGISTRO' : loan.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                     <button 
                        onClick={() => setSelectedLoan(loan)}
                        className="text-blue-600 hover:underline text-xs whitespace-nowrap font-medium"
                     >
                        Ver Detalle
                     </button>
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