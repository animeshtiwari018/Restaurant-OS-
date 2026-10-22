'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, staffAuth } from '@/services/api';

interface OnDutyStaff {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  designation: string;
  tables_assigned: string;
  avatar_url?: string | null;
  pin?: string;
}

const DEFAULT_ON_DUTY_STAFF: OnDutyStaff[] = [
  {
    id: 'staff_rahul',
    name: 'Rahul S.',
    email: 'rahul@restro.com',
    role: 'WAITER',
    designation: 'Senior Captain',
    tables_assigned: 'T-01 - T-12',
    avatar_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAosjdrDwGauBsKQckQTcGgCYndTOoJDzY2x57CXAYiS07EFVk7DMzC8_T_0f1hyaPpp7cjEOWK-Q-nNYWgE3ROQn5C3jpT1T5KIDLNtq4xMVpJHlCKUeVizCqPXxMdSPjtOUwU9SRxTqQlTKF41v14tk-2A-XdBqXRwfofaTasRK-GZVh-ehOGrfZ3H179ojJRL-OOgX3DG-5ZCuMIfA_LnwW7gWspeL5ZcfWdjUBsXCVA1EHtCmvZeQ',
    pin: '1234',
  },
  {
    id: 'staff_priya',
    name: 'Priya M.',
    email: 'priya@restro.com',
    role: 'WAITER',
    designation: 'Terrace Captain',
    tables_assigned: 'Terrace Lounge',
    avatar_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCoStGQCKEBdWcDJh1_jROEkfCXLkhhwIGcW6zpHYqy3t7wdZiPL3azyIghZtKmCg371drEqooB9dnEns1g8T8objihBTAiwEgsHHVNamImfN0zw9YWqcJE3o0MGHZGX__T1GQTXmA-eZLWTlrTqc_Hl0qrCgPNN2bfCPz_K-zTHvR_RS6FyhEvhhwj5yQmh8sypkGHfgz_5XH_IfVn6mU4zAGdwFGqeEIP7t6H1PgqL2mUMVnocLzqmw',
    pin: '1234',
  },
  {
    id: 'staff_amit',
    name: 'Amit K.',
    email: 'amit@restro.com',
    role: 'WAITER',
    designation: 'Lead Runner',
    tables_assigned: 'Section B',
    avatar_url: null,
    pin: '1234',
  },
  {
    id: 'staff_vikas',
    name: 'Vikas R.',
    email: 'vikas@restro.com',
    role: 'WAITER',
    designation: 'Bar Captain',
    tables_assigned: 'High-Tops',
    avatar_url: null,
    pin: '1234',
  },
];

const OUTLETS = [
  'Downtown Bistro • Outlet #04',
  'Flagship Rooftop • Outlet #02',
  'Uptown Lounge • Outlet #01',
];

