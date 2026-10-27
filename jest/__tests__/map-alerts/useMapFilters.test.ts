/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useMapFilters } from '@/_hooks/useMapFilters';
import { mockAlerts, mockAdminAlerts } from '../../__mocks__/mockAlerts';
import { Alert } from '@/_types/alert';

describe('useMapFilters — initial state', () => {
  const setup = () => renderHook(() => useMapFilters({ alerts: mockAlerts }));

  it('should default startDate to 2025-01-01', () => {
    const { result } = setup();
    expect(result.current.startDate).toBe('2025-01-01');
  });

  it('should default endDate to today', () => {
    const today = new Date().toISOString().split('T')[0];
    const { result } = setup();
    expect(result.current.endDate).toBe(today);
  });

  it('should default showBycatch to true', () => {
    const { result } = setup();
    expect(result.current.showBycatch).toBe(true);
  });

  it('should default showAlerts to true', () => {
    const { result } = setup();
    expect(result.current.showAlerts).toBe(true);
  });

  it('should initialise selectedVessels from initialVessels prop', () => {
    const { result } = renderHook(() =>
      useMapFilters({ alerts: mockAdminAlerts, initialVessels: [1, 2] })
    );
    expect(result.current.selectedVessels).toEqual([1, 2]);
  });

  it('should default selectedVessels to empty array when not provided', () => {
    const { result } = setup();
    expect(result.current.selectedVessels).toEqual([]);
  });
});

describe('useMapFilters — alertTypeText', () => {
  const setup = () => renderHook(() => useMapFilters({ alerts: mockAlerts }));

  it('should return "all bycatch and alerts" when both are enabled', () => {
    const { result } = setup();
    expect(result.current.alertTypeText).toBe('all bycatch and alerts');
  });

  it('should return "all bycatch alerts" when only showBycatch is true', () => {
    const { result } = setup();
    act(() => result.current.setShowAlerts(false));
    expect(result.current.alertTypeText).toBe('all bycatch');
  });

  it('should return "all alerts" when only showAlerts is true', () => {
    const { result } = setup();
    act(() => result.current.setShowBycatch(false));
    expect(result.current.alertTypeText).toBe('all alerts');
  });

  it('should return "no alerts" when both are disabled', () => {
    const { result } = setup();
    act(() => {
      result.current.setShowBycatch(false);
      result.current.setShowAlerts(false);
    });
    expect(result.current.alertTypeText).toBe('no alerts');
  });
});

describe('useMapFilters — vesselCountText', () => {
  it('should return "no vessels" when selectedVessels is empty', () => {
    const { result } = renderHook(() => useMapFilters({ alerts: mockAlerts }));
    expect(result.current.vesselCountText).toBe('no vessels');
  });

  it('should return "1 vessel" for a single selected vessel', () => {
    const { result } = renderHook(() =>
      useMapFilters({ alerts: mockAdminAlerts, initialVessels: [1] })
    );
    expect(result.current.vesselCountText).toBe('1 vessel');
  });

  it('should return "N vessels" for multiple selected vessels', () => {
    const { result } = renderHook(() =>
      useMapFilters({ alerts: mockAdminAlerts, initialVessels: [1, 2] })
    );
    expect(result.current.vesselCountText).toBe('2 vessels');
  });

  it('should update vesselCountText when selectedVessels changes', () => {
    const { result } = renderHook(() =>
      useMapFilters({ alerts: mockAdminAlerts, initialVessels: [1, 2] })
    );
    act(() => result.current.setSelectedVessels([1]));
    expect(result.current.vesselCountText).toBe('1 vessel');
  });
});

