import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { toEnglishDigits, toGujaratiDigits } from '../utils/dateUtils';

const AppContext = createContext();

export const CURRENT_SYSTEM_YEAR = '૨૦૨૬-૨૦૨૭';

const DEFAULT_YEARS = [
  { id: 1, year_name: '૨૦૨૬-૨૦૨૭', name: '૨૦૨૬-૨૦૨૭', is_current: 1, is_locked: 0 },
  { id: 2, year_name: '૨૦૨૫-૨૦૨૬', name: '૨૦૨૫-૨૦૨૬', is_current: 0, is_locked: 1 },
  { id: 3, year_name: '૨૦૨૪-૨૦૨૫', name: '૨૦૨૪-૨૦૨૫', is_current: 0, is_locked: 1 },
  { id: 4, year_name: '૨૦૨૩-૨૦૨૪', name: '૨૦૨૩-૨૦૨૪', is_current: 0, is_locked: 1 },
  { id: 5, year_name: '૨૦૨૨-૨૦૨૩', name: '૨૦૨૨-૨૦૨૩', is_current: 0, is_locked: 1 }
];

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export function AppProvider({ children }) {
  const [societyInfo, setSocietyInfo] = useState({
    name: 'શ્રી ભારૂંડી જૂથ પિયત સહકારી મંડળી લિમિટેડ',
    sub_title: 'તા. ઓલપાડ, જી. સુરત (ગુજરાત)',
    subTitle: 'તા. ઓલપાડ, જી. સુરત (ગુજરાત)',
    reg_no: 'સુરત / પીવાયટી / ૧૪૨૮૫ / ૧૯૮૫',
    regNo: 'સુરત / પીવાયટી / ૧૪૨૮૫ / ૧૯૮૫',
    pramukh: 'રમેશભાઈ વલ્લભભાઈ પટેલ',
    mantri: 'દિનેશભાઈ છગનભાઈ ચૌધરી',
    phone: '૦૨૬૧-૨૪૫૬૮૯, ૯૮૨૫૦ ૧૨૩૪૫',
    address: 'મુ. પો. ભારૂંડી, તા. ઓલપાડ, જી. સુરત - ૩૯૪૪૧૦'
  });

  const [yearsList, setYearsList] = useState(DEFAULT_YEARS);
  const [activeYear, setActiveYear] = useState(() => {
    try {
      return sessionStorage.getItem('bharundi_active_year') || CURRENT_SYSTEM_YEAR;
    } catch (e) {
      return CURRENT_SYSTEM_YEAR;
    }
  });
  const [activeSeason, setActiveSeason] = useState('ચોમાસુ (ખરીફ)');

  // Refresh years list from database
  const refreshYears = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/masters/years`).then((r) => r.json());
      if (res.success && res.data?.length > 0) {
        setYearsList(res.data);
      }
    } catch (err) {
      console.warn('Years fetch error:', err);
    }
  }, []);

  // Check if any given year is locked (Rule: is_locked=1 OR not current active year)
  const isRecordLocked = useCallback((recordYear) => {
    if (!recordYear) return false;
    const targetNorm = toEnglishDigits(String(recordYear)).trim();
    const targetGuj = toGujaratiDigits(targetNorm);

    const found = (yearsList || []).find((y) => {
      const yName = y.year_name || y.name || '';
      const yNorm = toEnglishDigits(yName).trim();
      return yNorm === targetNorm || yName === recordYear || yName === targetGuj;
    });

    if (found) {
      return Boolean(found.is_locked) || !Boolean(found.is_current);
    }

    // If not found in list, check if matches any year with is_current === 1
    const curr = (yearsList || []).find((y) => Boolean(y.is_current));
    if (curr) {
      const currNorm = toEnglishDigits(curr.year_name || curr.name || '').trim();
      return targetNorm !== currNorm;
    }

    return false;
  }, [yearsList]);

  // Is the currently active session year locked?
  const isYearLocked = useMemo(() => {
    return isRecordLocked(activeYear);
  }, [isRecordLocked, activeYear]);

  const isCurrentYear = useMemo(() => {
    return !isYearLocked;
  }, [isYearLocked]);

  const canModify = !isYearLocked;

  // ડેટાબેઝમાંથી સોસાયટી પ્રોફાઇલ અને સક્રિય વર્ષ/ઋતુ લોડ કરો
  useEffect(() => {
    fetch(`${API_BASE}/masters/company-profile`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setSocietyInfo({
            name: res.data.name || 'શ્રી ભારૂંડી જૂથ પિયત સહકારી મંડળી લિમિટેડ',
            subTitle: res.data.sub_title || res.data.subTitle || 'તા. ઓલપાડ, જી. સુરત (ગુજરાત)',
            sub_title: res.data.sub_title || res.data.subTitle || 'તા. ઓલપાડ, જી. સુરત (ગુજરાત)',
            regNo: res.data.reg_no || res.data.regNo || '',
            reg_no: res.data.reg_no || res.data.regNo || '',
            pramukh: res.data.pramukh || '',
            mantri: res.data.mantri || '',
            phone: res.data.phone || '',
            address: res.data.address || ''
          });
        }
      })
      .catch((err) => console.warn('Company profile fetch error:', err));

    fetch(`${API_BASE}/masters/years`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length > 0) {
          setYearsList(res.data);
          const current = res.data.find((y) => y.is_current === 1 || y.is_current === true);
          const savedActive = sessionStorage.getItem('bharundi_active_year');
          if (savedActive) {
            setActiveYear(savedActive);
          } else if (current) {
            const yr = current.year_name || current.name;
            setActiveYear(yr);
            sessionStorage.setItem('bharundi_active_year', yr);
          }
        }
      })
      .catch((err) => console.warn('Years fetch error:', err));

    fetch(`${API_BASE}/masters/seasons`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length > 0) {
          const current = res.data.find((s) => s.is_active === 1 || s.is_active === true);
          if (current) setActiveSeason(current.name);
          else setActiveSeason(res.data[0].name);
        }
      })
      .catch((err) => console.warn('Seasons fetch error:', err));
  }, []);

  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('bharundi_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return Boolean(sessionStorage.getItem('bharundi_token') && sessionStorage.getItem('bharundi_user'));
    } catch (e) {
      return false;
    }
  });

  // Global toast system
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success' | 'error' | 'warning' | 'info'
  });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const changeYear = (newYear) => {
    setActiveYear(newYear);
    sessionStorage.setItem('bharundi_active_year', newYear);
    const locked = isRecordLocked(newYear);
    if (locked) {
      showToast(`નાણાકીય વર્ષ બદલાયું: ${newYear} (પાછલું વર્ષ લૉક છે - ફક્ત વાંચવા અને પ્રિન્ટ માટે)`, 'warning');
    } else {
      showToast(`નાણાકીય વર્ષ બદલાયું: ${newYear} (સક્રિય ચાલુ વર્ષ - ઉમેરો/સુધારો/પ્રિન્ટ માન્ય)`, 'success');
    }
  };

  const changeSeason = (newSeason) => {
    setActiveSeason(newSeason);
    showToast(`ઋતુ બદલાઈ: ${newSeason}`, 'info');
  };

  const checkCanModify = (actionName = 'ફેરફાર', targetYear = activeYear) => {
    if (isRecordLocked(targetYear)) {
      showToast(`પાછલા લૉક કરેલા વર્ષ (${targetYear}) માં ફેરફાર અમાન્ય છે. ફક્ત વાંચવા (Read) અને પ્રિન્ટ (Print) ની પરવાનગી છે. ${actionName} શક્ય નથી.`, 'error');
      return false;
    }
    return true;
  };

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    if (token) sessionStorage.setItem('bharundi_token', token);
    if (userData) sessionStorage.setItem('bharundi_user', JSON.stringify(userData));
    try {
      localStorage.removeItem('bharundi_token');
      localStorage.removeItem('bharundi_user');
    } catch (e) {}
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('bharundi_token');
      sessionStorage.removeItem('bharundi_user');
      localStorage.removeItem('bharundi_token');
      localStorage.removeItem('bharundi_user');
    } catch (e) {}
    showToast('સફળતાપૂર્વક લૉગઆઉટ થયા.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        societyInfo,
        setSocietyInfo,
        activeYear,
        changeYear,
        activeSeason,
        changeSeason,
        yearsList,
        refreshYears,
        currentSystemYear: CURRENT_SYSTEM_YEAR,
        isCurrentYear,
        isYearLocked,
        isRecordLocked,
        canModify,
        checkCanModify,
        user,
        isAuthenticated,
        login,
        logout,
        showToast,
        showNotification: showToast,
        apiBase: API_BASE
      }}
    >
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', fontWeight: 'bold' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
