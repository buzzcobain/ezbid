import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Search, FileText, LogOut, Settings } from 'lucide-react';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import OpportunityFinder from './pages/OpportunityFinder';
import BidManager from './pages/BidManager';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bids, setBids] = useState([]);
  const [activeBidId, setActiveBidId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authentication check on mount
  useEffect(() => {
    const session = localStorage.getItem('ezbid_session');
    if (session) {
      setUser(JSON.parse(session));
    }
    setLoading(false);
  }, []);

  // Fetch bids from API
  const fetchBids = () => {
    fetch('/api/bids')
      .then(res => res.json())
      .then(data => setBids(data))
      .catch(err => console.error('Error fetching bids:', err));
  };

  useEffect(() => {
    if (user) {
      fetchBids();
    }
  }, [user]);

  // Navigate helper
  const handleNavigate = (tab, bidId = null) => {
    setActiveTab(tab);
    if (bidId) {
      setActiveBidId(bidId);
    }
  };

  // Create empty / customized bid
  const handleCreateBid = (newBidDetails) => {
    fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBidDetails)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          setBids(prev => [...prev, data]);
          setActiveBidId(data.id);
          setActiveTab('bids');
        }
      })
      .catch(err => console.error('Error creating bid:', err));
  };

  // Initiate a bid directly from an opportunity finder row
  const handleInitiateBidFromOpp = (opp) => {
    const defaultSplits = {
      cluster: opp.classification === 'PBSA' ? 120 : 0,
      studio: opp.classification === 'Co-living' ? 60 : 20,
      premier: opp.classification === 'Co-living' ? 10 : 5,
      acc: 5,
      kld4: opp.classification === 'PBSA' ? 15 : 0,
      kld5: 0, kld6: 0, kld7: 0, kld8: 0, kld9: 0
    };

    const cleanRef = opp.reference.replace(/\//g, '-');

    const body = {
      projectName: opp.address.split(',')[0],
      reference: `Flag-${cleanRef}`,
      location: opp.address.split(',').slice(-2).join(',').trim(),
      roomSplits: defaultSplits,
      content: `# Cover Letter\n\nDear ${opp.applicant},\n\n**Re: FF&E Supply & Installation – ${opp.address} (Ref: Flag-${cleanRef})**\n\nFollowing our review of the planning application details for the ${opp.scale} scheme at ${opp.address}, we are pleased to submit our proposal for the supply and installation of furniture, fixtures, and equipment (FF&E).\n\nFlagstaffe is an end-to-end FF&E specialist, and we get involved at the design stage to provide valuable budget stress-testing and specification advice, before managing the turnkey procurement, manufacturing, and installation.\n\nSincerely,\n\nDan Brownsword\nDirector, Flagstaffe\n\n---\n\n# About Flagstaffe\n\nFlagstaffe is a leading provider of large-scale Furniture, Fixtures, and Equipment (FF&E). With 100,000+ rooms delivered nationally, we guarantee high-capacity production, ConstructionLine Gold safety standards, and robust supply chain resilience.\n\n---\n\n# Proposed Approach\n\nFor the ${opp.scale} scheme, we will coordinate bedroom line items, kitchen configurations, appliances, and loose goods directly with your design and construction teams. We recommend an early design engagement to stress-test the specification and lock in raw material pricing.`
    };

    handleCreateBid(body);
  };

  // Update bid content/splits
  const handleUpdateBid = (updatedBid) => {
    fetch(`/api/bids/${updatedBid.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBid)
    })
      .then(res => res.json())
      .then(data => {
        setBids(prev => prev.map(b => b.id === data.id ? data : b));
      })
      .catch(err => console.error('Error updating bid:', err));
  };

  // Delete bid
  const handleDeleteBid = (id) => {
    fetch(`/api/bids/${id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(() => {
        setBids(prev => prev.filter(b => b.id !== id));
        setActiveBidId(null);
      })
      .catch(err => console.error('Error deleting bid:', err));
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('ezbid_session');
    setUser(null);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7F5F0'
      }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  if (!user) {
    return <SignIn onSignIn={(u) => setUser(u)} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="sidebar-logo-container">
          <img 
            src="https://flagstaffe.com/wp-content/uploads/2022/12/Color-logo-no-background.png" 
            alt="Flagstaffe" 
            className="sidebar-logo"
          />
        </div>

        <ul className="sidebar-menu">
          <li 
            className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigate('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </li>
          <li 
            className={`sidebar-item ${activeTab === 'finder' ? 'active' : ''}`}
            onClick={() => handleNavigate('finder')}
          >
            <Search size={20} />
            <span>Opportunity Finder</span>
          </li>
          <li 
            className={`sidebar-item ${activeTab === 'bids' ? 'active' : ''}`}
            onClick={() => handleNavigate('bids')}
          >
            <FileText size={20} />
            <span>Bid Manager</span>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="user-profile" style={{ marginBottom: '15px' }}>
            <div className="user-avatar">DB</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="sidebar-item" 
            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard bids={bids} onNavigate={handleNavigate} />
        )}
        {activeTab === 'finder' && (
          <OpportunityFinder onInitiateBid={handleInitiateBidFromOpp} />
        )}
        {activeTab === 'bids' && (
          <BidManager 
            bids={bids} 
            activeBidId={activeBidId} 
            onUpdateBid={handleUpdateBid} 
            onCreateBid={handleCreateBid}
            onDeleteBid={handleDeleteBid}
          />
        )}
      </div>
    </div>
  );
}
