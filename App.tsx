import React, { useState } from 'react';
import { Loan, LoanStatus, ItemCategory, MarketplaceItem, Client } from './types';
import AdminDashboard from './components/AdminDashboard';
import AdminClients from './components/AdminClients';
import AdminStore from './components/AdminStore';
import AdminProfile from './components/AdminProfile';
import AdminNotifications from './components/AdminNotifications';
import ClientApp from './components/ClientApp';
import { Store, User, LogOut, ArrowRight, Lock, Wallet, Users, ShoppingBag, UserCircle, Construction, Bell } from 'lucide-react';

// Mock Data
const MOCK_CLIENTS: Client[] = [
  {
    id: 'U1',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+52 55 1234 5678',
    rating: 4.8,
    joinDate: '2023-01-15',
    totalLoans: 5
  },
  {
    id: 'U2',
    name: 'Maria Lopez',
    email: 'maria.lopez@email.com',
    phone: '+52 55 8765 4321',
    rating: 5.0,
    joinDate: '2023-03-20',
    totalLoans: 2
  },
  {
    id: 'U3',
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@email.com',
    phone: '+52 55 1122 3344',
    rating: 3.5,
    joinDate: '2023-06-10',
    totalLoans: 1
  }
];

const MOCK_LOANS: Loan[] = [
  {
    id: 'CTR-001',
    clientId: 'U1',
    clientName: 'Juan Pérez',
    item: {
      id: 'I1',
      name: 'Sony PlayStation 5',
      description: 'Consola usada con 2 controles',
      category: ItemCategory.ELECTRONICS,
      condition: 9,
      images: ['https://picsum.photos/200'],
      marketValue: 450
    },
    loanAmount: 220,
    interestRate: 0.05,
    startDate: '2023-10-01',
    dueDate: '2023-11-01',
    status: LoanStatus.ACTIVE,
    amountDue: 231,
    currency: 'USD',
    paymentFrequency: 'Mensual',
    duration: 3
  },
  {
    id: 'CTR-002',
    clientId: 'U1',
    clientName: 'Juan Pérez',
    item: {
      id: 'I2',
      name: 'Taladro Makita 18V',
      description: 'Incluye batería extra y maletín',
      category: ItemCategory.TOOLS,
      condition: 7,
      images: ['https://picsum.photos/201'],
      marketValue: 120
    },
    loanAmount: 50,
    interestRate: 0.06,
    startDate: '2023-09-15',
    dueDate: '2023-10-15',
    status: LoanStatus.OVERDUE,
    amountDue: 56,
    currency: 'USD',
    paymentFrequency: 'Mensual',
    duration: 1
  },
  {
    id: 'CTR-003',
    clientId: 'U2',
    clientName: 'Maria Lopez',
    item: {
      id: 'I3',
      name: 'Anillo de Oro 14k',
      description: '3 gramos, grabado fecha',
      category: ItemCategory.JEWELRY,
      condition: 8,
      images: ['https://picsum.photos/202'],
      marketValue: 300
    },
    loanAmount: 5400,
    interestRate: 0.04,
    startDate: '2023-10-05',
    dueDate: '2023-11-05',
    status: LoanStatus.ACTIVE,
    amountDue: 5616,
    currency: 'NIO',
    paymentFrequency: 'Mensual',
    duration: 6
  },
  // Added a pending loan for demonstration
  {
    id: 'REQ-004',
    clientId: 'U3',
    clientName: 'Carlos Ruiz',
    item: {
      id: 'I4',
      name: 'MacBook Air M1',
      description: 'Modelo 2020, Gris Espacial',
      category: ItemCategory.ELECTRONICS,
      condition: 9,
      images: ['https://picsum.photos/204'],
      marketValue: 700
    },
    loanAmount: 350,
    interestRate: 0.05,
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: LoanStatus.PENDING,
    amountDue: 367.5,
    currency: 'USD',
    paymentFrequency: 'Mensual',
    duration: 1
  }
];

const MOCK_MARKETPLACE: MarketplaceItem[] = [
  {
    id: 'M1',
    name: 'Bicicleta Montañera Trek',
    description: 'Suspensión delantera, frenos de disco.',
    category: ItemCategory.VEHICLES,
    condition: 7,
    images: ['https://picsum.photos/300/300'],
    marketValue: 350,
    price: 280,
    loanId: 'OLD-001',
    status: 'AVAILABLE'
  },
  {
    id: 'M2',
    name: 'Guitarra Fender Stratocaster',
    description: 'Serie mexicana, color rojo.',
    category: ItemCategory.MUSICAL,
    condition: 8,
    images: ['https://picsum.photos/300/301'],
    marketValue: 600,
    price: 450,
    loanId: 'OLD-002',
    status: 'AVAILABLE'
  },
  {
    id: 'M3',
    name: 'Smart TV Samsung 50"',
    description: '4K UHD, modelo 2021.',
    category: ItemCategory.ELECTRONICS,
    condition: 9,
    images: ['https://picsum.photos/300/302'],
    marketValue: 400,
    price: 320,
    loanId: 'OLD-003',
    status: 'AVAILABLE'
  }
];

