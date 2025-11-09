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
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<boolean>;
  addTimeEntry: (
    entry: Omit<TimeEntry, "id" | "userId" | "companyId">
  ) => Promise<boolean>;
  updateTimeEntry: (id: string, entry: Partial<TimeEntry>) => Promise<void>;
  deleteTimeEntry: (id: string) => Promise<void>;
  selectCompany: (companyId: string) => void;
  addCompany: (company: Omit<Company, "id">) => Promise<boolean>;
  updateCompany: (
    companyId: string,
    updates: Partial<Company>
  ) => Promise<boolean>;
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

  // โหลดข้อมูล user และ time entries จาก API และ localStorage
  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);

          // Set selected company from saved user data
          if (userData.companies && userData.selectedCompanyId) {
            const company = userData.companies.find(
              (c: Company) => c.id === userData.selectedCompanyId
            );
            setSelectedCompany(company || null);
          }

          // โหลด time entries จาก API
          await loadTimeEntries(userData.id);
        } catch (error) {
          console.error("Error loading user data:", error);
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    loadUserData();
  }, []);

  // ฟังก์ชันโหลด time entries จาก API
  const loadTimeEntries = async (userId: string) => {
    try {
      const response = await fetch(`/api/time-entries?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTimeEntries(data.timeEntries || []);
      }
    } catch (error) {
      console.error("Error loading time entries:", error);
    }
  };

  // บันทึก user ลง localStorage เมื่อมีการเปลี่ยนแปลง (Profile + Companies)
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

        // Set selected company
        if (data.user.companies && data.user.selectedCompanyId) {
          const company = data.user.companies.find(
            (c: Company) => c.id === data.user.selectedCompanyId
          );
          setSelectedCompany(company || null);
        }

        // โหลด time entries
        await loadTimeEntries(data.user.id);

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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

        // For new users, no company is selected initially
        setSelectedCompany(null);

        return true;
      }

      return false;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setTimeEntries([]);
    setSelectedCompany(null);
    // ลบข้อมูลจาก localStorage
    localStorage.removeItem("user");
  };

  const addTimeEntry = async (
    entry: Omit<TimeEntry, "id" | "userId" | "companyId">
  ): Promise<boolean> => {
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
      alert(
        `⚠️ ไม่สามารถเพิ่มได้!\n\nมีรายการในวันที่ ${entryDate} แล้วสำหรับ ${selectedCompany.name}:\n"${existingEntryForDate.title}"`
      );
      return false;
    }

    try {
      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...entry,
          userId: user.id,
          companyId: selectedCompany.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTimeEntries((prev) => [...prev, data.timeEntry]);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Add time entry error:", error);
      return false;
    }
  };

  const updateTimeEntry = async (id: string, updates: Partial<TimeEntry>) => {
    try {
      const response = await fetch("/api/time-entries", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (response.ok) {
        const data = await response.json();
        setTimeEntries((prev) =>
          prev.map((entry) => (entry.id === id ? data.timeEntry : entry))
        );
      }
    } catch (error) {
      console.error("Update time entry error:", error);
    }
  };
  const deleteTimeEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/time-entries?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTimeEntries((prev) => prev.filter((entry) => entry.id !== id));
      }
    } catch (error) {
      console.error("Delete time entry error:", error);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: user.id, ...updates }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

        // Update selected company if changed
        if (updates.selectedCompanyId && data.user.companies) {
          const company = data.user.companies.find(
            (c: Company) => c.id === updates.selectedCompanyId
          );
          setSelectedCompany(company || null);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Update profile error:", error);
      return false;
    }
  };

  const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (response.ok) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("Change password error:", error);
      return false;
    }
  };

  const selectCompany = (companyId: string) => {
    if (!user?.companies) return;

    const company = user.companies.find((c) => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      updateProfile({ selectedCompanyId: companyId });
    }
  };

  const addCompany = async (company: Omit<Company, "id">): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...company, userId: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = {
          ...user,
          companies: [...(user.companies || []), data.company],
        };
        setUser(updatedUser);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Add company error:", error);
      return false;
    }
  };

  const updateCompany = async (
    companyId: string,
    updates: Partial<Company>
  ): Promise<boolean> => {
    if (!user?.companies) return false;

    try {
      const response = await fetch("/api/companies", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: companyId, userId: user.id, ...updates }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update user's companies list
        const updatedCompanies = user.companies.map((company) =>
          company.id === companyId ? data.company : company
        );

        const updatedUser = { ...user, companies: updatedCompanies };
        setUser(updatedUser);

        // Update selected company if it was the one being updated
        if (selectedCompany?.id === companyId) {
          setSelectedCompany(data.company);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Update company error:", error);
      return false;
    }
  };

  // ส่งข้อมูล timeEntries ทั้งหมด และให้ component เป็นคนจัดการ filter
  return (
    <AuthContext.Provider
      value={{
        user,
        timeEntries,
        selectedCompany,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
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
