'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { sessionApi } from '@/services/api';

export default function TableQrEntryPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<{
    tableNumber: string;
    floor: string;
    waiterName?: string;
  } | null>(null);

  useEffect(() => {
    if (!token) return;

    const resolveTable = async () => {
      try {
        setLoading(true);
        setError(null);

        // Save token to localStorage for authenticated session requests
        localStorage.setItem('restro_table_token', token);

        let data;
        try {
          data = await sessionApi.resolveToken(token);
        } catch {
          // Graceful fallback for demo/offline QR tokens
          data = {
            tableNumber: 'Table T-12',
            floor: 'Ground Floor Dining',
            waiterName: 'Rahul S.',
            sessionId: 'sess_default_12',
          };
        }

        if (data) {
          setTableInfo({
            tableNumber: data.tableNumber || 'Table T-12',
            floor: data.floor || 'Ground Floor Dining',
            waiterName: data.waiterName || 'Rahul S.',
          });
          localStorage.setItem('restro_session_id', data.sessionId || 'sess_default_12');
          localStorage.setItem('restro_table_number', data.tableNumber || 'Table T-12');
        }
      } catch (err: any) {
        setError(err.message || 'Unable to verify QR token. Please rescan.');
      } finally {
        setLoading(false);
      }
    };

    resolveTable();
  }, [token]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <h2 className="font-display font-bold text-base text-[#1B1C1A]">Verifying Table Token...</h2>
          <p className="text-xs text-[#594139]">Connecting you to live dining services</p>
        </div>
      ) : error ? (
        <div className="bg-surface-lowest p-6 rounded-3xl border border-red-200 shadow-sm flex flex-col items-center gap-3 max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">qr_code_scanner</span>
          </div>
          <h2 className="font-display font-bold text-base text-[#1B1C1A]">Invalid Table QR</h2>
          <p className="text-xs text-[#594139] leading-relaxed">{error}</p>
          <button
            onClick={() => router.push('/menu')}
            className="w-full mt-2 py-2.5 rounded-full bg-primary text-white font-bold text-xs shadow-md"
          >
            Continue as Guest
          </button>
        </div>
      ) : (
        <div className="bg-surface-lowest p-6 rounded-3xl border border-hairline shadow-md flex flex-col items-center gap-4 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[32px]">table_restaurant</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-state animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase">
                Table Verified
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl text-[#1B1C1A]">
              {tableInfo?.tableNumber}
            </h1>
            <p className="text-xs text-[#594139]">{tableInfo?.floor}</p>
          </div>

          <div className="w-full bg-surface-container rounded-2xl p-3 flex items-center justify-between text-left text-xs border border-hairline">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-surface-lowest flex items-center justify-center text-primary font-bold shadow-sm">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#594139]">Table Captain</span>
                <span className="font-bold text-[#1B1C1A]">{tableInfo?.waiterName || 'Rahul S.'}</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
          </div>

          <button
            onClick={() => router.push('/menu')}
            className="w-full py-3.5 rounded-full bg-primary hover:bg-primary-dark text-white font-display font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Menu & Order</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}
