import React from "react";
import { Descriptions } from "antd";

const InvestmentCollapseContent = ({ investment }) => {
  if (!investment) return null;

  return (
    <div style={{ background: "#fff", padding: "0px 0px" }}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2, md: 3 }}
        labelStyle={{
          fontSize: "18px",
          fontWeight: 600,
          background: "#e5e4e4ff",
          width: "140px",
        }}
        contentStyle={{
          fontSize: "18px",
          fontWeight: 600
        }}
      >
        <Descriptions.Item label="Branch Name:">
          {investment.branch_name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Line Name:">
          {investment.line_name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="User Name:">
          {investment.user_name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Investment Amount:">
          {investment.investment_amount ? `₹${investment.investment_amount}` : "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Investment Date:">
          {investment.investment_date || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Payment Mode:">
          {investment.payment_mode || "N/A"}
        </Descriptions.Item>
        {investment.comments && (
          <Descriptions.Item label="Comments:" span={{ xs: 1, sm: 2, md: 3 }}>
            {investment.comments}
          </Descriptions.Item>
        )}
      </Descriptions>
    </div>
  );
};

export default InvestmentCollapseContent;