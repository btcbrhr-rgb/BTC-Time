import React, { useState, useEffect } from 'react';
import {
  INITIAL_EMPLOYEES,
  GLOBAL_STATUS,
  ACCOUNT_PERIODS,
  generateInitialAttendanceData,
  getBillingCycleDates,
  recalculateDailyPayroll,
  SEED_ANNOUNCEMENTS,
  DEFAULT_SYSTEM_SETTINGS,
  setGlobalSystemSettings,
} from './data';
import { Employee, DailyAttendance, LeaveRequest, CorrectionRequest, Payslip, Period, Announcement, CashRequest } from './types';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import EmployeeHome from './components/EmployeeHome';
import EmployeeClock from './components/EmployeeClock';
import EmployeeHistory from './components/EmployeeHistory';
import EmployeeLeave from './components/EmployeeLeave';
import AdminDashboard from './components/AdminDashboard';
import AdminCosting from './components/AdminCosting';
import AdminAttendance from './components/AdminAttendance';
import AdminImport from './components/AdminImport';
import AdminManagement from './components/AdminManagement';
import ProfileView from './components/ProfileView';
import PrintInvoice from './components/PrintInvoice';
import AdminSettings from './components/AdminSettings';
import { ShieldAlert, Award, Compass, HeartHandshake, Smile } from 'lucide-react';
import { parseTimesheetText } from './components/parser';

