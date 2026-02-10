import { headers } from 'next/headers';

const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot', 
  'slurp',        // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'sogou',
  'facebot',      // Facebook
  'ia_archiver',  // Alexa
  'applebot',
  'twitterbot',
  'linkedinbot',
  'pinterest',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'petalbot',
  'bytespider',
];

export function isBot(): boolean {
  try {
    const headersList = headers();
    const userAgent = headersList.get('user-agent')?.toLowerCase() || '';
    
    return BOT_USER_AGENTS.some(bot => userAgent.includes(bot));
  } catch {
    // headers() throws outside of request context
    return false;
  }
}
