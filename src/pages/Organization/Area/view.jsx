import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Flex, notification, Grid } from "antd";
import Table from "../../../components/Common/Table";
import { GET, DELETE, POST } from "helpers/api_helper";
import { AREA, SEARCH, COLUMNCHANGE, SELECTEDCOLUMN } from "helpers/url_helper";
import Loader from "components/Common/Loader";
import ColumnDropdown from "../../../components/Common/ColumnDropdown";
import CommonSearch from "components/Common/Search";
import { debounce } from "lodash";
let header = [
  {
    label: "S.No",
    value: "index",
  },
  {
    label: "Branch Name",
    value: "branch_name",
    sort: true,
    filter: true,
    filterSearch: true,
  },
  {
    label: "Line Name",
    value: "line_name",
    sort: true,
    filter: true,
    filterSearch: true,
  },
  {
    label: "Area Name",
    value: "areaName",
    sort: true,
    filter: true,
    filterSearch: true,
  },
  { label: "Actions", value: "actions" },
];

const hiddenColumns = ["move", "order", "actions", "index"];

const ViewArea = () => {
  const navigate = useNavigate();
  const [reOrder, setReorder] = useState(false);
  const [rowReorderred, setRowReorderred] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [order, setOrder] = useState({});
  const [tableHeader, setTableHeader] = useState(header);
  const [api, contextHolder] = notification.useNotification();
  const [tableLoader, setTableLoader] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [reorderLoader, setReorderLoader] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState([]);
  const [filterOption, setFilterOption] = useState({});

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    getSelectedColumn();
    getAreaList();
  }, []);

  const sortData = (order) => {
    if (Object.keys(order).length > 0) {
      const reorderedData = [...tableData];
      Object.keys(order).forEach((value) => {
        const index = reorderedData.findIndex(
          (item) => item.id === parseInt(value)
        );
        if (index !== -1) {
          const [movedItem] = reorderedData.splice(index, 1);
          reorderedData.splice(order[value] - 1, 0, movedItem);
        }
      });

      return reorderedData;
    }
  };

  const SumbitReorder = async () => {
    try {
      setReorderLoader(true);
      const reorderedData =
        Object.keys(order)?.length > 0 ? sortData(order) : tableData;
      const response = await POST(`${AREA}reorder/`, reorderedData);
      if (response?.status === 200) {
        setTableData(reorderedData);
        setReorder(false);
        setRowReorderred(false);
        const filtered = header.filter(
          (item) => !["move", "order"].includes(item.value)
        );
        setTableHeader(filtered);
        setOrder({});
        api.success({
          message: "Re-Ordered",
          description: "The order has been updated successfully. ",
          duration: 0,
        });
      } else {
        api.error({
          message: "Re-Ordered",
          description: "Failed to update the order",
          duration: 0,
        });
      }
      setReorderLoader(false);
    } catch (e) {
      setReorderLoader(false);
      notification.error({
        message: "Error",
        description: "Failed to update the order",
      });
    }
  };

  const getAreaList = async () => {
    try {
      setTableLoader(true);
      const response = await GET(AREA);
      if (response?.status === 200) {
        setTableData(response.data);
        const filterCol = ["branch", "line_name"];
        const uniqueOptions = {};
        filterCol.forEach((col) => {
          uniqueOptions[col] = new Set();
        });
        response.data.forEach((item) => {
          filterCol.forEach((col) => {
            uniqueOptions[col].add(item[col]);
          });
        });
        filterCol.forEach((col) => {
          setFilterOption((prev) => {
            return {
              ...prev,
              [col]: Array.from(uniqueOptions[col]).map((value) => ({
                text: value,
                value: value,
                labe: value,
              })),
            };
          });
        });
      } else {
        setTableData([]);
      }
      setTableLoader(false);
    } catch (error) {
      setTableLoader(false);
      setTableData([]);
    }
  };

  const clickReorder = () => {
    setReorder(true);
    setTableHeader((prev) => {
      return [
        { label: "Move", value: "move" },
        { label: "Order", value: "order" },
        ...prev,
      ];
    });
  };

  const handleReOrder = (event, row) => {
    event.preventDefault();
    setRowReorderred(true);
    setOrder((prev) => ({ ...prev, [row.id]: event.target.value }));
  };

  const handleDragEnd = (data) => {
    setTableData(data);
    setRowReorderred(true);
  };

  const handleCancel = () => {
    const filtered = header.filter(
      (item) => !["move", "order"].includes(item.value)
    );
    setTableHeader(filtered);
    setReorder(false);
  };

  const onDelete = async (record) => {
    try {
      setDeleteLoader(true);
      const response = await DELETE(`${AREA}${record.id}/`);
      if (response?.status !== 200) {
        api.error({
          message: "Area Delete",
          description: "The Area is not deleted ",
          duration: 0,
        });
      } else {
        const updatedData = tableData.filter((item) => item.id !== record.id);
        setTableData(updatedData);
        api.success({
          message: `${record?.areaName.toUpperCase()} Area Deleted!`,
          description: "The line has been deleted successfully ",
          duration: 0,
        });
      }
      setDeleteLoader(false);
      setShowConfirm(false);
    } catch (error) {
      setDeleteLoader(false);
      setShowConfirm(false);
      api.success({
        message: "Area Deleted",
        description: "The Area is not deleted ",
        duration: 0,
      });
    }
  };
  const debouncedSearch = debounce(async (searchedvalue) => {
    setTableLoader(true);
    try {
      const response = await GET(
        `${SEARCH}?module=line&&searchText=${searchedvalue}`
      );
      if (response?.status === 200) {
        setTableLoader(false);
        setTableData(response?.data);
      } else {
        setTableLoader(false);
        api.error({
          message: "Error",
          description: "No Area Found",
        });
      }
    } catch (error) {
      setTableLoader(false);
      throw error;
    }
  }, 700);

  const handleColumnChange = async (value) => {
    try {
      const res = await POST(COLUMNCHANGE, {
        entity: "area",
        columns: value,
      });
      setSelectedColumn(value);
      if (res.status === 200) {
        getAreaList();
      }
    } catch (error) {
      throw error;
    }
  };

  const getSelectedColumn = async () => {
    try {
      const res = await GET(SELECTEDCOLUMN);
      if (res?.status === 200) {
        setSelectedColumn(res?.data?.area || []);
      }
    } catch (error) {
      throw error;
    }
  };

  // const handleeOrder = (value) => {
  //   setSelectedLine(value);
  //   //Need to add filter logic here
  // };

  return (
    <div className="page-content">
      {tableLoader && <Loader />}
      {contextHolder}
      <Flex justify="space-between" wrap="wrap">
        <Flex gap="middle" wrap="wrap">
          <Button
            className="mb-3 d-flex align-items-center"
            type="primary"
            onClick={clickReorder}
            disabled={reOrder}
          >
            Re-Order
          </Button>
{/* 
          <ColumnDropdown
            options={filterOption?.areaName || []}
            onChange={handlereOrder}
            selectedColumn={selectedLine}
            mode={"single"}
            placeholder={"Select Reorder Area"}
          /> */}

          {rowReorderred && (
            <Button
              className="mb-3 d-flex align-items-center"
              type="primary"
              onClick={SumbitReorder}
              loading={reorderLoader}
              disabled={reorderLoader}
            >
              Submit
            </Button>
          )}

          {reOrder && (
            <Button
              className="mb-3 d-flex align-items-center"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
        </Flex>
        <Flex>
          <CommonSearch
            placeholder="Search by Area Name"
            size="medium"
            allowClear
            onSearch={debouncedSearch}
            loading={tableLoader}
            onEmptySearch={getAreaList}
          />
        </Flex>

        <Flex gap="middle">
          {!isMobile && (
            <ColumnDropdown
              options={header.filter(
                (list) => !hiddenColumns.includes(list?.value)
              )}
              onChange={handleColumnChange}
              name={"line_column"}
              selectedColumn={selectedColumn}
            />
          )}
          <Button
            className="mb-3 d-flex align-items-center"
            type="primary"
            onClick={() => navigate("/area/add")}
          >
            <span className="mdi mdi-plus" />
            Add Area
          </Button>
        </Flex>
      </Flex>

      <Table
        data={tableData}
        reOrder={reOrder}
        Header={tableHeader.filter(
          (list) =>
            selectedColumn.includes(list.value) ||
            hiddenColumns.includes(list.value)
        )}
        filterOption={filterOption}
        handleReOrder={handleReOrder}
        handleDragEnd={handleDragEnd}
        onDelete={onDelete}
        deleteLoader={deleteLoader}
        setShowConfirm={setShowConfirm}
        showConfirm={showConfirm}
        name={"area"}
      />
    </div>
  );
};

export default ViewArea;
