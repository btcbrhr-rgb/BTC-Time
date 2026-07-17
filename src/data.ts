import { Employee, Period, DailyAttendance } from './types';

export const GLOBAL_STATUS_CONFIG = {
  'W':  { label: 'ทำงานปกติ', icon: '💼', lucide: 'briefcase',      bgColor: 'bg-[#DCFCE7]', textColor: 'text-[#166534]', accentHex: '#166534', badgeClass: 'badge-work',    category: 'work' },
  'L':  { label: 'มาสาย',      icon: '⏱️', lucide: 'clock',         bgColor: 'bg-[#FEF3C7]', textColor: 'text-[#92400E]', accentHex: '#92400E', badgeClass: 'badge-late',    category: 'work' },
  'A':  { label: 'ขาดงาน',     icon: '❌', lucide: 'x-circle',       bgColor: 'bg-rose-50',   textColor: 'text-rose-500',  accentHex: '#f43f5e', badgeClass: 'badge-absent',  category: 'absent' },
  'B+': { label: 'ลากิจ (+)',  icon: '📋', lucide: 'clipboard-list', bgColor: 'bg-violet-50', textColor: 'text-violet-700', accentHex: '#7c3aed', badgeClass: 'badge-leave',   category: 'leave' },
  'B-': { label: 'ลากิจ (-)',  icon: '📋', lucide: 'clipboard-list', bgColor: 'bg-rose-50',   textColor: 'text-rose-500',  accentHex: '#f43f5e', badgeClass: 'badge-absent',  category: 'absent' },
  'H+': { label: 'ลาพักร้อน (+)', icon: '🏖️', lucide: 'palmtree',    bgColor: 'bg-sky-50',    textColor: 'text-sky-700',    accentHex: '#0284c7', badgeClass: 'badge-leave',   category: 'leave' },
  'H-': { label: 'ลาพักร้อน (-)', icon: '🏖️', lucide: 'palmtree',    bgColor: 'bg-rose-50',   textColor: 'text-rose-500',  accentHex: '#f43f5e', badgeClass: 'badge-absent',  category: 'absent' },
  'S+': { label: 'ลาป่วย (+)', icon: '🏥', lucide: 'thermometer',    bgColor: 'bg-[#F3E8FF]', textColor: 'text-[#6B21A8]', accentHex: '#6B21A8', badgeClass: 'badge-leave',   category: 'leave' },
  'S-': { label: 'ลาป่วย (-)', icon: '🏥', lucide: 'thermometer',    bgColor: 'bg-rose-50',   textColor: 'text-rose-500',  accentHex: '#f43f5e', badgeClass: 'badge-absent',  category: 'absent' },
  'SM+':{ label: 'ลาป่วย+ใบรับรอง', icon: '📄', lucide: 'file-text', bgColor: 'bg-[#F3E8FF]', textColor: 'text-[#6B21A8]', accentHex: '#6B21A8', badgeClass: 'badge-leave',   category: 'leave' },
  'A½': { label: 'ลาครึ่งเช้า', icon: '⛅', lucide: 'sun',           bgColor: 'bg-orange-50', textColor: 'text-orange-600', accentHex: '#ea580c', badgeClass: 'badge-leave',   category: 'leave' },
  'P½': { label: 'ลาครึ่งบ่าย', icon: '🌤️', lucide: 'cloud-sun',    bgColor: 'bg-blue-50',   textColor: 'text-blue-600',  accentHex: '#2563eb', badgeClass: 'badge-leave',   category: 'leave' },
  'พร': { label: 'เพิ่มแรง',    icon: '💪', lucide: 'zap',           bgColor: 'bg-[#DBEAFE]', textColor: 'text-[#1E40AF]', accentHex: '#1E40AF', badgeClass: 'badge-work',    category: 'special' },
  'คส': { label: 'สวัสดิการ',   icon: '🎁', lucide: 'gift',          bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', accentHex: '#4f46e5', badgeClass: 'badge-work',    category: 'special' },
  'ย':  { label: 'วันหยุดประจำสัปดาห์', icon: '⛱️', lucide: 'coffee', bgColor: 'bg-[#FFF1F2]', textColor: 'text-[#BE123C]', accentHex: '#BE123C', badgeClass: 'badge-rest',  category: 'off' },
  'นข': { label: 'วันหยุดนักขัตฤกษ์', icon: '🗓️', lucide: 'calendar', bgColor: 'bg-[#FEF9C3]', textColor: 'text-[#854D0E]', accentHex: '#854D0E', badgeClass: 'badge-rest',  category: 'off' },
  'MI': { label: 'ลืมลงเวลาเข้า (MI)', icon: '⚠️', lucide: 'alert-triangle', bgColor: 'bg-orange-50', textColor: 'text-orange-600', accentHex: '#ea580c', badgeClass: 'badge-late', category: 'absent' },
  'MO': { label: 'ลืมลงเวลาออก (MO)', icon: '⚠️', lucide: 'alert-triangle', bgColor: 'bg-orange-50', textColor: 'text-orange-600', accentHex: '#ea580c', badgeClass: 'badge-late', category: 'absent' },
};

export const RAW_MAP: Record<string, string> = {
  '1': 'W', 'W': 'W', '✓': 'W', 'ปกติ (W)': 'W', 'ปกติ': 'W',
  '3': 'L', 'L': 'L', 'สาย': 'L', 'สาย (L)': 'L',
  '0': 'A', 'A': 'A', 'ขาด': 'A', 'ขาดงาน': 'A',
  '2': 'B+', 'B': 'B+', 'B+': 'B+', 'กิจ': 'B+', 'ลากิจ': 'B+', 'ลา': 'B+',
  'B-': 'B-', 'ลากิจ (-)': 'B-', 'ลากิจไม่รับค่าจ้าง': 'B-', 'ลากิจ (ไม่รับค่าจ้าง)': 'B-', 'ลากิจเกินสิทธิ์': 'B-', 'ลากิจ (เกินสิทธิ์)': 'B-',
  'H': 'H+', 'H+': 'H+', 'ลาพักร้อน': 'H+',
  'H-': 'H-', 'ลาพักร้อน (-)': 'H-', 'ลาพักร้อนไม่รับค่าจ้าง': 'H-', 'ลาพักร้อน (ไม่รับค่าจ้าง)': 'H-', 'ลาพักร้อนเกินสิทธิ์': 'H-', 'ลาพักร้อน (เกินสิทธิ์)': 'H-',
  'S': 'S+', 'S+': 'S+', 'ลาป่วย': 'S+',
  'S-': 'S-', 'ลาป่วย (-)': 'S-', 'ลาป่วยไม่รับค่าจ้าง': 'S-', 'ลาป่วย (ไม่รับค่าจ้าง)': 'S-', 'ลป่วยเกินสิทธิ์': 'S-', 'ลาป่วย (เกินสิทธิ์)': 'S-',
  'SM': 'SM+', 'SM+': 'SM+', 'ลาป่วย+ใบรับรอง': 'SM+', 'ลาป่วย+ใบรับรองแพทย์': 'SM+',
  'ลาเกินสิทธิ์': 'A', 'ลาไม่รับค่าจ้าง': 'A',
  'A½': 'A½', 'A?': 'A½',
  'P½': 'P½', 'P?': 'P½',
  '5': 'พร', 'พร': 'พร', 'พร½': 'พร½',
  '6': 'คส', 'คส': 'คส',
  'ย': 'ย',
  'นข': 'นข',
  'MI': 'MI', 'ลืมเข้า': 'MI', 'ลงเวลาไม่สมบูรณ์': 'MI', 'ลืมบันทึกเข้า': 'MI',
  'MO': 'MO', 'ลืมออก': 'MO', 'ลืมบันทึกออก': 'MO'
};

export const GLOBAL_STATUS: Record<
  string,
  { label: string; icon: string; bgColor: string; textColor: string; border: string; lucide?: string; accentHex?: string; badgeClass?: string; category?: string }
> = {
  W: { ...GLOBAL_STATUS_CONFIG.W, border: 'border-emerald-200' },
  L: { ...GLOBAL_STATUS_CONFIG.L, border: 'border-amber-200' },
  A: { ...GLOBAL_STATUS_CONFIG.A, border: 'border-rose-200' },
  'B+': { ...GLOBAL_STATUS_CONFIG['B+'], border: 'border-violet-200' },
  'B-': { ...GLOBAL_STATUS_CONFIG['B-'], border: 'border-rose-200' },
  'H+': { ...GLOBAL_STATUS_CONFIG['H+'], border: 'border-sky-200' },
  'H-': { ...GLOBAL_STATUS_CONFIG['H-'], border: 'border-rose-200' },
  'S+': { ...GLOBAL_STATUS_CONFIG['S+'], border: 'border-purple-200' },
  'S-': { ...GLOBAL_STATUS_CONFIG['S-'], border: 'border-rose-200' },
  'SM+': { ...GLOBAL_STATUS_CONFIG['SM+'], border: 'border-purple-200' },
  'A½': { ...GLOBAL_STATUS_CONFIG['A½'], border: 'border-orange-200' },
  'P½': { ...GLOBAL_STATUS_CONFIG['P½'], border: 'border-blue-200' },
  'พร': { ...GLOBAL_STATUS_CONFIG['พร'], border: 'border-blue-200' },
  'คส': { ...GLOBAL_STATUS_CONFIG['คส'], border: 'border-indigo-200' },
  'ย': { ...GLOBAL_STATUS_CONFIG['ย'], border: 'border-rose-100' },
  'นข': { ...GLOBAL_STATUS_CONFIG['นข'], border: 'border-yellow-200' },
  'MI': { ...GLOBAL_STATUS_CONFIG['MI'], border: 'border-orange-200' },
  'MO': { ...GLOBAL_STATUS_CONFIG['MO'], border: 'border-orange-200' },
  // Compatibility keys for legacy records
  B: { ...GLOBAL_STATUS_CONFIG['B+'], border: 'border-violet-200' },
  H: { ...GLOBAL_STATUS_CONFIG['H+'], border: 'border-sky-200' },
  S: { ...GLOBAL_STATUS_CONFIG['S+'], border: 'border-purple-200' },
  SM: { ...GLOBAL_STATUS_CONFIG['SM+'], border: 'border-purple-200' },
  'ลืมเข้า': { ...GLOBAL_STATUS_CONFIG['MI'], border: 'border-orange-200' },
  'ลืมออก': { ...GLOBAL_STATUS_CONFIG['MO'], border: 'border-orange-200' },
};

export const PROJECT_BUDGETS: Record<string, number> = {
  'โครงการก่อสร้างสะพาน (01)': 500000,
  'โครงการอาคารเรียน (02)': 350000,
  'โครงการถนนหลวง (03)': 600000,
};

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'BTC-10001',
    name: 'สมจิต ใจงาม',
    role: 'ช่างก่อสร้าง',
    project: 'โครงการก่อสร้างสะพาน (01)',
    baseSalary: 15000,
    divisor: 30,
    workHoursPerDay: 8,
    quotas: { sick: 30, personal: 6, vacation: 10 },
    currentQuotas: { sick: 27, personal: 5, vacation: 8 },
  },
  {
    id: 'BTC-10002',
    name: 'สมชาย ดีเด่น',
    role: 'โฟร์แมน',
    project: 'โครงการอาคารเรียน (02)',
    baseSalary: 25000,
    divisor: 30,
    workHoursPerDay: 8,
    quotas: { sick: 30, personal: 6, vacation: 10 },
    currentQuotas: { sick: 29, personal: 6, vacation: 10 },
  },
  {
    id: 'BTC-10003',
    name: 'ดารณี ศรีสวย',
    role: 'วิศวกร',
    project: 'โครงการก่อสร้างสะพาน (01)',
    baseSalary: 35000,
    divisor: 30,
    workHoursPerDay: 8,
    quotas: { sick: 30, personal: 6, vacation: 10 },
    currentQuotas: { sick: 30, personal: 6, vacation: 10 },
  },
  {
    id: 'BTC-10004',
    name: 'วันชัย ชัยชนะ',
    role: 'คนงานทั่วไป',
    project: 'โครงการถนนหลวง (03)',
    baseSalary: 12000,
    divisor: 30,
    workHoursPerDay: 8,
    quotas: { sick: 30, personal: 6, vacation: 10 },
    currentQuotas: { sick: 28, personal: 4, vacation: 9 },
  },
  {
    id: 'BTC-10005',
    name: 'ธนพล มีทรัพย์',
    role: 'คนงานทั่วไป',
    project: 'โครงการถนนหลวง (03)',
    baseSalary: 12000,
    divisor: 30,
    workHoursPerDay: 8,
    quotas: { sick: 30, personal: 6, vacation: 10 },
    currentQuotas: { sick: 30, personal: 6, vacation: 10 },
  },
];

