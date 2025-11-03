'use client';

import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Camera,
  CheckCircle,
  DollarSign,
  Gavel,
  LogOut,
  Settings,
  Star,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import AdminAuctions from './admin/AdminAuctions';
import AdminOverview from './admin/AdminOverview';
import AdminUsers from './admin/AdminUsers';

// Rozszerz Firebase User o właściwość role
declare module 'firebase/auth' {
  interface User {
    role?: string;
  }
}

interface StatsResponse {
  totalUsers: number;
  totalAuctions: number;
  totalTransactions: number;
  disputes: number;
}

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  startingPrice: number;
  currentPrice: number;
  buyNowPrice: number | null;
  reservePrice: number | null;
  startTime: string;
  endTime: string;
  status: string;
  isApproved: boolean;
  createdAt: string;
  seller: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface Bidder {
  id: string;
  amount: number;
  bidder: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  createdAt: string;
}

interface Transaction {
  id: string;
  amount: number;
  commission: number;
  status: 'pending' | 'completed' | 'disputed';
  createdAt: string;
  auction?: { title: string };
  buyer?: { firstName: string; lastName: string; email: string };
  seller?: { firstName: string; lastName: string; email: string };
}

interface Reference {
  id: string;
  breederName: string;
  dogName: string;
  status: string;
  location: string;
  experience: string;
  rating: number;
  testimonial: string;
  createdAt: string;
  isApproved: boolean;
  achievements?: Array<{
    pigeon: string;
    ringNumber: string;
    results?: Array<{
      place: string;
      competition: string;
      date: string;
    }>;
  }>;
}

interface Meeting {
  id: string;
  breederName: string;
  date: string;
  status: string;
  title: string;
  location: string;
  isApproved: boolean;
  user: {
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  notes?: string;
  description?: string;
  images?: string[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(10);
  const [usersRole, setUsersRole] = useState<string>('');
  const [usersStatus, setUsersStatus] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  }>({
    firstName: '',
    lastName: '',
    role: 'USER',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Auctions state
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [auctionsTotal, setAuctionsTotal] = useState(0);
  const [auctionsPage, setAuctionsPage] = useState(1);
  const [auctionsPageSize, setAuctionsPageSize] = useState(10);
  const [approving, setApproving] = useState<string | null>(null);
  const [auctionTab, setAuctionTab] = useState<'pending' | 'active'>('pending');
  const [activeAuctions, setActiveAuctions] = useState<Auction[]>([]);
  const [activeAuctionsTotal, setActiveAuctionsTotal] = useState(0);
  const [activeAuctionsPage, setActiveAuctionsPage] = useState(1);
  const [activeAuctionsPageSize, setActiveAuctionsPageSize] = useState(10);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [auctionBidders, setAuctionBidders] = useState<Bidder[]>([]);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [editingAuctionData, setEditingAuctionData] = useState<Partial<Auction>>({});

  // Transactions state
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [txsTotal, setTxsTotal] = useState(0);
  const [txsPage, setTxsPage] = useState(1);
  const [txsPageSize, setTxsPageSize] = useState(10);
  const [txsStatus, setTxsStatus] = useState<string>('');

  // References state
  const [references, setReferences] = useState<Reference[]>([]);
  const [, setReferencesTotal] = useState(0);
  const [referencesStatus, setReferencesStatus] = useState<'pending' | 'approved' | 'all'>(
    'pending'
  );

  // Meetings state
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [, setMeetingsTotal] = useState(0);
  const [meetingsStatus, setMeetingsStatus] = useState<'pending' | 'approved' | 'all'>('pending');

  const tabs = [
    { id: 'overview', label: 'Przegląd', icon: BarChart3 },
    { id: 'users', label: 'Użytkownicy', icon: Users },
    { id: 'auctions', label: 'Aukcje', icon: Gavel },
    { id: 'references', label: 'Referencje', icon: Star },
    { id: 'meetings', label: 'Spotkania', icon: Camera },
    { id: 'transactions', label: 'Transakcje', icon: DollarSign },
    { id: 'settings', label: 'Ustawienia', icon: Settings },
  ];

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania statystyk:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: usersPage.toString(),
        pageSize: usersPageSize.toString(),
        ...(usersRole && { role: usersRole }),
        ...(usersStatus && { status: usersStatus }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.items);
        setUsersTotal(data.total);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania użytkowników:', error);
    }
  }, [usersPage, usersPageSize, usersRole, usersStatus]);

