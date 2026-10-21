import { compact, mmss } from '@/utils/format';

test('compact', () => {
  expect(compact(342)).toBe('342');
  expect(compact(12_000)).toBe('12K');
  expect(compact(13_100)).toBe('13.1K');
  expect(compact(999)).toBe('999');
});

test('mmss', () => {
  expect(mmss(0)).toBe('0:00');
  expect(mmss(8)).toBe('0:08');
  expect(mmss(125)).toBe('2:05');
});
