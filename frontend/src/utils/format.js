export function formatNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('en-NP').format(number);
}

export function formatCurrency(value) {
  if (value == null || value === '') {
    return '—';
  }
  const number = Number(value);
  if (Number.isNaN(number)) {
    return '—';
  }
  return new Intl.NumberFormat('en-NP', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
}

export function formatDate(value) {
  if (!value) {
    return '—';
  }
  return String(value).slice(0, 10);
}

export function formatDateTime(value) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function displayValue(value) {
  if (value == null || value === '') {
    return '—';
  }
  return value;
}

export function formatAction(value) {
  if (!value) {
    return '—';
  }
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.error?.message || error?.message || fallback;
}

export function fieldErrors(error) {
  const details = error?.response?.data?.error?.details;
  if (!Array.isArray(details)) {
    return {};
  }
  return Object.fromEntries(details.filter((item) => item?.field).map((item) => [item.field, item.message]));
}

export function omitEmpty(values) {
  const result = {};
  Object.entries(values || {}).forEach(([key, value]) => {
    if (value !== '' && value != null) {
      result[key] = value;
    }
  });
  return result;
}

export function qrImageSrc(value) {
  if (!value) {
    return '';
  }
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(value)}`;
}

export function shortId(value) {
  if (!value) {
    return '—';
  }
  return String(value).slice(0, 8).toUpperCase();
}
