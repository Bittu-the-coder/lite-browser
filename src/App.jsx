import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';

// Sidebar width constants
const SIDEBAR_WIDTH = 260;
const SIDEBAR_PEEK = 4; // Thin strip to trigger sidebar

// Default quick links
const DEFAULT_LINKS = [
  { id: 1, name: 'Google', url: 'https://google.com', icon: '🔍' },
  { id: 2, name: 'YouTube', url: 'https://youtube.com', icon: '▶️' },
  { id: 3, name: 'ChatGPT', url: 'https://chat.openai.com', icon: '🤖' },
  { id: 4, name: 'GitHub', url: 'https://github.com', icon: '💻' },
  { id: 5, name: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
  { id: 6, name: 'Reddit', url: 'https://reddit.com', icon: '📱' },
];

// Icons
const Icons = {
  Panel: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>,
  ArrowLeft: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>,
  ArrowRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>,
  Refresh: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><path d="M20.49,15a9,9,0,1,1-2.12-9.36L23,10"/></svg>,
  Home: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3,9l9-7,9,7v11a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2Z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  Globe: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12,2a15.3,15.3,0,0,1,4,10,15.3,15.3,0,0,1-4,10,15.3,15.3,0,0,1-4-10A15.3,15.3,0,0,1,12,2z"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Compass: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor"/></svg>,
  Minimize: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="11" width="16" height="2"/></svg>,
  Maximize: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="1"/></svg>,
  Close: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// Tab component
function Tab({ tab, isActive, onSelect, onClose }) {
  const getDomain = (url) => { if (!url) return null; try { return new URL(url).hostname.replace('www.', ''); } catch { return null; } };
  const getFavicon = (url) => { const d = getDomain(url); return d ? `https://www.google.com/s2/favicons?domain=${d}&sz=32` : null; };

  return (
    <button className={`tab-item ${isActive ? 'active' : ''}`} onClick={onSelect} title={tab.url || 'New Tab'}>
      {tab.url ? <img src={getFavicon(tab.url)} alt="" className="tab-favicon" onError={(e) => e.target.style.display = 'none'} /> : <Icons.Globe />}
      <div className="tab-info">
        <div className="tab-title">{getDomain(tab.url) || 'New Tab'}</div>
      </div>
      <button className="tab-close" onClick={(e) => { e.stopPropagation(); onClose(); }}><Icons.X /></button>
    </button>
  );
}

// Quick Link component
function QuickLink({ link, onClick }) {
  return (
    <button className="quick-link" onClick={() => onClick(link.url)} title={link.name}>
      <span className="quick-link-icon">{link.icon}</span>
      <span className="quick-link-name">{link.name}</span>
    </button>
  );
}

// Search Overlay
function SearchOverlay({ visible, onClose, onNavigate }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (visible) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [visible]);

  if (!visible) return null;
  return (
    <div className="search-overlay visible" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <Icons.Search />
          <input ref={inputRef} type="text" placeholder="Search or enter URL..." value={query}
            onChange={(e) => setQuery(e.target.value)} autoFocus
            onKeyDown={(e) => { if (e.key === 'Escape') onClose(); else if (e.key === 'Enter' && query.trim()) { onNavigate(query.trim()); onClose(); } }} />
        </div>
        <div className="search-hint"><kbd>Enter</kbd> to go • <kbd>Esc</kbd> to close</div>
      </div>
    </div>
  );
}

// Welcome Screen with centered search and quick links
function WelcomeScreen({ onNavigate, quickLinks, onAddLink }) {
  const [inputValue, setInputValue] = useState('');
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const handleAddLink = () => {
    if (newLinkName && newLinkUrl) {
      onAddLink({ name: newLinkName, url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`, icon: '🔗' });
      setNewLinkName(''); setNewLinkUrl(''); setShowAddLink(false);
    }
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-header">
          <Icons.Compass />
          <h1>Lite Browser</h1>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (inputValue.trim()) onNavigate(inputValue.trim()); }} className="welcome-search">
          <div className="welcome-search-box">
            <Icons.Search />
            <input ref={inputRef} type="text" placeholder="Search or enter URL..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
          </div>
        </form>

        <div className="quick-links-section">
          <div className="quick-links-grid">
            {quickLinks.map(link => <QuickLink key={link.id} link={link} onClick={onNavigate} />)}
            <button className="quick-link add-link" onClick={() => setShowAddLink(!showAddLink)}>
              <span className="quick-link-icon"><Icons.Plus /></span>
              <span className="quick-link-name">Add</span>
            </button>
          </div>

          {showAddLink && (
            <div className="add-link-form">
              <input type="text" placeholder="Name" value={newLinkName} onChange={(e) => setNewLinkName(e.target.value)} />
              <input type="text" placeholder="URL" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} />
              <button onClick={handleAddLink}>Add</button>
            </div>
          )}
        </div>

        <div className="welcome-shortcut">Press <kbd>Ctrl</kbd> + <kbd>Space</kbd> anytime to search</div>
      </div>
    </div>
  );
}

// Main App
function App() {
  const [tabs, setTabs] = useState([{ id: 1, title: 'New Tab', url: '' }]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [sidebarVisible, setSidebarVisible] = useState(true);  // Start visible
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [quickLinks, setQuickLinks] = useState(() => {
    const saved = localStorage.getItem('quickLinks');
    return saved ? JSON.parse(saved) : DEFAULT_LINKS;
  });
  const urlInputRef = useRef(null);
  const sidebarTimeoutRef = useRef(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  // Show sidebar if: visible state, pinned, OR on welcome screen (no URL)
  const showSidebar = sidebarVisible || sidebarPinned || !activeTab.url;

  // Save quick links
  useEffect(() => { localStorage.setItem('quickLinks', JSON.stringify(quickLinks)); }, [quickLinks]);

  const addQuickLink = (link) => {
    setQuickLinks(prev => [...prev, { ...link, id: Date.now() }]);
  };

  // Calculate webview bounds - account for titlebar (36px) and sidebar
  const TITLEBAR_HEIGHT = 36;
  const getWebviewBounds = useCallback(() => {
    const sidebarOffset = showSidebar ? SIDEBAR_WIDTH : 0;
    return {
      x: sidebarOffset,
      y: TITLEBAR_HEIGHT,
      width: windowSize.width - sidebarOffset,
      height: windowSize.height - TITLEBAR_HEIGHT
    };
  }, [showSidebar, windowSize]);

  // Track window size
  useEffect(() => {
    const updateSize = async () => {
      try {
        const win = getCurrentWindow();
        const innerSize = await win.innerSize();
        const scaleFactor = await win.scaleFactor();
        setWindowSize({ width: innerSize.width / scaleFactor, height: innerSize.height / scaleFactor });
      } catch { setWindowSize({ width: window.innerWidth, height: window.innerHeight }); }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    const interval = setInterval(updateSize, 100);
    return () => { window.removeEventListener('resize', updateSize); clearInterval(interval); };
  }, []);

  // Resize webviews when sidebar visibility or window changes
  useEffect(() => {
    const bounds = getWebviewBounds();
    tabs.forEach(tab => {
      if (tab.url) { invoke('resize_webview', { tabId: tab.id, ...bounds }).catch(() => {}); }
    });
  }, [showSidebar, windowSize, tabs, getWebviewBounds]);

  // Auto-hide sidebar handlers
  const handleMouseEnterSidebar = () => {
    if (sidebarTimeoutRef.current) clearTimeout(sidebarTimeoutRef.current);
    setSidebarVisible(true);
  };
  const handleMouseLeaveSidebar = () => {
    if (!sidebarPinned && activeTab.url) {
      sidebarTimeoutRef.current = setTimeout(() => setSidebarVisible(false), 300);
    }
  };

  // Navigate to URL
  const navigateTo = useCallback(async (input) => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const url = await invoke('navigate_to', { url: input });
      const bounds = getWebviewBounds();
      setTabs(prev => prev.map(tab => tab.id === activeTabId ? { ...tab, url, title: url } : tab));
      setUrlInput(url);
      await invoke('create_webview', { url, tabId: activeTabId, ...bounds });
      await invoke('switch_tab', { activeTabId, allTabIds: tabs.map(t => t.id) });
      if (!sidebarPinned) setSidebarVisible(false);
    } catch (err) { console.error('Navigation error:', err); }
    finally { setLoading(false); }
  }, [activeTabId, tabs, getWebviewBounds, sidebarPinned]);

  const goBack = useCallback(() => invoke('go_back', { tabId: activeTabId }).catch(() => {}), [activeTabId]);
  const goForward = useCallback(() => invoke('go_forward', { tabId: activeTabId }).catch(() => {}), [activeTabId]);
  const reload = useCallback(() => { setLoading(true); invoke('reload_webview', { tabId: activeTabId }).catch(() => {}); setTimeout(() => setLoading(false), 500); }, [activeTabId]);
  const goHome = useCallback(async () => {
    await invoke('close_webview', { tabId: activeTabId }).catch(() => {});
    setTabs(prev => prev.map(tab => tab.id === activeTabId ? { ...tab, url: '', title: 'New Tab' } : tab));
    setUrlInput('');
    setSidebarVisible(true);
  }, [activeTabId]);

  const newTab = useCallback(async () => {
    const newId = Math.max(...tabs.map(t => t.id)) + 1;
    const newTabs = [...tabs, { id: newId, title: 'New Tab', url: '' }];
    setTabs(newTabs); setActiveTabId(newId); setUrlInput('');
    await invoke('switch_tab', { activeTabId: newId, allTabIds: newTabs.map(t => t.id) }).catch(() => {});
    setSidebarVisible(true);
  }, [tabs]);

  // Navigate in new tab (for Ctrl+Space search)
  const searchNavigateNewTab = useCallback(async (input) => {
    if (!input.trim()) return;
    const newId = Math.max(...tabs.map(t => t.id)) + 1;
    const newTabs = [...tabs, { id: newId, title: 'Loading...', url: '' }];
    setTabs(newTabs);
    setActiveTabId(newId);
    // Now navigate in the new tab
    setLoading(true);
    try {
      const url = await invoke('navigate_to', { url: input });
      const bounds = getWebviewBounds();
      setTabs(prev => prev.map(tab => tab.id === newId ? { ...tab, url, title: url } : tab));
      setUrlInput(url);
      await invoke('create_webview', { url, tabId: newId, ...bounds });
      await invoke('switch_tab', { activeTabId: newId, allTabIds: newTabs.map(t => t.id) });
      if (!sidebarPinned) setSidebarVisible(false);
    } catch (err) { console.error('Navigation error:', err); }
    finally { setLoading(false); }
  }, [tabs, getWebviewBounds, sidebarPinned]);

  const closeTab = useCallback(async (tabId) => {
    await invoke('close_webview', { tabId }).catch(() => {});
    if (tabs.length === 1) { setTabs([{ id: 1, title: 'New Tab', url: '' }]); setActiveTabId(1); setUrlInput(''); return; }
    const index = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (tabId === activeTabId) {
      const newActiveTab = newTabs[Math.min(index, newTabs.length - 1)];
      setActiveTabId(newActiveTab.id); setUrlInput(newActiveTab.url || '');
      await invoke('switch_tab', { activeTabId: newActiveTab.id, allTabIds: newTabs.map(t => t.id) }).catch(() => {});
    }
  }, [tabs, activeTabId]);

  const selectTab = useCallback(async (tabId) => {
    setActiveTabId(tabId);
    const tab = tabs.find(t => t.id === tabId);
    setUrlInput(tab?.url || '');
    await invoke('switch_tab', { activeTabId: tabId, allTabIds: tabs.map(t => t.id) }).catch(() => {});
  }, [tabs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); setSearchVisible(true); }
      if (e.ctrlKey && e.key === 't') { e.preventDefault(); newTab(); }
      if (e.ctrlKey && e.key === 'w') { e.preventDefault(); closeTab(activeTabId); }
      if (e.ctrlKey && e.key === 'l') { e.preventDefault(); setSidebarVisible(true); setTimeout(() => { urlInputRef.current?.focus(); urlInputRef.current?.select(); }, 100); }
      if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') { e.preventDefault(); reload(); }
      if (e.key === 'Escape') { if (searchVisible) setSearchVisible(false); else if (!sidebarPinned && activeTab.url) setSidebarVisible(false); }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [newTab, closeTab, activeTabId, reload, searchVisible, sidebarPinned, activeTab.url]);

  useEffect(() => { setUrlInput(activeTab.url || ''); }, [activeTab.url]);

  return (
    <div className="app-container">
      {/* Custom Titlebar */}
      <div className="titlebar" data-tauri-drag-region>
        <div className="titlebar-left">
          <button className="titlebar-btn menu-btn" onClick={() => setSidebarVisible(!sidebarVisible)} title="Toggle Sidebar">
            <Icons.Panel />
          </button>
          <span className="titlebar-title">Lite Browser</span>
        </div>
        <div className="titlebar-center" data-tauri-drag-region></div>
        <div className="titlebar-right">
          <button className="titlebar-btn" onClick={async () => { try { await getCurrentWindow().minimize(); } catch(e) { console.log(e); } }} title="Minimize">
            <Icons.Minimize />
          </button>
          <button className="titlebar-btn" onClick={async () => {
            try {
              const win = getCurrentWindow();
              const isMax = await win.isMaximized();
              if (isMax) await win.unmaximize();
              else await win.maximize();
            } catch(e) { console.log(e); }
          }} title="Maximize">
            <Icons.Maximize />
          </button>
          <button className="titlebar-btn close-btn" onClick={async () => { try { await getCurrentWindow().close(); } catch(e) { console.log(e); } }} title="Close">
            <Icons.Close />
          </button>
        </div>
      </div>

      {/* Sidebar trigger zone */}
      {!showSidebar && activeTab.url && (
        <div className="sidebar-trigger" onMouseEnter={handleMouseEnterSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${showSidebar ? 'visible' : 'hidden'}`}
        onMouseEnter={handleMouseEnterSidebar} onMouseLeave={handleMouseLeaveSidebar}>
        <div className="sidebar-header">
          <span className="sidebar-logo">Lite</span>
          <button className={`pin-btn ${sidebarPinned ? 'pinned' : ''}`} onClick={() => setSidebarPinned(!sidebarPinned)} title={sidebarPinned ? 'Unpin sidebar' : 'Pin sidebar'}>
            📌
          </button>
        </div>

        <div className="nav-controls">
          <button className="nav-btn" onClick={goBack} title="Back"><Icons.ArrowLeft /></button>
          <button className="nav-btn" onClick={goForward} title="Forward"><Icons.ArrowRight /></button>
          <button className="nav-btn" onClick={reload} title="Reload"><Icons.Refresh /></button>
          <button className="nav-btn" onClick={goHome} title="Home"><Icons.Home /></button>
        </div>

        <div className="url-section">
          <form onSubmit={(e) => { e.preventDefault(); navigateTo(urlInput); }}>
            <div className="url-input-wrapper">
              <Icons.Globe />
              <input ref={urlInputRef} type="text" className="url-input" placeholder="Search or enter URL..."
                value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
            </div>
          </form>
        </div>

        <div className="tabs-section">
          <div className="tabs-header">
            <span className="tabs-title">Tabs</span>
            <button className="new-tab-btn" onClick={newTab} title="New Tab"><Icons.Plus /></button>
          </div>
          <div className="tab-list">
            {tabs.map(tab => (
              <Tab key={tab.id} tab={tab} isActive={tab.id === activeTabId}
                onSelect={() => selectTab(tab.id)} onClose={() => closeTab(tab.id)} />
            ))}
          </div>
        </div>
      </aside>

      {/* Content area */}
      <main className="browser-content" style={{ marginLeft: showSidebar ? SIDEBAR_WIDTH : 0 }}>
        {loading && <div className="loading-bar loading" />}
        {!activeTab.url && <WelcomeScreen onNavigate={navigateTo} quickLinks={quickLinks} onAddLink={addQuickLink} />}
      </main>



      <SearchOverlay visible={searchVisible} onClose={() => setSearchVisible(false)} onNavigate={searchNavigateNewTab} />
    </div>
  );
}

export default App;
