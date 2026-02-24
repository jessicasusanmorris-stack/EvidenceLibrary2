import { useState } from 'react';
import { Plus, X, Download, Eye, Trash2, Loader2 } from 'lucide-react';
import { generateBundlePDF } from '../utils/bundleUtils.js';

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative rounded-full transition-colors flex-shrink-0"
      style={{
        width: 34,
        height: 18,
        backgroundColor: value ? '#1E365E' : '#dde1e7',
      }}
    >
      <div
        className="absolute top-0.5 bg-white rounded-full shadow transition-transform"
        style={{
          width: 14,
          height: 14,
          transform: value ? 'translateX(18px)' : 'translateX(2px)',
        }}
      />
    </button>
  );
}

const TAB_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function BundlePreview({ bundle, items }) {
  if (!bundle) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#858585]">
        <Eye style={{ width: 36, height: 36 }} className="mb-3 opacity-20" />
        <p className="text-sm font-semibold">No bundle selected</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#858585]">
        <Eye style={{ width: 36, height: 36 }} className="mb-3 opacity-20" />
        <p className="text-sm font-semibold">Bundle is empty</p>
        <p className="mt-1" style={{ fontSize: 11 }}>Add items from the Library</p>
      </div>
    );
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  const authorName = (bundle.authorisedBy?.[0] || 'DEPONENT').toUpperCase();

  return (
    <div className="flex items-start justify-center p-5 h-full overflow-y-auto bg-[#3a3a3a]">
      {/* Paper */}
      <div className="bg-white shadow-2xl w-full" style={{ maxWidth: 360, fontFamily: 'Georgia, serif', minHeight: 480 }}>
        <div style={{ padding: '28px 28px 24px' }}>
          {/* Index header */}
          <div className="text-center" style={{ marginBottom: 16 }}>
            <h1 className="font-bold text-[#1E365E]" style={{ fontSize: 22, letterSpacing: '0.28em', marginBottom: 6 }}>
              I&nbsp;&nbsp;N&nbsp;&nbsp;D&nbsp;&nbsp;E&nbsp;&nbsp;X
            </h1>
            <div style={{ borderBottom: '2px solid #1E365E', marginBottom: 8 }} />
            <p className="text-[#58595b]" style={{ fontSize: 9 }}>
              AFFIDAVIT OF {authorName} ON {dateStr}
            </p>
          </div>

          {/* Index table */}
          <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: 9 }}>
            <thead>
              <tr style={{ backgroundColor: '#1E365E', color: 'white' }}>
                <th style={{ padding: '5px 8px', textAlign: 'left', fontWeight: 'bold', width: 28 }}>Tab</th>
                <th style={{ padding: '5px 8px', textAlign: 'left', fontWeight: 'bold' }}>Document Description</th>
                <th style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 'bold', width: 44 }}>Pages</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8f9fb' }}>
                  <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#1E365E', textAlign: 'center' }}>
                    {TAB_LETTERS[i] || i + 1}
                  </td>
                  <td style={{ padding: '4px 8px', color: '#252627', maxWidth: 180, overflow: 'hidden' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name.replace(/\.[^/.]+$/, '')}
                    </div>
                  </td>
                  <td style={{ padding: '4px 8px', color: '#252627', textAlign: 'right' }}>
                    {i * 2 + 1}–{i * 2 + 2}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Certification */}
          {bundle.settings?.showCertification && bundle.authorisedBy?.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #dde1e7' }}>
              <p className="text-[#58595b] italic" style={{ fontSize: 8, marginBottom: 10 }}>
                I certify that this bundle is accurate and complete.
              </p>
              {bundle.authorisedBy.map((name, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ borderBottom: '1px solid #252627', marginBottom: 3, width: 140 }} />
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

export default function BundleBuilderPage({
  bundles,
  evidenceItems,
  selectedBundleId,
  onSelectBundle,
  onCreateBundle,
  onRemoveFromBundle,
  onUpdateSettings,
  onUpdateName,
  onUpdateAuthorisedBy,
  onDeleteBundle,
  matter,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [downloading, setDownloading] = useState(false);

  const selectedBundle = bundles.find(b => b.id === selectedBundleId) || null;
  const bundleItems = selectedBundle
    ? selectedBundle.itemIds.map(id => evidenceItems.find(e => e.id === id)).filter(Boolean)
    : [];

  const handleSaveName = () => {
    if (editingId && editingName.trim()) onUpdateName(editingId, editingName.trim());
    setEditingId(null);
  };

  const handleAddAuthor = () => {
    if (!newAuthor.trim() || !selectedBundle) return;
    const existing = selectedBundle.authorisedBy || [];
    if (!existing.includes(newAuthor.trim())) {
      onUpdateAuthorisedBy(selectedBundle.id, [...existing, newAuthor.trim()]);
    }
    setNewAuthor('');
  };

  const handleDownload = async () => {
    if (!selectedBundle || bundleItems.length === 0 || downloading) return;
    setDownloading(true);
    try {
      await generateBundlePDF(selectedBundle, evidenceItems, matter);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Bundle list */}
      <div className="flex flex-col border-r border-[#dde1e7] bg-white overflow-hidden flex-shrink-0" style={{ width: 200 }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#dde1e7]">
          <span className="font-black text-[#252627] uppercase tracking-wider" style={{ fontSize: 10 }}>Bundles</span>
          <button
            onClick={onCreateBundle}
            className="bg-[#1E365E] hover:bg-[#2a4a7c] rounded flex items-center justify-center transition-colors"
            style={{ width: 22, height: 22 }}
          >
            <Plus className="text-white" style={{ width: 13, height: 13 }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {bundles.length === 0 && (
            <p className="text-[#858585] text-center py-6" style={{ fontSize: 11 }}>No bundles yet</p>
          )}
          {bundles.map(bundle => (
            <button
              key={bundle.id}
              onClick={() => onSelectBundle(bundle.id)}
              className={`w-full text-left px-3 py-2.5 rounded transition-all ${
                selectedBundleId === bundle.id
                  ? 'bg-[#1E365E] text-white'
                  : 'text-[#252627] hover:bg-[#f6f6f6]'
              }`}
            >
              <div className="font-bold truncate" style={{ fontSize: 11 }}>{bundle.name}</div>
              <div className={`mt-0.5 ${selectedBundleId === bundle.id ? 'text-white/60' : 'text-[#858585]'}`}
                style={{ fontSize: 10 }}>
                {bundle.itemIds.length} item{bundle.itemIds.length !== 1 ? 's' : ''}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Middle: Bundle details */}
      <div className="flex flex-col border-r border-[#dde1e7] bg-white overflow-hidden flex-shrink-0" style={{ width: 268 }}>
        {!selectedBundle ? (
          <div className="flex items-center justify-center h-full text-[#858585]">
            <p style={{ fontSize: 12 }}>Select or create a bundle</p>
          </div>
        ) : (
          <>
            {/* Bundle name header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#dde1e7]">
              {editingId === selectedBundle.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  className="flex-1 font-bold text-[#252627] border-b border-[#0060a9] outline-none bg-transparent"
                  style={{ fontSize: 12 }}
                />
              ) : (
                <button
                  onClick={() => { setEditingId(selectedBundle.id); setEditingName(selectedBundle.name); }}
                  className="flex-1 text-left font-bold text-[#252627] truncate hover:text-[#0060a9] transition-colors"
                  style={{ fontSize: 12 }}
                >
                  {selectedBundle.name}
                </button>
              )}
              <button
                onClick={() => onDeleteBundle(selectedBundle.id)}
                className="ml-2 text-[#858585] hover:text-[#9e0c19] transition-colors p-1"
              >
                <Trash2 style={{ width: 13, height: 13 }} />
              </button>
            </div>

            {/* Scrollable middle content */}
            <div className="flex-1 overflow-y-auto">
              {/* Items */}
              <div className="p-3 space-y-1.5">
                {bundleItems.length === 0 && (
                  <p className="text-[#858585] text-center py-4" style={{ fontSize: 11 }}>
                    No items yet.<br />Go to Library, select items,<br />then click Generate Bundle.
                  </p>
                )}
                {bundleItems.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 bg-[#f6f6f6] rounded group">
                    <div
                      className="bg-[#1E365E] text-white font-black rounded flex items-center justify-center flex-shrink-0"
                      style={{ width: 20, height: 20, fontSize: 9 }}
                    >
                      {TAB_LETTERS[i] || i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#252627] truncate" style={{ fontSize: 11 }}>{item.name}</div>
                      <div className="text-[#858585]" style={{ fontSize: 10 }}>{item.evNumber}</div>
                    </div>
                    <button
                      onClick={() => onRemoveFromBundle(selectedBundle.id, item.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#858585] hover:text-[#9e0c19] transition-all p-0.5"
                    >
                      <X style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Bundle Controls */}
              <div className="px-3 pb-2">
                <div className="border-t border-[#dde1e7] pt-3 mb-2">
                  <span className="font-black text-[#252627] uppercase tracking-wider" style={{ fontSize: 10 }}>
                    Bundle Controls
                  </span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { key: 'showIndex', label: 'Index Table' },
                    { key: 'showCertification', label: 'Certification' },
                    { key: 'showProvenance', label: 'Provenance' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-[#58595b] font-medium" style={{ fontSize: 11 }}>{label}</span>
                      <Toggle
                        value={selectedBundle.settings?.[key] ?? true}
                        onChange={val => onUpdateSettings(selectedBundle.id, { [key]: val })}
                      />
                    </div>
                  ))}
                </div>

                {/* Authorised Details */}
                <div className="border-t border-[#dde1e7] pt-3 mt-3 mb-2">
                  <span className="font-black text-[#252627] uppercase tracking-wider" style={{ fontSize: 10 }}>
                    Authorised Details
                  </span>
                </div>
                <div className="space-y-1.5">
                  {(selectedBundle.authorisedBy || []).map(name => (
                    <div key={name} className="flex items-center justify-between gap-2">
                      <span className="text-[#252627]" style={{ fontSize: 11 }}>{name}</span>
                      <button
                        onClick={() => onUpdateAuthorisedBy(
                          selectedBundle.id,
                          (selectedBundle.authorisedBy || []).filter(n => n !== name)
                        )}
                        className="text-[#858585] hover:text-[#9e0c19] transition-colors"
                      >
                        <X style={{ width: 11, height: 11 }} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-1.5 mt-2">
                    <input
                      type="text"
                      value={newAuthor}
                      onChange={e => setNewAuthor(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddAuthor()}
                      placeholder="Add name..."
                      className="flex-1 border border-[#dde1e7] rounded focus:outline-none focus:border-[#0060a9]"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                    />
                    <button
                      onClick={handleAddAuthor}
                      className="bg-[#1E365E] hover:bg-[#2a4a7c] text-white rounded transition-colors"
                      style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700 }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Download button */}
            <div className="p-3 border-t border-[#dde1e7]">
              <button
                onClick={handleDownload}
                disabled={bundleItems.length === 0 || downloading}
                className="w-full flex items-center justify-center gap-2 bg-[#1E365E] hover:bg-[#2a4a7c] disabled:bg-[#dde1e7] disabled:text-[#858585] text-white font-black rounded transition-colors"
                style={{ padding: '10px 0', fontSize: 11 }}
              >
                {downloading ? (
                  <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />
                ) : (
                  <Download style={{ width: 14, height: 14 }} />
                )}
                {downloading ? 'GENERATING PDF...' : 'DOWNLOAD BUNDLE'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right: Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b border-[#dde1e7] bg-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="text-[#1E365E]" style={{ width: 14, height: 14 }} />
            <span className="font-black text-[#252627] uppercase tracking-wide" style={{ fontSize: 11 }}>
              Forensic Bundle Preview
            </span>
          </div>
          {selectedBundle && (
            <span className="text-[#858585]" style={{ fontSize: 10 }}>
              {bundleItems.length} document{bundleItems.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <BundlePreview bundle={selectedBundle} items={bundleItems} />
        </div>
      </div>
    </div>
  );
}
