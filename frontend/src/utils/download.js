import { exportReport } from '@/api/report.api';

export function defaultExportFilename(reportType, format) {
  const ext = format === 'xlsx' ? 'xlsx' : 'pdf';
  const stamp = new Date().toISOString().slice(0, 10);
  return `sams-${reportType}-${stamp}.${ext}`;
}

export function filenameFromDisposition(header, fallback) {
  if (!header) {
    return fallback;
  }

  const utfMatch = String(header).match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch) {
    try {
      return decodeURIComponent(utfMatch[1]);
    } catch {
      return utfMatch[1];
    }
  }

  const quotedMatch = String(header).match(/filename="([^"]+)"/i);
  if (quotedMatch) {
    return quotedMatch[1];
  }

  const plainMatch = String(header).match(/filename=([^;]+)/i);
  if (plainMatch) {
    return plainMatch[1].trim();
  }

  return fallback;
}

export function triggerBrowserDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function blobErrorMessage(error, fallback = 'Export failed.') {
  const data = error?.response?.data;
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      return parsed?.error?.message || fallback;
    } catch {
      return fallback;
    }
  }
  return error?.response?.data?.error?.message || error?.message || fallback;
}

export async function downloadReportFile(type, format, params) {
  const response = await exportReport(type, format, params);
  const blob = response.data;

  if (blob?.type && String(blob.type).includes('json')) {
    const text = await blob.text();
    let message = 'Export failed.';
    try {
      message = JSON.parse(text)?.error?.message || message;
    } catch {
      // Keep the fallback message when the blob is not JSON.
    }
    throw new Error(message);
  }

  const header = response.headers?.['content-disposition'] || response.headers?.['Content-Disposition'];
  const filename = filenameFromDisposition(header, defaultExportFilename(type, format));
  triggerBrowserDownload(blob, filename);
}
