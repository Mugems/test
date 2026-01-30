import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, notification, Grid, List, Image, Dropdown, Menu, Modal, Tag, Divider, Skeleton, Select, Popconfirm } from "antd";
import Table from "../../../components/Common/Table";
import { GET, DELETE, POST } from "helpers/api_helper";
import { AREA, COLUMNCHANGE, SELECTEDCOLUMN } from "helpers/url_helper";
import Loader from "components/Common/Loader";
import SwipeablePanel from "components/Common/SwipeablePanel";
import { EllipsisOutlined, SearchOutlined, ReloadOutlined, PlusOutlined, DeleteFilled, ExclamationCircleOutlined, SwapOutlined } from "@ant-design/icons";
import AreaCollapseContent from "components/Common/AreaCollapseContent";
import { Switch, FloatButton } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import areaIcon from "../../../assets/icons/map.png";
import "./ViewArea.css";

let header = [
  {
    label: "S.No",
    value: "index",
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

const ViewArea = () => {
  const navigate = useNavigate();
  const [reOrder, setReorder] = useState(false);
  const [rowReorderred, setRowReorderred] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [order, setOrder] = useState({});
  const [tableHeader, setTableHeader] = useState(header);
  const [tableLoader, setTableLoader] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [reorderLoader, setReorderLoader] = useState(false);
  const [filterOption, setFilterOption] = useState({});
  const [selectedColumn, setSelectedColumn] = useState([]);
  const [isDragMode, setIsDragMode] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [originalData, setOriginalData] = useState([]);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [expandedLines, setExpandedLines] = useState([]);
  const [expandedAreas, setExpandedAreas] = useState({});
  const [openSwipeId, setOpenSwipeId] = useState(null);
  const [selectedBranchFromStorage, setSelectedBranchFromStorage] = useState(null);
  const [areasPagination, setAreasPagination] = useState({});
  const [lineSelectionModalVisible, setLineSelectionModalVisible] = useState(false);
  const [tempSelectedLine, setTempSelectedLine] = useState(null);
  const AREAS_PAGE_SIZE = 10;
const MAX_VISIBLE_ITEMS = 8;
const ITEM_HEIGHT = 20; 

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const uniqueLines = useMemo(() => {
    const storedBranchName = localStorage.getItem("selected_branch_name");
    const filteredData = originalData.filter(
      (item) => item.branch_name === storedBranchName
    );
    const lines = new Set(filteredData.map((item) => item.line_name));
    return Array.from(lines).sort().map(lineName => ({
      label: lineName,
      value: lineName
    }));
  }, [originalData]);

  useEffect(() => {
    const storedBranchName = localStorage.getItem("selected_branch_name");
    const accessToken = localStorage.getItem("access_token");

    setSelectedBranchFromStorage(storedBranchName);

    if (storedBranchName) {
      getSelectedColumn();
    }

    if (storedBranchName && accessToken) {
      getAreaList();
    } else {
      setTimeout(() => {
        const retryToken = localStorage.getItem("access_token");
        if (storedBranchName && retryToken) {
          getAreaList();
        }
      }, 300);
    }
  }, []);

  const groupAreasByLine = (data) => {
    const grouped = {};
    data.forEach((area) => {
      const lineName = area.line_name || "Uncategorized";
      if (!grouped[lineName]) {
        grouped[lineName] = [];
      }
      grouped[lineName].push(area);
    });
    return grouped;
  };

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

  const handleReset = () => {
    const storedBranchName = localStorage.getItem("selected_branch_name");
    const branchFilteredData = storedBranchName 
      ? originalData.filter(item => item.branch_name === storedBranchName)
      : originalData;
    
    const grouped = groupAreasByLine(branchFilteredData);
    const newPagination = {};
    Object.keys(grouped).forEach(lineName => {
      newPagination[lineName] = {
        displayed: Math.min(AREAS_PAGE_SIZE, grouped[lineName].length),
        total: grouped[lineName].length
      };
    });

    setTableData(branchFilteredData);
    setGroupedData(grouped);
    setAreasPagination(newPagination);
    setShowReset(false);
    setSelectedLine(null);
    setSearchText("");
  };

  const SumbitReorder = async () => {
    try {
      if (!selectedLine) {
        notification.error({
          message: "Error",
          description: "No line selected for reordering.",
        });
        return;
      }

      setReorderLoader(true);

      const reorderedData = Object.keys(order)?.length > 0 ? sortData(order) : tableData;
      const lineOriginalAreas = originalData.filter(item => item.line_name === selectedLine);
      const lineOriginalAreaIds = new Set(lineOriginalAreas.map(item => item.id));
      const reorderedLineAreas = reorderedData.filter(item => lineOriginalAreaIds.has(item.id));

      const apiPayload = reorderedLineAreas.map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      const response = await POST(`${AREA}reorder/`, apiPayload);

      if (response?.status === 200) {
        const updatedOriginalData = originalData.filter(item => item.line_name !== selectedLine);
        const finalOriginalData = [...updatedOriginalData, ...reorderedLineAreas];

        const storedBranchName = localStorage.getItem("selected_branch_name");
        let finalData = finalOriginalData.filter(
          (item) => item.branch_name === storedBranchName
        );

        setOriginalData(finalOriginalData);
        setTableData(finalData);
        const grouped = groupAreasByLine(finalData);
        setGroupedData(grouped);

        const newPagination = {};
        Object.keys(grouped).forEach(lineName => {
          newPagination[lineName] = {
            displayed: Math.min(AREAS_PAGE_SIZE, grouped[lineName].length),
            total: grouped[lineName].length
          };
        });
        setAreasPagination(newPagination);

        setReorder(false);
        setRowReorderred(false);
        const filtered = header.filter(
          (item) => !["move", "order"].includes(item.value)
        );
        setTableHeader(filtered);
        setOrder({});
        setSelectedLine(null);
        setShowReset(false);
        setSearchText("");
        setIsDragMode(false);
        setTempSelectedLine(null);

        notification.success({
          message: "Re-Ordered",
          description: `The order for line "${selectedLine}" has been updated successfully.`,
          duration: 0,
        });
      } else {
        notification.error({
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

  const handleLineSelectionForReorder = (lineName) => {
    const storedBranchName = localStorage.getItem("selected_branch_name");
    const filteredData = originalData.filter(
      (item) => item.branch_name === storedBranchName && item.line_name === lineName
    );

    if (filteredData.length === 0) {
      notification.warning({
        message: "No Areas Found",
        description: `No areas available for line "${lineName}".`,
      });
      setSelectedLine(null);
      setLineSelectionModalVisible(false);
      setTempSelectedLine(null);
      return;
    }

    setSelectedLine(lineName);
    setTableData(filteredData);

    setTableHeader((prev) => {
      const baseHeaders = prev.filter(item => !["move", "order"].includes(item.value));
      return [
        { label: "Move", value: "move" },
        { label: "Order", value: "order" },
        ...baseHeaders,
      ];
    });

    setReorder(true);
    setShowReset(false);
    setSearchText("");
    setIsDragMode(false);
    setOrder({});
    setLineSelectionModalVisible(false);
  };

  const clickReorder = () => {
    const storedBranchName = localStorage.getItem("selected_branch_name");

    if (!storedBranchName) {
      notification.warning({
        message: "No Branch Selected",
        description: "Please select a branch from settings.",
      });
      return;
    }

    const filteredData = originalData.filter(
      (item) => item.branch_name === storedBranchName
    );

    if (filteredData.length === 0) {
      notification.warning({
        message: "No Areas Found",
        description: `No areas available for ${storedBranchName} branch.`,
      });
      return;
    }

    const lines = uniqueLines.map(line => line.value);

    if (lines.length > 1) {
      setLineSelectionModalVisible(true);
      setTempSelectedLine(null);
    } else if (lines.length === 1) {
      handleLineSelectionForReorder(lines[0]);
    } else {
      notification.warning({
        message: "No Lines Found",
        description: `No lines available for the current branch.`,
      });
    }
  };

  const handleCancel = () => {
    const filtered = header.filter(
      (item) => !["move", "order"].includes(item.value)
    );
    setIsDragMode(false);
    setTableHeader(filtered);
    setReorder(false);
    setSelectedLine(null);
    setTempSelectedLine(null);

    const storedBranchName = localStorage.getItem("selected_branch_name");
    if (storedBranchName) {
      const filteredData = originalData.filter(
        (item) => item.branch_name === storedBranchName
      );
      setTableData(filteredData);
      const grouped = groupAreasByLine(filteredData);
      setGroupedData(grouped);

      Object.keys(grouped).forEach(lineName => {
        initializeLinePagination(lineName, grouped[lineName].length);
      });
    } else {
      setTableData(originalData);
      setGroupedData(groupAreasByLine(originalData));
    }

    setSearchText("");
    setShowReset(false);
  };

  const getAreaList = async () => {
    try {
      setTableLoader(true);
      const response = await GET(AREA);
      if (response?.status === 200) {
        const storedBranchName = localStorage.getItem("selected_branch_name");

        setOriginalData(response.data);

        const displayData = storedBranchName ? response.data.filter(
          (item) => item.branch_name === storedBranchName
        ) : response.data;

        setTableData(displayData);
        const grouped = groupAreasByLine(displayData);
        setGroupedData(grouped);

        Object.keys(grouped).forEach(lineName => {
          initializeLinePagination(lineName, grouped[lineName].length);
        });

        const filterCol = ["line_name", "areaName"];
        const uniqueOptions = {};
        filterCol.forEach((col) => {
          uniqueOptions[col] = new Set();
        });

        displayData.forEach((item) => {
          filterCol.forEach((col) => {
            uniqueOptions[col].add(item[col]);
          });
        });

        filterCol.forEach((col) => {
          setFilterOption((prev) => ({
            ...prev,
            [col]: Array.from(uniqueOptions[col]).map((value) => ({
              text: value,
              value: value,
            })),
          }));
        });

        if (storedBranchName) {
          const uniqueLines = [...new Set(displayData.map((item) => item.line_name))];
          setExpandedLines(uniqueLines);
        }
      } else {
        setTableData([]);
        setOriginalData([]);
        setGroupedData({});
      }
    } catch (error) {
      setTableData([]);
      setOriginalData([]);
      setGroupedData({});
    } finally {
      setTableLoader(false);
    }
  };

  const initializeLinePagination = (lineName, totalAreas) => {
    setAreasPagination(prev => ({
      ...prev,
      [lineName]: {
        displayed: Math.min(AREAS_PAGE_SIZE, totalAreas),
        total: totalAreas
      }
    }));
  };

  const loadMoreAreas = (lineName) => {
    setAreasPagination(prev => {
      const current = prev[lineName] || { displayed: 0, total: 0 };
      return {
        ...prev,
        [lineName]: {
          ...current,
          displayed: Math.min(current.displayed + AREAS_PAGE_SIZE, current.total)
        }
      };
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

  const onDelete = async (record) => {
    try {
      setDeleteLoader(true);
      const response = await DELETE(`${AREA}${record.id}/`);
      if (response?.status === 200) {
        const updatedData = tableData.filter((item) => item.id !== record.id);
        setTableData(updatedData);
        setGroupedData(groupAreasByLine(updatedData));
        notification.success({
          message: `${record?.areaName.toUpperCase()} Area Deleted!`,
          description: "The area has been deleted successfully",
          duration: 0,
        });
      } else {
        notification.error({
          message: "Area Delete",
          description: "The area is not deleted",
          duration: 0,
        });
      }
      setDeleteLoader(false);
      setShowConfirm(false);
    } catch (error) {
      setDeleteLoader(false);
      setShowConfirm(false);
      notification.error({
        message: "Area Deleted",
        description: "The area is not deleted",
        duration: 0,
      });
    }
  };

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
      if (res.status === 200) {
        setSelectedColumn(res?.data?.area || []);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleAreaAction = (lineName, areaId) => {
    const key = `${lineName}-${areaId}`;
    setOpenSwipeId(null);
    setExpandedAreas((prev) => {
      const newState = {
        [key]: !prev[key]
      };

      if (newState[key]) {
        setTimeout(() => {
          const element = document.getElementById(`area-item-${areaId}`);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }
        }, 100);
      }

      return newState;
    });
  };

  const handleSwipeStateChange = (areaId, isOpen) => {
    if (isOpen) {
      setOpenSwipeId(areaId);
    } else if (openSwipeId === areaId) {
      setOpenSwipeId(null);
    }
  };

  const handleSearch = () => {
    const query = searchText.trim().toLowerCase();
    const storedBranchName = localStorage.getItem("selected_branch_name");

    const branchFilteredData = storedBranchName 
      ? originalData.filter(item => item.branch_name === storedBranchName)
      : originalData;

    if (!query) {
      setTableData(branchFilteredData);
      const grouped = groupAreasByLine(branchFilteredData);
      setGroupedData(grouped);

      Object.keys(grouped).forEach(lineName => {
        initializeLinePagination(lineName, grouped[lineName].length);
      });

      setSearchModalVisible(false);
      setShowReset(false);
      notification.info({
        message: "Reset Search",
        description: "Showing all areas again.",
      });
      return;
    }

    const filtered = branchFilteredData.filter((item) => {
      const areaName = (item.areaName || "").toLowerCase();
      return areaName.includes(query)
    });

    setTableData(filtered);
    const grouped = groupAreasByLine(filtered);
    setGroupedData(grouped);

    Object.keys(grouped).forEach(lineName => {
      initializeLinePagination(lineName, grouped[lineName].length);
    });

    setSearchModalVisible(false);
    setShowReset(true);

    if (filtered.length === 0) {
      notification.warning({
        message: "No Results",
        description: `No matches found for "${searchText}".`,
      });
    } else {
      notification.success({
        message: "Search Complete",
        description: `${filtered.length} result(s) found for "${searchText}".`,
      });
    }
  };

  const searchModal = (
    <Modal
      title={<div className="view-area-search-modal-title">Search Area</div>}
      open={searchModalVisible}
      onOk={handleSearch}
      onCancel={() => setSearchModalVisible(false)}
      okText="Search"
    >
      <p className="view-area-search-modal-label">Area Name</p>
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Enter area name to search"
        className="view-area-search-input"
      />
    </Modal>
  );

  const lineSelectionModal = (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          Select Line
        </div>
      }
      open={lineSelectionModalVisible}
      onCancel={() => setLineSelectionModalVisible(false)}
      footer={[
        <Button key="back" onClick={() => {
          setTempSelectedLine(null);
          setLineSelectionModalVisible(false);
        }}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!tempSelectedLine}
          onClick={() => handleLineSelectionForReorder(tempSelectedLine)}
        >
          Reorder
        </Button>,
      ]}
    >
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="line-select" style={{ fontWeight: '400', display: 'block', marginBottom: '5px' }}>
          Select Line Name
        </label>
        <Select
          id="line-select"
          placeholder="Select a line"
          style={{ width: '100%' }}
          onChange={setTempSelectedLine}
          value={tempSelectedLine}
          options={uniqueLines}
          allowClear
        />
      </div>
    </Modal>
  );

  const handleEditArea = (area) => navigate(`/area/edit/${area.id}`);

  return (
    <div className="view-area-page-content">
     <div className="view-area-header-container">
  {reOrder ? (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="view-area-title">Reorder Area</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="view-area-switch-label">Slide</span>
          <Switch
            checked={isDragMode}
            onChange={(checked) => setIsDragMode(checked)}
          />
        </div>
      </div>
      <div style={{ marginTop: '8px',marginBottom: '10px' ,display: 'flex',justifyContent: 'center'}}>
       
        <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
          Line : {selectedLine}
        </Tag>
      </div>
    </div>
  ) : (
    <>
      <h2 className="view-area-title">Area List</h2>
      <div className="view-area-actions">
        <Button
          icon={<SwapOutlined rotate={90}/>}
          onClick={clickReorder}
          disabled={reOrder || tableLoader}
          className="view-area-reorder-button"
          type="default"
        >
          {!isMobile && "Reorder"}
        </Button>
        
        <Button
          icon={<SearchOutlined />}
          onClick={() => setSearchModalVisible(true)}
          type="default"
        >
          {!isMobile && "Search Area"}
        </Button>
        {showReset && (
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            title="Reset to Original"
          />
        )}
      </div>
    </>
  )}
</div>
      {searchModal}
      {lineSelectionModal}

      {tableLoader && <Loader />}

      {reOrder ? (
        <div>
          <Table
            data={tableData}
            reOrder={isDragMode}
            Header={
              isDragMode
                ? [
                  { label: "S.No", value: "index" },
                  { label: "Area Name", value: "areaName" },
                  { label: "Move", value: "move" },
                ]
                : [
                  { label: "S.No", value: "index" },
                  { label: "Reorder", value: "order" },
                  { label: "Area Name", value: "areaName" },
                ]
            }
            filterOption={filterOption}
            handleDragEnd={isDragMode ? handleDragEnd : undefined}
            handleReOrder={!isDragMode ? handleReOrder : undefined}
            deleteLoader={deleteLoader}
            setShowConfirm={setShowConfirm}
            showConfirm={showConfirm}
            name="area"
          />

          <div className="view-area-table-actions">
            <Button
              type="primary"
              onClick={SumbitReorder}
              loading={reorderLoader}
              disabled={reorderLoader || !rowReorderred}
            >
              Submit
            </Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div id="scrollableDiv" className="view-area-scrollable-div">
          {showReset && searchText && (
            <div className="view-area-search-results">
              <span className="view-area-search-label">
                <Tag color="blue" style={{ fontSize: 14, padding: "2px 8px" }}>
                  Area = "{searchText}"
                </Tag>
              </span>
            </div>
          )}

         {Object.keys(groupedData).map((lineName, lineGroupIndex) => {
  const allLineNames = Object.keys(groupedData);
  const isLastLineGroup = lineGroupIndex === allLineNames.length - 1;

  const currentLineData = groupedData[lineName];
  const lastArea = currentLineData[currentLineData.length - 1];

  const isLastAreaExpanded = lastArea
    ? expandedAreas[`${lineName}-${lastArea.id}`]
    : false;

  // Count expanded areas in this line
  const expandedCount = currentLineData.filter(
    (area) => expandedAreas[`${lineName}-${area.id}`]
  ).length;

  // Remaining slots to reach 8
  const remainingSlots = Math.max(
    MAX_VISIBLE_ITEMS - expandedCount,
    0
  );

  const shouldAddPadding =
    isLastLineGroup && isLastAreaExpanded;

  const paddingBottom = shouldAddPadding
    ? remainingSlots * ITEM_HEIGHT
    : 0;
            
            return (
              <div
                key={lineName}
                className="view-area-line-group"
                style={{paddingBottom}}
              >
                <div className="view-area-line-header">
                  <div className="view-area-line-title-container">
                    <Image preview={false} src={areaIcon} width={30} height={30} />
                    <span className="view-area-line-title">{lineName}</span>
                  </div>
                  <div className={showReset ? "view-area-badge view-area-badge-search" : "view-area-badge"}>
                    {groupedData[lineName].length}
                  </div>
                </div>

                <div id={'scrollableDiv-' + lineName} className="view-area-list-container">
                  <InfiniteScroll
                    dataLength={areasPagination[lineName]?.displayed || AREAS_PAGE_SIZE}
                    next={() => loadMoreAreas(lineName)}
                    hasMore={
                      (areasPagination[lineName]?.displayed || 0) <
                      (areasPagination[lineName]?.total || 0)
                    }
                    loader={
                      <div className="view-area-skeleton-container">
                        <Skeleton avatar paragraph={{ rows: 1 }} active />
                      </div>
                    }
                    endMessage={
                      <Divider plain className="view-area-divider-container">
                        <span className="view-area-divider-star">★ </span>
                        <span className="view-area-divider-text">
                          End of{" "}
                          <span className="view-area-divider-line-name">{lineName}</span> line{" "}
                          <span className="view-area-divider-star">★</span>
                        </span>
                      </Divider>
                    }
                    scrollableTarget={'scrollableDiv-' + lineName}
                  >
                    <List
                      dataSource={
                        groupedData[lineName].slice(
                          0,
                          areasPagination[lineName]?.displayed || AREAS_PAGE_SIZE
                        )
                      }
                      className="view-area-list"
                      renderItem={(area, index) => {
                        const isExpanded = expandedAreas[lineName + '-' + area.id];
                        const lineIndex = index + 1;

                        return (
                          <div
                            key={area.id}
                            id={'area-item-' + area.id}
                            className="view-area-list-item-wrapper"
                          >
                            {isMobile ? (
                              <SwipeablePanel
                                item={{ ...area, lineIndex }}
                                index={area.id}
                                titleKey="areaName"
                                name="area"
                                avatarSrc={areaIcon}
                                onSwipeRight={!isExpanded ? () => handleEditArea(area) : undefined}
                                onSwipeLeft={!isExpanded ? () => onDelete(area) : undefined}
                                isExpanded={isExpanded}
                                onExpandToggle={() => handleAreaAction(lineName, area.id)}
                                renderContent={() => (
                                  isExpanded ? (
                                    <AreaCollapseContent area={area} />
                                  ) : null
                                )}
                                isSwipeOpen={openSwipeId === area.id}
                                onSwipeStateChange={(isOpen) => handleSwipeStateChange(area.id, isOpen)}
                              />
                            ) : (
                              <>
                                <List.Item
                                  className={isExpanded ? "view-area-list-item view-area-list-item-expanded" : "view-area-list-item"}
                                >
                                  <List.Item.Meta
                                    avatar={
                                      <div className="view-area-avatar-container">
                                        <span className="view-area-index-badge">{lineIndex}</span>
                                      </div>
                                    }
                                    title={
                                      <div
                                        onClick={() => handleAreaAction(lineName, area.id)}
                                        className="view-area-item-title-container"
                                      >
                                        <span className="view-area-item-title">
                                          {area.areaName}
                                        </span>
                                        <Dropdown
                                          overlay={
                                            <Menu>
                                              <Menu.Item
                                                key="edit"
                                                onClick={(e) => {
                                                  e.domEvent.stopPropagation();
                                                  handleEditArea(area);
                                                }}
                                              >
                                                <div className="d-flex align-items-center gap-1">
                                                  <span className="mdi mdi-pencil text-secondary mb-0"></span>
                                                  <span>Edit</span>
                                                </div>
                                              </Menu.Item>
                                              <Menu.Item key="delete">
                                                <Popconfirm
                                                  // **Customize the title for the Area context**
                                                  title={`Delete area ${area.area_name || 'this area'}?`}
                                                  description="Are you sure you want to delete this area permanently?"
                                                  icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
                                                  onConfirm={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(area); // Calls onDelete only after user confirms
                                                  }}
                                                  okText="Delete"
                                                  cancelText="Cancel"
                                                  okButtonProps={{ danger: true, type: "primary" }}
                                                  cancelButtonProps={{ type: "default" }}
                                                  onClick={(e) => e.stopPropagation()} // Prevents the dropdown from closing early
                                                >
                                                  <div className="d-flex align-items-center gap-1" style={{ color: "red" }}>
                                                    {/* Assuming you have the DeleteFilled icon imported from antd/icons */}
                                                    <DeleteFilled style={{ color: "red" }} />
                                                    <span>Delete</span>
                                                  </div>
                                                </Popconfirm>
                                              </Menu.Item>
                                            </Menu>
                                          }
                                          trigger={["click"]}
                                        >
                                          <EllipsisOutlined
                                            className="view-area-ellipsis-icon"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </Dropdown>
                                      </div>
                                    }
                                  />
                                </List.Item>

                                {isExpanded && (
                                  <div className="view-area-collapse-content">
                                    <AreaCollapseContent area={area} />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      }}
                    />
                  </InfiniteScroll>
                </div>
              </div>
            );
          })}

          {Object.keys(groupedData).length === 0 && !tableLoader && (
            <div className="view-area-no-data">
              <p>No areas found {showReset && searchText ? 'for "' + searchText + '"' : "for the selected branch"}</p>
            </div>
          )}
        </div>
      )}

      {!reOrder && (
        <FloatButton
          icon={<PlusOutlined />}
          type="primary"
          tooltip={<div>Add New Area</div>}
          onClick={() => navigate("/area/add")}
          className="view-area-float-button"
        />
      )}
    </div>
  );
};

export default ViewArea;