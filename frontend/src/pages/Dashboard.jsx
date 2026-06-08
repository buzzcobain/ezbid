import React from 'react';
import { Briefcase, Search, FileText, CheckCircle2, TrendingUp, Calendar, MapPin } from 'lucide-react';

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

export default function Dashboard({ bids, onNavigate }) {
  // Recalculate pipeline total value dynamically
  const calculatePipelineTotal = () => {
    let grandTotal = 0;
    bids.forEach(bid => {
      const splits = bid.roomSplits || {};
      let totalBeds = (splits.cluster || 0) + (splits.studio || 0) + (splits.premier || 0) + (splits.acc || 0);
      let totalKLDs = (splits.kld4 || 0) + (splits.kld5 || 0) + (splits.kld6 || 0) + (splits.kld7 || 0) + (splits.kld8 || 0) + (splits.kld9 || 0);
      let totalUnits = totalBeds + totalKLDs;

      let itemsSum = 
        (splits.cluster || 0) * RATES.cluster +
        (splits.studio || 0) * RATES.studio +
        (splits.premier || 0) * RATES.premier +
        (splits.acc || 0) * RATES.acc +
        (splits.kld4 || 0) * RATES.kld4 +
        (splits.kld5 || 0) * RATES.kld5 +
        (splits.kld6 || 0) * RATES.kld6 +
        (splits.kld7 || 0) * RATES.kld7 +
        (splits.kld8 || 0) * RATES.kld8 +
        (splits.kld9 || 0) * RATES.kld9;

      let subtotal = itemsSum + (totalUnits * PM_RATE);
      let total = subtotal - (subtotal * 0.025);
      grandTotal += total;
    });
    return grandTotal;
  };

  const pipelineValue = calculatePipelineTotal();

  const mockFeed = [
    { council: 'Bristol City Council', ref: '26/00104/FUL', type: 'Co-living (78 units)', time: '2 hours ago' },
    { council: 'Manchester City Council', ref: '26/01222/OUT', type: 'PBSA (210 beds)', time: '1 day ago' },
    { council: 'Newport City Council', ref: '26/03312/FUL', type: 'Co-living (55 units)', time: '3 days ago' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h1 style={{ color: '#1A1A2E', fontWeight: '800' }}>Pipeline Overview</h1>
        <p style={{ color: '#7F8C8D', marginTop: '5px' }}>Welcome back, Dan. Here is Flagstaffe's estimator pipeline activity.</p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {/* KPI 1 */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(232, 197, 71, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#B59312'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#7F8C8D', fontWeight: '600' }}>PIPELINE VALUE</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: '#1A1A2E' }}>
              £{pipelineValue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
            </h3>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(26, 26, 46, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1A1A2E'
          }}>
            <Briefcase size={24} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#7F8C8D', fontWeight: '600' }}>BIDS IN PROGRESS</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: '#1A1A2E' }}>
              {bids.length} Active
            </h3>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#27AE60'
          }}>
            <Search size={24} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#7F8C8D', fontWeight: '600' }}>OPEN OPPORTUNITIES</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: '#1A1A2E' }}>
              12 Found
            </h3>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2980B9'
          }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#7F8C8D', fontWeight: '600' }}>EXPERIAN SCORE</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: '#1A1A2E' }}>
              93 / 100
            </h3>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Active bids section */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Active Proposals</h2>
            <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => onNavigate('bids')}>
              Manage Bids
            </button>
          </div>
          
          <table className="custom-table" style={{ marginTop: '0px' }}>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Project Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Rooms</th>
              </tr>
            </thead>
            <tbody>
              {bids.map(bid => {
                const totalBeds = (bid.roomSplits.cluster || 0) + (bid.roomSplits.studio || 0) + (bid.roomSplits.premier || 0) + (bid.roomSplits.acc || 0);
                return (
                  <tr key={bid.id} style={{ cursor: 'pointer' }} onClick={() => onNavigate('bids', bid.id)}>
                    <td style={{ fontWeight: '700', color: '#1A1A2E' }}>{bid.reference}</td>
                    <td>{bid.projectName}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} style={{ color: '#7F8C8D' }} />
                        <span>{bid.location}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${bid.status.toLowerCase()}`}>
                        {bid.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{totalBeds} Beds</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Scraper sidebar feed */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Portal Scan Feed</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mockFeed.map((feedItem, idx) => (
              <div key={idx} style={{
                padding: '16px',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                backgroundColor: 'rgba(26,26,46,0.01)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#B59312' }}>{feedItem.council}</span>
                  <span style={{ fontSize: '10px', color: '#7F8C8D', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    {feedItem.time}
                  </span>
                </div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#1A1A2E' }}>{feedItem.ref}</div>
                <div style={{ fontSize: '13px', color: '#7F8C8D' }}>{feedItem.type}</div>
              </div>
            ))}
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '12px' }} onClick={() => onNavigate('finder')}>
              Scan For Opportunities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
