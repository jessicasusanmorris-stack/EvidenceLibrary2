export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getFileType = (file) => {
  const type = file.type;
  if (type.startsWith('image/')) return 'image';
  if (type === 'application/pdf') return 'pdf';
  if (type.includes('word') || type.includes('document')) return 'document';
  if (type.includes('sheet') || type.includes('excel')) return 'spreadsheet';
  return 'other';
};

export const generateEvNumber = (counter, matterNumber = '0000') => {
  return `EV-${matterNumber}-${String(counter).padStart(3, '0')}`;
};

export const computeHash = async (file) => {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
};

export const createPreviewUrl = (file) => {
  if (file.type.startsWith('image/')) return URL.createObjectURL(file);
  return null;
};

export const generateId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);