  // Load auctions
  const loadAuctions = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: auctionsPage.toString(),
        pageSize: auctionsPageSize.toString(),
        status: 'PENDING',
      });

      const response = await fetch(`/api/admin/auctions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAuctions(data.items);
        setAuctionsTotal(data.total);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania aukcji:', error);
    }
  }, [auctionsPage, auctionsPageSize]);

  // Load active auctions
  const loadActiveAuctions = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: activeAuctionsPage.toString(),
        pageSize: activeAuctionsPageSize.toString(),
        status: 'ACTIVE',
      });

      const response = await fetch(`/api/admin/auctions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setActiveAuctions(data.items);
        setActiveAuctionsTotal(data.total);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania aktywnych aukcji:', error);
    }
  }, [activeAuctionsPage, activeAuctionsPageSize]);

  // User handlers
  const handleEditUser = useCallback((user: User) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      isActive: user.isActive,
    });
  }, []);

  const handleSaveUser = useCallback(async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await loadUsers();
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania użytkownika:', error);
    } finally {
      setSaving(false);
    }
  }, [editingUser, editForm, loadUsers]);

  const handleDeleteUser = useCallback(
    async (userId: string) => {
      setDeleting(true);
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await loadUsers();
        }
      } catch (error) {
        console.error('Błąd podczas usuwania użytkownika:', error);
      } finally {
        setDeleting(false);
      }
    },
    [loadUsers]
  );

  // Auction handlers
  const handleApproveAuction = useCallback(
    async (auctionId: string) => {
      setApproving(auctionId);
      try {
        const response = await fetch(`/api/admin/auctions/${auctionId}/approve`, {
          method: 'POST',
        });

        if (response.ok) {
          await loadAuctions();
          await loadActiveAuctions();
        }
      } catch (error) {
        console.error('Błąd podczas zatwierdzania aukcji:', error);
      } finally {
        setApproving(null);
      }
    },
    [loadAuctions, loadActiveAuctions]
  );

  const handleRejectAuction = useCallback(
    async (auctionId: string) => {
      try {
        const response = await fetch(`/api/admin/auctions/${auctionId}/reject`, {
          method: 'POST',
        });

        if (response.ok) {
          await loadAuctions();
        }
      } catch (error) {
        console.error('Błąd podczas odrzucania aukcji:', error);
      }
    },
    [loadAuctions]
  );

  const handleEditAuction = useCallback((auction: Auction) => {
    setEditingAuction(auction);
    setEditingAuctionData({
      title: auction.title,
      description: auction.description,
      startingPrice: auction.startingPrice,
      currentPrice: auction.currentPrice,
      buyNowPrice: auction.buyNowPrice,
      reservePrice: auction.reservePrice,
    });
  }, []);

  const handleSaveAuction = useCallback(async () => {
    if (!editingAuction) return;

    try {
      const response = await fetch(`/api/admin/auctions/${editingAuction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAuctionData),
      });

      if (response.ok) {
        await loadAuctions();
        await loadActiveAuctions();
        setEditingAuction(null);
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania aukcji:', error);
    }
  }, [editingAuction, editingAuctionData, loadAuctions, loadActiveAuctions]);

  const handleSelectAuction = useCallback(async (auction: Auction | null) => {
    setSelectedAuction(auction);
    if (auction) {
      try {
        const response = await fetch(`/api/admin/auctions/${auction.id}/bids`);
        if (response.ok) {
          const data = await response.json();
          setAuctionBidders(data);
        }
      } catch (error) {
        console.error('Błąd podczas ładowania licytacji:', error);
      }
    }
  }, []);

  // Helper functions
  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'active':
        return 'Aktywny';
      case 'pending':
        return 'Oczekuje';
      case 'blocked':
        return 'Zablokowany';
      case 'completed':
        return 'Zakończona';
      case 'disputed':
        return 'Spór';
      default:
        return status;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function getRoleText(_role: string) {
    // Unused helper - may be used in future
    // switch (role) {
    //   case 'USER':
    //     return 'Użytkownik';
    //   case 'ADMIN':
    //     return 'Administrator';
    //   default:
    //     return role;
    // }
    return '';
  }

  // Load transactions
  const loadTransactions = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: txsPage.toString(),
        pageSize: txsPageSize.toString(),
        ...(txsStatus && { status: txsStatus }),
      });

      const response = await fetch(`/api/admin/transactions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTxs(data.items || []);
        setTxsTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania transakcji:', error);
    }
  }, [txsPage, txsPageSize, txsStatus]);

  // Load references
  const loadReferences = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/references?page=1&limit=50&status=${referencesStatus}`
      );
      if (response.ok) {
        const data = await response.json();
        setReferences(data.references || []);
        setReferencesTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania referencji:', error);
    }
  }, [referencesStatus]);

  // Load meetings
  const loadMeetings = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/breeder-meetings?page=1&limit=50&status=${meetingsStatus}`
      );
      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
        setMeetingsTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania spotkań:', error);
    }
  }, [meetingsStatus]);

  // Reference handlers
  const approveReference = useCallback(
    async (referenceId: string, isApproved: boolean) => {
      try {
        const response = await fetch(`/api/admin/references/${referenceId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isApproved }),
        });

        if (response.ok) {
          await loadReferences();
        }
      } catch (error) {
        console.error('Błąd podczas aktualizacji referencji:', error);
      }
    },
    [loadReferences]
  );

  const deleteReference = useCallback(
    async (referenceId: string) => {
      if (!confirm('Czy na pewno chcesz usunąć tę referencję?')) return;

      try {
        const response = await fetch(`/api/admin/references/${referenceId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await loadReferences();
        }
      } catch (error) {
        console.error('Błąd podczas usuwania referencji:', error);
      }
    },
    [loadReferences]
  );

  // Meeting handlers
  const approveMeeting = useCallback(
    async (meetingId: string, isApproved: boolean) => {
      try {
        const response = await fetch(`/api/admin/breeder-meetings/${meetingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isApproved }),
        });

        if (response.ok) {
          await loadMeetings();
        }
      } catch (error) {
        console.error('Błąd podczas aktualizacji spotkania:', error);
      }
    },
    [loadMeetings]
  );

  const deleteMeeting = useCallback(
    async (meetingId: string) => {
      if (!confirm('Czy na pewno chcesz usunąć to spotkanie?')) return;

      try {
        const response = await fetch(`/api/admin/breeder-meetings/${meetingId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await loadMeetings();
        }
      } catch (error) {
        console.error('Błąd podczas usuwania spotkania:', error);
      }
    },
    [loadMeetings]
  );

  // Effects
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, loadUsers]);

  useEffect(() => {
    if (activeTab === 'auctions') {
      loadAuctions();
      loadActiveAuctions();
    }
  }, [activeTab, loadAuctions, loadActiveAuctions]);

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    }
  }, [activeTab, loadTransactions]);

  useEffect(() => {
    if (activeTab === 'references') {
      loadReferences();
    }
  }, [activeTab, loadReferences]);

  useEffect(() => {
    if (activeTab === 'meetings') {
      loadMeetings();
    }
  }, [activeTab, loadMeetings]);

  // Check admin access
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-white">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Panel Administratora</h1>
              <p className="text-white/70 mt-2">
                Zarządzaj platformą, użytkownikami i transakcjami
              </p>
            </div>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg backdrop-blur-sm transition-all duration-200 border border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              Wyloguj
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card hover-3d-lift">
              {/* Admin Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  {user.displayName || 'Administrator'}
                </h2>
                <p className="text-white/70 text-sm">{user.email}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-400 text-sm">Administrator</span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-white/70 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && <AdminOverview stats={stats} isLoading={isLoading} />}

              {activeTab === 'users' && (
                <AdminUsers
                  users={users}
                  usersTotal={usersTotal}
                  usersPage={usersPage}
                  usersPageSize={usersPageSize}
                  usersRole={usersRole}
                  usersStatus={usersStatus}
                  editingUser={editingUser}
                  editForm={editForm}
                  saving={saving}
                  deleting={deleting}
                  onPageChange={setUsersPage}
                  onPageSizeChange={setUsersPageSize}
                  onRoleFilter={setUsersRole}
                  onStatusFilter={setUsersStatus}
                  onEditUser={handleEditUser}
                  onSaveUser={handleSaveUser}
                  onDeleteUser={handleDeleteUser}
                  onCancelEdit={() => setEditingUser(null)}
                  onFormChange={(field, value) =>
                    setEditForm(prev => ({ ...prev, [field]: value }))
                  }
                />
              )}

              {activeTab === 'auctions' && (
                <AdminAuctions
                  auctions={auctions}
                  auctionsTotal={auctionsTotal}
                  auctionsPage={auctionsPage}
                  auctionsPageSize={auctionsPageSize}
                  auctionTab={auctionTab}
                  activeAuctions={activeAuctions}
                  activeAuctionsTotal={activeAuctionsTotal}
                  activeAuctionsPage={activeAuctionsPage}
                  activeAuctionsPageSize={activeAuctionsPageSize}
                  selectedAuction={selectedAuction}
                  auctionBidders={auctionBidders}
                  editingAuction={editingAuction}
                  editingAuctionData={editingAuctionData}
                  approving={approving}
                  onPageChange={setAuctionsPage}
                  onPageSizeChange={setAuctionsPageSize}
                  onTabChange={setAuctionTab}
                  onActivePageChange={setActiveAuctionsPage}
                  onActivePageSizeChange={setActiveAuctionsPageSize}
                  onSelectAuction={handleSelectAuction}
                  onApproveAuction={handleApproveAuction}
                  onRejectAuction={handleRejectAuction}
                  onEditAuction={handleEditAuction}
                  onSaveAuction={handleSaveAuction}
                  onCancelEdit={() => setEditingAuction(null)}
                  onAuctionDataChange={(field, value) =>
                    setEditingAuctionData((prev: Partial<Auction>) => ({ ...prev, [field]: value }))
                  }
                />
              )}

              {activeTab === 'transactions' && (
                <div className="card">
                  <h3 className="text-xl font-semibold text-white mb-6">Transakcje</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white/70 mb-2">Status</label>
                    <select
                      value={txsStatus}
                      onChange={e => {
                        setTxsPage(1);
                        setTxsStatus(e.target.value);
                      }}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      aria-label="Filtr statusu transakcji"
                      title="Filtr statusu transakcji"
                    >
                      <option value="">Wszystkie</option>
                      <option value="PENDING">Oczekuje</option>
                      <option value="COMPLETED">Zakończona</option>
                      <option value="DISPUTED">Spór</option>
                    </select>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-3 px-4 text-white font-medium">Aukcja</th>
                          <th className="text-left py-3 px-4 text-white font-medium">Kupujący</th>
                          <th className="text-left py-3 px-4 text-white font-medium">Sprzedawca</th>
                          <th className="text-left py-3 px-4 text-white font-medium">Kwota</th>
                          <th className="text-left py-3 px-4 text-white font-medium">Prowizja</th>
                          <th className="text-left py-3 px-4 text-white font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-white font-medium">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {txs.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-white/70">
                              Brak danych transakcji
                            </td>
                          </tr>
                        ) : (
                          txs.map(tx => (
                            <tr key={tx.id} className="border-b border-white/10 hover:bg-white/5">
                              <td className="py-3 px-4 text-white">
                                {tx.auction?.title || 'Aukcja'}
                              </td>
                              <td className="py-3 px-4 text-white/80">
                                {`${tx.buyer?.firstName || ''} ${tx.buyer?.lastName || ''}`.trim() ||
                                  tx.buyer?.email ||
                                  ''}
                              </td>
                              <td className="py-3 px-4 text-white/80">
                                {`${tx.seller?.firstName || ''} ${tx.seller?.lastName || ''}`.trim() ||
                                  tx.seller?.email ||
                                  ''}
                              </td>
                              <td className="py-3 px-4 text-white">
                                {Number(tx.amount || 0).toLocaleString()} zł
                              </td>
                              <td className="py-3 px-4 text-white">
                                {Number(tx.commission || 0).toLocaleString()} zł
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(String(tx.status || 'pending'))}`}
                                >
                                  {getStatusText(String(tx.status || 'pending'))}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-white/70">
                                {new Date(tx.createdAt).toLocaleDateString('pl-PL')}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-white/70 text-sm">
                      Strona {txsPage} z {Math.max(1, Math.ceil(txsTotal / txsPageSize))} (
                      {txsTotal} transakcji)
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={txsPage <= 1}
                        onClick={() => setTxsPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded transition-all"
                      >
                        Poprzednia
                      </button>
                      <button
                        disabled={txsPage >= Math.ceil(txsTotal / txsPageSize)}
                        onClick={() => setTxsPage(p => p + 1)}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded transition-all"
                      >
                        Następna
                      </button>
                      <select
                        value={txsPageSize}
                        onChange={e => {
                          setTxsPage(1);
                          setTxsPageSize(parseInt(e.target.value, 10));
                        }}
                        className="ml-2 border border-white/20 rounded px-2 py-1 bg-white/10 text-white"
                        aria-label="Rozmiar strony transakcji"
                        title="Rozmiar strony transakcji"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'references' && (
                <div className="card">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white">Zarządzanie referencjami</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReferencesStatus('pending')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          referencesStatus === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        Oczekujące ({referencesStatus === 'pending' ? references.length : 0})
                      </button>
                      <button
                        onClick={() => setReferencesStatus('approved')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          referencesStatus === 'approved'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        Zatwierdzone
                      </button>
                      <button
                        onClick={() => setReferencesStatus('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          referencesStatus === 'all'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        Wszystkie
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {references.length === 0 ? (
                      <div className="text-center py-8 text-white/70">
                        Brak referencji do wyświetlenia
                      </div>
                    ) : (
                      references.map(reference => (
                        <div key={reference.id} className="border border-white/20 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-white">{reference.breederName}</h4>
                              <p className="text-sm text-white/70">{reference.location}</p>
                              <p className="text-sm text-white/70">
                                Doświadczenie: {reference.experience}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < reference.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-white/30'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  reference.isApproved
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}
                              >
                                {reference.isApproved ? 'Zatwierdzona' : 'Oczekuje'}
                              </span>
                            </div>
                          </div>
                          <p className="text-white/80 mb-3">{reference.testimonial}</p>
                          {reference.achievements && reference.achievements.length > 0 && (
                            <div className="mb-3">
                              <h5 className="font-medium text-white mb-2">Osiągnięcia:</h5>
                              <div className="space-y-1">
                                {reference.achievements.map((achievement, index) => (
                                  <div key={index} className="text-sm text-white/70">
                                    <strong>{achievement.pigeon}</strong> ({achievement.ringNumber})
                                    -{' '}
                                    {achievement.results
                                      ?.map(
                                        result =>
                                          `${result.place} miejsce w ${result.competition} (${result.date})`
                                      )
                                      .join(', ')}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-3 border-t border-white/10">
                            <span className="text-sm text-white/50">
                              Dodano: {new Date(reference.createdAt).toLocaleDateString('pl-PL')}
                            </span>
                            <div className="flex gap-2">
                              {!reference.isApproved && (
                                <>
                                  <button
                                    onClick={() => approveReference(reference.id, true)}
                                    className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Zatwierdź
                                  </button>
                                  <button
                                    onClick={() => approveReference(reference.id, false)}
                                    className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Odrzuć
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => deleteReference(reference.id)}
                                className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                                Usuń
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'meetings' && (
                <div className="card">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white">
                      Zarządzanie spotkaniami z hodowcami
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMeetingsStatus('pending')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          meetingsStatus === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        Oczekujące ({meetingsStatus === 'pending' ? meetings.length : 0})
                      </button>
                      <button
                        onClick={() => setMeetingsStatus('approved')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          meetingsStatus === 'approved'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        Zatwierdzone
                      </button>
                      <button
                        onClick={() => setMeetingsStatus('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          meetingsStatus === 'all'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        Wszystkie
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {meetings.length === 0 ? (
                      <div className="text-center py-8 text-white/70">
                        Brak spotkań do wyświetlenia
                      </div>
                    ) : (
                      meetings.map(meeting => (
                        <div key={meeting.id} className="border border-white/20 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-white">{meeting.title}</h4>
                              <p className="text-sm text-white/70">{meeting.location}</p>
                              <p className="text-sm text-white/70">
                                Data: {new Date(meeting.date).toLocaleDateString('pl-PL')}
                              </p>
                              <p className="text-sm text-white/70">
                                Dodane przez: {meeting.user.firstName} {meeting.user.lastName}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                meeting.isApproved
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {meeting.isApproved ? 'Zatwierdzone' : 'Oczekuje'}
                            </span>
                          </div>
                          {meeting.description && (
                            <p className="text-white/80 mb-3">{meeting.description}</p>
                          )}
                          {meeting.images && meeting.images.length > 0 && (
                            <div className="mb-3">
                              <h5 className="font-medium text-white mb-2">
                                Zdjęcia ({meeting.images.length}):
                              </h5>
                              <div className="grid grid-cols-4 gap-2">
                                {meeting.images.slice(0, 4).map((image: string, index: number) => (
                                  <div
                                    key={index}
                                    className="aspect-square bg-gray-700 rounded-lg overflow-hidden relative"
                                  >
                                    <Image
                                      src={image}
                                      alt={`Zdjęcie ${index + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                                {meeting.images.length > 4 && (
                                  <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                                    <span className="text-sm text-white/70">
                                      +{meeting.images.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-3 border-t border-white/10">
                            <span className="text-sm text-white/50">
                              Dodano: {new Date(meeting.createdAt).toLocaleDateString('pl-PL')}
                            </span>
                            <div className="flex gap-2">
                              {!meeting.isApproved && (
                                <>
                                  <button
                                    onClick={() => approveMeeting(meeting.id, true)}
                                    className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Zatwierdź
                                  </button>
                                  <button
                                    onClick={() => approveMeeting(meeting.id, false)}
                                    className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Odrzuć
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => deleteMeeting(meeting.id)}
                                className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                                Usuń
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="card">
                  <h3 className="text-xl font-semibold text-white mb-6">Ustawienia platformy</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Prowizja platformy (%)
                      </label>
                      <input
                        type="number"
                        defaultValue="0"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Prowizja platformy w procentach"
                        title="Prowizja platformy w procentach"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Maksymalny czas trwania aukcji (dni)
                      </label>
                      <input
                        type="number"
                        defaultValue="30"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Maksymalny czas trwania aukcji w dniach"
                        title="Maksymalny czas trwania aukcji w dniach"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Minimalna cena wywoławcza (zł)
                      </label>
                      <input
                        type="number"
                        defaultValue="100"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Minimalna cena wywoławcza w złotych"
                        title="Minimalna cena wywoławcza w złotych"
                      />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                      Zapisz ustawienia
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
