import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, notification, Grid, List, Image, Dropdown, Menu, Modal,
  Badge, Divider, Skeleton, FloatButton, Select, Radio, DatePicker, Popconfirm, Tag, Tooltip
} from "antd";
import { DELETE, GET } from "helpers/api_helper";
import { INVESTMENT } from "helpers/url_helper";
import Loader from "components/Common/Loader";
import SwipeablePanel from "components/Common/SwipeablePanel";
import { EllipsisOutlined, SearchOutlined, ReloadOutlined, PlusOutlined, DeleteFilled, ExclamationCircleOutlined } from "@ant-design/icons";
import InfiniteScroll from "react-infinite-scroll-component";
import lineIcon from "../../../assets/icons/profits (1).png";
import dayjs from 'dayjs';
import "./InvestmentList.css";

import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import InvestmentCollapseContent from "components/Common/InvestmentCollapseContent";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Option } = Select;

const InvestmentList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [originalData, setOriginalData] = useState([]);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [expandedInvestments, setExpandedInvestments] = useState({});
  const [expandedLines, setExpandedLines] = useState({});
  const [openSwipeId, setOpenSwipeId] = useState(null);
  const [selectedBranchFromStorage, setSelectedBranchFromStorage] = useState(null);
  const [selectedBranchIdFromStorage, setSelectedBranchIdFromStorage] = useState(null);
  const [investmentsPagination, setInvestmentsPagination] = useState({});
  const [firstLoad, setFirstLoad] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [lineList, setLineList] = useState([]);
  const [lineLoader, setLineLoader] = useState(false);

  const [selectedLines, setSelectedLines] = useState([]);
  const [dateFilterType, setDateFilterType] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [dateError, setDateError] = useState("");
  const [lineDropdownOpen, setLineDropdownOpen] = useState(false);

  const INVESTMENTS_PAGE_SIZE = 10;
  const today = dayjs().format('YYYY-MM-DD');
  const ALL_LINES_VALUE = "__ALL_LINES__";

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    const storedBranchName = localStorage.getItem("selected_branch_name");
    const storedBranchId = localStorage.getItem("selected_branch_id");
    const accessToken = localStorage.getItem("access_token");

    setSelectedBranchFromStorage(storedBranchName);
    setSelectedBranchIdFromStorage(storedBranchId);

    const fetchData = async () => {
      if (storedBranchId && accessToken) {
        await Promise.all([getInvestmentList(), getLineList()]);
      } else {
        setTimeout(async () => {
          const retryToken = localStorage.getItem("access_token");
          const retryBranchId = localStorage.getItem("selected_branch_id");
          if (retryBranchId && retryToken) {
            await Promise.all([getInvestmentList(), getLineList()]);
          }
        }, 300);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (firstLoad && !loading && originalData.length > 0) {
      setSearchModalVisible(true);
      setFirstLoad(false);
    }
  }, [firstLoad, loading, originalData]);

  const getLineList = async () => {
    try {
      setLineLoader(true);
      const storedBranchId = localStorage.getItem("selected_branch_id");
      
      if (!storedBranchId) {
        notification.warning({
          message: "No Branch Selected",
          description: "Please select a branch to load line data",
        });
        setLineLoader(false);
        return [];
      }

      const response = await GET("api/line_dd");
      if (response?.status === 200) {
        // Filter lines based on selected branch ID
        const filteredLines = response.data.filter(
          (item) => item.branch_id === parseInt(storedBranchId)
        );
        setLineList(filteredLines || []);
        setLineLoader(false);
        return filteredLines;
      } else {
        setLineList([]);
        setLineLoader(false);
        return [];
      }
    } catch (error) {
      setLineList([]);
      setLineLoader(false);
      notification.error({
        message: "Failed to fetch line data",
        description: "An error occurred while loading line data",
      });
      return [];
    }
  };

  const groupInvestmentsByLine = (data) => {
    const grouped = {};
    data.forEach((investment) => {
      const lineName = investment.line_name || "Uncategorized";
      if (!grouped[lineName]) {
        grouped[lineName] = [];
      }
      grouped[lineName].push(investment);
    });
    return grouped;
  };

  const getUniqueLines = () => {
    if (lineList.length === 0) {
      // Fallback to lines from investment data if LINE_DD fails
      const lines = [...new Set(originalData.map(inv => inv.line_name || "Uncategorized"))];
      return lines.sort();
    }

    // Get unique line names from the filtered lineList
    const uniqueLines = [...new Set(lineList.map(item => item.line_name || "Uncategorized"))];
    return uniqueLines.sort();
  };

  const handleLineSelection = (values) => {
    if (values.includes(ALL_LINES_VALUE)) {
      setSelectedLines([ALL_LINES_VALUE]);
    } else {
      setSelectedLines(values);
    }
  };

  const validateDateRange = (fromDate, toDate) => {
    if (!fromDate || !toDate) {
      setDateError("Please select both from and to dates");
      return false;
    }

    const from = dayjs(fromDate);
    const to = dayjs(toDate);
    const todayDate = dayjs(today);

    if (from.isAfter(to)) {
      setDateError("From date cannot be greater than to date");
      return false;
    }

    if (to.isAfter(todayDate)) {
      setDateError("To date cannot be greater than today");
      return false;
    }

    setDateError("");
    return true;
  };

  const handleDateChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);

    if (newDateRange.from && newDateRange.to) {
      validateDateRange(newDateRange.from, newDateRange.to);
    } else {
      setDateError("");
    }
  };

  const handleReset = () => {
    setInvestments([]);
    setGroupedData({});
    setInvestmentsPagination({});

    setShowReset(false);
    setSearchText("");
    setSelectedLines([]);
    setDateFilterType("all");
    setDateRange({ from: "", to: "" });
    setDateError("");
    setSearchCriteria(null);
    setHasSearched(false);

    notification.success({
      message: "Data Reset",
      description: "Please perform a new search to view investments.",
    });

    setTimeout(() => {
      setSearchModalVisible(true);
    }, 300);
  };

  const getInvestmentList = async () => {
    try {
      setLoading(true);
      const response = await GET(INVESTMENT);
      if (response?.status === 200) {
        const storedBranchId = localStorage.getItem("selected_branch_id");

        let filteredData = response.data;
        if (storedBranchId) {
          // Filter investments based on branch ID
          filteredData = response.data.filter(
            (item) => item.branch === parseInt(storedBranchId)
          );
        }

        setOriginalData(filteredData);
      } else {
        setOriginalData([]);
      }
    } catch (error) {
      setOriginalData([]);
      notification.error({
        message: "Error",
        description: "Failed to load investments",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeLinePagination = (lineName, totalInvestments) => {
    setInvestmentsPagination(prev => ({
      ...prev,
      [lineName]: {
        displayed: Math.min(INVESTMENTS_PAGE_SIZE, totalInvestments),
        total: totalInvestments
      }
    }));
  };

  const loadMoreInvestments = (lineName) => {
    setInvestmentsPagination(prev => {
      const current = prev[lineName] || { displayed: 0, total: 0 };
      return {
        ...prev,
        [lineName]: {
          ...current,
          displayed: Math.min(current.displayed + INVESTMENTS_PAGE_SIZE, current.total)
        }
      };
    });
  };

  const handleDelete = async (record) => {
    try {
      const response = await DELETE(`${INVESTMENT}${record.id}/`);
      if (response?.status === 204 || response?.status === 200) {
        const updatedData = investments.filter((item) => item.id !== record.id);
        const updatedOriginalData = originalData.filter((item) => item.id !== record.id);

        setInvestments(updatedData);
        setOriginalData(updatedOriginalData);
        setGroupedData(groupInvestmentsByLine(updatedData));

        notification.success({
          message: `${record.investment_title.toUpperCase()} Investment Deleted!`,
          description: "The investment has been deleted successfully",
        });
      } else {
        notification.error({
          message: "Investment Delete",
          description: "The investment was not deleted",
        });
      }
    } catch (error) {
      notification.error({
        message: "Investment Deleted",
        description: "The investment was not deleted",
      });
    }
  };

  const toggleLineExpansion = (lineName) => {
    setExpandedLines((prev) => ({
      ...prev,
      [lineName]: !prev[lineName]
    }));
  };

  const handleInvestmentAction = (lineName, investmentId) => {
    const key = `${lineName}-${investmentId}`;
    setOpenSwipeId(null);
    setExpandedInvestments((prev) => {
      const newState = {
        [key]: !prev[key]
      };

      if (newState[key]) {
        setTimeout(() => {
          const element = document.getElementById(`investment-item-${investmentId}`);
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

  const handleSwipeStateChange = (investmentId, isOpen) => {
    if (isOpen) {
      setOpenSwipeId(investmentId);
    } else if (openSwipeId === investmentId) {
      setOpenSwipeId(null);
    }
  };

  const handleSearch = () => {
    const isAllLinesSelected = selectedLines.includes(ALL_LINES_VALUE) || selectedLines.length === 0;
    const hasLineCriteria = !isAllLinesSelected && selectedLines.length > 0;
    const hasDateCriteria = dateFilterType === "range" && dateRange.from && dateRange.to;
    const hasTextCriteria = searchText.trim() !== "";

    if (!hasLineCriteria && !hasDateCriteria && !hasTextCriteria && !isAllLinesSelected) {
      notification.warning({
        message: "Search Required",
        description: "Please select at least one search criteria (line, date range, or investment title).",
      });
      return;
    }

    if (dateFilterType === "range" && (dateRange.from || dateRange.to)) {
      if (!validateDateRange(dateRange.from, dateRange.to)) {
        notification.error({
          message: "Invalid Date Range",
          description: dateError,
        });
        return;
      }
    }

    let filtered = [...originalData];

    if (hasLineCriteria) {
      filtered = filtered.filter(item =>
        selectedLines.includes(item.line_name || "Uncategorized")
      );
    }

    if (dateFilterType === "range" && dateRange.from && dateRange.to) {
      const fromDate = dayjs(dateRange.from).startOf('day');
      const toDate = dayjs(dateRange.to).endOf('day');

      filtered = filtered.filter(item => {
        const investmentDate = dayjs(item.created_time || item.investment_date);

        return (investmentDate.isAfter(fromDate) || investmentDate.isSame(fromDate)) &&
          (investmentDate.isBefore(toDate) || investmentDate.isSame(toDate));
      });
    }

    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      filtered = filtered.filter(item => {
        const investmentTitle = (item.investment_title || "").toLowerCase();
        return investmentTitle.includes(query);
      });
    }

    const criteria = {
      lines: isAllLinesSelected ? ["All Line"] : (hasLineCriteria ? selectedLines : null),
      dateType: dateFilterType,
      fromDate: dateRange.from ? dayjs(dateRange.from).format('DD-MMM-YYYY') : null,
      toDate: dateRange.to ? dayjs(dateRange.to).format('DD-MMM-YYYY') : null,
      searchText: searchText.trim() || null
    };

    setSearchCriteria(criteria);
    setInvestments(filtered);
    const grouped = groupInvestmentsByLine(filtered);
    setGroupedData(grouped);

    Object.keys(grouped).forEach(lineName => {
      initializeLinePagination(lineName, grouped[lineName].length);
    });

    setSearchModalVisible(false);
    setShowReset(true);
    setHasSearched(true);

    if (filtered.length === 0) {
      notification.warning({
        message: "No Results",
        description: "No investments found matching your search criteria.",
      });
    } else {
      const expandedLinesObj = {};
      Object.keys(grouped).forEach(lineName => {
        expandedLinesObj[lineName] = true;
      });
      setExpandedLines(expandedLinesObj);
    }
  };

  const getLineDisplay = (lines) => {
    if (!lines || lines.length === 0) return null;
    
    if (lines.includes("All Line")) {
      return <span>All Line</span>;
    }
    
    if (lines.length > 1) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{lines[0]}</span>
          <Tooltip 
            title={
              <div>
                <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>
                  All Selected Line ({lines.length}):
                </div>
                {lines.map((line, idx) => (
                  <div key={idx}>• {line}</div>
                ))}
              </div>
            }
            placement="bottom"
          >
            <Badge 
              count={`+${lines.length - 1}`} 
              style={{ 
                backgroundColor: '#1890ff',
                cursor: 'pointer',
                fontSize: '11px',
                boxShadow: '0 0 0 1px #fff'
              }} 
            />
          </Tooltip>
        </div>
      );
    }
    
    return <span>{lines[0]}</span>;
  };

  const searchModal = (
    <Modal
      title={<div className="investment-list-modal-title">Search Investment</div>}
      open={searchModalVisible}
      onOk={handleSearch}
      onCancel={hasSearched ? () => setSearchModalVisible(false) : undefined}
      okText="Search"
      cancelText="Cancel"
      cancelButtonProps={{ style: hasSearched ? {} : { display: 'none' } }}
      width={600}
      closable={hasSearched}
      maskClosable={hasSearched}
    >
      <div className="investment-list-modal-content">

      <div>
  <p className="investment-list-modal-label">Select Line:</p>
  <Select
    mode="multiple"
    value={selectedLines}
    onChange={handleLineSelection}
    style={{ width: "100%" }}
    placeholder="Select line"
    allowClear
    maxTagCount="responsive"
    loading={lineLoader}
    open={lineDropdownOpen}
    onDropdownVisibleChange={(open) => setLineDropdownOpen(open)}
    dropdownRender={(menu) => (
      <>
        {menu}
        <div style={{ 
          padding: '4px', 
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Button 
            style={{background: "#28a544",color: "white"}} 
            size="small"
            onClick={() => setLineDropdownOpen(false)}
          >
            Select Done ✓
          </Button>
        </div>
      </>
    )}
  >
    <Option key={ALL_LINES_VALUE} value={ALL_LINES_VALUE}>
      All Line
    </Option>
    {getUniqueLines().map(line => (
      <Option key={line} value={line}>{line}</Option>
    ))}
  </Select>
</div>

        <div>
          <p className="investment-list-modal-label">Date Filter:</p>
          <Radio.Group
            value={dateFilterType}
            onChange={(e) => {
              setDateFilterType(e.target.value);
              if (e.target.value === "all") {
                setDateRange({ from: "", to: "" });
                setDateError("");
              }
            }}
            style={{ marginBottom: 12 }}
          >
            <Radio value="all">Show All</Radio>
            <Radio value="range">Date Range</Radio>
          </Radio.Group>

          {dateFilterType === "range" && (
            <div className="investment-list-date-filter-container">
              <p className="investment-list-date-filter-label">
                Select date range:
              </p>
              <div className="investment-list-date-range-container">
                <input
                  type="date"
                  autoComplete="off"
                  onPaste={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  onDrop={(e) => e.preventDefault()}
                  value={dateRange.from}
                  onChange={(e) => handleDateChange("from", e.target.value)}
                  max={dateRange.to || today}
                  className="investment-list-date-input"
                />
                <span className="investment-list-date-separator">to</span>
                <input
                  type="date"
                  autoComplete="off"
                  onPaste={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  onDrop={(e) => e.preventDefault()}
                  value={dateRange.to}
                  onChange={(e) => handleDateChange("to", e.target.value)}
                  min={dateRange.from || undefined}
                  max={today}
                  className="investment-list-date-input"
                />
              </div>
              {dateError && (
                <p style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "8px" }}>
                  {dateError}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="investment-list-modal-label">Investment Title:</p>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Enter investment title to search"
            className="investment-list-search-input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
      </div>
    </Modal>
  );

  const handleEditInvestment = (investment) => navigate(`/investment/edit/${investment.id}`);

  return (
    <div className="investment-list-page-content">
      <div className="investment-list-header">
        <h2 className="investment-list-title">Investment List</h2>

        <div className="investment-list-actions">
          <Button
            icon={<SearchOutlined />}
            onClick={() => setSearchModalVisible(true)}
            type="default"
          >
            {!isMobile && "Search Criteria"}
          </Button>
          {showReset && (
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              title="Reset to Original"
            />
          )}
        </div>
      </div>
      {searchModal}

      {loading && <Loader />}
      {lineLoader && <Loader loadingText="Fetching line details..." />}

      {hasSearched && (
        <div
          id="scrollableDiv"
          className="investment-list-scrollable-div"
        >
          {showReset && searchCriteria && (
            <>
              <Divider style={{ margin: '5px 0' }} />
              
              <div className="investment-list-search-results">
                <div 
                  className="investment-list-search-results-content"
                  style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px',
                    alignItems: 'center',
                    padding: '8px 0'
                  }}
                >
                  {searchCriteria.lines && searchCriteria.lines.length > 0 && (
                    <Tag 
                      color="blue" 
                      style={{ 
                        margin: 0, 
                        padding: '4px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Line: {getLineDisplay(searchCriteria.lines)}
                    </Tag>
                  )}
                  
                  {searchCriteria.dateType === "range" && searchCriteria.fromDate && searchCriteria.toDate ? (
                    <Tag color="green" style={{ margin: 0, padding: '4px 8px' }}>
                      Date: {searchCriteria.fromDate} to {searchCriteria.toDate}
                    </Tag>
                  ) : (
                    <Tag color="green" style={{ margin: 0, padding: '4px 8px' }}>
                      Date: All
                    </Tag>
                  )}
                  
                  <Tag color="purple" style={{ margin: 0, padding: '4px 8px' }}>
                    Investment = {searchCriteria.searchText ? `"${searchCriteria.searchText}"` : "All"}
                  </Tag>
                </div>
              </div>
              
              <Divider style={{ margin: '5px 0'}} />
            </>
          )}

          {Object.keys(groupedData).map((lineName) => {
            const isLineExpanded = true;

            return (
              <div
                key={lineName}
                className="investment-list-line-group"
              >
                <div className="investment-list-line-header">
                  <div className="investment-list-line-title-container">
                    <Image preview={false} src={lineIcon} width={30} height={30} />
                    <span className="investment-list-line-title">
                      {lineName}
                    </span>
                  </div>
                  <div className={showReset ? "investment-list-badge investment-list-badge-search" : "investment-list-badge"}>
                    {groupedData[lineName].length}
                  </div>
                </div>

                <div
                  id={'scrollableDiv-' + lineName}
                  className="investment-list-container"
                >
                  <InfiniteScroll
                    dataLength={investmentsPagination[lineName]?.displayed || INVESTMENTS_PAGE_SIZE}
                    next={() => loadMoreInvestments(lineName)}
                    hasMore={
                      (investmentsPagination[lineName]?.displayed || 0) <
                      (investmentsPagination[lineName]?.total || 0)
                    }
                    loader={
                      <div className="investment-list-skeleton">
                        <Skeleton avatar paragraph={{ rows: 1 }} active />
                      </div>
                    }
                    endMessage={
                      <Divider plain className="investment-list-divider">
                        <span className="investment-list-divider-star">★ </span>
                        <span className="investment-list-divider-text">
                          End of{" "}
                          <span className="investment-list-divider-line-name">
                            {lineName}
                          </span> line{" "}
                          <span className="investment-list-divider-star">★</span>
                        </span>
                      </Divider>
                    }
                    scrollableTarget={'scrollableDiv-' + lineName}
                  >
                    <List
                      dataSource={
                        groupedData[lineName].slice(
                          0,
                          investmentsPagination[lineName]?.displayed || INVESTMENTS_PAGE_SIZE
                        )
                      }
                      className="investment-list"
                      renderItem={(investment, index) => {
                        const isExpanded = expandedInvestments[lineName + '-' + investment.id];
                        const lineIndex = index + 1;

                        return (
                          <div
                            key={investment.id}
                            id={'investment-item-' + investment.id}
                            className="investment-list-item-wrapper"
                          >
                            {isMobile ? (
                              <SwipeablePanel
                                item={{ ...investment, lineIndex }}
                                index={investment.id}
                                titleKey="investment_title"
                                name="investment"
                                avatarSrc={lineIcon}
                                onSwipeRight={!isExpanded ? () => handleEditInvestment(investment) : undefined}
                                onSwipeLeft={!isExpanded ? () => handleDelete(investment) : undefined}
                                isExpanded={isExpanded}
                                onExpandToggle={() => handleInvestmentAction(lineName, investment.id)}
                                renderContent={() => (
                                  isExpanded ? (
                                    <InvestmentCollapseContent investment={investment} />
                                  ) : null
                                )}
                                isSwipeOpen={openSwipeId === investment.id}
                                onSwipeStateChange={(isOpen) => handleSwipeStateChange(investment.id, isOpen)}
                              />
                            ) : (
                              <>
                                <List.Item
                                  className={isExpanded ? "investment-list-item investment-list-item-expanded" : "investment-list-item"}
                                >
                                  <List.Item.Meta
                                    avatar={
                                      <div className="investment-list-avatar-container">
                                        <span className="investment-list-index-badge">{lineIndex}</span>
                                      </div>
                                    }
                                    title={
                                      <div
                                        onClick={() => handleInvestmentAction(lineName, investment.id)}
                                        className="investment-list-item-title-container"
                                      >
                                        <span className="investment-list-item-title">
                                          {investment.investment_title}
                                        </span>
                                        <Dropdown
                                          overlay={
                                            <Menu>
                                              <Menu.Item
                                                key="edit"
                                                onClick={(e) => {
                                                  e.domEvent.stopPropagation();
                                                  handleEditInvestment(investment);
                                                }}
                                              >
                                                <div className="d-flex align-items-center gap-1">
                                                  <span className="mdi mdi-pencil text-secondary mb-0"></span>
                                                  <span>Edit</span>
                                                </div>
                                              </Menu.Item>
                                              <Menu.Item key="delete">
                                                <Popconfirm
                                                  title={`Delete investment ${investment.name || investment.investment_name || 'this investment'}?`}
                                                  description="Are you sure you want to delete this investment permanently?"
                                                  icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
                                                  onConfirm={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(investment);
                                                  }}
                                                  okText="Delete"
                                                  cancelText="Cancel"
                                                  okButtonProps={{ danger: true, type: "primary" }}
                                                  cancelButtonProps={{ type: "default" }}
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <div className="d-flex align-items-center gap-1" style={{ color: "red" }}>
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
                                            className="investment-list-ellipsis-icon"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </Dropdown>
                                      </div>
                                    }
                                  />
                                </List.Item>

                                {isExpanded && (
                                  <div className="investment-list-collapse-content">
                                    <InvestmentCollapseContent investment={investment} />
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

          {Object.keys(groupedData).length === 0 && !loading && (
            <div className="investment-list-no-data">
              <p>No investments found matching your search criteria</p>
            </div>
          )}
        </div>
      )}

      {!hasSearched && !loading && (
        <div className="investment-list-no-search">
          <SearchOutlined className="investment-list-no-search-icon" />
          <p className="investment-list-no-search-title">No Search Performed</p>
          <p className="investment-list-no-search-text">Please use the Search button to filter and view investments.</p>
        </div>
      )}

      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        tooltip={<div>Add New Investment</div>}
        onClick={() => navigate("/investment/add")}
        className="investment-list-float-button"
      />
    </div>
  );
};

export default InvestmentList;