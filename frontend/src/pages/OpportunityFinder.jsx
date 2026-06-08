import React, { useState } from 'react';
import { Search, MapPin, ShieldAlert, Award, FileSpreadsheet, PlusCircle, ExternalLink, RefreshCw } from 'lucide-react';

export default function OpportunityFinder({ onInitiateBid }) {
  const [region, setRegion] = useState('Nationwide');
  const [portalUrl, setPortalUrl] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const handleScan = (e) => {
    e.preventDefault();
    setLoading(true);
    setOpportunities([]);
    setSelectedOpportunity(null);

    // Simulate pipeline stage loader notifications
    const stages = [
      'Reading references/portal-directory.yaml...',
      'Accessing GSL Wire news feeds (gslglobal.com)...',
      'Contacting council planning portals (Idox / Civica)...',
      'Filtering out householder extensions...',
      'Running planning-classifier AI reasoning model...',
      'Assembling prioritised shortlist...'
    ];

    let stageIdx = 0;
    const interval = setInterval(() => {
      if (stageIdx < stages.length) {
        setScanStatus(stages[stageIdx]);
        stageIdx++;
      } else {
        clearInterval(interval);
        
        // Trigger API post
        fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ region, url: portalUrl || null })
        })
        .then(res => res.json())
        .then(data => {
          setOpportunities(data.opportunities || []);
          setLoading(false);
          setScanStatus('');
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
          setScanStatus('');
        });
      }
    }, 400);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h1 style={{ color: '#1A1A2E', fontWeight: '800' }}>Opportunity Finder</h1>
        <p style={{ color: '#7F8C8D', marginTop: '5px' }}>Scan UK local planning authorities and trade wires to identify PBSA & co-living opportunities.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Left Search Criteria Form */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Search Criteria</h2>
          
          <form onSubmit={handleScan} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1A1A2E', marginBottom: '8px' }}>
                Select Region / County scope
              </label>
              <select 
                className="input-field"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="Nationwide">Nationwide (All H-Demand)</option>
                <option value="Greater London">Greater London</option>
                <option value="North West">North West (Manchester/Salford/Liverpool)</option>
                <option value="South West">South West (Exeter/Bristol/Bath)</option>
                <option value="West Midlands">West Midlands (Birmingham/Coventry)</option>
                <option value="Scotland">Scotland (Edinburgh/Glasgow)</option>
                <option value="Wales">Wales (Cardiff/Swansea)</option>
              </select>
            </div>

            <div style={{ textAlign: 'center', color: '#7F8C8D', fontSize: '12px', fontWeight: '600' }}>— OR SCAN SPECIFIC PORTAL —</div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1A1A2E', marginBottom: '8px' }}>
                Planning Portal URL
              </label>
              <input
                type="url"
                className="input-field"
                placeholder="https://planning.council.gov.uk/.../application"
                value={portalUrl}
                onChange={(e) => setPortalUrl(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1A1A2E', marginBottom: '8px' }}>
                Paste Application Description Text
              </label>
              <textarea
                className="input-field"
                rows="4"
                placeholder="E.g., Demolition of office buildings and construction of a 145-bed purpose built student accommodation block..."
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Scanning...</span>
                </div>
              ) : (
                'Launch Scraper Scans'
              )}
            </button>
          </form>
        </div>

        {/* Right Scraper shortlist */}
        <div className="glass-card" style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Scan Shortlist</h2>

          {loading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
              gap: '15px',
              color: '#7F8C8D'
            }}>
              <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
              <p style={{ fontWeight: '600', color: '#1A1A2E' }}>Agent Running Pipeline</p>
              <p style={{ fontSize: '13px', fontStyle: 'italic' }}>{scanStatus}</p>
            </div>
          )}

          {!loading && opportunities.length === 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
              color: '#7F8C8D',
              gap: '10px'
            }}>
              <Search size={48} style={{ opacity: 0.3 }} />
              <p style={{ fontWeight: '600' }}>No scan results loaded yet.</p>
              <p style={{ fontSize: '13px' }}>Configure your search criteria on the left and run the scraper.</p>
            </div>
          )}

          {!loading && opportunities.length > 0 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <table className="custom-table" style={{ marginTop: '0px' }}>
                <thead>
                  <tr>
                    <th>Ref / Council</th>
                    <th>Classification</th>
                    <th>Scale</th>
                    <th>Action</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map((opp, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => setSelectedOpportunity(opp)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedOpportunity?.reference === opp.reference ? 'rgba(26,26,46,0.03)' : 'transparent'
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: '700', color: '#1A1A2E' }}>{opp.reference}</div>
                        <div style={{ fontSize: '12px', color: '#7F8C8D', marginTop: '2px' }}>{opp.lpa}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${opp.classification.toLowerCase().replace(/\s+/g, '')}`}>
                          {opp.classification}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{opp.scale}</td>
                      <td>
                        <span style={{
                          fontWeight: '700',
                          color: opp.action === 'Approach now' ? '#27AE60' : '#B59312',
                          fontSize: '13px'
                        }}>
                          {opp.action}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Opportunity Inspection Modal / Detail view at bottom if open */}
      {selectedOpportunity && (
        <div className="glass-card animate-fade-in" style={{
          borderTop: '4px solid var(--accent-gold)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <div>
              <span className="badge badge-pbsa" style={{ marginBottom: '8px' }}>{selectedOpportunity.classification} Opportunity</span>
              <h2 style={{ fontSize: '22px', fontWeight: '800' }}>{selectedOpportunity.address}</h2>
              <p style={{ color: '#7F8C8D', fontSize: '13px', marginTop: '4px' }}>
                Reference: <strong>{selectedOpportunity.reference}</strong> | Authority: <strong>{selectedOpportunity.lpa}</strong>
              </p>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={() => onInitiateBid(selectedOpportunity)}
              style={{ padding: '12px 24px' }}
            >
              <PlusCircle size={18} />
              <span>Draft Active Bid Proposal</span>
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px'
          }}>
            {/* Left side: details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A2E', marginBottom: '8px' }}>Scheme Overview</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                  <li><strong>Scale:</strong> {selectedOpportunity.scale}</li>
                  <li><strong>Developer:</strong> {selectedOpportunity.applicant}</li>
                  <li><strong>Architect Agent:</strong> {selectedOpportunity.agent}</li>
                  <li><strong>Portal Link:</strong> <a href={selectedOpportunity.portalUrl} target="_blank" rel="noreferrer" style={{ color: '#B59312', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>Go to planning site <ExternalLink size={12} /></a></li>
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A2E', marginBottom: '8px' }}>Timing & Stage Assessment</h3>
                <p style={{ fontSize: '14px', color: '#333' }}>{selectedOpportunity.timing}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#27AE60', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={18} />
                  <span>Flagstaffe FF&E Opportunities</span>
                </h3>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#333' }}>
                  {selectedOpportunity.opportunities.map((o, idx) => (
                    <li key={idx}>{o}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right side: Red flags & actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#c0392b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={18} />
                  <span>Risk Assessment & Red Flags</span>
                </h3>
                {selectedOpportunity.redFlags.length > 0 ? (
                  <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#333' }}>
                    {selectedOpportunity.redFlags.map((rf, idx) => (
                      <li key={idx}>{rf}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '14px', color: '#7F8C8D', italics: true }}>No critical red flags identified.</p>
                )}
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(232, 197, 71, 0.06)',
                border: '1px dashed var(--accent-gold)',
                borderRadius: '12px'
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#B59312', marginBottom: '8px' }}>Recommended Strategy</h3>
                <p style={{ fontSize: '14px', color: '#1A1A2E', fontWeight: '600' }}>Action: {selectedOpportunity.action}</p>
                <p style={{ fontSize: '13px', color: '#333', marginTop: '6px', lineHeight: 1.4 }}>{selectedOpportunity.actionDescription}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
