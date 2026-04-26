import React, { useState, useEffect } from 'react';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { ContractenPage } from './pages/ContractenPage';
import { TimelinePage } from './pages/TimelinePage';
import { Kosten } from './pages/Kosten';
import { Meldingen } from './pages/Meldingen';
import { Settings } from './pages/Settings';
import { ContractDetail } from './components/contracts/ContractDetail';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { useContracts } from './hooks/useContracts';
import { useSettings } from './hooks/useSettings';
import type { Page } from './components/layout/Sidebar';
import type { Contract } from './types';

const ONBOARDING_KEY = 'pactly_onboarded';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === 'true'
  );
  const [detailContract, setDetailContract] = useState<{ contract: Contract; returnPage: Page } | null>(null);

  // Counters to trigger modals in ContractenPage from the sidebar
  const [uploadTrigger, setUploadTrigger] = useState(0);
  const [addAboTrigger, setAddAboTrigger] = useState(0);

  const {
    contracts, addContract, updateContract, deleteContract, refreshStatuses,
    notifications, markNotificationRead, markAllRead,
  } = useContracts();
  const { settings, updateSettings } = useSettings();

  // Refresh statuses when tab regains focus
  useEffect(() => {
    const handler = () => refreshStatuses();
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, [refreshStatuses]);

  const handleStart = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setOnboarded(true);
  };

  if (!onboarded) {
    return <Onboarding onStart={handleStart} />;
  }

  const members      = settings.householdMembers;
  const urgentCount  = contracts.filter(c => c.status === 'urgent' || c.status === 'evalueer').length;
  const unreadCount  = notifications.filter(n => !n.read).length;

  const handleUploadContract = () => {
    setPage('contracts');
    setDetailContract(null);
    setUploadTrigger(n => n + 1);
  };

  const handleAddAbonnement = () => {
    setPage('abonnements');
    setDetailContract(null);
    setAddAboTrigger(n => n + 1);
  };

  const sidebarProps = {
    current: page,
    urgentCount,
    unreadCount,
    onUploadContract: handleUploadContract,
    onAddAbonnement: handleAddAbonnement,
  };

  // Full-screen contract detail view (navigated from Dashboard upcoming list)
  if (detailContract) {
    return (
      <div className="flex h-screen overflow-hidden bg-light">
        <Sidebar {...sidebarProps} onChange={p => { setDetailContract(null); setPage(p); }} />
        <main className="flex-1 overflow-hidden flex flex-col bg-light">
          <ContractDetail
            contract={detailContract.contract}
            members={members}
            onBack={() => setDetailContract(null)}
            onUpdate={(id, data) => {
              updateContract(id, data);
              setDetailContract(d => d ? { ...d, contract: { ...d.contract, ...data } as Contract } : null);
            }}
            onDelete={id => {
              deleteContract(id);
              setDetailContract(null);
            }}
          />
        </main>
        <BottomNav current={page} onChange={p => { setDetailContract(null); setPage(p); }} urgentCount={urgentCount} unreadCount={unreadCount} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-light">
      {/* Desktop sidebar */}
      <Sidebar {...sidebarProps} onChange={setPage} />

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col bg-light">
        {page === 'dashboard' && (
          <Dashboard
            contracts={contracts}
            members={members}
            userName={settings.userName}
            unreadCount={unreadCount}
            onNavigate={setPage}
            onSelectContract={(c, returnPage) => setDetailContract({ contract: c, returnPage })}
          />
        )}
        {page === 'contracts' && (
          <ContractenPage
            typeFilter="contract"
            contracts={contracts}
            members={members}
            onAdd={addContract}
            onUpdate={updateContract}
            onDelete={deleteContract}
            uploadTrigger={uploadTrigger}
          />
        )}
        {page === 'abonnements' && (
          <ContractenPage
            typeFilter="abonnement"
            contracts={contracts}
            members={members}
            onAdd={addContract}
            onUpdate={updateContract}
            onDelete={deleteContract}
            addTrigger={addAboTrigger}
          />
        )}
        {page === 'timeline' && (
          <TimelinePage
            contracts={contracts}
            onUpdate={updateContract}
            onDelete={deleteContract}
          />
        )}
        {page === 'kosten' && (
          <Kosten
            contracts={contracts}
            members={members}
          />
        )}
        {page === 'meldingen' && (
          <Meldingen
            notifications={notifications}
            contracts={contracts}
            onMarkRead={markNotificationRead}
            onMarkAllRead={markAllRead}
            onGoToContract={(id) => {
              const c = contracts.find(x => x.id === id);
              if (c) setDetailContract({ contract: c, returnPage: 'meldingen' });
            }}
          />
        )}
        {page === 'settings' && (
          <Settings
            settings={settings}
            contracts={contracts}
            onUpdateSettings={updateSettings}
          />
        )}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav
        current={page}
        onChange={setPage}
        urgentCount={urgentCount}
        unreadCount={unreadCount}
      />
    </div>
  );
}