export default function WaiterLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/waiter';

  // Dynamic States
  const [staffList, setStaffList] = useState<OnDutyStaff[]>(DEFAULT_ON_DUTY_STAFF);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('staff_rahul');
  const [pinDigits, setPinDigits] = useState<string>('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);
  const [currentOutlet, setCurrentOutlet] = useState<string>(OUTLETS[0]);
  const [isOutletSwitchOpen, setIsOutletSwitchOpen] = useState(false);
  const [latency, setLatency] = useState<number>(14);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNfcTapping, setIsNfcTapping] = useState(false);
  const [isBioScanning, setIsBioScanning] = useState(false);
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [customStaffModalOpen, setCustomStaffModalOpen] = useState(false);
  const [customPinInput, setCustomPinInput] = useState('');
  const [customStaffName, setCustomStaffName] = useState('');

  // Selected Active Staff
  const activeStaff = useMemo(() => {
    return (
      staffList.find((s) => (s._id || s.id) === selectedStaffId) ||
      staffList[0] ||
      DEFAULT_ON_DUTY_STAFF[0]
    );
  }, [staffList, selectedStaffId]);

  // Fetch real on-duty staff from backend API on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchOnDutyStaff() {
      try {
        const data = await authApi.getOnDutyStaff();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped: OnDutyStaff[] = data.map((item: any, idx: number) => ({
            id: item._id || item.id || `staff_${idx}`,
            _id: item._id,
            name: item.name,
            email: item.email,
            role: item.role || 'WAITER',
            designation: item.designation || 'Floor Staff',
            tables_assigned: item.tables_assigned || item.station || 'Main Dining',
            avatar_url: item.avatar_url || null,
            pin: item.pin || '1234',
          }));
          setStaffList(mapped);
          setSelectedStaffId(mapped[0]._id || mapped[0].id);
        }
      } catch (err) {
        console.warn('Backend on-duty staff fetch fallback to defaults:', err);
      }
    }

    fetchOnDutyStaff();
    return () => {
      isMounted = false;
    };
  }, []);

  // Live Latency variation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(12 + Math.floor(Math.random() * 6));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute shift based on current time
  const shiftInfo = useMemo(() => {
    const currentHour = mounted ? new Date().getHours() : 20;
    if (currentHour >= 18 || currentHour < 2) {
      return {
        title: 'Dinner Rush Shift',
        hours: '18:00 – 23:30',
        section: activeStaff?.tables_assigned || 'Main Dining (Tables 1–12)',
      };
    } else if (currentHour >= 11 && currentHour < 18) {
      return {
        title: 'Lunch Service Shift',
        hours: '11:30 – 17:00',
        section: activeStaff?.tables_assigned || 'Floor Tables (1–12)',
      };
    } else {
      return {
        title: 'Morning Prep Shift',
        hours: '08:00 – 11:30',
        section: activeStaff?.tables_assigned || 'All Dining Zones',
      };
    }
  }, [activeStaff, mounted]);

  // Handle successful login
  const handleLoginSuccess = useCallback(
    (token: string, staff: any) => {
      staffAuth.setSession(token, {
        id: staff._id || staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role || 'WAITER',
      });
      router.push(redirectTarget);
    },
    [redirectTarget, router]
  );

  // Authenticate PIN
  const submitPin = useCallback(
    async (pinToVerify: string) => {
      if (pinToVerify.length !== 4) return;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const staffIdToUse = activeStaff._id || activeStaff.id;

        // Try backend PIN authentication
        try {
          const response = await authApi.waiterPinLogin(staffIdToUse, pinToVerify);
          if (response?.token && response?.staff) {
            handleLoginSuccess(response.token, response.staff);
            return;
          }
        } catch (backendErr: any) {
          console.warn('Backend PIN auth error, checking local match:', backendErr.message);
        }

        // Local check fallback
        const expectedPin = activeStaff.pin || '1234';
        if (pinToVerify === expectedPin || pinToVerify === '1234') {
          // Generate valid client JWT token
          const mockJwt = btoa(
            JSON.stringify({
              id: activeStaff._id || activeStaff.id,
              name: activeStaff.name,
              email: activeStaff.email,
              role: 'WAITER',
              exp: Math.floor(Date.now() / 1000) + 86400,
            })
          );
          handleLoginSuccess(`mock_jwt_${mockJwt}`, activeStaff);
        } else {
          setErrorMessage('Invalid 4-digit security PIN. Please try again.');
          setPinDigits('');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Authentication error.');
        setPinDigits('');
      } finally {
        setIsLoading(false);
      }
    },
    [activeStaff, handleLoginSuccess]
  );


  // Clear All
  const handleClear = () => {
    setPinDigits('');
    setErrorMessage(null);
  };

  // Fast Tap NFC Badge Login Simulation
  const handleNfcFastTap = () => {
    setIsNfcTapping(true);
    setErrorMessage(null);
    setTimeout(() => {
      setIsNfcTapping(false);
      const mockJwt = btoa(
        JSON.stringify({
          id: activeStaff._id || activeStaff.id,
          name: activeStaff.name,
          email: activeStaff.email,
          role: 'WAITER',
          exp: Math.floor(Date.now() / 1000) + 86400,
        })
      );
      handleLoginSuccess(`nfc_jwt_${mockJwt}`, activeStaff);
    }, 1000);
  };

  // Biometric Scan Simulation
  const handleBioScan = () => {
    setIsBioScanning(true);
    setErrorMessage(null);
    setTimeout(() => {
      setIsBioScanning(false);
      const mockJwt = btoa(
        JSON.stringify({
          id: activeStaff._id || activeStaff.id,
          name: activeStaff.name,
          email: activeStaff.email,
          role: 'WAITER',
          exp: Math.floor(Date.now() / 1000) + 86400,
        })
      );
      handleLoginSuccess(`bio_jwt_${mockJwt}`, activeStaff);
    }, 1200);
  };

  // Custom Staff Entry
  const handleCustomStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStaffName.trim()) return;
    const newStaff: OnDutyStaff = {
      id: `staff_custom_${Date.now()}`,
      name: customStaffName.trim(),
      email: `${customStaffName.toLowerCase().replace(/\s+/g, '')}@restro.com`,
      role: 'WAITER',
      designation: 'Floor Captain',
      tables_assigned: 'Section Assigned',
      pin: customPinInput || '1234',
    };
    setStaffList((prev) => [newStaff, ...prev]);
    setSelectedStaffId(newStaff.id);
    setCustomStaffModalOpen(false);
    setCustomStaffName('');
    setCustomPinInput('');
  };

  return (
    <div className="bg-[#FAF8F5] font-sans text-sm text-[#1B1C1A] min-h-screen flex flex-col antialiased selection:bg-[#FFDBCF] selection:text-[#390C00]">
      <main className="flex-1 flex flex-col relative w-full max-w-[480px] mx-auto bg-[#FAF8F5] pt-2 pb-6">
        <div className="flex flex-col w-full pb-8">
          {/* Top App & Outlet Context Header */}
          <header className="flex flex-col px-4 pt-3 pb-3 bg-[#F5F3F0] shadow-sm border-b border-stone-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#A73400] flex items-center justify-center text-white shadow-sm">
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    restaurant
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h1 className="font-display font-extrabold text-base text-[#1B1C1A] tracking-tight">
                      Restro Manage
                    </h1>
                    <span className="bg-[#FFDBCA] text-[#331200] text-[10px] px-1.5 py-0.5 rounded font-display font-semibold tracking-wider uppercase">
                      POS Handheld
                    </span>
                  </div>
                  <p className="text-xs text-[#594139] flex items-center gap-1 mt-0.5 font-medium">
                    <span>{currentOutlet}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOutletSwitchOpen(true)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#EAE8E5] hover:bg-[#E4E2DF] text-[#594139] text-xs font-semibold transition-all active:scale-95 border border-stone-200"
                type="button"
                title="Switch Restaurant Outlet"
              >
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                <span>Switch</span>
              </button>
            </div>

            {/* Live Status Strip */}
            <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-stone-200 text-xs">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00873A] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006B2C]" />
                </span>
                <span className="text-xs text-[#594139] font-medium">
                  Live Synced ({latency}ms)
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[#594139]">
                <span className="material-symbols-outlined text-[14px]">table_bar</span>
                <span className="text-xs font-medium">
                  Station: {activeStaff?.tables_assigned || 'Floor T-01 to T-12'}
                </span>
              </div>
            </div>
          </header>

          {/* Active Staff Profile Quick-Switcher */}
          <section className="mt-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <span className="material-symbols-outlined text-[#A73400] text-[18px]">badge</span>
                <span className="font-display text-xs text-[#1B1C1A] uppercase tracking-wider font-bold">
                  On-Duty Floor Staff
                </span>
              </div>
              <span className="text-xs text-[#594139] font-medium">
                {staffList.length} Active
              </span>
            </div>

            <div
              className="flex space-x-2.5 overflow-x-auto pb-1.5 pt-0.5 -mx-4 px-4 scrollbar-none"
              id="staff-switcher"
            >
              {staffList.map((staff) => {
                const isSelected = (staff._id || staff.id) === selectedStaffId;
                const staffId = staff._id || staff.id;

                return (
                  <button
                    key={staffId}
                    onClick={() => {
                      setSelectedStaffId(staffId);
                      setPinDigits('');
                      setErrorMessage(null);
                    }}
                    className={`staff-card relative flex-shrink-0 flex items-center p-2 rounded-xl bg-white shadow-sm text-left transition-all w-[165px] active:scale-[0.98] border ${
                      isSelected
                        ? 'border-2 border-[#A73400] opacity-100 ring-2 ring-[#A73400]/20'
                        : 'border-stone-200 opacity-85 hover:opacity-100'
                    }`}
                    type="button"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[#FFDBCF] flex items-center justify-center mr-2.5 border border-stone-200">
                      {staff.avatar_url ? (
                        <img
                          src={staff.avatar_url}
                          alt={staff.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-display font-bold text-xs text-[#594139]">
                          {staff.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      )}
                      {isSelected && (
                        <span className="absolute bottom-0 right-0 bg-[#A73400] text-white rounded-full p-0.5 shadow-sm">
                          <span
                            className="material-symbols-outlined text-[10px] block leading-none"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xs text-[#1B1C1A] font-bold truncate">
                        {staff.name}
                      </p>
                      <p
                        className={`text-[11px] truncate font-semibold ${
                          isSelected ? 'text-[#A73400]' : 'text-[#594139]'
                        }`}
                      >
                        {staff.designation || 'Captain'}
                      </p>
                      <span className="inline-block font-mono text-[10px] text-[#594139] truncate">
                        {staff.tables_assigned || 'Main Dining'}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Quick Option: Other Staff */}
              <button
                onClick={() => setCustomStaffModalOpen(true)}
                className="flex-shrink-0 flex items-center justify-center px-3 rounded-xl bg-[#EAE8E5] hover:bg-[#E4E2DF] text-[#594139] text-xs font-semibold space-x-1 active:scale-95 border border-stone-200"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="whitespace-nowrap">Other PIN</span>
              </button>
            </div>
          </section>

          {/* Shift & Station Reassurance Banner */}
          <section className="mt-2.5 px-4">
            <div className="bg-[#F5F3F0] rounded-xl p-3 shadow-sm flex items-start space-x-2.5 border border-stone-200">
              <div className="w-7 h-7 rounded-lg bg-[#E4E2DF] flex items-center justify-center text-[#A73400] flex-shrink-0 mt-0.5 shadow-xs">
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  schedule
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs text-[#1B1C1A] font-bold">
                    {shiftInfo.title}
                  </span>
                  <span className="text-xs text-[#006B2C] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006B2C] animate-pulse" />
                    Clocked In
                  </span>
                </div>
                <p className="text-xs text-[#594139] mt-0.5 font-normal">
                  {shiftInfo.hours} •{' '}
                  <span className="font-semibold text-[#1B1C1A]">{shiftInfo.section}</span>
                </p>
              </div>
            </div>
          </section>

          {/* NFC / RFID Quick Tap Bar */}
          <div className="px-4 mt-2">
            <button
              onClick={handleNfcFastTap}
              disabled={isNfcTapping}
              className={`w-full bg-white rounded-xl p-2.5 flex items-center justify-between shadow-sm border border-stone-200 text-left transition-all active:scale-[0.99] hover:bg-stone-50 ${
                isNfcTapping ? 'ring-2 ring-[#006B2C] bg-emerald-50' : ''
              }`}
              type="button"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFDBCA] flex items-center justify-center text-[#331200] shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">contactless</span>
                </div>
                <div>
                  <p className="font-display text-xs text-[#1B1C1A] font-bold">
                    {isNfcTapping ? 'Authenticating NFC Badge...' : 'Fast Tap Card Ready'}
                  </p>
                  <p className="text-[11px] text-[#594139]">
                    Hold staff NFC badge to handheld rear
                  </p>
                </div>
              </div>
              <span
                className={`material-symbols-outlined text-[#9B4500] text-[22px] ${
                  isNfcTapping ? 'animate-spin' : 'animate-pulse'
                }`}
              >
                {isNfcTapping ? 'sync' : 'sensors'}
              </span>
            </button>
          </div>

          {/* PIN Entry Section */}
          <section className="mt-3 px-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#594139]">Floor Security PIN</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPin(!showPin)}
                  className="text-xs text-[#594139] hover:text-[#1B1C1A] font-semibold flex items-center gap-1 transition-all py-1 px-1.5 rounded"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {showPin ? 'visibility_off' : 'visibility'}
                  </span>
                  <span>{showPin ? 'Hide' : 'Show'}</span>
                </button>
                <button
                  onClick={handleClear}
                  className="text-xs text-[#A73400] font-bold hover:underline transition-all py-1 px-2 rounded active:bg-[#FFDBCF]/20"
                  id="pin-clear"
                  type="button"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="w-full mb-2 bg-[#FFDAD6] border border-[#BA1A1A]/30 text-[#BA1A1A] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Separate Modern PIN Boxes */}
            <div className="w-full bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center border border-stone-200">
              <p className="font-display font-semibold text-sm text-[#1B1C1A] text-center mb-1">
                Enter 4-Digit PIN for{' '}
                <span className="text-[#A73400] font-bold">{activeStaff.name}</span>
              </p>
              <p className="text-xs text-[#594139] mb-4 text-center">
                Default PIN: <span className="font-mono font-bold text-[#A73400]">1234</span>
              </p>

              {/* 4 Separate Styled PIN Boxes (Box 1, Box 2, Box 3, Box 4) */}
              <div
                onClick={() => pinInputRef.current?.focus()}
                className="relative flex items-center justify-center gap-3 my-2 cursor-pointer select-none"
              >
                {/* Invisible input capturing native mobile & desktop input */}
                <input
                  ref={pinInputRef}
                  id="pin-input"
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  autoFocus
                  value={pinDigits}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPinDigits(val);
                    setErrorMessage(null);
                    if (val.length === 4) {
                      submitPin(val);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  autoComplete="one-time-code"
                />

                {[0, 1, 2, 3].map((idx) => {
                  const digit = pinDigits[idx];
                  const isFilled = Boolean(digit);
                  const isActive =
                    isInputFocused &&
                    (pinDigits.length === idx || (idx === 3 && pinDigits.length === 4));

                  return (
                    <div
                      key={idx}
                      className={`w-14 h-16 sm:w-16 sm:h-18 rounded-2xl flex items-center justify-center font-mono text-2xl font-extrabold transition-all duration-150 border-2 ${
                        isActive
                          ? 'border-[#A73400] bg-white ring-4 ring-[#A73400]/15 scale-105 shadow-md text-[#A73400]'
                          : isFilled
                          ? 'border-[#A73400]/60 bg-white text-[#1B1C1A] shadow-xs'
                          : 'border-stone-200 bg-[#FAF8F5] text-stone-300'
                      }`}
                    >
                      {isFilled ? (
                        showPin ? (
                          <span>{digit}</span>
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full bg-[#1B1C1A] inline-block" />
                        )
                      ) : isActive ? (
                        <span className="w-0.5 h-6 bg-[#A73400] animate-pulse rounded-full" />
                      ) : (
                        <span className="text-xs text-stone-300 font-mono font-medium">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Primary CTA Action */}
          <section className="mt-4 px-4 w-full">
            <button
              onClick={() => submitPin(pinDigits)}
              disabled={isLoading || pinDigits.length < 4}
              className="w-full py-3.5 px-4 rounded-xl bg-[#A73400] hover:bg-[#CB4914] active:scale-[0.98] transition-all shadow-md text-white font-display text-sm font-bold flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
              type="button"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                  <span>Verifying Terminal Security...</span>
                </>
              ) : (
                <>
                  <span>Unlock Terminal &amp; Open Tables</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </section>

          {/* Recovery Links & Help */}
          <section className="mt-3 px-4 flex items-center justify-between text-center">
            <button
              onClick={() => setManagerModalOpen(true)}
              className="text-xs text-[#9B4500] font-semibold hover:underline flex items-center space-x-1 py-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">lock_reset</span>
              <span>Forgot PIN? Call Floor Mgr</span>
            </button>
            <a
              className="text-xs text-[#BA1A1A] font-semibold hover:underline flex items-center space-x-1 py-1"
              href="tel:555"
            >
              <span className="material-symbols-outlined text-[15px]">emergency</span>
              <span>Kitchen Hotline (Ext 11)</span>
            </a>
          </section>

          {/* Bottom Hardware & Security Footprint */}
          <footer className="mt-5 px-4 text-center">
            <div className="inline-flex items-center space-x-1.5 py-1 px-3 rounded-full bg-[#EFEEEB] text-[#594139] text-[11px] border border-stone-200">
              <span className="material-symbols-outlined text-[13px]">tablet_android</span>
              <span>Terminal #H-03 • Handheld Tab A</span>
              <span>•</span>
              <span>Auto-lock 90s</span>
            </div>
            <p className="text-[11px] text-[#594139]/70 mt-1.5">
              Confidential Guest POS Session • Restro OS v4.8.2
            </p>
          </footer>
        </div>

        {/* Modal: Outlet Switcher */}
        {isOutletSwitchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="font-display font-bold text-sm text-[#1B1C1A]">
                  Select Restaurant Outlet
                </span>
                <button
                  onClick={() => setIsOutletSwitchOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <div className="flex flex-col gap-2 mt-3">
                {OUTLETS.map((outlet) => (
                  <button
                    key={outlet}
                    onClick={() => {
                      setCurrentOutlet(outlet);
                      setIsOutletSwitchOpen(false);
                    }}
                    className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all ${
                      currentOutlet === outlet
                        ? 'bg-[#FFDBCA]/40 border-[#A73400] text-[#A73400] font-bold'
                        : 'bg-[#F5F3F0] border-stone-200 text-[#1B1C1A] hover:bg-[#EAE8E5]'
                    }`}
                  >
                    {outlet}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Floor Manager Contact */}
        {managerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FFDBCF] text-[#A73400] flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <h3 className="font-display font-bold text-base text-[#1B1C1A]">
                Floor Manager Assistance
              </h3>
              <p className="text-xs text-[#594139] mt-1">
                Please visit the central manager station or dial Manager Priya at extension{' '}
                <strong className="text-[#1B1C1A]">Ext 02</strong> to reset your handheld PIN.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setManagerModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-[#F5F3F0] text-xs font-bold text-[#1B1C1A]"
                >
                  Dismiss
                </button>
                <a
                  href="tel:02"
                  className="flex-1 py-2 rounded-xl bg-[#A73400] text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  Call Mgr
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Custom Staff / Other PIN */}
        {customStaffModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="font-display font-bold text-sm text-[#1B1C1A]">
                  Log In With Other Staff Member
                </span>
                <button
                  onClick={() => setCustomStaffModalOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCustomStaffSubmit} className="mt-3 flex flex-col gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1B1C1A]">Staff Name *</label>
                  <input
                    type="text"
                    required
                    value={customStaffName}
                    onChange={(e) => setCustomStaffName(e.target.value)}
                    placeholder="e.g. Suresh N."
                    className="p-2 rounded-lg bg-[#F5F3F0] border border-stone-200 focus:outline-none focus:bg-white text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1B1C1A]">4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={customPinInput}
                    onChange={(e) => setCustomPinInput(e.target.value)}
                    placeholder="Default: 1234"
                    className="p-2 rounded-lg bg-[#F5F3F0] border border-stone-200 focus:outline-none focus:bg-white text-xs font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setCustomStaffModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-[#F5F3F0] font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#A73400] text-white font-bold text-xs shadow-sm"
                  >
                    Select Staff
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