describe('useMapFilters — date filtering', () => {
  const setup = () => renderHook(() => useMapFilters({ alerts: mockAlerts }));

  it('should include alerts within the date range', () => {
    const { result } = setup();
    act(() => {
      result.current.setStartDate('2025-01-01');
      result.current.setEndDate('2025-01-31');
    });
    const ids = result.current.filteredAlerts.map(a => a.id);
    expect(ids).toContain('alert-1');
    expect(ids).toContain('alert-2');
    expect(ids).toContain('alert-3');
  });

  it('should exclude alerts before the start date', () => {
    const { result } = setup();
    act(() => {
      result.current.setStartDate('2025-01-20');
      result.current.setEndDate('2025-01-31');
    });
    const ids = result.current.filteredAlerts.map(a => a.id);
    expect(ids).not.toContain('alert-1'); // 15 Jan — before range
    expect(ids).toContain('alert-2');     // 20 Jan — on start boundary
  });

  it('should exclude alerts after the end date', () => {
    const { result } = setup();
    act(() => {
      result.current.setStartDate('2025-01-01');
      result.current.setEndDate('2025-01-15');
    });
    const ids = result.current.filteredAlerts.map(a => a.id);
    expect(ids).toContain('alert-1');     // 15 Jan — on end boundary
    expect(ids).not.toContain('alert-2'); // 20 Jan — after range
  });

  it('should return an empty array when date range excludes all alerts', () => {
    const { result } = setup();
    act(() => {
      result.current.setStartDate('2025-03-01');
      result.current.setEndDate('2025-03-31');
    });
    expect(result.current.filteredAlerts).toHaveLength(0);
  });

  it('should support a single-day date range', () => {
    const { result } = setup();
    act(() => {
      result.current.setStartDate('2025-01-20');
      result.current.setEndDate('2025-01-20');
    });
    const ids = result.current.filteredAlerts.map(a => a.id);
    expect(ids).toEqual(['alert-2']);
  });
});

describe('useMapFilters — alert type filtering', () => {
  const setup = () => renderHook(() => useMapFilters({ alerts: mockAlerts }));

  it('should return all alerts when both showBycatch and showAlerts are true', () => {
    const { result } = setup();
    act(() => {
      result.current.setStartDate('2025-01-01');
      result.current.setEndDate('2025-01-31');
    });
    expect(result.current.filteredAlerts).toHaveLength(3);
  });

  it('should return only bycatch alerts when showAlerts is false', () => {
    const { result } = setup();
    act(() => {
      result.current.setStartDate('2025-01-01');
      result.current.setEndDate('2025-01-31');
      result.current.setShowAlerts(false);
    });
    const ids = result.current.filteredAlerts.map(a => a.id);
    expect(ids).toContain('alert-1');     // has speciesDetected
    expect(ids).toContain('alert-3');     // has speciesDetected
    expect(ids).not.toContain('alert-2'); // empty speciesDetected
  });

  it('should return only non-bycatch alerts when showBycatch is false', () => {
    const { result } = setup();
    act(() => {
      result.current.setStartDate('2025-01-01');
      result.current.setEndDate('2025-01-31');
      result.current.setShowBycatch(false);
    });
    const ids = result.current.filteredAlerts.map(a => a.id);
    expect(ids).toContain('alert-2');     // empty speciesDetected
    expect(ids).not.toContain('alert-1');
    expect(ids).not.toContain('alert-3');
  });

  it('should return no alerts when both showBycatch and showAlerts are false', () => {
    const { result } = setup();
    act(() => {
      result.current.setShowBycatch(false);
      result.current.setShowAlerts(false);
    });
    expect(result.current.filteredAlerts).toHaveLength(0);
  });
});

describe('useMapFilters — vessel filtering', () => {
  it('should return no alerts when selectedVessels is empty', () => {
    const { result } = renderHook(() =>
      useMapFilters({ alerts: mockAdminAlerts, initialVessels: [] })
    );
    expect(result.current.filteredAlerts).toHaveLength(0);
  });

  it('should return only alerts for selected vessels', () => {
    const { result } = renderHook(() =>
      useMapFilters({ alerts: mockAdminAlerts, initialVessels: [1] })
    );
    act(() => {
      result.current.setStartDate('2025-01-01');
      result.current.setEndDate('2025-01-31');
    });
    const ids = result.current.filteredAlerts.map(a => a.id);
    expect(ids).toContain('alert-1');
    expect(ids).toContain('alert-2');
    expect(ids).not.toContain('alert-3');
    expect(ids).not.toContain('alert-4');
  });

  it('should return alerts for all selected vessels', () => {
    const { result } = renderHook(() =>
      useMapFilters({ alerts: mockAdminAlerts, initialVessels: [1, 2] })
    );
    act(() => {
      result.current.setStartDate('2025-01-01');
      result.current.setEndDate('2025-01-31');
    });
    expect(result.current.filteredAlerts).toHaveLength(4);
  });

  it('should update filtered alerts when selectedVessels changes', () => {
    const { result } = renderHook(() =>
      useMapFilters({ alerts: mockAdminAlerts, initialVessels: [1, 2] })
    );
    act(() => {
      result.current.setStartDate('2025-01-01');
      result.current.setEndDate('2025-01-31');
    });
    expect(result.current.filteredAlerts).toHaveLength(4);

    act(() => result.current.setSelectedVessels([2]));
    expect(result.current.filteredAlerts).toHaveLength(2);
  });

  it('should not apply vessel filtering for non-admin alerts', () => {
    // Plain Alert has no vesselId — vessel filter is skipped entirely
    const { result } = renderHook(() =>
      useMapFilters({ alerts: mockAlerts, initialVessels: [] })
    );
    act(() => {
      result.current.setStartDate('2025-01-01');
      result.current.setEndDate('2025-01-31');
    });
    // All 3 Jan alerts pass through despite selectedVessels being empty
    expect(result.current.filteredAlerts).toHaveLength(3);
  });
});

