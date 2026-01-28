import React, { useMemo } from "react";
import { Row, Col, Form } from "react-bootstrap";

const FeePaidAdditionalDetails = ({
  formData,
  handleChange,
  errors,
  isDisabled,
  disableMortgageOnly = false
}) => {

  // Helper to calculate validity (days/months) between two dates
  const calculateValidity = (fromDate, toDate) => {
    if (!fromDate || !toDate) return "";
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} Days` : "Invalid Range";
  };

  const bgValidity = useMemo(() => calculateValidity(formData.BG_FromDate, formData.BG_ToDate), [formData.BG_FromDate, formData.BG_ToDate]);
  const carValidity = useMemo(() => calculateValidity(formData.CAR_FromDate, formData.CAR_ToDate), [formData.CAR_FromDate, formData.CAR_ToDate]);

  // Determine if Mortgage Released should be disabled
  const isMortgageDisabled = disableMortgageOnly || isDisabled;

  return (
    <div className="fee-details-sections mt-4">

      {/* SECTION 1: Bank Guarantee Details */}
      <div className="border rounded p-3 mb-4 bg-white shadow-sm">
        <h5 className="text-primary border-bottom pb-2 mb-3">Bank Guarantee Details</h5>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>BG From Date</Form.Label>
              <Form.Control
                type="date"
                name="BG_FromDate"
                value={formData.BG_FromDate || ""}
                onChange={handleChange}
                disabled={isDisabled}
                max={new Date().toISOString().split('T')[0]}
                isInvalid={!!errors?.BG_FromDate}
              />
              <Form.Control.Feedback type="invalid">
                {errors?.BG_FromDate}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>BG To Date</Form.Label>
              <Form.Control
                type="date"
                name="BG_ToDate"
                value={formData.BG_ToDate || ""}
                onChange={handleChange}
                disabled={isDisabled}
                isInvalid={!!errors?.BG_ToDate}
              />
              <Form.Control.Feedback type="invalid">
                {errors?.BG_ToDate}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Validity (Read-only)</Form.Label>
              <Form.Control
                type="text"
                value={bgValidity}
                readOnly
                className="bg-light fw-bold"
                placeholder="Auto-calculated"
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Bank Guarantee Number</Form.Label>
              <Form.Control
                type="text"
                name="BG_Number"
                value={formData.BG_Number || ""}
                onChange={handleChange}
                disabled={isDisabled}
                placeholder="Enter BG Number"
                isInvalid={!!errors?.BG_Number}
              />
              <Form.Control.Feedback type="invalid">
                {errors?.BG_Number}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
      </div>

      {/* SECTION 2: CAR Policy Details */}
      <div className="border rounded p-3 mb-4 bg-white shadow-sm">
        <h5 className="text-primary border-bottom pb-2 mb-3">CAR Policy Details</h5>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>CAR From Date</Form.Label>
              <Form.Control
                type="date"
                name="CAR_FromDate"
                value={formData.CAR_FromDate || ""}
                onChange={handleChange}
                disabled={isDisabled}
                max={new Date().toISOString().split('T')[0]}
                isInvalid={!!errors?.CAR_FromDate}
              />
              <Form.Control.Feedback type="invalid">
                {errors?.CAR_FromDate}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>CAR To Date</Form.Label>
              <Form.Control
                type="date"
                name="CAR_ToDate"
                value={formData.CAR_ToDate || ""}
                onChange={handleChange}
                disabled={isDisabled}
                isInvalid={!!errors?.CAR_ToDate}
              />
              <Form.Control.Feedback type="invalid">
                {errors?.CAR_ToDate}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Validity (Read-only)</Form.Label>
              <Form.Control
                type="text"
                value={carValidity}
                readOnly
                className="bg-light fw-bold"
                placeholder="Auto-calculated"
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>CAR Policy Number</Form.Label>
              <Form.Control
                type="text"
                name="CAR_Number"
                value={formData.CAR_Number || ""}
                onChange={handleChange}
                disabled={isDisabled}
                placeholder="Enter CAR Number"
                isInvalid={!!errors?.CAR_Number}
              />
              <Form.Control.Feedback type="invalid">
                {errors?.CAR_Number}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
      </div>

      {/* SECTION 3: PDC Number Details */}
      <div className="border rounded p-3 mb-3 bg-white shadow-sm">
        <h5 className="text-primary border-bottom pb-2 mb-3">PDC Number Details</h5>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Last Date</Form.Label>
              <Form.Control
                type="date"
                name="PDC_Date"
                value={formData.PDC_Date || ""}
                onChange={handleChange}
                disabled={isDisabled}
                isInvalid={!!errors?.PDC_Date}
              />
              <Form.Control.Feedback type="invalid">
                {errors?.PDC_Date}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>PDC Number</Form.Label>
              <Form.Control
                type="text"
                name="PDC_Number"
                value={formData.PDC_Number || ""}
                onChange={handleChange}
                disabled={isDisabled}
                placeholder="Enter PDC Number"
                isInvalid={!!errors?.PDC_Number}
              />
              <Form.Control.Feedback type="invalid">
                {errors?.PDC_Number}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Label className="d-block">
              Mortgage Released
              {/* {isMortgageDisabled && formData.MortgageReleased && (
                <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7em' }}>
                  Read-only
                </span>
              )} */}
            </Form.Label>

            <div className={isMortgageDisabled ? "opacity-75" : ""}>
              <Form.Check
                inline
                label="Yes"
                type="radio"
                name="MortgageReleased"
                value="Yes"
                // ✅ FIX: Only check if value is explicitly "Yes"
                checked={formData.MortgageReleased === "Yes"}
                onChange={handleChange}
                disabled={isMortgageDisabled}
                id="mortgage-yes"
                className={isMortgageDisabled ? "text-muted" : ""}
              />
              <Form.Check
                inline
                label="No"
                type="radio"
                name="MortgageReleased"
                value="No"
                // ✅ FIX: Only check if value is explicitly "No"
                checked={formData.MortgageReleased === "No"}
                onChange={handleChange}
                disabled={isMortgageDisabled}
                id="mortgage-no"
                className={isMortgageDisabled ? "text-muted" : ""}
              />
            </div>

            {/* Show selection status */}
            {/* {!isMortgageDisabled && formData.MortgageReleased && (
              <Form.Text className="text-success d-block mt-1">
                Selected: {formData.MortgageReleased}
              </Form.Text>
            )}
            {isMortgageDisabled && formData.MortgageReleased && (
              <Form.Text className="text-muted d-block mt-1">
                Previously selected: {formData.MortgageReleased}
              </Form.Text>
            )} */}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default FeePaidAdditionalDetails;