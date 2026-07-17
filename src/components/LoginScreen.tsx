import React, { useState } from 'react';
import { Key, ShieldCheck, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginScreenProps {
  onLogin: (role: 'admin' | 'employee', username: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('กรุณากรอกรหัสผู้ใช้งาน');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const lower = trimmed.toLowerCase();
      if (lower === 'admin') {
        onLogin('admin', 'admin');
      } else {
        const cleanCode = trimmed.toUpperCase();
        const validCodes = ['BTC-10001', 'BTC-10002', 'BTC-10003', 'BTC-10004', 'BTC-10005'];
        if (!validCodes.includes(cleanCode)) {
          setError('ไม่พบรหัสพนักงานในระบบ (ทดสอบด้วย BTC-10001 ถึง BTC-10005)');
          return;
        }
        onLogin('employee', cleanCode);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-[30px] p-8 w-full max-w-md shadow-2xl border border-slate-200 text-center relative overflow-hidden"
      >
        {/* Branding decoration */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 to-rose-700" />

        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-800 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-red-600/20">
          <Key className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-slate-800 font-display">BTC Time & Cost Portal</h1>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          บริษัท บุรีรัมย์ บิลดิ้ง แอนด์ เทรดดิ้ง จำกัด · ระบบลงเวลางานและบริหารต้นทุน
        </p>

        {/* Credentials guide */}
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-left text-xs mb-6 text-slate-600 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-red-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>🔑 บัญชีทดสอบระบบ:</span>
          </div>
          <div>
            • <strong className="text-slate-700">พนักงานทั่วไป:</strong>{' '}
            <code className="bg-slate-150 px-1.5 py-0.5 rounded font-mono text-red-700 font-bold">BTC-10001</code> (หรือลงท้าย 2 - 5)
          </div>
          <div>
            • <strong className="text-slate-700">ฝ่ายจัดการ / คอสตดิ้ง (Admin):</strong>{' '}
            <code className="bg-slate-150 px-1.5 py-0.5 rounded font-mono text-red-700 font-bold">admin</code>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="text-left space-y-4">
          <div>
            <label htmlFor="login-username" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
              รหัสผู้ใช้งาน <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className={`w-full px-4 py-3 rounded-xl border ${
                  error ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-red-600'
                } bg-white text-slate-800 placeholder-slate-400 focus:outline-none text-sm font-semibold transition`}
                placeholder="ระบุรหัสพนักงาน หรือ admin"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-600 text-[11px] font-bold mt-1.5">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-600/20 transition cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