export const ACCOUNT_PERIODS: Period[] = Array.from({ length: 6 }, (_, i) => {
  const months = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ];
  // Start from June 2569 (2026 is 2569 in Buddhist Era, matching user's 2026-07-12)
  // Let's index backwards
  const baseMonthIndex = 5; // June
  const mIdx = (baseMonthIndex - i + 12) % 12;
  const year = 2569; // 2026 is 2569 BE
  const prevMonthIdx = (mIdx - 1 + 12) % 12;
  return {
    monthName: `${months[mIdx]} ${year}`,
    startDate: `26 ${months[prevMonthIdx].slice(0, 3)}. ${year - 2500}`,
    endDate: `25 ${months[mIdx].slice(0, 3)}. ${year - 2500}`,
    isCurrent: i === 0,
  };
});

// Helper to generate the exact array of date strings for June 2569 cycle: 2026-05-26 to 2026-06-25
export function getBillingCycleDates(periodName: string): string[] {
  const dates: string[] = [];
  // For June 2569: starts 2026-05-26, ends 2026-06-25
  let start = new Date(2026, 4, 26); // May 26
  let end = new Date(2026, 5, 25); // June 25

  if (periodName.includes('พฤษภาคม')) {
    start = new Date(2026, 3, 26); // April 26
    end = new Date(2026, 4, 25); // May 25
  } else if (periodName.includes('เมษายน')) {
    start = new Date(2026, 2, 26); // March 26
    end = new Date(2026, 3, 25); // April 25
  }

  const current = new Date(start);
  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// Recalculates logs using the robust formula
export function recalculateDailyPayroll(log: DailyAttendance, emp: Employee) {
  const dayOfWeek = new Date(log.date).getDay();
  const isHoliday = dayOfWeek === 0; // Sunday is weekend/holiday

  if (isHoliday && log.timeIn && log.timeIn !== '') {
    log.status = 'พร'; // Holiday work
  }

  // Auto lock identification
  if (
    log.status !== 'ย' &&
    log.status !== 'นข' &&
    log.status !== 'A' &&
    !log.status.includes('½') &&
    !['B', 'B+', 'B-', 'H', 'H+', 'H-', 'S', 'S+', 'S-', 'SM', 'SM+'].includes(log.status)
  ) {
    if (log.timeIn === '' && log.timeOut !== '') {
      log.status = 'MI';
    } else if (log.timeIn !== '' && log.timeOut === '') {
      log.status = 'MO';
    }
  }

  log.lateMinutes = 0;
  log.ot = 0;
  log.credit = 0;
  log.isLocked = false;

  if (log.status === 'MI' || log.status === 'MO' || log.status === 'ลืมเข้า' || log.status === 'ลืมออก') {
    log.isLocked = true;
    return;
  }

  // 1. Credit calculations
  if (['W', 'L', 'คส'].includes(log.status)) {
    log.credit = 1.0;
  } else if (['ย', 'นข'].includes(log.status)) {
    log.credit = 1.0; // Paid off days
  } else if (log.status === 'พร') {
    log.credit = 2.0; // Double wage rate
  } else if (['B', 'B+', 'H', 'H+', 'S', 'S+', 'SM', 'SM+'].includes(log.status)) {
    // Check quota
    let hasQuota = false;
    const normStatus = log.status === 'B' ? 'B+' : log.status === 'H' ? 'H+' : log.status === 'S' ? 'S+' : log.status === 'SM' ? 'SM+' : log.status;
    
    if (normStatus === 'B+' && emp.currentQuotas.personal > 0) {
      hasQuota = true;
    } else if (normStatus === 'H+' && emp.currentQuotas.vacation > 0) {
      hasQuota = true;
    } else if ((normStatus === 'S+' || normStatus === 'SM+') && emp.currentQuotas.sick > 0) {
      hasQuota = true;
    }

    if (hasQuota) {
      log.credit = 1.0;
      log.status = normStatus;
    } else {
      // Downscale to Unpaid leave version
      if (normStatus === 'B+') log.status = 'B-';
      else if (normStatus === 'H+') log.status = 'H-';
      else if (normStatus === 'S+' || normStatus === 'SM+') log.status = 'S-';
      else log.status = 'A';
      log.credit = 0.0;
    }
  } else if (['B-', 'H-', 'S-'].includes(log.status)) {
    log.credit = 0.0;
  } else if (['A½', 'P½'].includes(log.status)) {
    log.credit = 0.5;
  } else if (log.status === 'A') {
    log.credit = 0.0;
  }

  // 2. Late Minutes (Limit starting after lateCutoffTimeStr)
  if (log.timeIn && log.timeIn !== '') {
    const totalMins = parseTimeToMinutes(log.timeIn);
    const cutoff = parseTimeToMinutes(activeSystemSettings.lateCutoffTimeStr || '08:15');
    const startMins = parseTimeToMinutes(activeSystemSettings.workStartTimeStr || '08:00');
    if (totalMins > cutoff) {
      log.lateMinutes = totalMins - startMins; // total delay minutes starting from work start time
      if (log.status === 'W') {
        log.status = 'L'; // auto status transition
      }
    }
  }

  // 3. Overtime (After otStartTimeStr, round down based on otIntervalMinutes and otIntervalValue)
  if (log.timeOut && log.timeOut !== '') {
    const totalMins = parseTimeToMinutes(log.timeOut);
    const otStart = parseTimeToMinutes(activeSystemSettings.otStartTimeStr || '17:15');
    const endMins = parseTimeToMinutes(activeSystemSettings.workEndTimeStr || '17:00');
    if (totalMins >= otStart) {
      const otMins = totalMins - endMins;
      const intervalMins = Number(activeSystemSettings.otIntervalMinutes) || 30;
      const intervalVal = Number(activeSystemSettings.otIntervalValue) || 0.5;
      log.ot = Math.floor(otMins / intervalMins) * intervalVal;
    }
  }
}

// Generate the complete initial June 2569 cycle data
export function generateInitialAttendanceData(): Record<string, Record<string, DailyAttendance>> {
  const data: Record<string, Record<string, DailyAttendance>> = {};
  const dates = getBillingCycleDates('มิถุนายน 2569');

  dates.forEach((date, dateIdx) => {
    data[date] = {};
    INITIAL_EMPLOYEES.forEach((emp, empIdx) => {
      const isSunday = new Date(date).getDay() === 0;
      let status = isSunday ? 'ย' : 'W';

      // Seed mock events so they look organic
      if (!isSunday) {
        if ((dateIdx + empIdx) % 27 === 0) {
          status = 'MO'; // missed punch lock state
        } else if ((dateIdx + empIdx) % 19 === 0) {
          status = 'A'; // Absent
        } else if ((dateIdx + empIdx) % 22 === 0) {
          status = 'L'; // Late
        } else if ((dateIdx + empIdx) % 25 === 0) {
          status = 'S+'; // Sick
        }
      }

      let timeIn = '';
      let timeOut = '';

      if (['W', 'คส', 'พร', 'SM', 'SM+'].includes(status)) {
        timeIn = '08:00';
        timeOut = '17:00';
      } else if (status === 'L') {
        timeIn = '08:30';
        timeOut = '17:00';
      } else if (status === 'MI' || status === 'ลืมเข้า') {
        timeIn = '';
        timeOut = '17:00';
      } else if (status === 'MO' || status === 'ลืมออก') {
        timeIn = '08:00';
        timeOut = '';
      }

      const log: DailyAttendance = {
        empId: emp.id,
        date: date,
        status: status,
        timeIn: timeIn,
        timeOut: timeOut,
        ot: 0,
        penalty: 0,
        project: emp.project,
        food: ['W', 'L', 'คส', 'พร'].includes(status) ? (Number(activeSystemSettings.defaultFoodAllowance) || 50) : 0,
        trip: ['W', 'L', 'คส', 'พร'].includes(status) ? 50 : 0,
        other: 0,
        otherMemo: '',
        lateMinutes: 0,
        credit: 0,
        isLocked: false,
      };

      recalculateDailyPayroll(log, emp);
      data[date][emp.id] = log;
    });
  });

  return data;
}

export const SEED_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'โครงการสะพานเปิดทำงานล่วงเวลาพิเศษ (OT) ทุกวันศุกร์',
    time: '2 ชั่วโมงที่แล้ว',
    type: 'info',
    badge: 'INFO',
  },
  {
    id: 'ann-2',
    title: 'ประกาศปรับยอดค่าข้าวสนับสนุนอาหารกลางวันเพิ่มขึ้นเป็น 80 บาท/วัน',
    time: 'เมื่อวานนี้',
    type: 'success',
    badge: 'NEW',
  },
  {
    id: 'ann-3',
    title: 'กรุณาตรวจสอบสถิติวันสาย หากพบเวลาคลาดเคลื่อนให้ยื่นแก้ไขเวลาก่อนปิดงวด',
    time: '3 วันที่แล้ว',
    type: 'warning',
    badge: 'ALERT',
  },
];

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

