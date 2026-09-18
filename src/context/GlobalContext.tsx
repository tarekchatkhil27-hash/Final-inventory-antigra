import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Product, Supplier, Customer, HistoryLog, Payable, Receivable, SaleRecord, PurchaseRecord, Transaction, Staff, Attendance, Payroll, Roster, AppNotification, UserRole, User, BusinessSettings } from '../types';
import { mockProducts, mockTransactions } from '../data/mockData';

interface GlobalState {
  currentUserRole: UserRole;
  setCurrentUserRole: React.Dispatch<React.SetStateAction<UserRole>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  businessSettings: BusinessSettings;
  setBusinessSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  historyLogs: HistoryLog[];
  setHistoryLogs: React.Dispatch<React.SetStateAction<HistoryLog[]>>;
  payables: Payable[];
  setPayables: React.Dispatch<React.SetStateAction<Payable[]>>;
  receivables: Receivable[];
  setReceivables: React.Dispatch<React.SetStateAction<Receivable[]>>;
  sales: SaleRecord[];
  setSales: React.Dispatch<React.SetStateAction<SaleRecord[]>>;
  purchases: PurchaseRecord[];
  setPurchases: React.Dispatch<React.SetStateAction<PurchaseRecord[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  attendance: Attendance[];
  setAttendance: React.Dispatch<React.SetStateAction<Attendance[]>>;
  rosters: Roster[];
  setRosters: React.Dispatch<React.SetStateAction<Roster[]>>;
  payroll: Payroll[];
  setPayroll: React.Dispatch<React.SetStateAction<Payroll[]>>;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('admin');
  const [users, setUsers] = useState<User[]>([
    { id: 'U001', name: 'Admin User', username: 'admin', password: 'password123', role: 'admin', status: 'active', lastLogin: new Date().toISOString() },
    { id: 'U002', name: 'Staff User', username: 'staff', password: 'password123', role: 'staff', status: 'active', lastLogin: new Date().toISOString() }
  ]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    businessName: 'Nexus Inventory',
    ownerName: 'John Doe',
    currency: 'BDT',
    taxPercentage: 10,
    timezone: 'Asia/Dhaka',
    address: '123 Business Rd, Tech City',
    phone: '+1 234 567 8900',
    email: 'contact@nexus.com'
  });
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: 'S001', name: 'TechCorp Electronics', mobile: '+1234567890' },
    { id: 'S002', name: 'Office Plus', mobile: '+1987654321' },
    { id: 'S003', name: 'Global Accessories', mobile: '+1122334455' },
  ]);
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 'C001', name: 'John Doe', mobile: '+1999888777' },
    { id: 'C002', name: 'Jane Smith', mobile: '+1888777666' },
  ]);
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([
    {
      id: 'H001',
      date: new Date().toISOString(),
      module: 'system',
      action: 'System Init',
      description: 'System initialized with mock data',
      user: 'Admin',
    }
  ]);
  const [payables, setPayables] = useState<Payable[]>([
    {
      id: 'PAY-001',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      supplierId: 'S001',
      supplierName: 'TechCorp Electronics',
      totalAmount: 1500.00,
      paidAmount: 500.00,
      dueAmount: 1000.00,
      status: 'partial',
      relatedEntityId: 'PO-2026-001'
    }
  ]);
  const [receivables, setReceivables] = useState<Receivable[]>([
    {
      id: 'REC-001',
      date: new Date(Date.now() - 86400000 * 1).toISOString(),
      customerId: 'C001',
      customerName: 'John Doe',
      totalAmount: 900.00,
      paidAmount: 400.00,
      dueAmount: 500.00,
      status: 'partial',
      relatedEntityId: 'INV-2026-001'
    }
  ]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [staff, setStaff] = useState<Staff[]>([
    {
      id: 'EMP-001',
      name: 'Alice Johnson',
      position: 'Store Manager',
      department: 'Management',
      email: 'alice@example.com',
      phone: '+8801711223344',
      joinDate: '2025-01-15',
      salary: 45000,
      status: 'active',
      shift: 'Morning'
    },
    {
      id: 'EMP-002',
      name: 'Bob Smith',
      position: 'Sales Associate',
      department: 'Sales',
      email: 'bob@example.com',
      phone: '+8801811223344',
      joinDate: '2025-03-01',
      salary: 25000,
      status: 'active',
      shift: 'Evening'
    }
  ]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        products,
        setProducts,
        suppliers,
        setSuppliers,
        customers,
        setCustomers,
        historyLogs,
        setHistoryLogs,
        payables,
        setPayables,
        receivables,
        setReceivables,
        sales,
        setSales,
        purchases,
        setPurchases,
        transactions,
        setTransactions,
        staff,
        setStaff,
        attendance,
        setAttendance,
        rosters,
        setRosters,
        payroll,
        setPayroll,
        notifications,
        setNotifications,
        addNotification,
        currentUserRole,
        setCurrentUserRole,
        users,
        setUsers,
        businessSettings,
        setBusinessSettings,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
}
