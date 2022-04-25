import { renderHook } from './lib/hook-testing';
import wrapper from './lib/test-wrapper';
import { useC2pa } from '@contentauth/react-hooks';

xdescribe('react-hooks', () => {
  describe('useC2pa', () => {
    it('should return provenance data', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useC2pa('tests/assets/CAICAI.jpg'),
        { wrapper },
      );

      await waitForNextUpdate();

      expect(result.current).toBeDefined();
    });
  });
});
