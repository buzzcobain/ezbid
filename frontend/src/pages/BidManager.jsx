import React, { useState, useEffect } from 'react';
import { FileText, Save, Download, Plus, MapPin, Calculator, Trash2, Check } from 'lucide-react';

const RATES = {
  cluster: 1274.90,
  studio: 4290.50,
  premier: 5230.30,
  acc: 5248.89,
  kld4: 5677.82,
  kld5: 6392.33,
  kld6: 8744.18,
  kld7: 9116.01,
  kld8: 9521.50,
  kld9: 9949.10
};

const PM_RATE = 68.43;

export default function BidManager({ bids, activeBidId, onUpdateBid, onCreateBid, onDeleteBid }) {
  const [selectedBid, setSelectedBid] = useState(null);
  const [activeTab, setActiveTab] = useState('splits'); // 'splits' or 'content'
  const [saveSuccess, setSaveSuccess] = useState(false);

  // For creating new empty bids
  const [newProjectName, setNewProjectName] = useState('');
  const [newRef, setNewRef] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (activeBidId && bids.length > 0) {
      const bid = bids.find(b => b.id === activeBidId);
      if (bid) setSelectedBid(JSON.parse(JSON.stringify(bid))); // Deep clone
    } else if (bids.length > 0 && !selectedBid) {
      setSelectedBid(JSON.parse(JSON.stringify(bids[0])));
    }
  }, [activeBidId, bids]);

  if (bids.length === 0 && !showCreateForm) {
    return (
      <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '60px' }}>
        <FileText size={48} style={{ color: '#7F8C8D', opacity: 0.3 }} />
        <h3 style={{ marginTop: '20px' }}>No Active Bids Found</h3>
        <p style={{ color: '#7F8C8D', marginTop: '10px' }}>Initiate a bid from the Opportunity Finder or create one manually.</p>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setShowCreateForm(true)}>
          Create Manual Proposal
        </button>
      </div>
    );
  }

  // Math calculation engine
  const splits = selectedBid?.roomSplits || {};
  const bedSum = (splits.cluster || 0) + (splits.studio || 0) + (splits.premier || 0) + (splits.acc || 0);
  const kldSum = (splits.kld4 || 0) + (splits.kld5 || 0) + (splits.kld6 || 0) + (splits.kld7 || 0) + (splits.kld8 || 0) + (splits.kld9 || 0);
  const totalUnits = bedSum + kldSum;

  const bedroomsCost = 
    (splits.cluster || 0) * RATES.cluster +
    (splits.studio || 0) * RATES.studio +
    (splits.premier || 0) * RATES.premier +
    (splits.acc || 0) * RATES.acc;

  const kitchensCost = 
    (splits.kld4 || 0) * RATES.kld4 +
    (splits.kld5 || 0) * RATES.kld5 +
    (splits.kld6 || 0) * RATES.kld6 +
    (splits.kld7 || 0) * RATES.kld7 +
    (splits.kld8 || 0) * RATES.kld8 +
    (splits.kld9 || 0) * RATES.kld9;

  const pmFeeTotal = totalUnits * PM_RATE;
  const subTotal = bedroomsCost + kitchensCost + pmFeeTotal;
  const mcdDiscount = subTotal * 0.025;
  const grandTotal = subTotal - mcdDiscount;

  const formatGBP = (val) => '£' + val.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSplitChange = (key, val) => {
    const intVal = parseInt(val) || 0;
    setSelectedBid(prev => ({
      ...prev,
      roomSplits: {
        ...prev.roomSplits,
        [key]: intVal >= 0 ? intVal : 0
      }
    }));
  };

  const handleContentChange = (val) => {
    setSelectedBid(prev => ({
      ...prev,
      content: val
    }));
  };

  const handleSave = () => {
    onUpdateBid(selectedBid);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleCreateNew = (e) => {
    e.preventDefault();
    if (!newProjectName || !newRef) return;
    
    onCreateBid({
      projectName: newProjectName,
      reference: newRef,
      location: newLoc
    });

    setNewProjectName('');
    setNewRef('');
    setNewLoc('');
    setShowCreateForm(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#1A1A2E', fontWeight: '800' }}>Bid Manager</h1>
          <p style={{ color: '#7F8C8D', marginTop: '5px' }}>Customize project schedules, edit proposal texts, and export documents.</p>
        </div>
        
        <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
          <Plus size={16} />
          <span>New Manual Proposal</span>
        </button>
      </div>

      {/* Manual Bid Modal Overlays */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(26,26,46,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '440px', padding: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Create Proposal</h2>
            <form onSubmit={handleCreateNew} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Project Name</label>
                <input required type="text" className="input-field" placeholder="Heavitree Student Living" value={newProjectName} onChange={e=>setNewProjectName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Reference Code</label>
                <input required type="text" className="input-field" placeholder="Flag-HVR-001" value={newRef} onChange={e=>setNewRef(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Location / Region</label>
                <input type="text" className="input-field" placeholder="South West" value={newLoc} onChange={e=>setNewLoc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>Create</button>
                <button type="button" className="btn btn-secondary" onClick={()=>setShowCreateForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Core Split Pane Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 320px',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Pane: Bids List */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>PROPOSALS LIST</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '450px', overflowY: 'auto' }}>
            {bids.map(b => (
              <div 
                key={b.id}
                onClick={() => {
                  setSelectedBid(JSON.parse(JSON.stringify(b)));
                  setActiveTab('splits');
                }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid ' + (selectedBid?.id === b.id ? 'var(--accent-gold)' : 'var(--border-color)'),
                  backgroundColor: selectedBid?.id === b.id ? 'rgba(232, 197, 71, 0.05)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#1A1A2E' }}>{b.reference}</div>
                <div style={{ fontSize: '12px', color: '#7F8C8D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                  {b.projectName}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span className={`badge badge-${b.status.toLowerCase()}`} style={{ fontSize: '9px', padding: '2px 6px' }}>{b.status}</span>
                  <span style={{ fontSize: '10px', color: '#7F8C8D' }}>{b.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Pane: Editor tabs */}
        {selectedBid && (
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800' }}>{selectedBid.projectName}</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#7F8C8D', fontSize: '12px', marginTop: '4px' }}>
                  <span>Ref: <strong>{selectedBid.reference}</strong></span>
                  <span>|</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={12} /> {selectedBid.location}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-outline" style={{ color: '#c0392b', borderColor: '#c0392b', padding: '8px 12px' }} onClick={() => { if(confirm('Delete this proposal?')) onDeleteBid(selectedBid.id); }}>
                  <Trash2 size={16} />
                </button>
                <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={handleSave}>
                  {saveSuccess ? <Check size={16} /> : <Save size={16} />}
                  <span>{saveSuccess ? 'Saved' : 'Save Changes'}</span>
                </button>
              </div>
            </div>

            {/* Tab navigation */}
            <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <button 
                onClick={() => setActiveTab('splits')}
                style={{
                  background: 'none', border: 'none', padding: '6px 12px', cursor: 'pointer',
                  fontWeight: '600', fontSize: '14px',
                  color: activeTab === 'splits' ? 'var(--primary-navy)' : 'var(--muted-grey)',
                  borderBottom: '2px solid ' + (activeTab === 'splits' ? 'var(--accent-gold)' : 'transparent')
                }}
              >
                Room Splits / Quantity Schedule
              </button>
              <button 
                onClick={() => setActiveTab('content')}
                style={{
                  background: 'none', border: 'none', padding: '6px 12px', cursor: 'pointer',
                  fontWeight: '600', fontSize: '14px',
                  color: activeTab === 'content' ? 'var(--primary-navy)' : 'var(--muted-grey)',
                  borderBottom: '2px solid ' + (activeTab === 'content' ? 'var(--accent-gold)' : 'transparent')
                }}
              >
                Proposal Document Text (MD)
              </button>
            </div>

            {/* Tab 1: Room Splits Input fields */}
            {activeTab === 'splits' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: '#1A1A2E' }}>BEDROOMS PACKAGE</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#7F8C8D', display: 'block', marginBottom: '4px' }}>Cluster Bedrooms (£1,274.90)</label>
                      <input type="number" min="0" className="input-field" value={splits.cluster || 0} onChange={e => handleSplitChange('cluster', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#7F8C8D', display: 'block', marginBottom: '4px' }}>Standard Studios (£4,290.50)</label>
                      <input type="number" min="0" className="input-field" value={splits.studio || 0} onChange={e => handleSplitChange('studio', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#7F8C8D', display: 'block', marginBottom: '4px' }}>Premier Studios (£5,230.30)</label>
                      <input type="number" min="0" className="input-field" value={splits.premier || 0} onChange={e => handleSplitChange('premier', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#7F8C8D', display: 'block', marginBottom: '4px' }}>Accessible Studios ACC (£5,248.89)</label>
                      <input type="number" min="0" className="input-field" value={splits.acc || 0} onChange={e => handleSplitChange('acc', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: '#1A1A2E' }}>KITCHEN (KLD) UNITS</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#7F8C8D', display: 'block', marginBottom: '4px' }}>KLD 4-Person (£5,677.82)</label>
                      <input type="number" min="0" className="input-field" value={splits.kld4 || 0} onChange={e => handleSplitChange('kld4', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#7F8C8D', display: 'block', marginBottom: '4px' }}>KLD 5-Person (£6,392.33)</label>
                      <input type="number" min="0" className="input-field" value={splits.kld5 || 0} onChange={e => handleSplitChange('kld5', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#7F8C8D', display: 'block', marginBottom: '4px' }}>KLD 6-Person (£8,744.18)</label>
                      <input type="number" min="0" className="input-field" value={splits.kld6 || 0} onChange={e => handleSplitChange('kld6', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#7F8C8D', display: 'block', marginBottom: '4px' }}>KLD 7-Person (£9,116.01)</label>
                      <input type="number" min="0" className="input-field" value={splits.kld7 || 0} onChange={e => handleSplitChange('kld7', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#7F8C8D', display: 'block', marginBottom: '4px' }}>KLD 8-Person (£9,521.50)</label>
                      <input type="number" min="0" className="input-field" value={splits.kld8 || 0} onChange={e => handleSplitChange('kld8', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#7F8C8D', display: 'block', marginBottom: '4px' }}>KLD 9-Person (£9,949.10)</label>
                      <input type="number" min="0" className="input-field" value={splits.kld9 || 0} onChange={e => handleSplitChange('kld9', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Markdown Text Editor */}
            {activeTab === 'content' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <label style={{ fontSize: '12px', color: '#7F8C8D', fontWeight: '600' }}>EDIT PROPOSAL TEXT</label>
                <textarea
                  className="input-field"
                  rows="15"
                  value={selectedBid.content}
                  onChange={e => handleContentChange(e.target.value)}
                  style={{
                    fontFamily: 'Courier New, monospace',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Right Pane: Live BOQ totals calculations */}
        {selectedBid && (
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <Calculator size={18} style={{ color: '#B59312' }} />
              <h2 style={{ fontSize: '15px', fontWeight: '800' }}>LIVE ESTIMATE</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#7F8C8D' }}>Bedrooms Total:</span>
                <span style={{ fontWeight: '700' }}>{formatGBP(bedroomsCost)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#7F8C8D' }}>Kitchens Total:</span>
                <span style={{ fontWeight: '700' }}>{formatGBP(kitchensCost)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#7F8C8D' }}>PM/Prelims ({totalUnits} units):</span>
                <span style={{ fontWeight: '700' }}>{formatGBP(pmFeeTotal)}</span>
              </div>
              <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700' }}>
                <span>Sub-Total:</span>
                <span>{formatGBP(subTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7F8C8D', fontStyle: 'italic' }}>
                <span>MCD Discount (2.5%):</span>
                <span>-{formatGBP(mcdDiscount)}</span>
              </div>
              <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }}></div>
              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(26,26,46,0.03)',
                border: '1.5px solid var(--accent-gold)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#B59312' }}>GRAND TOTAL COST (EX VAT)</span>
                <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-navy)' }}>{formatGBP(grandTotal)}</span>
              </div>
            </div>

            {/* Document export triggers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#7F8C8D', marginBottom: '5px' }}>EXPORT OUTPUTS</h3>
              
              <a 
                href={`/api/bids/${selectedBid.id}/export/docx`} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-outline"
                style={{ textDecoration: 'none', justifyContent: 'space-between', padding: '10px 16px', fontSize: '13px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} />
                  <span>Word Proposal (.docx)</span>
                </div>
                <Download size={14} />
              </a>

              <a 
                href={`/api/bids/${selectedBid.id}/export/xlsx`} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-outline"
                style={{ textDecoration: 'none', justifyContent: 'space-between', padding: '10px 16px', fontSize: '13px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={16} style={{ color: '#27AE60' }} />
                  <span>Excel BOQ (.xlsx)</span>
                </div>
                <Download size={14} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
