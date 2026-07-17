import React, { useState } from 'react';
import {
  Users,
  Clock,
  UserX,
  FileMinus,
  RefreshCw,
  TrendingUp,
  Award,
  AlertCircle,
  Check,
  X,
  Search,
  FileText,
  DollarSign,
  Megaphone,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { LeaveRequest, CorrectionRequest, Employee, DailyAttendance, CashRequest, Announcement } from '../types';
import { getEmployeeWages, applyRounding, activeSystemSettings } from '../data';

interface AdminDashboardProps {
  leaves: LeaveRequest[];
  corrections: CorrectionRequest[];
  employees: Employee[];
  attendanceData: Record<string, Record<string, DailyAttendance>>;
  dates: string[];
  cashRequests: CashRequest[];
  announcements: Announcement[];
  onApproveLeave: (id: string, status: 'approved' | 'rejected') => void;
  onApproveCorrection: (id: string, status: 'approved' | 'rejected') => void;
}

export default function AdminDashboard({
  leaves,
  corrections,
  employees,
  attendanceData,
  dates,
  cashRequests,
  announcements,
  onApproveLeave,
  onApproveCorrection,
}: AdminDashboardProps) {
  // History table local states
  const [historyTab, setHistoryTab] = useState<'leave' | 'correction' | 'cash' | 'announcement'>('leave');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [correctionSearch, setCorrectionSearch] = useState('');
  const [cashSearch, setCashSearch] = useState('');
  const [annSearch, setAnnSearch] = useState('');

  const [leaveStatusFilter, setLeaveStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [correctionStatusFilter, setCorrectionStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [cashStatusFilter, setCashStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [annTypeFilter, setAnnTypeFilter] = useState<'all' | 'info' | 'success' | 'warning'>('all');

  const [leavePage, setLeavePage] = useState(1);
  const [correctionPage, setCorrectionPage] = useState(1);
  const [cashPage, setCashPage] = useState(1);
  const [annPage, setAnnPage] = useState(1);

  const pendingLeaves = leaves.filter((l) => l.status === 'pending');
  const pendingCorrections = corrections.filter((c) => c.status === 'pending');

  // Helper to map leave types nicely in Thai
  const mapLeaveType = (type: string) => {
    switch (type) {
      case 'S': return 'ลาป่วย';
      case 'SM': return 'ลาป่วย (มีใบรับรองแพทย์)';
      case 'B': return 'ลากิจ';
      case 'H': return 'ลาพักร้อน';
      case 'P½': return 'ลากิจครึ่งวัน';
      case 'A½': return 'ขาดงานครึ่งวัน';
      default: return type;
    }
  };

  // 1) Filter Leaves History
  const filteredLeaves = leaves.filter((item) => {
    const emp = employees.find((e) => e.id === item.empId);
    const empName = emp ? emp.name : '';
    const matchesSearch = item.empId.toLowerCase().includes(leaveSearch.toLowerCase()) || 
                          empName.toLowerCase().includes(leaveSearch.toLowerCase()) ||
                          item.reason.toLowerCase().includes(leaveSearch.toLowerCase());
    const matchesStatus = leaveStatusFilter === 'all' || item.status === leaveStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // 2) Filter Corrections History
  const filteredCorrections = corrections.filter((item) => {
    const emp = employees.find((e) => e.id === item.empId);
    const empName = emp ? emp.name : '';
    const matchesSearch = item.empId.toLowerCase().includes(correctionSearch.toLowerCase()) || 
                          empName.toLowerCase().includes(correctionSearch.toLowerCase()) ||
                          item.reason.toLowerCase().includes(correctionSearch.toLowerCase());
    const matchesStatus = correctionStatusFilter === 'all' || item.status === correctionStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // 3) Filter Cash Requests History
  const filteredCashRequests = cashRequests.filter((item) => {
    const emp = employees.find((e) => e.id === item.empId);
    const empName = emp ? emp.name : '';
    const matchesSearch = item.empId.toLowerCase().includes(cashSearch.toLowerCase()) || 
                          empName.toLowerCase().includes(cashSearch.toLowerCase()) ||
                          item.amount.toString().includes(cashSearch);
    const matchesStatus = cashStatusFilter === 'all' || item.status === cashStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // 4) Filter Announcements History
  const filteredAnnouncements = announcements.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(annSearch.toLowerCase()) || 
                          item.badge.toLowerCase().includes(annSearch.toLowerCase());
    const matchesType = annTypeFilter === 'all' || item.type === annTypeFilter;
    return matchesSearch && matchesType;
  });

  // Pagination Config
  const itemsPerPage = 8;

  const totalLeavePages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const currentLeaves = filteredLeaves.slice((leavePage - 1) * itemsPerPage, leavePage * itemsPerPage);

  const totalCorrectionPages = Math.ceil(filteredCorrections.length / itemsPerPage);
  const currentCorrections = filteredCorrections.slice((correctionPage - 1) * itemsPerPage, correctionPage * itemsPerPage);

  const totalCashPages = Math.ceil(filteredCashRequests.length / itemsPerPage);
  const currentCashRequests = filteredCashRequests.slice((cashPage - 1) * itemsPerPage, cashPage * itemsPerPage);

  const totalAnnPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const currentAnnouncements = filteredAnnouncements.slice((annPage - 1) * itemsPerPage, annPage * itemsPerPage);

  // Calculate master KPI numbers dynamically based on attendanceData of current dates
  let totalAbsent = 0;
  let totalLate = 0;
  let totalLeaves = 0;
  let totalWelfareCost = 0;

  dates.forEach((d) => {
    const dayLogs = attendanceData[d] || {};
    Object.values(dayLogs).forEach((l) => {
      if (l.status === 'A') {
        totalAbsent++;
      } else if (l.status === 'L') {
        totalLate++;
      } else if (['B', 'H', 'S', 'SM'].includes(l.status)) {
        totalLeaves++;
      }
      totalWelfareCost += (l.food || 0) + (l.trip || 0) + (l.other || 0);
    });
  });

  // ─── RECHARTS DATA PREPARATIONS ───
  const projectCosts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {
    'ทำงานปกติ': 0,
    'มาสาย': 0,
    'ขาดงาน': 0,
    'ลาหยุด': 0,
    'วันหยุด': 0,
  };

  // Group status distribution across current billing dates
  dates.forEach((d) => {
    const dayLogs = attendanceData[d] || {};
    employees.forEach((emp) => {
      const log = dayLogs[emp.id];
      const s = log ? log.status : 'ย';
      if (['W', 'คส', 'พร'].includes(s)) {
        statusCounts['ทำงานปกติ']++;
      } else if (s === 'L') {
        statusCounts['มาสาย']++;
      } else if (['A', 'A½'].includes(s)) {
        statusCounts['ขาดงาน']++;
      } else if (['S', 'SM', 'B', 'H', 'P½'].includes(s)) {
        statusCounts['ลาหยุด']++;
      } else if (['ย', 'นข'].includes(s)) {
        statusCounts['วันหยุด']++;
      }
    });
  });

  // Calculate project costs dynamically matching billing formulas
  employees.forEach((emp) => {
    let credits = 0;
    let otHours = 0;
    let foodSum = 0;
    let tripSum = 0;
    let otherSum = 0;

    dates.forEach((d) => {
      const log = (attendanceData[d]?.[emp.id] || { credit: 0, ot: 0, food: 0, trip: 0, other: 0 }) as DailyAttendance;
      credits += log.credit || 0;
      otHours += log.ot || 0;
      foodSum += log.food || 0;
      tripSum += log.trip || 0;
      otherSum += log.other || 0;
    });

    const { dayWage, hrWage } = getEmployeeWages(emp);
    const baseSalaryEarned = dayWage * credits;
    const otEarned = otHours * hrWage * 1.0;
    
    const rawWages = baseSalaryEarned + otEarned;
    const wages = applyRounding(rawWages, activeSystemSettings.roundSalary);

    const roundedFoodSum = applyRounding(foodSum, activeSystemSettings.roundWelfare);
    const roundedTripSum = applyRounding(tripSum, activeSystemSettings.roundWelfare);
    const roundedOtherSum = applyRounding(otherSum, activeSystemSettings.roundWelfare);

    const rawTotalRow = wages + roundedFoodSum + roundedTripSum + roundedOtherSum;
    const totalRow = applyRounding(rawTotalRow, activeSystemSettings.roundNetPay);

    const proj = emp.project || 'ไม่ระบุโครงการ';
    projectCosts[proj] = (projectCosts[proj] || 0) + totalRow;
  });

  const projectCostData = Object.entries(projectCosts).map(([name, cost]) => ({
    name: name.replace('โครงการ', '').trim(),
    fullName: name,
    cost: Math.round(cost),
  }));

  const totalBillingCycleCost = Math.round(Object.values(projectCosts).reduce((acc, curr) => acc + curr, 0));

  const statusData = Object.entries(statusCounts)
    .filter(([_, val]) => val > 0)
    .map(([name, value]) => ({
      name,
      value,
    }));

  const STATUS_COLORS: Record<string, string> = {
    'ทำงานปกติ': '#10B981', // emerald-500
    'มาสาย': '#F59E0B', // amber-500
    'ขาดงาน': '#EF4444', // rose-500
    'ลาหยุด': '#8B5CF6', // violet-500
    'วันหยุด': '#94A3B8', // slate-400
  };

  const PROJECT_BAR_COLORS = ['#AF252F', '#D97706', '#2563EB', '#0D9488'];

  return (
    <div className="space-y-6">
      {/* Approvals Box Cockpit */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 mb-3.5 flex items-center gap-2">
          <span className="w-1 h-3.5 bg-red-600 rounded-full animate-pulse" />
          <span>กล่องคำขอรอดำเนินพิจารณา (Approvals Cockpit)</span>
        </h3>

        <div className="bg-white rounded-2xl border-2 border-red-600/30 p-5 shadow-sm space-y-4">
          {pendingLeaves.length === 0 && pendingCorrections.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-3 font-semibold">
              🎉 ยอดเยี่ยม! ไม่มีคำขอลาหรือขอแก้ไขเวลาค้างพิจารณาในระบบขณะนี้
            </p>
          )}

          {/* Pending Leaves */}
          {pendingLeaves.map((item) => {
            const empName = employees.find((e) => e.id === item.empId)?.name || item.empId;
            return (
              <div key={item.id} className="p-3.5 bg-rose-50/40 border border-rose-150 rounded-xl space-y-2.5 text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded">คำขอลาพักผ่อน</span>
                  <span className="text-slate-400 font-mono text-[9px]">{item.submittedAt}</span>
                </div>
                <div className="text-slate-700">
                  <strong className="text-slate-900">พนักงาน:</strong> คุณ{empName} ({item.empId}) <br />
                  <strong className="text-slate-900">ช่วงเวลา:</strong> {item.start} ถึง {item.end} <br />
                  <strong className="text-slate-900">ประเภท:</strong> {item.type} ·{' '}
                  <strong className="text-slate-900">เหตุผล:</strong> "{item.reason}"
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => onApproveLeave(item.id, 'rejected')}
                    className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>ปฏิเสธ</span>
                  </button>
                  <button
                    onClick={() => onApproveLeave(item.id, 'approved')}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>อนุมัติวันหยุด</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Pending Corrections */}
          {pendingCorrections.map((item) => {
            const empName = employees.find((e) => e.id === item.empId)?.name || item.empId;
            return (
              <div key={item.id} className="p-3.5 bg-blue-50/40 border border-blue-150 rounded-xl space-y-2.5 text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">ขอแก้ไขเวลางาน</span>
                  <span className="text-slate-400 font-mono text-[9px]">{item.submittedAt}</span>
                </div>
                <div className="text-slate-700">
                  <strong className="text-slate-900">พนักงาน:</strong> คุณ{empName} ({item.empId}) <br />
                  <strong className="text-slate-900">เวลาเดิมที่คลาดเคลื่อน:</strong> ตรวจไม่พบบันทึกคู่ <br />
                  <strong className="text-slate-900">ความประสงค์แก้ไขเป็น:</strong> {item.timeIn} - {item.timeOut} <br />
                  <strong className="text-slate-900">เหตุผลเพิ่มเติม:</strong> "{item.reason}"
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => onApproveCorrection(item.id, 'rejected')}
                    className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>ปฏิเสธ</span>
                  </button>
                  <button
                    onClick={() => onApproveCorrection(item.id, 'approved')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>อนุมัติและปลดล็อกบัญชี</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Unified Grid Row */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-3.5 bg-red-600 rounded-full" />
          <span>ดัชนีชี้วัดกำลังพลและข้อมูลสรุปงวดปัจจุบัน (KPI & Billing Dashboard Cockpit)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {/* Card 1: พนักงานในระบบ */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">กำลังพลในระบบ</span>
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-800 font-mono">{employees.length}</span>
                <span className="text-[9px] font-bold text-slate-400">คน</span>
              </div>
              <span className="text-[8px] text-emerald-600 font-medium mt-1 block">● พร้อมปฏิบัติงานสนาม</span>
            </div>
          </div>

          {/* Card 2: ประมาณการต้นทุนรวม */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-red-500/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ต้นทุนรวมงวดนี้</span>
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-0.5 mt-1">
                <span className="text-lg font-black text-rose-600 font-mono">฿{totalBillingCycleCost.toLocaleString()}</span>
              </div>
              <span className="text-[8px] text-slate-400 mt-1 block">คำนวณตามสถิติตอกบัตร</span>
            </div>
          </div>

          {/* Card 3: ขาดงานสะสม */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-rose-500/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ขาดงานสะสม</span>
              <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg">
                <UserX className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-800 font-mono">{totalAbsent}</span>
                <span className="text-[9px] font-bold text-rose-600">ครั้ง</span>
              </div>
              <span className="text-[8px] text-slate-400 mt-1 block">นับทุกไซด์รวมกัน</span>
            </div>
          </div>

          {/* Card 4: มาสายสะสม */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-amber-500/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">มาสายสะสม</span>
              <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-800 font-mono">{totalLate}</span>
                <span className="text-[9px] font-bold text-amber-600">ครั้ง</span>
              </div>
              <span className="text-[8px] text-slate-400 mt-1 block">เริ่มตัดสายหลัง 08:15 น.</span>
            </div>
          </div>

          {/* Card 5: ลางานสะสม */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-violet-500/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ลางานสะสม</span>
              <div className="p-1.5 bg-violet-50 text-violet-500 rounded-lg">
                <FileMinus className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-800 font-mono">{totalLeaves}</span>
                <span className="text-[9px] font-bold text-violet-600">ครั้ง</span>
              </div>
              <span className="text-[8px] text-slate-400 mt-1 block">ป่วย/กิจ/พักร้อนประจำปี</span>
            </div>
          </div>

          {/* Card 6: ใบลาค้างอนุมัติ */}
          <div className={`border rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-all duration-200 ${
            pendingLeaves.length > 0 
              ? 'bg-amber-50/50 border-amber-300 hover:border-amber-500' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ใบลาค้างอนุมัติ</span>
              <div className={`p-1.5 rounded-lg ${pendingLeaves.length > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-2xl font-black font-mono ${pendingLeaves.length > 0 ? 'text-amber-700' : 'text-slate-800'}`}>{pendingLeaves.length}</span>
                <span className="text-[9px] font-bold text-slate-400">ใบ</span>
              </div>
              <span className="text-[8px] text-slate-400 mt-1 block">
                {pendingLeaves.length > 0 ? '⚠️ รอแอดมินอนุมัติ' : '✓ ตรวจสอบครบแล้ว'}
              </span>
            </div>
          </div>

          {/* Card 7: แก้ไขเวลาค้างตรวจ */}
          <div className={`border rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-all duration-200 ${
            pendingCorrections.length > 0 
              ? 'bg-blue-50/50 border-blue-300 hover:border-blue-500' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">แก้ไขเวลาค้างตรวจ</span>
              <div className={`p-1.5 rounded-lg ${pendingCorrections.length > 0 ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                <RefreshCw className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-2xl font-black font-mono ${pendingCorrections.length > 0 ? 'text-blue-700' : 'text-slate-800'}`}>{pendingCorrections.length}</span>
                <span className="text-[9px] font-bold text-slate-400">คำขอ</span>
              </div>
              <span className="text-[8px] text-slate-400 mt-1 block">
                {pendingCorrections.length > 0 ? '⚠️ รอตรวจปล่อยตอก' : '✓ ตรวจสอบครบแล้ว'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Summary Visualization Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Project Costs Bar Chart */}
        <div className="bg-white border border-slate-200 p-5 rounded-[22px] shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              <span>สรุปต้นทุนรวมรายโครงการ (Project Cost Summary)</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              รวมค่าแรงตามวันทำงาน, โอที, และสวัสดิการเบี้ยเลี้ยงทั้งหมดประจำงวด
            </p>
          </div>

          <div className="h-56 w-full text-xs font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={projectCostData}
                margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, 'ต้นทุนงวดสะสม']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    color: '#1E293B',
                    fontSize: '11px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  }}
                  itemStyle={{ color: '#0F172A' }}
                  labelStyle={{ fontWeight: 'black', color: '#64748B' }}
                />
                <Bar dataKey="cost" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {projectCostData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PROJECT_BAR_COLORS[index % PROJECT_BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Status Pie Chart */}
        <div className="bg-white border border-slate-200 p-5 rounded-[22px] shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span>สัดส่วนการจัดสรรกำลังพลและสถิติการมาทำงาน</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              สถิติบันทึกสถานะการตอกบัตรทั้งหมดของพนักงานในสนามประจำงวดนี้
            </p>
          </div>

          <div className="grid grid-cols-5 items-center gap-2">
            <div className="col-span-3 h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name] || '#64748B'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} รายการ`, 'จำนวนครั้งที่บันทึก']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      color: '#1E293B',
                      fontSize: '11px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    }}
                    itemStyle={{ color: '#0F172A' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="col-span-2 space-y-2 text-[10px] font-black text-slate-600">
              {statusData.map((entry, idx) => {
                const color = STATUS_COLORS[entry.name] || '#64748B';
                const totalLogs = statusData.reduce((acc, curr) => acc + curr.value, 0);
                const percent = totalLogs > 0 ? ((entry.value / totalLogs) * 100).toFixed(1) : '0';
                return (
                  <div key={idx} className="flex flex-col border-b border-slate-50 pb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="truncate">{entry.name}</span>
                    </div>
                    <div className="pl-4 font-mono text-[9px] text-slate-400">
                      {entry.value} วัน ({percent}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── NEW COMPREHENSIVE HISTORY TABLES SECTION ─── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              <span>ประวัติระบบและคำขออนุมัติทั้งหมด (All System & Requests Logs)</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              รวมตารางประวัติข้อมูลใบลางาน, การแก้ไขเวลางาน, การเบิกเงินสำรองสะสม และประกาศระบบข่าวสารย้อนหลังทั้งหมด
            </p>
          </div>

          {/* Tab switches */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto shrink-0">
            <button
              onClick={() => setHistoryTab('leave')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition cursor-pointer ${
                historyTab === 'leave'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📋 ประวัติการลา ({leaves.length})
            </button>
            <button
              onClick={() => setHistoryTab('correction')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition cursor-pointer ${
                historyTab === 'correction'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🔧 ขอแก้ไขเวลา ({corrections.length})
            </button>
            <button
              onClick={() => setHistoryTab('cash')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition cursor-pointer ${
                historyTab === 'cash'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              💰 เบิกเงินสะสม ({cashRequests.length})
            </button>
            <button
              onClick={() => setHistoryTab('announcement')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition cursor-pointer ${
                historyTab === 'announcement'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📢 ประกาศระบบ ({announcements.length})
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="p-4 border-b border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {historyTab === 'announcement' ? 'ค้นหาประกาศข่าวสาร' : 'ค้นหาข้อมูลพนักงาน หรือรายละเอียด'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={
                  historyTab === 'leave'
                    ? leaveSearch
                    : historyTab === 'correction'
                    ? correctionSearch
                    : historyTab === 'cash'
                    ? cashSearch
                    : annSearch
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (historyTab === 'leave') {
                    setLeaveSearch(val);
                    setLeavePage(1);
                  } else if (historyTab === 'correction') {
                    setCorrectionSearch(val);
                    setCorrectionPage(1);
                  } else if (historyTab === 'cash') {
                    setCashSearch(val);
                    setCashPage(1);
                  } else {
                    setAnnSearch(val);
                    setAnnPage(1);
                  }
                }}
                placeholder={
                  historyTab === 'leave'
                    ? 'ค้นหาด้วยรหัสพนักงาน, ชื่อพนักงาน หรือเหตุผลการลาหยุด...'
                    : historyTab === 'correction'
                    ? 'ค้นหาด้วยรหัสพนักงาน, ชื่อพนักงาน หรือรายละเอียดการขอปรับเวลา...'
                    : historyTab === 'cash'
                    ? 'ค้นหาด้วยรหัสพนักงาน, ชื่อพนักงาน หรือยอดเงินเบิกสำรอง...'
                    : 'ค้นหาด้วยคำประชาสัมพันธ์ หรือคำกำกับข่าวสารป้าย...'
                }
                className="w-full bg-slate-50 rounded-xl border border-slate-200 pl-9 pr-4 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {historyTab === 'announcement' ? 'กรองตามประเภทสีประกาศ' : 'กรองตามสถานะอนุมัติ'}
            </label>
            <select
              value={
                historyTab === 'leave'
                  ? leaveStatusFilter
                  : historyTab === 'correction'
                  ? correctionStatusFilter
                  : historyTab === 'cash'
                  ? cashStatusFilter
                  : annTypeFilter
              }
              onChange={(e) => {
                const val = e.target.value as any;
                if (historyTab === 'leave') {
                  setLeaveStatusFilter(val);
                  setLeavePage(1);
                } else if (historyTab === 'correction') {
                  setCorrectionStatusFilter(val);
                  setCorrectionPage(1);
                } else if (historyTab === 'cash') {
                  setCashStatusFilter(val);
                  setCashPage(1);
                } else {
                  setAnnTypeFilter(val);
                  setAnnPage(1);
                }
              }}
              className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 outline-none focus:border-red-500 focus:bg-white transition cursor-pointer"
            >
              {historyTab === 'announcement' ? (
                <>
                  <option value="all">แสดงประเภททั้งหมด</option>
                  <option value="info">🔵 สีฟ้า (ข้อมูลทั่วไป)</option>
                  <option value="success">🟢 สีเขียว (ข่าวดี/สิทธิพิเศษ)</option>
                  <option value="warning">🟠 สีส้ม (แจ้งเตือนด่วน)</option>
                </>
              ) : (
                <>
                  <option value="all">แสดงสถานะทั้งหมด</option>
                  <option value="pending">⏳ รอการตรวจ / พิจารณา</option>
                  <option value="approved">✅ อนุมัติสำเร็จ</option>
                  <option value="rejected">❌ ปฏิเสธการอนุมัติ</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white">
          {historyTab === 'leave' && (
            /* 📅 LEAVE HISTORY TABLE */
            filteredLeaves.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <FileMinus className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-400">ไม่พบประวัติการลาหยุดที่ระบุ</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-black border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4 w-[110px]">รหัสพนักงาน</th>
                        <th className="py-3 px-4">ชื่อพนักงาน</th>
                        <th className="py-3 px-4">ประเภทใบลา</th>
                        <th className="py-3 px-4">ช่วงวันที่ขอหยุด</th>
                        <th className="py-3 px-4">เหตุผลการลา</th>
                        <th className="py-3 px-4">ยื่นเมื่อวันที่</th>
                        <th className="py-3 px-4 text-center w-[120px]">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentLeaves.map((item) => {
                        const emp = employees.find((e) => e.id === item.empId);
                        const empName = emp ? emp.name : 'ไม่พบข้อมูลพนักงาน';
                        
                        let statusColor = 'bg-slate-50 text-slate-500 border-slate-200';
                        let statusText = 'ไม่ทราบ';
                        if (item.status === 'pending') {
                          statusColor = 'bg-amber-50 text-amber-700 border-amber-100';
                          statusText = '⏳ รออนุมัติ';
                        } else if (item.status === 'approved') {
                          statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                          statusText = '✅ อนุมัติแล้ว';
                        } else if (item.status === 'rejected') {
                          statusColor = 'bg-rose-50 text-rose-700 border-rose-100';
                          statusText = '❌ ปฏิเสธ';
                        }

                        // Map type
                        let leaveTypeName = item.type;
                        if (item.type === 'S') leaveTypeName = 'ลาป่วย';
                        else if (item.type === 'SM') leaveTypeName = 'ลาป่วย (มีใบรับรองแพทย์)';
                        else if (item.type === 'B') leaveTypeName = 'ลากิจ';
                        else if (item.type === 'H') leaveTypeName = 'ลาพักร้อน';
                        else if (item.type === 'P½') leaveTypeName = 'ลากิจครึ่งวัน';
                        else if (item.type === 'A½') leaveTypeName = 'ขาดครึ่งวัน';

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150 font-bold">
                            <td className="py-3 px-4 font-mono text-red-700">{item.empId}</td>
                            <td className="py-3 px-4 text-slate-800">คุณ{empName}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                                {leaveTypeName}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-700 font-mono text-[11px]">{item.start} ถึง {item.end}</td>
                            <td className="py-3 px-4 text-slate-500 text-[11px] font-normal italic max-w-xs truncate" title={item.reason}>
                              "{item.reason}"
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">{item.submittedAt}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-lg border text-[10px] font-black ${statusColor}`}>
                                {statusText}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Leaves Pagination */}
                {totalLeavePages > 1 && (
                  <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-600">
                    <div>
                      แสดงรายการ {((leavePage - 1) * itemsPerPage) + 1} - {Math.min(leavePage * itemsPerPage, filteredLeaves.length)} จากทั้งหมด {filteredLeaves.length} รายการ
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={leavePage === 1}
                        onClick={() => setLeavePage((prev) => Math.max(prev - 1, 1))}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer text-[10px]"
                      >
                        ก่อนหน้า
                      </button>
                      {Array.from({ length: totalLeavePages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setLeavePage(idx + 1)}
                          className={`px-2 py-1 rounded-md border text-[10px] transition cursor-pointer ${
                            leavePage === idx + 1
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        disabled={leavePage === totalLeavePages}
                        onClick={() => setLeavePage((prev) => Math.min(prev + 1, totalLeavePages))}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer text-[10px]"
                      >
                        ถัดไป
                      </button>
                    </div>
                  </div>
                )}
              </>
            )
          )}

          {historyTab === 'correction' && (
            /* 🔧 CORRECTION HISTORY TABLE */
            filteredCorrections.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <RefreshCw className="w-10 h-10 text-slate-300 mx-auto animate-spin-slow" />
                <p className="text-xs font-bold text-slate-400">ไม่พบประวัติการขอแก้ไขเวลางานที่ระบุ</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-black border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4 w-[110px]">รหัสพนักงาน</th>
                        <th className="py-3 px-4">ชื่อพนักงาน</th>
                        <th className="py-3 px-4">เวลาที่เสนอแก้ไขเป็น</th>
                        <th className="py-3 px-4">เหตุผลการขอแก้ไข</th>
                        <th className="py-3 px-4">ยื่นเมื่อวันที่</th>
                        <th className="py-3 px-4 text-center w-[120px]">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentCorrections.map((item) => {
                        const emp = employees.find((e) => e.id === item.empId);
                        const empName = emp ? emp.name : 'ไม่พบข้อมูลพนักงาน';
                        
                        let statusColor = 'bg-slate-50 text-slate-500 border-slate-200';
                        let statusText = 'ไม่ทราบ';
                        if (item.status === 'pending') {
                          statusColor = 'bg-amber-50 text-amber-700 border-amber-100';
                          statusText = '⏳ รอตรวจ';
                        } else if (item.status === 'approved') {
                          statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                          statusText = '✅ อนุมัติแล้ว';
                        } else if (item.status === 'rejected') {
                          statusColor = 'bg-rose-50 text-rose-700 border-rose-100';
                          statusText = '❌ ปฏิเสธ';
                        }

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150 font-bold">
                            <td className="py-3 px-4 font-mono text-red-700">{item.empId}</td>
                            <td className="py-3 px-4 text-slate-800">คุณ{empName}</td>
                            <td className="py-3 px-4 text-emerald-700 font-mono text-[11px]">
                              {item.timeIn || 'ไม่ได้ระบุ'} ถึง {item.timeOut || 'ไม่ได้ระบุ'}
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-[11px] font-normal italic max-w-xs truncate" title={item.reason}>
                              "{item.reason}"
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">{item.submittedAt}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-lg border text-[10px] font-black ${statusColor}`}>
                                {statusText}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Corrections Pagination */}
                {totalCorrectionPages > 1 && (
                  <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-600">
                    <div>
                      แสดงรายการ {((correctionPage - 1) * itemsPerPage) + 1} - {Math.min(correctionPage * itemsPerPage, filteredCorrections.length)} จากทั้งหมด {filteredCorrections.length} รายการ
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={correctionPage === 1}
                        onClick={() => setCorrectionPage((prev) => Math.max(prev - 1, 1))}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer text-[10px]"
                      >
                        ก่อนหน้า
                      </button>
                      {Array.from({ length: totalCorrectionPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCorrectionPage(idx + 1)}
                          className={`px-2 py-1 rounded-md border text-[10px] transition cursor-pointer ${
                            correctionPage === idx + 1
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        disabled={correctionPage === totalCorrectionPages}
                        onClick={() => setCorrectionPage((prev) => Math.min(prev + 1, totalCorrectionPages))}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer text-[10px]"
                      >
                        ถัดไป
                      </button>
                    </div>
                  </div>
                )}
              </>
            )
          )}

          {historyTab === 'cash' && (
            /* 💰 PETTY CASH HISTORY TABLE */
            filteredCashRequests.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <DollarSign className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-400">ไม่พบประวัติการขออนุมัติเบิกเงินสำรองที่ระบุ</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-black border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4 w-[110px]">รหัสพนักงาน</th>
                        <th className="py-3 px-4">ชื่อพนักงาน</th>
                        <th className="py-3 px-4">จำนวนยอดเงินเบิก</th>
                        <th className="py-3 px-4">ประเภทเงื่อนไข</th>
                        <th className="py-3 px-4">ยื่นเมื่อวันที่</th>
                        <th className="py-3 px-4 text-center w-[120px]">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentCashRequests.map((item) => {
                        const emp = employees.find((e) => e.id === item.empId);
                        const empName = emp ? emp.name : 'ไม่พบข้อมูลพนักงาน';
                        
                        let statusColor = 'bg-slate-50 text-slate-500 border-slate-200';
                        let statusText = 'ไม่ทราบ';
                        if (item.status === 'pending') {
                          statusColor = 'bg-amber-50 text-amber-700 border-amber-100';
                          statusText = '⏳ รออนุมัติ';
                        } else if (item.status === 'approved') {
                          statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                          statusText = '✅ อนุมัติแล้ว';
                        } else if (item.status === 'rejected') {
                          statusColor = 'bg-rose-50 text-rose-700 border-rose-100';
                          statusText = '❌ ปฏิเสธ';
                        }

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150 font-bold">
                            <td className="py-3 px-4 font-mono text-red-700">{item.empId}</td>
                            <td className="py-3 px-4 text-slate-800">คุณ{empName}</td>
                            <td className="py-3 px-4 text-slate-900 font-mono text-xs">
                              ฿{item.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              {item.type === 'RECURRING' ? (
                                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[9px]">
                                  ต่อเนื่องทุกเดือน
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px]">
                                  เฉพาะเดือนนี้ครั้งเดียว
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">{item.submittedAt}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-lg border text-[10px] font-black ${statusColor}`}>
                                {statusText}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Cash Pagination */}
                {totalCashPages > 1 && (
                  <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-600">
                    <div>
                      แสดงรายการ {((cashPage - 1) * itemsPerPage) + 1} - {Math.min(cashPage * itemsPerPage, filteredCashRequests.length)} จากทั้งหมด {filteredCashRequests.length} รายการ
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={cashPage === 1}
                        onClick={() => setCashPage((prev) => Math.max(prev - 1, 1))}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer text-[10px]"
                      >
                        ก่อนหน้า
                      </button>
                      {Array.from({ length: totalCashPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCashPage(idx + 1)}
                          className={`px-2 py-1 rounded-md border text-[10px] transition cursor-pointer ${
                            cashPage === idx + 1
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        disabled={cashPage === totalCashPages}
                        onClick={() => setCashPage((prev) => Math.min(prev + 1, totalCashPages))}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer text-[10px]"
                      >
                        ถัดไป
                      </button>
                    </div>
                  </div>
                )}
              </>
            )
          )}

          {historyTab === 'announcement' && (
            /* 📢 ANNOUNCEMENT HISTORY TABLE */
            filteredAnnouncements.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Megaphone className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-400">ไม่พบประกาศระบบตามเงื่อนไขที่ค้นหา</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-black border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4 w-[110px]">ป้ายกำกับ</th>
                        <th className="py-3 px-4">หัวข้อข้อความประกาศประชาสัมพันธ์</th>
                        <th className="py-3 px-4 w-[120px]">ประเภทสี</th>
                        <th className="py-3 px-4 text-right w-[150px]">เวลาที่เผยแพร่</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold">
                      {currentAnnouncements.map((item) => {
                        let typeText = 'ข้อมูลทั่วไป';
                        let typeBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                        if (item.type === 'success') {
                          typeText = 'ข่าวดี/สิทธิพิเศษ';
                          typeBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        } else if (item.type === 'warning') {
                          typeText = 'แจ้งเตือนด่วน';
                          typeBadgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                        }

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150">
                            <td className="py-3.5 px-4 font-mono text-red-700">
                              <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[9px] uppercase tracking-wide">
                                {item.badge}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-800 text-[11px] leading-relaxed max-w-md">
                              {item.title}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black ${typeBadgeColor}`}>
                                {typeText}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[10px]">{item.time}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Announcement Pagination */}
                {totalAnnPages > 1 && (
                  <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-600">
                    <div>
                      แสดงรายการ {((annPage - 1) * itemsPerPage) + 1} - {Math.min(annPage * itemsPerPage, filteredAnnouncements.length)} จากทั้งหมด {filteredAnnouncements.length} รายการ
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={annPage === 1}
                        onClick={() => setAnnPage((prev) => Math.max(prev - 1, 1))}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer text-[10px]"
                      >
                        ก่อนหน้า
                      </button>
                      {Array.from({ length: totalAnnPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAnnPage(idx + 1)}
                          className={`px-2 py-1 rounded-md border text-[10px] transition cursor-pointer ${
                            annPage === idx + 1
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        disabled={annPage === totalAnnPages}
                        onClick={() => setAnnPage((prev) => Math.min(prev + 1, totalAnnPages))}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer text-[10px]"
                      >
                        ถัดไป
                      </button>
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
