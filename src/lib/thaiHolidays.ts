export interface ThaiHoliday {
  date: string; // YYYY-MM-DD format
  name: string;
  nameEn: string;
  type: "public" | "royal" | "religious" | "special";
}

// Thai Public Holidays for 2025
export const thaiHolidays2025: ThaiHoliday[] = [
  {
    date: "2025-01-01",
    name: "วันขึ้นปีใหม่",
    nameEn: "New Year's Day",
    type: "public",
  },
  {
    date: "2025-02-12",
    name: "วันตรุษจีน",
    nameEn: "Chinese New Year",
    type: "special",
  },
  {
    date: "2025-02-26",
    name: "วันมาฆบูชา",
    nameEn: "Makha Bucha Day",
    type: "religious",
  },
  {
    date: "2025-04-06",
    name: "วันจักรี",
    nameEn: "Chakri Day",
    type: "royal",
  },
  {
    date: "2025-04-13",
    name: "วันสงกรานต์",
    nameEn: "Songkran Festival",
    type: "public",
  },
  {
    date: "2025-04-14",
    name: "วันสงกรานต์",
    nameEn: "Songkran Festival",
    type: "public",
  },
  {
    date: "2025-04-15",
    name: "วันสงกรานต์",
    nameEn: "Songkran Festival",
    type: "public",
  },
  {
    date: "2025-05-01",
    name: "วันแรงงานแห่งชาติ",
    nameEn: "National Labour Day",
    type: "public",
  },
  {
    date: "2025-05-05",
    name: "วันฉัตรมงคล",
    nameEn: "Coronation Day",
    type: "royal",
  },
  {
    date: "2025-05-11",
    name: "วันวิสาขบูชา",
    nameEn: "Visakha Bucha Day",
    type: "religious",
  },
  {
    date: "2025-06-03",
    name: "วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสุทิดา",
    nameEn: "Queen Suthida's Birthday",
    type: "royal",
  },
  {
    date: "2025-07-08",
    name: "วันอาสาฬหบูชา",
    nameEn: "Asanha Bucha Day",
    type: "religious",
  },
  {
    date: "2025-07-09",
    name: "วันเข้าพรรษา",
    nameEn: "Buddhist Lent Day",
    type: "religious",
  },
  {
    date: "2025-07-28",
    name: "วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว",
    nameEn: "King's Birthday",
    type: "royal",
  },
  {
    date: "2025-08-12",
    name: "วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสิริกิติ์",
    nameEn: "Queen Mother's Birthday",
    type: "royal",
  },
  {
    date: "2025-10-13",
    name: "วันคล้ายวันสวรรคตพระบาทสมเด็จพระบรมชนกาธิเบศร",
    nameEn: "King Bhumibol Memorial Day",
    type: "royal",
  },
  {
    date: "2025-10-23",
    name: "วันปิยมหาราช",
    nameEn: "Chulalongkorn Day",
    type: "royal",
  },
  {
    date: "2025-12-05",
    name: "วันคล้ายวันพระราชสมภพพระบาทสมเด็จพระบรมชนกาธิเบศร",
    nameEn: "King Bhumibol's Birthday",
    type: "royal",
  },
  {
    date: "2025-12-10",
    name: "วันรัฐธรรมนูญ",
    nameEn: "Constitution Day",
    type: "public",
  },
  {
    date: "2025-12-31",
    name: "วันสิ้นปี",
    nameEn: "New Year's Eve",
    type: "public",
  },
];

// Get Thai holidays for a specific year
export function getThaiHolidays(year: number): ThaiHoliday[] {
  if (year === 2025) {
    return thaiHolidays2025;
  }

  // For other years, return basic holidays (can be extended)
  return [
    {
      date: `${year}-01-01`,
      name: "วันขึ้นปีใหม่",
      nameEn: "New Year's Day",
      type: "public",
    },
    {
      date: `${year}-05-01`,
      name: "วันแรงงานแห่งชาติ",
      nameEn: "National Labour Day",
      type: "public",
    },
    {
      date: `${year}-12-05`,
      name: "วันคล้ายวันพระราชสมภพพระบาทสมเด็จพระบรมชนกาธิเบศร",
      nameEn: "King Bhumibol's Birthday",
      type: "royal",
    },
    {
      date: `${year}-12-10`,
      name: "วันรัฐธรรมนูญ",
      nameEn: "Constitution Day",
      type: "public",
    },
    {
      date: `${year}-12-31`,
      name: "วันสิ้นปี",
      nameEn: "New Year's Eve",
      type: "public",
    },
  ];
}

// Get holiday color based on type
export function getHolidayColor(type: string): string {
  switch (type) {
    case "royal":
      return "#fbbf24"; // amber
    case "religious":
      return "#a78bfa"; // violet
    case "public":
      return "#f87171"; // red
    case "special":
      return "#34d399"; // emerald
    default:
      return "#f87171";
  }
}

// Check if a date is a Thai holiday
export function isThaiHoliday(date: Date): ThaiHoliday | null {
  const dateString = date.toISOString().split("T")[0];
  const year = date.getFullYear();
  const holidays = getThaiHolidays(year);

  return holidays.find((holiday) => holiday.date === dateString) || null;
}
