import React from "react";
import ReactDOM from "react-dom";

const OutsideMain: React.FC = () => {
  return ReactDOM.createPortal(
    <div>THIS DIV IS OUTSIDE NORMAL ROOT</div>,
    document.getElementById("portal-root")!
  );
};

export default OutsideMain;
