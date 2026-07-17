export interface Employee {
  id: string;
  name: string;
  role: string;
  project: string;
  baseSalary: number;
  divisor: number;
  workHoursPerDay: number;
  quotas: {
    sick: number;
    personal: number;
    vacation: number;
  };
  currentQuotas: {
    sick: number;
    personal: number;
    vacation: number;
  };
  status?: 'active' | 'inactive'; // สถานะ
  weeklyOffDay?: string; // วันหยุดประจําสัปดาห์
  companyName?: string; // ชื่อบริษัท
  startDate?: string; // วันที่เริ่มงาน
  phone?: string; // เบอร์โทรศัพท์
  address?: string; // ที่อยู่
  idCard?: string; // เลขบัตรประชาชน
  birthDate?: string; // วันเดือนปีเกิด
  bankName?: string; // ธนาคาร
  bankBranch?: string; // สาขาธนาคาร
  bankAccount?: string; // หมายเลขบัญชี
  profileImage?: string; // ลิ้งภาพโปรไฟล์
  otMultiplier?: number; // ตัวคูณโอที
  permission?: 'admin' | 'employee' | 'staff'; // สิทธิ์การใช้งาน
  lineUserId?: string; // LineUserId
}

export interface DailyAttendance {
  empId: string;
  date: string; // YYYY-MM-DD
  status: string; // W, L, คส, ย, นข, พร, B+, B-, H+, H-, S+, S-, SM+, A½, P½, MI, MO, A
  timeIn: string; // HH:MM or empty
  timeOut: string; // HH:MM or empty
  ot: number; // hours
  penalty: number;
  project: string;
  food: number;
  trip: number;
  other: number;
  otherMemo: string;
  lateMinutes: number;
  credit: number;
  isLocked: boolean;
}

export interface LeaveRequest {
  id: string;
  empId: string;
  type: string; // S, SM, B, H, P½, A½
  start: string;
  end: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface CorrectionRequest {
  id: string;
  btnId: string;
  empId: string;
  timeIn: string;
  timeOut: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface Payslip {
  id: string;
  empId: string;
  period: string;
  amount: number;
  filename: string;
  createdAt: string;
}

export interface Period {
  monthName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface CashRequest {
  id: string;
  empId: string;
  amount: number;
  type: 'ONCE' | 'RECURRING';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  badge: string;
}
