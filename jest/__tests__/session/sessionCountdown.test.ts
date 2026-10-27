/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import useSessionCountdown from '@/_hooks/useSessionCountdown';

test('countdown decreases over time', () => {
  jest.useFakeTimers();
  const { result } = renderHook(() => useSessionCountdown('2025-01-01T00:01:00Z'));

  act(() => {
    jest.advanceTimersByTime(1000);
  });

  expect(result.current).toBeLessThan(60);
});
