/**
 * XHR upload with progress tracking.
 *
 * Inspired by Open-Generative-AI's XHR-based upload: fetch() does not
 * natively support upload progress events. XHR does, via
 * xhr.upload.onprogress. This module wraps XHR in a Promise so it works
 * naturally with async/await.
 *
 * Usage:
 *   const result = await uploadWithProgress('/api/assets/upload', formData, {
 *     onProgress: (pct) => setProgress(pct),
 *     signal: abortController.signal,
 *   });
 */

export interface UploadProgress {
  /** Bytes uploaded so far */
  loaded: number;
  /** Total bytes to upload (0 if unknown) */
  total: number;
  /** Percentage complete (0–100) */
  percent: number;
}

export interface UploadOptions {
  /** Called whenever a progress event fires */
  onProgress?: (progress: UploadProgress) => void;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
  /** Additional headers */
  headers?: Record<string, string>;
}

export interface UploadResult {
  /** Parsed response body */
  data: any;
  /** HTTP status code */
  status: number;
}

/**
 * Upload a FormData payload via XHR with progress tracking.
 * Resolves with the parsed JSON response, or rejects on HTTP error / abort.
 */
export function uploadWithProgress(
  url: string,
  formData: FormData,
  opts?: UploadOptions,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('POST', url);

    // Set additional headers
    if (opts?.headers) {
      for (const [key, value] of Object.entries(opts.headers)) {
        xhr.setRequestHeader(key, value);
      }
    }

    // Progress events
    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable && opts?.onProgress) {
        opts.onProgress({
          loaded: event.loaded,
          total: event.total,
          percent: Math.round((event.loaded / event.total) * 100),
        });
      }
    };

    // Completion
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve({ data: JSON.parse(xhr.responseText), status: xhr.status });
        } catch {
          resolve({ data: xhr.responseText, status: xhr.status });
        }
      } else {
        let errMsg = `HTTP ${xhr.status}`;
        try {
          const err = JSON.parse(xhr.responseText);
          errMsg = err.error || err.message || errMsg;
        } catch {}
        reject(new Error(errMsg));
      }
    };

    // Network error
    xhr.onerror = () => reject(new Error('Network error during upload'));

    // Abort
    xhr.onabort = () => reject(new DOMException('Upload aborted', 'AbortError'));

    // External abort signal
    if (opts?.signal) {
      opts.signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }

    xhr.send(formData);
  });
}
