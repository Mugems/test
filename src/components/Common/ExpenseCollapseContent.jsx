import React from "react";
import { Descriptions, Tag } from "antd";

const ExpenseCollapseContent = ({ expense }) => {
  if (!expense) return null;

  return (
    <div style={{ background: "#fff", padding: "0px 0px" }}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2, md: 3 }}
        labelStyle={{
          fontSize: '18px',
          fontWeight: 600,
          background: "#e5e4e4ff",
          width: "140px",
        }}
        contentStyle={{
          fontSize: '18px',
          fontWeight: 600
          
        }}
      >
       
        <Descriptions.Item label="Branch :">
          {expense.branch_name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Line :">
          {expense.line_name || "N/A"}
        </Descriptions.Item>
         <Descriptions.Item label="Expense :">
          {expense.name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Status :">
          <Tag  style={{ fontSize: "18px" }} color={expense.status === "active" ? "green" : "red"}>
            {expense.status?.toUpperCase() || "N/A"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="User :">
          {expense.created_by_full_name || "N/A"}
        </Descriptions.Item>
        {/* <Descriptions.Item label="Modified By">
          {expense.last_modified_by_full_name || "N/A"}
        </Descriptions.Item> */}
      </Descriptions>
    </div>
  );
};

export default ExpenseCollapseContent;