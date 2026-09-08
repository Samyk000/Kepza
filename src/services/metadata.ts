import { ContentType } from '../types/link';

export interface ExtractedMetadata {
  url: string;
  normalizedUrl: string;
  title: string;
  description?: string;
  thumbnail?: string;
  favicon: string;
  domain: string;
  contentType: ContentType;
  source: string;
}

export async function fetchMetadata(rawUrl: string): Promise<ExtractedMetadata> {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  let domain = 'web';
  try {
    const parsed = new URL(url);
    domain = parsed.hostname.replace('www.', '');
  } catch {
    // Keep fallback
  }

  const normalizedUrl = normalizeUrl(url);
  const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  const platformInfo = detectPlatform(url, domain);

  // Default fallback object
  const result: ExtractedMetadata = {
    url,
    normalizedUrl,
    title: platformInfo.defaultTitle || domain,
    description: platformInfo.defaultDesc,
    thumbnail: platformInfo.defaultThumbnail,
    favicon: fallbackFavicon,
    domain,
    contentType: platformInfo.contentType,
    source: platformInfo.source,
  };

  // If it's a YouTube URL, extract high-res thumbnail directly
  const youtubeVideoId = extractYouTubeId(url);
  if (youtubeVideoId) {
    result.thumbnail = `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
    result.contentType = 'video';
    result.source = 'YouTube';
  }

  // If it's a GitHub URL, use GitHub's official social preview image
  if (domain.includes('github.com')) {
    try {
      const pathParts = new URL(url).pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        result.thumbnail = `https://opengraph.githubassets.com/1/${pathParts[0]}/${pathParts[1]}`;
        result.contentType = 'code';
        result.source = 'GitHub';
      }
    } catch {}
  }

  // 1. First attempt: Use Microlink API (CORS-friendly, rich OpenGraph image & metadata extraction)
  try {
    const mlController = new AbortController();
    const mlTimeout = setTimeout(() => mlController.abort(), 4500);

    const mlResponse = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, {
      signal: mlController.signal,
    });
    clearTimeout(mlTimeout);

    if (mlResponse.ok) {
      const json = await mlResponse.json();
      if (json.status === 'success' && json.data) {
        const d = json.data;
        if (d.title) result.title = d.title;
        if (d.description) result.description = d.description;
        if (d.image?.url && !youtubeVideoId) result.thumbnail = d.image.url;
        if (d.logo?.url) result.favicon = d.logo.url;
        if (d.publisher) result.source = d.publisher;
      }
    }
  } catch (e) {
    // Microlink unavailable, proceed to fallbacks
  }

  // 2. Second attempt: Direct fetch (works on native iOS/Android where CORS is not enforced)
  if (!result.thumbnail || result.title === domain) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
          Accept: 'text/html,application/xhtml+xml',
        },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const html = await response.text();
        const extracted = parseHtmlMetadata(html, url);

        if (extracted.title) result.title = extracted.title;
        if (extracted.description) result.description = extracted.description;
        if (extracted.image && !youtubeVideoId) result.thumbnail = extracted.image;
        if (extracted.favicon) result.favicon = extracted.favicon;
        if (extracted.siteName) result.source = extracted.siteName;
      }
    } catch (e) {
      // Fallback
    }
  }

  // 3. Guaranteed thumbnail fallback: If still missing, generate website snapshot
  if (!result.thumbnail) {
    result.thumbnail = `https://image.thum.io/get/width/600/crop/800/noanimate/${url}`;
  }

  return result;
}

export function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    // Strip common tracking query parameters
    const paramsToRemove = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'igshid',
      'ref',
      'ref_src',
      'si',
    ];
    paramsToRemove.forEach((p) => parsed.searchParams.delete(p));
    return parsed.toString();
  } catch {
    return rawUrl.trim();
  }
}

function detectPlatform(
  url: string,
  domain: string
): {
  source: string;
  contentType: ContentType;
  defaultTitle?: string;
  defaultDesc?: string;
  defaultThumbnail?: string;
} {
  const d = domain.toLowerCase();

  if (d.includes('youtube.com') || d.includes('youtu.be')) {
    return { source: 'YouTube', contentType: 'video' };
  }
  if (d.includes('github.com')) {
    const parts = url.split('github.com/')[1]?.split('/') || [];
    const repoTitle = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : 'GitHub Repository';
    return {
      source: 'GitHub',
      contentType: 'code',
      defaultTitle: repoTitle,
      defaultDesc: 'GitHub repository and code reference.',
    };
  }
  if (d.includes('instagram.com')) {
    return { source: 'Instagram', contentType: 'social' };
  }
  if (d.includes('tiktok.com')) {
    return { source: 'TikTok', contentType: 'social' };
  }
  if (d.includes('twitter.com') || d.includes('x.com')) {
    return { source: 'X', contentType: 'social' };
  }
  if (d.includes('reddit.com')) {
    return { source: 'Reddit', contentType: 'social' };
  }
  if (d.includes('medium.com') || d.includes('substack.com')) {
    return { source: 'Article', contentType: 'article' };
  }
  if (d.includes('notion.so') || d.includes('notion.site')) {
    return { source: 'Notion', contentType: 'website' };
  }
  if (d.includes('figma.com')) {
    return { source: 'Figma', contentType: 'website' };
  }
  if (d.includes('shopify.com')) {
    return { source: 'Website', contentType: 'website' };
  }

  return { source: capitalize(domain.split('.')[0]), contentType: 'website' };
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

function parseHtmlMetadata(html: string, baseUrl: string) {
  const getMeta = (names: string[]) => {
    for (const name of names) {
      // Regex search for meta tag content
      const regex = new RegExp(
        `<meta[^>]*(?:property|name)=["']${name}["'][^>]*content=["']([^"']*)["']`,
        'i'
      );
      const match = html.match(regex);
      if (match && match[1]) return decodeHtmlEntities(match[1].trim());

      // Reverse order of attributes
      const revRegex = new RegExp(
        `<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${name}["']`,
        'i'
      );
      const revMatch = html.match(revRegex);
      if (revMatch && revMatch[1]) return decodeHtmlEntities(revMatch[1].trim());
    }
    return null;
  };

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = getMeta(['og:title', 'twitter:title']) || (titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : null);

  const description = getMeta(['og:description', 'twitter:description', 'description']);
  let image = getMeta(['og:image', 'twitter:image', 'image']);

  if (image && !image.startsWith('http')) {
    try {
      image = new URL(image, baseUrl).toString();
    } catch {
      // Keep as is
    }
  }

  const siteName = getMeta(['og:site_name', 'application-name']);

  // Extract favicon link
  const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i);
  let favicon: string | null = null;
  if (iconMatch && iconMatch[1]) {
    favicon = iconMatch[1].trim();
    if (!favicon.startsWith('http')) {
      try {
        favicon = new URL(favicon, baseUrl).toString();
      } catch {
        favicon = null;
      }
    }
  }

  return { title, description, image, favicon, siteName };
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
