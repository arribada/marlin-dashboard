import { verifyRecaptcha } from '../../../src/_lib/recaptcha';

// Mock validateEnvVar utility
jest.mock('../../../src/_utils/validateEnvVar', () => ({
  __esModule: true,
  default: jest.fn((varName: string) => {
    if (varName === 'RECAPTCHA_SECRET_KEY') return 'mock-secret-key';
    if (varName === 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY') return 'mock-site-key';
    return 'mock-value';
  }),
}));

describe('verifyRecaptcha', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('successful verification', () => {
    it('should return success: true when reCAPTCHA verification succeeds', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await verifyRecaptcha('valid-token');

      expect(result).toEqual({
        success: true,
        serviceError: undefined,
      });
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'secret=mock-secret-key&response=valid-token',
        }
      );
    });
  });

  describe('failed verification', () => {
    it('should return success: false with error codes when reCAPTCHA fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          'error-codes': ['invalid-input-response', 'timeout-or-duplicate'],
        }),
      } as Response);

      const result = await verifyRecaptcha('invalid-token');

      expect(result).toEqual({
        success: false,
        serviceError: 'invalid-input-response, timeout-or-duplicate',
      });
    });

    it('should return success: false with "unknown error" when no error codes provided', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
        }),
      } as Response);

      const result = await verifyRecaptcha('invalid-token');

      expect(result).toEqual({
        success: false,
        serviceError: 'unknown error',
      });
    });

    it('should return success: false with "unknown error" when error-codes is empty', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          'error-codes': [],
        }),
      } as Response);

      const result = await verifyRecaptcha('invalid-token');

      expect(result).toEqual({
        success: false,
        serviceError: 'unknown error',
      });
    });

    it('should handle single error code', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          'error-codes': ['invalid-input-secret'],
        }),
      } as Response);

      const result = await verifyRecaptcha('some-token');

      expect(result).toEqual({
        success: false,
        serviceError: 'invalid-input-secret',
      });
    });
  });

  describe('HTTP error responses', () => {
    it('should return serviceError when response status is not OK (400)', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
      } as Response);

      const result = await verifyRecaptcha('some-token');

      expect(result).toEqual({
        success: false,
        serviceError: 'reCAPTCHA verification failed with status: 400',
      });
    });

    it('should return serviceError when response status is 500', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const result = await verifyRecaptcha('some-token');

      expect(result).toEqual({
        success: false,
        serviceError: 'reCAPTCHA verification failed with status: 500',
      });
    });

    it('should return serviceError when response status is 503', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
      } as Response);

      const result = await verifyRecaptcha('some-token');

      expect(result).toEqual({
        success: false,
        serviceError: 'reCAPTCHA verification failed with status: 503',
      });
    });
  });

  describe('network and service errors', () => {
    it('should handle network errors gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await verifyRecaptcha('some-token');

      expect(result).toEqual({
        success: false,
        serviceError: 'reCAPTCHCA service unavailable',
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'reCAPTCHA network/service error:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle timeout errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Request timeout'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await verifyRecaptcha('some-token');

      expect(result).toEqual({
        success: false,
        serviceError: 'reCAPTCHCA service unavailable',
      });
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle JSON parsing errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await verifyRecaptcha('some-token');

      expect(result).toEqual({
        success: false,
        serviceError: 'reCAPTCHCA service unavailable',
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'reCAPTCHA network/service error:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle fetch being undefined', async () => {
      const originalFetch = global.fetch;
      // @ts-ignore - intentionally testing undefined fetch
      global.fetch = undefined;
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await verifyRecaptcha('some-token');

      expect(result).toEqual({
        success: false,
        serviceError: 'reCAPTCHCA service unavailable',
      });
      expect(consoleErrorSpy).toHaveBeenCalled();

      global.fetch = originalFetch;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('token handling', () => {
    it('should correctly encode token in request body', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await verifyRecaptcha('special-token-123!@#');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: 'secret=mock-secret-key&response=special-token-123!@#',
        })
      );
    });

    it('should handle empty token string', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, 'error-codes': ['missing-input-response'] }),
      } as Response);

      const result = await verifyRecaptcha('');

      expect(result.success).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: 'secret=mock-secret-key&response=',
        })
      );
    });
  });
});
