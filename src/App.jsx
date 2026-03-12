import { useState, useRef, useCallback } from 'react';
import Header from './components/Header';
import CombinedPage from './pages/CombinedPage';
import {
  getFileType,
  formatFileSize,
  generateEvNumber,
  computeHash,
  createPreviewUrl,
  generateId,
} from './utils/evidenceUtils';

const MATTER = { name: 'Smith & Smith', number: '7729' };
const USER = { name: 'Sarah Jenkins', role: 'Principal Solicitor' };

export default function App() {
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [activeBundleId, setActiveBundleId] = useState(null);
  const evCounterRef = useRef(1);

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';

    const newItems = files.map((file) => {
      const id = generateId();
      const evNumber = generateEvNumber(evCounterRef.current++, MATTER.number);
      const item = {
        id,
        evNumber,
        name: file.name,
        file,
        fileType: getFileType(file),
        previewUrl: createPreviewUrl(file),
        size: file.size,
        fileSize: formatFileSize(file.size),
        uploadedAt: new Date().toISOString(),
        hash: null,
        hashStatus: 'computing',
        isFavourite: false,
        auditTrail: [
          { action: 'Uploaded', timestamp: new Date().toISOString(), user: USER.name },
        ],
      };

      // Hash computed async — update item when ready
      computeHash(file).then((hash) => {
        setEvidenceItems((prev) =>
          prev.map((it) =>
            it.id === id ? { ...it, hash, hashStatus: hash ? 'verified' : 'error' } : it
          )
        );
      });

      return item;
    });

    setEvidenceItems((prev) => [...prev, ...newItems]);
  }, []);

  // ── Library ─────────────────────────────────────────────────────────────────
  const handleToggleFavourite = useCallback((id) => {
    setEvidenceItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isFavourite: !it.isFavourite } : it))
    );
  }, []);

  // Checking an item adds/removes it from the active bundle.
  // If no active bundle exists, one is auto-created.
  const handleToggleItem = useCallback(
    (itemId) => {
      if (!activeBundleId) {
        const newBundle = {
          id: generateId(),
          name: 'Bundle 1',
          itemIds: [itemId],
          authorisedBy: [],
          settings: { showIndex: true, showCertification: false, showProvenance: false },
          createdAt: new Date().toISOString(),
        };
        setBundles((prev) => [...prev, newBundle]);
        setActiveBundleId(newBundle.id);
        return;
      }

      setBundles((prev) =>
        prev.map((b) => {
          if (b.id !== activeBundleId) return b;
          const inBundle = b.itemIds.includes(itemId);
          return {
            ...b,
            itemIds: inBundle
              ? b.itemIds.filter((id) => id !== itemId)
              : [...b.itemIds, itemId],
          };
        })
      );
    },
    [activeBundleId]
  );

  // ── Bundles ─────────────────────────────────────────────────────────────────
  const handleCreateBundle = useCallback(() => {
    setBundles((prev) => {
      const newBundle = {
        id: generateId(),
        name: `Bundle ${prev.length + 1}`,
        itemIds: [],
        authorisedBy: [],
        settings: { showIndex: true, showCertification: false, showProvenance: false },
        createdAt: new Date().toISOString(),
      };
      setActiveBundleId(newBundle.id);
      return [...prev, newBundle];
    });
  }, []);

  const handleSelectBundle = useCallback((id) => {
    setActiveBundleId(id);
  }, []);

  const handleUpdateBundleName = useCallback((bundleId, name) => {
    setBundles((prev) => prev.map((b) => (b.id === bundleId ? { ...b, name } : b)));
  }, []);

  const handleUpdateSettings = useCallback((bundleId, settingsObj) => {
    setBundles((prev) =>
      prev.map((b) =>
        b.id === bundleId ? { ...b, settings: { ...b.settings, ...settingsObj } } : b
      )
    );
  }, []);

  const handleUpdateAuthorisedBy = useCallback((bundleId, names) => {
    setBundles((prev) =>
      prev.map((b) => (b.id === bundleId ? { ...b, authorisedBy: names } : b))
    );
  }, []);

  const handleDeleteBundle = useCallback((bundleId) => {
    setBundles((prev) => {
      const next = prev.filter((b) => b.id !== bundleId);
      setActiveBundleId(next.length > 0 ? next[next.length - 1].id : null);
      return next;
    });
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6f9]">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header matter={MATTER} user={USER} onUpload={handleUpload} />
        <div className="flex-1 overflow-hidden flex">
          <CombinedPage
            evidenceItems={evidenceItems}
            bundles={bundles}
            activeBundleId={activeBundleId}
            onSelectBundle={handleSelectBundle}
            onCreateBundle={handleCreateBundle}
            onToggleItem={handleToggleItem}
            onToggleFavourite={handleToggleFavourite}
            onUpdateBundleName={handleUpdateBundleName}
            onUpdateSettings={handleUpdateSettings}
            onUpdateAuthorisedBy={handleUpdateAuthorisedBy}
            onDeleteBundle={handleDeleteBundle}
            matter={MATTER}
          />
        </div>
      </div>
    </div>
  );
}
