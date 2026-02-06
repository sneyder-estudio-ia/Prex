import React, { useState, useRef } from 'react';
import { MarketplaceItem, ItemCategory } from '../types';
import { Search, Plus, Filter, Tag, DollarSign, Package, Edit2, Trash2, X, Image as ImageIcon, Save, ShoppingBag, CheckCircle } from 'lucide-react';

interface AdminStoreProps {
  items: MarketplaceItem[];
  onAddItem: (item: MarketplaceItem) => void;
  onUpdateItem: (item: MarketplaceItem) => void;
  onDeleteItem: (itemId: string) => void;
}

const AdminStore: React.FC<AdminStoreProps> = ({ items, onAddItem, onUpdateItem, onDeleteItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<MarketplaceItem>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter Logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats
  const totalValue = items.filter(i => i.status === 'AVAILABLE').reduce((acc, curr) => acc + curr.price, 0);
  const totalItems = items.length;
  const soldItems = items.filter(i => i.status === 'SOLD').length;
  const availableItems = items.filter(i => i.status === 'AVAILABLE').length;

  const handleOpenModal = (item?: MarketplaceItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        category: ItemCategory.OTHER,
        condition: 8,
        price: 0,
        marketValue: 0,
        status: 'AVAILABLE',
        images: []
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), reader.result as string].slice(0, 4)
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
     setFormData(prev => ({
        ...prev,
        images: prev.images?.filter((_, i) => i !== index)
     }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    if (editingItem) {
      // Update
      onUpdateItem({ ...editingItem, ...formData } as MarketplaceItem);
    } else {
      // Create
      const newItem: MarketplaceItem = {
        id: `M-${Date.now()}`,
        loanId: 'MANUAL',
        ...formData as MarketplaceItem,
        images: formData.images?.length ? formData.images : ['https://picsum.photos/200']
      };
      onAddItem(newItem);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Valor Inventario</p>
              <h3 className="text-2xl font-bold text-slate-800">${totalValue.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Disponibles</p>
              <h3 className="text-2xl font-bold text-blue-600">{availableItems}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <Tag size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
           <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Vendidos</p>
              <h3 className="text-2xl font-bold text-slate-600">{soldItems}</h3>
            </div>
            <div className="p-2 bg-slate-100 rounded-full text-slate-600">
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
           <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Items</p>
              <h3 className="text-2xl font-bold text-purple-600">{totalItems}</h3>
            </div>
            <div className="p-2 bg-purple-100 rounded-full text-purple-600">
              <Package size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
           <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">Inventario de Tienda</h2>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                   type="text" 
                   placeholder="Buscar artículo..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                 />
              </div>
              
              <div className="flex gap-2">
                 <select 
                   value={filterStatus}
                   onChange={(e) => setFilterStatus(e.target.value)}
                   className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                 >
                    <option value="ALL">Todos los estados</option>
                    <option value="AVAILABLE">Disponibles</option>
                    <option value="SOLD">Vendidos</option>
                    <option value="RESERVED">Apartados</option>
                 </select>
                 
                 <button 
                   onClick={() => handleOpenModal()}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap"
                 >
                    <Plus size={16} /> Agregar
                 </button>
              </div>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-700 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Artículo</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Precio Venta</th>
                <th className="px-6 py-4">Valor Mercado</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                         {item.images && item.images.length > 0 ? (
                           <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={16}/></div>
                         )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{item.name}</div>
                        <div className="text-xs text-slate-400">ID: {item.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                        {item.category}
                     </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                     ${item.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                     ${item.marketValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-[10px] font-bold border
                       ${item.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                       ${item.status === 'SOLD' ? 'bg-slate-100 text-slate-500 border-slate-200' : ''}
                       ${item.status === 'RESERVED' ? 'bg-amber-50 text-amber-600 border-amber-100' : ''}
                     `}>
                        {item.status === 'AVAILABLE' ? 'DISPONIBLE' : 
                         item.status === 'SOLD' ? 'VENDIDO' : 'APARTADO'}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleOpenModal(item)}
                         className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                         title="Editar"
                       >
                         <Edit2 size={16} />
                       </button>
                       <button 
                         onClick={() => {
                            if(confirm('¿Estás seguro de eliminar este artículo?')) onDeleteItem(item.id);
                         }}
                         className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                         title="Eliminar"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No hay artículos que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-slate-800">
                   {editingItem ? 'Editar Artículo' : 'Nuevo Artículo'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                   <X size={24} />
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Left Col: Images & Basic Info */}
                   <div className="space-y-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-2">Imágenes</label>
                         <div className="grid grid-cols-2 gap-2">
                            {formData.images?.map((img, idx) => (
                               <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={12} />
                                  </button>
                               </div>
                            ))}
                            {(formData.images?.length || 0) < 4 && (
                               <button 
                                 type="button"
                                 onClick={() => fileInputRef.current?.click()}
                                 className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors bg-slate-50"
                               >
                                  <ImageIcon size={20} className="mb-1" />
                                  <span className="text-xs">Agregar</span>
                               </button>
                            )}
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                         </div>
                      </div>

                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Artículo</label>
                         <input 
                           required
                           type="text" 
                           value={formData.name || ''}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Ej. Laptop HP Pavillion"
                         />
                      </div>
                      
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                         <select 
                           value={formData.category || ItemCategory.OTHER}
                           onChange={e => setFormData({...formData, category: e.target.value as ItemCategory})}
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                         >
                            {Object.values(ItemCategory).map(cat => (
                               <option key={cat} value={cat}>{cat}</option>
                            ))}
                         </select>
                      </div>
                   </div>

                   {/* Right Col: Details & Pricing */}
                   <div className="space-y-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                         <textarea 
                           rows={4}
                           value={formData.description || ''}
                           onChange={e => setFormData({...formData, description: e.target.value})}
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                           placeholder="Detalles técnicos, estado, accesorios..."
                         />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Precio Venta ($)</label>
                            <input 
                              required
                              type="number" 
                              min="0"
                              value={formData.price || ''}
                              onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Valor Mercado ($)</label>
                            <input 
                              type="number" 
                              min="0"
                              value={formData.marketValue || ''}
                              onChange={e => setFormData({...formData, marketValue: parseFloat(e.target.value)})}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-500"
                            />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Condición (1-10)</label>
                            <input 
                              type="number" 
                              min="1"
                              max="10"
                              value={formData.condition || 8}
                              onChange={e => setFormData({...formData, condition: parseInt(e.target.value)})}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                            <select 
                              value={formData.status || 'AVAILABLE'}
                              onChange={e => setFormData({...formData, status: e.target.value as any})}
                              className={`w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold 
                                ${formData.status === 'AVAILABLE' ? 'text-emerald-600 bg-emerald-50' : ''}
                                ${formData.status === 'SOLD' ? 'text-slate-600 bg-slate-100' : ''}
                                ${formData.status === 'RESERVED' ? 'text-amber-600 bg-amber-50' : ''}
                              `}
                            >
                               <option value="AVAILABLE">DISPONIBLE</option>
                               <option value="RESERVED">APARTADO</option>
                               <option value="SOLD">VENDIDO</option>
                            </select>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                   <button 
                     type="button"
                     onClick={() => setIsModalOpen(false)}
                     className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                   >
                      Cancelar
                   </button>
                   <button 
                     type="submit"
                     className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-200 transition-colors font-bold flex items-center gap-2"
                   >
                      <Save size={18} /> Guardar
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminStore;