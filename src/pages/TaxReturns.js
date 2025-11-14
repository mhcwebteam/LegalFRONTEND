import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Button, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL, BASE_URL, GET_URL, RETURNS_URL } from '../config/Config';
import CardWithHeader from '../components/CardWithHeader';
import { TabLabels, Tabs } from '../components/TabIcons';
import Swal from 'sweetalert2';
import '../pages/Amendment.css';
import { Context } from '../context/ContextData';
import { FaUpload } from 'react-icons/fa';
import PollutionDocUploadModal from '../components/PollutionDocUploadModal';
import DocumentModal from '../components/DocumentModal';

const TaxReturns = () => {
  const { totalMasterData = [] } = useContext(Context);

  const [modalData, setModalData] = useState({
    plant: '',
    approvalAuthority: '',
    fromDate: '',
    endDate: '',
    appliedPaidOn: '',
    dueDate: '',
    files: [],
    comments: '',
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [returnsData, setReturnsData] = useState([]);
  const [activeButton, setActiveButton] = useState(''); // Track active button

  console.log(returnsData, "returnssssssssssssssss");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedAuthority, setSelectedAuthority] = useState('');
  const [newDocs, setNewDocs] = useState([]);
  // Document Modal
  const [showDocModal, setShowDocModal] = useState(false);
  const [modalDocs, setModalDocs] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setModalData((prev) => ({
      ...prev,
      files: [...prev.files, ...selectedFiles]
    }));
  };

  useEffect(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const yyyy = today.getFullYear();
    const formattedToday = `${mm}-${dd}-${yyyy}`;
    setModalData((prev) => ({ ...prev, dueDate: formattedToday }));
  }, []);

  const handleRemoveFile = (index) => {
    const updatedFiles = modalData.files.filter((_, i) => i !== index);
    setModalData((prev) => ({ ...prev, files: updatedFiles }));
  };

  const handlePlantChange = (value) => {
    setSelectedPlant(value);
    setModalData(prev => ({ ...prev, plant: value }));
    setActiveButton('');
  };

  const handleAuthorityChange = (value) => {
    setSelectedAuthority(value);
    setModalData(prev => ({ ...prev, approvalAuthority: value }));
    setActiveButton('');
  };

  const resetForm = () => {
    setModalData({
      plant: selectedPlant,
      approvalAuthority: selectedAuthority,
      fromDate: '',
      endDate: '',
      appliedPaidOn: '',
      dueDate: '',
      files: [],
      comments: '',
    });
    setNewDocs([]);
  };

  //this is for:date formate like dd-mm-yyyy
