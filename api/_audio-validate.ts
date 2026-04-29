/**
 * Audio + cover-art validation gates run server-side on upload.
 *
 * Returns a list of issues (errors that block delivery) and warnings
 * (advisory, won't block but are flagged in the UI).
 */
import { parseBuffer, parseFile } from 'music-metadata';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  meta?: {
    durationSeconds: number;
    sampleRate: number;
    bitsPerSample?: number;
    channels: number;
    container?: string;
    codec?: string;
    bitrateKbps?: number;
  };
}

const MIN_DURATION_SEC = 30;
const MIN_SAMPLE_RATE = 44100;
const MIN_BITS_PER_SAMPLE = 16;
const MIN_MP3_BITRATE_KBPS = 320;
const ACCEPTED_CONTAINERS = ['WAVE', 'WAV', 'FLAC', 'MPEG', 'MP3', 'AAC', 'M4A', 'AIFF'];

export async function validateAudio(input: { buffer?: Buffer; path?: string; mimeType?: string }): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let metadata;

  try {
    if (input.buffer) {
      metadata = await parseBuffer(input.buffer, input.mimeType, { duration: true });
    } else if (input.path) {
      metadata = await parseFile(input.path, { duration: true });
    } else {
      return { ok: false, errors: ['No audio source provided.'], warnings: [] };
    }
  } catch (err) {
    return {
      ok: false,
      errors: [`Failed to parse audio file: ${err instanceof Error ? err.message : String(err)}`],
      warnings: [],
    };
  }

  const f = metadata.format;
  const duration = f.duration ?? 0;
  const sampleRate = f.sampleRate ?? 0;
  const bitsPerSample = f.bitsPerSample;
  const channels = f.numberOfChannels ?? 0;
  const container = f.container ?? '';
  const codec = f.codec ?? '';
  const bitrateKbps = f.bitrate ? Math.round(f.bitrate / 1000) : undefined;

  if (duration < MIN_DURATION_SEC) {
    errors.push(`Track is too short (${duration.toFixed(1)}s). Minimum is ${MIN_DURATION_SEC}s.`);
  }
  if (sampleRate && sampleRate < MIN_SAMPLE_RATE) {
    errors.push(`Sample rate ${sampleRate}Hz is below ${MIN_SAMPLE_RATE}Hz. Re-export at 44.1kHz or higher.`);
  }
  if (bitsPerSample && bitsPerSample < MIN_BITS_PER_SAMPLE) {
    errors.push(`Bit depth ${bitsPerSample}-bit is below ${MIN_BITS_PER_SAMPLE}-bit.`);
  }
  if (channels === 0) {
    errors.push('Could not detect any audio channels.');
  } else if (channels === 1) {
    warnings.push('Track is mono. DSPs accept this but stereo is preferred.');
  }
  if (container && !ACCEPTED_CONTAINERS.some((c) => container.toUpperCase().includes(c))) {
    errors.push(`Container "${container}" is not accepted. Use WAV, FLAC, or MP3 320kbps+.`);
  }
  if (codec && /MPEG/i.test(codec) && bitrateKbps && bitrateKbps < MIN_MP3_BITRATE_KBPS) {
    errors.push(`MP3 bitrate ${bitrateKbps}kbps is below ${MIN_MP3_BITRATE_KBPS}kbps. Provide a higher-quality file.`);
  }

  // ---- Loudness / mastering check ----
  // We don't run a full ITU BS.1770 LUFS analysis here (that needs ffmpeg
  // or wasm decoding which is heavy for serverless). Instead we read the
  // declared replay-gain / peak metadata when present and flag obvious
  // over-mastering: peak > -0.5 dBFS = clipping risk, expected for streaming
  // is -1.0 dBFS true peak, integrated -14 LUFS.
  const peakDb = parseReplayGainPeak((metadata as any).native, (metadata as any).common);
  const integratedLufs = parseReplayGainLufs((metadata as any).native, (metadata as any).common);
  if (peakDb !== null && peakDb > -0.5) {
    warnings.push(`Peak ${peakDb.toFixed(2)} dBFS — risk of clipping after streaming codec. Aim for true-peak ≤ -1.0 dBFS.`);
  }
  if (integratedLufs !== null) {
    if (integratedLufs > -8) warnings.push(`Integrated loudness ${integratedLufs.toFixed(1)} LUFS is hot. Streaming target is -14 LUFS; you'll be turned down.`);
    if (integratedLufs < -20) warnings.push(`Integrated loudness ${integratedLufs.toFixed(1)} LUFS is quiet. Streaming target is -14 LUFS; track will sound weak next to peers.`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    meta: {
      durationSeconds: Number(duration.toFixed(2)),
      sampleRate,
      bitsPerSample,
      channels,
      container,
      codec,
      bitrateKbps,
      peakDb: peakDb ?? undefined,
      integratedLufs: integratedLufs ?? undefined,
    },
  };
}

