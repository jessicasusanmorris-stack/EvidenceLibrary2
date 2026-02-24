import { useState, useEffect } from 'react';
import {
  Search, Star, FileText, ImageIcon, File, FileSpreadsheet,
  CheckCircle, Loader2, Plus, X, Download, Eye, Trash2,
  ChevronDown, ArrowLeft, AlertCircle,
} from 'lucide-react';
import { generateBundlePDF } from '../utils/bundleUtils.js';

const TAB_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ── File type icon ────────────────────────────────────────────────────────────

function FileTypeIcon({ fileType, size = 15 }) {
  if (fileType === 'image')
    return <ImageIcon className="text-purple-400" style={{ width: size, height: size }} />;
  if (fileType === 'pdf')
    return <FileText className="text-red-400" style={{ width: size, height: size }} />;
  if (fileType === 'document')
    return <FileText className="text-blue-400" style={{ width: size, height: size }} />;
  if (fileType === 'spreadsheet')
    return <FileSpreadsheet className="text-green-500" style={{ width: size, height: size }} />;
  return <File className="text-[#858585]" style={{ width: size, height: size }} />;
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative rounded-full transition-colors flex-shrink-0"
      style={{ width: 32, height: 18, backgroundColor: value ? '#1E365E' : '#dde1e7' }}
    >
      <div
        className="absolute top-0.5 bg-white rounded-full shadow transition-transform"
        style={{ width: 14, height: 14, transform: value ? 'translateX(16px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

// ── Document preview ──────────────────────────────────────────────────────────

function DocumentPreview({ item, onClose }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [docHtml, setDocHtml] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!item) return;

    setPdfUrl(null);
    setDocHtml(null);
    setError(null);
    setLoading(false);

    let cancelled = false;
    let revokeUrl = null;

    if (item.fileType === 'pdf') {
      const url = URL.createObjectURL(item.file);
      revokeUrl = url;
      setPdfUrl(url);
    }

    if (item.fileType === 'document') {
      const ext = item.name.split('.').pop().toLowerCase();
      if (ext === 'docx') {
        setLoading(true);
        (async () => {
          try {
            const mammoth = (await import('mammoth')).default;
            const buffer = await item.file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
            if (!cancelled) {
              setDocHtml(result.value);
              setLoading(false);
            }
          } catch {
            if (!cancelled) {
              setError('Could not render this document.');
              setLoading(false);
            }
          }
        })();
      }
    }

    return () => {
      cancelled = true;
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [item?.id]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#dde1e7] bg-white flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onClose}
          className="text-[#858585] hover:text-[#252627] transition-colors flex-shrink-0"
          title="Back to bundle preview"
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
        </button>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileTypeIcon fileType={item.fileType} size={13} />
          <span className="font-semibold text-[#252627] truncate" style={{ fontSize: 11 }}>
            {item.name}
          </span>
        </div>
        <span
          className="px-1.5 py-0.5 text-white font-black rounded flex-shrink-0"
          style={{ fontSize: 8, backgroundColor: '#1E365E' }}
        >
          {item.evNumber}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Image */}
        {item.fileType === 'image' && item.previewUrl && (
          <div className="flex items-center justify-center h-full bg-[#2a2a2a] p-4">
            <img
              src={item.previewUrl}
              alt={item.name}
              className="max-w-full max-h-full object-contain rounded shadow-xl"
            />
          </div>
        )}

        {/* PDF */}
        {item.fileType === 'pdf' && pdfUrl && (
          <iframe
            src={pdfUrl}
            title={item.name}
            className="w-full h-full border-none"
          />
        )}

        {/* Word doc rendered as HTML */}
        {item.fileType === 'document' && docHtml && (
          <div className="h-full overflow-y-auto bg-white">
            <div
              className="max-w-2xl mx-auto p-8"
              style={{ fontSize: 13, lineHeight: 1.7, color: '#252627' }}
              dangerouslySetInnerHTML={{ __html: docHtml }}
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full text-[#858585]">
            <Loader2 className="animate-spin mb-3" style={{ width: 28, height: 28 }} />
            <p style={{ fontSize: 12 }}>Rendering document...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-[#858585] px-8">
            <AlertCircle style={{ width: 32, height: 32 }} className="mb-3 opacity-40" />
            <p className="font-semibold text-center" style={{ fontSize: 12 }}>{error}</p>
          </div>
        )}

        {/* Unsupported / no preview available */}
        {!item.previewUrl &&
          item.fileType !== 'pdf' &&
          !docHtml &&
          !loading &&
          !error && (
            <div className="flex flex-col items-center justify-center h-full text-[#858585]">
              <FileTypeIcon fileType={item.fileType} size={52} />
              <p className="mt-4 font-semibold" style={{ fontSize: 13 }}>{item.name}</p>
              <p className="mt-1" style={{ fontSize: 11 }}>Preview not available for this file type</p>
              <div
                className="mt-3 px-3 py-1.5 bg-[#f6f6f6] border border-[#dde1e7] rounded text-center"
                style={{ fontSize: 10 }}
              >
                {item.evNumber} · {item.fileSize} · {item.fileType.toUpperCase()}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

// ── Bundle preview ────────────────────────────────────────────────────────────

function BundleIndexPreview({ bundle, items }) {
  if (!bundle) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#858585]">
        <Eye style={{ width: 36, height: 36 }} className="mb-3 opacity-20" />
        <p className="text-sm font-semibold">No bundle selected</p>
        <p className="mt-1" style={{ fontSize: 11 }}>Click + to create a bundle</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#858585]">
        <Eye style={{ width: 36, height: 36 }} className="mb-3 opacity-20" />
        <p className="text-sm font-semibold">Bundle is empty</p>
        <p className="mt-1" style={{ fontSize: 11 }}>Check items in the library to add them</p>
      </div>
    );
  }

  const dateStr = new Date()
    .toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
    .toUpperCase();
  const authorName = (bundle.authorisedBy?.[0] || 'DEPONENT').toUpperCase();

  return (
    <div className="flex items-start justify-center p-6 h-full overflow-y-auto bg-[#3a3a3a]">
      <div
        className="bg-white shadow-2xl w-full"
        style={{ maxWidth: 380, fontFamily: 'Georgia, serif', minHeight: 500 }}
      >
        {/* Cover band */}
        <div style={{ backgroundColor: '#1E365E', padding: '18px 24px 14px' }}>
          <div className="text-center text-white">
            <div className="font-bold" style={{ fontSize: 13, letterSpacing: '0.1em' }}>
              FORENSIC EVIDENCE BUNDLE
            </div>
            <div style={{ fontSize: 10, marginTop: 3, color: 'rgba(255,255,255,0.65)' }}>
              {bundle.name.toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ padding: '22px 26px 28px' }}>
          <div className="text-center" style={{ marginBottom: 16 }}>
            <h1
              className="font-bold text-[#1E365E]"
              style={{ fontSize: 20, letterSpacing: '0.3em', marginBottom: 6 }}
            >
              I&nbsp;&nbsp;N&nbsp;&nbsp;D&nbsp;&nbsp;E&nbsp;&nbsp;X
            </h1>
            <div style={{ borderBottom: '2px solid #1E365E', marginBottom: 8 }} />
            <p className="text-[#58595b]" style={{ fontSize: 8.5 }}>
              AFFIDAVIT OF {authorName} ON {dateStr}
            </p>
          </div>

          <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: 8.5 }}>
            <thead>
              <tr style={{ backgroundColor: '#1E365E', color: 'white' }}>
                <th style={{ padding: '5px 7px', textAlign: 'center', width: 28 }}>Tab</th>
                <th style={{ padding: '5px 7px', textAlign: 'left' }}>Document Description</th>
                <th style={{ padding: '5px 7px', textAlign: 'right', width: 44 }}>Pages</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8f9fb' }}>
                  <td style={{ padding: '4px 7px', fontWeight: 'bold', color: '#1E365E', textAlign: 'center' }}>
                    {TAB_LETTERS[i] || i + 1}
                  </td>
                  <td style={{ padding: '4px 7px', color: '#252627' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                      {item.name.replace(/\.[^/.]+$/, '')}
                    </div>
                  </td>
                  <td style={{ padding: '4px 7px', color: '#252627', textAlign: 'right' }}>
                    {i * 2 + 1}–{i * 2 + 2}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bundle.settings?.showCertification && bundle.authorisedBy?.length > 0 && (
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #dde1e7' }}>
              <p className="text-[#58595b] italic" style={{ fontSize: 8, marginBottom: 10 }}>
                I certify that this bundle is accurate and complete.
              </p>
              {bundle.authorisedBy.map((name, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ borderBottom: '1px solid #252627', marginBottom: 3, width: 130 }} />
                  <span className="text-[#58595b]" style={{ fontSize: 8 }}>{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CombinedPage({
  evidenceItems,
  bundles,
  activeBundleId,
  onSelectBundle,
  onCreateBundle,
  onToggleItem,
  onToggleFavourite,
  onUpdateBundleName,
  onUpdateSettings,
  onUpdateAuthorisedBy,
  onDeleteBundle,
  matter,
}) {
  const [search, setSearch] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const activeBundle = bundles.find((b) => b.id === activeBundleId) || null;
  const checkedIds = new Set(activeBundle?.itemIds || []);
  const bundleItems = activeBundle
    ? activeBundle.itemIds.map((id) => evidenceItems.find((e) => e.id === id)).filter(Boolean)
    : [];

  const selectedItem = evidenceItems.find((e) => e.id === selectedItemId) || null;

  const q = search.trim().toLowerCase();
  const filtered = q
    ? evidenceItems.filter(
        (i) => i.name.toLowerCase().includes(q) || i.evNumber.toLowerCase().includes(q)
      )
    : evidenceItems;

  const favourites = filtered.filter((e) => e.isFavourite);
  const allFiles = filtered.filter((e) => !e.isFavourite);

  const handleSaveName = () => {
    if (nameInput.trim() && activeBundle) onUpdateBundleName(activeBundle.id, nameInput.trim());
    setEditingName(false);
  };

  const handleAddAuthor = () => {
    if (!newAuthor.trim() || !activeBundle) return;
    const existing = activeBundle.authorisedBy || [];
    if (!existing.includes(newAuthor.trim())) {
      onUpdateAuthorisedBy(activeBundle.id, [...existing, newAuthor.trim()]);
    }
    setNewAuthor('');
  };

  const handleDownload = async () => {
    if (!activeBundle || bundleItems.length === 0 || downloading) return;
    setDownloading(true);
    try {
      await generateBundlePDF(activeBundle, evidenceItems, matter);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const renderLibraryItem = (item) => {
    const isInBundle = checkedIds.has(item.id);
    const isSelected = selectedItemId === item.id;

    return (
      <div
        key={item.id}
        onClick={() => setSelectedItemId(item.id)}
        className={`flex items-start gap-2 p-2 rounded cursor-pointer transition-all border ${
          isSelected
            ? 'bg-[#f0f5fa] border-[#1E365E]'
            : 'bg-white border-transparent hover:bg-[#f6f6f6] hover:border-[#e9ebef]'
        }`}
      >
        {/* Checkbox — clicking this toggles bundle membership */}
        <div
          className="flex-shrink-0 mt-0.5"
          onClick={(e) => {
            e.stopPropagation();
            onToggleItem(item.id);
          }}
          title={isInBundle ? 'Remove from bundle' : 'Add to bundle'}
        >
          {isInBundle ? (
            <div
              className="rounded-sm flex items-center justify-center"
              style={{ width: 14, height: 14, backgroundColor: '#1E365E' }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path
                  d="M1.5 4L3 5.5L6.5 2"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : (
            <div className="rounded-sm border-2 border-[#c0c7d1]" style={{ width: 14, height: 14 }} />
          )}
        </div>

        {/* Thumbnail */}
        <div
          className="flex-shrink-0 rounded overflow-hidden bg-[#f0f0f0] flex items-center justify-center"
          style={{ width: 32, height: 32 }}
        >
          {item.previewUrl ? (
            <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <FileTypeIcon fileType={item.fileType} size={15} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span
              className="inline-flex items-center px-1 py-px text-white font-black rounded"
              style={{ fontSize: 8, backgroundColor: '#1E365E' }}
            >
              {item.evNumber}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {item.hashStatus === 'verified' && (
                <CheckCircle className="text-[#0d630d]" style={{ width: 11, height: 11 }} />
              )}
              {item.hashStatus === 'computing' && (
                <Loader2 className="text-[#858585] animate-spin" style={{ width: 11, height: 11 }} />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavourite(item.id);
                }}
                className={`transition-colors ${
                  item.isFavourite ? 'text-[#f69139]' : 'text-[#dde1e7] hover:text-[#f69139]'
                }`}
              >
                <Star
                  fill={item.isFavourite ? 'currentColor' : 'none'}
                  style={{ width: 11, height: 11 }}
                />
              </button>
            </div>
          </div>
          <p className="font-semibold text-[#252627] truncate" style={{ fontSize: 11 }}>
            {item.name}
          </p>
          <div className="flex gap-1 text-[#858585]" style={{ fontSize: 9 }}>
            <span>{new Date(item.uploadedAt).toLocaleDateString('en-AU')}</span>
            <span>·</span>
            <span>{item.fileSize}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT: Library ─────────────────────────────────────────────────────── */}
      <div
        className="flex flex-col border-r border-[#dde1e7] bg-white overflow-hidden flex-shrink-0"
        style={{ width: 280 }}
      >
        <div className="px-3 py-2.5 border-b border-[#dde1e7] flex items-center justify-between flex-shrink-0">
          <span className="font-black text-[#252627] uppercase tracking-wider" style={{ fontSize: 10 }}>
            Library
          </span>
          <span className="text-[#858585]" style={{ fontSize: 10 }}>
            {evidenceItems.length} file{evidenceItems.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="p-2 border-b border-[#dde1e7] flex-shrink-0">
          <div className="relative">
            <Search
              className="absolute top-1/2 -translate-y-1/2 text-[#858585] pointer-events-none"
              style={{ left: 8, width: 12, height: 12 }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-full border border-[#dde1e7] rounded focus:outline-none focus:border-[#0060a9] bg-white"
              style={{ paddingLeft: 26, paddingRight: 8, paddingTop: 6, paddingBottom: 6, fontSize: 11 }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {evidenceItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-[#858585]">
              <File style={{ width: 28, height: 28 }} className="mb-2 opacity-20" />
              <p className="text-xs font-semibold">No evidence uploaded</p>
              <p className="mt-1" style={{ fontSize: 10 }}>Use Upload Evidence above</p>
            </div>
          )}

          {favourites.length > 0 && (
            <div>
              <div className="flex items-center gap-1 px-1 mb-1">
                <Star className="text-[#f69139]" fill="currentColor" style={{ width: 10, height: 10 }} />
                <span className="font-black text-[#252627] uppercase tracking-wider" style={{ fontSize: 9 }}>
                  Favourites ({favourites.length})
                </span>
              </div>
              <div className="space-y-0.5">{favourites.map(renderLibraryItem)}</div>
            </div>
          )}

          {allFiles.length > 0 && (
            <div>
              {favourites.length > 0 && (
                <div className="flex items-center gap-1 px-1 mb-1 mt-1">
                  <File className="text-[#858585]" style={{ width: 10, height: 10 }} />
                  <span className="font-black text-[#252627] uppercase tracking-wider" style={{ fontSize: 9 }}>
                    All Files ({allFiles.length})
                  </span>
                </div>
              )}
              <div className="space-y-0.5">{allFiles.map(renderLibraryItem)}</div>
            </div>
          )}
        </div>

        {checkedIds.size > 0 && (
          <div className="px-3 py-2 border-t border-[#dde1e7] bg-[#e6eff6] flex-shrink-0">
            <p className="font-black text-[#1E365E]" style={{ fontSize: 10 }}>
              {checkedIds.size} item{checkedIds.size !== 1 ? 's' : ''} in bundle
            </p>
          </div>
        )}
      </div>

      {/* ── MIDDLE: Bundle Builder ─────────────────────────────────────────────── */}
      <div
        className="flex flex-col border-r border-[#dde1e7] bg-white overflow-hidden flex-shrink-0"
        style={{ width: 260 }}
      >
        {/* Bundle selector */}
        <div className="px-3 py-2.5 border-b border-[#dde1e7] flex items-center gap-2 flex-shrink-0">
          <div className="relative flex-1 min-w-0">
            <button
              onClick={() => setShowDropdown((v) => !v)}
              className="w-full flex items-center justify-between gap-1 text-left"
            >
              <span className="font-black text-[#252627] truncate" style={{ fontSize: 11 }}>
                {activeBundle ? activeBundle.name : 'No bundle'}
              </span>
              <ChevronDown className="text-[#858585] flex-shrink-0" style={{ width: 13, height: 13 }} />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#dde1e7] rounded shadow-lg z-20 overflow-hidden">
                  {bundles.length === 0 && (
                    <p className="px-3 py-2 text-[#858585]" style={{ fontSize: 11 }}>No bundles yet</p>
                  )}
                  {bundles.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => { onSelectBundle(b.id); setShowDropdown(false); }}
                      className={`w-full text-left px-3 py-2 transition-colors hover:bg-[#f6f6f6] ${
                        b.id === activeBundleId ? 'font-black text-[#1E365E]' : 'text-[#252627]'
                      }`}
                      style={{ fontSize: 11 }}
                    >
                      {b.name}
                      <span className="text-[#858585] ml-1">({b.itemIds.length})</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={onCreateBundle}
            title="New bundle"
            className="bg-[#1E365E] hover:bg-[#2a4a7c] rounded flex items-center justify-center transition-colors flex-shrink-0"
            style={{ width: 22, height: 22 }}
          >
            <Plus className="text-white" style={{ width: 12, height: 12 }} />
          </button>
        </div>

        {!activeBundle ? (
          <div className="flex-1 flex items-center justify-center text-[#858585] px-4">
            <div className="text-center">
              <p className="font-semibold" style={{ fontSize: 12 }}>No bundle selected</p>
              <p className="mt-1" style={{ fontSize: 10 }}>
                Click + to create one, then check items in the library
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Bundle name */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#dde1e7] flex-shrink-0">
              {editingName ? (
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="flex-1 font-semibold text-[#252627] border-b border-[#0060a9] outline-none bg-transparent"
                  style={{ fontSize: 11 }}
                />
              ) : (
                <button
                  onClick={() => { setEditingName(true); setNameInput(activeBundle.name); }}
                  className="flex-1 text-left font-semibold text-[#252627] hover:text-[#0060a9] transition-colors truncate"
                  style={{ fontSize: 11 }}
                  title="Click to rename"
                >
                  {activeBundle.name}
                </button>
              )}
              <button
                onClick={() => onDeleteBundle(activeBundle.id)}
                className="ml-2 text-[#858585] hover:text-[#9e0c19] transition-colors flex-shrink-0"
              >
                <Trash2 style={{ width: 12, height: 12 }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Bundle items */}
              <div className="p-2 space-y-1">
                {bundleItems.length === 0 ? (
                  <p className="text-[#858585] text-center py-6" style={{ fontSize: 11 }}>
                    Check items in the library<br />to add them here
                  </p>
                ) : (
                  bundleItems.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 bg-[#f6f6f6] rounded group cursor-pointer hover:bg-[#eef3f8] transition-colors"
                      onClick={() => setSelectedItemId(item.id)}
                      title="Click to preview"
                    >
                      <div
                        className="text-white font-black rounded flex items-center justify-center flex-shrink-0"
                        style={{ width: 18, height: 18, fontSize: 8, backgroundColor: '#1E365E' }}
                      >
                        {TAB_LETTERS[i] || i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#252627] truncate" style={{ fontSize: 10 }}>
                          {item.name}
                        </div>
                        <div className="text-[#858585]" style={{ fontSize: 9 }}>{item.evNumber}</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleItem(item.id); }}
                        className="opacity-0 group-hover:opacity-100 text-[#858585] hover:text-[#9e0c19] transition-all flex-shrink-0"
                        title="Remove"
                      >
                        <X style={{ width: 11, height: 11 }} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Controls */}
              <div className="px-3 pb-3">
                <div className="border-t border-[#dde1e7] pt-2.5 mb-2">
                  <span className="font-black text-[#252627] uppercase tracking-wider" style={{ fontSize: 9 }}>
                    Bundle Controls
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { key: 'showIndex', label: 'Index Table' },
                    { key: 'showCertification', label: 'Certification' },
                    { key: 'showProvenance', label: 'Provenance' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-[#58595b]" style={{ fontSize: 11 }}>{label}</span>
                      <Toggle
                        value={activeBundle.settings?.[key] ?? (key === 'showIndex')}
                        onChange={(val) => onUpdateSettings(activeBundle.id, { [key]: val })}
                      />
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#dde1e7] pt-2.5 mt-3 mb-2">
                  <span className="font-black text-[#252627] uppercase tracking-wider" style={{ fontSize: 9 }}>
                    Authorised By
                  </span>
                </div>
                <div className="space-y-1.5">
                  {(activeBundle.authorisedBy || []).map((name) => (
                    <div key={name} className="flex items-center justify-between gap-2">
                      <span className="text-[#252627] truncate" style={{ fontSize: 11 }}>{name}</span>
                      <button
                        onClick={() =>
                          onUpdateAuthorisedBy(
                            activeBundle.id,
                            activeBundle.authorisedBy.filter((n) => n !== name)
                          )
                        }
                        className="text-[#858585] hover:text-[#9e0c19] transition-colors flex-shrink-0"
                      >
                        <X style={{ width: 10, height: 10 }} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-1.5 mt-1">
                    <input
                      type="text"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddAuthor()}
                      placeholder="Add name..."
                      className="flex-1 border border-[#dde1e7] rounded focus:outline-none focus:border-[#0060a9]"
                      style={{ padding: '4px 7px', fontSize: 10 }}
                    />
                    <button
                      onClick={handleAddAuthor}
                      className="bg-[#1E365E] hover:bg-[#2a4a7c] text-white rounded font-bold transition-colors"
                      style={{ padding: '4px 9px', fontSize: 10 }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-[#dde1e7] flex-shrink-0">
              <button
                onClick={handleDownload}
                disabled={bundleItems.length === 0 || downloading}
                className="w-full flex items-center justify-center gap-2 text-white font-black rounded transition-colors"
                style={{
                  padding: '9px 0',
                  fontSize: 10,
                  backgroundColor: bundleItems.length === 0 || downloading ? '#dde1e7' : '#1E365E',
                  color: bundleItems.length === 0 || downloading ? '#858585' : 'white',
                }}
              >
                {downloading ? (
                  <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} />
                ) : (
                  <Download style={{ width: 13, height: 13 }} />
                )}
                {downloading ? 'GENERATING PDF...' : 'DOWNLOAD BUNDLE'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT: Document preview / Bundle index ─────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedItem ? (
          <DocumentPreview item={selectedItem} onClose={() => setSelectedItemId(null)} />
        ) : (
          <>
            <div className="px-4 py-2.5 border-b border-[#dde1e7] bg-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="text-[#1E365E]" style={{ width: 13, height: 13 }} />
                <span className="font-black text-[#252627] uppercase tracking-wide" style={{ fontSize: 10 }}>
                  Bundle Preview
                </span>
              </div>
              {activeBundle && (
                <span className="text-[#858585]" style={{ fontSize: 10 }}>
                  {bundleItems.length} doc{bundleItems.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <BundleIndexPreview bundle={activeBundle} items={bundleItems} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
