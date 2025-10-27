export const FileList = ({ files, onRemove, title }) => {
  if (!files?.length) return null;
  
  return (
    <div className="file-list-container" style={{ marginTop: '8px' }}>
      {title && <div style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '4px' }}>{title}:</div>}
      <ul className="list-unstyled mb-2" style={{ maxHeight: '80px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '4px' }}>
        {files.map((f, i) => (
          <li key={`${f.name}-${i}`} className="d-flex justify-content-between align-items-center border rounded px-2 py-1 mb-1" style={{ backgroundColor: '#f8f9fa' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontSize: '13px' }}>
              {f.name}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={() => {onRemove(i)}}
              style={{ minWidth: '24px', height: '24px', padding: '0', fontSize: '12px' }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};