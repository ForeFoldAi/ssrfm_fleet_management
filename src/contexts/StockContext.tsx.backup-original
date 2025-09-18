import React, { createContext, useContext, useState, useEffect } from 'react';

interface Transaction {
  date: string;
  type: 'stock_in' | 'request' | 'issued_request';
  quantity: number;
  note: string;
  user: string;
  balance: number;
  requestId?: string;
}

interface StockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  location: string;
  supplier: string;
  unitPrice: number;
  totalValue: number;
  lastUpdated: string;
  status: 'good' | 'low' | 'critical';
  transactions: Transaction[];
}

interface Request {
  id: string;
  materialName: string;
  quantity: string;
  status: string;
  requestedBy: string;
  issuedDate?: string;
  completedDate?: string;
}

interface StockContextType {
  stockData: StockItem[];
  updateStockFromRequest: (requestId: string, materialName: string, quantity: number, requestedBy: string) => void;
  addStock: (itemId: string, quantity: number, note: string, user: string) => void;
  requestStock: (itemId: string, quantity: number, note: string, user: string) => void;
  getStockByMaterial: (materialName: string) => StockItem | undefined;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const useStock = () => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stockData, setStockData] = useState<StockItem[]>([
    {
      id: "STK-001",
      name: "Bearings",
      category: "Mechanical Components",
      currentStock: 24,
      minStock: 10,
      maxStock: 50,
      unit: "pieces",
      location: "Parts Storage A-1",
      supplier: "SKF Industries",
      unitPrice: 700,
      totalValue: 16800,
      lastUpdated: "2024-01-20",
      status: "good",
      transactions: [
        { date: "2024-01-20", type: "stock_in", quantity: 30, note: "New shipment received", user: "Admin", balance: 24 },
        { date: "2024-01-19", type: "request", quantity: 6, note: "Request REQ-001 - Machine maintenance", user: "John Doe", balance: 24 },
      ]
    },
    {
      id: "STK-002", 
      name: "Motor Oil",
      category: "Lubricants",
      currentStock: 45, // Reduced from 65 due to issued request
      minStock: 20,
      maxStock: 100,
      unit: "liters",
      location: "Chemical Storage B-2",
      supplier: "Castrol India",
      unitPrice: 450,
      totalValue: 20250, // Updated based on current stock
      lastUpdated: "2024-01-19",
      status: "good",
      transactions: [
        { date: "2024-01-19", type: "stock_in", quantity: 80, note: "Monthly stock replenishment", user: "Admin", balance: 65 },
        { date: "2024-01-18", type: "issued_request", quantity: 20, note: "Request REQ-2024-180 - Routine maintenance for grinding motors", user: "John Martinez", balance: 45, requestId: "REQ-2024-180" },
        { date: "2024-01-17", type: "request", quantity: 15, note: "Request REQ-002 - Equipment lubrication", user: "Mike Smith", balance: 65 },
      ]
    },
    {
      id: "STK-003",
      name: "Steel Pipes",
      category: "Raw Materials",
      currentStock: 8,
      minStock: 15,
      maxStock: 40,
      unit: "pieces",
      location: "Material Yard C-1",
      supplier: "Tata Steel",
      unitPrice: 2500,
      totalValue: 20000,
      lastUpdated: "2024-01-18",
      status: "low",
      transactions: [
        { date: "2024-01-18", type: "request", quantity: 12, note: "Request REQ-003 - Construction project", user: "Sarah Johnson", balance: 8 },
        { date: "2024-01-15", type: "stock_in", quantity: 20, note: "Initial stock", user: "Admin", balance: 20 },
      ]
    },
    {
      id: "STK-004",
      name: "Safety Helmets",
      category: "Safety Equipment",
      currentStock: 35, // Reduced from 45 due to issued request
      minStock: 30,
      maxStock: 80,
      unit: "pieces",
      location: "Safety Storage D-1",
      supplier: "3M Safety",
      unitPrice: 850,
      totalValue: 29750, // Updated based on current stock
      lastUpdated: "2024-01-17",
      status: "good",
      transactions: [
        { date: "2024-01-17", type: "stock_in", quantity: 50, note: "Safety equipment procurement", user: "Admin", balance: 45 },
        { date: "2024-01-16", type: "issued_request", quantity: 10, note: "Request REQ-2024-170 - Annual safety equipment replacement", user: "John Martinez", balance: 35, requestId: "REQ-2024-170" },
        { date: "2024-01-15", type: "request", quantity: 5, note: "Request REQ-004 - New employee safety gear", user: "HR Team", balance: 45 },
      ]
    },
    {
      id: "STK-005",
      name: "Welding Rods",
      category: "Consumables",
      currentStock: 2,
      minStock: 10,
      maxStock: 30,
      unit: "kg",
      location: "Workshop Storage E-1",
      supplier: "ESAB India",
      unitPrice: 320,
      totalValue: 640,
      lastUpdated: "2024-01-16",
      status: "critical",
      transactions: [
        { date: "2024-01-16", type: "request", quantity: 8, note: "Request REQ-005 - Welding project", user: "Workshop Team", balance: 2 },
        { date: "2024-01-10", type: "stock_in", quantity: 10, note: "Initial stock", user: "Admin", balance: 10 },
      ]
    },
    {
      id: "STK-006",
      name: "Grinding Stones",
      category: "Raw Materials",
      currentStock: 18, // Reduced from 20 due to issued request
      minStock: 5,
      maxStock: 25,
      unit: "pieces",
      location: "Material Yard C-2",
      supplier: "Stone Craft Industries",
      unitPrice: 22500,
      totalValue: 405000, // Updated based on current stock
      lastUpdated: "2024-01-15",
      status: "good",
      transactions: [
        { date: "2024-01-15", type: "issued_request", quantity: 2, note: "Request REQ-2024-175 - Replace worn grinding stones in main mill", user: "John Martinez", balance: 18, requestId: "REQ-2024-175" },
        { date: "2024-01-10", type: "stock_in", quantity: 20, note: "Initial stock procurement", user: "Admin", balance: 20 },
      ]
    }
  ]);

  // Helper function to determine status based on stock levels
  const getStockStatus = (currentStock: number, minStock: number): 'good' | 'low' | 'critical' => {
    if (currentStock <= minStock * 0.5) return "critical";
    if (currentStock <= minStock) return "low";
    return "good";
  };

  // Update stock when a request is issued
  const updateStockFromRequest = (requestId: string, materialName: string, quantity: number, requestedBy: string) => {
    setStockData(prevData => {
      return prevData.map(item => {
        // Match by material name (you might want to make this more sophisticated)
        if (item.name.toLowerCase().includes(materialName.toLowerCase()) || 
            materialName.toLowerCase().includes(item.name.toLowerCase())) {
          
          if (quantity > item.currentStock) {
            console.warn(`Insufficient stock for ${materialName}. Available: ${item.currentStock}, Requested: ${quantity}`);
            return item; // Don't update if insufficient stock
          }

          const newStock = item.currentStock - quantity;
          const newTotalValue = newStock * item.unitPrice;
          const newStatus = getStockStatus(newStock, item.minStock);
          const currentDate = new Date().toISOString().split('T')[0];

          const newTransaction: Transaction = {
            date: currentDate,
            type: "issued_request",
            quantity: quantity,
            note: `Request ${requestId} - ${materialName} issued`,
            user: requestedBy,
            balance: newStock,
            requestId: requestId
          };

          return {
            ...item,
            currentStock: newStock,
            totalValue: newTotalValue,
            status: newStatus,
            lastUpdated: currentDate,
            transactions: [newTransaction, ...item.transactions]
          };
        }
        return item;
      });
    });
  };

  // Add stock function
  const addStock = (itemId: string, quantity: number, note: string, user: string) => {
    setStockData(prevData => {
      return prevData.map(item => {
        if (item.id === itemId) {
          const newStock = item.currentStock + quantity;
          const newTotalValue = newStock * item.unitPrice;
          const newStatus = getStockStatus(newStock, item.minStock);
          const currentDate = new Date().toISOString().split('T')[0];

          const newTransaction: Transaction = {
            date: currentDate,
            type: "stock_in",
            quantity: quantity,
            note: note,
            user: user,
            balance: newStock
          };

          return {
            ...item,
            currentStock: newStock,
            totalValue: newTotalValue,
            status: newStatus,
            lastUpdated: currentDate,
            transactions: [newTransaction, ...item.transactions]
          };
        }
        return item;
      });
    });
  };

  // Request stock function
  const requestStock = (itemId: string, quantity: number, note: string, user: string) => {
    setStockData(prevData => {
      return prevData.map(item => {
        if (item.id === itemId) {
          if (quantity > item.currentStock) {
            console.warn(`Insufficient stock. Available: ${item.currentStock}, Requested: ${quantity}`);
            return item;
          }

          const newStock = item.currentStock - quantity;
          const newTotalValue = newStock * item.unitPrice;
          const newStatus = getStockStatus(newStock, item.minStock);
          const currentDate = new Date().toISOString().split('T')[0];

          const newTransaction: Transaction = {
            date: currentDate,
            type: "request",
            quantity: quantity,
            note: note,
            user: user,
            balance: newStock
          };

          return {
            ...item,
            currentStock: newStock,
            totalValue: newTotalValue,
            status: newStatus,
            lastUpdated: currentDate,
            transactions: [newTransaction, ...item.transactions]
          };
        }
        return item;
      });
    });
  };

  // Get stock item by material name
  const getStockByMaterial = (materialName: string): StockItem | undefined => {
    return stockData.find(item => 
      item.name.toLowerCase().includes(materialName.toLowerCase()) || 
      materialName.toLowerCase().includes(item.name.toLowerCase())
    );
  };

  return (
    <StockContext.Provider value={{
      stockData,
      updateStockFromRequest,
      addStock,
      requestStock,
      getStockByMaterial
    }}>
      {children}
    </StockContext.Provider>
  );
}; 