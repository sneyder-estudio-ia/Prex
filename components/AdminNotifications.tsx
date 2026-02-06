import React from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, Clock, X } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Pago Recibido',
    message: 'El cliente Juan Pérez ha realizado el pago de su cuota mensual.',
    time: 'Hace 5 min',
    type: 'SUCCESS',
    read: false
  },
  {
    id: 2,
    title: 'Préstamo Vencido',
    message: 'El contrato #CTR-002 ha vencido hoy. Contactar al cliente.',
    time: 'Hace 2 horas',
    type: 'WARNING',
    read: false
  },
  {
    id: 3,
    title: 'Nuevo Cliente',
    message: 'Se ha registrado un nuevo cliente: Carlos Ruiz.',
    time: 'Hace 4 horas',
    type: 'INFO',
    read: true
  },
  {
    id: 4,
    title: 'Inventario Bajo',
    message: 'Quedan pocos espacios en la categoría de Joyería.',
    time: 'Ayer',
    type: 'INFO',
    read: true
  },
  {
    id: 5,
    title: 'Cierre de Caja',
    message: 'El reporte diario se generó automáticamente.',
    time: 'Ayer',
    type: 'SUCCESS',
    read: true
  }
];

const AdminNotifications: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Bell className="text-blue-600" /> Centro de Notificaciones
            </h2>
            <p className="text-slate-500 text-sm">Mantente al día con las alertas del sistema.</p>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
            Marcar todo como leído
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {MOCK_NOTIFICATIONS.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-5 flex gap-4 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}
            >
              <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${notif.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : ''}
                ${notif.type === 'WARNING' ? 'bg-red-100 text-red-600' : ''}
                ${notif.type === 'INFO' ? 'bg-blue-100 text-blue-600' : ''}
              `}>
                {notif.type === 'SUCCESS' && <CheckCircle size={20} />}
                {notif.type === 'WARNING' && <AlertTriangle size={20} />}
                {notif.type === 'INFO' && <Info size={20} />}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> {notif.time}
                  </span>
                </div>
                <p className={`text-sm ${!notif.read ? 'text-slate-800' : 'text-slate-500'}`}>
                  {notif.message}
                </p>
              </div>

              {!notif.read && (
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <button className="text-slate-500 text-sm font-medium hover:text-slate-700">
            Ver notificaciones anteriores
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;