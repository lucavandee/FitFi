const BASE_URL = 'https://fitfi.ai';

const urls = {
  buildReferralUrl(userId: string): string {
    return `${BASE_URL}?ref=${userId}`;
  },
  getCanonicalUrl(path: string): string {
    return `${BASE_URL}${path}`;
  }
};

export default urls;
