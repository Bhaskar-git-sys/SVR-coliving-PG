export interface AadhaarVerificationDetails {
  name: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  maskedAadhaar: string;
  verificationRef: string;
  verifiedAt: string;
  provider: 'authorized-provider' | 'development-mock';
}

interface VerificationChallenge {
  challengeId: string;
  maskedAadhaar: string;
  provider: 'authorized-provider' | 'development-mock';
}

const configuredProvider = import.meta.env.VITE_AADHAAR_KYC_API_URL;
const developmentMockEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_KYC === 'true';
const pendingChallenges = new Map<string, { aadhaar: string; challenge: VerificationChallenge }>();

export function normalizeAadhaar(value: string): string {
  return value.replace(/\D/g, '').slice(0, 12);
}

export function formatAadhaar(value: string): string {
  const digits = normalizeAadhaar(value);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function maskAadhaar(value: string): string {
  const digits = normalizeAadhaar(value);
  return `XXXX XXXX ${digits.slice(-4)}`;
}

export function isValidAadhaar(value: string): boolean {
  return /^\d{12}$/.test(normalizeAadhaar(value));
}

async function providerRequest<T>(path: string, body: Record<string, string>): Promise<T> {
  if (!configuredProvider) {
    throw new Error('Aadhaar KYC provider is not configured.');
  }

  const response = await fetch(`${configuredProvider}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error('Aadhaar verification failed.');
  return response.json() as Promise<T>;
}

export async function startAadhaarVerification(value: string): Promise<VerificationChallenge> {
  const aadhaar = normalizeAadhaar(value);
  if (!isValidAadhaar(aadhaar)) throw new Error('Please enter a valid Aadhaar number.');

  if (developmentMockEnabled) {
    const challenge = {
      challengeId: `mock-${crypto.randomUUID()}`,
      maskedAadhaar: maskAadhaar(aadhaar),
      provider: 'development-mock' as const,
    };
    pendingChallenges.set(challenge.challengeId, { aadhaar, challenge });
    return challenge;
  }

  const result = await providerRequest<{ challengeId: string; maskedAadhaar: string }>('/start', { aadhaar });
  const challenge = { ...result, provider: 'authorized-provider' as const };
  pendingChallenges.set(challenge.challengeId, { aadhaar, challenge });
  return challenge;
}

export async function verifyAadhaarOtp(
  challengeId: string,
  otp: string
): Promise<AadhaarVerificationDetails> {
  if (!/^\d{6}$/.test(otp)) throw new Error('Enter the 6-digit verification OTP.');

  const pending = pendingChallenges.get(challengeId);
  if (!pending) throw new Error('Aadhaar verification session expired.');

  if (pending.challenge.provider === 'development-mock') {
    if (otp !== '123456') throw new Error('Aadhaar verification failed.');
    pendingChallenges.delete(challengeId);
    return {
      name: 'Development Test Resident',
      dateOfBirth: '01/01/1995',
      gender: 'Not specified',
      address: 'Development-only synthetic KYC address',
      maskedAadhaar: pending.challenge.maskedAadhaar,
      verificationRef: challengeId,
      verifiedAt: new Date().toISOString(),
      provider: 'development-mock',
    };
  }

  const result = await providerRequest<Omit<AadhaarVerificationDetails, 'provider'>>('/verify-otp', {
    challengeId,
    otp,
  });
  pendingChallenges.delete(challengeId);
  return { ...result, provider: 'authorized-provider' };
}

export function getKycStatus(): 'configured' | 'development-mock' | 'unavailable' {
  if (developmentMockEnabled) return 'development-mock';
  return configuredProvider ? 'configured' : 'unavailable';
}