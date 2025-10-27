import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, API_DOC_URL } from '../config/Config';


const View = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // change as needed

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/get-data`); // replace with your API URL
        console.log('Fetched data:', res.data); // 👈 Console the data
        setData(res.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Pagination calculations
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>View Data</h2>

      <table className="table table-bordered table-hover table-sm mt-3">
        <thead>
          <tr>
            {/* Replace with your column headers */}
            <th>S.No</th>
            <th>Plant</th>
            <th>Process</th>
            <th>Apply Date</th>
            <th>Document</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">No data found</td>
            </tr>
          ) : (
            currentRows.map((row, idx) => (
              <tr key={row.id || idx}>
                <td>{indexOfFirstRow + idx + 1}</td>
                <td>{row.loc || row.LOC}</td>
                <td>{row.process || row.PROCESS}</td>
                <td>{row.applyDate || row.APPLY_DT || '-'}</td>
                <td>
                  {row.docPath || row.DOC_PATH ? (
                    <a href={`${API_DOC_URL}/storage/${row.docPath || row.DOC_PATH}`} target="_blank" rel="noopener noreferrer">
                      View Document
                    </a>
                  ) : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <nav>
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
          </li>

          {[...Array(totalPages)].map((_, i) => (
            <li
              key={i}
              className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
            >
              <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default View;
