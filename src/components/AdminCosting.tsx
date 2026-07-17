import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  DollarSign,
  Briefcase,
  Printer,
  ChevronDown,
  Edit3,
  TrendingUp,
  Sliders,
  Coins,
  Percent,
  X,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Employee, DailyAttendance } from '../types';
import { GLOBAL_STATUS, GLOBAL_STATUS_CONFIG, PROJECT_BUDGETS, getEmployeeWages, applyRounding, activeSystemSettings } from '../data';

interface AdminCostingProps {
  employees: Employee[];
  attendanceData: Record<string, Record<string, DailyAttendance>>;
  dates: string[];
  activeProject: string;
  onProjectChange: (proj: string) => void;
  onTriggerPrint: (project: string) => void;
  projects: string[];
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
}

export default function AdminCosting({
  employees,
  attendanceData,
  dates,
  activeProject,
  onProjectChange,
  onTriggerPrint,
  projects,
  onUpdateDayAttendance,
}: AdminCostingProps) {
  const [activeTab, setActiveTab] = useState<'cost' | 'budget'>('cost');

  // Modal Detail States
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingDateStr, setEditingDateStr] = useState<string | null>(null);

  // States for inline edit
  const [editStatus, setEditStatus] = useState('W');
  const [editTimeIn, setEditTimeIn] = useState('');
  const [editTimeOut, setEditTimeOut] = useState('');
  const [editProject, setEditProject] = useState('');
  const [editFood, setEditFood] = useState(0);
  const [editTrip, setEditTrip] = useState(0);
  const [editOther, setEditOther] = useState(0);
  const [editMemo, setEditMemo] = useState('');

  const handleStartInlineEdit = (dateStr: string, log: DailyAttendance) => {
    setEditingDateStr(dateStr);
    setEditStatus(log.status || 'ย');
    setEditTimeIn(log.timeIn || '');
    setEditTimeOut(log.timeOut || '');
    setEditProject(log.project || selectedEmp?.project || '');
    setEditFood(log.food || 0);
    setEditTrip(log.trip || 0);
    setEditOther(log.other || 0);
    setEditMemo(log.otherMemo || '');
  };

  const handleSaveInlineEdit = (dateStr: string) => {
    if (selectedEmp && onUpdateDayAttendance) {
      onUpdateDayAttendance(selectedEmp.id, dateStr, {
        status: editStatus,
        timeIn: editTimeIn,
        timeOut: editTimeOut,
        project: editProject,
        food: editFood,
        trip: editTrip,
        other: editOther,
        otherMemo: editMemo,
      });
    }
    setEditingDateStr(null);
  };

  // Budget vs Actual editable limits state
  const [customBudgets, setCustomBudgets] = useState<Record<string, number>>(() => ({
    'โครงการก่อสร้างสะพาน (01)': PROJECT_BUDGETS['โครงการก่อสร้างสะพาน (01)'] || 500000,
    'โครงการอาคารเรียน (02)': PROJECT_BUDGETS['โครงการอาคารเรียน (02)'] || 350000,
    'โครงการถนนหลวง (03)': PROJECT_BUDGETS['โครงการถนนหลวง (03)'] || 600000,
  }));

  const filteredEmployees = employees.filter((e) => activeProject === 'all' || e.project === activeProject);

  return (
    <div className="space-y-4">
      {/* Search Filter Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              สลับประเภทรายงานต้นทุน
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('cost')}
                className={`py-1.5 rounded-lg text-xs font-black transition ${
                  activeTab === 'cost' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                📊 สรุปค่าแรงโครงการ
              </button>
              <button
                onClick={() => setActiveTab('budget')}
                className={`py-1.5 rounded-lg text-xs font-black transition ${
                  activeTab === 'budget' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                📈 เปรียบเทียบงบประมาณ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SUMMARY COSTING REPORT TAB ─── */}
      {activeTab === 'cost' && (
        <div className="space-y-4">
          {projects.map((p) => {
            if (activeProject !== 'all' && p !== activeProject) return null;

            const rowData: {
              id: string;
              name: string;
              role: string;
              credits: number;
              wageEarned: number;
              allowEarned: number;
            }[] = [];

            let projWageSum = 0;
            let projAllowSum = 0;

            employees.forEach((emp) => {
              let credits = 0;
              let otHours = 0;
              let foodSum = 0;
              let tripSum = 0;
              let otherSum = 0;

              dates.forEach((d) => {
                const log = (attendanceData[d]?.[emp.id] || {}) as DailyAttendance;
                const actualProject = log.project || emp.project;

                if (actualProject === p) {
                  credits += log.credit || 0;
                  otHours += log.ot || 0;
                  foodSum += log.food || 0;
                  tripSum += log.trip || 0;
                  otherSum += log.other || 0;
                }
              });

              if (credits > 0 || otHours > 0 || foodSum > 0 || tripSum > 0 || otherSum > 0) {
                const { dayWage, hrWage } = getEmployeeWages(emp);
                const rawWageEarned = dayWage * credits + otHours * hrWage * 1.0;
                const wageEarned = applyRounding(rawWageEarned, activeSystemSettings.roundSalary);

                const roundedFood = applyRounding(foodSum, activeSystemSettings.roundWelfare);
                const roundedTrip = applyRounding(tripSum, activeSystemSettings.roundWelfare);
                const roundedOther = applyRounding(otherSum, activeSystemSettings.roundWelfare);
                const allowEarned = roundedFood + roundedTrip + roundedOther;

                projWageSum += wageEarned;
                projAllowSum += allowEarned;

                rowData.push({
                  id: emp.id,
                  name: emp.name,
                  role: emp.role,
                  credits,
                  wageEarned,
                  allowEarned,
                });
              } else if (emp.project === p && !dates.some((d) => attendanceData[d]?.[emp.id])) {
                rowData.push({
                  id: emp.id,
                  name: emp.name,
                  role: emp.role,
                  credits: 0,
                  wageEarned: 0,
                  allowEarned: 0,
                });
              }
            });

            const projTotal = projWageSum + projAllowSum;

            return (
              <div key={p} className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-150 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <span className="px-2 py-0.5 bg-slate-800 text-white rounded text-[9px] font-black uppercase">
                      สถิติสะสมรอบงวดค่าใช้จ่าย
                    </span>
                    <h4 className="text-base font-black text-slate-800 mt-2">{p}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">ค่าจ้างสุทธิสะสม</p>
                      <p className="text-lg font-black text-red-700 mt-1">฿{projTotal.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => onTriggerPrint(p)}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4 text-amber-400" />
                      <span>พิมพ์เอกสารใบสรุป</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-xs">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left">พนักงาน</th>
                        <th className="px-4 py-3 text-center">เครดิตวันแรงสะสม</th>
                        <th className="px-4 py-3 text-right">ค่าแรง (+OT)</th>
                        <th className="px-4 py-3 text-right text-emerald-800">สวัสดิการข้าว/เที่ยว/เบี้ย</th>
                        <th className="px-4 py-3 text-right bg-slate-100/50">ยอดจ่ายสะสมสุทธิ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 bg-white">
                      {rowData.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-slate-800 font-extrabold">{row.name}</p>
                                <p className="text-[9px] text-slate-400">{row.id} · {row.role}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const fullEmp = employees.find((e) => e.id === row.id);
                                  if (fullEmp) {
                                    setSelectedEmp(fullEmp);
                                    setIsDetailModalOpen(true);
                                    setEditingDateStr(null);
                                  }
                                }}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[9px] font-black cursor-pointer flex items-center gap-1 transition shrink-0"
                                title="คลิกเพื่อจัดการและแก้ไขข้อมูลรายวันทำงาน"
                              >
                                <Calendar className="w-3 h-3 text-rose-700" />
                                <span>ตารางรอบเดือน</span>
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center text-slate-600 font-black">{row.credits} วัน</td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800">
                            ฿{row.wageEarned.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                            ฿{row.allowEarned.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-black text-red-900 bg-slate-100/30">
                            ฿{(row.wageEarned + row.allowEarned).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── BUDGET VS ACTUAL REPORT TAB ─── */}
      {activeTab === 'budget' && (() => {
        // Calculate cumulative costs trend for each date in dates
        let runningTotal = 0;
        
        const trendData = dates.map((dateStr) => {
          let dailyCost = 0;
          const dayLogs = attendanceData[dateStr] || {};
          
          employees.forEach((emp) => {
            const log = dayLogs[emp.id];
            if (!log) return;
            const actualProject = log.project || emp.project;
            if (activeProject !== 'all' && actualProject !== activeProject) return;
            
            const credits = log.credit || 0;
            const otHours = log.ot || 0;
            const food = log.food || 0;
            const trip = log.trip || 0;
            const other = log.other || 0;
            
            const { dayWage, hrWage } = getEmployeeWages(emp);
            const rawWageEarned = dayWage * credits + otHours * hrWage * 1.0;
            const wageEarned = applyRounding(rawWageEarned, activeSystemSettings.roundSalary);

            const roundedFood = applyRounding(food, activeSystemSettings.roundWelfare);
            const roundedTrip = applyRounding(trip, activeSystemSettings.roundWelfare);
            const roundedOther = applyRounding(other, activeSystemSettings.roundWelfare);
            const allowEarned = roundedFood + roundedTrip + roundedOther;
            
            const rawDailyCost = wageEarned + allowEarned;
            dailyCost += applyRounding(rawDailyCost, activeSystemSettings.roundNetPay);
          });
          
          runningTotal += dailyCost;
          
          let budgetValue = 0;
          if (activeProject === 'all') {
            budgetValue = (Object.values(customBudgets) as number[]).reduce((acc: number, curr: number) => acc + curr, 0);
          } else {
            budgetValue = customBudgets[activeProject] || 0;
          }
          
          return {
            dateStr,
            displayDate: new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
            'ต้นทุนจริงสะสม (Actual)': Math.round(runningTotal),
            'งบประมาณโครงการ (Budget)': budgetValue,
          };
        });

        // Current project information
        let currentBudget = 0;
        let currentProjectName = '';
        
        if (activeProject === 'all') {
          currentBudget = (Object.values(customBudgets) as number[]).reduce((acc: number, curr: number) => acc + curr, 0);
          currentProjectName = 'โครงการทั้งหมดรวมกันในสนาม';
        } else {
          currentBudget = customBudgets[activeProject] || 0;
          currentProjectName = activeProject;
        }

        const totalActualCost = trendData.length > 0 ? trendData[trendData.length - 1]['ต้นทุนจริงสะสม (Actual)'] : 0;
        const remainingBudget = currentBudget - totalActualCost;
        const spentPercent = currentBudget > 0 ? (totalActualCost / currentBudget) * 100 : 0;
        const isOverBudget = totalActualCost > currentBudget;

        const projectComparisonList = projects.map((p) => {
          let wageSum = 0;
          let foodSumTotal = 0;
          let tripSumTotal = 0;
          let otherSumTotal = 0;

          employees.forEach((emp) => {
            let credits = 0;
            let otHours = 0;
            let foodSum = 0;
            let tripSum = 0;
            let otherSum = 0;

            dates.forEach((d) => {
              const log = (attendanceData[d]?.[emp.id] || {}) as DailyAttendance;
              const actualProject = log.project || emp.project;

              if (actualProject === p) {
                credits += log.credit || 0;
                otHours += log.ot || 0;
                foodSum += log.food || 0;
                tripSum += log.trip || 0;
                otherSum += log.other || 0;
              }
            });

            if (credits > 0 || otHours > 0 || foodSum > 0 || tripSum > 0 || otherSum > 0) {
              const { dayWage, hrWage } = getEmployeeWages(emp);
              const rawWageEarned = dayWage * credits + otHours * hrWage * 1.0;
              const wageEarned = applyRounding(rawWageEarned, activeSystemSettings.roundSalary);

              const roundedFood = applyRounding(foodSum, activeSystemSettings.roundWelfare);
              const roundedTrip = applyRounding(tripSum, activeSystemSettings.roundWelfare);
              const roundedOther = applyRounding(otherSum, activeSystemSettings.roundWelfare);

              wageSum += wageEarned;
              foodSumTotal += roundedFood;
              tripSumTotal += roundedTrip;
              otherSumTotal += roundedOther;
            }
          });

          const allowSum = foodSumTotal + tripSumTotal + otherSumTotal;
          const rawTotalCost = wageSum + allowSum;
          const totalCost = applyRounding(rawTotalCost, activeSystemSettings.roundNetPay);
          const budget = customBudgets[p] || PROJECT_BUDGETS[p] || 400000;
          const isOver = totalCost > budget;

          return {
            name: p,
            shortName: p.replace('โครงการ', '').replace('ก่อสร้าง', '').trim(),
            'ต้นทุนจริง (Actual)': Math.round(totalCost),
            'งบประมาณ (Budget)': budget,
            'ค่าแรงสปอนเซอร์': Math.round(wageSum),
            'เบี้ยเลี้ยง/สวัสดิการ': Math.round(allowSum),
            'ค่าแรง': Math.round(wageSum),
            'ค่าอาหาร': Math.round(foodSumTotal),
            'ค่าเบี้ยเที่ยว': Math.round(tripSumTotal),
            'สวัสดิการอื่นๆ': Math.round(otherSumTotal),
            isOver,
          };
        });

        const totalAllProjectsActual = projectComparisonList.reduce((acc, curr) => acc + curr['ต้นทุนจริง (Actual)'], 0);

        return (
          <div className="space-y-4">
            {/* KPI Summary Cards inside Budget Tab */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Card 1: Budget */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
                <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">งบประมาณที่กำหนด (Project Budget)</span>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-slate-800">
                    ฿{currentBudget.toLocaleString()}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 font-semibold">วงเงินแผนควบคุมสูงสุดของโครงการ</p>
              </div>

              {/* Card 2: Actual Spending */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
                <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">ต้นทุนจริงเกิดขึ้น (Cumulative Actual)</span>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-slate-800">
                    ฿{totalActualCost.toLocaleString()}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 font-semibold">ค่าใช้จ่ายค่าแรง+เบี้ยเลี้ยงสะสม</p>
              </div>

              {/* Card 3: Remaining Budget */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
                <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">งบประมาณคงเหลือ (Remaining Budget)</span>
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-black ${isOverBudget ? 'text-red-600' : 'text-emerald-700'}`}>
                    ฿{remainingBudget.toLocaleString()}
                  </span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isOverBudget ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    <span className="text-xs">💰</span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 font-semibold">
                  {isOverBudget ? '⚠️ จ่ายเกินงบประมาณโครงการแล้ว' : 'งบส่วนที่ยังควบคุมบริหารต่อได้'}
                </p>
              </div>

              {/* Card 4: Spend Efficiency Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">อัตราการเบิกจ่าย (Spent Ratio)</span>
                  <span className={`text-[11px] font-black ${isOverBudget ? 'text-red-600' : 'text-slate-700'}`}>
                    {spentPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget ? 'bg-red-600' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${Math.min(spentPercent, 100)}%` }}
                  />
                </div>
                <p className="text-[8px] text-slate-400 font-bold">ของงบประมาณโครงการที่ตั้งไว้</p>
              </div>
            </div>

            {/* Slider to adjust the project budget in real-time */}
            {activeProject !== 'all' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase">ปรับค่าวงเงินงบประมาณทดสอบเชิงจำลอง (Simulate Project Budget)</h4>
                      <p className="text-[10px] text-slate-400 font-bold">ทดลองจำลองขีดงบประมาณจริงของหน้าโครงการเพื่อตรวจสอบจุดเสี่ยงงบประมาณบานปลาย</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step={10000}
                      min={50000}
                      max={1500000}
                      value={currentBudget}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setCustomBudgets((prev) => ({
                          ...prev,
                          [activeProject]: val,
                        }));
                      }}
                      className="w-32 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-mono font-black text-slate-700 text-right focus:outline-none focus:border-red-600"
                    />
                    <span className="text-xs font-black text-slate-400">บาท</span>
                  </div>
                </div>

                <div className="px-1">
                  <input
                    type="range"
                    min={50000}
                    max={1000000}
                    step={10000}
                    value={currentBudget}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setCustomBudgets((prev) => ({
                        ...prev,
                        [activeProject]: val,
                      }));
                    }}
                    className="w-full accent-red-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-slate-400 font-bold mt-1">
                    <span>Min: ฿50,000</span>
                    <span>฿500,000</span>
                    <span>Max: ฿1,000,000</span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── NEW COMPARATIVE COST DASHBOARD FOR ACCOUNTING ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Bar Chart: Budget vs Actual Side-by-Side */}
              <div className="bg-white border border-slate-200 p-5 rounded-[22px] shadow-sm space-y-4">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                    <span>เปรียบเทียบงบประมาณ vs ต้นทุนสุทธิรายโครงการ (Budget vs Actual)</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    เปรียบเทียบวงเงินงบประมาณแผนควบคุม เทียบกับยอดจ่ายค่าแรงบวกสวัสดิการจริงสะสมแยกโครงการ
                  </p>
                </div>

                <div className="h-64 w-full text-[10px] font-bold font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={projectComparisonList}
                      margin={{ top: 15, right: 10, left: -5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis
                        dataKey="shortName"
                        stroke="#94A3B8"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#94A3B8"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(val: any, name: string) => [
                          `฿${Number(val).toLocaleString()} บาท`,
                          name
                        ]}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '12px',
                          color: '#1E293B',
                          fontSize: '11px',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                        }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                      <Bar dataKey="งบประมาณ (Budget)" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={22} />
                      <Bar dataKey="ต้นทุนจริง (Actual)" radius={[4, 4, 0, 0]} barSize={22}>
                        {projectComparisonList.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.isOver ? '#E11D48' : '#10B981'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 text-[9px] font-bold text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#94A3B8]" /> งบประมาณโครงการ
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#10B981]" /> จ่ายจริง (ในงบ)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#E11D48]" /> จ่ายจริง (เกินงบแผน)
                  </span>
                </div>
              </div>

              {/* Pie Chart: Proportion Share of Spending */}
              <div className="bg-white border border-slate-200 p-5 rounded-[22px] shadow-sm space-y-4">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                    <span>สัดส่วนค่าใช้จ่ายสะสมรวมในสนาม (Field Expenditure Share)</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    สัดส่วนการใช้สอยทรัพยากรการเงินและต้นทุนค่าแรงจริงเปรียบเทียบในแต่ละหน้างาน
                  </p>
                </div>

                <div className="h-64 w-full flex items-center justify-center text-[10px] font-bold font-mono relative">
                  {totalAllProjectsActual === 0 ? (
                    <div className="text-slate-400 font-bold text-xs py-10">ยังไม่มีบันทึกข้อมูลต้นทุนเกิดขึ้นจริงในงวดนี้</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={projectComparisonList}
                            nameKey="shortName"
                            dataKey="ต้นทุนจริง (Actual)"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={4}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                          >
                            {projectComparisonList.map((entry, index) => {
                              const CHART_COLORS = ['#E11D48', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
                              return (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={CHART_COLORS[index % CHART_COLORS.length]} 
                                />
                              );
                            })}
                          </Pie>
                          <Tooltip
                            formatter={(val: any) => [`฿${Number(val).toLocaleString()} บาท`, 'ต้นทุนจริงสะสม']}
                            contentStyle={{
                              backgroundColor: '#FFFFFF',
                              borderRadius: '12px',
                              color: '#1E293B',
                              fontSize: '11px',
                              border: '1px solid #E2E8F0',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute text-center flex flex-col justify-center items-center pointer-events-none">
                        <span className="text-[8px] text-slate-400 uppercase font-black leading-none">ต้นทุนจ่ายรวม</span>
                        <span className="text-xs font-black text-slate-800 mt-1">฿{totalAllProjectsActual.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ─── NEW DETAILED PROJECT COST BREAKDOWN ANALYSIS COMPONENT ─── */}
            <div className="bg-white border border-slate-200 p-5 rounded-[22px] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" />
                    <span>แผนภูมิวิเคราะห์โครงสร้างต้นทุนแยกประเภท (Project Cost Element Breakdown)</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    เปรียบเทียบสัดส่วนค่าใช้จ่ายจริงรายโครงการจำแนกเป็น ค่าแรง, ค่าอาหาร, ค่าเบี้ยเที่ยว และสวัสดิการอื่นๆ เพื่อฝ่ายบัญชี
                  </p>
                </div>
              </div>

              <div className="h-72 w-full text-[10px] font-bold font-mono">
                {totalAllProjectsActual === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 font-bold text-xs py-10">ยังไม่มีบันทึกข้อมูลต้นทุนเกิดขึ้นจริงในงวดนี้</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={projectComparisonList}
                      margin={{ top: 15, right: 15, left: -5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis
                        dataKey="shortName"
                        stroke="#94A3B8"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#94A3B8"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(val: any, name: string) => [
                          `฿${Number(val).toLocaleString()} บาท`,
                          name
                        ]}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '12px',
                          color: '#1E293B',
                          fontSize: '11px',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                        }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                      <Line 
                        type="monotone"
                        dataKey="ค่าแรง" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 1 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone"
                        dataKey="ค่าอาหาร" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 1 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone"
                        dataKey="ค่าเบี้ยเที่ยว" 
                        stroke="#F59E0B" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 1 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone"
                        dataKey="สวัสดิการอื่นๆ" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 1 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-[9px] font-bold text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#3B82F6]" /> ค่าแรงรวม
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#10B981]" /> ค่าอาหาร
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#F59E0B]" /> ค่าเบี้ยเที่ยว
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#8B5CF6]" /> สวัสดิการอื่นๆ
                </span>
              </div>
            </div>

            {/* Project Comparison Detailed Ledger Table */}
            <div className="bg-white border border-slate-200 rounded-[22px] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h4 className="text-xs font-black text-slate-800 uppercase">ตารางวิเคราะห์ความแปรปรวนงบประมาณ (Accounting Variance Ledger)</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">ตารางสรุปงบประมาณเปรียบเทียบผลต่างรายโครงการจริงสะสมเพื่อการประเมินโดยฝ่ายบัญชี</p>
              </div>
              <div className="overflow-x-auto text-xs">
                <table className="min-w-full divide-y divide-slate-150 font-bold text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 text-[10px]">
                    <tr>
                      <th className="px-4 py-3 text-left">หน้างาน / โครงการ</th>
                      <th className="px-4 py-3 text-right">งบประมาณโครงการ (Budget)</th>
                      <th className="px-4 py-3 text-right">ค่าแรงสะสมรวมจริง (Actual)</th>
                      <th className="px-4 py-3 text-right">ยอดจ่ายเฉพาะค่าแรง</th>
                      <th className="px-4 py-3 text-right text-emerald-800">เบี้ยเลี้ยงสวัสดิการข้าว/เที่ยว</th>
                      <th className="px-4 py-3 text-right">ผลต่างงบประมาณ (Variance)</th>
                      <th className="px-4 py-3 text-center">ประเมินงบประมาณ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {projectComparisonList.map((item, index) => {
                      const variance = item['งบประมาณ (Budget)'] - item['ต้นทุนจริง (Actual)'];
                      const colors = ['bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
                      const tagColor = colors[index % colors.length];

                      return (
                        <tr key={item.name} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3.5 flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${tagColor}`} />
                            <div>
                              <p className="text-slate-800 font-extrabold">{item.name}</p>
                              <p className="text-[9px] text-slate-400 font-semibold">ชื่อย่อในกราฟ: {item.shortName}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-slate-500">฿{item['งบประมาณ (Budget)'].toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-right font-mono text-slate-850">฿{item['ต้นทุนจริง (Actual)'].toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-right font-mono text-slate-400">฿{item['ค่าแรงสปอนเซอร์'].toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-right font-mono text-emerald-700">฿{item['เบี้ยเลี้ยง/สวัสดิการ'].toLocaleString()}</td>
                          <td className={`px-4 py-3.5 text-right font-mono ${variance >= 0 ? 'text-emerald-700 font-extrabold' : 'text-red-600 font-extrabold'}`}>
                            {variance >= 0 ? '+' : ''}{variance.toLocaleString()} บาท
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[8px] font-black ${
                              variance >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {variance >= 0 ? '✅ ภายใต้งบประมาณ' : '⚠️ เกินวงเงินจำลอง'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recharts Cumulative Trend Chart Card */}
            <div className="bg-white border border-slate-200 p-5 rounded-[22px] shadow-sm space-y-4">
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                  <span>กราฟเปรียบเทียบความก้าวหน้างบประมาณรายวัน (Budget vs Actual Spend Trend)</span>
                </h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  วิเคราะห์แนวโน้มการจ่ายสุทธิแบบสะสมของ {currentProjectName} เทียบขีดงบประมาณคงที่ตลอดช่วง 30 วัน
                </p>
              </div>

              <div className="h-72 w-full text-xs font-bold font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 10, right: 15, left: -5, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E11D48" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="displayDate"
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
                      tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val: any, name: string) => [
                        `฿${Number(val).toLocaleString()}`,
                        name === 'ต้นทุนจริงสะสม (Actual)' ? 'ต้นทุนจริงจ่ายสะสม' : 'งบประมาณโครงการ'
                      ]}
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
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    
                    {/* Project Budget Constant Line */}
                    <ReferenceLine 
                      y={currentBudget} 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      strokeDasharray="5 5" 
                      label={{ 
                        value: `งบโครงการ: ฿${(currentBudget / 1000).toFixed(0)}k`, 
                        position: 'top', 
                        fill: '#EF4444', 
                        fontSize: 9, 
                        fontWeight: 'bold' 
                      }} 
                    />

                    {/* Actual Cost Area */}
                    <Area
                      type="monotone"
                      dataKey="ต้นทุนจริงสะสม (Actual)"
                      stroke="#E11D48"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#actualGradient)"
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Strategic Insights Message Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-2.5 ${
                isOverBudget 
                  ? 'bg-red-50 border-red-200 text-red-800' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <span className="text-base shrink-0">{isOverBudget ? '🚨' : '✨'}</span>
                <div className="text-[10px] font-bold">
                  <h5 className="font-extrabold uppercase font-display">บทวิเคราะห์แผนการใช้จ่ายทางการเงิน (Financial Analysis & Forecast)</h5>
                  <p className="mt-0.5 leading-relaxed">
                    {isOverBudget 
                      ? `คำเตือน: โครงการของคุณใช้จ่ายเกินวงเงินงบประมาณที่จำลองไว้แล้วเป็นจำนวน ฿${Math.abs(remainingBudget).toLocaleString()} กรุณาทบทวนชั่วโมงการทำงานล่วงเวลา (OT) หรืออัตราการขาดงาน/มาสายของหน้าไซต์โดยเร็วที่สุด`
                      : `ผลประเมิน: ระบบควบคุมทางการเงินระบุว่าอัตราการใช้จ่ายงบประมาณของ ${currentProjectName} อยู่ในสถานะดีเยี่ยมและมีความมั่นคงทางการเงินสูง โดยใช้งบไปเพียง ${spentPercent.toFixed(1)}% และมีงบจำลองคงเหลือพร้อมเบิกจ่ายอีก ฿${remainingBudget.toLocaleString()}`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── MODAL: DETAILED MONTHLY LEDGER DAILY EDIT ─── */}
      {isDetailModalOpen && selectedEmp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-[999] overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 border border-slate-200 shadow-2xl flex flex-col my-8 max-h-[90vh] overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 text-rose-700 rounded-2xl flex items-center justify-center font-black text-lg">
                  📅
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">ตารางรอบเดือนและการเบิกจ่ายรายวันพนักงาน (Monthly Cycle Matrix Ledger)</h3>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                    พนักงาน: <span className="text-slate-700 font-extrabold">{selectedEmp.name}</span> ({selectedEmp.id}) · ตำแหน่ง: {selectedEmp.role} · หน้างานหลัก: {selectedEmp.project}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setEditingDateStr(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-all"
                title="ปิดหน้าต่าง"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Alert/Tip */}
            <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-2xl text-[10px] text-amber-800 font-bold flex items-start gap-2 mt-3 shrink-0">
              <span className="text-sm shrink-0">💡</span>
              <div>
                <p className="uppercase font-black text-[10px]">วิธีแก้ไขข้อมูลรายวันโดยตรง:</p>
                <p className="font-semibold text-slate-650 mt-0.5">
                  คลิกปุ่ม <span className="text-rose-700">"แก้ไขรายวัน" (รูปดินสอ)</span> บนแถวของวันที่ที่ต้องการปรับเปลี่ยนตัวเลข, สถานะการลงเวลา หรือเบิกจ่ายพิเศษ ระบบจะแสดงกล่องป้อนข้อมูลแบบอินไลน์ เมื่อปรับค่าเสร็จแล้วคลิก <span className="text-emerald-700">"บันทึก"</span> เพื่อประมวลผลยอดจ่ายสะสมโครงการใหม่ทันที
                </p>
              </div>
            </div>

            {/* Scrollable Table Area */}
            <div className="overflow-y-auto mt-4 flex-1 pr-1 border border-slate-150 rounded-2xl">
              <table className="min-w-full divide-y divide-slate-150 text-xs font-bold text-slate-700">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr className="text-[10px] text-slate-500 uppercase tracking-wider">
                    <th className="px-3 py-3 text-left">วันที่</th>
                    <th className="px-3 py-3 text-left">หน้างานปฏิบัติงาน</th>
                    <th className="px-3 py-3 text-center">สถานะลงเวลา</th>
                    <th className="px-3 py-3 text-center">ช่วงเวลางาน</th>
                    <th className="px-3 py-3 text-center">สาย / OT</th>
                    <th className="px-3 py-3 text-right">ค่าข้าว</th>
                    <th className="px-3 py-3 text-right">เบี้ยเที่ยว</th>
                    <th className="px-3 py-3 text-right">สวัสดิการอื่นๆ</th>
                    <th className="px-3 py-3 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {dates.map((d) => {
                    const isSunday = new Date(d).getDay() === 0;
                    const log = (attendanceData[d]?.[selectedEmp.id] || {
                      status: isSunday ? 'ย' : 'W',
                      timeIn: '',
                      timeOut: '',
                      ot: 0,
                      lateMinutes: 0,
                      food: isSunday ? 0 : 80,
                      trip: isSunday ? 0 : 50,
                      other: 0,
                      otherMemo: '',
                      project: selectedEmp.project,
                      isLocked: false,
                    }) as DailyAttendance;

                    const isEditing = editingDateStr === d;

                    // Format display date
                    const dObj = new Date(d);
                    const displayDayNum = dObj.getDate();
                    const displayDayName = dObj.toLocaleDateString('th-TH', { weekday: 'short' });
                    const dateText = `${displayDayNum} ${dObj.toLocaleDateString('th-TH', { month: 'short' })} (${displayDayName})`;

                    if (isEditing) {
                      return (
                        <tr key={d} className="bg-rose-50/40 hover:bg-rose-50/60 transition-all font-semibold">
                          <td className="px-3 py-3 font-black text-rose-900 shrink-0">
                            {dateText}
                          </td>
                          <td className="px-2 py-3">
                            <select
                              value={editProject}
                              onChange={(e) => setEditProject(e.target.value)}
                              className="bg-white border border-slate-200 rounded-lg px-1.5 py-1 text-[11px] font-bold outline-none text-slate-800 focus:border-red-600"
                            >
                              {projects.map((pOption) => (
                                <option key={pOption} value={pOption}>{pOption}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="bg-white border border-slate-200 rounded-lg px-1.5 py-1 text-[11px] font-black outline-none text-slate-800 focus:border-red-600"
                            >
                              {Object.entries(GLOBAL_STATUS_CONFIG).map(([key, info]) => (
                                <option key={key} value={key}>
                                  {info.icon} {key} : {info.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <div className="flex items-center gap-1 justify-center">
                              <input
                                type="text"
                                value={editTimeIn}
                                placeholder="08:00"
                                onChange={(e) => setEditTimeIn(e.target.value)}
                                className="w-11 px-1 py-1 border border-slate-200 text-center rounded-md bg-white font-bold text-slate-850"
                              />
                              <span>-</span>
                              <input
                                type="text"
                                value={editTimeOut}
                                placeholder="17:00"
                                onChange={(e) => setEditTimeOut(e.target.value)}
                                className="w-11 px-1 py-1 border border-slate-200 text-center rounded-md bg-white font-bold text-slate-850"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center text-[10px] text-slate-400 italic">
                            คำนวณอัตโนมัติ
                          </td>
                          <td className="px-2 py-3 text-right">
                            <input
                              type="number"
                              value={editFood}
                              onChange={(e) => setEditFood(parseFloat(e.target.value) || 0)}
                              className="w-12 px-1 py-1 border border-slate-200 text-right rounded-md bg-white font-bold font-mono text-slate-850"
                            />
                          </td>
                          <td className="px-2 py-3 text-right">
                            <input
                              type="number"
                              value={editTrip}
                              onChange={(e) => setEditTrip(parseFloat(e.target.value) || 0)}
                              className="w-12 px-1 py-1 border border-slate-200 text-right rounded-md bg-white font-bold font-mono text-slate-850"
                            />
                          </td>
                          <td className="px-2 py-3 text-right">
                            <div className="flex flex-col gap-1 items-end">
                              <input
                                type="number"
                                placeholder="จำนวนเงิน"
                                value={editOther}
                                onChange={(e) => setEditOther(parseFloat(e.target.value) || 0)}
                                className="w-14 px-1 py-1 border border-slate-200 text-right rounded-md bg-white font-bold font-mono text-slate-850"
                              />
                              <input
                                type="text"
                                placeholder="ระบุเหตุผลเบิก..."
                                value={editMemo}
                                onChange={(e) => setEditMemo(e.target.value)}
                                className="w-20 px-1 py-0.5 border border-slate-200 text-right rounded-md bg-white text-[9px] font-semibold text-slate-800"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveInlineEdit(d)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black cursor-pointer transition"
                              >
                                บันทึก
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingDateStr(null)}
                                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg text-[9px] font-black cursor-pointer transition"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    // Render standard view
                    const st = GLOBAL_STATUS[log.status] || {
                      icon: '❓',
                      label: 'ไม่ระบุ',
                      bgColor: 'bg-slate-50',
                      textColor: 'text-slate-500',
                      border: 'border-slate-200',
                    };

                    return (
                      <tr key={d} className={`hover:bg-slate-50/50 transition-all ${isSunday ? 'bg-slate-50/20' : ''}`}>
                        <td className={`px-3 py-3.5 font-bold ${isSunday ? 'text-slate-400' : 'text-slate-800'}`}>
                          {dateText}
                        </td>
                        <td className="px-3 py-3.5 text-slate-500 font-semibold truncate max-w-[120px]" title={log.project}>
                          {log.project || '-'}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <span className={`px-2 py-1 border rounded-lg text-[9px] font-black leading-none ${st.bgColor} ${st.textColor} ${st.border}`}>
                            {st.icon} {log.status}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-center font-mono">
                          {log.isLocked ? (
                            <span className="text-red-700 font-black text-[9px]">🔒 LOCK ขาดงาน</span>
                          ) : log.timeIn ? (
                            <span className="text-slate-700 font-semibold">{log.timeIn} - {log.timeOut}</span>
                          ) : (
                            <span className="text-slate-300 italic font-semibold">ไม่ได้ตอกบัตร</span>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <div className="flex flex-col gap-0.5 justify-center items-center text-[9px] font-bold">
                            {log.lateMinutes > 0 && (
                              <span className="bg-amber-100 text-amber-800 px-1 rounded">
                                สาย {log.lateMinutes} น.
                              </span>
                            )}
                            {log.ot > 0 && (
                              <span className="bg-blue-100 text-blue-800 px-1 rounded">
                                OT {log.ot} ชม.
                              </span>
                            )}
                            {log.lateMinutes === 0 && log.ot === 0 && (
                              <span className="text-slate-300 font-black">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-slate-750 font-bold">
                          {log.food > 0 ? `฿${log.food}` : '-'}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-slate-750 font-bold">
                          {log.trip > 0 ? `฿${log.trip}` : '-'}
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          {log.other > 0 ? (
                            <div className="flex flex-col items-end">
                              <span className="font-mono text-emerald-700 font-black">฿{log.other}</span>
                              {log.otherMemo && (
                                <span className="text-[8px] text-slate-400 font-medium max-w-[80px] truncate" title={log.otherMemo}>
                                  ({log.otherMemo})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 font-black font-mono">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleStartInlineEdit(d, log)}
                            className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-lg text-[9px] font-black cursor-pointer flex items-center gap-1 mx-auto transition"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>แก้ไขรายวัน</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-slate-100 pt-4 mt-4 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setEditingDateStr(null);
                }}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-xs transition cursor-pointer"
              >
                ปิดตารางรอบเดือน
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
