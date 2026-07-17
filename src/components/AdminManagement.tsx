import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  DollarSign,
  Megaphone,
  Check,
  X,
  Plus,
  AlertCircle,
  Briefcase,
  Search,
  Lock,
  Calendar,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Employee, CashRequest, Announcement, LeaveRequest, CorrectionRequest, DailyAttendance } from '../types';

interface AdminManagementProps {
  employees: Employee[];
  attendanceData?: Record<string, Record<string, DailyAttendance>>;
  cashRequests: CashRequest[];
  announcements: Announcement[];
  projects: string[];
  leaves: LeaveRequest[];
  corrections: CorrectionRequest[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onApproveCashRequest: (id: string, status: 'approved' | 'rejected') => void;
  onAddAnnouncement: (ann: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onApproveLeave: (id: string, decision: 'approved' | 'rejected') => void;
  onApproveCorrection: (id: string, decision: 'approved' | 'rejected') => void;
}

export default function AdminManagement({
  employees,
  attendanceData,
  cashRequests,
  announcements,
  projects,
  leaves,
  corrections,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onApproveCashRequest,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onApproveLeave,
  onApproveCorrection,
}: AdminManagementProps) {
  const [subTab, setSubTab] = useState<'employees' | 'leave_approvals' | 'correction_approvals' | 'cash' | 'announcements'>('employees');

  // Employee CRUD States
  const [searchEmpQuery, setSearchEmpQuery] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'id' | 'name' | 'role' | 'project' | 'baseSalary' | 'status' | null>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Leave Approvals Filter States
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [leavePage, setLeavePage] = useState(1);

  // Correction Approvals Filter States
  const [correctionStatusFilter, setCorrectionStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [correctionSearch, setCorrectionSearch] = useState('');
  const [correctionPage, setCorrectionPage] = useState(1);

  // Form states for Employee Add/Edit
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('ช่างทั่วไป');
  const [formProject, setFormProject] = useState(projects[0] || 'โครงการทั่วไป');
  const [formSalary, setFormSalary] = useState(12000);
  const [formWorkHours, setFormWorkHours] = useState(8);

  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formWeeklyOffDay, setFormWeeklyOffDay] = useState('อาทิตย์');
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formIdCard, setFormIdCard] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formBankName, setFormBankName] = useState('');
  const [formBankBranch, setFormBankBranch] = useState('');
  const [formBankAccount, setFormBankAccount] = useState('');
  const [formProfileImage, setFormProfileImage] = useState('');
  const [formOtMultiplier, setFormOtMultiplier] = useState(1.5);
  const [formPermission, setFormPermission] = useState<'admin' | 'employee' | 'staff'>('employee');
  const [formLineUserId, setFormLineUserId] = useState('');
  const [formDivisor, setFormDivisor] = useState(30);

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annType, setAnnType] = useState<'info' | 'success' | 'warning'>('info');
  const [annBadge, setAnnBadge] = useState('INFO');

  // Open modal helper for adding/editing employee
  const openEmployeeModal = (emp: Employee | null = null) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormId(emp.id);
      setFormName(emp.name);
      setFormRole(emp.role);
      setFormProject(emp.project);
      setFormSalary(emp.baseSalary);
      setFormWorkHours(emp.workHoursPerDay);

      setFormStatus(emp.status || 'active');
      setFormWeeklyOffDay(emp.weeklyOffDay || 'อาทิตย์');
      setFormCompanyName(emp.companyName || '');
      setFormStartDate(emp.startDate || '');
      setFormPhone(emp.phone || '');
      setFormAddress(emp.address || '');
      setFormIdCard(emp.idCard || '');
      setFormBirthDate(emp.birthDate || '');
      setFormBankName(emp.bankName || '');
      setFormBankBranch(emp.bankBranch || '');
      setFormBankAccount(emp.bankAccount || '');
      setFormProfileImage(emp.profileImage || '');
      setFormOtMultiplier(emp.otMultiplier || 1.5);
      setFormPermission(emp.permission || 'employee');
      setFormLineUserId(emp.lineUserId || '');
      setFormDivisor(emp.divisor || 30);
    } else {
      setEditingEmployee(null);
      // Auto-generate numeric ID or keep blank
      setFormId('EMP' + String(employees.length + 101));
      setFormName('');
      setFormRole('ช่างทั่วไป');
      setFormProject(projects[0] || 'โครงการทั่วไป');
      setFormSalary(15000);
      setFormWorkHours(8);

      setFormStatus('active');
      setFormWeeklyOffDay('อาทิตย์');
      setFormCompanyName('');
      setFormStartDate('');
      setFormPhone('');
      setFormAddress('');
      setFormIdCard('');
      setFormBirthDate('');
      setFormBankName('');
      setFormBankBranch('');
      setFormBankAccount('');
      setFormProfileImage('');
      setFormOtMultiplier(1.5);
      setFormPermission('employee');
      setFormLineUserId('');
      setFormDivisor(30);
    }
    setIsEmployeeModalOpen(true);
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim() || !formName.trim()) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const employeeData: Employee = {
      id: formId.trim(),
      name: formName.trim(),
      role: formRole,
      project: formProject,
      baseSalary: Number(formSalary),
      divisor: Number(formDivisor),
      workHoursPerDay: Number(formWorkHours),
      quotas: editingEmployee?.quotas || { sick: 30, personal: 6, vacation: 6 },
      currentQuotas: editingEmployee?.currentQuotas || { sick: 30, personal: 6, vacation: 6 },

      status: formStatus,
      weeklyOffDay: formWeeklyOffDay,
      companyName: formCompanyName.trim(),
      startDate: formStartDate,
      phone: formPhone.trim(),
      address: formAddress.trim(),
      idCard: formIdCard.trim(),
      birthDate: formBirthDate,
      bankName: formBankName.trim(),
      bankBranch: formBankBranch.trim(),
      bankAccount: formBankAccount.trim(),
      profileImage: formProfileImage.trim(),
      otMultiplier: Number(formOtMultiplier),
      permission: formPermission,
      lineUserId: formLineUserId.trim(),
    };

    if (editingEmployee) {
      onUpdateEmployee(employeeData);
    } else {
      // Check if ID already exists
      if (employees.some((emp) => emp.id === employeeData.id)) {
        alert('รหัสพนักงานซ้ำซ้อนในระบบ กรุณาใช้รหัสอื่น');
        return;
      }
      onAddEmployee(employeeData);
    }
    setIsEmployeeModalOpen(false);
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) {
      alert('กรุณาระบุข้อความประกาศ');
      return;
    }
    const newAnn: Announcement = {
      id: 'ann-' + Date.now(),
      title: annTitle.trim(),
      time: 'เพิ่งประกาศเมื่อสักครู่',
      type: annType,
      badge: annBadge.toUpperCase().trim() || 'NEW',
    };
    onAddAnnouncement(newAnn);
    setAnnTitle('');
    setAnnBadge('NEW');
  };

  // Helper to resolve real-time project for an employee
  const getRealTimeProject = (empId: string, defaultProject: string): string => {
    if (!attendanceData) return defaultProject;
    
    // Find all dates where this employee has a recorded project
    const datesWithRecords = Object.keys(attendanceData).filter(
      (dateStr) => attendanceData[dateStr]?.[empId]?.project
    );
    
    if (datesWithRecords.length === 0) {
      return defaultProject;
    }
    
    // Sort dates descending to find the most recent recorded project
    datesWithRecords.sort((a, b) => b.localeCompare(a));
    const latestDate = datesWithRecords[0];
    return attendanceData[latestDate][empId].project || defaultProject;
  };

  const handleSort = (field: 'id' | 'name' | 'role' | 'project' | 'baseSalary' | 'status') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (field: 'id' | 'name' | 'role' | 'project' | 'baseSalary' | 'status') => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition animate-fade-in" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-red-650 shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-red-650 shrink-0" />
    );
  };

  // Filtered employees listing using real-time project and status
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchEmpQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchEmpQuery.toLowerCase());
    
    const realTimeProj = getRealTimeProject(emp.id, emp.project);
    const matchesProject = selectedProjectFilter === 'all' || realTimeProj === selectedProjectFilter;
    
    const empStatus = emp.status || 'active';
    const matchesStatus = selectedStatusFilter === 'all' || empStatus === selectedStatusFilter;
    
    return matchesSearch && matchesProject && matchesStatus;
  });

  // Sorting employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortField) return 0;
    
    let aVal: any;
    let bVal: any;
    
    if (sortField === 'project') {
      aVal = getRealTimeProject(a.id, a.project);
      bVal = getRealTimeProject(b.id, b.project);
    } else if (sortField === 'status') {
      aVal = a.status || 'active';
      bVal = b.status || 'active';
    } else {
      aVal = a[sortField];
      bVal = b[sortField];
    }
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
    }
    if (typeof bVal === 'string') {
      bVal = bVal.toLowerCase();
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination calculation
  const itemsPerPage = 15;
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = sortedEmployees.slice(startIndex, startIndex + itemsPerPage);

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

  const leavesPerPage = 10;
  const totalLeavePages = Math.ceil(filteredLeaves.length / leavesPerPage);
  const currentLeaves = filteredLeaves.slice((leavePage - 1) * leavesPerPage, leavePage * leavesPerPage);

  const correctionsPerPage = 10;
  const totalCorrectionPages = Math.ceil(filteredCorrections.length / correctionsPerPage);
  const currentCorrections = filteredCorrections.slice((correctionPage - 1) * correctionsPerPage, correctionPage * correctionsPerPage);

  // Pending request counts for badges
  const pendingLeavesCount = leaves.filter((l) => l.status === 'pending').length;
  const pendingCorrectionsCount = corrections.filter((c) => c.status === 'pending').length;
  const pendingCashCount = cashRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Tab Menu Header for Admin Tools */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap gap-1.5">
        <button
          onClick={() => setSubTab('employees')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            subTab === 'employees'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>จัดการรายชื่อพนักงาน & สิทธิ์</span>
        </button>

        <button
          onClick={() => setSubTab('leave_approvals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition relative cursor-pointer ${
            subTab === 'leave_approvals'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>อนุมัติวันหยุด/ใบลางาน</span>
          {pendingLeavesCount > 0 && (
            <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
              {pendingLeavesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('correction_approvals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition relative cursor-pointer ${
            subTab === 'correction_approvals'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>อนุมัติแก้ไขเวลางาน</span>
          {pendingCorrectionsCount > 0 && (
            <span className="bg-yellow-500 text-slate-900 text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
              {pendingCorrectionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('cash')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition relative cursor-pointer ${
            subTab === 'cash'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>อนุมัติเบิกเงินสำรอง</span>
          {pendingCashCount > 0 && (
            <span className="bg-amber-500 text-slate-950 text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
              {pendingCashCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('announcements')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            subTab === 'announcements'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>ประกาศระบบ & ข่าวสาร</span>
        </button>
      </div>

      {/* SUB-TAB 1: Employees CRUD List */}
      {subTab === 'employees' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-800">รายชื่อและสิทธิ์กำลังพลหน้างาน</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  เพิ่ม ลบ หรือแก้ไขข้อมูลพื้นฐานโครงการพนักงานสนามทั้งหมด
                </p>
              </div>
              <button
                onClick={() => openEmployeeModal()}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer self-start"
              >
                <UserPlus className="w-4 h-4" />
                <span>ลงทะเบียนพนักงานใหม่</span>
              </button>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchEmpQuery}
                  onChange={(e) => {
                    setSearchEmpQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="ค้นหาชื่อ หรือรหัสพนักงาน เช่น คมสันต์, EMP102..."
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-red-500 focus:bg-white transition"
                />
              </div>

              <select
                value={selectedProjectFilter}
                onChange={(e) => {
                  setSelectedProjectFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 outline-none focus:border-red-500 focus:bg-white transition cursor-pointer"
              >
                <option value="all">เลือกดูพนักงาน: ทุกไซด์งานก่อสร้าง</option>
                {projects.map((proj) => (
                  <option key={proj} value={proj}>
                    {proj}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => {
                  setSelectedStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 outline-none focus:border-red-500 focus:bg-white transition cursor-pointer"
              >
                <option value="all">เลือกดูพนักงาน: ทุกสถานะงาน</option>
                <option value="active">🟢 ปฏิบัติงานปกติ (Active)</option>
                <option value="inactive">🔴 พ้นสภาพพนักงาน (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Employees Table List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {filteredEmployees.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center space-y-2">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-400">ไม่พบข้อมูลพนักงานที่ตรงตามเงื่อนไขการค้นหา</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-black border-b border-slate-200 uppercase tracking-wider text-[10px] select-none">
                        <th 
                          onClick={() => handleSort('id')}
                          className="py-3 px-4 w-[115px] cursor-pointer group hover:bg-slate-100/50 transition"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>รหัสพนักงาน</span>
                            {renderSortIcon('id')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('name')}
                          className="py-3 px-4 min-w-[150px] cursor-pointer group hover:bg-slate-100/50 transition"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>ชื่อ-นามสกุล</span>
                            {renderSortIcon('name')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('role')}
                          className="py-3 px-4 min-w-[120px] cursor-pointer group hover:bg-slate-100/50 transition"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>บทบาทหน้าที่</span>
                            {renderSortIcon('role')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('project')}
                          className="py-3 px-4 min-w-[150px] cursor-pointer group hover:bg-slate-100/50 transition"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>โครงการ/ไซด์งาน</span>
                            {renderSortIcon('project')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('baseSalary')}
                          className="py-3 px-4 text-right min-w-[110px] cursor-pointer group hover:bg-slate-100/50 transition"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>ฐานอัตราจ้าง</span>
                            {renderSortIcon('baseSalary')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('status')}
                          className="py-3 px-4 text-center min-w-[110px] cursor-pointer group hover:bg-slate-100/50 transition"
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <span>สถานะงาน</span>
                            {renderSortIcon('status')}
                          </div>
                        </th>
                        <th className="py-3 px-4 text-center">โควตาวันลาคงเหลือ (ป่วย / กิจ / พักร้อน)</th>
                        <th className="py-3 px-4 text-right w-[100px]">ดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedEmployees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition duration-150">
                          <td className="py-3.5 px-4 font-mono font-black text-red-700">
                            <span className="px-2.5 py-1 bg-red-50 rounded-lg text-[10px] border border-red-100">
                              {emp.id}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-800">
                            คุณ{emp.name}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-600">
                            {emp.role}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-700">
                            <span className="px-2.5 py-1 bg-slate-50 text-slate-700 rounded-lg text-[11px] border border-slate-150">
                              {getRealTimeProject(emp.id, emp.project)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-800 font-mono text-right">
                            ฿{emp.baseSalary.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              (emp.status || 'active') === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                                : 'bg-rose-50 text-rose-700 border border-rose-150'
                            }`}>
                              {(emp.status || 'active') === 'active' ? '🟢 Active' : '🔴 Inactive'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex gap-1.5 justify-center">
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md text-[9px] font-bold border border-rose-100">
                                ป่วย: {emp.currentQuotas?.sick ?? emp.quotas?.sick}/{emp.quotas?.sick ?? 30}
                              </span>
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[9px] font-bold border border-amber-100">
                                กิจ: {emp.currentQuotas?.personal ?? emp.quotas?.personal}/{emp.quotas?.personal ?? 6}
                              </span>
                              <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md text-[9px] font-bold border border-violet-100">
                                พักร้อน: {emp.currentQuotas?.vacation ?? emp.quotas?.vacation}/{emp.quotas?.vacation ?? 6}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => openEmployeeModal(emp)}
                                className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-700 border border-slate-150 rounded-lg cursor-pointer transition"
                                title="แก้ไขข้อมูลพนักงาน"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`คุณต้องการลบรายชื่อพนักงานคุณ ${emp.name} ออกจากระบบถาวรหรือไม่?`)) {
                                    onDeleteEmployee(emp.id);
                                  }
                                }}
                                className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-150 rounded-lg cursor-pointer transition"
                                title="ลบรายชื่อ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs font-bold text-slate-600">
                    <div>
                      แสดงผลพนักงาน {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredEmployees.length)} จากทั้งหมด {filteredEmployees.length} คน
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer text-[11px]"
                      >
                        ก่อนหน้า
                      </button>
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        if (totalPages > 6 && Math.abs(currentPage - pageNum) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                          if (pageNum === 2 || pageNum === totalPages - 1) {
                            return <span key={idx} className="px-1 text-slate-400">...</span>;
                          }
                          return null;
                        }
                        return (
                          <button
                            key={idx}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer text-[11px] ${
                              currentPage === pageNum
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer text-[11px]"
                      >
                        ถัดไป
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB: Leave Approvals */}
      {subTab === 'leave_approvals' && (
        <div className="space-y-6">
          {/* Pending Leaves Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-650" />
                <span>คำขออนุมัติลางาน / วันหยุดที่รอพิจารณา (Pending Leave Requests)</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                รายการคำร้องขอลาหยุดงานของบุคลากรที่อยู่ระหว่างรอผู้ดูแลอนุมัติปรับโควตาและสถานะการทำงาน
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              {leaves.filter(l => l.status === 'pending').length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-bold">
                  🎉 ไม่มีคำขออนุมัติลาหยุดงานที่ค้างพิจารณา
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leaves.filter(l => l.status === 'pending').map((item) => {
                    const emp = employees.find((e) => e.id === item.empId);
                    const empName = emp ? emp.name : 'ไม่พบข้อมูลพนักงาน';
                    return (
                      <div key={item.id} className="p-4 bg-rose-50/40 border border-rose-100 rounded-xl space-y-2.5 text-xs font-bold">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded">
                            {mapLeaveType(item.type)}
                          </span>
                          <span className="text-slate-400 font-mono">{item.submittedAt}</span>
                        </div>
                        <div className="text-slate-700 font-medium">
                          <strong className="text-slate-900">พนักงาน:</strong> คุณ{empName} ({item.empId}) <br />
                          <strong className="text-slate-900">ช่วงวันที่ขอหยุด:</strong> {item.start} ถึง {item.end} <br />
                          <strong className="text-slate-900">เหตุผลเพิ่มเติม:</strong> "{item.reason}"
                        </div>
                        {emp && (
                          <div className="bg-white/80 p-2 rounded-lg border border-slate-100 text-[10px] flex justify-between">
                            <span>ป่วยคงเหลือ: {emp.currentQuotas?.sick ?? emp.quotas?.sick} วัน</span>
                            <span>กิจคงเหลือ: {emp.currentQuotas?.personal ?? emp.quotas?.personal} วัน</span>
                            <span>พักร้อนคงเหลือ: {emp.currentQuotas?.vacation ?? emp.quotas?.vacation} วัน</span>
                          </div>
                        )}
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={() => onApproveLeave(item.id, 'rejected')}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-extrabold flex items-center gap-1 cursor-pointer transition text-[11px]"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>ปฏิเสธ</span>
                          </button>
                          <button
                            onClick={() => onApproveLeave(item.id, 'approved')}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-extrabold flex items-center gap-1 cursor-pointer transition text-[11px] shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>อนุมัติและหักโควตา</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* All Leaves Log Table with filter & search */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  ประวัติใบลาทั้งหมด (Leave Log History)
                </h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">ค้นหาและตรวจสอบสถานะการลาย้อนหลังของกำลังพลทั้งหมด</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search in leaves */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 pointer-events-none">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={leaveSearch}
                    onChange={(e) => {
                      setLeaveSearch(e.target.value);
                      setLeavePage(1);
                    }}
                    placeholder="ค้นหาชื่อ, รหัส, เหตุผล..."
                    className="bg-white border border-slate-200 rounded-lg pl-7.5 pr-3 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-red-500 w-[160px] sm:w-[200px]"
                  />
                </div>

                {/* Status select filter */}
                <select
                  value={leaveStatusFilter}
                  onChange={(e) => {
                    setLeaveStatusFilter(e.target.value as any);
                    setLeavePage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-600 outline-none cursor-pointer"
                >
                  <option value="all">แสดงสถานะทั้งหมด</option>
                  <option value="pending">⏳ รออนุมัติ</option>
                  <option value="approved">✅ อนุมัติแล้ว</option>
                  <option value="rejected">❌ ปฏิเสธ</option>
                </select>
              </div>
            </div>

            {filteredLeaves.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-bold">ไม่พบบันทึกตรงตามเงื่อนไขที่ค้นหา</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-black border-b border-slate-100 uppercase tracking-wider text-[9px]">
                        <th className="py-3 px-4">รหัสพนักงาน</th>
                        <th className="py-3 px-4">ชื่อพนักงาน</th>
                        <th className="py-3 px-4">ประเภทวันหยุด/การลา</th>
                        <th className="py-3 px-4">วันที่ลาหยุด</th>
                        <th className="py-3 px-4">เหตุผลในการลา</th>
                        <th className="py-3 px-4">ยื่นเมื่อ</th>
                        <th className="py-3 px-4 text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentLeaves.map((item) => {
                        const emp = employees.find((e) => e.id === item.empId);
                        const empName = emp ? emp.name : 'ไม่พบข้อมูล';
                        let statusBadge = '';
                        if (item.status === 'pending') statusBadge = 'bg-yellow-50 text-yellow-800 border-yellow-100';
                        else if (item.status === 'approved') statusBadge = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                        else if (item.status === 'rejected') statusBadge = 'bg-slate-100 text-slate-500 border-slate-200';

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition duration-100 font-bold">
                            <td className="py-3 px-4 text-red-700 font-mono">{item.empId}</td>
                            <td className="py-3 px-4 text-slate-800">คุณ{empName}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                                {mapLeaveType(item.type)}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600">{item.start} ถึง {item.end}</td>
                            <td className="py-3 px-4 font-normal text-slate-500 italic max-w-xs truncate" title={item.reason}>
                              "{item.reason}"
                            </td>
                            <td className="py-3 px-4 text-[10px] text-slate-400 font-mono">{item.submittedAt}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-black ${statusBadge}`}>
                                {item.status === 'pending' ? '⏳ รออนุมัติ' : item.status === 'approved' ? '✓ อนุมัติแล้ว' : '✕ ปฏิเสธ'}
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
                  <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <div>
                      แสดงรายการ {((leavePage - 1) * leavesPerPage) + 1} - {Math.min(leavePage * leavesPerPage, filteredLeaves.length)} จากทั้งหมด {filteredLeaves.length} รายการ
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={leavePage === 1}
                        onClick={() => setLeavePage((prev) => Math.max(prev - 1, 1))}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
                      >
                        ก่อนหน้า
                      </button>
                      <span className="px-2 font-mono text-slate-700">หน้า {leavePage} / {totalLeavePages}</span>
                      <button
                        disabled={leavePage === totalLeavePages}
                        onClick={() => setLeavePage((prev) => Math.min(prev + 1, totalLeavePages))}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
                      >
                        ถัดไป
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB: Correction Approvals */}
      {subTab === 'correction_approvals' && (
        <div className="space-y-6">
          {/* Pending Corrections Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span>คำขอแก้ไขเวลาลงบันทึกงานที่รอพิจารณา (Pending Time Correction Requests)</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                รายการคำร้องขอปรับเวลางานจากพนักงาน เนื่องจากตอกบัตรผิดพลาด ลืมตอกบัตร หรือปัญหาเครื่องรับสัญญาณ
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              {corrections.filter(c => c.status === 'pending').length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-bold">
                  🎉 ไม่มีคำขอแก้ไขเวลางานค้างพิจารณา
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {corrections.filter(c => c.status === 'pending').map((item) => {
                    const emp = employees.find((e) => e.id === item.empId);
                    const empName = emp ? emp.name : 'ไม่พบข้อมูล';
                    const parts = item.btnId.split('-'); // btn-fix-YYYY-MM-DD
                    const targetDate = parts.slice(2).join('-'); // YYYY-MM-DD
                    return (
                      <div key={item.id} className="p-4 bg-yellow-50/40 border border-yellow-100 rounded-xl space-y-2.5 text-xs font-bold">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                            คำขอแก้ไขเวลางาน
                          </span>
                          <span className="text-slate-400 font-mono">{item.submittedAt}</span>
                        </div>
                        <div className="text-slate-700 font-medium">
                          <strong className="text-slate-900">พนักงาน:</strong> คุณ{empName} ({item.empId}) <br />
                          <strong className="text-slate-900">วันที่ทำงานต้องการแก้ไข:</strong> {targetDate} <br />
                          <strong className="text-slate-900">เวลาเสนอแก้ไขเป็น:</strong>{' '}
                          <span className="text-emerald-700 font-mono">{item.timeIn || 'ไม่ได้ตอก'} ถึง {item.timeOut || 'ไม่ได้ตอก'}</span> <br />
                          <strong className="text-slate-900">เหตุผลประกอบ:</strong> "{item.reason}"
                        </div>
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={() => onApproveCorrection(item.id, 'rejected')}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-extrabold flex items-center gap-1 cursor-pointer transition text-[11px]"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>ปฏิเสธ</span>
                          </button>
                          <button
                            onClick={() => onApproveCorrection(item.id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-extrabold flex items-center gap-1 cursor-pointer transition text-[11px] shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>อนุมัติแก้และปลดล็อก</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* All Corrections History Log */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  ประวัติแก้ไขเวลาทั้งหมด (Time Correction Log History)
                </h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">ค้นหา ตรวจสอบบันทึกการขอแก้ไขเวลาการตอกบัตรเข้างาน</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search in corrections */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 pointer-events-none">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={correctionSearch}
                    onChange={(e) => {
                      setCorrectionSearch(e.target.value);
                      setCorrectionPage(1);
                    }}
                    placeholder="ค้นหาชื่อ, รหัส, เหตุผล..."
                    className="bg-white border border-slate-200 rounded-lg pl-7.5 pr-3 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-red-500 w-[160px] sm:w-[200px]"
                  />
                </div>

                {/* Status select filter */}
                <select
                  value={correctionStatusFilter}
                  onChange={(e) => {
                    setCorrectionStatusFilter(e.target.value as any);
                    setCorrectionPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-600 outline-none cursor-pointer"
                >
                  <option value="all">แสดงสถานะทั้งหมด</option>
                  <option value="pending">⏳ รออนุมัติ</option>
                  <option value="approved">✅ อนุมัติแล้ว</option>
                  <option value="rejected">❌ ปฏิเสธ</option>
                </select>
              </div>
            </div>

            {filteredCorrections.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-bold">ไม่พบบันทึกตรงตามเงื่อนไขที่ค้นหา</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-black border-b border-slate-100 uppercase tracking-wider text-[9px]">
                        <th className="py-3 px-4">รหัสพนักงาน</th>
                        <th className="py-3 px-4">ชื่อพนักงาน</th>
                        <th className="py-3 px-4">วันที่ทำงานต้องการแก้ไข</th>
                        <th className="py-3 px-4">เวลาที่ขอแก้ไขเป็น</th>
                        <th className="py-3 px-4">เหตุผลขอแก้ไข</th>
                        <th className="py-3 px-4">ยื่นเมื่อ</th>
                        <th className="py-3 px-4 text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentCorrections.map((item) => {
                        const emp = employees.find((e) => e.id === item.empId);
                        const empName = emp ? emp.name : 'ไม่พบข้อมูล';
                        const parts = item.btnId.split('-'); // btn-fix-YYYY-MM-DD
                        const targetDate = parts.slice(2).join('-'); // YYYY-MM-DD
                        let statusBadge = '';
                        if (item.status === 'pending') statusBadge = 'bg-yellow-50 text-yellow-800 border-yellow-100';
                        else if (item.status === 'approved') statusBadge = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                        else if (item.status === 'rejected') statusBadge = 'bg-slate-100 text-slate-500 border-slate-200';

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition duration-100 font-bold">
                            <td className="py-3 px-4 text-red-700 font-mono">{item.empId}</td>
                            <td className="py-3 px-4 text-slate-800">คุณ{empName}</td>
                            <td className="py-3 px-4 font-mono text-slate-600">{targetDate}</td>
                            <td className="py-3 px-4 font-mono text-emerald-700">{item.timeIn || 'ไม่ได้ตอก'} ถึง {item.timeOut || 'ไม่ได้ตอก'}</td>
                            <td className="py-3 px-4 font-normal text-slate-500 italic max-w-xs truncate" title={item.reason}>
                              "{item.reason}"
                            </td>
                            <td className="py-3 px-4 text-[10px] text-slate-400 font-mono">{item.submittedAt}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-black ${statusBadge}`}>
                                {item.status === 'pending' ? '⏳ รออนุมัติ' : item.status === 'approved' ? '✓ อนุมัติแล้ว' : '✕ ปฏิเสธ'}
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
                  <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <div>
                      แสดงรายการ {((correctionPage - 1) * correctionsPerPage) + 1} - {Math.min(correctionPage * correctionsPerPage, filteredCorrections.length)} จากทั้งหมด {filteredCorrections.length} รายการ
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={correctionPage === 1}
                        onClick={() => setCorrectionPage((prev) => Math.max(prev - 1, 1))}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
                      >
                        ก่อนหน้า
                      </button>
                      <span className="px-2 font-mono text-slate-700">หน้า {correctionPage} / {totalCorrectionPages}</span>
                      <button
                        disabled={correctionPage === totalCorrectionPages}
                        onClick={() => setCorrectionPage((prev) => Math.min(prev + 1, totalCorrectionPages))}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
                      >
                        ถัดไป
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Petty Cash Approval Workflow */}
      {subTab === 'cash' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-800">อนุมัติคำขอเบิกเงินสะสมสำรอง (Petty Cash & Advances)</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              ตรวจพิจารณาอนุมัติคำขอเบิกเงินกลางงวดของพนักงานสนามเพื่อความคล่องตัวในสนาม
            </p>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3.5">
            {cashRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-bold">
                🎉 ยอดเยี่ยม! ไม่มีคำขอเบิกเงินสำรองค้างอนุมัติในรอบการคำนวณขณะนี้
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-black border-b border-slate-100 uppercase tracking-wider text-[9px]">
                      <th className="py-3 px-4">วันที่ยื่นเรื่อง</th>
                      <th className="py-3 px-4">ผู้ยื่นเรื่อง (รหัส)</th>
                      <th className="py-3 px-4">จำนวนยอดเงินเบิก</th>
                      <th className="py-3 px-4">ประเภทเงื่อนไข</th>
                      <th className="py-3 px-4 text-center">สถานะผลคำขอ</th>
                      <th className="py-3 px-4 text-right">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cashRequests.map((req) => {
                      const empName = employees.find((e) => e.id === req.empId)?.name || req.empId;
                      return (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">{req.submittedAt}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-700">
                            คุณ{empName} <span className="text-[10px] text-slate-400 font-normal">({req.empId})</span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900 font-mono text-xs">
                            ฿{req.amount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 font-bold">
                            {req.type === 'RECURRING' ? (
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[9px]">
                                ต่อเนื่องทุกเดือน
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px]">
                                เฉพาะเดือนนี้ครั้งเดียว
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold">
                            {req.status === 'pending' && (
                              <span className="px-2 py-1 bg-yellow-50 text-yellow-800 rounded-full text-[9px] border border-yellow-200">
                                รอดำเนินการ
                              </span>
                            )}
                            {req.status === 'approved' && (
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[9px] border border-emerald-200">
                                ✓ อนุมัติสำเร็จ
                              </span>
                            )}
                            {req.status === 'rejected' && (
                              <span className="px-2 py-1 bg-slate-50 text-slate-500 rounded-full text-[9px] border border-slate-200">
                                ✕ ปฏิเสธคำขอ
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {req.status === 'pending' ? (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => onApproveCashRequest(req.id, 'rejected')}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-lg cursor-pointer transition text-[10px]"
                                >
                                  ปฏิเสธ
                                </button>
                                <button
                                  onClick={() => onApproveCashRequest(req.id, 'approved')}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg shadow-xs cursor-pointer transition text-[10px]"
                                >
                                  อนุมัติจ่าย
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold">ดำเนินการเรียบร้อย</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Bulletin Board Announcements notice creation */}
      {subTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Announcement Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-red-600" />
              <h3 className="font-extrabold text-xs text-slate-800 uppercase">สร้างประกาศข่าวสารใหม่</h3>
            </div>

            <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">
                  ข้อความประชาสัมพันธ์หลัก <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="ระบุข้อความ เช่น ประกาศวันหยุดประเพณีสงกรานต์วันที่..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold focus:outline-none focus:border-red-500 bg-slate-50 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">
                    ประเภทการเน้นสี
                  </label>
                  <select
                    value={annType}
                    onChange={(e) => setAnnType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer bg-slate-50"
                  >
                    <option value="info">สีฟ้า (ข้อมูลทั่วไป)</option>
                    <option value="success">สีเขียว (ข่าวดี/สิทธิพิเศษ)</option>
                    <option value="warning">สีส้ม (แจ้งเตือนด่วน)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">
                    ข้อความป้ายกำกับ
                  </label>
                  <input
                    type="text"
                    required
                    value={annBadge}
                    onChange={(e) => setAnnBadge(e.target.value)}
                    placeholder="เช่น NEW, OT, ประกาศ"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 outline-none bg-slate-50 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>เผยแพร่ประกาศนี้</span>
              </button>
            </form>
          </div>

          {/* List of active notices */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 lg:col-span-2">
            <div>
              <h3 className="text-sm font-black text-slate-800">รายการประกาศข่าวสารที่ใช้งานอยู่ขณะนี้</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                ประกาศเหล่านี้จะแสดงบนหน้าแรกของหน้าพนักงานทุกคนโดยอัตโนมัติ
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {announcements.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-bold">
                  ไม่มีหัวข้อประกาศทำงานขณะนี้
                </div>
              ) : (
                announcements.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4 items-start">
                    <span
                      className={`px-2 py-0.5 rounded font-black text-[9px] tracking-wide shrink-0 ${
                        item.type === 'info'
                          ? 'bg-blue-100 text-blue-800'
                          : item.type === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-850'
                      }`}
                    >
                      {item.badge}
                    </span>
                    <div className="flex-grow space-y-1">
                      <p className="font-bold text-xs text-slate-800 leading-snug">{item.title}</p>
                      <p className="text-[9px] text-slate-400 font-bold">{item.time}</p>
                    </div>
                    <button
                      onClick={() => onDeleteAnnouncement(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="ลบหัวข้อประกาศ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Employee Modal: Register/Edit */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[1000] p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5 animate-slide-up">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800">
                {editingEmployee ? `แก้ไขข้อมูลพนักงาน: คุณ${formName}` : 'ลงทะเบียนพนักงานสนามใหม่'}
              </h3>
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer text-sm"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEmployeeSubmit} className="space-y-5">
              <div className="max-h-[65vh] overflow-y-auto pr-2 space-y-5">
                {/* 1. ข้อมูลส่วนตัวทั่วไป (Personal & Profile) */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-red-600 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    👤 ข้อมูลส่วนตัวและโปรไฟล์ (Personal Profile)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        รหัสพนักงาน <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={!!editingEmployee}
                        value={formId}
                        onChange={(e) => setFormId(e.target.value)}
                        placeholder="เช่น EMP101"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-black uppercase text-slate-800 bg-slate-50 disabled:bg-slate-100 outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        ชื่อ-นามสกุล <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="เช่น สมจิต ใจดี"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        เลขบัตรประชาชน (13 หลัก)
                      </label>
                      <input
                        type="text"
                        maxLength={13}
                        value={formIdCard}
                        onChange={(e) => setFormIdCard(e.target.value.replace(/\D/g, ''))}
                        placeholder="เช่น 1234567890123"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        วันเดือนปีเกิด
                      </label>
                      <input
                        type="date"
                        value={formBirthDate}
                        onChange={(e) => setFormBirthDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        เบอร์โทรศัพท์
                      </label>
                      <input
                        type="text"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="เช่น 081-234-5678"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        ลิ้งภาพโปรไฟล์ URL
                      </label>
                      <input
                        type="text"
                        value={formProfileImage}
                        onChange={(e) => setFormProfileImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Line User ID
                      </label>
                      <input
                        type="text"
                        value={formLineUserId}
                        onChange={(e) => setFormLineUserId(e.target.value)}
                        placeholder="U1234567890abcdef1234567890abcdef"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        ที่อยู่ปัจจุบัน
                      </label>
                      <textarea
                        rows={2}
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        placeholder="กรอกบ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. ข้อมูลองค์กรและสัญญาจ้าง (Employment Info) */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[11px] font-black text-red-600 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    🏢 ข้อมูลองค์กรและการจ้างงาน (Employment Conditions)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        ตำแหน่งงาน
                      </label>
                      <input
                        type="text"
                        required
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                        placeholder="เช่น วิศวกร, ช่างเชื่อม"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        ประจำไซด์งาน/โครงการ
                      </label>
                      <select
                        value={formProject}
                        onChange={(e) => setFormProject(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition cursor-pointer"
                      >
                        {projects.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        ชื่อบริษัทต้นสังกัด
                      </label>
                      <input
                        type="text"
                        value={formCompanyName}
                        onChange={(e) => setFormCompanyName(e.target.value)}
                        placeholder="เช่น บจก. พีพีที คอนสตรัคชั่น"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        วันที่เริ่มเข้าทำงาน
                      </label>
                      <input
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        วันหยุดประจำสัปดาห์
                      </label>
                      <select
                        value={formWeeklyOffDay}
                        onChange={(e) => setFormWeeklyOffDay(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition cursor-pointer"
                      >
                        <option value="อาทิตย์">วันอาทิตย์ (Sunday)</option>
                        <option value="เสาร์">วันเสาร์ (Saturday)</option>
                        <option value="จันทร์">วันจันทร์ (Monday)</option>
                        <option value="อังคาร">วันอังคาร (Tuesday)</option>
                        <option value="พุธ">วันพุธ (Wednesday)</option>
                        <option value="พฤหัสบดี">วันพฤหัสบดี (Thursday)</option>
                        <option value="ศุกร์">วันศุกร์ (Friday)</option>
                        <option value="ไม่มี">ไม่มีวันหยุดประจำ (No Fixed Weekly Off)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        สถานะพนักงาน
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition cursor-pointer"
                      >
                        <option value="active">🟢 ปฏิบัติงานปกติ (Active)</option>
                        <option value="inactive">🔴 พ้นสภาพพนักงาน (Inactive)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        สิทธิ์การเข้าใช้งานระบบ (Application Permission)
                      </label>
                      <select
                        value={formPermission}
                        onChange={(e) => setFormPermission(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-750 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition cursor-pointer"
                      >
                        <option value="employee">👷 พนักงานหน้าไซด์งานปกติ (Employee)</option>
                        <option value="staff">📋 หัวหน้างาน / โฟร์แมนหน้างาน (Staff / Foreman)</option>
                        <option value="admin">🔑 ผู้ควบคุมระบบส่วนกลาง (Admin)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. ข้อมูลคำนวณรายได้และบัญชีธนาคาร (Payroll & Banking) */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[11px] font-black text-red-600 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    🪙 บัญชีรับเงินและข้อมูลคำนวณรายได้ (Payroll & Bank Account)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        ฐานเงินเดือนปกติ (บาท)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formSalary}
                        onChange={(e) => setFormSalary(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-850 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        ตัวหารค่าแรง (คิดอัตรารายวัน)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="31"
                        value={formDivisor}
                        onChange={(e) => setFormDivisor(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-850 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        ชั่วโมงทำงานต่อวัน
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="24"
                        value={formWorkHours}
                        onChange={(e) => setFormWorkHours(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-850 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        ตัวคูณอัตราโอที (OT Multiplier)
                      </label>
                      <input
                        type="number"
                        required
                        step="0.1"
                        min="1"
                        max="3"
                        value={formOtMultiplier}
                        onChange={(e) => setFormOtMultiplier(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-850 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        ชื่อธนาคาร
                      </label>
                      <input
                        type="text"
                        value={formBankName}
                        onChange={(e) => setFormBankName(e.target.value)}
                        placeholder="เช่น กสิกรไทย, ไทยพาณิชย์"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        สาขาธนาคาร
                      </label>
                      <input
                        type="text"
                        value={formBankBranch}
                        onChange={(e) => setFormBankBranch(e.target.value)}
                        placeholder="เช่น สาขาลาดพร้าว"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        หมายเลขบัญชีธนาคาร
                      </label>
                      <input
                        type="text"
                        value={formBankAccount}
                        onChange={(e) => setFormBankAccount(e.target.value)}
                        placeholder="เช่น 123-4-56789-0"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none focus:border-red-650 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer transition shadow-xs"
                >
                  {editingEmployee ? 'บันทึกการแก้ไขพนักงาน' : 'ขึ้นทะเบียนพนักงานใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
