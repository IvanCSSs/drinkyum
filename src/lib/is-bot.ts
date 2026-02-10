import { headers } from 'next/headers';

const BOT_USER_AGENTS = [
  // Search engines
  'googlebot',
  'bingbot', 
  'slurp',           // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'sogou',
  'bravebot',        // Brave Search
  'qwantbot',        // Qwant
  'ecosia',          // Ecosia
  'mojeekbot',       // Mojeek
  // Social/preview
  'facebot',         // Facebook
  'ia_archiver',     // Alexa
  'applebot',
  'twitterbot',
  'linkedinbot',
  'pinterest',
  'slackbot',
  'telegrambot',
  'whatsapp',
  'discordbot',
  // SEO tools
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'petalbot',
  'bytespider',
  'rogerbot',        // Moz
  'screaming frog',
];

export async function isBot(): Promise<boolean> {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent')?.toLowerCase() || '';
    
    return BOT_USER_AGENTS.some(bot => userAgent.includes(bot));
  } catch {
    // headers() throws outside of request context
    return false;
  }
}
