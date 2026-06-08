import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BidManager from '../pages/BidManager';

const mockBids = [
  {
    id: 'flag-hvr-001',
    reference: 'Flag-HVR-001',
    projectName: 'Heavitree PBSA',
    location: 'South West',
    status: 'Drafting',
    roomSplits: {
      cluster: 10,
      studio: 5,
      premier: 0,
      acc: 0,
      kld4: 2,
      kld5: 0,
      kld6: 0,
      kld7: 0,
      kld8: 0,
      kld9: 0
    },
    content: '# Cover Letter\n\nContent editor text.',
    pricingBasis: 'Wolverhampton Rev 1'
  }
];

describe('BidManager Component', () => {
  test('renders splits schedule inputs and side proposals panel', () => {
    render(
      <BidManager
        bids={mockBids}
        activeBidId="flag-hvr-001"
        onUpdateBid={vi.fn()}
        onCreateBid={vi.fn()}
        onDeleteBid={vi.fn()}
      />
    );

    // Sidebar lists bid
    expect(screen.getByText('PROPOSALS LIST')).toBeInTheDocument();
    expect(screen.getAllByText('Heavitree PBSA').length).toBeGreaterThan(0);

    // Split fields are rendered
    expect(screen.getByText(/Cluster Bedrooms/i)).toBeInTheDocument();
    expect(screen.getByText(/Standard Studios/i)).toBeInTheDocument();
    expect(screen.getByText(/KLD 4-Person/i)).toBeInTheDocument();
  });

  test('recalculates live estimate dynamically on split inputs change', () => {
    const handleUpdate = vi.fn();
    render(
      <BidManager
        bids={mockBids}
        activeBidId="flag-hvr-001"
        onUpdateBid={handleUpdate}
        onCreateBid={vi.fn()}
        onDeleteBid={vi.fn()}
      />
    );

    // Initial check:
    // cluster: 10 * 1274.90 = 12749.00
    // studio: 5 * 4290.50 = 21452.50
    // kld4: 2 * 5677.82 = 11355.64
    // total units: 17
    // pm: 17 * 68.43 = 1163.31
    // subtotal = 46720.45
    // grand total = 46720.45 * 0.975 = 45,552.44
    expect(screen.getByText('£45,552.44')).toBeInTheDocument();

    // Trigger input change (Cluster 10 -> 20)
    const inputs = screen.getAllByRole('spinbutton');
    // First spinbutton should be Cluster bedroom input field
    fireEvent.change(inputs[0], { target: { value: '20' } });

    // Recalculates:
    // cluster: 20 * 1274.90 = 25498.00
    // studio: 5 * 4290.50 = 21452.50
    // kld4: 2 * 5677.82 = 11355.64
    // total units: 27
    // pm: 27 * 68.43 = 1847.61
    // subtotal = 60153.75
    // grand total = 60153.75 * 0.975 = 58,649.91
    expect(screen.getByText('£58,649.91')).toBeInTheDocument();
  });

  test('switches tabs and allows editing of markdown content text', () => {
    render(
      <BidManager
        bids={mockBids}
        activeBidId="flag-hvr-001"
        onUpdateBid={vi.fn()}
        onCreateBid={vi.fn()}
        onDeleteBid={vi.fn()}
      />
    );

    // Switch tab
    const contentTabBtn = screen.getByRole('button', { name: /Proposal Document Text/i });
    fireEvent.click(contentTabBtn);

    // Assert textarea renders and shows md text
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('# Cover Letter\n\nContent editor text.');
  });
});