const formatDate = (dateStr) => {
  if (!dateStr) return "-";

  // Expecting format: "YYYY-MM-DD"
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr; // Return as-is if not in expected format

  const [year, month, day] = parts;
  return `${day}-${month}-${year}`; // ✅ dd-mm-yyyy
};



  const handleCreate = () => {
    if (!selectedPlant) {
      Swal.fire('Error', 'Please select a plant first', 'error');
      return;
    }
    if (!selectedAuthority) {
      Swal.fire('Error', 'Please select approval authority first', 'error');
      return;
    }
    setShowCreateForm(true);
    setShowTable(false);
  };



  const handleSubmit = async () => {
    if (!modalData.fromDate || !modalData.endDate || !modalData.appliedPaidOn || newDocs.length === 0) {
      Swal.fire('Error', 'Please fill all required fields and upload at least one document', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append("PLANT", modalData.plant);
      formPayload.append("APPROVAL_AUTHORITY", modalData.approvalAuthority);
      formPayload.append("FROM_DATE", modalData.fromDate);
      formPayload.append("END_DATE", modalData.endDate);
      formPayload.append("APPLIED_PAID_ON", modalData.appliedPaidOn);
      formPayload.append("COMMENTS", modalData.comments);

      newDocs.forEach((file) => {
        formPayload.append("FILES[]", file);
      });

      const response = await axios.post(`${RETURNS_URL}`, formPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await Swal.fire('Success', 'Tax return submitted successfully!', 'success');
      resetForm();
      setNewDocs([]);
      setShowCreateForm(false);
      setActiveButton('');
      handleView();
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire('Error', 'Failed to submit tax return', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleAdd = async () => {
    if (!selectedPlant) {
      Swal.fire('Error', 'Please select a plant first', 'error');
      return;
    }

    if (!selectedAuthority) {
      Swal.fire('Error', 'Please select approval authority first', 'error');
      return;
    }

    try {
      const url = `${BASE_URL}?PLANT=${encodeURIComponent(selectedPlant)}&APPROVAL_AUTHORITY=${encodeURIComponent(selectedAuthority)}`;
      const response = await axios.get(url);
      const data = response?.data?.ITReturns || [];

      if (data.length === 0) {
        Swal.fire('Info', 'No existing records found. Please create a new tax return first.', 'info');
        return;
      }

      setReturnsData(data);
      setShowTable(true);
      setShowCreateForm(false);
      setActiveButton('add');

      const lastRecord = data[data.length - 1];
      const lastEndDate = lastRecord.END_DATE || '';

      let nextFromDate = '';
      if (lastEndDate) {
        const dateObj = new Date(lastEndDate);
        dateObj.setDate(dateObj.getDate() + 1);
        nextFromDate = dateObj.toISOString().split("T")[0];
      }

      let calculatedEndDate = '';
      if (nextFromDate) {
        const dateObj = new Date(nextFromDate);
        dateObj.setMonth(dateObj.getMonth() + 6);
        calculatedEndDate = dateObj.toISOString().split("T")[0];
      }

      setModalData({
        plant: selectedPlant,
        approvalAuthority: selectedAuthority,
        fromDate: nextFromDate,
        endDate: calculatedEndDate,
        appliedPaidOn: '',
        dueDate: modalData.dueDate,
        files: [],
        comments: '',
      });

      setShowAddModal(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire('Error', 'Failed to fetch tax returns', 'error');
    }
  };

  const handleView = async () => {
    if (!selectedPlant) {
      Swal.fire('Error', 'Please select a plant first', 'error');
      return;
    }

    if (!selectedAuthority) {
      Swal.fire('Error', 'Please select approval authority first', 'error');
      return;
    }

    try {
      const url = `${BASE_URL}?PLANT=${encodeURIComponent(selectedPlant)}&APPROVAL_AUTHORITY=${encodeURIComponent(selectedAuthority)}`;
      const response = await axios.get(url);
      setReturnsData(response?.data?.ITReturns || []);
      setShowTable(true);
      setShowCreateForm(false);
      setShowAddModal(false);
      setActiveButton('view');
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire('Error', 'Failed to fetch tax returns', 'error');
    }
  };

  const handleViewRecord = (item) => {
    setViewData(item);
    setShowViewModal(true);
  };

  const handleViewDocs = (item) => {
    try {
      const filePath = item.FILES || '';
      const docs = [{
        DOC_NAME: filePath,
        DOC_PATH: filePath,
      }];

      setModalDocs(docs);
      setModalTitle(`${item.PLANT} - Documents`);
      setShowDocModal(true);
    } catch (e) {
      console.error('Error parsing documents:', e);
      Swal.fire('Error', 'Failed to load documents', 'error');
    }
  };

  const getButtonStyle = (buttonType) => {
    const baseStyle = {
      transition: 'all 0.3s ease',
    };

    if (activeButton === buttonType) {
      return {
        ...baseStyle,
        backgroundColor: '#0056b3',
        borderColor: '#004085',
        transform: 'scale(1.05)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      };
    }

    return baseStyle;
  };

  return (
    <div style={{ padding: '6px' }}>
      <CardWithHeader title="Tax Returns Section">
        <Row className=" align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label style={{ fontWeight: '600', fontSize: '14px' }}>
                Select Plant
              </Form.Label>
              <Form.Select
                value={selectedPlant}
                onChange={(e) => handlePlantChange(e.target.value)}
                style={{ border: '1px solid #7b2cbf' }}
                className="form-select-sm"
              >
                <option value="">-- Select Plant --</option>
                {Array.isArray(totalMasterData) &&
                  totalMasterData.map((ele, index) => (
                    <option key={index} value={ele.LOC}>
                      {ele.LOC}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label style={{ fontWeight: '600', fontSize: '14px' }}>
                Approval Authority
              </Form.Label>
              <Form.Select
                className="form-select-sm"
                value={selectedAuthority}
                onChange={(e) => handleAuthorityChange(e.target.value)}
                style={{ border: '1px solid #7b2cbf' }}
              >
                <option value="">Select Authority</option>
                {Object.entries(Tabs).map(([key, label]) => (
                  <option key={key} value={label}>
                    {label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreate}
                style={getButtonStyle('create')}
              >
                <i className="fas fa-plus me-2"></i>CREATE
              </Button>
              <Button
                variant="info"
                size="sm"
                onClick={handleView}
                style={getButtonStyle('view')}
              >
                <i className="fas fa-eye me-2"></i>VIEW
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={handleAdd}
                style={getButtonStyle('add')}
              >
                <i className="fas fa-plus me-2"></i>ADD
              </Button>
            </div>
          </Col>
        </Row>
      </CardWithHeader>

      {showCreateForm && (
        <div style={{
          backgroundColor: '#e2e1ebff',
          borderRadius: '8px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginTop: '8px',
          maxWidth: '900px',
          marginLeft: '250px'
        }}>
          <h5 style={{ marginBottom: '20px', color: '#7b2cbf' }}>
            <i className="fas fa-file-invoice me-2"></i>Create Tax Return
          </h5>

          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Plant</Form.Label>
                  <Form.Control type="text" value={modalData.plant} readOnly />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Approval Authority</Form.Label>
                  <Form.Control type="text" value={modalData.approvalAuthority} readOnly />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    From Date <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={modalData.fromDate}
                    onChange={(e) => {
                      const fromDate = e.target.value;

                      // Stop if no valid date
                      if (!fromDate) {
                        setModalData((prev) => ({
                          ...prev,
                          fromDate: "",
                          endDate: "",
                        }));
                        return;
                      }

                      const dateObj = new Date(fromDate);

                      if (isNaN(dateObj)) {
                        console.error("Invalid date selected:", fromDate);
                        return;
                      }

                      dateObj.setMonth(dateObj.getMonth() + 6);
                      const formattedEndDate = dateObj.toISOString().split("T")[0];

                      setModalData((prev) => ({
                        ...prev,
                        fromDate,
                        endDate: formattedEndDate,
                      }));
                    }}

                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    End Date <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={modalData.endDate}
                    onChange={(e) =>
                      setModalData((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Due Date <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={modalData.dueDate || ""}
                    onChange={(e) =>
                      setModalData((prev) => ({ ...prev, dueDate: e.target.value }))
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Applied/Paid On <span style={{ color: 'red' }}>*</span></Form.Label>
                  <Form.Control
                    type="date"
                    value={modalData.appliedPaidOn}
                    onChange={(e) => setModalData(prev => ({ ...prev, appliedPaidOn: e.target.value }))}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <div className="form-field">
                  <label className="field-label">
                    <FaUpload className="label-icon" /> Upload Documents*
                  </label>
                  <div className="upload-container">
                    <button
                      type="button"
                      className="upload-button"
                      onClick={() => setShowUploadModal(true)}
                    >
                      <FaUpload className="upload-icon" />
                      Upload Files
                      {newDocs.length > 0 && (
                        <span className="upload-count">
                          ({newDocs.length} files)
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Comments</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="2"
                    value={modalData.comments}
                    onChange={(e) => setModalData(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder="Enter your comments here..."
                  />
                </Form.Group>
              </Col>
            </Row>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setActiveButton('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>Submit
                  </>
                )}
              </Button>
            </div>
          </Form>
        </div>
      )}

      {showTable && (
        <div style={{
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginTop: '20px',
          height: 'calc(100vh - 200px)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {returnsData.length === 0 ? (
            <div className="alert alert-info m-3">
              No records found for the selected plant and authority.
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
              <table className="table table-hover table-sm compact-table" style={{ marginBottom: '0', }}>
                <thead className='custom-thead'>
                  <tr>
                    <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>S.No</th>
                    <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>Plant Name</th>
                    <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>Approval Authority</th>
                    <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>From Date</th>
                    <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>End Date</th>
                    <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>Document</th>
                    <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>Comments</th>
                    <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>Logs</th>
                    <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {returnsData.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '10px 8px' }}>{index + 1}</td>
                      <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                        <em>{item.PLANT}</em>
                      </td>
                      <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                        {item?.APPROVAL_AUTHORITY || '-'}
                      </td>
                      <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                        {formatDate(item?.FROM_DATE || '-')}
                      </td>
                      <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                        {formatDate(item?.END_DATE || '-')}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        {item?.FILES ? (
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleViewDocs(item)}
                            title="View Documents"
                          >
                            <i className="fas fa-file-alt"></i>
                          </button>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                        {item?.COMMENTS || '-'}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <button
                          className="btn btn-outline-info btn-sm"
                          title="View Logs"
                        >
                          <i className="fas fa-history"></i>
                        </button>
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleViewRecord(item)}
                          title="View Record"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal show={showAddModal} onHide={() => {
        setShowAddModal(false);
        setActiveButton('');
        resetForm();
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Tax Return</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>

              <Form.Group className="mb-3">
                <Form.Label>Plant</Form.Label>
                <Form.Control type="text" value={modalData.plant} readOnly />
              </Form.Group>

            </Row>

            <Row>

              <Form.Group className="mb-3">
                <Form.Label>Approval Authority</Form.Label>
                <Form.Control type="text" value={modalData.approvalAuthority} readOnly />
              </Form.Group>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    From Date <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={modalData.fromDate}
                    onChange={(e) => {
                      const fromDate = e.target.value;
                      const dateObj = new Date(fromDate);
                      dateObj.setMonth(dateObj.getMonth() + 6);
                      const formattedEndDate = dateObj.toISOString().split("T")[0];

                      setModalData((prev) => ({
                        ...prev,
                        fromDate,
                        endDate: formattedEndDate,
                      }));
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    End Date <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={modalData.endDate}
                    onChange={(e) =>
                      setModalData((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                  />
                </Form.Group>
              </Col>


            </Row>
            <Row>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Applied/Paid On <span style={{ color: 'red' }}>*</span></Form.Label>
                  <Form.Control
                    type="date"
                    value={modalData.appliedPaidOn}
                    onChange={(e) => setModalData(prev => ({ ...prev, appliedPaidOn: e.target.value }))}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Due Date <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={modalData.dueDate || ""}
                    onChange={(e) =>
                      setModalData((prev) => ({ ...prev, dueDate: e.target.value }))
                    }
                  />
                </Form.Group>

              </Col>

            </Row>
            <Row>

              <Form.Group className="mb-3">
                <Form.Label>
                  <FaUpload className="me-2" />
                  Upload Documents <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files); // ✅ all selected files
                    setNewDocs((prev) => [...prev, ...files]); // append to existing
                  }}
                />
                {newDocs.length > 0 && (
                  <ul className="mt-2 list-unstyled">
                    {newDocs.map((file, index) => (
                      <li key={index} style={{ fontSize: "14px" }}>
                        📄 {file.name}
                      </li>
                    ))}
                  </ul>
                )}
              </Form.Group>





            </Row>

            <Row>
              <Form.Group className="mb-3">
                <Form.Label>Comments</Form.Label>
                <Form.Control
                  as="textarea"
                  rows="2"
                  value={modalData.comments}
                  onChange={(e) =>
                    setModalData((prev) => ({ ...prev, comments: e.target.value }))
                  }
                  placeholder="Enter your comments here..."
                />
              </Form.Group>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowAddModal(false);
            resetForm();
            setActiveButton('');
          }} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Submitting...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>Submit
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tax Return Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewData && (
            <div>
              <div>
                <strong>Plant:</strong> {viewData.PLANT}
              </div>
              <Row className="mt-3">
                <Col md={6}>
    <div>
      <strong>From Date:</strong> {formatDate(viewData?.FROM_DATE)}
    </div>
  </Col>
  <Col md={6}>
    <div>
      <strong>End Date:</strong> {formatDate(viewData?.END_DATE)}
    </div>
  </Col>
              </Row>
              <Row className="mt-3">
                <div>
                  <strong>Applied/Paid On:</strong> {viewData.APPLIED_PAID_ON}
                </div>
              </Row>
              <Row className="mt-3">
                <div>
                  <strong>Comments:</strong> {viewData.COMMENTS || '-'}
                </div>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Tax Return</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editData && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Comments</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editData.COMMENTS || ''}
                  onChange={(e) => setEditData({ ...editData, COMMENTS: e.target.value })}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <DocumentModal
        show={showDocModal}
        onClose={() => setShowDocModal(false)}
        title={modalTitle}
        docs={modalDocs}
      />

      <PollutionDocUploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        files={newDocs}
        setFiles={setNewDocs}
        title="Upload Application Documents"
      />
    </div>
  );
};

export default TaxReturns;





