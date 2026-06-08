import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OpportunityFinder from '../pages/OpportunityFinder';

describe('OpportunityFinder Component', () => {
  beforeEach(() => {
    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        opportunities: [
          {
            reference: '26/00566/FPA',
            address: 'Heavitree Road, Exeter, EX1 2UR',
            lpa: 'Exeter City Council',
            submitted: '2026-05-24',
            status: 'Pending Decision',
            portalUrl: 'https://planning.exeter.gov.uk/',
            source: 'GSL Wire daily news feed',
            classification: 'PBSA',
            confidence: 'High',
            scale: '145 beds / 6 storeys',
            amenities: ['Gym', 'Cluster kitchens'],
            applicant: 'Student City Exeter Ltd',
            agent: 'LPA Planning Consultants',
            timing: 'Submitted 14 days ago.',
            opportunities: ['Opportunity 1'],
            redFlags: ['Flag 1'],
            action: 'Approach now',
            actionDescription: 'Strategy notes'
          }
        ]
      })
    });
  });

  test('renders finder forms search button', () => {
    render(<OpportunityFinder onInitiateBid={vi.fn()} />);
    expect(screen.getByText('Opportunity Finder')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Launch Scraper Scans/i })).toBeInTheDocument();
  });

  test('runs scan loader progress ticker and displays shortlist table', async () => {
    render(<OpportunityFinder onInitiateBid={vi.fn()} />);

    const runBtn = screen.getByRole('button', { name: /Launch Scraper Scans/i });
    fireEvent.click(runBtn);

    // Scanner loaders check
    expect(screen.getByText('Agent Running Pipeline')).toBeInTheDocument();

    // Wait for the full pipeline ticker to run (approx 2.4 seconds total in code due to setInterval)
    // We increase wait timeout threshold to let the mock pipeline conclude
    await waitFor(() => {
      expect(screen.getByText('Exeter City Council')).toBeInTheDocument();
      expect(screen.getByText('26/00566/FPA')).toBeInTheDocument();
    }, { timeout: 3500 });
  });

  test('inspecting list row opens details modal drawer with draft trigger', async () => {
    const handleInitiateBid = vi.fn();
    render(<OpportunityFinder onInitiateBid={handleInitiateBid} />);

    // Trigger scan
    fireEvent.click(screen.getByRole('button', { name: /Launch Scraper Scans/i }));
    
    // Wait for row
    await waitFor(() => {
      expect(screen.getByText('26/00566/FPA')).toBeInTheDocument();
    }, { timeout: 3500 });

    // Click on the row to inspect
    const inspectRow = screen.getByText('26/00566/FPA');
    fireEvent.click(inspectRow);

    // Drawer should show details
    expect(screen.getByText('Scheme Overview')).toBeInTheDocument();
    expect(screen.getByText('Student City Exeter Ltd')).toBeInTheDocument();
    expect(screen.getByText('LPA Planning Consultants')).toBeInTheDocument();

    // Click Draft active bid proposal button
    const draftBtn = screen.getByRole('button', { name: /Draft Active Bid Proposal/i });
    fireEvent.click(draftBtn);

    expect(handleInitiateBid).toHaveBeenCalled();
  });
});
