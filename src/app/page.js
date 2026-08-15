'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ExcoreDashboard() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Theme State
  const [isDark, setIsDark] = useState(true);

  // Data States from API
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState({
    currency: 'IDR (Rupiah Indonesia)',
    twoFactorAuth: true,
    telemetryNotifications: true,
    apiKey: 'pulseops_live_9f823bc89124ad90123fe891234ba',
    currentPlan: 'Skala Enterprise'
  });
  const [notifications, setNotifications] = useState([]);
  const [isKeyRevealed, setIsKeyRevealed] = useState(false);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [chartPeriod, setChartPeriod] = useState('6 Bulan');

  // Modals & Dropdowns State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, targetTx: null });

  // Form States
  const [txForm, setTxForm] = useState({ customerName: '', customerEmail: '', amount: '', status: 'Lunas' });
  const [prodForm, setProdForm] = useState({ name: '', category: 'Audio & Elektronik', price: '', stock: '' });

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', icon: '✓' });
  const toastTimeoutRef = useRef(null);

  const showToast = (message, icon = '✓') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, icon });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: '', icon: '✓' });
    }, 2600);
  };

  // Fetch Initial Data from API
  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      const json = await res.json();
      if (json.success) setTransactions(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const json = await res.json();
      if (json.success) {
        if (json.data) setSettings(json.data);
        if (json.notifications) setNotifications(json.notifications);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Check saved theme
    const savedTheme = localStorage.getItem('excore_theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    // Check hash
    const hash = window.location.hash.slice(1);
    if (['overview', 'sales', 'crm', 'products', 'orders', 'reports', 'settings'].includes(hash)) {
      setCurrentPage(hash);
    }

    fetchTransactions();
    fetchProducts();
    fetchSettings();

    // Seed customers in Indonesian
    setCustomers([
      { id: 'c-1', name: 'Budi Santoso', email: 'budi.santoso@enterprise.co.id', company: 'PT Sentosa Abadi', ltv: 'Rp 48.500.000', ordersCount: 18, status: 'Terverifikasi VIP', avatarClass: 'av-blue', initials: 'BS' },
      { id: 'c-2', name: 'Andi Pratama', email: 'andi.p@fintechcorp.id', company: 'Fintech Corp', ltv: 'Rp 32.800.000', ordersCount: 12, status: 'Terverifikasi VIP', avatarClass: 'av-emerald', initials: 'AP' },
      { id: 'c-3', name: 'Siti Rahma', email: 'siti.rahma@cloudstudio.com', company: 'Cloud Studio ID', ltv: 'Rp 21.400.000', ordersCount: 9, status: 'Aktif', avatarClass: 'av-purple', initials: 'SR' },
      { id: 'c-4', name: 'Dewi Wulandari', email: 'dewi.wulan@globaltrade.id', company: 'Global Trade ID', ltv: 'Rp 9.500.000', ordersCount: 4, status: 'Standar', avatarClass: 'av-amber', initials: 'DW' }
    ]);

    // Keyboard shortcut ⌘K / Ctrl+K
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchEl = document.getElementById('globalSearch');
        if (searchEl) {
          searchEl.focus();
          showToast('Pencarian cepat aktif', '⚡');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Hashchange listener
    const handleHashChange = () => {
      const h = window.location.hash.slice(1);
      if (['overview', 'sales', 'crm', 'products', 'orders', 'reports', 'settings'].includes(h)) {
        setCurrentPage(h);
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.location.hash = page;
    setIsSidebarOpen(false);
    setIsNotifOpen(false);
    setIsProfileOpen(false);
    setContextMenu({ show: false, x: 0, y: 0, targetTx: null });
  };

  const toggleTheme = (e) => {
    const nextDark = !isDark;

    const applyThemeChange = () => {
      setIsDark(nextDark);
      if (nextDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('excore_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('excore_theme', 'light');
      }
    };

    // If View Transition API is supported and event has coordinates
    if (typeof document !== 'undefined' && document.startViewTransition && e && e.clientX !== undefined) {
      const x = e.clientX;
      const y = e.clientY;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = document.startViewTransition(() => {
        applyThemeChange();
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ];
        document.documentElement.animate(
          {
            clipPath: clipPath
          },
          {
            duration: 650,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      });
    } else {
      applyThemeChange();
    }

    showToast(`Tema diubah ke ${nextDark ? 'Mode Gelap 🌙' : 'Mode Terang ☀️'}`);
  };

  // Transaction Actions
  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txForm)
      });
      const json = await res.json();
      if (json.success) {
        setTransactions([json.data, ...transactions]);
        setIsTxModalOpen(false);
        setTxForm({ customerName: '', customerEmail: '', amount: '', status: 'Lunas' });
        showToast(`Transaksi ${json.data.ref} berhasil tersimpan ke database!`, '💳');
      }
    } catch (e) {
      showToast('Gagal menyimpan transaksi', '⚠️');
    }
  };

  const handleUpdateTxStatus = async (id, newStatus) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const json = await res.json();
      if (json.success) {
        setTransactions(transactions.map(t => t.id === id ? { ...t, status: newStatus } : t));
        showToast(`Status pesanan diperbarui menjadi ${newStatus}`, '✓');
      }
    } catch (e) {
      showToast('Pembaruan gagal', '⚠️');
    }
    setContextMenu({ show: false, x: 0, y: 0, targetTx: null });
  };

  const handleDeleteTx = async (id) => {
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setTransactions(transactions.filter(t => t.id !== id));
        showToast('Entri transaksi berhasil dihapus dari database', '🗑️');
      }
    } catch (e) {
      showToast('Gagal menghapus entri', '⚠️');
    }
    setContextMenu({ show: false, x: 0, y: 0, targetTx: null });
  };

  // Product Actions
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodForm)
      });
      const json = await res.json();
      if (json.success) {
        setProducts([json.data, ...products]);
        setIsProdModalOpen(false);
        setProdForm({ name: '', category: 'Audio & Elektronik', price: '', stock: '' });
        showToast(`Produk SKU ${json.data.sku} berhasil ditambahkan ke katalog!`, '📦');
      }
    } catch (e) {
      showToast('Gagal menyimpan SKU produk', '⚠️');
    }
  };

  // API Key & Settings Actions
  const handleRotateKey = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rotate_key' })
      });
      const json = await res.json();
      if (json.success) {
        setSettings({ ...settings, apiKey: json.apiKey });
        showToast('Kunci API produksi berhasil diperbarui!', '🔑');
      }
    } catch (e) {
      showToast('Gagal merotasi kunci API', '⚠️');
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(settings.apiKey).then(() => {
      showToast('Kunci API disalin ke papan klip', '📋');
    });
  };

  const handleClearNotifications = async () => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_notifications' })
      });
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
      showToast('Semua notifikasi telah ditandai dibaca', '✓');
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCsv = () => {
    const rows = [
      ['Referensi Pesanan', 'Nama Pelanggan', 'Email', 'Waktu Transaksi', 'Nominal (IDR)', 'Status'],
      ...transactions.map(t => [t.ref, t.customerName, t.customerEmail, t.timestamp, t.amount, t.status])
    ];
    const csvContent = '\uFEFF' + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `excore-transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Buku besar transaksi berhasil diekspor ke format CSV', '📥');
  };

  // Filtered transactions & products by search
  const filteredTransactions = transactions.filter(t =>
    t.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chart Data Configuration
  const chartDatasets = {
    '6 Bulan': {
      actual: [42, 58, 51, 76, 68, 91],
      target: [40, 50, 60, 70, 80, 90],
      labels: ['Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu']
    },
    '12 Bulan': {
      actual: [34, 40, 48, 45, 55, 61, 58, 70, 66, 78, 84, 91],
      target: [30, 38, 45, 50, 58, 65, 62, 72, 70, 80, 85, 95],
      labels: ['Sep', 'Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu']
    },
    '30 Hari': {
      actual: [25, 32, 28, 44, 38, 51, 49, 62, 57, 69, 65, 74],
      target: [20, 28, 30, 40, 42, 48, 52, 58, 60, 68, 70, 78],
      labels: ['1', '4', '7', '10', '13', '16', '19', '22', '25', '28', '30']
    }
  };

  const currentChart = chartDatasets[chartPeriod] || chartDatasets['6 Bulan'];

  const chartData = {
    labels: currentChart.labels,
    datasets: [
      {
        label: 'Pendapatan Aktual (Miliar IDR)',
        data: currentChart.actual,
        borderColor: '#6366f1',
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: isDark ? '#090d16' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Target Proyeksi AI',
        data: currentChart.target,
        borderColor: '#a855f7',
        borderDash: [5, 5],
        borderWidth: 1.8,
        fill: false,
        tension: 0.35,
        pointRadius: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#475569',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
        callbacks: {
          label: (item) => ` ${item.dataset.label}: Rp ${item.parsed.y} M`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)' },
        ticks: {
          color: isDark ? '#64748b' : '#94a3b8',
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 },
          callback: (v) => 'Rp ' + v + 'M'
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#64748b' : '#94a3b8',
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 }
        }
      }
    }
  };

  // Dynamic KPI Calculation based on time range
  const kpiValues = {
    today: { rev: 'Rp 14,80 M', orders: '284', users: '24.892', sla: '99.4%' },
    '7d': { rev: 'Rp 98,20 M', orders: '1.942', users: '24.892', sla: '98.9%' },
    '30d': { rev: 'Rp 428,50 M', orders: (8545 + transactions.length).toLocaleString('id-ID'), users: '24.892', sla: '98.6%' }
  }[timeRange];

  const unreadNotifsCount = notifications.filter(n => n.unread).length;
  const pendingOrdersCount = transactions.filter(t => t.status === 'Diproses' || t.status === 'Processing').length;

  return (
    <div className="app-layout" onClick={() => {
      setIsNotifOpen(false);
      setIsProfileOpen(false);
      setIsTimeDropdownOpen(false);
      if (contextMenu.show) setContextMenu({ show: false, x: 0, y: 0, targetTx: null });
    }}>
      {/* Mobile Sidebar Backdrop */}
      <div
        className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sticky Left Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Workspace Brand Switcher with Original EXCORE Logo */}
        <div
          className="brand-wrapper"
          onClick={() => showToast('Dasbor Utama EXCORE Aktif', '✨')}
          title="EXCORE - Dasbor Utama"
        >
          <div className="brand-icon">
            <img src={isDark ? "/logo-white.png" : "/logo-black.png"} alt="EXCORE Logo" className="brand-logo-img" />
          </div>
          <div className="brand-info">
            <div className="brand-name">EX<span className="brand-accent">CORE</span></div>
            <div className="brand-workspace">Dasbor Utama</div>
          </div>
          <div className="brand-status-dot" title="Sistem Aktif & Terhubung"></div>
        </div>

        {/* Navigation Sections */}
        <nav className="nav-container">
          <div className="nav-group-label">MENU UTAMA</div>

          <a
            className={`nav-link ${currentPage === 'overview' ? 'active' : ''}`}
            href="#overview"
            onClick={(e) => { e.preventDefault(); navigateTo('overview'); }}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
            </span>
            <span className="nav-text">Ringkasan Bisnis</span>
            <span className="nav-pill active-dot"></span>
          </a>

          <a
            className={`nav-link ${currentPage === 'sales' ? 'active' : ''}`}
            href="#sales"
            onClick={(e) => { e.preventDefault(); navigateTo('sales'); }}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </span>
            <span className="nav-text">Penjualan & Omzet</span>
            <span className="nav-badge success">+15.2%</span>
          </a>

          <a
            className={`nav-link ${currentPage === 'crm' ? 'active' : ''}`}
            href="#crm"
            onClick={(e) => { e.preventDefault(); navigateTo('crm'); }}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </span>
            <span className="nav-text">Data Pelanggan</span>
            <span className="nav-badge neutral">24.8k</span>
          </a>

          <div className="nav-group-label">OPERASIONAL TOKO</div>

          <a
            className={`nav-link ${currentPage === 'products' ? 'active' : ''}`}
            href="#products"
            onClick={(e) => { e.preventDefault(); navigateTo('products'); }}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
            </span>
            <span className="nav-text">Produk & Stok</span>
          </a>

          <a
            className={`nav-link ${currentPage === 'orders' ? 'active' : ''}`}
            href="#orders"
            onClick={(e) => { e.preventDefault(); navigateTo('orders'); }}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>
            </span>
            <span className="nav-text">Pesanan Masuk</span>
            <span className="nav-badge pulse">{pendingOrdersCount > 0 ? `${pendingOrdersCount} Baru` : `${transactions.length}`}</span>
          </a>

          <a
            className={`nav-link ${currentPage === 'reports' ? 'active' : ''}`}
            href="#reports"
            onClick={(e) => { e.preventDefault(); navigateTo('reports'); }}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10"></line><line x1="12" x2="12" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="14"></line></svg>
            </span>
            <span className="nav-text">Laporan Keuangan</span>
          </a>

          <div className="nav-group-label">PENGATURAN</div>

          <a
            className={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
            href="#settings"
            onClick={(e) => { e.preventDefault(); navigateTo('settings'); }}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </span>
            <span className="nav-text">Pengaturan Akun</span>
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Glassmorphic Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button menu-toggle-btn"
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                  setIsSidebarOpen(!isSidebarOpen);
                } else {
                  const nextCollapsed = !isSidebarCollapsed;
                  setIsSidebarCollapsed(nextCollapsed);
                  showToast(nextCollapsed ? 'Bilah samping diciutkan (Mode Ikon Ringkas)' : 'Bilah samping diperluas', '📐');
                }
              }}
              aria-label="Ciutkan / Perluas Bilah Samping"
              title="Ciutkan / Perluas Bilah Samping (Sidebar)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
            </button>

            <div className="search-command-bar">
              <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line></svg>
              <input
                id="globalSearch"
                type="search"
                placeholder="Cari pesanan, SKU, pelanggan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              <kbd className="shortcut-pill">⌘K</kbd>
            </div>
          </div>

          <div className="topbar-right">
            <button className="btn btn-secondary" onClick={handleExportCsv} title="Ekspor transaksi ke file CSV">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
              <span>Ekspor CSV</span>
            </button>

            <button className="btn btn-primary" onClick={() => setIsTxModalOpen(true)} title="Catat transaksi baru">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"></line><line x1="5" x2="19" y1="12" y2="12"></line></svg>
              <span>Transaksi Baru</span>
            </button>

            <div className="divider-v"></div>

            {/* Notification Bell with Dropdown */}
            <div className="dropdown-wrapper">
              <button
                className="icon-button notification-btn"
                onClick={(e) => { e.stopPropagation(); setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                aria-label="Notifikasi"
                title="Notifikasi Telemetri"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
                {unreadNotifsCount > 0 && <span className="notification-indicator"></span>}
              </button>

              <div className={`dropdown-panel notif-panel ${isNotifOpen ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="dropdown-header">
                  <div className="dropdown-title">Notifikasi Sistem</div>
                  <button className="dropdown-action-btn" onClick={handleClearNotifications}>Tandai telah dibaca</button>
                </div>
                <div className="notif-list">
                  {notifications.map(n => (
                    <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                      <div className={`notif-icon-circle ${n.type === 'payment' ? 'green' : n.type === 'inventory' ? 'amber' : 'blue'}`}>
                        {n.type === 'payment' ? '💳' : n.type === 'inventory' ? '⚠️' : '👥'}
                      </div>
                      <div className="notif-content">
                        <div className="notif-text">{n.title}</div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Toggle (Dark / Light) */}
            <button className="icon-button theme-toggle-btn" onClick={(e) => toggleTheme(e)} aria-label="Ganti Tema" title="Ganti Mode Gelap/Terang">
              <svg className="sun-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
              <svg className="moon-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
            </button>

            {/* User Profile Menu with Dropdown */}
            <div className="dropdown-wrapper">
              <div
                className="user-profile-menu"
                onClick={(e) => { e.stopPropagation(); setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
              >
                <div className="user-avatar">
                  <span>AM</span>
                  <span className="user-online-badge"></span>
                </div>
                <div className="user-meta">
                  <div className="user-name">Admin Media</div>
                  <div className="user-role">Super Eksekutif ▾</div>
                </div>
              </div>

              <div className={`dropdown-panel profile-panel ${isProfileOpen ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="profile-dropdown-header">
                  <strong>Admin Media</strong>
                  <small>admin@excore.enterprise.id</small>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-link" onClick={() => navigateTo('settings')}><span className="icon">⚙️</span> Pengaturan & API</button>
                <button className="dropdown-link" onClick={() => navigateTo('reports')}><span className="icon">📊</span> Audit Finansial</button>
                <button className="dropdown-link" onClick={() => navigateTo('crm')}><span className="icon">👥</span> Manajemen Tim</button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-link logout" onClick={() => { setIsProfileOpen(false); showToast('Sesi terkunci. Silakan otentikasi ulang untuk masuk konsol.', '🔒'); }}>
                  <span className="icon">🚪</span> Keluar Sesi
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Viewport Container */}
        <div className="viewport-container">
          <section className="view-header">
            <div>
              <h1 className="view-title">{titles[currentPage]}</h1>
              <p className="view-subtitle">{subtitles[currentPage]}</p>
            </div>
            <div className="date-filter-group">
              <div
                className="live-pulse-badge"
                onClick={() => showToast('Database Lokal Aktif: Latensi 0.02s', '⚡')}
                title="Status Database & Telemetri Aktif"
              >
                <span className="pulse-dot"></span>
                <span>DATA LIVE</span>
              </div>

              {/* Custom Glassmorphic Timeframe Dropdown */}
              <div className="custom-dropdown-wrapper">
                <button
                  className="custom-dropdown-btn"
                  onClick={(e) => { e.stopPropagation(); setIsTimeDropdownOpen(!isTimeDropdownOpen); }}
                  title="Pilih rentang waktu filter"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>{timeRange === 'today' ? 'Hari Ini (24 Jam)' : timeRange === '7d' ? '7 Hari Terakhir' : '30 Hari Terakhir'}</span>
                  <svg className={`chevron-arrow ${isTimeDropdownOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>

                {isTimeDropdownOpen && (
                  <div className="custom-dropdown-panel" onClick={(e) => e.stopPropagation()}>
                    <div className={`custom-dropdown-option ${timeRange === 'today' ? 'active' : ''}`} onClick={() => { setTimeRange('today'); setIsTimeDropdownOpen(false); showToast('Rentang disaring: Hari Ini', '⏱️'); }}>
                      <div className="option-icon-box">⚡</div>
                      <div className="option-info">
                        <div className="option-title">Hari Ini (24 Jam)</div>
                        <div className="option-subtitle">Aktivitas penjualan hari ini</div>
                      </div>
                      {timeRange === 'today' && <span className="option-check">✓</span>}
                    </div>

                    <div className={`custom-dropdown-option ${timeRange === '7d' ? 'active' : ''}`} onClick={() => { setTimeRange('7d'); setIsTimeDropdownOpen(false); showToast('Rentang disaring: 7 Hari Terakhir', '⏱️'); }}>
                      <div className="option-icon-box">📅</div>
                      <div className="option-info">
                        <div className="option-title">7 Hari Terakhir</div>
                        <div className="option-subtitle">Tren performa 1 minggu</div>
                      </div>
                      {timeRange === '7d' && <span className="option-check">✓</span>}
                    </div>

                    <div className={`custom-dropdown-option ${timeRange === '30d' ? 'active' : ''}`} onClick={() => { setTimeRange('30d'); setIsTimeDropdownOpen(false); showToast('Rentang disaring: 30 Hari Terakhir', '⏱️'); }}>
                      <div className="option-icon-box">📊</div>
                      <div className="option-info">
                        <div className="option-title">30 Hari Terakhir</div>
                        <div className="option-subtitle">Akumulasi omzet 1 bulan penuh</div>
                      </div>
                      {timeRange === '30d' && <span className="option-check">✓</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 1. OVERVIEW PAGE */}
          {currentPage === 'overview' && (
            <div className="page-view">
              <section className="kpi-grid">
                <div className="kpi-card" onClick={() => navigateTo('sales')} title="Klik untuk membuka Penjualan & Pendapatan">
                  <div className="kpi-head">
                    <span className="kpi-label">Pendapatan Bruto</span>
                    <div className="kpi-icon violet">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                  </div>
                  <div className="kpi-body">
                    <div className="kpi-value">{kpiValues.rev}</div>
                    <div className="kpi-footer">
                      <span className="delta-pill up">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                        +15.2%
                      </span>
                      <span className="kpi-comparison">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className="kpi-sparkline">
                    <svg viewBox="0 0 120 28" fill="none" preserveAspectRatio="none">
                      <path d="M0,24 Q20,18 40,22 T80,10 T120,4" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                <div className="kpi-card" onClick={() => navigateTo('orders')} title="Klik untuk membuka Pesanan Langsung">
                  <div className="kpi-head">
                    <span className="kpi-label">Volume Pesanan Bersih</span>
                    <div className="kpi-icon indigo">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>
                    </div>
                  </div>
                  <div className="kpi-body">
                    <div className="kpi-value-group">
                      <div className="kpi-value">{kpiValues.orders}</div>
                      <span className="kpi-tag">Rata-rata Rp 50,1rb</span>
                    </div>
                    <div className="kpi-footer">
                      <span className="delta-pill up">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                        +8.4%
                      </span>
                      <span className="kpi-comparison">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className="kpi-sparkline">
                    <svg viewBox="0 0 120 28" fill="none" preserveAspectRatio="none">
                      <path d="M0,22 Q30,26 60,14 T120,6" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                <div className="kpi-card" onClick={() => navigateTo('crm')} title="Klik untuk membuka Pelanggan CRM">
                  <div className="kpi-head">
                    <span className="kpi-label">Pelanggan Aktif (CRM)</span>
                    <div className="kpi-icon emerald">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                  </div>
                  <div className="kpi-body">
                    <div className="kpi-value">{kpiValues.users}</div>
                    <div className="kpi-footer">
                      <span className="delta-pill up">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                        +12.8%
                      </span>
                      <span className="kpi-comparison">Retensi 88.4%</span>
                    </div>
                  </div>
                  <div className="kpi-sparkline">
                    <svg viewBox="0 0 120 28" fill="none" preserveAspectRatio="none">
                      <path d="M0,25 Q35,12 70,16 T120,4" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                <div className="kpi-card" onClick={() => navigateTo('products')} title="Klik untuk membuka Inventaris Produk">
                  <div className="kpi-head">
                    <span className="kpi-label">Tingkat SLA Pemenuhan</span>
                    <div className="kpi-icon amber">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                  </div>
                  <div className="kpi-body">
                    <div className="kpi-value">{kpiValues.sla}</div>
                    <div className="kpi-footer">
                      <span className="delta-pill up">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                        +1.4%
                      </span>
                      <span className="kpi-comparison">Latensi 0.02d</span>
                    </div>
                  </div>
                  <div className="kpi-sparkline">
                    <svg viewBox="0 0 120 28" fill="none" preserveAspectRatio="none">
                      <path d="M0,18 Q40,8 80,10 T120,3" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </section>

              {/* Core Analytics Grid */}
              <section className="analytics-row">
                <div className="card chart-card">
                  <div className="card-head">
                    <div>
                      <h2 className="card-title">Kecepatan Finansial & Proyeksi Target</h2>
                      <p className="card-desc">Perbandingan pendapatan aktual vs peramalan target cerdas (dalam Miliar Rupiah).</p>
                    </div>
                    <div className="chart-controls">
                      <div className="chart-legend">
                        <span className="legend-dot actual"></span><span>Aktual</span>
                        <span className="legend-dot target"></span><span>Target</span>
                      </div>
                      <div className="segmented-control">
                        <button
                          className={`segmented-btn ${chartPeriod === '30 Hari' ? 'active' : ''}`}
                          onClick={() => { setChartPeriod('30 Hari'); showToast('Periode grafik: 30 Hari Terakhir', '📈'); }}
                        >
                          30 Hari
                        </button>
                        <button
                          className={`segmented-btn ${chartPeriod === '6 Bulan' ? 'active' : ''}`}
                          onClick={() => { setChartPeriod('6 Bulan'); showToast('Periode grafik: 6 Bulan (Semester 1)', '📈'); }}
                        >
                          6 Bulan
                        </button>
                        <button
                          className={`segmented-btn ${chartPeriod === '12 Bulan' ? 'active' : ''}`}
                          onClick={() => { setChartPeriod('12 Bulan'); showToast('Periode grafik: 1 Tahun Penuh', '📈'); }}
                        >
                          1 Tahun
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="chart-canvas-wrapper">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>

                <div className="card products-card">
                  <div className="card-head">
                    <div>
                      <h2 className="card-title">Katalog Produk Terlaris</h2>
                      <p className="card-desc">Penjualan produk teratas & kesehatan stok gudang.</p>
                    </div>
                    <span className="link-action" onClick={() => navigateTo('products')}>Semua Katalog →</span>
                  </div>

                  <div className="catalog-list">
                    {products.slice(0, 4).map(p => {
                      const getProductIcon = () => {
                        if (p.category.includes('Audio') || p.name.toLowerCase().includes('headset') || p.name.toLowerCase().includes('earbuds')) {
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                            </svg>
                          );
                        } else if (p.category.includes('Wearable') || p.name.toLowerCase().includes('watch')) {
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="14" height="14" x="5" y="5" rx="3"></rect>
                              <path d="M9 2h6M9 22h6"></path>
                              <circle cx="12" cy="12" r="2.5"></circle>
                            </svg>
                          );
                        } else if (p.category.includes('Periferal') || p.name.toLowerCase().includes('keyboard') || p.name.toLowerCase().includes('key')) {
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                              <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M8 14h8"></path>
                            </svg>
                          );
                        } else if (p.name.toLowerCase().includes('mouse')) {
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="12" height="18" x="6" y="3" rx="6"></rect>
                              <line x1="12" x2="12" y1="7" y2="11"></line>
                            </svg>
                          );
                        }
                        return (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                            <polyline points="2 17 12 22 22 17"></polyline>
                            <polyline points="2 12 12 17 22 12"></polyline>
                          </svg>
                        );
                      };

                      return (
                        <div key={p.id} className="catalog-item" onClick={() => navigateTo('products')}>
                          <div className={`catalog-thumb ${p.thumbClass}`}>
                            {getProductIcon()}
                          </div>
                          <div className="catalog-info">
                            <div className="catalog-name">{p.name}</div>
                            <div className="catalog-meta">{p.category} • {p.soldUnits || 120} unit terjual</div>
                            <div className="inventory-bar">
                              <div className="inventory-fill" style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }}></div>
                            </div>
                          </div>
                          <div className="catalog-val">
                            <div className="val-amount">Rp {(p.price / 1000).toLocaleString('id-ID')}rb</div>
                            <div className={`val-stock ${p.stock <= 5 ? 'text-warning' : 'text-success'}`}>
                              {p.stock <= 5 ? `Stok Kritis (${p.stock})` : `Tersedia (${p.stock})`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Live Recent Transactions Table */}
              <section className="card table-card">
                <div className="card-head">
                  <div>
                    <h2 className="card-title">Aliran Transaksi Langsung (Tersambung Database)</h2>
                    <p className="card-desc">Entri buku besar tersimpan permanen di database lokal.</p>
                  </div>
                  <div className="table-actions-top">
                    <span className="link-action" onClick={() => navigateTo('orders')}>Lihat Semua Entri Buku Besar →</span>
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Referensi Pesanan</th>
                        <th>Identitas Pelanggan</th>
                        <th>Waktu Transaksi</th>
                        <th>Nominal (IDR)</th>
                        <th>Status Gateway</th>
                        <th className="text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map(t => (
                        <tr key={t.id}>
                          <td><span className="ref-code">{t.ref}</span></td>
                          <td>
                            <div className="customer-cell">
                              <div className={`c-avatar ${t.avatarClass || 'av-blue'}`}>{t.initials}</div>
                              <div className="c-meta">
                                <span className="c-name">{t.customerName}</span>
                                <span className="c-email">{t.customerEmail}</span>
                              </div>
                            </div>
                          </td>
                          <td><span className="timestamp-tag">{t.timestamp}</span></td>
                          <td className="amount-cell">Rp {Number(t.amount).toLocaleString('id-ID')}</td>
                          <td>
                            <span className={`chip-status ${t.status === 'Lunas' || t.status === 'Settled' ? 'chip-completed' : t.status === 'Diproses' || t.status === 'Processing' ? 'chip-processing' : 'chip-failed'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              className="row-action-btn action-menu-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setContextMenu({
                                  show: true,
                                  x: Math.min(rect.left - 120, window.innerWidth - 200),
                                  y: rect.bottom + 4,
                                  targetTx: t
                                });
                              }}
                              title="Pilihan Aksi"
                            >
                              •••
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* 2. SALES & REVENUE PAGE */}
          {currentPage === 'sales' && (
            <div className="page-view">
              <div className="card mb-4">
                <div className="card-head">
                  <div>
                    <h2 className="card-title">Rincian Saluran Penjualan & Saluran Utama</h2>
                    <p className="card-desc">Pembagian pendapatan multi-saluran melalui metode pembayaran Indonesia dan gateway API langsung.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => showToast('Wisard pembuatan saluran penjualan dibuka', '📈')}>Buat Saluran Penjualan</button>
                </div>
                <div className="channel-grid">
                  <div className="channel-card">
                    <div className="channel-title">QRIS & Akun Virtual Instan</div>
                    <div className="channel-amount">Rp 218,4 M</div>
                    <div className="channel-share">51.0% dari total penerimaan</div>
                    <div className="inventory-bar mt-2"><div className="inventory-fill" style={{ width: '51%' }}></div></div>
                  </div>
                  <div className="channel-card">
                    <div className="channel-title">Kartu Kredit Langsung (Stripe)</div>
                    <div className="channel-amount">Rp 124,2 M</div>
                    <div className="channel-share">29.0% dari total penerimaan</div>
                    <div className="inventory-bar mt-2"><div className="inventory-fill" style={{ width: '29%', background: '#6366f1' }}></div></div>
                  </div>
                  <div className="channel-card">
                    <div className="channel-title">Transfer Korporat / Penagihan Resmi</div>
                    <div className="channel-amount">Rp 85,9 M</div>
                    <div className="channel-share">20.0% dari total penerimaan</div>
                    <div className="inventory-bar mt-2"><div className="inventory-fill" style={{ width: '20%', background: '#f59e0b' }}></div></div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <div>
                    <h2 className="card-title">Langganan Berulang Korporat (MRR / ARR)</h2>
                    <p className="card-desc">Lisensi perusahaan aktif dan jadwal perpanjangan otomatis.</p>
                  </div>
                  <button className="btn btn-secondary" onClick={() => showToast('Laporan rekonsiliasi berhasil diunduh', '📥')}>Unduh Laporan Rekonsiliasi</button>
                </div>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nama Organisasi</th>
                        <th>Tingkat Paket</th>
                        <th>Kapasitas Kursi</th>
                        <th>MRR Bulanan</th>
                        <th>Perpanjangan Berikutnya</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>PT Telkom Finansial</strong></td>
                        <td><span className="tier-badge">ENTERPRISE</span></td>
                        <td>250 Kursi</td>
                        <td><strong>Rp 45.000.000</strong></td>
                        <td>01 Sep 2026</td>
                        <td><span className="chip-status chip-completed">Aktif</span></td>
                      </tr>
                      <tr>
                        <td><strong>Bank Digital Nusantara</strong></td>
                        <td><span className="tier-badge">ENTERPRISE</span></td>
                        <td>500 Kursi</td>
                        <td><strong>Rp 85.000.000</strong></td>
                        <td>15 Sep 2026</td>
                        <td><span className="chip-status chip-completed">Aktif</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. CUSTOMERS & CRM PAGE */}
          {currentPage === 'crm' && (
            <div className="page-view">
              <div className="card">
                <div className="card-head">
                  <div>
                    <h2 className="card-title">Direktori Hubungan Pelanggan (CRM)</h2>
                    <p className="card-desc">Akun pelanggan terverifikasi, nilai seumur hidup (LTV), dan status keanggotaan.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => showToast('Tautan undangan anggota baru telah dibuat', '✉️')}>Undang Anggota</button>
                </div>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nama Pelanggan</th>
                        <th>Alamat Email</th>
                        <th>Perusahaan / Domain</th>
                        <th>Total LTV</th>
                        <th>Jumlah Pesanan</th>
                        <th>Status</th>
                        <th className="text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(c => (
                        <tr key={c.id}>
                          <td>
                            <div className="customer-cell">
                              <div className={`c-avatar ${c.avatarClass}`}>{c.initials}</div>
                              <strong>{c.name}</strong>
                            </div>
                          </td>
                          <td>{c.email}</td>
                          <td>{c.company}</td>
                          <td className="amount-cell">{c.ltv}</td>
                          <td>{c.ordersCount} Pesanan</td>
                          <td><span className="chip-status chip-completed">{c.status}</span></td>
                          <td className="text-right">
                            <button className="btn btn-secondary btn-sm" onClick={() => showToast(`Mengelola profil: ${c.name}`, '👤')}>Kelola</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. PRODUCT CATALOG & INVENTORY PAGE */}
          {currentPage === 'products' && (
            <div className="page-view">
              <div className="card">
                <div className="card-head">
                  <div>
                    <h2 className="card-title">Matriks Inventaris & Katalog (Database Aktif)</h2>
                    <p className="card-desc">Pelacakan stok SKU di gudang pemenuhan Jakarta Pusat & Surabaya.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => setIsProdModalOpen(true)}>Tambah Item SKU</button>
                </div>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID SKU</th>
                        <th>Nama Produk</th>
                        <th>Kategori</th>
                        <th>Harga Satuan</th>
                        <th>Stok Unit</th>
                        <th>Status</th>
                        <th className="text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(p => (
                        <tr key={p.id}>
                          <td><span className="ref-code">{p.sku}</span></td>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.category}</td>
                          <td>Rp {Number(p.price).toLocaleString('id-ID')}</td>
                          <td>{p.stock} Unit</td>
                          <td>
                            <span className={`chip-status ${p.stock <= 5 ? 'chip-processing' : 'chip-completed'}`}>
                              {p.stock <= 5 ? 'Peringatan Stok Menipis' : 'Stok Aman'}
                            </span>
                          </td>
                          <td className="text-right">
                            <button className="btn btn-secondary btn-sm" onClick={() => showToast(`Mengedit detail SKU ${p.sku}`, '📦')}>Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 5. LIVE ORDERS PAGE */}
          {currentPage === 'orders' && (
            <div className="page-view">
              <div className="card">
                <div className="card-head">
                  <div>
                    <h2 className="card-title">Manajemen Siklus Hidup Pesanan</h2>
                    <p className="card-desc">Pengiriman pesanan batch, pembuatan resi otomatis, dan penyelesaian pembayaran.</p>
                  </div>
                  <div className="flex-actions">
                    <button className="btn btn-secondary" onClick={handleExportCsv}>Ekspor Semua Pesanan</button>
                    <button className="btn btn-primary" onClick={() => setIsTxModalOpen(true)}>Buat Pesanan Manual</button>
                  </div>
                </div>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Referensi Pesanan</th>
                        <th>Identitas Pelanggan</th>
                        <th>Waktu Transaksi</th>
                        <th>Nominal (IDR)</th>
                        <th>Status Gateway</th>
                        <th className="text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map(t => (
                        <tr key={t.id}>
                          <td><span className="ref-code">{t.ref}</span></td>
                          <td>
                            <div className="customer-cell">
                              <div className={`c-avatar ${t.avatarClass || 'av-blue'}`}>{t.initials}</div>
                              <div className="c-meta">
                                <span className="c-name">{t.customerName}</span>
                                <span className="c-email">{t.customerEmail}</span>
                              </div>
                            </div>
                          </td>
                          <td><span className="timestamp-tag">{t.timestamp}</span></td>
                          <td className="amount-cell">Rp {Number(t.amount).toLocaleString('id-ID')}</td>
                          <td>
                            <span className={`chip-status ${t.status === 'Lunas' || t.status === 'Settled' ? 'chip-completed' : t.status === 'Diproses' || t.status === 'Processing' ? 'chip-processing' : 'chip-failed'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              className="row-action-btn action-menu-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setContextMenu({
                                  show: true,
                                  x: Math.min(rect.left - 120, window.innerWidth - 200),
                                  y: rect.bottom + 4,
                                  targetTx: t
                                });
                              }}
                              title="Pilihan Aksi"
                            >
                              •••
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 6. FINANCIAL AUDIT & REPORTS PAGE */}
          {currentPage === 'reports' && (
            <div className="page-view">
              <div className="card mb-4">
                <div className="card-head">
                  <div>
                    <h2 className="card-title">Mesin Pembuatan Laporan Keuangan</h2>
                    <p className="card-desc">Ekspor data performa finansial standar PSAK / GAAP serta rekonsiliasi buku besar perpajakan.</p>
                  </div>
                </div>
                <div className="report-form-grid">
                  <div className="form-group">
                    <label className="form-label">Periode Laporan</label>
                    <select className="select-field" defaultValue="2026">
                      <option value="2026">Tahun Fiskal Berjalan (2026)</option>
                      <option value="Q2-2026">Kuartal 2 2026 (Apr - Jun)</option>
                      <option value="Q3-2026">Kuartal 3 2026 (Jul - Sep)</option>
                      <option value="30d">30 Hari Terakhir (Berjalan)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Format Dokumen</label>
                    <select className="select-field" defaultValue="pdf">
                      <option value="pdf">Dokumen PDF (Ringkasan Eksekutif)</option>
                      <option value="csv">Spreadsheet CSV (Data Mentah Akuntansi)</option>
                      <option value="xlsx">Buku Kerja Excel (.XLSX)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jenis Laporan</label>
                    <select className="select-field" defaultValue="PL">
                      <option value="PL">Laporan Laba Rugi (P&L)</option>
                      <option value="VAT">Rekonsiliasi Pajak & PPN</option>
                      <option value="CASH">Arus Kas & Penyelesaian Gateway</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    className="btn btn-primary"
                    onClick={() => showToast('Laporan Laba Rugi berhasil dibuat & diunduh (PDF/XLS)', '📊')}
                  >
                    Buat & Unduh Laporan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 7. SYSTEM SETTINGS & API PAGE */}
          {currentPage === 'settings' && (
            <div className="page-view">
              <div className="card mb-4">
                <div className="card-head">
                  <div>
                    <h2 className="card-title">Gateway API & Kunci Produksi</h2>
                    <p className="card-desc">Kelola kredensial API untuk webhook sistem, aplikasi seluler, dan integrasi pihak ketiga.</p>
                  </div>
                  <button className="btn btn-secondary" onClick={handleRotateKey}>Rotasi Kunci API</button>
                </div>
                <div className="api-key-box">
                  <span className="api-key-label">Kunci API Produksi Langsung</span>
                  <div className="api-key-field">
                    <input type={isKeyRevealed ? 'text' : 'password'} value={settings.apiKey} readOnly />
                    <button className="btn btn-secondary btn-sm" onClick={() => setIsKeyRevealed(!isKeyRevealed)}>
                      {isKeyRevealed ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleCopyKey}>Salin Kunci</button>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <div>
                    <h2 className="card-title">Preferensi Sistem & Keamanan</h2>
                    <p className="card-desc">Konfigurasi perilaku antarmuka dasbor, zona waktu, dan autentikasi dua faktor.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => showToast('Preferensi sistem & kebijakan 2FA berhasil disimpan!', '✓')}>
                    Simpan Pengaturan
                  </button>
                </div>
                <div className="settings-form">
                  <div className="setting-row">
                    <div>
                      <strong>Mata Uang Utama</strong>
                      <p className="text-dim">Mata uang dasar untuk pembukuan laporan finansial dan buku besar transaksi.</p>
                    </div>
                    <select className="select-field" style={{ width: '200px' }} defaultValue="IDR">
                      <option value="IDR">IDR (Rupiah Indonesia)</option>
                      <option value="USD">USD (Dolar Amerika)</option>
                      <option value="SGD">SGD (Dolar Singapura)</option>
                    </select>
                  </div>

                  <div className="setting-row">
                    <div>
                      <strong>Autentikasi Dua Faktor (2FA)</strong>
                      <p className="text-dim">Wajibkan kode otentikasi TOTP saat sesi login eksekutif.</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-row">
                    <div>
                      <strong>Notifikasi Telemetri Real-time</strong>
                      <p className="text-dim">Terima peringatan instan untuk pesanan bernilai tinggi (&gt; Rp 1.000.000).</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.telemetryNotifications}
                        onChange={(e) => setSettings({ ...settings, telemetryNotifications: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ==========================================================================
          MODALS & DIALOGS
          ========================================================================== */}

      {/* 1. Modal Transaksi Baru */}
      <div className={`modal-overlay ${isTxModalOpen ? 'show' : ''}`} onClick={() => setIsTxModalOpen(false)}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <div className="modal-title">Buat Transaksi Baru (Tersimpan ke Database)</div>
            <button className="modal-close-btn" onClick={() => setIsTxModalOpen(false)}>&times;</button>
          </div>
          <form onSubmit={handleCreateTransaction} className="modal-body">
            <div className="form-group">
              <label className="form-label">Nama Pelanggan</label>
              <input
                type="text"
                className="input-field"
                placeholder="Contoh: Hendra Wijaya"
                value={txForm.customerName}
                onChange={(e) => setTxForm({ ...txForm, customerName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Alamat Email Pelanggan</label>
              <input
                type="email"
                className="input-field"
                placeholder="Contoh: hendra@corp.id"
                value={txForm.customerEmail}
                onChange={(e) => setTxForm({ ...txForm, customerEmail: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nominal Transaksi (IDR)</label>
              <input
                type="number"
                className="input-field"
                placeholder="Contoh: 1500000"
                value={txForm.amount}
                onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                min="10000"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status Gateway Pembayaran</label>
              <select
                className="select-field"
                value={txForm.status}
                onChange={(e) => setTxForm({ ...txForm, status: e.target.value })}
              >
                <option value="Lunas">Lunas (Settled)</option>
                <option value="Diproses">Sedang Diproses (Processing)</option>
                <option value="Dikembalikan">Dikembalikan (Refunded)</option>
              </select>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsTxModalOpen(false)}>Batal</button>
              <button type="submit" className="btn btn-primary">Simpan ke Database</button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. Modal Tambah Produk SKU */}
      <div className={`modal-overlay ${isProdModalOpen ? 'show' : ''}`} onClick={() => setIsProdModalOpen(false)}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <div className="modal-title">Tambah Item SKU ke Katalog</div>
            <button className="modal-close-btn" onClick={() => setIsProdModalOpen(false)}>&times;</button>
          </div>
          <form onSubmit={handleCreateProduct} className="modal-body">
            <div className="form-group">
              <label className="form-label">Nama Produk</label>
              <input
                type="text"
                className="input-field"
                placeholder="Contoh: Studio Pro Earbuds"
                value={prodForm.name}
                onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select
                className="select-field"
                value={prodForm.category}
                onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
              >
                <option value="Audio & Elektronik">Audio & Elektronik</option>
                <option value="Perangkat Wearable">Perangkat Wearable</option>
                <option value="Periferal & Aksesori">Periferal & Aksesori</option>
                <option value="Perangkat Keras Komputer">Perangkat Keras Komputer</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Harga Satuan (IDR)</label>
              <input
                type="number"
                className="input-field"
                placeholder="Contoh: 850000"
                value={prodForm.price}
                onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Jumlah Stok Unit</label>
              <input
                type="number"
                className="input-field"
                placeholder="Contoh: 50"
                value={prodForm.stock}
                onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                min="1"
                required
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsProdModalOpen(false)}>Batal</button>
              <button type="submit" className="btn btn-primary">Simpan SKU</button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. Modal Upgrade Cloud */}
      <div className={`modal-overlay ${isUpgradeModalOpen ? 'show' : ''}`} onClick={() => setIsUpgradeModalOpen(false)}>
        <div className="modal-card upgrade-modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <div className="modal-title">Tingkatkan Infrastruktur Cloud</div>
            <button className="modal-close-btn" onClick={() => setIsUpgradeModalOpen(false)}>&times;</button>
          </div>
          <div className="modal-body">
            <p className="text-dim mb-4">Pilih paket berkapasitas tinggi untuk operasi multi-wilayah dan jaminan SLA korporat.</p>
            <div className="plan-grid">
              <div className="plan-card">
                <div className="plan-badge">PEMULA</div>
                <h3>Paket Pro Tier</h3>
                <div className="plan-price">Rp 4.9M <span>/ bln</span></div>
                <ul className="plan-features">
                  <li>✓ Kapasitas Cloud 50 GB</li>
                  <li>✓ 10 Anggota Tim</li>
                  <li>✓ Webhook Terstandarisasi</li>
                </ul>
                <button className="btn btn-secondary w-full" onClick={() => { setIsUpgradeModalOpen(false); showToast('Paket saat ini aktif: Pro Tier', '🚀'); }}>
                  Paket Aktif
                </button>
              </div>

              <div className="plan-card featured">
                <div className="plan-badge highlight">DIREKOMENDASIKAN</div>
                <h3>Skala Enterprise</h3>
                <div className="plan-price">Rp 14.5M <span>/ bln</span></div>
                <ul className="plan-features">
                  <li>✓ Kapasitas Cloud Tanpa Batas</li>
                  <li>✓ 100+ Anggota Tim</li>
                  <li>✓ Jaminan Uptime SLA 99.99%</li>
                  <li>✓ Manajer Akun Khusus 24/7</li>
                </ul>
                <button className="btn btn-primary w-full" onClick={() => { setIsUpgradeModalOpen(false); showToast('Berhasil ditingkatkan ke Infrastruktur Enterprise!', '🚀'); }}>
                  Tingkatkan ke Enterprise
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu untuk Aksi Baris Tabel */}
      {contextMenu.show && contextMenu.targetTx && (
        <div
          className="context-menu show"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-item" onClick={() => { showToast(`Memeriksa rincian pesanan: ${contextMenu.targetTx.ref}`, '👁️'); setContextMenu({ show: false, x: 0, y: 0, targetTx: null }); }}>
            <span className="icon">👁️</span> Lihat Rincian Pesanan
          </div>
          <div className="context-item" onClick={() => handleUpdateTxStatus(contextMenu.targetTx.id, 'Lunas')}>
            <span className="icon">✓</span> Tandai Telah Lunas
          </div>
          <div className="context-item" onClick={() => { showToast(`Faktur pajak PDF dibuat untuk ${contextMenu.targetTx.ref}`, '📄'); setContextMenu({ show: false, x: 0, y: 0, targetTx: null }); }}>
            <span className="icon">📄</span> Unduh Faktur Pajak
          </div>
          <div className="context-item" onClick={() => handleUpdateTxStatus(contextMenu.targetTx.id, 'Dikembalikan')}>
            <span className="icon">🔄</span> Proses Pengembalian Dana
          </div>
          <div className="dropdown-divider"></div>
          <div className="context-item danger" onClick={() => handleDeleteTx(contextMenu.targetTx.id)}>
            <span className="icon">🗑️</span> Hapus Entri Transaksi
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="toast-wrapper">
        <div className={`toast-card ${toast.show ? 'show' : ''}`}>
          <span style={{ fontSize: '1.1em' }}>{toast.icon}</span>
          <span>{toast.message}</span>
        </div>
      </div>
    </div>
  );
}

const titles = {
  overview: 'Ringkasan Bisnis',
  sales: 'Penjualan & Pendapatan',
  crm: 'Daftar Pelanggan',
  products: 'Stok & Katalog Produk',
  orders: 'Pesanan Masuk',
  reports: 'Laporan Keuangan',
  settings: 'Pengaturan & Integrasi'
};

const subtitles = {
  overview: 'Pantau penjualan harian, pesanan terbaru, dan performa toko Anda secara langsung.',
  sales: 'Rincian omzet, metode pembayaran pembeli, dan langganan aktif.',
  crm: 'Kelola data pembeli, kontak pelanggan, dan riwayat transaksi pelanggan setia.',
  products: 'Atur jumlah stok barang, harga jual, dan pantau produk yang hampir habis.',
  orders: 'Proses pesanan baru, pantau status pengiriman paket, dan kelola retur.',
  reports: 'Unduh rekapitulasi laba rugi, riwayat kas masuk, dan pembukuan usaha Anda.',
  settings: 'Atur kunci API toko, keamanan akun 2FA, dan preferensi aplikasi.'
};
