import { extname } from 'path';
import { logger } from './_logger.js';

export interface UploadValidation {
  ok: boolean;
  error?: string;
  sanitizedFilename?: string;
  detectedMime?: string;
}

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  audio: [
    'audio/wav', 'audio/x-wav', 'audio/wave',
    'audio/flac', 'audio/x-flac',
    'audio/mpeg', 'audio/mp3', 'audio/mpeg3',
    'audio/aac', 'audio/x-aac',
    'audio/mp4', 'audio/x-m4a',
    'audio/aiff', 'audio/x-aiff', 'audio/x-aifc',
    'audio/ogg', 'audio/vorbis',
    'audio/webm',
  ],
  image: [
    'image/jpeg', 'image/png', 'image/webp',
    'image/tiff', 'image/bmp',
  ],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'text/csv',
  ],
};

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  audio: ['.wav', '.flac', '.mp3', '.aac', '.m4a', '.aiff', '.aif', '.ogg', '.webm'],
  image: ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.bmp'],
  document: ['.pdf', '.doc', '.docx', '.txt', '.csv'],
};

const PRIVATE_IP_PATTERNS = [
  /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
  /^169\.254\./, /^::1$/, /^fc00:/, /^fe80:/,
];

export function isPrivateHost(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return true;
  return PRIVATE_IP_PATTERNS.some((p) => p.test(hostname));
}

export function validateUploadUrl(url: string): { ok: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    if (isPrivateHost(parsed.hostname)) {
      return { ok: false, error: 'URL points to a private network address' };
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { ok: false, error: 'Only http/https URLs are allowed' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Invalid URL format' };
  }
}

export function validateMimeType(mime: string, category: 'audio' | 'image' | 'document'): UploadValidation {
  const allowed = ALLOWED_MIME_TYPES[category];
  if (!allowed) return { ok: false, error: `Unknown category: ${category}` };

  const normalized = mime.toLowerCase().trim();
  if (allowed.includes(normalized)) {
    return { ok: true, detectedMime: normalized, sanitizedFilename: undefined };
  }

  if (normalized === 'application/octet-stream') {
    return { ok: true, detectedMime: normalized, sanitizedFilename: undefined, error: 'generic binary stream — will attempt content sniffing' };
  }

  return { ok: false, error: `MIME type "${mime}" not allowed for ${category} uploads`, detectedMime: normalized };
}

export function validateExtension(filename: string, category: 'audio' | 'image' | 'document'): UploadValidation {
  const ext = extname(filename).toLowerCase();
  const allowed = ALLOWED_EXTENSIONS[category];
  if (!allowed) return { ok: false, error: `Unknown category: ${category}` };

  if (!allowed.includes(ext)) {
    return { ok: false, error: `File extension "${ext}" not allowed for ${category} uploads` };
  }

  const sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 255);
  return { ok: true, sanitizedFilename: sanitized, detectedMime: ext };
}

export function validateFileSize(sizeBytes: number, maxBytes: number): UploadValidation {
  if (sizeBytes <= 0) return { ok: false, error: 'File is empty' };
  if (sizeBytes > maxBytes) {
    const mb = (maxBytes / (1024 * 1024)).toFixed(0);
    return { ok: false, error: `File exceeds maximum size of ${mb}MB` };
  }
  return { ok: true, detectedMime: `${sizeBytes} bytes` };
}

export function sanitizeFilename(filename: string): string {
  const ext = extname(filename);
  const base = filename.slice(0, -ext.length)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 100);
  return base + ext;
}

export function detectMimeFromBuffer(buffer: Buffer): string | null {
  if (buffer.length < 4) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image/png';
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    if (buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  }
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return 'audio/wav';
  if (buffer[0] === 0x66 && buffer[1] === 0x4c && buffer[2] === 0x61 && buffer[3] === 0x43) return 'audio/flac';
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) return 'audio/mpeg';
  if (buffer[0] === 0x46 && buffer[1] === 0x4f && buffer[2] === 0x52 && buffer[3] === 0x4d) return 'audio/aiff';
  if (buffer.length >= 8 &&
    buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x00 &&
    (buffer[3] === 0x18 || buffer[3] === 0x20) &&
    buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    return 'audio/mp4';
  }

  return null;
}

export const UPLOAD_SIZE_LIMITS = {
  audio: 100 * 1024 * 1024,
  image: 20 * 1024 * 1024,
  document: 10 * 1024 * 1024,
};