const ADMIN_EMAIL = 'axel23081994@gmail.com';

const App: React.FC = () => {
  const [view, setView] = useState<'ADMIN' | 'CLIENT' | 'LOGIN'>('LOGIN');
  const [adminTab, setAdminTab] = useState<'PERFIL' | 'CARTERA' | 'TIENDA' | 'CLIENTES' | 'NOTIFICACIONES'>('CARTERA');
  const [email, setEmail] = useState('');
  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [marketItems, setMarketItems] = useState<MarketplaceItem[]>(MOCK_MARKETPLACE);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (email.toLowerCase().trim() === ADMIN_EMAIL) {
      setView('ADMIN');
    } else {
      setView('CLIENT');
    }
  };

  const handleLogout = () => {
    setView('LOGIN');
    setEmail('');
    setAdminTab('CARTERA');
  };

  const handleAddLoan = (newLoan?: Loan) => {
    // If a loan object is provided, use it
    if (newLoan) {
      setLoans([newLoan, ...loans]);
      alert("Préstamo registrado exitosamente.");
    } else {
      // Simulation of adding a new loan for Admin demo (legacy behavior)
      const simLoan: Loan = {
        id: `CTR-${Math.floor(Math.random() * 1000)}`,
        clientId: 'U3',
        clientName: 'Nuevo Cliente',
        item: {
          id: `I-${Date.now()}`,
          name: 'Reloj Casio G-Shock',
          description: 'Modelo clásico negro',
          category: ItemCategory.JEWELRY,
          condition: 10,
          images: ['https://picsum.photos/203'],
          marketValue: 100
        },
        loanAmount: 50,
        interestRate: 0.05,
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: LoanStatus.ACTIVE,
        amountDue: 52.5,
        currency: 'USD',
        paymentFrequency: 'Mensual',
        duration: 1
      };
      setLoans([simLoan, ...loans]);
      alert("Préstamo simulado creado exitosamente.");
    }
  };

  const handleRegisterClient = (newClient: Client, firstLoan: Loan) => {
    setClients([newClient, ...clients]);
    setLoans([firstLoan, ...loans]);
    alert("Cliente registrado y préstamo creado exitosamente.");
  };

  const handleUpdateLoan = (updatedLoan: Loan) => {
    setLoans(prev => prev.map(l => l.id === updatedLoan.id ? updatedLoan : l));
  };

  // Logic for Defaulting a Loan (Producto Perdido)
  const handleDefaultLoan = (loan: Loan) => {
    // 1. Create a Marketplace Item from the Loan Item
    const newItem: MarketplaceItem = {
      id: `M-${Date.now()}`,
      name: loan.item.name,
      description: loan.item.description,
      category: loan.item.category,
      condition: loan.item.condition,
      images: loan.item.images,
      marketValue: loan.item.marketValue,
      price: loan.loanAmount, // CRITICAL: Price is the original loan amount
      loanId: loan.id,
      status: 'AVAILABLE'
    };

    // 2. Update Loan Status to DEFAULTED
    const updatedLoan = { ...loan, status: LoanStatus.DEFAULTED };

    // 3. Update State
    setMarketItems([newItem, ...marketItems]);
    setLoans(prev => prev.map(l => l.id === loan.id ? updatedLoan : l));

    alert(`El artículo "${loan.item.name}" ha sido marcado como perdido y enviado a la tienda con precio $${loan.loanAmount}.`);
  };

  const handleDeleteLoan = (loanId: string) => {
    setLoans(prev => prev.filter(l => l.id !== loanId));
  };

  // Marketplace Handlers
  const handleAddMarketItem = (item: MarketplaceItem) => {
    setMarketItems([item, ...marketItems]);
  };

  const handleUpdateMarketItem = (updatedItem: MarketplaceItem) => {
    setMarketItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteMarketItem = (itemId: string) => {
    setMarketItems(prev => prev.filter(item => item.id !== itemId));
  };

  if (view === 'LOGIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-5xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              PrestaValor
            </h1>
            <p className="text-slate-400">
              Plataforma de préstamos prendarios y marketplace.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Lock className="text-emerald-400" size={20} />
              Iniciar Sesión
            </h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group"
              >
                Ingresar
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-slate-500">
                Al ingresar, aceptas nuestros términos y condiciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100">
      
      {/* Desktop Sidebar - Hidden on Mobile */}
      <aside className="hidden md:flex w-20 bg-slate-900 flex-col items-center py-6 gap-6 fixed h-full z-50">
        <div className="text-white font-bold text-xl mb-4 tracking-wider">PV</div>
        
        {view === 'ADMIN' ? (
          <div className="flex flex-col gap-4 w-full px-2">
            <SidebarBtn 
              active={adminTab === 'PERFIL'} 
              onClick={() => setAdminTab('PERFIL')} 
              icon={<UserCircle size={24} />} 
              label="Perfil" 
            />
            <SidebarBtn 
              active={adminTab === 'CARTERA'} 
              onClick={() => setAdminTab('CARTERA')} 
              icon={<Wallet size={24} />} 
              label="Cartera" 
            />
            <SidebarBtn 
              active={adminTab === 'TIENDA'} 
              onClick={() => setAdminTab('TIENDA')} 
              icon={<ShoppingBag size={24} />} 
              label="Tienda" 
            />
            <SidebarBtn 
              active={adminTab === 'CLIENTES'} 
              onClick={() => setAdminTab('CLIENTES')} 
              icon={<Users size={24} />} 
              label="Clientes" 
            />
          </div>
        ) : (
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <User size={24} />
          </div>
        )}

        <div className="flex-1"></div>

        <button 
          onClick={handleLogout}
          className="p-3 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-800 transition mb-4 group relative"
          title="Cerrar Sesión"
        >
          <LogOut size={24} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 pointer-events-none">
            Salir
          </span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 ${view === 'ADMIN' ? 'md:ml-20' : 'md:ml-20'} mb-16 md:mb-0 p-0 md:p-6 overflow-x-hidden w-full`}>
        <div className="max-w-7xl mx-auto h-full">
          {view === 'ADMIN' ? (
            <div className="animate-in fade-in duration-500 p-4 md:p-0">
              <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                    {adminTab === 'CARTERA' && 'Gestión de Cartera'}
                    {adminTab === 'PERFIL' && 'Perfil de Administrador'}
                    {adminTab === 'TIENDA' && 'Gestión de Tienda'}
                    {adminTab === 'CLIENTES' && 'Directorio de Clientes'}
                    {adminTab === 'NOTIFICACIONES' && 'Notificaciones'}
                  </h1>
                  <p className="text-sm md:text-base text-slate-500">Sesión activa: {email}</p>
                </div>
                
                {/* Notification Icon Area */}
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => setAdminTab('NOTIFICACIONES')}
                    className={`relative p-3 rounded-full transition-all shadow-sm group
                      ${adminTab === 'NOTIFICACIONES' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:text-blue-600 hover:bg-blue-50'}
                    `}
                    title="Notificaciones"
                   >
                      <Bell size={24} />
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                   </button>
                </div>
              </header>
              
              {/* Content Switching */}
              {adminTab === 'CARTERA' && <AdminDashboard loans={loans} onAddLoan={() => handleAddLoan()} onDefaultLoan={handleDefaultLoan} />}
              {adminTab === 'PERFIL' && <AdminProfile loans={loans} clients={clients} onUpdateLoan={handleUpdateLoan} onDeleteLoan={handleDeleteLoan} onAddLoan={handleAddLoan} onDefaultLoan={handleDefaultLoan} />}
              {adminTab === 'TIENDA' && <AdminStore items={marketItems} onAddItem={handleAddMarketItem} onUpdateItem={handleUpdateMarketItem} onDeleteItem={handleDeleteMarketItem} />}
              {adminTab === 'CLIENTES' && <AdminClients clients={clients} loans={loans} onRegisterClient={handleRegisterClient} onAddLoan={handleAddLoan} />}
              {adminTab === 'NOTIFICACIONES' && <AdminNotifications />}

            </div>
          ) : (
            // Full height container for mobile, padded for desktop
            <div className="h-[100dvh] md:h-[calc(100vh-3rem)] w-full flex justify-center items-center">
              <ClientApp 
                loans={loans} 
                marketplaceItems={marketItems} 
                currentUserId="U1" 
              />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Hidden on Desktop */}
      <nav className="md:hidden fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around items-center p-2 z-50 pb-safe shadow-2xl">
        {view === 'ADMIN' ? (
          <>
            <MobileNavBtn 
              active={adminTab === 'PERFIL'} 
              onClick={() => setAdminTab('PERFIL')} 
              icon={<UserCircle size={20} />} 
              label="Perfil" 
            />
            <MobileNavBtn 
              active={adminTab === 'CARTERA'} 
              onClick={() => setAdminTab('CARTERA')} 
              icon={<Wallet size={20} />} 
              label="Cartera" 
            />
            <MobileNavBtn 
              active={adminTab === 'TIENDA'} 
              onClick={() => setAdminTab('TIENDA')} 
              icon={<ShoppingBag size={20} />} 
              label="Tienda" 
            />
            <MobileNavBtn 
              active={adminTab === 'CLIENTES'} 
              onClick={() => setAdminTab('CLIENTES')} 
              icon={<Users size={20} />} 
              label="Clientes" 
            />
            <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-400 p-2">
              <LogOut size={20} />
              <span className="text-[10px]">Salir</span>
            </button>
          </>
        ) : (
          <div className="w-full flex justify-between px-6 items-center">
             <span className="text-sm text-slate-400 font-medium">Modo Cliente</span>
             <button onClick={handleLogout} className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full text-white text-sm">
                <LogOut size={16} /> Salir
             </button>
          </div>
        )}
      </nav>
    </div>
  );
};

// Sub-components for cleaner render code
const SidebarBtn = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button
    onClick={onClick}
    className={`w-full p-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-200 group
      ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const MobileNavBtn = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${active ? 'text-emerald-400' : 'text-slate-400'}`}
  >
    {icon}
    <span className="text-[10px]">{label}</span>
  </button>
);

export default App;