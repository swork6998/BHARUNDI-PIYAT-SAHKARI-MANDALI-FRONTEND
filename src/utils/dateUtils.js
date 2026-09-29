/**
 * Date and DateTime Formatting Utilities
 * Standard:
 * - Date only: DD-MM-YYYY
 * - DateTime:  DD-MM-YYYY HH:MM:SS
 */

export function toEnglishDigits(str) {
  if (!str) return '';
  const guj = {'૦':'0', '૧':'1', '૨':'2', '૩':'3', '૪':'4', '૫':'5', '૬':'6', '૭':'7', '૮':'8', '૯':'9'};
  return String(str).replace(/[૦-૯]/g, d => guj[d] !== undefined ? guj[d] : d);
}

export function toGujaratiDigits(str) {
  if (!str) return '';
  const guj = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
  return String(str).replace(/[0-9]/g, d => guj[parseInt(d, 10)]);
}

/**
 * Formats any date into DD-MM-YYYY
 * @param {string|Date|number} val - Date value to format
 * @returns {string} Formatted date string in DD-MM-YYYY or '-'
 */
export function formatDate(val) {
  if (!val) return '-';

  // Handle direct string matching for performance & timezone preservation
  if (typeof val === 'string') {
    const trimmed = val.trim();
    // YYYY-MM-DD format (from MySQL dateStrings: true or ISO)
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return `${d}-${m}-${y}`;
    }
    // DD-MM-YYYY format already
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      return trimmed;
    }
  }

  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Formats any datetime into DD-MM-YYYY HH:MM:SS
 * @param {string|Date|number} val - DateTime value to format
 * @returns {string} Formatted datetime string in DD-MM-YYYY HH:MM:SS or '-'
 */
export function formatDateTime(val) {
  if (!val) return '-';

  if (typeof val === 'string') {
    const trimmed = val.trim();
    // Match YYYY-MM-DD HH:MM:SS or YYYY-MM-DDTHH:MM:SS
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [, y, m, d, hh, mm, ss] = match;
      return `${d}-${m}-${y} ${hh}:${mm}:${ss}`;
    }
    // Match date only in string
    const dateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const [, y, m, d] = dateMatch;
      return `${d}-${m}-${y} 00:00:00`;
    }
  }

  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Automatically chooses between formatDate and formatDateTime based on field type
 * @param {string|Date|number} val
 * @param {boolean} isDateTime
 * @returns {string}
 */
export function formatSmartDate(val, isDateTime = false) {
  if (!val) return '-';
  if (isDateTime) {
    return formatDateTime(val);
  }
  return formatDate(val);
}