export const DEFAULT_SYSTEM_SETTINGS: any = {
  dailyDivisor: 30,
  workHoursPerDay: 8,
  workStartTimeStr: '08:00',
  workEndTimeStr: '17:00',
  lateCutoffTimeStr: '08:15',
  otStartTimeStr: '17:15',
  defaultOtRate: 1.5,
  billingCycleStartDay: 26,
  billingCycleEndDay: 25,
  lunchStartTimeStr: '12:00',
  lunchEndTimeStr: '13:00',
  halfDayOutLunchMinStr: '12:00',
  halfDayOutLunchMaxStr: '13:30',
  halfDayInLunchMinStr: '11:30',
  halfDayInLunchMaxStr: '13:30',
  otIntervalMinutes: 30,
  otIntervalValue: 0.5,
  defaultCentralProject: '(00)บุรีรัมย์',
  defaultFoodAllowance: 50,
  latePenaltyPerMinute: 1.0,
  lateHalfDayThreshold: 240,
  ssoRate: 0.05,
  ssoMinSalary: 1650,
  ssoMaxSalary: 17500,
  includeOTinSSO: false,
  holidayOtRate: 2.0,
  holidayWorkRate: 1.0,
  annualLeaveDays: 10,
  sickLeaveDays: 30,
  personalLeaveDays: 3,
  maternityLeaveDays: 90,
  maternityLeavePaid: 45,
  militaryLeaveDays: 60,
  leaveAccrualRate: 0.0833,
  leaveCutoff: '25/12',
  symbolRules: JSON.stringify({
    'W': { fillIn: '08:00', fillOut: '17:00' },
    'L': { fillIn: '08:00', fillOut: '17:00' },
    'A': { clearIn: true, clearOut: true },
    'B': { clearIn: true, clearOut: true },
    'H': { clearIn: true, clearOut: true },
    'S': { clearIn: true, clearOut: true },
    'SM': { clearIn: true, clearOut: true },
    'A½': { fillIn: '13:00', fillOut: '17:00' },
    'P½': { fillIn: '08:00', fillOut: '12:00' },
    'พร': { fillIn: '08:00', fillOut: '17:00' },
    'คส': { fillIn: '08:00', fillOut: '17:00' }
  }, null, 2),
  roundSalary: 'none',
  roundDiligent: 'none',
  roundTax: 'none',
  roundPenalty: 'none',
  roundSSO: 'down',
  roundNetPay: 'down',
  roundProvidentFund: 'none',
  roundWelfare: 'none',
  lineChannelAccessToken: '',
};

export let activeSystemSettings = { ...DEFAULT_SYSTEM_SETTINGS };

export function setGlobalSystemSettings(settings: any) {
  activeSystemSettings = { ...DEFAULT_SYSTEM_SETTINGS, ...settings };
}

export function applyRounding(value: number, method: string): number {
  if (method === 'up') {
    return Math.ceil(value);
  }
  if (method === 'down') {
    return Math.floor(value);
  }
  if (method === 'half-up') {
    return Math.round(value);
  }
  if (method === 'nearest-baht') {
    return Math.round(value);
  }
  return value;
}

export function getEmployeeWages(emp: Employee, settings: any = activeSystemSettings) {
  const divisor = emp.divisor || Number(settings.dailyDivisor) || 30;
  const hours = emp.workHoursPerDay || Number(settings.workHoursPerDay) || 8;
  const dayWage = emp.baseSalary / divisor;
  const hrWage = dayWage / hours;
  return { dayWage, hrWage };
}
