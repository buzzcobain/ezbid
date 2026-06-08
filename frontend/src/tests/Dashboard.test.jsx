import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';

const mockBids = [
  {
    id: 'flag-hvr-001',
    reference: 'Flag-HVR-001',
    projectName: 'Heavitree PBSA',
    location: 'South West',
    status: 'Drafting',
    roomSplits: {
      cluster: 100,
      studio: 30,
      premier: 10,
      acc: 5,
      kld4: 12,
      kld8: 8
    }
  }
];

describe('Dashboard Component', () => {
  test('displays summary stats and active proposals list', () => {
    const handleNavigate = vi.fn();
    render(<Dashboard bids={mockBids} onNavigate={handleNavigate} />);

    // Assert main header
    expect(screen.getByText('Pipeline Overview')).toBeInTheDocument();
    
    // Assert active proposal row renders
    expect(screen.getByText('Heavitree PBSA')).toBeInTheDocument();
    expect(screen.getByText('Flag-HVR-001')).toBeInTheDocument();
    expect(screen.getByText('South West')).toBeInTheDocument();
    
    // Assert beds count displays (100 + 30 + 10 + 5 = 145 Beds)
    expect(screen.getByText('145 Beds')).toBeInTheDocument();
  });

  test('calculates and renders correct pipeline valuation', () => {
    const handleNavigate = vi.fn();
    render(<Dashboard bids={mockBids} onNavigate={handleNavigate} />);

    // Calculations check:
    // cluster: 100 * 1274.90 = 127,490.00
    // studio: 30 * 4290.50 = 128,715.00
    // premier: 10 * 5230.30 = 52,303.00
    // acc: 5 * 5248.89 = 26,244.45
    // kld4: 12 * 5677.82 = 68,133.84
    // kld8: 8 * 9521.50 = 76,172.00
    // sum beds (145) + klds (20) = 165 units
    // pm fee: 165 * 68.43 = 11,290.95
    // subtotal = 490,349.24
    // grand total = subtotal - (subtotal * 0.025) = 478,090.51 -> £478,091
    expect(screen.getByText('£478,091')).toBeInTheDocument();
  });
});
