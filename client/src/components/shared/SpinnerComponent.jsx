import React from "react";
import { Spinner } from "react-bootstrap";

function SpinnerComponent() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // Adjust the height if needed
      }}
    >
      <Spinner animation="border" variant="info" />
    </div>
  );
};

export {SpinnerComponent};
