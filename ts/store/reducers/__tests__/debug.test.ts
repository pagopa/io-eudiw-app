import {
  debugReducer,
  resetDebugData,
  setDebugData,
  selectDebugData
} from '../debug';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const internalSelectDebugData: (
  state: ReturnType<typeof debugReducer>
) => ReturnType<typeof selectDebugData> = state => state.debugData;

describe('debug', () => {
  it('should return the debug data without the undefined values', () => {
    const state = debugReducer(
      {
        isDebugModeEnabled: true,
        debugData: {}
      } as any,
      setDebugData({ not_visible: undefined, visible: 'visible' })
    );
    expect(internalSelectDebugData(state)).toEqual({ visible: 'visible' });
  });
  it('should remove the debug data when resetDebugData is called', () => {
    const state = debugReducer(
      {
        isDebugModeEnabled: true,
        debugData: { A: 'A', B: 'B', C: 'C' }
      } as any,
      resetDebugData(['A', 'B'])
    );
    expect(internalSelectDebugData(state)).toEqual({ C: 'C' });
  });
  it('should merge and/or override data', () => {
    const state = debugReducer(
      {
        isDebugModeEnabled: true,
        debugData: { A: 'A', B: 'B', C: 'C' }
      } as any,
      setDebugData({ C: 'Updated!', D: 'D', E: 'E' })
    );
    expect(internalSelectDebugData(state)).toEqual({
      A: 'A',
      B: 'B',
      C: 'Updated!',
      D: 'D',
      E: 'E'
    });
  });
  it('should remove undefined values', () => {
    const state = debugReducer(
      {
        isDebugModeEnabled: true,
        debugData: { A: 'A', B: 'B', C: 'C' } // <- C has a value
      } as any,
      setDebugData({ C: undefined, D: 'D', E: 'E' }) // <- C is updated to undefined
    );
    expect(internalSelectDebugData(state)).toEqual({
      A: 'A',
      B: 'B',
      D: 'D',
      E: 'E'
    });
  });
});
