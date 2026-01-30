import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  DeleteFilled,
  ExclamationCircleOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import {
  Button,
  FloatButton,
  Modal,
  notification,
  Select,
  Radio,
  List,
  Avatar,
  Dropdown,
  Menu,
  Popconfirm,
  Divider,
  Skeleton,
  Tag,
  Grid,
} from "antd";
import Loader from "components/Common/Loader";
import dayjs from "dayjs";
import { DELETE, GET } from "helpers/api_helper";
import { EXPENSE_TRANSACTION, EXPENSE_TYPES, AREA } from "helpers/url_helper"; 
import { useEffect, useState } from "react";
import SwipeablePanel from "components/Common/SwipeablePanel";
import InfiniteScroll from "react-infinite-scroll-component";
import ExpenseTransactionCollapseContent from "../../../components/Common/ExpenseTransactionCollapseContent ";
import lineIcon from "../../../assets/icons/industrial-area.png";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import "./ExpenseTransactionList.css";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Option } = Select;
const { useBreakpoint } = Grid;

const ExpenseTransactionList = () => {
  const [loading, setLoading] = useState(true);
  const [expenseTransactions, setExpenseTransactions] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [expenseTypeList, setExpenseTypeList] = useState([]);
  const [areaList, setAreaList] = useState([]); // State for area data
  const [areaLoader, setAreaLoader] = useState(false); // State for area loading
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [selectedBranchFromStorage, setSelectedBranchFromStorage] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [showReset, setShowReset] = useState(false);

  // Search filters
  const [selectedLines, setSelectedLines] = useState([]);
  const [dateFilterType, setDateFilterType] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [searchText, setSearchText] = useState("");
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [dateError, setDateError] = useState("");

  // Pagination
  const [expensePagination, setExpensePagination] = useState({});
  const EXPENSES_PAGE_SIZE = 10;

  // Expand states
  const [expandedExpenses, setExpandedExpenses] = useState({});
  const [openSwipeId, setOpenSwipeId] = useState(null);

  const today = dayjs().format('YYYY-MM-DD');
  const ALL_LINES_VALUE = "__ALL_LINES__";

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    const storedBranchName = localStorage.getItem("selected_branch_name");
    const accessToken = localStorage.getItem("access_token");

    setSelectedBranchFromStorage(storedBranchName);

    const fetchData = async () => {
      if (storedBranchName && accessToken) {
        // Fetch all three APIs on load
        await Promise.all([getExpenseTransactionList(), getExpenseTypesList(), getAreaList()]);
        setLoading(false);
      } else {
        setTimeout(async () => {
          const retryToken = localStorage.getItem("access_token");
          const retryBranch = localStorage.getItem("selected_branch_name");
          if (retryBranch && retryToken) {
            await Promise.all([getExpenseTransactionList(), getExpenseTypesList(), getAreaList()]);
            setLoading(false);
          }
        }, 300);
      }
    };

    fetchData();
  }, []);

  // Removed the useEffect that automatically opens the search modal on first load.
  
  const getExpenseTransactionList = async () => {
    try {
      const response = await GET(EXPENSE_TRANSACTION);
      if (response?.status === 200) {
        const storedBranchName = localStorage.getItem("selected_branch_name");
        let filteredData = response.data;
        
        // Expense Transactions are filtered here by the stored branch name
        if (storedBranchName) {
          filteredData = response.data.filter(
            (item) => item.BRNCH_NM === storedBranchName
          );
        }
        
        setOriginalData(filteredData);
        return filteredData;
      }
      return [];
    } catch (error) {
      notification.error({
        message: "Failed to fetch expense transactions",
        description: "An error occurred while loading expense transaction data",
      });
      return [];
    }
  };

  const getExpenseTypesList = async () => {
    try {
      const response = await GET(EXPENSE_TYPES);
      if (response?.status === 200) {
        setExpenseTypeList(response.data || []);
        return response.data;
      }
      return [];
    } catch (error) {
      notification.error({
        message: "Failed to fetch expense types",
        description: "An error occurred while loading expense types",
      });
      return [];
    }
  };

  const getAreaList = async () => {
    try {
      setAreaLoader(true);
      const response = await GET(AREA); 
      if (response?.status === 200) {
        setAreaList(response.data || []);
      } else {
        setAreaList([]);
      }
      setAreaLoader(false);
      return response.data || [];
    } catch (error) {
      setAreaList([]);
      setAreaLoader(false);
      notification.error({
        message: "Failed to fetch area data",
        description: "An error occurred while loading branch/line data",
      });
      return [];
    }
  };

  /**
   * NEW FUNCTION: Filters the areaList by the selected branch name
   * and returns unique line names for the search dropdown.
   */
  const getLinesForSearchDropdown = () => {
    if (areaList.length === 0 || !selectedBranchFromStorage) {
      // Fallback: If area data or branch is missing, use lines from expense data
      const lines = [...new Set(originalData.map(exp => exp.LINE_NM || "Uncategorized"))];
      return lines.sort();
    }

    // Filter areaList items that belong to the current branch
    const filteredAreaLines = areaList
      .filter(item => item.BRNCH_NM === selectedBranchFromStorage)
      .map(item => item.LINE_NM || "Uncategorized");

    // Get unique lines
    const uniqueLines = [...new Set(filteredAreaLines)];
    
    return uniqueLines.sort();
  };


  const groupExpensesByLine = (data) => {
    const grouped = {};
    data.forEach((expense) => {
      const lineName = expense.LINE_NM || "Uncategorized";
      if (!grouped[lineName]) {
        grouped[lineName] = [];
      }
      grouped[lineName].push(expense);
    });
    return grouped;
  };
  
  const handleLineSelection = (values) => {
    if (values.includes(ALL_LINES_VALUE)) {
      setSelectedLines([ALL_LINES_VALUE]);
    } else {
      setSelectedLines(values);
    }
  };

  // ... (rest of the functions remain the same)

  const validateDateRange = (fromDate, toDate) => {
    // ... (same as before)
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
    // ... (same as before)
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);

    if (newDateRange.from && newDateRange.to) {
      validateDateRange(newDateRange.from, newDateRange.to);
    } else {
      setDateError("");
    }
  };

  const initializeLinePagination = (lineName, totalExpenses) => {
    // ... (same as before)
    setExpensePagination(prev => ({
      ...prev,
      [lineName]: {
        displayed: Math.min(EXPENSES_PAGE_SIZE, totalExpenses),
        total: totalExpenses
      }
    }));
  };

  const loadMoreExpenses = (lineName) => {
    // ... (same as before)
    setExpensePagination(prev => {
      const current = prev[lineName] || { displayed: 0, total: 0 };
      return {
        ...prev,
        [lineName]: {
          ...current,
          displayed: Math.min(current.displayed + EXPENSES_PAGE_SIZE, current.total)
        }
      };
    });
  };

  const handleSearch = () => {
    // ... (same as before)
    const isAllLinesSelected = selectedLines.includes(ALL_LINES_VALUE) || selectedLines.length === 0;
    const hasLineCriteria = !isAllLinesSelected && selectedLines.length > 0;
    const hasDateCriteria = dateFilterType === "range" && dateRange.from && dateRange.to;
    const hasTextCriteria = searchText.trim() !== "";

    if (!hasLineCriteria && !hasDateCriteria && !hasTextCriteria && !isAllLinesSelected) {
      notification.warning({
        message: "Search Required",
        description: "Please select at least one search criteria (line, date range, or expense type).",
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
        selectedLines.includes(item.LINE_NM || "Uncategorized")
      );
    }

    if (dateFilterType === "range" && dateRange.from && dateRange.to) {
      const fromDate = dayjs(dateRange.from).startOf('day');
      const toDate = dayjs(dateRange.to).endOf('day');

      filtered = filtered.filter(item => {
        const expenseDate = dayjs(item.EXPNS_TRNSCTN_DT);
        return (expenseDate.isAfter(fromDate) || expenseDate.isSame(fromDate)) &&
          (expenseDate.isBefore(toDate) || expenseDate.isSame(toDate));
      });
    }

    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      filtered = filtered.filter(item => {
        const expenseType = (item.EXPNS_TYPE_NM || "").toLowerCase();
        return expenseType.includes(query);
      });
    }

    const criteria = {
      lines: isAllLinesSelected ? ["All Lines"] : (hasLineCriteria ? selectedLines : null),
      dateType: dateFilterType,
      fromDate: dateRange.from ? dayjs(dateRange.from).format('DD-MMM-YYYY') : null,
      toDate: dateRange.to ? dayjs(dateRange.to).format('DD-MMM-YYYY') : null,
      searchText: searchText.trim() || null
    };

    setSearchCriteria(criteria);
    setExpenseTransactions(filtered);
    const grouped = groupExpensesByLine(filtered);
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
        description: "No expense transactions found matching your search criteria.",
      });
    }
  };

  const handleReset = () => {
    // ... (same as before)
    setExpenseTransactions([]);
    setGroupedData({});
    setExpensePagination({});
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
      description: "Please perform a new search to view expense transactions.",
    });

    setTimeout(() => {
      setSearchModalVisible(true);
    }, 300);
  };

  const handleDelete = async (record) => {
    // ... (same as before)
    try {
      const response = await DELETE(`${EXPENSE_TRANSACTION}${record.EXPNS_TRNSCTN_ID}/`);
      if (response?.status === 204 || response?.status === 200) {
        const updatedData = expenseTransactions.filter(
          (item) => item.EXPNS_TRNSCTN_ID !== record.EXPNS_TRNSCTN_ID
        );
        const updatedOriginalData = originalData.filter(
          (item) => item.EXPNS_TRNSCTN_ID !== record.EXPNS_TRNSCTN_ID
        );

        setExpenseTransactions(updatedData);
        setOriginalData(updatedOriginalData);
        setGroupedData(groupExpensesByLine(updatedData));

        notification.success({
          message: `${record.EXPNS_TYPE_NM?.toUpperCase()} Expense Deleted!`,
          description: "Expense transaction has been deleted successfully",
        });
      }
    } catch (error) {
      notification.error({
        message: "An error occurred",
        description: "Failed to delete expense transaction",
      });
    }
  };

  const handleExpenseAction = (lineName, expenseId) => {
    // ... (same as before)
    const key = `${lineName}-${expenseId}`;
    setOpenSwipeId(null);
    setExpandedExpenses((prev) => {
      const newState = {
        [key]: !prev[key]
      };

      if (newState[key]) {
        setTimeout(() => {
          const element = document.getElementById(`expense-item-${expenseId}`);
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

  const handleSwipeStateChange = (expenseId, isOpen) => {
    // ... (same as before)
    if (isOpen) {
      setOpenSwipeId(expenseId);
    } else if (openSwipeId === expenseId) {
      setOpenSwipeId(null);
    }
  };

  const handleEditExpense = (expense) => {
    // ... (same as before)
    window.location.href = `/expense-transaction/edit/${expense.EXPNS_TRNSCTN_ID}`;
  };

  const getSearchCriteriaDisplay = () => {
    // ... (same as before)
    if (!searchCriteria) return null;

    const parts = [];

    if (searchCriteria.lines && searchCriteria.lines.length > 0) {
      parts.push(`Lines: ${searchCriteria.lines.join(", ")}`);
    }

    if (searchCriteria.dateType === "range" && searchCriteria.fromDate && searchCriteria.toDate) {
      parts.push(`Date: ${searchCriteria.fromDate} to ${searchCriteria.toDate}`);
    } else if (searchCriteria.dateType === "all") {
      parts.push("Date: All");
    }

    if (searchCriteria.searchText) {
      parts.push(`Expense Type: "${searchCriteria.searchText}"`);
    }

    return parts.join(" | ");
  };

  const searchModal = (
    <Modal
      title={<div className="expense-list-modal-title">Search Expense Transactions</div>}
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
      <div className="expense-list-modal-content">
        <div>
          <p className="expense-list-modal-label">Select Line:</p>
          <Select
            mode="multiple"
            value={selectedLines}
            onChange={handleLineSelection}
            style={{ width: "100%" }}
            placeholder="Select line"
            allowClear
            maxTagCount="responsive"
          >
            <Option key={ALL_LINES_VALUE} value={ALL_LINES_VALUE}>
              All Lines
            </Option>
            {/* UPDATED: Using getLinesForSearchDropdown() */}
            {getLinesForSearchDropdown().map(line => (
              <Option key={line} value={line}>{line}</Option>
            ))}
          </Select>
        </div>

        <div>
          <p className="expense-list-modal-label">Date Filter:</p>
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
            <div className="expense-list-date-filter-container">
              <p className="expense-list-date-filter-label">
                Select date range:
              </p>
              <div className="expense-list-date-range-container">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => handleDateChange("from", e.target.value)}
                  max={dateRange.to || today}
                  className="expense-list-date-input"
                />
                <span className="expense-list-date-separator">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => handleDateChange("to", e.target.value)}
                  min={dateRange.from || undefined}
                  max={today}
                  className="expense-list-date-input"
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
          <p className="expense-list-modal-label">Expense Type:</p>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Enter expense type to search"
            className="expense-list-search-input"
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

  return (
    <div className="expense-list-page-content">
      {loading && <Loader />}
      {areaLoader && (
        <Loader loadingText="Fetching area details..." />
      )}

      <div className="expense-list-header">
        <h2 className="expense-list-title">Expense Transactions</h2>
        <div className="expense-list-actions">
          <Button
            icon={<SearchOutlined />}
            onClick={() => setSearchModalVisible(true)}
            type="default"
          >
            {!isMobile && "Search"}
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
      
      {/* ... (rest of the JSX remains the same for displaying data) ... */}

      {hasSearched && (
        <div
          id="scrollableDiv"
          className="expense-list-scrollable-div"
        >
          {showReset && searchCriteria && (
            <div className="expense-list-search-results">
              <div className="expense-list-search-results-content">
                <span className="expense-list-search-label">
                  Search Result:
                </span>
                <Tag color="blue">{getSearchCriteriaDisplay()}</Tag>
              </div>
            </div>
          )}

          {Object.keys(groupedData).map((lineName) => {
            return (
              <div
                key={lineName}
                className="expense-list-line-group"
              >
                <div className="expense-list-line-header">
                  <div className="expense-list-line-title-container">
                    <Avatar src={lineIcon}>
                      {lineName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <span className="expense-list-line-title">
                      {lineName}
                    </span>
                  </div>
                  <div className={showReset ? "expense-list-badge expense-list-badge-search" : "expense-list-badge"}>
                    {groupedData[lineName].length}
                  </div>
                </div>

                <div
                  id={'scrollableDiv-' + lineName}
                  className="expense-list-container"
                >
                  <InfiniteScroll
                    dataLength={expensePagination[lineName]?.displayed || EXPENSES_PAGE_SIZE}
                    next={() => loadMoreExpenses(lineName)}
                    hasMore={
                      (expensePagination[lineName]?.displayed || 0) <
                      (expensePagination[lineName]?.total || 0)
                    }
                    loader={
                      <div className="expense-list-skeleton">
                        <Skeleton avatar paragraph={{ rows: 1 }} active />
                      </div>
                    }
                    endMessage={
                      <Divider plain className="expense-list-divider">
                        <span className="expense-list-divider-star">★ </span>
                        <span className="expense-list-divider-text">
                          End of{" "}
                          <span className="expense-list-divider-line-name">
                            {lineName}
                          </span> line{" "}
                          <span className="expense-list-divider-star">★</span>
                        </span>
                      </Divider>
                    }
                    scrollableTarget={'scrollableDiv-' + lineName}
                  >
                    <List
                      dataSource={
                        groupedData[lineName].slice(
                          0,
                          expensePagination[lineName]?.displayed || EXPENSES_PAGE_SIZE
                        )
                      }
                      className="expense-list"
                      renderItem={(expense, index) => {
                        const isExpanded = expandedExpenses[lineName + '-' + expense.EXPNS_TRNSCTN_ID];
                        const lineIndex = index + 1;

                        return (
                          <div
                            key={expense.EXPNS_TRNSCTN_ID}
                            id={'expense-item-' + expense.EXPNS_TRNSCTN_ID}
                            className="expense-list-item-wrapper"
                          >
                            {isMobile ? (
                              <SwipeablePanel
                                item={{ ...expense, lineIndex }}
                                index={expense.EXPNS_TRNSCTN_ID}
                                titleKey="EXPNS_TYPE_NM"
                                name="expense-transaction"
                                avatarSrc={lineIcon}
                                onSwipeRight={!isExpanded ? () => handleEditExpense(expense) : undefined}
                                onSwipeLeft={!isExpanded ? () => handleDelete(expense) : undefined}
                                isExpanded={isExpanded}
                                onExpandToggle={() => handleExpenseAction(lineName, expense.EXPNS_TRNSCTN_ID)}
                                renderContent={() => (
                                  isExpanded ? (
                                    <ExpenseTransactionCollapseContent expense={expense} />
                                  ) : null
                                )}
                                isSwipeOpen={openSwipeId === expense.EXPNS_TRNSCTN_ID}
                                onSwipeStateChange={(isOpen) => handleSwipeStateChange(expense.EXPNS_TRNSCTN_ID, isOpen)}
                                renderAmount={() => (
                                  <span style={{ 
                                    fontWeight: '600', 
                                    color: '#1890ff',
                                    fontSize: '14px'
                                  }}>
                                    ₹{expense.EXPNS_TRNSCTN_AMNT || 0}
                                  </span>
                                )}
                              />
                            ) : (
                              <>
                                <List.Item
                                  className={isExpanded ? "expense-list-item expense-list-item-expanded" : "expense-list-item"}
                                >
                                  <List.Item.Meta
                                    avatar={
                                      <div className="expense-list-avatar-container">
                                        <Avatar src={lineIcon} />
                                        <span className="expense-list-index-badge">{lineIndex}</span>
                                      </div>
                                    }
                                    title={
                                      <div
                                        onClick={() => handleExpenseAction(lineName, expense.EXPNS_TRNSCTN_ID)}
                                        className="expense-list-item-title-container"
                                      >
                                        <div className="expense-list-title-amount">
                                          <span className="expense-list-item-title">
                                            {expense.EXPNS_TYPE_NM}
                                          </span>
                                          <span className="expense-list-amount">
                                            ₹{expense.EXPNS_TRNSCTN_AMNT || 0}
                                          </span>
                                        </div>
                                        <Dropdown
                                          overlay={
                                            <Menu>
                                              <Menu.Item
                                                key="edit"
                                                onClick={(e) => {
                                                  e.domEvent.stopPropagation();
                                                  handleEditExpense(expense);
                                                }}
                                              >
                                                <div className="d-flex align-items-center gap-1">
                                                  <span className="mdi mdi-pencil text-secondary mb-0"></span>
                                                  <span>Edit</span>
                                                </div>
                                              </Menu.Item>
                                              <Menu.Item key="delete">
                                                <Popconfirm
                                                  title={`Delete expense ${expense.EXPNS_TYPE_NM}?`}
                                                  description="Are you sure you want to delete this expense transaction permanently?"
                                                  icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
                                                  onConfirm={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(expense);
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
                                            className="expense-list-ellipsis-icon"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </Dropdown>
                                      </div>
                                    }
                                    description={
                                      <div className="expense-list-item-date">
                                        {dayjs(expense.EXPNS_TRNSCTN_DT).format('DD MMM YYYY')}
                                      </div>
                                    }
                                  />
                                </List.Item>

                                {isExpanded && (
                                  <div className="expense-list-collapse-content">
                                    <ExpenseTransactionCollapseContent expense={expense} />
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
            <div className="expense-list-no-data">
              <p>No expense transactions found matching your search criteria</p>
            </div>
          )}
        </div>
      )}

      {!hasSearched && !loading && (
        <div className="expense-list-no-search">
          <SearchOutlined className="expense-list-no-search-icon" />
          <p className="expense-list-no-search-title">No Search Performed</p>
          <p className="expense-list-no-search-text">Please use the Search button to filter and view expense transactions.</p>
        </div>
      )}

      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{
          right: 24,
          bottom: 24,
          width: 56,
          height: 56,
        }}
        onClick={() => window.location.href = '/expense-transaction/add'}
        // tooltip="Add New Expense Transaction"
      />
    </div>
  );
};

export default ExpenseTransactionList;