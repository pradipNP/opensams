export function formatNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('en-NP').format(number);
}

export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.error?.message || error?.message || fallback;
}