/** Pull a peak-amplitude value (dBFS) out of any embedded ReplayGain tags. */
function parseReplayGainPeak(native: any, common: any): number | null {
  // Standard music-metadata exposes ReplayGain in `common.replaygain_track_peak.dB`.
  const rg = common?.replaygain_track_peak ?? common?.replaygain_album_peak;
  if (rg && typeof rg.dB === 'number') return rg.dB;
  if (rg && typeof rg.ratio === 'number' && rg.ratio > 0) return 20 * Math.log10(rg.ratio);
  // Fallback: scan native tags for REPLAYGAIN_TRACK_PEAK / R128_TRACK_GAIN
  if (!native) return null;
  for (const groups of Object.values(native) as any[]) {
    if (!Array.isArray(groups)) continue;
    for (const tag of groups) {
      if (typeof tag?.id === 'string' && /TRACK_PEAK|TRUE_PEAK/i.test(tag.id) && tag.value) {
        const num = parseFloat(String(tag.value));
        if (!Number.isNaN(num)) return num <= 0 ? num : 20 * Math.log10(num);
      }
    }
  }
  return null;
}

/** Pull an integrated-loudness (LUFS) value out of embedded tags if present. */
function parseReplayGainLufs(native: any, common: any): number | null {
  const rg = common?.replaygain_track_gain;
  // Replay-gain target for streaming services is roughly -18 LUFS reference.
  // gain_dB is the difference from that reference. So LUFS ≈ -18 - gain.
  if (rg && typeof rg.dB === 'number') return -18 - rg.dB;
  if (!native) return null;
  for (const groups of Object.values(native) as any[]) {
    if (!Array.isArray(groups)) continue;
    for (const tag of groups) {
      if (typeof tag?.id === 'string' && /R128_TRACK_GAIN|INTEGRATED_LOUDNESS|REPLAYGAIN_TRACK_GAIN/i.test(tag.id) && tag.value !== undefined) {
        const num = parseFloat(String(tag.value));
        if (Number.isNaN(num)) continue;
        // R128_TRACK_GAIN is in Q7.8 units relative to -23 LUFS
        if (/R128/i.test(tag.id)) return -23 - num / 256;
        return -18 - num;
      }
    }
  }
  return null;
}

const MIN_COVER_PX = 3000;

/**
 * Cover art validation. Reads the file's leading bytes to detect dimensions
 * for JPEG / PNG / WebP without needing a full image library.
 */
export async function validateCoverArt(input: { buffer: Buffer; mimeType?: string }): Promise<ValidationResult> {
  const dims = readImageDimensions(input.buffer);
  if (!dims) {
    return {
      ok: false,
      errors: ['Could not read image dimensions. Provide a valid JPEG, PNG, or WebP.'],
      warnings: [],
    };
  }
  const errors: string[] = [];
  const warnings: string[] = [];
  if (dims.width < MIN_COVER_PX || dims.height < MIN_COVER_PX) {
    errors.push(
      `Cover art is ${dims.width}×${dims.height}. DSPs require at least ${MIN_COVER_PX}×${MIN_COVER_PX}.`,
    );
  }
  if (dims.width !== dims.height) {
    errors.push('Cover art must be square (1:1 aspect ratio).');
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    meta: undefined,
  };
}

function readImageDimensions(buf: Buffer): { width: number; height: number } | null {
  // PNG: 8-byte signature, then IHDR chunk at offset 16 (width) / 20 (height)
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG: scan SOF markers
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1];
      if (marker === 0xd8 || marker === 0x01) {
        i += 2;
        continue;
      }
      const size = buf.readUInt16BE(i + 2);
      // SOF0..SOF15 except DHT(0xC4), DAC(0xCC), DNL(0xDC)
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        const height = buf.readUInt16BE(i + 5);
        const width = buf.readUInt16BE(i + 7);
        return { width, height };
      }
      i += 2 + size;
    }
  }
  // WebP: RIFF....WEBPVP8
  if (buf.length >= 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const fourcc = buf.toString('ascii', 12, 16);
    if (fourcc === 'VP8 ') {
      const w = (buf.readUInt16LE(26) & 0x3fff);
      const h = (buf.readUInt16LE(28) & 0x3fff);
      return { width: w, height: h };
    }
    if (fourcc === 'VP8L') {
      const b0 = buf[21];
      const b1 = buf[22];
      const b2 = buf[23];
      const b3 = buf[24];
      const w = 1 + (((b1 & 0x3f) << 8) | b0);
      const h = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      return { width: w, height: h };
    }
    if (fourcc === 'VP8X') {
      const w = 1 + (buf.readUInt8(24) | (buf.readUInt8(25) << 8) | (buf.readUInt8(26) << 16));
      const h = 1 + (buf.readUInt8(27) | (buf.readUInt8(28) << 8) | (buf.readUInt8(29) << 16));
      return { width: w, height: h };
    }
  }
  return null;
}
