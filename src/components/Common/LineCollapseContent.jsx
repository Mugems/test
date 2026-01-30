import React from "react";
import { Descriptions } from "antd";

const LineCollapseContent = ({ line }) => {
  if (!line) return null;

  return (
    <div style={{ background: "#fff", padding: "0px 0px" }}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2, md: 3 }}
        labelStyle={{
          fontSize: "18px",
          fontWeight: 700,
          background: "#e5e4e4ff",
          width: "140px",
        }}
         contentStyle={{
            backgroundColor: "#ffffff",
            fontSize: "18px",
            width: "200px",
            minWidth: "130px",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
      >
        <Descriptions.Item label="Line:">
          {line.lineName || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Branch:">
          {line.branch_name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Line Type:">
          {line.lineType || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Installment:">
          {line.installment ?? "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Addl Installment:">
          {line.badinstallment ?? "N/A"}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default LineCollapseContent;