describe('useMapFilters — combined filtering', () => {
  it('should apply vessel and date filters together', () => {
    const { result } = renderHook(() =>
      useMapFilters({ alerts: mockAdminAlerts, initialVessels: [1, 2] })
    );
    act(() => {
      result.current.setStartDate('2025-01-15');
      result.current.setEndDate('2025-01-15');
    });
    // Only alert-1 15 Jan for vessel 1
    expect(result.current.filteredAlerts).toHaveLength(1);
    expect(result.current.filteredAlerts[0].id).toBe('alert-1');
  });

  it('should apply vessel and alert type filters together', () => {
    const { result } = renderHook(() =>
      useMapFilters({ alerts: mockAdminAlerts, initialVessels: [1] })
    );
    act(() => {
      result.current.setStartDate('2025-01-01');
      result.current.setEndDate('2025-01-31');
      result.current.setShowAlerts(false); // bycatch only
    });
    // vessel 1 has 1 bycatch alert (alert-1) and 1 non-bycatch (alert-2)
    expect(result.current.filteredAlerts).toHaveLength(1);
    expect(result.current.filteredAlerts[0].id).toBe('alert-1');
  });

  it('should apply date and alert type filters together', () => {
    const { result } = renderHook(() => useMapFilters({ alerts: mockAlerts }));
    act(() => {
      result.current.setStartDate('2025-01-25');
      result.current.setEndDate('2025-01-25');
      result.current.setShowAlerts(false); // bycatch only
    });
    // alert-3 is 25 Jan bycatch; alert-2 is 20 Jan so excluded by date
    expect(result.current.filteredAlerts).toHaveLength(1);
    expect(result.current.filteredAlerts[0].id).toBe('alert-3');
  });

  it('should return empty when all three filters exclude everything', () => {
    const { result } = renderHook(() =>
      useMapFilters({ alerts: mockAdminAlerts, initialVessels: [1] })
    );
    act(() => {
      result.current.setStartDate('2025-02-01');
      result.current.setEndDate('2025-02-28');
    });
    expect(result.current.filteredAlerts).toHaveLength(0);
  });
});

describe('useMapFilters — edge cases', () => {
  it('should return empty filteredAlerts for an empty alerts array', () => {
    const { result } = renderHook(() => useMapFilters({ alerts: [] }));
    expect(result.current.filteredAlerts).toHaveLength(0);
  });

  it('should handle alerts with undefined speciesDetected as non-bycatch', () => {
    const alertWithNoSpecies: Alert[] = [
      {
        id: 'x',
        type: 'alert',
        name: 'Test Alert',
        time: '2025-01-15T10:00:00Z',
        latitude: 1.01,
        longitude: 2.02,
        videoFileIds: [],
        audioFileIds: [],
        transcriptFileIds: [],
        speciesDetected: undefined as any
      },
    ];
    const { result } = renderHook(() => useMapFilters({ alerts: alertWithNoSpecies }));
    act(() => {
      result.current.setShowBycatch(false);
      result.current.setShowAlerts(true);
    });
    // Treated as non-bycatch, should pass the alert-type filter
    expect(result.current.filteredAlerts).toHaveLength(1);
  });

  it('should not mutate the original alerts array', () => {
    const original = [...mockAlerts];
    const { result } = renderHook(() => useMapFilters({ alerts: mockAlerts }));
    act(() => result.current.setStartDate('2025-06-01'));
    expect(mockAlerts).toEqual(original);
  });
});
