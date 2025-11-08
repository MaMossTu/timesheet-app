"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface Company {
  id: string;
  name: string;
  code?: string;
  description?: string;
  approvedBy?: string;
}

interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  prefix?: string;
  companies?: Company[];
  selectedCompanyId?: string;
}

interface TimeEntry {
  id: string;
  userId: string;
  companyId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  date: string;
}

interface AuthContextType {
  user: User | null;
  timeEntries: TimeEntry[];
  selectedCompany: Company | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    name?: string
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => boolean;
  addTimeEntry: (
    entry: Omit<TimeEntry, "id" | "userId" | "companyId">
  ) => boolean;
  updateTimeEntry: (id: string, entry: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;
  selectCompany: (companyId: string) => void;
  addCompany: (company: Omit<Company, "id">) => boolean;
  updateCompany: (companyId: string, updates: Partial<Company>) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo companies
const DEMO_COMPANIES: Company[] = [
  {
    id: "company1",
    name: "ABC Corporation",
    code: "ABC",
    description: "Technology Solutions Company",
    approvedBy: "John Smith (Manager)",
  },
  {
    id: "company2",
    name: "XYZ Enterprise",
    code: "XYZ",
    description: "Consulting Services",
    approvedBy: "Sarah Johnson (Director)",
  },
  {
    id: "company3",
    name: "StartupTech",
    code: "ST",
    description: "Software Development Startup",
    approvedBy: "Mike Chen (CEO)",
  },
];

// Demo users for testing
const DEMO_USERS = [
  {
    id: "1",
    email: "demo@example.com",
    password: "demo123",
    username: "demo",
    name: "Demo User",
    prefix: "Mr.",
    companies: DEMO_COMPANIES,
    selectedCompanyId: "company1",
  },
  {
    id: "2",
    email: "admin@example.com",
    password: "admin",
    username: "admin",
    name: "Admin User",
    prefix: "Ms.",
    companies: DEMO_COMPANIES,
    selectedCompanyId: "company1",
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ตรวจสอบ user ที่บันทึกไว้ใน localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedTimeEntries = localStorage.getItem("timeEntries");

    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      // Set selected company from saved user data
      if (userData.companies && userData.selectedCompanyId) {
        const company = userData.companies.find(
          (c: Company) => c.id === userData.selectedCompanyId
        );
        setSelectedCompany(company || null);
      }
    }

    if (savedTimeEntries) {
      setTimeEntries(JSON.parse(savedTimeEntries));
    }

    setIsLoading(false);
  }, []);

  // บันทึก timeEntries ลง localStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (timeEntries.length > 0) {
      localStorage.setItem("timeEntries", JSON.stringify(timeEntries));
    }
  }, [timeEntries]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      // Simple demo authentication - now using username instead of email
      const demoUser = DEMO_USERS.find(
        (u) => u.username === username && u.password === password
      );

      if (demoUser) {
        const { password: _, ...userWithoutPassword } = demoUser;
        setUser(userWithoutPassword);
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    name?: string
  ): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = DEMO_USERS.find((u) => u.email === email);
      if (existingUser) {
        return false;
      }

      // Create new user with all required fields
      const newUser: User = {
        id: Date.now().toString(),
        email,
        username: email.split("@")[0], // Use email prefix as default username
        name: name || "New User",
        prefix: "Mr.",
        companies: DEMO_COMPANIES,
        selectedCompanyId: "company1",
      };

      // Add to demo users (with required fields)
      const demoUser = {
        ...newUser,
        password,
        username: newUser.username!,
        name: newUser.name!,
        prefix: newUser.prefix!,
        companies: newUser.companies!,
        selectedCompanyId: newUser.selectedCompanyId!,
      };
      DEMO_USERS.push(demoUser);

      setUser(newUser);
      setSelectedCompany(DEMO_COMPANIES[0]); // Set first company as default
      localStorage.setItem("user", JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const addTimeEntry = (
    entry: Omit<TimeEntry, "id" | "userId" | "companyId">
  ): boolean => {
    if (!user || !selectedCompany) return false;

    // ตรวจสอบว่ามีรายการในวันนี้แล้วหรือไม่ (สำหรับบริษัทนี้)
    const entryDate =
      entry.date || new Date(entry.startTime).toISOString().split("T")[0];
    const existingEntryForDate = timeEntries.find((existingEntry) => {
      if (existingEntry.userId !== user.id) return false;
      if (existingEntry.companyId !== selectedCompany.id) return false;

      const existingDate =
        existingEntry.date ||
        new Date(existingEntry.startTime).toISOString().split("T")[0];
      return existingDate === entryDate;
    });

    if (existingEntryForDate) {
      console.error("Cannot add entry - already exists for date:", entryDate);
      alert(
        `⚠️ ไม่สามารถเพิ่มได้!\n\nมีรายการในวันที่ ${entryDate} แล้วสำหรับ ${selectedCompany.name}:\n"${existingEntryForDate.title}"`
      );
      return false;
    }

    const newEntry: TimeEntry = {
      ...entry,
      id: Date.now().toString(),
      userId: user.id,
      companyId: selectedCompany.id,
    };

    setTimeEntries((prev) => [...prev, newEntry]);
    return true;
  };

  const updateTimeEntry = (id: string, updates: Partial<TimeEntry>) => {
    setTimeEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
    );
  };

  const deleteTimeEntry = (id: string) => {
    setTimeEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const updateProfile = (updates: Partial<User>): boolean => {
    if (!user) return false;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Update selected company if changed
    if (updates.selectedCompanyId && user.companies) {
      const company = user.companies.find(
        (c) => c.id === updates.selectedCompanyId
      );
      setSelectedCompany(company || null);
    }

    return true;
  };

  const selectCompany = (companyId: string) => {
    if (!user?.companies) return;

    const company = user.companies.find((c) => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      updateProfile({ selectedCompanyId: companyId });
    }
  };

  const addCompany = (company: Omit<Company, "id">): boolean => {
    if (!user) return false;

    const newCompany: Company = {
      ...company,
      id: Date.now().toString(),
    };

    const updatedCompanies = [...(user.companies || []), newCompany];
    updateProfile({ companies: updatedCompanies });
    return true;
  };

  const updateCompany = (
    companyId: string,
    updates: Partial<Company>
  ): boolean => {
    if (!user?.companies) return false;

    const updatedCompanies = user.companies.map((company) =>
      company.id === companyId ? { ...company, ...updates } : company
    );

    updateProfile({ companies: updatedCompanies });

    // Update selected company if it was the one being updated
    if (selectedCompany?.id === companyId) {
      setSelectedCompany({ ...selectedCompany, ...updates });
    }

    return true;
  };

  // Filter time entries สำหรับ user ปัจจุบันและบริษัทที่เลือก
  const userTimeEntries = timeEntries.filter(
    (entry) =>
      entry.userId === user?.id && entry.companyId === selectedCompany?.id
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        timeEntries: userTimeEntries,
        selectedCompany,
        login,
        register,
        logout,
        updateProfile,
        addTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        selectCompany,
        addCompany,
        updateCompany,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
