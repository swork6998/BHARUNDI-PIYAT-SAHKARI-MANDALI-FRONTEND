import React, { createContext, useContext, useState, useCallback } from 'react';

const DataContext = createContext();

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export function DataProvider({ children }) {
  // પેજ-વાઇઝ લોડિંગ ફ્લેગ્સ
  const [loading, setLoading] = useState(false);

  // ૧. માસ્ટર્સ સ્ટેટ્સ (શરૂઆતમાં ખાલી, પેજ પર જતી વખતે જ API કૉલથી ભરાશે)
  const [financialYears, setFinancialYears] = useState([]);
  const [villages, setVillages] = useState([]);
  const [canals, setCanals] = useState([]);
  const [subCanals, setSubCanals] = useState([]);
  const [crops, setCrops] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [banks, setBanks] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(null);

  // ૨. સભાસદો સ્ટેટ
  const [members, setMembers] = useState([]);

  // ૩. ભાવ પત્રક સ્ટેટ
  const [bhavPatrak, setBhavPatrak] = useState([]);

  // ૪. પિયાત એન્ટ્રીઓ અને બિલો સ્ટેટ
  const [piyatEntries, setPiyatEntries] = useState([]);

  // ૫. શેર મૂડી સ્ટેટ
  const [shares, setShares] = useState([]);

  // ૬. ખાતાઓ અને હિસાબો સ્ટેટ
  const [accountGroups, setAccountGroups] = useState([]);
  const [generalAccounts, setGeneralAccounts] = useState([]);
  const [subAccounts, setSubAccounts] = useState([]);
  const [receiptBooks, setReceiptBooks] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  // ======================================================================================
  // પેજ-વાઇઝ ડેટા ફેચિંગ ફંક્શન્સ (Page-wise API Calls - ફક્ત જરૂરિયાત મુજબ જ કૉલ થશે)
  // ======================================================================================

  // ૧. ગામ માસ્ટર ફેચ
  const fetchVillages = useCallback(async (options) => {
    try {
      const { page, limit, search } = typeof options === 'object' ? options : {};
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page);
      if (limit !== undefined) params.append('limit', limit);
      if (search) params.append('search', search);

      const qs = params.toString();
      const url = qs ? `${API_BASE}/masters/villages?${qs}` : `${API_BASE}/masters/villages`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setVillages(json.data);
        return { data: json.data, total: json.total || json.data.length, totalPages: json.totalPages || 1 };
      }
    } catch (e) {
      console.error('fetchVillages error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૨. નહેર અને શાખા નહેર ફેચ
  const fetchCanals = useCallback(async (options) => {
    try {
      const { page, limit, search } = typeof options === 'object' ? options : {};
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page);
      if (limit !== undefined) params.append('limit', limit);
      if (search) params.append('search', search);

      const qs = params.toString();
      const url = qs ? `${API_BASE}/masters/canals?${qs}` : `${API_BASE}/masters/canals`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        if (json.canals) setCanals(json.canals);
        if (json.subCanals) setSubCanals(json.subCanals);
        return json;
      }
    } catch (e) {
      console.error('fetchCanals error:', e);
    }
    return { canals: [], subCanals: [], total: 0 };
  }, []);

  // ૨.૧ શાખા નહેર ફેચ (Server-Side Pagination & Search)
  const fetchSubCanals = useCallback(async (options) => {
    try {
      const { page, limit, search } = typeof options === 'object' ? options : {};
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page);
      if (limit !== undefined) params.append('limit', limit);
      if (search) params.append('search', search);

      const qs = params.toString();
      const url = qs ? `${API_BASE}/masters/sub-canals?${qs}` : `${API_BASE}/masters/sub-canals`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setSubCanals(json.data);
        return { data: json.data, total: json.total || json.data.length, totalPages: json.totalPages || 1 };
      }
    } catch (e) {
      console.error('fetchSubCanals error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૩. પાક માસ્ટર ફેચ
  const fetchCrops = useCallback(async (options) => {
    try {
      const { page, limit, search } = typeof options === 'object' ? options : {};
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page);
      if (limit !== undefined) params.append('limit', limit);
      if (search) params.append('search', search);

      const qs = params.toString();
      const url = qs ? `${API_BASE}/masters/crops?${qs}` : `${API_BASE}/masters/crops`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setCrops(json.data);
        return { data: json.data, total: json.total || json.data.length, totalPages: json.totalPages || 1 };
      }
    } catch (e) {
      console.error('fetchCrops error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૪. ઋતુ માસ્ટર ફેચ
  const fetchSeasons = useCallback(async (options) => {
    try {
      const { page, limit, search } = typeof options === 'object' ? options : {};
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page);
      if (limit !== undefined) params.append('limit', limit);
      if (search) params.append('search', search);

      const qs = params.toString();
      const url = qs ? `${API_BASE}/masters/seasons?${qs}` : `${API_BASE}/masters/seasons`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setSeasons(json.data);
        return { data: json.data, total: json.total || json.data.length, totalPages: json.totalPages || 1 };
      }
    } catch (e) {
      console.error('fetchSeasons error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૫. બેંક માસ્ટર ફેચ
  const fetchBanks = useCallback(async (options) => {
    try {
      const { page, limit, search } = typeof options === 'object' ? options : {};
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page);
      if (limit !== undefined) params.append('limit', limit);
      if (search) params.append('search', search);

      const qs = params.toString();
      const url = qs ? `${API_BASE}/masters/banks?${qs}` : `${API_BASE}/masters/banks`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setBanks(json.data);
        return { data: json.data, total: json.total || json.data.length, totalPages: json.totalPages || 1 };
      }
    } catch (e) {
      console.error('fetchBanks error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૬. નાણાકીય વર્ષ ફેચ
  const fetchFinancialYears = useCallback(async (options) => {
    try {
      const { page, limit, search } = typeof options === 'object' ? options : {};
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page);
      if (limit !== undefined) params.append('limit', limit);
      if (search) params.append('search', search);

      const qs = params.toString();
      const url = qs ? `${API_BASE}/masters/years?${qs}` : `${API_BASE}/masters/years`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setFinancialYears(json.data);
        return { data: json.data, total: json.total || json.data.length, totalPages: json.totalPages || 1 };
      }
    } catch (e) {
      console.error('fetchFinancialYears error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૭. મંડળી પ્રોફાઇલ ફેચ
  const fetchCompanyProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/masters/company-profile`);
      const json = await res.json();
      if (json.success && json.data) {
        setCompanyProfile(json.data);
        return json.data;
      }
    } catch (e) {
      console.error('fetchCompanyProfile error:', e);
    }
    return null;
  }, []);

  // ૮. સભાસદો ફેચ (વર્ષ મુજબ ફિલ્ટર & Pagination)
  const fetchMembers = useCallback(async (options) => {
    try {
      let params = new URLSearchParams();
      if (typeof options === 'string') {
        params.append('year', options);
      } else if (options && typeof options === 'object') {
        if (options.year) params.append('year', options.year);
        if (options.village_id && options.village_id !== 'all') params.append('village_id', options.village_id);
        if (options.category && options.category !== 'all') params.append('category', options.category);
        if (options.search) params.append('search', options.search);
        if (options.page !== undefined) params.append('page', options.page);
        if (options.limit !== undefined) params.append('limit', options.limit);
      }
      const qs = params.toString();
      const url = qs ? `${API_BASE}/members?${qs}` : `${API_BASE}/members`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        const enriched = json.data.map((m) => ({
          ...m,
          member_code: m.member_no || m.member_code,
          memberNo: m.member_no || m.member_code,
          member_name_guj: m.name || m.member_name_guj,
          name: m.name || m.member_name_guj,
          father_husband_name: m.father_name || m.father_husband_name,
          fatherName: m.father_name || m.father_husband_name,
          mobile_no: m.phone || m.mobile_no,
          phone: m.phone || m.mobile_no,
          village_name_guj: m.village_name || m.village_name_guj,
          villageName: m.village_name || m.village_name_guj,
          village_id: m.village_id || m.villageId,
          villageId: m.village_id || m.villageId,
          share_balance: Number(m.share_amount) || Number(m.share_balance) || 1000,
          sharesCount: Number(m.shares_count) || Number(m.sharesCount) || 10,
          opening_balance: Number(m.opening_balance) || 0,
          openingBalance: Number(m.opening_balance) || 0,
          balanceType: m.balance_type || 'જમા',
          category: m.category || 'સભાસદ',
          status: m.status || 'ચાલુ'
        }));
        setMembers(enriched);
        return { data: enriched, total: json.total || enriched.length, totalPages: json.totalPages || 1 };
      }
    } catch (e) {
      console.error('fetchMembers error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૮.૧. તમામ ખેડૂત જમીન અને બ્લોક વિગત ફેચ (Server-Side Pagination & Filters)
  const fetchMemberBlocks = useCallback(async (options = {}) => {
    try {
      const { page, limit, search, village_id } = options;
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page);
      if (limit !== undefined) params.append('limit', limit);
      if (search) params.append('search', search);
      if (village_id && village_id !== 'all') params.append('village_id', village_id);

      const qs = params.toString();
      const url = qs ? `${API_BASE}/members/blocks?${qs}` : `${API_BASE}/members/blocks`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        return json;
      }
    } catch (e) {
      console.error('fetchMemberBlocks error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૯. ભાવ પત્રક દર ફેચ
  const fetchBhavPatrak = useCallback(async (options, seasonOpt) => {
    try {
      let params = new URLSearchParams();
      if (typeof options === 'string') {
        params.append('year', options);
        if (seasonOpt) params.append('season', seasonOpt);
      } else if (options && typeof options === 'object') {
        if (options.year) params.append('year', options.year);
        if (options.season && options.season !== 'all') params.append('season', options.season);
        if (options.search) params.append('search', options.search);
        if (options.page !== undefined) params.append('page', options.page);
        if (options.limit !== undefined) params.append('limit', options.limit);
      }
      const qs = params.toString();
      const url = qs ? `${API_BASE}/rates?${qs}` : `${API_BASE}/rates`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setBhavPatrak(json.data);
        return { data: json.data, total: json.total || json.data.length, totalPages: json.totalPages || 1 };
      }
    } catch (e) {
      console.error('fetchBhavPatrak error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૧૦. પિયાત એન્ટ્રીઓ ફેચ (વર્ષ, ઋતુ & Pagination)
  const fetchPiyatEntries = useCallback(async (options, seasonOpt) => {
    try {
      let params = new URLSearchParams();
      if (typeof options === 'string') {
        params.append('year', options);
        if (seasonOpt) params.append('season', seasonOpt);
      } else if (options && typeof options === 'object') {
        if (options.year) params.append('year', options.year);
        if (options.season && options.season !== 'all') params.append('season', options.season);
        if (options.village_id && options.village_id !== 'all') params.append('village_id', options.village_id);
        if (options.is_billed !== undefined && options.is_billed !== 'all') params.append('is_billed', options.is_billed);
        if (options.from_date || options.fromDate) params.append('from_date', options.from_date || options.fromDate);
        if (options.to_date || options.toDate) params.append('to_date', options.to_date || options.toDate);
        if (options.search) params.append('search', options.search);
        if (options.page !== undefined) params.append('page', options.page);
        if (options.limit !== undefined) params.append('limit', options.limit);
      }
      const qs = params.toString();
      const url = qs ? `${API_BASE}/piyat?${qs}` : `${API_BASE}/piyat`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        const enriched = json.data.map((p) => ({
          ...p,
          member_name_guj: p.member_name || p.member_name_guj,
          member_code: p.member_no || p.member_code,
          crop_name_guj: p.crop_name || p.crop_name_guj
        }));
        setPiyatEntries(enriched);
        return { data: enriched, total: json.total || enriched.length, totalPages: json.totalPages || 1 };
      }
    } catch (e) {
      console.error('fetchPiyatEntries error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૧૧. શેર મૂડી ફેચ (વર્ષ મુજબ ફિલ્ટર & Pagination)
  const fetchShares = useCallback(async (options) => {
    try {
      let params = new URLSearchParams();
      if (typeof options === 'string') {
        params.append('year', options);
      } else if (options && typeof options === 'object') {
        if (options.year) params.append('year', options.year);
        if (options.member_id) params.append('member_id', options.member_id);
        if (options.search) params.append('search', options.search);
        if (options.page !== undefined) params.append('page', options.page);
        if (options.limit !== undefined) params.append('limit', options.limit);
      }
      const qs = params.toString();
      const url = qs ? `${API_BASE}/shares?${qs}` : `${API_BASE}/shares`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setShares(json.data);
        return { data: json.data, total: json.total || json.data.length, totalPages: json.totalPages || 1 };
      }
    } catch (e) {
      console.error('fetchShares error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૧૧.૧. શેર ડિવિડન્ડ રજીસ્ટર ફેચ (Server-Side Pagination)
  const fetchDividendRegister = useCallback(async (options = {}) => {
    try {
      const { year, page, limit, search } = options;
      const params = new URLSearchParams();
      if (year) params.append('year', year);
      if (page !== undefined) params.append('page', page);
      if (limit !== undefined) params.append('limit', limit);
      if (search) params.append('search', search);

      const qs = params.toString();
      const url = qs ? `${API_BASE}/shares/dividend/register?${qs}` : `${API_BASE}/shares/dividend/register`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        return json;
      }
    } catch (e) {
      console.error('fetchDividendRegister error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૧૨. ખાતા જૂથો ફેચ (Server-Side Pagination & Search)
  const fetchAccountGroups = useCallback(async (options) => {
    try {
      const { page, limit, search } = typeof options === 'object' ? options : {};
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page);
      if (limit !== undefined) params.append('limit', limit);
      if (search) params.append('search', search);

      const qs = params.toString();
      const url = qs ? `${API_BASE}/accounts/groups?${qs}` : `${API_BASE}/accounts/groups`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setAccountGroups(json.data);
        return { data: json.data, total: json.total || json.data.length, totalPages: json.totalPages || 1 };
      }
    } catch (e) {
      console.error('fetchAccountGroups error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૧૩. જનરલ ખાતાઓ ફેચ (Server-Side Pagination & Search)
  const fetchGeneralAccounts = useCallback(async (options) => {
    try {
      const { page, limit, search } = typeof options === 'object' ? options : {};
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page);
      if (limit !== undefined) params.append('limit', limit);
      if (search) params.append('search', search);

      const qs = params.toString();
      const url = qs ? `${API_BASE}/accounts/general?${qs}` : `${API_BASE}/accounts/general`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setGeneralAccounts(json.data);
        return { data: json.data, total: json.total || json.data.length, totalPages: json.totalPages || 1 };
      }
    } catch (e) {
      console.error('fetchGeneralAccounts error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૧૪. પેટા ખાતાઓ ફેચ
  const fetchSubAccounts = useCallback(async (options = {}) => {
    try {
      const { page, limit, search } = typeof options === 'object' ? options : {};
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);

      const url = `${API_BASE}/accounts/sub${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setSubAccounts(json.data);
        return json;
      }
    } catch (e) {
      console.error('fetchSubAccounts error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૧૫. રસીદ બુકો ફેચ (Server-Side Pagination & Search)
  const fetchReceiptBooks = useCallback(async (options) => {
    try {
      const { page, limit, search } = typeof options === 'object' ? options : {};
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page);
      if (limit !== undefined) params.append('limit', limit);
      if (search) params.append('search', search);

      const qs = params.toString();
      const url = qs ? `${API_BASE}/accounts/receipt-books?${qs}` : `${API_BASE}/accounts/receipt-books`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setReceiptBooks(json.data);
        return { data: json.data, total: json.total || json.data.length, totalPages: json.totalPages || 1 };
      }
    } catch (e) {
      console.error('fetchReceiptBooks error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૧૫.૧ વપરાશકર્તાઓ ફેચ (Server-Side Pagination & Search)
  const fetchUsers = useCallback(async (options = {}) => {
    try {
      const { page, limit, search } = options;
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page);
      if (limit !== undefined) params.append('limit', limit);
      if (search) params.append('search', search);

      const qs = params.toString();
      const url = qs ? `${API_BASE}/auth/users?${qs}` : `${API_BASE}/auth/users`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        return json;
      }
    } catch (e) {
      console.error('fetchUsers error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  const addUser = async (userData) => {
    const res = await fetch(`${API_BASE}/auth/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await res.json();
  };

  // ૧૫.૨ ઓડિટ લૉગ્સ ફેચ (Server-Side Pagination & Search)
  const fetchAuditLogs = useCallback(async (options = {}) => {
    try {
      const { page, limit, search } = options;
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page);
      if (limit !== undefined) params.append('limit', limit);
      if (search) params.append('search', search);

      const qs = params.toString();
      const url = qs ? `${API_BASE}/auth/audit-logs?${qs}` : `${API_BASE}/auth/audit-logs`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        return json;
      }
    } catch (e) {
      console.error('fetchAuditLogs error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૧૬. રોકડ રસીદો ફેચ (Server-Side Pagination & Date Filter)
  const fetchReceipts = useCallback(async (options) => {
    try {
      let params = new URLSearchParams();
      if (typeof options === 'string') {
        params.append('year', options);
      } else if (options && typeof options === 'object') {
        if (options.year) params.append('year', options.year);
        if (options.search) params.append('search', options.search);
        if (options.page !== undefined) params.append('page', options.page);
        if (options.limit !== undefined) params.append('limit', options.limit);
        if (options.fromDate || options.from_date) params.append('from_date', options.fromDate || options.from_date);
        if (options.toDate || options.to_date) params.append('to_date', options.toDate || options.to_date);
      }
      const qs = params.toString();
      const url = qs ? `${API_BASE}/transactions/receipts?${qs}` : `${API_BASE}/transactions/receipts`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setReceipts(json.data);
        return { data: json.data, total: json.total || json.data.length, totalPages: json.totalPages || 1 };
      }
    } catch (e) {
      console.error('fetchReceipts error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ૧૭. વાઉચર્સ ફેચ (Server-Side Pagination & Date Filter)
  const fetchVouchers = useCallback(async (options) => {
    try {
      let params = new URLSearchParams();
      if (typeof options === 'string') {
        params.append('year', options);
      } else if (options && typeof options === 'object') {
        if (options.year) params.append('year', options.year);
        if (options.type && options.type !== 'all') params.append('type', options.type);
        if (options.search) params.append('search', options.search);
        if (options.page !== undefined) params.append('page', options.page);
        if (options.limit !== undefined) params.append('limit', options.limit);
        if (options.fromDate || options.from_date) params.append('from_date', options.fromDate || options.from_date);
        if (options.toDate || options.to_date) params.append('to_date', options.toDate || options.to_date);
      }
      const qs = params.toString();
      const url = qs ? `${API_BASE}/transactions/vouchers?${qs}` : `${API_BASE}/transactions/vouchers`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setVouchers(json.data);
        return { data: json.data, total: json.total || json.data.length, totalPages: json.totalPages || 1 };
      }
    } catch (e) {
      console.error('fetchVouchers error:', e);
    }
    return { data: [], total: 0 };
  }, []);

  // ======================================================================================
  // બેકએન્ડ API સાથે જોડાયેલ વાસ્તવિક CRUD ક્રિયાઓ (Real Database Mutations)
  // ======================================================================================

  // ૧. ગામ ઉમેરો / અપડેટ / ડિલીટ
  const addVillage = async (item) => {
    const res = await fetch(`${API_BASE}/masters/villages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateVillage = async (id, updated) => {
    const res = await fetch(`${API_BASE}/masters/villages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    return await res.json();
  };

  const deleteVillage = async (id) => {
    const res = await fetch(`${API_BASE}/masters/villages/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  // ૨. નહેર ઉમેરો / અપડેટ / ડિલીટ
  const addCanal = async (item) => {
    const res = await fetch(`${API_BASE}/masters/canals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateCanal = async (id, item) => {
    const res = await fetch(`${API_BASE}/masters/canals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deleteCanal = async (id) => {
    const res = await fetch(`${API_BASE}/masters/canals/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  // ૨.૧ શાખા નહેર
  const addSubCanal = async (item) => {
    const res = await fetch(`${API_BASE}/masters/sub-canals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateSubCanal = async (id, item) => {
    const res = await fetch(`${API_BASE}/masters/sub-canals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deleteSubCanal = async (id) => {
    const res = await fetch(`${API_BASE}/masters/sub-canals/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  // ૩. પાક માસ્ટર
  const addCrop = async (item) => {
    const res = await fetch(`${API_BASE}/masters/crops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateCrop = async (id, item) => {
    const res = await fetch(`${API_BASE}/masters/crops/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deleteCrop = async (id) => {
    const res = await fetch(`${API_BASE}/masters/crops/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  // ૪. ઋતુ માસ્ટર
  const addSeason = async (item) => {
    const res = await fetch(`${API_BASE}/masters/seasons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateSeason = async (id, item) => {
    const res = await fetch(`${API_BASE}/masters/seasons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deleteSeason = async (id) => {
    const res = await fetch(`${API_BASE}/masters/seasons/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  // ૫. બેંક માસ્ટર
  const addBank = async (item) => {
    const res = await fetch(`${API_BASE}/masters/banks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateBank = async (id, item) => {
    const res = await fetch(`${API_BASE}/masters/banks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deleteBank = async (id) => {
    const res = await fetch(`${API_BASE}/masters/banks/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  // ૫.૧ નાણાકીય વર્ષ માસ્ટર
  const addFinancialYear = async (item) => {
    const res = await fetch(`${API_BASE}/masters/years`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateFinancialYear = async (id, item) => {
    const res = await fetch(`${API_BASE}/masters/years/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deleteFinancialYear = async (id) => {
    const res = await fetch(`${API_BASE}/masters/years/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  const setCurrentFinancialYear = async (id) => {
    const res = await fetch(`${API_BASE}/masters/years/${id}/set-current`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  };

  const toggleLockFinancialYear = async (id) => {
    const res = await fetch(`${API_BASE}/masters/years/${id}/toggle-lock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  };

  // ૬. સભાસદ માસ્ટર
  const addMember = async (item) => {
    const payload = {
      member_no: item.memberNo || item.member_code,
      name: item.name || item.member_name_guj,
      father_name: item.fatherName || item.father_husband_name,
      village_id: item.villageId || item.village_id,
      category: item.category || 'સભાસદ',
      phone: item.phone || item.mobile_no,
      status: item.status || 'ચાલુ',
      join_date: item.joinDate || item.join_date,
      shares_count: item.sharesCount || 10,
      share_amount: item.shareAmount || 1000,
      opening_balance: item.openingBalance || 0,
      balance_type: item.balanceType || 'જમા',
      bank_name: item.bankName || item.bank_name,
      bank_ac_no: item.bankAcNo || item.bank_account_no,
      ifsc: item.ifsc,
      nominee_name: item.nomineeName,
      nominee_relation: item.nomineeRelation,
      nominee_age: item.nomineeAge,
      blocks: item.blocks
    };

    const res = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  };

  const updateMember = async (id, updated) => {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    return await res.json();
  };

  const deleteMember = async (id) => {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  // ૬.૧ જમીન / બ્લોક માસ્ટર
  const addMemberBlock = async (item) => {
    const res = await fetch(`${API_BASE}/members/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateMemberBlock = async (id, item) => {
    const res = await fetch(`${API_BASE}/members/blocks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deleteMemberBlock = async (id) => {
    const res = await fetch(`${API_BASE}/members/blocks/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  // ૭. ભાવ પત્રક દર
  const addBhavPatrak = async (item) => {
    const res = await fetch(`${API_BASE}/rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateBhavPatrak = async (id, item) => {
    const res = await fetch(`${API_BASE}/rates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deleteBhavPatrak = async (id) => {
    const res = await fetch(`${API_BASE}/rates/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  // ૮. પિયાત એન્ટ્રી
  const addPiyatEntry = async (item) => {
    const res = await fetch(`${API_BASE}/piyat/single`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updatePiyatEntry = async (id, item) => {
    const res = await fetch(`${API_BASE}/piyat/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deletePiyatEntry = async (id) => {
    const res = await fetch(`${API_BASE}/piyat/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  // ૯. શેર મૂડી
  const addShare = async (item) => {
    const res = await fetch(`${API_BASE}/shares/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateShare = async (id, item) => {
    const res = await fetch(`${API_BASE}/shares/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deleteShare = async (id) => {
    const res = await fetch(`${API_BASE}/shares/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  // ૧૦. ખાતાવહી અને વાઉચર્સ
  const addAccountGroup = async (item) => {
    const res = await fetch(`${API_BASE}/accounts/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateAccountGroup = async (id, item) => {
    const res = await fetch(`${API_BASE}/accounts/groups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deleteAccountGroup = async (id) => {
    const res = await fetch(`${API_BASE}/accounts/groups/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  const addGeneralAccount = async (item) => {
    const res = await fetch(`${API_BASE}/accounts/general`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateGeneralAccount = async (id, item) => {
    const res = await fetch(`${API_BASE}/accounts/general/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deleteGeneralAccount = async (id) => {
    const res = await fetch(`${API_BASE}/accounts/general/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  const addSubAccount = async (item) => {
    const res = await fetch(`${API_BASE}/accounts/sub`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateSubAccount = async (id, item) => {
    const res = await fetch(`${API_BASE}/accounts/sub/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deleteSubAccount = async (id) => {
    const res = await fetch(`${API_BASE}/accounts/sub/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  const addReceiptBook = async (item) => {
    const res = await fetch(`${API_BASE}/accounts/receipt-books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateReceiptBook = async (id, item) => {
    const res = await fetch(`${API_BASE}/accounts/receipt-books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deleteReceiptBook = async (id) => {
    const res = await fetch(`${API_BASE}/accounts/receipt-books/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  const addReceipt = async (item) => {
    const res = await fetch(`${API_BASE}/transactions/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateReceipt = async (id, item) => {
    const res = await fetch(`${API_BASE}/transactions/receipts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deleteReceipt = async (id) => {
    const res = await fetch(`${API_BASE}/transactions/receipts/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  const addVoucher = async (item) => {
    const res = await fetch(`${API_BASE}/transactions/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const updateVoucher = async (id, item) => {
    const res = await fetch(`${API_BASE}/transactions/vouchers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  };

  const deleteVoucher = async (id) => {
    const res = await fetch(`${API_BASE}/transactions/vouchers/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  };

  return (
    <DataContext.Provider
      value={{
        loading,
        setLoading,
        // પેજ-વાઇઝ ફેચર્સ
        fetchVillages,
        fetchCanals,
        fetchSubCanals,
        fetchCrops,
        fetchSeasons,
        fetchBanks,
        fetchFinancialYears,
        fetchCompanyProfile,
        fetchMembers,
        fetchBhavPatrak,
        fetchPiyatEntries,
        fetchShares,
        fetchAccountGroups,
        fetchGeneralAccounts,
        fetchSubAccounts,
        fetchReceiptBooks,
        fetchReceipts,
        fetchVouchers,
        fetchMemberBlocks,
        fetchDividendRegister,
        fetchUsers,
        addUser,
        fetchAuditLogs,
        // સ્ટેટ્સ અને ક્રિયાઓ
        financialYears,
        years: financialYears,
        setYears: setFinancialYears,
        addFinancialYear,
        updateFinancialYear,
        deleteFinancialYear,
        setCurrentFinancialYear,
        toggleLockFinancialYear,
        villages,
        addVillage,
        updateVillage,
        deleteVillage,
        canals,
        addCanal,
        updateCanal,
        deleteCanal,
        subCanals,
        addSubCanal,
        updateSubCanal,
        deleteSubCanal,
        crops,
        addCrop,
        updateCrop,
        deleteCrop,
        seasons,
        addSeason,
        updateSeason,
        deleteSeason,
        banks,
        addBank,
        updateBank,
        deleteBank,
        companyProfile,
        setCompanyProfile,
        members,
        setMembers,
        addMember,
        updateMember,
        deleteMember,
        addMemberBlock,
        updateMemberBlock,
        deleteMemberBlock,
        bhavPatrak,
        rates: bhavPatrak,
        setBhavPatrak,
        setRates: setBhavPatrak,
        addBhavPatrak,
        updateBhavPatrak,
        deleteBhavPatrak,
        piyatEntries,
        setPiyatEntries,
        addPiyatEntry,
        updatePiyatEntry,
        deletePiyatEntry,
        shares,
        setShares,
        addShare,
        updateShare,
        deleteShare,
        accountGroups,
        addAccountGroup,
        updateAccountGroup,
        deleteAccountGroup,
        generalAccounts,
        addGeneralAccount,
        updateGeneralAccount,
        deleteGeneralAccount,
        subAccounts,
        setSubAccounts,
        addSubAccount,
        updateSubAccount,
        deleteSubAccount,
        receiptBooks,
        addReceiptBook,
        updateReceiptBook,
        deleteReceiptBook,
        receipts,
        addReceipt,
        updateReceipt,
        deleteReceipt,
        vouchers,
        addVoucher,
        updateVoucher,
        deleteVoucher,
        apiBase: API_BASE
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
