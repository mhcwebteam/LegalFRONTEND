// components/FormHeader.js
import React, { useContext } from "react";
import { Card } from "react-bootstrap";
import { Context } from "../context/ContextData";

const FormHeader = () => {
  const { storeData, respModifyData } = useContext(Context);

  const displayData = respModifyData?.length > 0 ? respModifyData : storeData[0];

  

  return (
    <Card className="mb-3 shadow-sm border-0">
      <Card.Body className="d-flex flex-wrap justify-content-between align-items-center bg-light rounded p-3">
        <h5 className="mb-2 mb-md-0  fw-bold">Water Approval Steps</h5>
        <div className="d-flex flex-wrap gap-3 small text-muted text-dark fs-6">
          <span>
            💰 Paid:{" "}
            <strong className="text-dark ">
              {displayData?.AMOUNT_PAID ?? ""}
            </strong>
          </span>

          <span>
            🏠 Flats:{" "}
            <strong className="text-dark">
      
           {displayData?.NO_OF_FLATS ?? ""}
            </strong>
          </span>

          <span>
            💧 KLD:{" "}
            <strong className="text-dark">
              {displayData?.KLD ?? ""}
            </strong>
          </span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FormHeader;
