import React from "react";
import { Descriptions } from "antd";

const AreaCollapseContent = ({ area }) => {
  if (!area) return null;

  return (
    <div style={{ background: "#fff", padding: "0px" }}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2, md: 3 }}
        labelStyle={{
          fontWeight: 600,
          background: "#e5e4e4ff",
          width: "140px",
          fontSize: "18px"
        }}
        contentStyle={{
          fontSize: "18px",
          fontWeight: 600
         
        }
      }
      >
        <Descriptions.Item label="Area Code:">
          {area.id || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Area Name:">
          {area.areaName || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Branch Name:">
          {area.branch_name || "N/A"}
        </Descriptions.Item>
        
      </Descriptions>
    </div>
  );
};

export default AreaCollapseContent;