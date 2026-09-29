import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { useApp } from './context/AppContext';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Dashboard
import Dashboard from './pages/Dashboard';

// Masters
import FinancialYearPage from './pages/masters/FinancialYearPage';
import CompanyProfilePage from './pages/masters/CompanyProfilePage';
import VillagePage from './pages/masters/VillagePage';
import CanalPage from './pages/masters/CanalPage';
import SubCanalPage from './pages/masters/SubCanalPage';
import CropPage from './pages/masters/CropPage';
import SeasonPage from './pages/masters/SeasonPage';
import BankPage from './pages/masters/BankPage';

// Members
import MemberListPage from './pages/members/MemberListPage';
import MemberFormPage from './pages/members/MemberFormPage';
import MemberLandPage from './pages/members/MemberLandPage';
import MemberOpeningPage from './pages/members/MemberOpeningPage';

// Rates
import BhavPatrakPage from './pages/rates/BhavPatrakPage';

// Piyat
import PiyatSingleEntryPage from './pages/piyat/PiyatSingleEntryPage';
import PiyatMultiEntryPage from './pages/piyat/PiyatMultiEntryPage';
import BillGenerationPage from './pages/piyat/BillGenerationPage';
import BillListPage from './pages/piyat/BillListPage';
import PiyatReportsPage from './pages/piyat/PiyatReportsPage';

// Shares
import ShareEntryPage from './pages/shares/ShareEntryPage';
import ShareTransferPage from './pages/shares/ShareTransferPage';
import ShareReturnPage from './pages/shares/ShareReturnPage';
import ShareLedgerPage from './pages/shares/ShareLedgerPage';
import DividendPage from './pages/shares/DividendPage';

// Accounts
import AccountGroupsPage from './pages/accounts/AccountGroupsPage';
import GeneralAccountsPage from './pages/accounts/GeneralAccountsPage';
import SubAccountsPage from './pages/accounts/SubAccountsPage';
import ReceiptBooksPage from './pages/accounts/ReceiptBooksPage';
import AccountOpeningPage from './pages/accounts/AccountOpeningPage';

// Transactions
import CashReceiptPage from './pages/transactions/CashReceiptPage';
import VoucherEntryPage from './pages/transactions/VoucherEntryPage';
import RojmelDayBookPage from './pages/transactions/RojmelDayBookPage';
import RojmelEditPage from './pages/transactions/RojmelEditPage';

// Reports
import RojmelPrintPage from './pages/reports/RojmelPrintPage';
import MainLedgerPage from './pages/reports/MainLedgerPage';
import MemberLedgerPage from './pages/reports/MemberLedgerPage';
import TrialBalancePage from './pages/reports/TrialBalancePage';
import TradingAccountPage from './pages/reports/TradingAccountPage';
import ProfitLossPage from './pages/reports/ProfitLossPage';
import BalanceSheetPage from './pages/reports/BalanceSheetPage';
import TarijPage from './pages/reports/TarijPage';
import NoticesPage from './pages/reports/NoticesPage';

// Utilities
import UserManagementPage from './pages/utilities/UserManagementPage';
import ChangePasswordPage from './pages/utilities/ChangePasswordPage';
import YearEndProcessPage from './pages/utilities/YearEndProcessPage';
import AccountLockPage from './pages/utilities/AccountLockPage';
import AuditLogsPage from './pages/utilities/AuditLogsPage';
import BackupRestorePage from './pages/utilities/BackupRestorePage';

export default function App() {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <MainLayout>
      <Routes>
        {/* મુખપૃષ્ઠ */}
        <Route path="/" element={<Dashboard />} />

        {/* ૧. માસ્ટર્સ સંચાલન */}
        <Route path="/masters/year" element={<FinancialYearPage />} />
        <Route path="/masters/company" element={<CompanyProfilePage />} />
        <Route path="/masters/villages" element={<VillagePage />} />
        <Route path="/masters/canals" element={<CanalPage />} />
        <Route path="/masters/sub-canals" element={<SubCanalPage />} />
        <Route path="/masters/crops" element={<CropPage />} />
        <Route path="/masters/seasons" element={<SeasonPage />} />
        <Route path="/masters/banks" element={<BankPage />} />

        {/* ૨. સભાસદ સંચાલન */}
        <Route path="/members" element={<MemberListPage />} />
        <Route path="/members/new" element={<MemberFormPage />} />
        <Route path="/members/edit/:id" element={<MemberFormPage />} />
        <Route path="/members/land" element={<MemberLandPage />} />
        <Route path="/members/opening" element={<MemberOpeningPage />} />

        {/* ૩. ભાવ પત્રક */}
        <Route path="/rates" element={<BhavPatrakPage />} />

        {/* ૪. પિયાત કામગીરી અને બિલિંગ */}
        <Route path="/piyat/single" element={<PiyatSingleEntryPage />} />
        <Route path="/piyat/multi" element={<PiyatMultiEntryPage />} />
        <Route path="/piyat/generate-bills" element={<BillGenerationPage />} />
        <Route path="/piyat/bills" element={<BillListPage />} />
        <Route path="/piyat/reports" element={<PiyatReportsPage />} />

        {/* ૫. શેર મૂડી અને ડિવિડન્ડ */}
        <Route path="/shares/entry" element={<ShareEntryPage />} />
        <Route path="/shares/transfer" element={<ShareTransferPage />} />
        <Route path="/shares/return" element={<ShareReturnPage />} />
        <Route path="/shares/ledger" element={<ShareLedgerPage />} />
        <Route path="/shares/dividend" element={<DividendPage />} />

        {/* ૬. ખાતાવહી માસ્ટર્સ */}
        <Route path="/accounts/groups" element={<AccountGroupsPage />} />
        <Route path="/accounts/general" element={<GeneralAccountsPage />} />
        <Route path="/accounts/sub" element={<SubAccountsPage />} />
        <Route path="/accounts/receipt-books" element={<ReceiptBooksPage />} />
        <Route path="/accounts/opening" element={<AccountOpeningPage />} />

        {/* ૭. વ્યવહારો અને રોજમેળ */}
        <Route path="/transactions/receipt" element={<CashReceiptPage />} />
        <Route path="/transactions/voucher" element={<VoucherEntryPage />} />
        <Route path="/transactions/rojmel" element={<RojmelDayBookPage />} />
        <Route path="/transactions/rojmel-edit" element={<RojmelEditPage />} />

        {/* ૮. નાણાકીય અહેવાલો */}
        <Route path="/reports/rojmel" element={<RojmelPrintPage />} />
        <Route path="/reports/ledger" element={<MainLedgerPage />} />
        <Route path="/reports/member-ledger" element={<MemberLedgerPage />} />
        <Route path="/reports/trial-balance" element={<TrialBalancePage />} />
        <Route path="/reports/trading" element={<TradingAccountPage />} />
        <Route path="/reports/profit-loss" element={<ProfitLossPage />} />
        <Route path="/reports/balance-sheet" element={<BalanceSheetPage />} />
        <Route path="/reports/tarij" element={<TarijPage />} />
        <Route path="/reports/notices" element={<NoticesPage />} />

        {/* ૯. યુટિલિટીઝ અને સુરક્ષા */}
        <Route path="/utilities/users" element={<UserManagementPage />} />
        <Route path="/utilities/change-password" element={<ChangePasswordPage />} />
        <Route path="/utilities/year-end" element={<YearEndProcessPage />} />
        <Route path="/utilities/lock" element={<AccountLockPage />} />
        <Route path="/utilities/audit" element={<AuditLogsPage />} />
        <Route path="/utilities/backup" element={<BackupRestorePage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}
