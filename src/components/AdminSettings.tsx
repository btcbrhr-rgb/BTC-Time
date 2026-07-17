import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Clock, Shield, Calendar, DollarSign, BookOpen, MessageSquare, AlertCircle } from 'lucide-react';
import { DEFAULT_SYSTEM_SETTINGS, GLOBAL_STATUS_CONFIG } from '../data';

interface AdminSettingsProps {
  settings: any;
  onSaveSettings: (newSettings: any) => void;
}

export default function AdminSettings({ settings, onSaveSettings }: AdminSettingsProps) {
  const [localSettings, setLocalSettings] = useState<any>({
    ...DEFAULT_SYSTEM_SETTINGS,
    ...settings,
  });

  const [activeGroup, setActiveGroup] = useState<string>('timeCriteria');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const groups = [
    { id: 'timeCriteria', label: 'เกณฑ์เวลา & ตัวหาร', icon: Clock },
    { id: 'accounting', label: 'รอบบัญชีงวดงาน', icon: Calendar },
    { id: 'lunch', label: 'เวลาพัก & ลาครึ่งวัน', icon: Clock },
    { id: 'ot', label: 'ขั้นต่ำการคำนวณ OT', icon: DollarSign },
    { id: 'defaults', label: 'โครงการ & สวัสดิการ', icon: BookOpen },
    { id: 'deduction', label: 'เกณฑ์การสาย/หักเงิน', icon: AlertCircle },
    { id: 'sso', label: 'เกณฑ์ประกันสังคม (SSO)', icon: Shield },
    { id: 'holiday', label: 'อัตราวันทำงานหยุด', icon: Calendar },
    { id: 'leave', label: 'สิทธิ์วันลาพักผ่อน', icon: BookOpen },
    { id: 'rounding', label: 'การปัดเศษการเงิน', icon: DollarSign },
    { id: 'symbol', label: 'กฎสัญลักษณ์สถานะ', icon: Settings },
    { id: 'line', label: 'การเชื่อมต่อ LINE', icon: MessageSquare },
  ];

  const handleInputChange = (key: string, value: any) => {
    setErrorMsg('');
    setSuccessMsg('');
    setLocalSettings((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    // Basic validation
    try {
      if (localSettings.symbolRules) {
        JSON.parse(localSettings.symbolRules);
      }
    } catch (e) {
      setErrorMsg('รูปแบบ JSON ของกฎสรุปสถานะไม่ถูกต้อง กรุณาตรวจสอบวงเล็บและเครื่องหมายอัญประกาศ');
      return;
    }

    onSaveSettings(localSettings);
    setSuccessMsg('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว การคำนวณผลลัพธ์จะถูกปรับเปลี่ยนแบบไดนามิก');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('คุณต้องการรีเซ็ตการตั้งค่าระบบทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      setLocalSettings({ ...DEFAULT_SYSTEM_SETTINGS });
      setErrorMsg('');
      setSuccessMsg('รีเซ็ตเป็นค่าเริ่มต้นแล้ว กรุณากดปุ่มบันทึกเพื่อยืนยัน');
    }
  };

  const roundingOptions = [
    { value: 'none', label: 'ไม่ปัดเศษ (ทศนิยมตามจริง)' },
    { value: 'up', label: 'ปัดทศนิยมขึ้นเสมอ (.00)' },
    { value: 'down', label: 'ปัดทศนิยมลงเสมอ (.00)' },
    { value: 'half-up', label: 'ปัดเศษตามเกณฑ์ 0.5 (ปัดขึ้นหาก >= 0.5)' },
    { value: 'nearest-baht', label: 'ปัดทศนิยมขึ้นลงให้เป็นบาทถ้วน' },
  ];

  const SYSTEM_SETTINGS_SCHEMA = {
    dailyDivisor:          { label: 'ตัวหารค่าแรง/วัน',              type: 'number', default: 30,        group: 'timeCriteria', help: 'ตัวอย่าง: เงินเดือน 15,000 / 30 วัน = 500 บาท/วัน' },
    workHoursPerDay:       { label: 'ชั่วโมงทำงาน/วัน',              type: 'number', default: 8,         group: 'timeCriteria', help: 'ชั่วโมงงานมาตรฐานไม่รวมพักเที่ยง' },
    workStartTimeStr:      { label: 'เวลาเริ่มงาน',                  type: 'text',   default: '08:00',   group: 'timeCriteria', help: 'เวลาเข้างานปกติ (รูปแบบ HH:MM)' },
    workEndTimeStr:        { label: 'เวลาเลิกงาน',                   type: 'text',   default: '17:00',   group: 'timeCriteria', help: 'เวลาเลิกงานปกติ (รูปแบบ HH:MM)' },
    lateCutoffTimeStr:     { label: 'เวลาตัดสาย (เริ่มนับสาย)',     type: 'text',   default: '08:15',   group: 'timeCriteria', help: 'เวลาสายเกินเกณฑ์ที่จะเริ่มหักเงิน (รูปแบบ HH:MM)' },
    otStartTimeStr:        { label: 'เวลาเริ่มคิด OT',               type: 'text',   default: '17:15',   group: 'timeCriteria', help: 'เริ่มคิดชั่วโมงล่วงเวลาตั้งแต่กี่โมง (รูปแบบ HH:MM)' },
    defaultOtRate:         { label: 'อัตรา OT ปกติ (เท่า)',          type: 'number', default: 1.5,      group: 'timeCriteria', help: 'ตัวคูณเงินค่าล่วงเวลาวันธรรมดา' },
    
    billingCycleStartDay:  { label: 'วันเริ่มรอบบัญชี (วันที่)',     type: 'number', default: 26,        group: 'accounting', help: 'ตัวอย่าง: วันที่ 26 พฤษภาคม' },
    billingCycleEndDay:    { label: 'วันสิ้นสุดรอบบัญชี (วันที่)',   type: 'number', default: 25,        group: 'accounting', help: 'ตัวอย่าง: วันที่ 25 มิถุนายน' },
    
    lunchStartTimeStr:     { label: 'เวลาเริ่มพักเที่ยง',           type: 'text',   default: '12:00',   group: 'lunch', help: 'เวลาพักเที่ยงปกติ' },
    lunchEndTimeStr:       { label: 'เวลาสิ้นสุดพักเที่ยง',          type: 'text',   default: '13:00',   group: 'lunch', help: 'เวลาเริ่มงานช่วงบ่าย' },
    halfDayOutLunchMinStr: { label: 'ลาครึ่งบ่าย (ออกขั้นต่ำ)',      type: 'text',   default: '12:00',   group: 'lunch' },
    halfDayOutLunchMaxStr: { label: 'ลาครึ่งบ่าย (ออกขั้นสูง)',      type: 'text',   default: '13:30',   group: 'lunch' },
    halfDayInLunchMinStr:  { label: 'ลาครึ่งเช้า (เข้าขั้นต่ำ)',      type: 'text',   default: '11:30',   group: 'lunch' },
    halfDayInLunchMaxStr:  { label: 'ลาครึ่งเช้า (เข้าขั้นสูง)',      type: 'text',   default: '13:30',   group: 'lunch' },
    
    otIntervalMinutes:     { label: 'OT ขั้นต่ำ (นาที)',              type: 'number', default: 30,         group: 'ot', help: 'เศษชั่วโมง OT ต้องมีกี่นาทีขึ้นไปถึงนำมาคำนวณ' },
    otIntervalValue:      { label: 'OT คิดทีละ (ชั่วโมง)',          type: 'number', default: 0.5,       group: 'ot', help: 'การตัดส่วนเพิ่มสะสมชั่วโมง เช่น ละ 0.5 ชั่วโมง' },
    
    defaultCentralProject: { label: 'โครงการกลางเริ่มต้น',           type: 'text',   default: '(00)บุรีรัมย์', group: 'defaults' },
    defaultFoodAllowance:  { label: 'ค่าอาหาร/วัน (บาท)',           type: 'number', default: 50,        group: 'defaults', help: 'สวัสดิการค่าอาหารรายวันพื้นฐานสำหรับพนักงานที่ไม่มีกำหนดเฉพาะตัว' },
    
    latePenaltyPerMinute:  { label: 'หักสาย/นาที (บาท)',              type: 'number', default: 1.0,       group: 'deduction', help: 'อัตราการปรับสำหรับเวลางานมาสายต่อหนึ่งนาที' },
    lateHalfDayThreshold:  { label: 'สายครึ่งวัน (นาที)',            type: 'number', default: 240,       group: 'deduction', help: 'หากมาสายเกินกี่นาที จะถือเป็นสายครึ่งวันและปรับตามสัดส่วน' },
    
    ssoRate:               { label: 'อัตราประกันสังคม (%)',           type: 'number', default: 0.05,      group: 'sso', help: 'ตัวคูณเงินสบทบประกันสังคมส่วนลูกจ้าง (ปกติ 0.05 หรือ 5%)' },
    ssoMinSalary:         { label: 'SSO เบี้ยขั้นต่ำ',              type: 'number', default: 1650,      group: 'sso' },
    ssoMaxSalary:         { label: 'SSO เบี้ยเพดานสูง',              type: 'number', default: 17500,     group: 'sso' },
    includeOTinSSO:       { label: 'รวม OT ในฐาน SSO',             type: 'boolean', default: false,     group: 'sso', help: 'เปิดใช้งานหากต้องการรวมรายได้โอทีมาคำนวณเบี้ยประกันสังคมด้วย' },
    
    holidayOtRate:        { label: 'อัตรา OT วันหยุด (เท่า)',        type: 'number', default: 2.0,       group: 'holiday' },
    holidayWorkRate:      { label: 'อัตราวันหยุดทำงาน (เท่า)',     type: 'number', default: 1.0,       group: 'holiday' },
    
    annualLeaveDays:      { label: 'สิทธิ์ลาพักร้อน (วัน/ปี)',       type: 'number', default: 10,        group: 'leave' },
    sickLeaveDays:        { label: 'สิทธิ์ลาป่วย (วัน/ปี)',          type: 'number', default: 30,        group: 'leave' },
    personalLeaveDays:    { label: 'สิทธิ์ลากิจ (วัน/ปี)',           type: 'number', default: 3,         group: 'leave' },
    maternityLeaveDays:  { label: 'สิทธิ์ลาคลอด (วัน)',             type: 'number', default: 90,        group: 'leave' },
    maternityLeavePaid:   { label: 'ลาคลอดรับค่าจ้าง (วัน)',        type: 'number', default: 45,        group: 'leave' },
    militaryLeaveDays:    { label: 'สิทธิ์ลาทหาร (วัน)',             type: 'number', default: 60,        group: 'leave' },
    leaveAccrualRate:     { label: 'อัตราสะสมวันลา (วัน/เดือน)',    type: 'number', default: 0.0833,    group: 'leave' },
    leaveCutoff:           { label: 'วันตัดสิทธิ์ลา (dd/MM)',        type: 'text',   default: '25/12',   group: 'leave', help: 'รอบตัดเศษสะสมวันลา เช่น 25 ธันวาคม (25/12)' },
    
    roundSalary:          { label: 'ปัดเศษเงินเดือน',               type: 'select', default: 'none',    group: 'rounding' },
    roundDiligent:        { label: 'ปัดเศษเบี้ยขยัน',               type: 'select', default: 'none',    group: 'rounding' },
    roundTax:             { label: 'ปัดเศษภาษี',                    type: 'select', default: 'none',    group: 'rounding' },
    roundPenalty:         { label: 'ปัดเศษค่าปรับ',                  type: 'select', default: 'none',    group: 'rounding' },
    roundSSO:             { label: 'ปัดเศษ SSO',                     type: 'select', default: 'down',   group: 'rounding' },
    roundNetPay:          { label: 'ปัดเศษเงินสุทธิ',               type: 'select', default: 'down',   group: 'rounding' },
    roundProvidentFund:   { label: 'ปัดเศษกองทุนสำรองเลี้ยงชีพ',    type: 'select', default: 'none',    group: 'rounding' },
    roundWelfare:         { label: 'ปัดเศษสวัสดิการ',                type: 'select', default: 'none',    group: 'rounding' },
    
    symbolRules:          { label: 'กฎสรุปสถานะ (Symbol Rules)',     type: 'textarea', default: '',      group: 'symbol', help: 'คำอธิบายสถานะย่อยและสัญลักษณ์สำหรับออกรายงานในรอบ' },
    lineChannelAccessToken:{ label: 'LINE Channel Access Token',      type: 'text',   default: '',        group: 'line', help: 'Token สำหรับแจ้งเตือนการลงเวลาและสลิปพนักงานผ่าน Line Notify' }
  };

  const getFieldsByGroup = (groupId: string) => {
    return Object.entries(SYSTEM_SETTINGS_SCHEMA).filter(([_, schema]) => schema.group === groupId);
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <span className="p-2 bg-red-50 text-red-700 rounded-lg">⚙️</span>
            ตั้งค่าระบบ (System Configuration Settings)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ปรับเปลี่ยนพารามิเตอร์ สูตรการคำนวณเงินค่าแรง โอที ประกันสังคม และเงื่อนไขบัญชีกลาง
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRestoreDefaults}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/85 rounded-xl cursor-pointer transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าเริ่มต้น</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-xl cursor-pointer shadow-sm shadow-red-700/15 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>บันทึกการตั้งค่า</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2.5 animate-fade-in">
          <span className="text-lg shrink-0">✅</span>
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings categories list */}
        <div className="lg:col-span-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
            กลุ่มการตั้งค่า
          </div>
          {groups.map((g) => {
            const Icon = g.icon;
            return (
              <button
                key={g.id}
                onClick={() => setActiveGroup(g.id)}
                className={`w-full px-4 py-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                  activeGroup === g.id
                    ? 'bg-red-50 text-red-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeGroup === g.id ? 'text-red-700' : 'text-slate-400'}`} />
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>

        {/* Inputs panel */}
        <div className="lg:col-span-8 bg-slate-50/50 rounded-2xl border border-slate-100 p-6 space-y-6">
          <div className="border-b border-slate-200/80 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm">
              {groups.find((g) => g.id === activeGroup)?.label}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              กำหนดข้อมูลในหมวดหมู่นี้เพื่อนำไปประยุกต์ใช้ในการประมวลผลทางการเงิน
            </p>
          </div>

          <div className="space-y-4">
            {activeGroup === 'symbol' ? (
              <SymbolRulesEditor
                localSettings={localSettings}
                onRulesChange={(newRulesStr) => handleInputChange('symbolRules', newRulesStr)}
              />
            ) : (
              getFieldsByGroup(activeGroup).map(([key, schema]: [string, any]) => {
                const value = localSettings[key] !== undefined ? localSettings[key] : schema.default;

                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-700">
                        {schema.label}
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {key}
                      </span>
                    </div>

                    {schema.type === 'number' && (
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleInputChange(key, Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-600 transition-all"
                      />
                    )}

                    {schema.type === 'text' && (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-600 transition-all"
                      />
                    )}

                    {schema.type === 'boolean' && (
                      <label className="flex items-center gap-3 py-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!value}
                          onChange={(e) => handleInputChange(key, e.target.checked)}
                          className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500 cursor-pointer"
                        />
                        <span className="text-xs text-slate-600 font-medium">เปิดใช้งานการตั้งค่านี้</span>
                      </label>
                    )}

                    {schema.type === 'select' && (
                      <select
                        value={value}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-600 transition-all"
                      >
                        {roundingOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {schema.type === 'textarea' && (
                      <textarea
                        value={value}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        rows={10}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-600 transition-all"
                        placeholder='{ "W": "ทำงานปกติ" }'
                      />
                    )}

                    {schema.help && (
                      <p className="text-[10px] text-slate-400">
                        {schema.help}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SymbolRulesEditor({
  localSettings,
  onRulesChange
}: {
  localSettings: any;
  onRulesChange: (newVal: string) => void;
}) {
  const [viewMode, setViewMode] = useState<'gui' | 'json'>('gui');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCustomSymbol, setNewCustomSymbol] = useState('');
  const [customError, setCustomError] = useState('');

  // Standard keys
  const standardStatuses = GLOBAL_STATUS_CONFIG;
  
  // Parse current rules
  const rulesObj = React.useMemo(() => {
    try {
      return JSON.parse(localSettings.symbolRules || '{}');
    } catch (e) {
      return {};
    }
  }, [localSettings.symbolRules]);

  // Handle behavior changes
  const handleBehaviorChange = (status: string, behavior: 'none' | 'fill' | 'clear' | 'custom') => {
    const updated = { ...rulesObj };
    if (behavior === 'none') {
      delete updated[status];
    } else if (behavior === 'fill') {
      updated[status] = {
        fillIn: '08:00',
        fillOut: '17:00',
      };
    } else if (behavior === 'clear') {
      updated[status] = {
        clearIn: true,
        clearOut: true,
      };
    } else if (behavior === 'custom') {
      updated[status] = {
        clearIn: false,
        clearOut: false,
        fillIn: '',
        fillOut: '',
      };
    }
    onRulesChange(JSON.stringify(updated, null, 2));
  };

  const handleUpdateField = (status: string, field: string, val: any) => {
    const updated = { ...rulesObj };
    if (!updated[status]) {
      updated[status] = {};
    }
    updated[status] = {
      ...updated[status],
      [field]: val,
    };
    onRulesChange(JSON.stringify(updated, null, 2));
  };

  const handleAddCustomSymbol = () => {
    setCustomError('');
    const code = newCustomSymbol.trim();
    if (!code) {
      setCustomError('กรุณากรอกรหัสสัญลักษณ์');
      return;
    }
    if (rulesObj[code] || standardStatuses[code as keyof typeof standardStatuses]) {
      setCustomError('รหัสสัญลักษณ์นี้มีอยู่แล้วในระบบ');
      return;
    }
    
    // Add to rules with default fill behavior
    const updated = {
      ...rulesObj,
      [code]: { fillIn: '08:00', fillOut: '17:00' }
    };
    onRulesChange(JSON.stringify(updated, null, 2));
    setNewCustomSymbol('');
  };

  const handleDeleteCustomSymbol = (status: string) => {
    if (window.confirm(`คุณต้องการลบกฎสัญลักษณ์สำหรับ "${status}" ใช่หรือไม่?`)) {
      const updated = { ...rulesObj };
      delete updated[status];
      onRulesChange(JSON.stringify(updated, null, 2));
    }
  };

  // Combine standard and custom keys for display
  const allDisplayStatuses = [
    ...Object.entries(standardStatuses).map(([key, info]) => ({
      key,
      label: info.label,
      icon: info.icon,
      isCustom: false,
    })),
    ...Object.keys(rulesObj)
      .filter(k => !standardStatuses[k as keyof typeof standardStatuses])
      .map(key => ({
        key,
        label: 'สัญลักษณ์กำหนดเอง',
        icon: '⚙️',
        isCustom: true,
      }))
  ];

  // Filter based on search query
  const filteredStatuses = allDisplayStatuses.filter(
    item =>
      item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-slate-100/50 p-4 rounded-2xl border border-slate-200/60">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="🔍 ค้นหารหัสสัญลักษณ์ หรือชื่อสถานะ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-red-600 transition-all"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('gui')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'gui'
                ? 'bg-white text-red-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            📊 แก้ไขแบบ GUI
          </button>
          <button
            type="button"
            onClick={() => setViewMode('json')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'json'
                ? 'bg-white text-red-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            💻 โค้ด JSON
          </button>
        </div>
      </div>

      {/* Info Tips */}
      <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl text-[11px] text-slate-500 leading-relaxed">
        <strong>💡 วิธีการทำงาน:</strong> กฎเหล่านี้ใช้ในการปรับค่าเวลาตอกบัตรโดยอัตโนมัติเมื่อพนักงานลงสถานะนั้นๆ เช่น เมื่อลงสถานะ <strong>W (ทำงานปกติ)</strong> จะทำการใส่เวลาเข้างาน 08:00 และออกงาน 17:00 ให้อัตโนมัติ หรือสถานะ <strong>A (ขาดงาน)</strong> จะล้างค่าเวลาทิ้งให้ว่างเปล่า
      </div>

      {viewMode === 'json' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">โครงสร้างข้อมูล JSON สำหรับนักพัฒนาระบบ</span>
          </div>
          <textarea
            value={localSettings.symbolRules}
            onChange={(e) => onRulesChange(e.target.value)}
            rows={12}
            className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-600 transition-all shadow-inner"
            placeholder='{ "W": { "fillIn": "08:00", "fillOut": "17:00" } }'
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Add Custom Symbol Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <span>➕</span> เพิ่มกฎสำหรับสัญลักษณ์สืบทอดอื่นหรือกำหนดเอง
            </h4>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="ระบุรหัสสัญลักษณ์ เช่น OT, AB, T"
                value={newCustomSymbol}
                onChange={(e) => setNewCustomSymbol(e.target.value.toUpperCase())}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-red-600 max-w-[240px]"
              />
              <button
                type="button"
                onClick={handleAddCustomSymbol}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0"
              >
                เพิ่มกฎสัญลักษณ์
              </button>
            </div>
            {customError && (
              <p className="text-[10px] font-bold text-red-600">{customError}</p>
            )}
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStatuses.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-xs text-slate-400 font-medium bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                🚫 ไม่พบข้อมูลสัญลักษณ์ที่ค้นหา
              </div>
            ) : (
              filteredStatuses.map((item) => {
                const rule = rulesObj[item.key];
                
                // Determine current behavior mode
                let currentBehavior: 'none' | 'fill' | 'clear' | 'custom' = 'none';
                if (rule) {
                  if (rule.clearIn && rule.clearOut) {
                    currentBehavior = 'clear';
                  } else if (rule.fillIn !== undefined && rule.fillOut !== undefined && rule.clearIn === undefined && rule.clearOut === undefined) {
                    currentBehavior = 'fill';
                  } else {
                    currentBehavior = 'custom';
                  }
                }

                // Visual badges
                let badgeStyle = 'bg-slate-100 text-slate-600';
                let badgeText = 'ไม่มีการปรับเวลา';
                if (currentBehavior === 'fill') {
                  badgeStyle = 'bg-emerald-50 text-emerald-700';
                  badgeText = `🕒 ออโต้ ${rule.fillIn || ''}-${rule.fillOut || ''}`;
                } else if (currentBehavior === 'clear') {
                  badgeStyle = 'bg-rose-50 text-rose-700';
                  badgeText = '🧹 ล้างช่องเวลา';
                } else if (currentBehavior === 'custom') {
                  badgeStyle = 'bg-indigo-50 text-indigo-700';
                  badgeText = '⚙️ กำหนดค่าพิเศษ';
                }

                return (
                  <div key={item.key} className="bg-white border border-slate-200/80 rounded-2xl p-4 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 text-base shadow-sm shrink-0">
                          {item.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-sm text-slate-800">{item.key}</span>
                            {item.isCustom && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                                กำหนดเอง
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold mt-0.5">{item.label}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${badgeStyle}`}>
                          {badgeText}
                        </span>
                        {item.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomSymbol(item.key)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-all cursor-pointer"
                            title="ลบกฎสัญลักษณ์นี้"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content / Editing Block */}
                    <div className="space-y-3.5">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                          พฤติกรรมการจัดการเวลาตอกบัตร
                        </label>
                        <select
                          value={currentBehavior}
                          onChange={(e) => handleBehaviorChange(item.key, e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-800 focus:outline-none focus:border-red-600 transition-all cursor-pointer"
                        >
                          <option value="none">⏸️ ไม่ปรับเวลา (บันทึกตามจริง)</option>
                          <option value="fill">🕒 เติมเวลาปกติออโต้ (Auto-Fill)</option>
                          <option value="clear">🧹 ล้างเวลาทิ้งให้ว่าง (Clear Times)</option>
                          <option value="custom">⚙️ กำหนดค่าแบบละเอียดพิเศษ (Custom)</option>
                        </select>
                      </div>

                      {/* Display inputs based on currentBehavior */}
                      {currentBehavior === 'fill' && (
                        <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">เวลาเข้า</label>
                            <input
                              type="text"
                              value={rule?.fillIn || ''}
                              onChange={(e) => handleUpdateField(item.key, 'fillIn', e.target.value)}
                              placeholder="08:00"
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-black text-slate-800 text-center font-mono focus:border-red-600 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">เวลาออก</label>
                            <input
                              type="text"
                              value={rule?.fillOut || ''}
                              onChange={(e) => handleUpdateField(item.key, 'fillOut', e.target.value)}
                              placeholder="17:00"
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-black text-slate-800 text-center font-mono focus:border-red-600 outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {currentBehavior === 'custom' && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-2.5">
                          {/* Clear In / Out */}
                          <div className="flex items-center gap-6 border-b border-slate-200/60 pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!rule?.clearIn}
                                onChange={(e) => handleUpdateField(item.key, 'clearIn', e.target.checked)}
                                className="w-3.5 h-3.5 text-red-600 border-slate-300 rounded focus:ring-red-500 cursor-pointer"
                              />
                              <span className="text-[10px] font-bold text-slate-600">ล้างเวลาเข้า</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!rule?.clearOut}
                                onChange={(e) => handleUpdateField(item.key, 'clearOut', e.target.checked)}
                                className="w-3.5 h-3.5 text-red-600 border-slate-300 rounded focus:ring-red-500 cursor-pointer"
                              />
                              <span className="text-[10px] font-bold text-slate-600">ล้างเวลาออก</span>
                            </label>
                          </div>

                          {/* Custom Fill In */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-slate-400 uppercase">เติมค่าเวลาเข้า</span>
                              <input
                                type="text"
                                placeholder="เช่น 08:00 (เว้นว่างหากไม่มี)"
                                value={rule?.fillIn || ''}
                                onChange={(e) => handleUpdateField(item.key, 'fillIn', e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold font-mono text-right text-slate-800 w-[140px] focus:border-red-600 outline-none"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-slate-400 uppercase">เติมค่าเวลาออก</span>
                              <input
                                type="text"
                                placeholder="เช่น 17:00 (เว้นว่างหากไม่มี)"
                                value={rule?.fillOut || ''}
                                onChange={(e) => handleUpdateField(item.key, 'fillOut', e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold font-mono text-right text-slate-800 w-[140px] focus:border-red-600 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
