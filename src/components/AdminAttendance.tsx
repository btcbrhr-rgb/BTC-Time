import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Edit3,
  Clock,
  Briefcase,
  Users,
  Grid,
  Search,
  X,
} from 'lucide-react';
import { Employee, DailyAttendance } from '../types';
import { GLOBAL_STATUS, GLOBAL_STATUS_CONFIG } from '../data';

interface AdminAttendanceProps {
  employees: Employee[];
  attendanceData: Record<string, Record<string, DailyAttendance>>;
  dates: string[];
  selectedDateStr: string;
  onDateChange: (date: string) => void;
  activeProject: string;
  onProjectChange: (proj: string) => void;
  onUpdateLogStatus: (empId: string, status: string, timeIn: string, timeOut: string, project: string) => void;
  onUpdateAllowance: (empId: string, field: 'food' | 'trip' | 'other', val: number, memo?: string) => void;
  onUpdateDayAttendance?: (
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
  ) => void;
  projects: string[];
}

export default function AdminAttendance({
  employees,
  attendanceData,
  dates,
  selectedDateStr,
  onDateChange,
  activeProject,
  onProjectChange,
  onUpdateLogStatus,
  onUpdateAllowance,
  onUpdateDayAttendance,
  projects,
}: AdminAttendanceProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'summary'>('daily');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State for editing log
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [modalTimeIn, setModalTimeIn] = useState('');
  const [modalTimeOut, setModalTimeOut] = useState('');
  const [modalStatus, setModalStatus] = useState('');
  const [modalProject, setModalProject] = useState('');

  // Modal State for custom allowance
  const [isAllowModalOpen, setIsAllowModalOpen] = useState(false);
  const [allowFood, setAllowFood] = useState(0);
  const [allowTrip, setAllowTrip] = useState(0);
  const [allowOther, setAllowOther] = useState(0);
  const [allowMemo, setAllowMemo] = useState('');

  const navigateDate = (offset: number) => {
    const parts = selectedDateStr.split('-');
    const current = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
    current.setDate(current.getDate() + offset);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    onDateChange(`${y}-${m}-${d}`);
  };

  const handleOpenStatusModal = (empId: string, log: DailyAttendance) => {
    setSelectedEmpId(empId);
    setModalTimeIn(log.timeIn || '');
    setModalTimeOut(log.timeOut || '');
    setModalStatus(log.status || 'ย');
    setModalProject(log.project || '');
    setIsStatusModalOpen(true);
  };

  const handleSaveStatusModal = () => {
    onUpdateLogStatus(selectedEmpId, modalStatus, modalTimeIn, modalTimeOut, modalProject);
    setIsStatusModalOpen(false);
  };

  const handleOpenAllowModal = (empId: string, log: DailyAttendance) => {
    setSelectedEmpId(empId);
    setAllowFood(log.food || 0);
    setAllowTrip(log.trip || 0);
    setAllowOther(log.other || 0);
    setAllowMemo(log.otherMemo || '');
    setIsAllowModalOpen(true);
  };

  const handleSaveAllowModal = () => {
    onUpdateAllowance(selectedEmpId, 'food', allowFood);
    onUpdateAllowance(selectedEmpId, 'trip', allowTrip);
    onUpdateAllowance(selectedEmpId, 'other', allowOther, allowMemo);
    setIsAllowModalOpen(false);
  };

  // Matrix Cell Day Edit Modal State
  const [isDayEditModalOpen, setIsDayEditModalOpen] = useState(false);
  const [selectedEditDate, setSelectedEditDate] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editTimeIn, setEditTimeIn] = useState('');
  const [editTimeOut, setEditTimeOut] = useState('');
  const [editProject, setEditProject] = useState('');
  const [editFood, setEditFood] = useState(0);
  const [editTrip, setEditTrip] = useState(0);
  const [editOther, setEditOther] = useState(0);
  const [editMemo, setEditMemo] = useState('');

  const handleOpenMatrixEdit = (empId: string, date: string, log: DailyAttendance) => {
    setSelectedEmpId(empId);
    setSelectedEditDate(date);
    setEditStatus(log.status || 'ย');
    setEditTimeIn(log.timeIn || '');
    setEditTimeOut(log.timeOut || '');
    setEditProject(log.project || employees.find(e => e.id === empId)?.project || '');
    setEditFood(log.food !== undefined ? log.food : 0);
    setEditTrip(log.trip !== undefined ? log.trip : 0);
    setEditOther(log.other !== undefined ? log.other : 0);
    setEditMemo(log.otherMemo || '');
    setIsDayEditModalOpen(true);
  };

  const handleSaveDayEditModal = () => {
    if (onUpdateDayAttendance) {
      onUpdateDayAttendance(selectedEmpId, selectedEditDate, {
        status: editStatus,
        timeIn: editTimeIn,
        timeOut: editTimeOut,
        project: editProject,
        food: editFood,
        trip: editTrip,
        other: editOther,
        otherMemo: editMemo,
      });
    } else {
      onUpdateLogStatus(selectedEmpId, editStatus, editTimeIn, editTimeOut, editProject);
      onUpdateAllowance(selectedEmpId, 'food', editFood);
      onUpdateAllowance(selectedEmpId, 'trip', editTrip);
      onUpdateAllowance(selectedEmpId, 'other', editOther, editMemo);
    }
    setIsDayEditModalOpen(false);
  };

  const handleQuickAllowance = (empId: string, field: 'food' | 'trip' | 'other', value: string) => {
    const parsed = parseFloat(value) || 0;
    onUpdateAllowance(empId, field, parsed);
  };

  const dayLogs = attendanceData[selectedDateStr] || {};
  const filteredEmployees = employees.filter((e) => {
    const matchesProject = activeProject === 'all' || e.project === activeProject;
    const matchesSearch = searchTerm.trim() === '' ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProject && matchesSearch;
  });

  // Status statistics inside this day
  let normalCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  filteredEmployees.forEach((emp) => {
    const l = dayLogs[emp.id];
    if (l) {
      if (['W', 'พร', 'คส'].includes(l.status)) normalCount++;
      else if (l.status === 'L') lateCount++;
      else if (['A', 'MI', 'MO', 'ลืมเข้า', 'ลืมออก', 'B-', 'H-', 'S-'].includes(l.status)) absentCount++;
    }
  });

  return (
    <div className="space-y-4">
      {/* Search Filter Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Bar Column */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">
              ค้นหาชื่อ หรือ รหัสพนักงาน
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="พิมพ์เพื่อค้นหาพนักงานด่วน..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-2 text-xs font-bold text-slate-700 outline-none focus:border-red-600 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-450 hover:text-red-700 cursor-pointer"
                  title="ล้างคำค้นหา"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">
              ตัวกรองโครงการก่อสร้างหน้างาน
            </label>
            <div className="relative">
              <select
                value={activeProject}
                onChange={(e) => onProjectChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-red-600 transition"
              >
                <option value="all">🔍 แสดงข้อมูลพนักงานทุกโครงการในสนาม</option>
                {projects.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">
              สลับมุมมองการลงตอกเวลางาน
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('daily')}
                className={`py-1.5 rounded-lg text-xs font-black transition ${
                  activeTab === 'daily' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                📝 บันทึกรายวัน
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-1.5 rounded-lg text-xs font-black transition ${
                  activeTab === 'summary' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                📅 แผนตารางรอบเดือน (Matrix)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── DAILY TAB ─── */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Date Navigators */}
              <div className="flex items-center gap-3 shrink-0 justify-between md:justify-start">
                <button
                  onClick={() => navigateDate(-1)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-center md:text-left min-w-[160px]">
                  <input
                    type="date"
                    value={selectedDateStr}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="text-sm font-extrabold text-slate-800 border border-slate-200 bg-slate-50 px-2 py-1.5 rounded-xl cursor-pointer outline-none focus:border-red-600"
                  />
                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    {new Date(selectedDateStr).toLocaleDateString('th-TH', { weekday: 'long' })}
                  </p>
                </div>
                <button
                  onClick={() => navigateDate(1)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Status statistics indicator badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-[10px] font-black border border-emerald-100">
                  W/พร/คส (ทำงานปกติ): {normalCount} คน
                </span>
                <span className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-xl text-[10px] font-black border border-amber-100">
                  มาสาย: {lateCount} คน
                </span>
                <span className="px-3 py-1.5 bg-rose-50 text-rose-800 rounded-xl text-[10px] font-black border border-rose-100">
                  ขาด/ลืมเข้า/ลืมออก: {absentCount} คน
                </span>
              </div>
            </div>
          </div>

          {/* Master Daily Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                รายชื่อพนักงานปฏิบัติงานสนามงวดรายวัน
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                กดปุ่มสถานะสีเพื่อปรับสถานะ/เวลาปฏิบัติงาน หรือแก้ไขค่าเบี้ยเลี้ยงรายวันรายบุคคล
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs font-bold text-slate-700">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-slate-500">บุคลากร/บทบาท</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-500">สถานะลงเวลา</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-500">เวลาปฏิบัติงาน</th>
                    <th className="px-3 py-3 text-center font-bold text-slate-500">สาย / OT</th>
                    <th className="px-3 py-3 text-center font-bold text-slate-500">ค่าข้าว</th>
                    <th className="px-3 py-3 text-center font-bold text-slate-500">เบี้ยเที่ยว</th>
                    <th className="px-3 py-3 text-center font-bold text-slate-500">สวัสดิการอื่นๆ</th>
                    <th className="px-4 py-3 text-right pr-6 font-bold text-slate-500">เบี้ยเลี้ยงรวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 bg-white">
                  {filteredEmployees.map((emp) => {
                    const log = dayLogs[emp.id] || {
                      empId: emp.id,
                      status: 'ย',
                      timeIn: '',
                      timeOut: '',
                      ot: 0,
                      food: 0,
                      trip: 0,
                      other: 0,
                      otherMemo: '',
                      lateMinutes: 0,
                      credit: 0,
                      isLocked: false,
                    };
                    const st = GLOBAL_STATUS[log.status] || {
                      icon: '❓',
                      label: 'ไม่ระบุ',
                      bgColor: 'bg-slate-50',
                      textColor: 'text-slate-500',
                    };
                    const totalAllowRow = (log.food || 0) + (log.trip || 0) + (log.other || 0);

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-all">
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="text-slate-800 text-[11px] font-black">{emp.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold leading-none mt-1">
                              {emp.id} · {emp.role}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <button
                            onClick={() => handleOpenStatusModal(emp.id, log as DailyAttendance)}
                            className={`px-3 py-1.5 border rounded-xl text-[10px] font-black tracking-wide ${st.bgColor} ${st.textColor} cursor-pointer hover:scale-103 transition`}
                          >
                            <span>{st.icon}</span> <span className="ml-0.5">{log.status} : {st.label}</span>
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono">
                          {log.isLocked ? (
                            <span className="text-red-700 animate-pulse text-[10px]">🔒 LOCKED ขาดเวลา</span>
                          ) : log.timeIn ? (
                            `${log.timeIn} - ${log.timeOut}`
                          ) : (
                            <span className="text-slate-300 italic">ไม่ได้ตอกบัตร</span>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          {log.isLocked ? (
                            <span className="text-red-650">-</span>
                          ) : (
                            <div className="flex flex-col gap-0.5 text-[9px] font-black">
                              {log.lateMinutes > 0 && (
                                <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                  สาย {log.lateMinutes} นาที
                                </span>
                              )}
                              {log.ot > 0 && (
                                <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                  OT {log.ot} ชม.
                                </span>
                              )}
                              {log.lateMinutes === 0 && log.ot === 0 && '-'}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <input
                            type="number"
                            value={log.food}
                            onChange={(e) => handleQuickAllowance(emp.id, 'food', e.target.value)}
                            className="w-14 px-1 py-1 border border-slate-200 text-center bg-slate-50/50 rounded-lg focus:outline-none"
                          />
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <input
                            type="number"
                            value={log.trip}
                            onChange={(e) => handleQuickAllowance(emp.id, 'trip', e.target.value)}
                            className="w-14 px-1 py-1 border border-slate-200 text-center bg-slate-50/50 rounded-lg focus:outline-none"
                          />
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <button
                            onClick={() => handleOpenAllowModal(emp.id, log as DailyAttendance)}
                            className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-bold"
                          >
                            {log.other > 0 ? `฿${log.other}` : 'แก้ไขเพิ่ม'}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-right pr-6">
                          <p className="text-slate-800 font-extrabold">฿{totalAllowRow.toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400 font-bold">เครดิตสถิติ: {log.credit} แรง</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── SUMMARY MATRIX TAB ─── */}
      {activeTab === 'summary' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-black text-slate-700 uppercase">
              แผ่นสถิติรวมตลอดงวดบัญชีจ่าย (Matrix Attendance Visualizer)
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              แสดงสัญญลักษณ์สถานะการทำงาน 30 วัน ของคนงานในโครงการแต่ละวันเพื่อวิเคราะห์ความสม่ำเสมอ
            </p>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="min-w-full divide-y divide-slate-150 text-xs border-collapse font-bold text-slate-700">
              <thead className="bg-slate-50 sticky top-0 z-20">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 sticky left-0 bg-slate-50 z-30">พนักงาน</th>
                  <th className="px-3 py-3 text-center font-bold text-slate-500">วันสะสม (แรง)</th>
                  <th className="px-3 py-3 text-center font-bold text-slate-500">สาย (นาที)</th>
                  <th className="px-3 py-3 text-center font-bold text-slate-500">ขาด (วัน)</th>
                  {dates.map((d) => (
                    <th key={d} className="px-1.5 py-3 text-center border-l border-slate-200" style={{ minWidth: '28px' }}>
                      {new Date(d).getDate()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredEmployees.map((emp) => {
                  let activeDays = 0;
                  let lates = 0;
                  let absents = 0;

                  dates.forEach((d) => {
                    const l = attendanceData[d]?.[emp.id];
                    if (l) {
                      activeDays += l.credit;
                      lates += l.lateMinutes;
                      if (l.status === 'A') absents++;
                    }
                  });

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-black text-slate-800 sticky left-0 bg-white z-10 shadow-sm">
                        <p>{emp.name}</p>
                        <p className="text-[8px] text-slate-400 font-semibold">{emp.id}</p>
                      </td>
                      <td className="px-3 py-2.5 text-center text-emerald-700 font-black bg-emerald-50/10">
                        {activeDays} วัน
                      </td>
                      <td className="px-3 py-2.5 text-center text-amber-600 font-extrabold">{lates} ม.</td>
                      <td className="px-3 py-2.5 text-center text-rose-600 font-extrabold">{absents}</td>
                      {dates.map((d) => {
                        const l = (attendanceData[d]?.[emp.id] || { status: 'ย', isLocked: false }) as DailyAttendance;
                        let dotStyle = 'bg-slate-100 text-slate-400';
                        if (l.status === 'W') dotStyle = 'bg-emerald-500 text-white';
                        else if (l.status === 'L') dotStyle = 'bg-amber-500 text-white';
                        else if (l.status === 'A') dotStyle = 'bg-rose-500 text-white';
                        else if (l.isLocked) dotStyle = 'bg-red-650 text-white animate-pulse';

                        return (
                          <td key={d} className="p-0.5 text-center border-l border-slate-100">
                            <button
                              type="button"
                              onClick={() => handleOpenMatrixEdit(emp.id, d, l)}
                              className={`w-6 h-6 leading-6 inline-block rounded text-[9px] font-black cursor-pointer hover:scale-110 hover:brightness-95 active:scale-95 transition-all ${dotStyle}`}
                              title={`คลิกแก้ไข วันที่ ${d} ของ ${emp.name}`}
                            >
                              {l.status}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT STATUS & WORK TIME ─── */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[999] backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-xl animate-scale-in">
            <div className="flex items-center gap-2 text-red-700 mb-3">
              <Clock className="w-5 h-5" />
              <h3 className="text-sm font-extrabold text-slate-800">ปรับสถานะตอกเวลา และเวลางาน</h3>
            </div>
            <p className="text-[10px] text-slate-400 mb-4 font-semibold">
              รหัสพนักงาน: {selectedEmpId}
            </p>

            <div className="space-y-3.5 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-slate-500 mb-1">เลือกสถานะปฏิบัติงาน</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 focus:border-red-600"
                >
                  {Object.entries(GLOBAL_STATUS_CONFIG).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.icon} {key} : {info.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1">เวลาเข้างาน</label>
                  <input
                    type="text"
                    placeholder="08:00"
                    value={modalTimeIn}
                    onChange={(e) => setModalTimeIn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">เวลาออกงาน</label>
                  <input
                    type="text"
                    placeholder="17:00"
                    value={modalTimeOut}
                    onChange={(e) => setModalTimeOut(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">หน้างานที่ประจำการ</label>
                <select
                  value={modalProject}
                  onChange={(e) => setModalProject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800"
                >
                  {projects.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-5">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="py-2 rounded-xl bg-slate-100 hover:bg-slate-150 text-slate-500 font-bold transition text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveStatusModal}
                className="py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold transition text-xs"
              >
                บันทึกค่า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: OTHER ALLOWANCE ─── */}
      {isAllowModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[999] backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-xl animate-scale-in">
            <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <span>💰</span> ปรับเพิ่มสวัสดิการอื่นๆ รายวัน
            </h3>

            <div className="space-y-3.5 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1">ค่าข้าว (฿)</label>
                  <input
                    type="number"
                    value={allowFood}
                    onChange={(e) => setAllowFood(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">เบี้ยเที่ยว (฿)</label>
                  <input
                    type="number"
                    value={allowTrip}
                    onChange={(e) => setAllowTrip(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">สวัสดิการพิเศษอื่นๆ (฿)</label>
                <input
                  type="number"
                  value={allowOther}
                  onChange={(e) => setAllowOther(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">บันทึกช่วยจำสาเหตุที่จ่ายเพิ่ม</label>
                <input
                  type="text"
                  placeholder="เช่น ค่าทำงานในจุดเสี่ยงภัย, ค่าล่วงเวลากลางคืน"
                  value={allowMemo}
                  onChange={(e) => setAllowMemo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-5">
              <button
                onClick={() => setIsAllowModalOpen(false)}
                className="py-2 rounded-xl bg-slate-100 hover:bg-slate-150 text-slate-500 font-bold transition text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveAllowModal}
                className="py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold transition text-xs"
              >
                ยืนยันเซฟ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: UNIFIED MATRIX DAY EDIT ─── */}
      {isDayEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[999] backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 text-red-700 mb-3 border-b border-slate-100 pb-3">
              <Clock className="w-5 h-5" />
              <div>
                <h3 className="text-sm font-black text-slate-800">แก้ไขข้อมูลวันปฏิบัติงานรายวัน (Matrix Edit)</h3>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                  พนักงาน: {employees.find(e => e.id === selectedEmpId)?.name || selectedEmpId} ({selectedEmpId})
                </p>
                <p className="text-[10px] text-red-700 font-extrabold">
                  ประจำวันที่: {new Date(selectedEditDate).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-700 mt-4">
              {/* Row 1: Status */}
              <div>
                <label className="block text-slate-500 mb-1">สถานะตอกเวลาเข้า/ออกงาน</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black outline-none text-slate-800 focus:border-red-600"
                >
                  {Object.entries(GLOBAL_STATUS_CONFIG).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.icon} {key} : {info.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2: Clock Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">เวลาเข้างานจริง</label>
                  <input
                    type="text"
                    placeholder="08:00"
                    value={editTimeIn}
                    onChange={(e) => setEditTimeIn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-center font-bold outline-none text-slate-800 focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">เวลาออกงานจริง</label>
                  <input
                    type="text"
                    placeholder="17:00"
                    value={editTimeOut}
                    onChange={(e) => setEditTimeOut(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-center font-bold outline-none text-slate-800 focus:border-red-600"
                  />
                </div>
              </div>

              {/* Row 3: Daily Project site */}
              <div>
                <label className="block text-slate-500 mb-1">หน้างานประจำวัน / โครงการที่เข้าปฏิบัติงาน</label>
                <select
                  value={editProject}
                  onChange={(e) => setEditProject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800 focus:border-red-600"
                >
                  {projects.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 4: Welfare & Trip Allowances */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-slate-500 mb-1">ค่าข้าวสวัสดิการ (฿)</label>
                  <input
                    type="number"
                    value={editFood}
                    onChange={(e) => setEditFood(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-center font-black text-slate-800 outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">เบี้ยเที่ยวพนักงานขับรถ (฿)</label>
                  <input
                    type="number"
                    value={editTrip}
                    onChange={(e) => setEditTrip(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-center font-black text-slate-800 outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Row 5: Other allowances and Memo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">สวัสดิการพิเศษอื่นๆ (฿)</label>
                  <input
                    type="number"
                    value={editOther}
                    onChange={(e) => setEditOther(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800 focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">บันทึกช่วยจำการจ่ายพิเศษ</label>
                  <input
                    type="text"
                    placeholder="ระบุเหตุผล เช่น ค่าเข้ากะดึก"
                    value={editMemo}
                    onChange={(e) => setEditMemo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800 focus:border-red-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-6 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsDayEditModalOpen(false)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-150 text-slate-500 font-extrabold transition text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveDayEditModal}
                className="py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-extrabold transition text-xs cursor-pointer shadow-xs"
              >
                บันทึกประมวลผลข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
