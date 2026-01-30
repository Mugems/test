import React from "react";
import { Select } from "antd";

const ColumnDropdown = ({
  options,
  onChange,
  selectedColumn,
  mode,
  placeholder,
}) => {
  const handleChange = (checkedValues) => {
    onChange(checkedValues);
  };

  const defaultCol = ["lineName", "branch_name", "areaName"];

  const modifiedOptions = options.map((option) => {
    if (mode === "single") {
      return option;
    }

    return {
      ...option,
      disabled:
        defaultCol.includes(option.value) ||
        (selectedColumn?.length === 1 && selectedColumn.includes(option.value)),
    };
  });

  return (
    <Select
      mode={mode || "multiple"}
      style={{
        width: "145px",
        height: "32px",
        marginRight: "10px",
      }}
      showSearch={false}
      prefix={mode === "single" ? "" : "Column"}
      placeholder={placeholder || "select column"}
      value={selectedColumn}
      maxTagCount={0}
      onChange={handleChange}
      options={modifiedOptions}
      popupClassName={"popupClassName"}
      placement={"bottomRight"}
    />
  );
};
export default ColumnDropdown;
