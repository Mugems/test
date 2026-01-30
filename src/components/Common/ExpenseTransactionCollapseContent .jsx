import React from "react";
import { Descriptions } from "antd";
import dayjs from "dayjs";

const ExpenseTransactionCollapseContent = ({ expense }) => {
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
          {expense.EXPNS_TRNSCTN_BRNCH_NM|| "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Line :">
          {expense.EXPNS_TRNSCTN_LINE_NM || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Expense :">
          {expense.EXPNS_TYPE_NM || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Amount :">
          {expense.EXPNS_TRNSCTN_AMNT ? `₹${expense.EXPNS_TRNSCTN_AMNT}` : "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Payment Mode:">
          {expense.EXPNS_TRNSCTN_MODE || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Transaction Date:">
          {expense.EXPNS_TRNSCTN_DT 
            ? dayjs(expense.EXPNS_TRNSCTN_DT).format('DD MMM YYYY') 
            : "N/A"}
        </Descriptions.Item>
        {expense.EXPNS_TRNSCTN_RMRKS && (
          <Descriptions.Item label="Remarks:" span={{ xs: 1, sm: 2, md: 3 }}>
            {expense.EXPNS_TRNSCTN_RMRKS}
          </Descriptions.Item>
        )}
      </Descriptions>
    </div>
  );
};

export default ExpenseTransactionCollapseContent;