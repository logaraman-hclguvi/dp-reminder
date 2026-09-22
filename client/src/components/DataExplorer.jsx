import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Database,
  Search,
  Filter,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  FileCode,
  Layers,
  RefreshCw,
  AlertCircle,
  Eye
} from 'lucide-react';

const PAGE_SIZE = 5;

export default function DataExplorer({ customData = {} }) {
  const collectionKeys = useMemo(() => Object.keys(customData), [customData]);
  const [selectedCollection, setSelectedCollection] = useState(collectionKeys[0] || 'payment_links');
  const [queryInput, setQueryInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [queryError, setQueryError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (collectionKeys.length > 0 && !collectionKeys.includes(selectedCollection)) {
      setSelectedCollection(collectionKeys[0]);
    }
  }, [collectionKeys, selectedCollection]);

  const handleCollectionChange = (collName) => {
    setSelectedCollection(collName);
    setCurrentPage(1);
    setQueryInput('');
    setActiveQuery('');
    setQueryError(null);
  };

  const handleApplyFilter = useCallback(() => {
    setQueryError(null);
    const trimmed = queryInput.trim();
    if (!trimmed) {
      setActiveQuery('');
      setCurrentPage(1);
      return;
    }

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        JSON.parse(trimmed);
        setActiveQuery(trimmed);
        setCurrentPage(1);
      } catch (err) {
        setQueryError('Invalid JSON query syntax. Example: {"status": "OVERDUE"}');
      }
    } else {
      setActiveQuery(trimmed);
      setCurrentPage(1);
    }
  }, [queryInput]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 180);
    return () => clearTimeout(timer);
  }, [selectedCollection, activeQuery, currentPage]);

  const filteredDocuments = useMemo(() => {
    const docs = customData[selectedCollection] || [];
    if (!activeQuery) return docs;

    if (activeQuery.startsWith('{') && activeQuery.endsWith('}')) {
      try {
        const filterObj = JSON.parse(activeQuery);
        return docs.filter((doc) =>
          Object.entries(filterObj).every(([k, v]) => String(doc[k]).toLowerCase() === String(v).toLowerCase())
        );
      } catch (e) {
        return docs;
      }
    }

    const queryLower = activeQuery.toLowerCase();
    return docs.filter((doc) =>
      Object.values(doc).some((val) => String(val).toLowerCase().includes(queryLower))
    );
  }, [customData, selectedCollection, activeQuery]);

  const totalDocs = filteredDocuments.length;
  const totalPages = Math.ceil(totalDocs / PAGE_SIZE) || 1;
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDocuments.slice(start, start + PAGE_SIZE);
  }, [filteredDocuments, currentPage]);

  const handleCopyJSON = () => {
    if (!selectedDoc) return;
    navigator.clipboard.writeText(JSON.stringify(selectedDoc, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDocumentPreview = (doc) => {
    return Object.entries(doc)
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('  ·  ');
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="page-title-banner">
        <div>
          <h1 className="page-heading">Live Schema &amp; Data Explorer</h1>
          <p className="page-subheading">Inspect, filter, and view raw JSON documents across all collections in realtime.</p>
        </div>

        {/* Collection Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Collection:</span>
          <select
            value={selectedCollection}
            onChange={(e) => handleCollectionChange(e.target.value)}
            className="rep-select-dropdown"
          >
            {collectionKeys.map((coll) => (
              <option key={coll} value={coll}>
                {coll} ({customData[coll]?.length || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Explorer Table Container */}
      <div className="modern-table-container">
        {/* Toolbar */}
        <div className="modern-table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '480px' }}>
            <div className="smooth-search-container" style={{ width: '100%' }}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                placeholder='Filter query e.g. {"status": "OVERDUE"} or text...'
                className="smooth-search-input"
              />
              {queryInput && (
                <button
                  onClick={() => {
                    setQueryInput('');
                    setActiveQuery('');
                    setCurrentPage(1);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleApplyFilter}>
              <Filter size={12} />
              <span>Filter</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Matching: <strong style={{ color: 'var(--text-main)' }}>{totalDocs}</strong> docs
            </span>
            <button
              onClick={() => handleCollectionChange(selectedCollection)}
              className="btn btn-secondary btn-sm"
              title="Refresh dataset"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Validation Query Error Message */}
        {queryError && (
          <div style={{ background: '#fff1f2', borderBottom: '1px solid #fecdd3', padding: '6px 16px', fontSize: '11.5px', color: '#e11d48', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={13} />
            <span>{queryError}</span>
          </div>
        )}

        {/* Table */}
        <div className="modern-table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                <th style={{ width: '130px' }}>Document ID</th>
                <th>Record Preview (JSON Schema)</th>
                <th style={{ width: '90px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: 'monospace', fontSize: '11.5px' }}>
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center' }}><div style={{ height: '12px', background: '#f1f5f9', borderRadius: '4px' }}></div></td>
                    <td><div style={{ height: '12px', background: '#f1f5f9', borderRadius: '4px', width: '80%' }}></div></td>
                    <td><div style={{ height: '12px', background: '#f1f5f9', borderRadius: '4px', width: '90%' }}></div></td>
                    <td><div style={{ height: '12px', background: '#f1f5f9', borderRadius: '4px', width: '50%', marginLeft: 'auto' }}></div></td>
                  </tr>
                ))
              ) : paginatedDocs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '36px 16px', textAlign: 'center' }}>
                    <FileCode size={28} color="#94a3b8" style={{ marginBottom: '6px' }} />
                    <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13px' }}>No documents match the filter</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Try modifying your query or selecting another collection above.</p>
                  </td>
                </tr>
              ) : (
                paginatedDocs.map((doc, idx) => {
                  const itemIndex = (currentPage - 1) * PAGE_SIZE + idx + 1;
                  return (
                    <tr
                      key={doc._id || doc.id || idx}
                      onClick={() => setSelectedDoc(doc)}
                      style={{ cursor: 'pointer' }}
                      title="Click to view full document"
                    >
                      <td style={{ textAlign: 'center', color: '#94a3b8' }}>
                        {itemIndex}
                      </td>
                      <td>
                        <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, color: '#0f172a' }}>
                          {doc._id || doc.id || `doc_${idx}`}
                        </span>
                      </td>
                      <td style={{ color: '#475569', maxWidth: '500px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {formatDocumentPreview(doc)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoc(doc);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '2px 7px', fontSize: '11px' }}
                        >
                          <Eye size={11} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="table-footer-bar">
          <div>
            Showing <strong>{totalDocs > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}</strong> to{' '}
            <strong>{Math.min(currentPage * PAGE_SIZE, totalDocs)}</strong> of{' '}
            <strong>{totalDocs}</strong> documents
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ marginRight: '6px' }}>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 8px' }}
            >
              <ChevronLeft size={12} />
              <span>Prev</span>
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 8px' }}
            >
              <span>Next</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Row Click -> Document JSON Viewer Modal */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="modal-dialog" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCode size={15} color="var(--guvi-green)" />
                <span>{selectedCollection} / <code style={{ color: 'var(--guvi-green)' }}>{selectedDoc._id || selectedDoc.id}</code></span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedDoc(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '14px', background: '#0f172a', color: '#34d399', fontFamily: 'monospace', fontSize: '11.5px', maxHeight: '380px', overflowY: 'auto' }}>
              <pre style={{ margin: 0 }}>
                <code>{JSON.stringify(selectedDoc, null, 2)}</code>
              </pre>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleCopyJSON}>
                {copied ? <Check size={12} color="var(--guvi-green)" /> : <Copy size={12} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
              </button>
              <button className="btn btn-primary-soft btn-sm" onClick={() => setSelectedDoc(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