export default function App() {
  // Authentication & session state
  const [userRole, setUserRole] = useState<'admin' | 'employee' | null>(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('home');

  // Master Data State
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendanceData, setAttendanceData] = useState<Record<string, Record<string, DailyAttendance>>>(() =>
    generateInitialAttendanceData()
  );
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [importedSlips, setImportedSlips] = useState<Payslip[]>([]);

  // Advanced Admin Tools State
  const [announcements, setAnnouncements] = useState<Announcement[]>(SEED_ANNOUNCEMENTS);
  const [cashRequests, setCashRequests] = useState<CashRequest[]>([
    {
      id: 'cash-1',
      empId: 'EMP101',
      amount: 3000,
      type: 'ONCE',
      status: 'pending',
      submittedAt: '13/07/2026 09:12'
    },
    {
      id: 'cash-2',
      empId: 'EMP102',
      amount: 1500,
      type: 'RECURRING',
      status: 'approved',
      submittedAt: '12/07/2026 14:30'
    }
  ]);

  // Period / Cycle State
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);

  // Advance settings
  const [isRecurringEnabled, setIsRecurringEnabled] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState(0);

  // System Settings State
  const [systemSettings, setSystemSettings] = useState<any>(() => {
    return { ...DEFAULT_SYSTEM_SETTINGS };
  });

  // Toast / Status banner state
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info');

  // Printing state
  const [printProject, setPrintProject] = useState<string | null>(null);

  // Active dates in selected cycle
  const currentPeriod = ACCOUNT_PERIODS[selectedPeriodIndex] || ACCOUNT_PERIODS[0];
  const dates = getBillingCycleDates(currentPeriod.monthName);
  const projects = Array.from(new Set(employees.map((e) => e.project))) as string[];

  // Date selection for foreman costing daily updates
  const [selectedDateStr, setSelectedDateStr] = useState('2026-06-01');
  const [activeProject, setActiveProject] = useState('all');

  // Active clock info for logged-in employee
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockedInTime, setClockedInTime] = useState<string | null>(null);

  // Toast trigger helper
  const showToast = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMsg('');
    }, 4000);
  };

  // Load state from local storage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('btc_user_role');
    const savedUsername = localStorage.getItem('btc_user_username');

    if (savedRole && savedUsername) {
      setUserRole(savedRole as 'admin' | 'employee');
      setUsername(savedUsername);
      if (savedRole === 'admin') {
        setDisplayName('ฝ่ายปฏิบัติการและต้นทุน (Admin)');
        setActiveTab('dashboard');
      } else {
        const emp = employees.find((e) => e.id === savedUsername);
        setDisplayName(emp ? emp.name : 'พนักงานสนาม');
        setActiveTab('home');
      }
    }

    const savedState = localStorage.getItem('btc_full_ledger_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.leaves) setLeaves(parsed.leaves);
        if (parsed.corrections) setCorrections(parsed.corrections);
        if (parsed.importedSlips) setImportedSlips(parsed.importedSlips);
        if (parsed.isRecurringEnabled) setIsRecurringEnabled(parsed.isRecurringEnabled);
        if (parsed.advanceAmount) setAdvanceAmount(parsed.advanceAmount);
        if (parsed.employees) setEmployees(parsed.employees);
        if (parsed.attendanceData) setAttendanceData(parsed.attendanceData);
        if (parsed.isClockedIn) setIsClockedIn(parsed.isClockedIn);
        if (parsed.clockedInTime) setClockedInTime(parsed.clockedInTime);
        if (parsed.announcements) setAnnouncements(parsed.announcements);
        if (parsed.cashRequests) setCashRequests(parsed.cashRequests);
        if (parsed.systemSettings) {
          setSystemSettings(parsed.systemSettings);
          setGlobalSystemSettings(parsed.systemSettings);
        } else {
          setGlobalSystemSettings(DEFAULT_SYSTEM_SETTINGS);
        }
      } catch (e) {
        console.error('Error loading persistent portal state', e);
      }
    }
  }, []);

  // Save state helper
  const saveMasterState = (updated?: {
    leaves?: LeaveRequest[];
    corrections?: CorrectionRequest[];
    importedSlips?: Payslip[];
    isRecurringEnabled?: boolean;
    advanceAmount?: number;
    employees?: Employee[];
    attendanceData?: Record<string, Record<string, DailyAttendance>>;
    isClockedIn?: boolean;
    clockedInTime?: string | null;
    announcements?: Announcement[];
    cashRequests?: CashRequest[];
    systemSettings?: any;
  }) => {
    const stateToSave = {
      leaves: updated?.leaves ?? leaves,
      corrections: updated?.corrections ?? corrections,
      importedSlips: updated?.importedSlips ?? importedSlips,
      isRecurringEnabled: updated?.isRecurringEnabled ?? isRecurringEnabled,
      advanceAmount: updated?.advanceAmount ?? advanceAmount,
      employees: updated?.employees ?? employees,
      attendanceData: updated?.attendanceData ?? attendanceData,
      isClockedIn: updated?.isClockedIn ?? isClockedIn,
      clockedInTime: updated?.clockedInTime ?? clockedInTime,
      announcements: updated?.announcements ?? announcements,
      cashRequests: updated?.cashRequests ?? cashRequests,
      systemSettings: updated?.systemSettings ?? systemSettings,
    };
    localStorage.setItem('btc_full_ledger_state', JSON.stringify(stateToSave));
  };

  const handleLogin = (role: 'admin' | 'employee', user: string) => {
    localStorage.setItem('btc_user_role', role);
    localStorage.setItem('btc_user_username', user);
    setUserRole(role);
    setUsername(user);

    if (role === 'admin') {
      setDisplayName('ฝ่ายปฏิบัติการและต้นทุน (Admin)');
      setActiveTab('dashboard');
      showToast('เข้าสู่ระบบสิทธิ์ผู้จัดแจงเวลางาน (Admin)', 'success');
    } else {
      const emp = employees.find((e) => e.id === user);
      setDisplayName(emp ? emp.name : 'พนักงานสนาม');
      setActiveTab('home');
      showToast(`ยินดีต้อนรับ คุณ${emp ? emp.name : 'พนักงาน'}`, 'success');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('btc_user_role');
    localStorage.removeItem('btc_user_username');
    setUserRole(null);
    setUsername('');
    setDisplayName('');
    showToast('ออกจากระบบอย่างปลอดภัยแล้ว', 'info');
  };

  // Clock Actions
  const handleClock = (type: 'IN' | 'OUT') => {
    const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const todayStr = new Date().toISOString().split('T')[0];

    let updatedIn = isClockedIn;
    let updatedTime = clockedInTime;

    if (type === 'IN') {
      updatedIn = true;
      updatedTime = nowStr;
      setIsClockedIn(true);
      setClockedInTime(nowStr);
      showToast(`ลงบันทึกเวลาเข้างานสำเร็จ (${nowStr})`, 'success');
    } else {
      updatedIn = false;
      updatedTime = null;
      setIsClockedIn(false);
      setClockedInTime(null);
      showToast(`ลงบันทึกเวลาออกงานสำเร็จ (${nowStr})`, 'success');
    }

    // Dynamic insertion of active attendance log in current cycle
    const currentEmp = employees.find((e) => e.id === username);
    if (currentEmp) {
      const copyData = { ...attendanceData };
      if (!copyData[todayStr]) {
        copyData[todayStr] = {};
      }
      const existingLog = copyData[todayStr][username] || {
        empId: username,
        date: todayStr,
        status: 'W',
        timeIn: '',
        timeOut: '',
        ot: 0,
        penalty: 0,
        project: currentEmp.project,
        food: 80,
        trip: 50,
        other: 0,
        otherMemo: '',
        lateMinutes: 0,
        credit: 0,
        isLocked: false,
      };

      if (type === 'IN') {
        existingLog.timeIn = nowStr;
      } else {
        existingLog.timeOut = nowStr;
      }

      recalculateDailyPayroll(existingLog, currentEmp);
      copyData[todayStr][username] = existingLog;
      setAttendanceData(copyData);

      saveMasterState({
        isClockedIn: updatedIn,
        clockedInTime: updatedTime,
        attendanceData: copyData,
      });
    } else {
      saveMasterState({
        isClockedIn: updatedIn,
        clockedInTime: updatedTime,
      });
    }
  };

  // Advance toggles / petty cash requests
  const handleToggleRecurringAdvance = (enabled: boolean, amount: number) => {
    setIsRecurringEnabled(enabled);
    setAdvanceAmount(amount);

    const newRequest: CashRequest = {
      id: 'cash-' + Date.now(),
      empId: username || 'EMP101',
      amount: amount,
      type: enabled ? 'RECURRING' : 'ONCE',
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedRequests = [newRequest, ...cashRequests];
    setCashRequests(updatedRequests);

    saveMasterState({
      isRecurringEnabled: enabled,
      advanceAmount: amount,
      cashRequests: updatedRequests,
    });

    showToast(
      `ส่งคำขอเบิกเงินสำรองจำนวน ฿${amount.toLocaleString()} เรียบร้อยแล้ว (รอการอนุมัติจากแอดมิน)`,
      'success'
    );
  };

  // Admin Management Handlers
  const handleAddEmployee = (emp: Employee) => {
    const updated = [...employees, emp];
    setEmployees(updated);
    saveMasterState({ employees: updated });
    showToast(`ขึ้นทะเบียนพนักงานใหม่: คุณ${emp.name} เรียบร้อย`, 'success');
  };

  const handleUpdateEmployee = (emp: Employee) => {
    const updated = employees.map((e) => (e.id === emp.id ? emp : e));
    setEmployees(updated);
    saveMasterState({ employees: updated });
    showToast(`อัปเดตข้อมูล คุณ${emp.name} เรียบร้อย`, 'success');
  };

  const handleDeleteEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    const updated = employees.filter((e) => e.id !== id);
    setEmployees(updated);
    saveMasterState({ employees: updated });
    showToast(`ลบรายชื่อ คุณ${emp ? emp.name : id} ออกจากระบบเรียบร้อย`, 'info');
  };

  const handleApproveCashRequest = (id: string, status: 'approved' | 'rejected') => {
    const updated = cashRequests.map((req) => (req.id === id ? { ...req, status } : req));
    setCashRequests(updated);
    saveMasterState({ cashRequests: updated });
    showToast(status === 'approved' ? 'อนุมัติการเบิกเงินสำรองสำเร็จ' : 'ปฏิเสธคำขอเบิกเงินเรียบร้อย', 'info');
  };

  const handleAddAnnouncement = (ann: Announcement) => {
    const updated = [ann, ...announcements];
    setAnnouncements(updated);
    saveMasterState({ announcements: updated });
    showToast('เผยแพร่ประกาศข่าวสารใหม่เรียบร้อย', 'success');
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcements.filter((ann) => ann.id !== id);
    setAnnouncements(updated);
    saveMasterState({ announcements: updated });
    showToast('ลบรายการประกาศเรียบร้อย', 'info');
  };

  // Leaves Submission
  const handleSubmitLeave = (
    type: string,
    start: string,
    end: string,
    reason: string,
    fileAttached: boolean
  ) => {
    const newLeave: LeaveRequest = {
      id: 'leave-' + Date.now(),
      empId: username,
      type,
      start,
      end,
      reason,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH'),
    };
    const updated = [newLeave, ...leaves];
    setLeaves(updated);
    saveMasterState({ leaves: updated });
    showToast('ยื่นขอสิทธิ์ลาสำเร็จ อยู่ระหว่างเสนอหัวหน้าอนุมัติ', 'success');
  };

  // Corrections Submission
  const handleSubmitCorrection = (btnId: string, timeIn: string, timeOut: string, reason: string) => {
    const newCorr: CorrectionRequest = {
      id: 'corr-' + Date.now(),
      btnId,
      empId: username,
      timeIn,
      timeOut,
      reason,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH'),
    };
    const updated = [newCorr, ...corrections];
    setCorrections(updated);
    saveMasterState({ corrections: updated });
    showToast('ส่งคำร้องขอปรับเปลี่ยนบันทึกเวลาแล้ว', 'success');
  };

  // Admin approval of Leaves
  const handleApproveLeave = (id: string, decision: 'approved' | 'rejected') => {
    const updated = leaves.map((l) => {
      if (l.id === id) {
        l.status = decision;
        // If approved, dynamically update master employee quotas and daily cost status
        if (decision === 'approved') {
          const emp = employees.find((e) => e.id === l.empId);
          if (emp) {
            const code = l.type;
            if (code === 'S' && emp.currentQuotas.sick > 0) emp.currentQuotas.sick--;
            else if (code === 'B' && emp.currentQuotas.personal > 0) emp.currentQuotas.personal--;
            else if (code === 'H' && emp.currentQuotas.vacation > 0) emp.currentQuotas.vacation--;

            // Update daily log status
            const copyData = { ...attendanceData };
            const leaveDate = l.start; // assume first day for simplicity
            if (copyData[leaveDate]?.[l.empId]) {
              const log = copyData[leaveDate][l.empId];
              log.status = code;
              log.timeIn = '';
              log.timeOut = '';
              recalculateDailyPayroll(log, emp);
            }
            setAttendanceData(copyData);
          }
        }
      }
      return l;
    });
    setLeaves(updated);
    saveMasterState({ leaves: updated, employees: [...employees], attendanceData });
    showToast(decision === 'approved' ? 'อนุมัติใบลาพนักงานสำเร็จ' : 'ปฏิเสธคำขอลาหยุดเรียบร้อย', 'info');
  };

  // Admin approval of Time Corrections
  const handleApproveCorrection = (id: string, decision: 'approved' | 'rejected') => {
    const updated = corrections.map((c) => {
      if (c.id === id) {
        c.status = decision;
        if (decision === 'approved') {
          // If approved, override state to W/L and recalculate daily parameters
          const copyData = { ...attendanceData };
          const parts = c.btnId.split('-'); // btn-fix-YYYY-MM-DD
          const targetDate = parts.slice(2).join('-'); // extract YYYY-MM-DD
          const log = copyData[targetDate]?.[c.empId];
          const emp = employees.find((e) => e.id === c.empId);

          if (log && emp) {
            log.timeIn = c.timeIn;
            log.timeOut = c.timeOut;
            log.status = 'W'; // overridden as normal work
            log.isLocked = false;
            recalculateDailyPayroll(log, emp);
          }
          setAttendanceData(copyData);
        }
      }
      return c;
    });
    setCorrections(updated);
    saveMasterState({ corrections: updated, attendanceData });
    showToast(
      decision === 'approved' ? 'อนุมัติและปรับเปลี่ยนเวลาปฏิบัติงานพร้อมปลดล็อกแล้ว' : 'ปฏิเสธคำขอแก้เวลาแล้ว',
      'info'
    );
  };

  const handleSaveSettings = (newSettings: any) => {
    setSystemSettings(newSettings);
    setGlobalSystemSettings(newSettings);
    saveMasterState({ systemSettings: newSettings });
    showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว', 'success');
  };

  // Foreman/admin manual log status override
  const handleUpdateLogStatus = (
    empId: string,
    status: string,
    timeIn: string,
    timeOut: string,
    project: string,
    dateStr?: string
  ) => {
    const targetDate = dateStr || selectedDateStr;
    const copyData = { ...attendanceData };
    if (!copyData[targetDate]) {
      copyData[targetDate] = {};
    }
    const emp = employees.find((e) => e.id === empId);
    let log = copyData[targetDate][empId];

    if (!log && emp) {
      log = {
        empId,
        date: targetDate,
        status,
        timeIn,
        timeOut,
        ot: 0,
        penalty: 0,
        project: project || emp.project,
        food: ['W', 'L', 'คส', 'พร'].includes(status) ? 80 : 0,
        trip: ['W', 'L', 'คส', 'พร'].includes(status) ? 50 : 0,
        other: 0,
        otherMemo: '',
        lateMinutes: 0,
        credit: 0,
        isLocked: false,
      };
    } else if (log) {
      log.status = status;
      log.timeIn = timeIn;
      log.timeOut = timeOut;
      log.project = project;
    }

    if (log && emp) {
      recalculateDailyPayroll(log, emp);
      copyData[targetDate][empId] = log;
      setAttendanceData(copyData);
      saveMasterState({ attendanceData: copyData });
      showToast('ปรับปรุงสถิติเวลางานสนามสำเร็จ', 'success');
    }
  };

  // Unified day-by-day attendance & allowance updater
  const handleUpdateDayAttendance = (
    empId: string,
    dateStr: string,
    updates: {
      status: string;
      timeIn: string;
      timeOut: string;
      project: string;
      food: number;
      trip: number;
      other: number;
      otherMemo: string;
    }
  ) => {
    const copyData = { ...attendanceData };
    if (!copyData[dateStr]) {
      copyData[dateStr] = {};
    }
    const emp = employees.find((e) => e.id === empId);
    let log = copyData[dateStr][empId];

    if (!log && emp) {
      log = {
        empId,
        date: dateStr,
        status: updates.status,
        timeIn: updates.timeIn,
        timeOut: updates.timeOut,
        ot: 0,
        penalty: 0,
        project: updates.project || emp.project,
        food: updates.food,
        trip: updates.trip,
        other: updates.other,
        otherMemo: updates.otherMemo,
        lateMinutes: 0,
        credit: 0,
        isLocked: false,
      };
    } else if (log) {
      log.status = updates.status;
      log.timeIn = updates.timeIn;
      log.timeOut = updates.timeOut;
      log.project = updates.project;
      log.food = updates.food;
      log.trip = updates.trip;
      log.other = updates.other;
      log.otherMemo = updates.otherMemo;
    }

    if (log && emp) {
      recalculateDailyPayroll(log, emp);
      copyData[dateStr][empId] = log;
      setAttendanceData(copyData);
      saveMasterState({ attendanceData: copyData });
      showToast('ปรับปรุงสถิติวันปฏิบัติงานสำเร็จ', 'success');
    }
  };

  // Foreman manual allowance updates
  const handleUpdateAllowance = (
    empId: string,
    field: 'food' | 'trip' | 'other',
    val: number,
    memo?: string,
    dateStr?: string
  ) => {
    const targetDate = dateStr || selectedDateStr;
    const copyData = { ...attendanceData };
    if (!copyData[targetDate]) {
      copyData[targetDate] = {};
    }
    let log = copyData[targetDate][empId];
    const emp = employees.find((e) => e.id === empId);

    if (!log && emp) {
      log = {
        empId,
        date: targetDate,
        status: 'ย',
        timeIn: '',
        timeOut: '',
        ot: 0,
        penalty: 0,
        project: emp.project,
        food: 0,
        trip: 0,
        other: 0,
        otherMemo: '',
        lateMinutes: 0,
        credit: 0,
        isLocked: false,
      };
    }

    if (log && emp) {
      log[field] = val;
      if (memo !== undefined) {
        log.otherMemo = memo;
      }
      recalculateDailyPayroll(log, emp);
      copyData[targetDate][empId] = log;
      setAttendanceData(copyData);
      saveMasterState({ attendanceData: copyData });
    }
  };

  // Parser text timesheet import
  const handleImportTimesheet = (raw: string) => {
    const parsedRows = parseTimesheetText(raw);
    const copyData = { ...attendanceData };
    let newCount = 0;
    let updateCount = 0;

    parsedRows.forEach((row) => {
      const date = row.date;
      const status = row.status;
      const timeIn = row.timeIn;
      const timeOut = row.timeOut;

      if (!copyData[date]) {
        copyData[date] = {};
      }

      // Find the employee. Since scanner codes might match the suffix or exactly:
      const empRef = employees.find((e) => e.id === row.id || e.id.endsWith(row.id)) || employees[0];
      const actualEmpId = empRef.id; // use the master employee id in the portal

      const existingLog = copyData[date][actualEmpId];
      let log: DailyAttendance;

      if (existingLog) {
        // Prevent duplication: check and choose the best times
        // Earliest non-empty time for Check-In, latest non-empty time for Check-Out
        const finalTimeIn = (() => {
          if (!existingLog.timeIn) return timeIn;
          if (!timeIn) return existingLog.timeIn;
          return timeIn < existingLog.timeIn ? timeIn : existingLog.timeIn;
        })();

        const finalTimeOut = (() => {
          if (!existingLog.timeOut) return timeOut;
          if (!timeOut) return existingLog.timeOut;
          return timeOut > existingLog.timeOut ? timeOut : existingLog.timeOut;
        })();

        // Re-evaluate daily status based on combined times
        let finalStatus = 'W';
        if (finalTimeIn && finalTimeOut) {
          finalStatus = 'W';
        } else if (finalTimeIn) {
          finalStatus = 'MO';
        } else if (finalTimeOut) {
          finalStatus = 'MI';
        } else {
          finalStatus = existingLog.status || 'A';
        }

        log = {
          ...existingLog,
          status: finalStatus,
          timeIn: finalTimeIn,
          timeOut: finalTimeOut,
        };
        updateCount++;
      } else {
        log = {
          empId: actualEmpId,
          date,
          status,
          timeIn,
          timeOut,
          ot: 0,
          penalty: 0,
          project: empRef.project,
          food: ['W', 'L', 'คส', 'พร'].includes(status) ? 80 : 0,
          trip: ['W', 'L', 'คส', 'พร'].includes(status) ? 50 : 0,
          other: 0,
          otherMemo: '',
          lateMinutes: 0,
          credit: 0,
          isLocked: false,
        };
        newCount++;
      }

      recalculateDailyPayroll(log, empRef);
      copyData[date][actualEmpId] = log;
    });

    setAttendanceData(copyData);
    saveMasterState({ attendanceData: copyData });
    
    if (updateCount > 0) {
      showToast(`นำเข้าเสร็จสิ้น! เพิ่มข้อมูลใหม่ ${newCount} รายการ และตรวจพบสถิติซ้ำจึงอัปเดตข้อมูลเดิม ${updateCount} รายการเรียบร้อย`, 'success');
    } else {
      showToast(`นำเข้าสำเร็จ! ทำการประมวลผลเพิ่มขึ้น ${newCount} รายการเรียบร้อย`, 'success');
    }
  };

  // Payslip upload (single)
  const handleImportPayslip = (empId: string, period: string, amount: number, filename: string) => {
    // Delete existing payslip record first for the same employee and period to prevent "garbage/orphan files"
    const isDuplicate = importedSlips.some((s) => s.empId === empId && s.period === period);
    const filteredSlips = importedSlips.filter((s) => !(s.empId === empId && s.period === period));

    const newSlip: Payslip = {
      id: 'slip-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      empId,
      period,
      amount,
      filename,
      createdAt:
        new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [newSlip, ...filteredSlips];
    setImportedSlips(updated);
    saveMasterState({ importedSlips: updated });

    if (isDuplicate) {
      showToast(`ตรวจพบสลิปเดิมงวด ${period} ของพนักงาน ${empId} ทำการลบไฟล์สลิปเดิมออกจากระบบและอัปเดตไฟล์ใหม่ทดแทนสำเร็จ`, 'success');
    } else {
      showToast(`เชื่อมสลิป PDF เข้าพนักงาน ${empId} สำเร็จ`, 'success');
    }
  };

  // Payslip upload (bulk)
  const handleImportBulkPayslips = (slips: Array<{ empId: string; period: string; amount: number; filename: string }>) => {
    let duplicateCount = 0;
    let newCount = 0;
    let currentSlips = [...importedSlips];

    slips.forEach((p) => {
      const isDuplicate = currentSlips.some((s) => s.empId === p.empId && s.period === p.period);
      if (isDuplicate) {
        duplicateCount++;
        // Delete previous slip record
        currentSlips = currentSlips.filter((s) => !(s.empId === p.empId && s.period === p.period));
      } else {
        newCount++;
      }

      const newSlip: Payslip = {
        id: 'slip-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
        empId: p.empId,
        period: p.period,
        amount: p.amount,
        filename: p.filename,
        createdAt:
          new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };

      currentSlips.unshift(newSlip);
    });

    setImportedSlips(currentSlips);
    saveMasterState({ importedSlips: currentSlips });

    if (duplicateCount > 0) {
      showToast(`แยกหน้าสำเร็จ! เพิ่มสลิปใหม่ ${newCount} ฉบับ และลบไฟล์เดิมงวดเดียวกันทิ้งเพื่อเลี่ยงไฟล์ขยะแล้วอัปเดตใหม่ ${duplicateCount} ฉบับ`, 'success');
    } else {
      showToast(`ระบบวิเคราะห์แยกหน้าและนำเข้า PDF สำเร็จจำนวน ${newCount} รายการเรียบร้อย`, 'success');
    }
  };

  const handleDeletePayslip = (id: string) => {
    const updated = importedSlips.filter((s) => s.id !== id);
    setImportedSlips(updated);
    saveMasterState({ importedSlips: updated });
    showToast('ลบรายการเชื่อมสลิปออกเรียบร้อย', 'info');
  };

  // View slips simulation
  const handleViewSlip = (filename: string, amount: number) => {
    showToast(`เปิดดูไฟล์: ${filename} (ยอดเงินเดือนสุทธิ: ฿${amount.toLocaleString()})`, 'success');
  };

  // Printable layout trigger
  const handleTriggerPrint = (project: string) => {
    setPrintProject(project);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Return printable paper screen if active
  if (printProject) {
    return (
      <div className="bg-white min-h-screen">
        <div className="p-4 no-print text-center bg-slate-100 border-b border-slate-200">
          <button
            onClick={() => setPrintProject(null)}
            className="px-6 py-2 bg-red-650 hover:bg-red-750 bg-red-600 text-white rounded-xl font-bold text-xs"
          >
            ← ปิดหน้าต่างพิมพ์และกลับสู่ระบบหลังบ้าน
          </button>
        </div>
        <PrintInvoice
          project={printProject}
          billingMonthName={currentPeriod.monthName}
          employees={employees}
          attendanceData={attendanceData}
          dates={dates}
        />
      </div>
    );
  }

  // Login view
  if (!userRole) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const pendingLeavesCount = leaves.filter((l) => l.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-16">
      {/* Toast alert banner */}
      {toastMsg && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3.5 rounded-2xl shadow-xl text-xs font-black text-white ${
            toastType === 'success'
              ? 'bg-emerald-600 border border-emerald-500'
              : toastType === 'error'
              ? 'bg-red-600 border border-red-500'
              : 'bg-slate-900 border border-slate-800'
          }`}
        >
          {toastMsg}
        </div>
      )}

      {/* Main app header */}
      <Header
        displayName={displayName}
        empId={username}
        role={userRole === 'admin' ? 'แอดมิน' : employees.find((e) => e.id === username)?.role || ''}
        isClockedIn={isClockedIn}
        clockedInTime={clockedInTime}
        periods={ACCOUNT_PERIODS}
        selectedPeriodIndex={selectedPeriodIndex}
        onSelectPeriod={(idx) => setSelectedPeriodIndex(idx)}
        onLogout={handleLogout}
        userRole={userRole}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        pendingLeavesCount={pendingLeavesCount}
        pendingCashCount={cashRequests.filter((r) => r.status === 'pending').length}
      />

      <main className="max-w-7xl mx-auto p-4 md:p-6 pb-24">
        {/* ─── EMPLOYEE VIEW MANAGER ─── */}
        {userRole === 'employee' && (
          <div className="space-y-4">
            {activeTab === 'home' && (
              <EmployeeHome
                displayName={displayName}
                empId={username}
                onNavigate={(v) => setActiveTab(v)}
                isRecurringEnabled={isRecurringEnabled}
                onToggleRecurringAdvance={handleToggleRecurringAdvance}
                importedSlips={importedSlips}
                onViewSlip={handleViewSlip}
                announcements={announcements}
              />
            )}

            {activeTab === 'clock' && (
              <EmployeeClock
                onBack={() => setActiveTab('home')}
                isClockedIn={isClockedIn}
                clockedInTime={clockedInTime}
                onClock={handleClock}
              />
            )}

            {activeTab === 'history' && (
              <EmployeeHistory
                empId={username}
                onBack={() => setActiveTab('home')}
                attendanceData={attendanceData}
                dates={dates}
                corrections={corrections}
                onSubmitCorrection={handleSubmitCorrection}
                employees={employees}
              />
            )}

            {activeTab === 'leave' && (
              <EmployeeLeave
                empId={username}
                onBack={() => setActiveTab('home')}
                employees={employees}
                leaves={leaves}
                onSubmitLeave={handleSubmitLeave}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                displayName={displayName}
                empId={username}
                role={employees.find((e) => e.id === username)?.role || 'พนักงานสนาม'}
                userRole={userRole}
                onLogout={handleLogout}
                employees={employees}
              />
            )}
          </div>
        )}

        {/* ─── ADMIN VIEW MANAGER ─── */}
        {userRole === 'admin' && (
          <div className="space-y-4">
            {activeTab === 'dashboard' && (
              <AdminDashboard
                leaves={leaves}
                corrections={corrections}
                employees={employees}
                attendanceData={attendanceData}
                dates={dates}
                cashRequests={cashRequests}
                announcements={announcements}
                onApproveLeave={handleApproveLeave}
                onApproveCorrection={handleApproveCorrection}
              />
            )}

            {activeTab === 'attendance' && (
              <AdminAttendance
                employees={employees}
                attendanceData={attendanceData}
                dates={dates}
                selectedDateStr={selectedDateStr}
                onDateChange={(d) => setSelectedDateStr(d)}
                activeProject={activeProject}
                onProjectChange={(p) => setActiveProject(p)}
                onUpdateLogStatus={handleUpdateLogStatus}
                onUpdateAllowance={handleUpdateAllowance}
                onUpdateDayAttendance={handleUpdateDayAttendance}
                projects={projects}
              />
            )}

            {activeTab === 'costing' && (
              <AdminCosting
                employees={employees}
                attendanceData={attendanceData}
                dates={dates}
                activeProject={activeProject}
                onProjectChange={(p) => setActiveProject(p)}
                onTriggerPrint={handleTriggerPrint}
                projects={projects}
                onUpdateDayAttendance={handleUpdateDayAttendance}
              />
            )}

            {activeTab === 'imports' && (
              <AdminImport
                employees={employees}
                importedSlips={importedSlips}
                onImportTimesheet={handleImportTimesheet}
                onImportPayslip={handleImportPayslip}
                onImportBulkPayslips={handleImportBulkPayslips}
                onDeletePayslip={handleDeletePayslip}
              />
            )}

            {activeTab === 'management' && (
              <AdminManagement
                employees={employees}
                attendanceData={attendanceData}
                cashRequests={cashRequests}
                announcements={announcements}
                projects={projects}
                leaves={leaves}
                corrections={corrections}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onApproveCashRequest={handleApproveCashRequest}
                onAddAnnouncement={handleAddAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onApproveLeave={handleApproveLeave}
                onApproveCorrection={handleApproveCorrection}
              />
            )}

            {activeTab === 'settings' && (
              <AdminSettings
                settings={systemSettings}
                onSaveSettings={handleSaveSettings}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                displayName={displayName}
                empId={username}
                role="ผู้จัดบัญชีสถิติบุคคล"
                userRole={userRole}
                onLogout={handleLogout}
                employees={employees}
              />
            )}
          </div>
        )}
      </main>

      {/* Embedded Navigation Bar for mobile portrait screens (Both Employee & Admin) */}
      {userRole && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white text-slate-500 border-t border-slate-200 p-3 flex justify-around items-center z-[500] md:hidden rounded-t-[20px] shadow-lg">
          {userRole === 'employee' ? (
            <>
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                  activeTab === 'home' ? 'text-red-700' : 'text-slate-400'
                }`}
              >
                <span className="text-lg">🏠</span>
                <span>หน้าแรก</span>
              </button>
              <button
                onClick={() => setActiveTab('clock')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                  activeTab === 'clock' ? 'text-red-700' : 'text-slate-400'
                }`}
              >
                <span className="text-lg">⏱️</span>
                <span>ลงเวลา</span>
              </button>
              <button
                onClick={() => setActiveTab('leave')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                  activeTab === 'leave' ? 'text-red-700' : 'text-slate-400'
                }`}
              >
                <span className="text-lg">📋</span>
                <span>การลา</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                  activeTab === 'history' ? 'text-red-700' : 'text-slate-400'
                }`}
              >
                <span className="text-lg">📊</span>
                <span>ประวัติ</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                  activeTab === 'profile' ? 'text-red-700' : 'text-slate-400'
                }`}
              >
                <span className="text-lg">👤</span>
                <span>ข้อมูลตัว</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer relative ${
                  activeTab === 'dashboard' ? 'text-red-700' : 'text-slate-400'
                }`}
              >
                <div className="relative">
                  <span className="text-lg">📊</span>
                  {pendingLeavesCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-sans font-extrabold animate-pulse shadow-md">
                      {pendingLeavesCount}
                    </span>
                  )}
                </div>
                <span>แดชบอร์ด</span>
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                  activeTab === 'attendance' ? 'text-red-700' : 'text-slate-400'
                }`}
              >
                <span className="text-lg">⏱️</span>
                <span>เวลางาน</span>
              </button>
              <button
                onClick={() => setActiveTab('costing')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                  activeTab === 'costing' ? 'text-red-700' : 'text-slate-400'
                }`}
              >
                <span className="text-lg">💰</span>
                <span>ต้นทุน</span>
              </button>
              <button
                onClick={() => setActiveTab('imports')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                  activeTab === 'imports' ? 'text-red-700' : 'text-slate-400'
                }`}
              >
                <span className="text-lg">📥</span>
                <span>นำเข้า</span>
              </button>
              <button
                onClick={() => setActiveTab('management')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer relative ${
                  activeTab === 'management' ? 'text-red-700' : 'text-slate-400'
                }`}
              >
                <div className="relative">
                  <span className="text-lg">⚙️</span>
                  {cashRequests.filter((r) => r.status === 'pending').length > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-yellow-500 text-slate-950 text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-sans font-extrabold animate-pulse shadow-md">
                      {cashRequests.filter((r) => r.status === 'pending').length}
                    </span>
                  )}
                </div>
                <span>จัดการระบบ</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                  activeTab === 'settings' ? 'text-red-700' : 'text-slate-400'
                }`}
              >
                <span className="text-lg">🔧</span>
                <span>ตั้งค่าระบบ</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                  activeTab === 'profile' ? 'text-red-700' : 'text-slate-400'
                }`}
              >
                <span className="text-lg">👤</span>
                <span>ข้อมูลตัว</span>
              </button>
            </>
          )}
        </nav>
      )}
    </div>
  );
}
