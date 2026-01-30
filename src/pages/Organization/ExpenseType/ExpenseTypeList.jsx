import React, { useState, useEffect, useCallback } from "react";
import { Button, notification, FloatButton, Form, Input, Modal, Image, List, Skeleton, Menu, Dropdown, Popconfirm, Tag, Switch, Flex, Divider, Badge } from "antd";
import { PlusOutlined, ReloadOutlined, SearchOutlined, ExclamationCircleOutlined, DeleteFilled, EllipsisOutlined, CaretDownOutlined } from "@ant-design/icons";
import { GET, DELETE } from "helpers/api_helper";
import { EXPENSE_TYPES, EXPENSE_TYPE_DETAIL } from "helpers/url_helper";
import Loader from "components/Common/Loader";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";
import expenseIcon from "assets/images/location.png";
import lineIcon from "assets/icons/clipboard-list.png"
import ExpenseCollapseContent from "components/Common/ExpenseCollapseContent";
import SwipeablePanel from "components/Common/SwipeablePanel";
import "./ExpenseTypeList.css";

const ExpenseTypeList = () => {
  const [loading, setLoading] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [groupedExpenses, setGroupedExpenses] = useState({});
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [selectedBranchName, setSelectedBranchName] = useState("");
  const [expandedExpenses, setExpandedExpenses] = useState({});
  const [expandedLines, setExpandedLines] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [openSwipeId, setOpenSwipeId] = useState(null);
  const [expensesPagination, setExpensesPagination] = useState({});
  const navigate = useNavigate();
  const MAX_VISIBLE_ITEMS = 8;
const ITEM_HEIGHT = 20; // average height of one expense item


  const EXPENSES_PAGE_SIZE = 10;

  // Get selected branch from localStorage
  useEffect(() => {
    const savedBranch = localStorage.getItem("selected_branch_name");
    if (savedBranch) {
      setSelectedBranchName(savedBranch);
    }
  }, []);

  // Initialize line expansion state
  const initializeLineExpansionState = (groupedData, expanded = false) => {
    const initialExpandedState = {};
    Object.keys(groupedData).forEach(lineName => {
      initialExpandedState[lineName] = expanded;
    });
    setExpandedLines(initialExpandedState);
  };

  // Fetch expense types
  const getExpenseTypesList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await GET(EXPENSE_TYPES);
      if (response?.status === 200) {
        const allExpenses = response.data;
        setExpenseTypes(allExpenses);

        // Filter by selected branch
        const savedBranchName = localStorage.getItem("selected_branch_name");
        let filtered = allExpenses;

        if (savedBranchName) {
          filtered = allExpenses.filter(
            (expense) => expense.branch_name === savedBranchName
          );
        }

        // Filter by active status
        if (showOnlyActive) {
          filtered = filtered.filter((expense) => expense.status === "active");
        }

        // Group by line_name
        const grouped = groupExpensesByLine(filtered);
        setGroupedExpenses(grouped);

        // Set all lines to collapsed on load
        initializeLineExpansionState(grouped, false);

        // Initialize pagination
        Object.keys(grouped).forEach(lineName => {
          initializeLinePagination(lineName, grouped[lineName].length);
        });

        setExpandedExpenses({});
      }
    } catch (error) {
      console.error("Error fetching expense types:", error);
      notification.error({
        message: "Error",
        description: "Failed to load expense types.",
      });
    } finally {
      setLoading(false);
    }
  }, [showOnlyActive]);

  useEffect(() => {
    getExpenseTypesList();
  }, [getExpenseTypesList]);

  // Check if mobile device
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Group expenses by line_name
  const groupExpensesByLine = (expenses) => {
    const grouped = {};
    
    expenses.forEach((expense) => {
      const lineName = expense.line_name || "No Line Assigned";
      if (!grouped[lineName]) {
        grouped[lineName] = [];
      }
      grouped[lineName].push(expense);
    });

    return grouped;
  };

  // Initialize pagination
  const initializeLinePagination = (lineName, totalExpenses) => {
    setExpensesPagination(prev => ({
      ...prev,
      [lineName]: {
        displayed: Math.min(EXPENSES_PAGE_SIZE, totalExpenses),
        total: totalExpenses
      }
    }));
  };

  // Load more expenses
  const loadMoreExpenses = (lineName) => {
    setExpensesPagination(prev => {
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

  // Handle delete
  const onDelete = async (record) => {
    try {
      setDeleteLoader(true);
      const response = await DELETE(EXPENSE_TYPE_DETAIL(record.id));

      if (response?.status === 200 || response?.status === 204) {
        setExpenseTypes((prev) => prev.filter((item) => item.id !== record.id));
        notification.success({
          message: `${record.name?.toUpperCase()} Expense Type Deleted!`,
          description: "The expense type has been deleted successfully.",
          duration: 2,
        });
        getExpenseTypesList();
      } else {
        notification.error({
          message: "Delete Failed",
          description: "The expense type could not be deleted.",
        });
      }
    } catch (error) {
      console.error("Error deleting expense type:", error);
      notification.error({
        message: "Error",
        description: "An error occurred while deleting the expense type.",
      });
    } finally {
      setDeleteLoader(false);
    }
  };

  // Handle toggle change
  const handleToggleChange = (checked) => {
    setShowOnlyActive(checked);
  };

  // Show search modal
  const showSearchModal = () => setSearchModalVisible(true);
  const handleCancel = () => setSearchModalVisible(false);

  // Handle search
  const handleSearch = () => {
    const { expenseName } = form.getFieldsValue();
    if (!expenseName) {
      notification.warning({
        message: "No Input",
        description: "Please enter an expense name to search.",
      });
      return;
    }

    const searchValue = expenseName.toLowerCase().trim();
    setSearchTerm(searchValue);

    const savedBranchName = localStorage.getItem("selected_branch_name");
    let filtered = expenseTypes;

    if (savedBranchName) {
      filtered = filtered.filter((e) => e.branch_name === savedBranchName);
    }

    if (showOnlyActive) {
      filtered = filtered.filter((e) => e.status === "active");
    }

    filtered = filtered.filter((e) =>
      e.name?.toLowerCase().includes(searchValue)
    );

    if (filtered.length === 0) {
      notification.warning({
        message: "No Results",
        description: "No expense types found matching your search.",
      });
    }

    const grouped = groupExpensesByLine(filtered);
    setGroupedExpenses(grouped);
    
    // Expand all lines after search
    initializeLineExpansionState(grouped, true);

    Object.keys(grouped).forEach(lineName => {
      initializeLinePagination(lineName, grouped[lineName].length);
    });

    setSearchModalVisible(false);
  };

  // Handle reset
  const handleReset = () => {
    form.resetFields();
    setSearchTerm("");
    getExpenseTypesList();
  };

  // Toggle expense item expansion
  const handleExpenseAction = (lineName, expenseId) => {
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
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 100);
      }

      return newState;
    });
  };

  // Handle swipe state change
  const handleSwipeStateChange = (expenseId, isOpen) => {
    if (isOpen) {
      setOpenSwipeId(expenseId);
    } else if (openSwipeId === expenseId) {
      setOpenSwipeId(null);
    }
  };

  // Handle edit expense
  const handleEditExpense = (expense) => {
    setOpenSwipeId(null);
    navigate(`/expense/edit/${expense.id}`);
  };

  // Handle delete expense
  const handleDeleteExpense = (expense) => {
    setOpenSwipeId(null);
    onDelete(expense);
  };

  // Render menu for actions
  const renderMenu = (expense) => (
    <Menu>
      <Menu.Item
        key="edit"
        onClick={(e) => {
          e.domEvent.stopPropagation();
          navigate(`/expense/edit/${expense.id}`);
        }}
      >
        <div className="d-flex align-items-center gap-1">
          <span className="mdi mdi-pencil text-secondary mb-0"></span>
          <span>Edit</span>
        </div>
      </Menu.Item>

      <Menu.Item key="delete">
        <Popconfirm
          title={`Delete expense ${expense.name}?`}
          description="Are you sure you want to delete?"
          icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          onConfirm={(e) => {
            e.stopPropagation();
            onDelete(expense);
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
  );

 const searchModal = (
  <Modal
    title={<div className="expense-type-list-modal-title">Search Expense Types</div>}
    open={searchModalVisible}
    onOk={handleSearch}
    onCancel={handleCancel}
    okText="Search"
    cancelText="Cancel"
    width={500}
  >
    {/* Use Ant Design Form to manage the Input state */}
    <Form
      form={form} // Binds the form instance
      onFinish={handleSearch} // Allows pressing Enter to submit
      initialValues={{ expenseName: "" }} // Ensure a defined initial value
      layout="vertical"
    >
      <Form.Item
        name="expenseName" // This name links to form.getFieldsValue().expenseName
        label={<p className="expense-type-list-modal-label">Enter Expense Name:</p>}
        rules={[{ required: true, message: "Please enter an expense name" }]}
      >
        <Input
          placeholder="Enter expense name to search"
          // The Form.Item handles value and onChange automatically for the Input component
        />
      </Form.Item>
    </Form>
  </Modal>
);

  return (
    <div className="expense-type-list-page-content">
      {loading && <Loader />}

      <div className="expense-type-list-header">
        <h2 className="expense-type-list-title">Expense Types</h2>

        <div className="expense-type-list-actions">
           <Button
            icon={<SearchOutlined />}
            onClick={showSearchModal}
            type="default"
          >
            {!isMobile && "Search Expense"}
          </Button>
          {searchTerm && (
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              title="Reset Search"
            />
          )}
         
        </div>
      </div>

      {searchModal}

      {/* Display Selected Branch Name */}
     
      {/* Active Toggle */}
      <div style={{ marginBottom: "16px" }}>
        <Flex gap="0.5rem" align="center">
          <span style={{ fontSize: "14px", fontWeight: "500" }}>Show Active Only</span>
          <Switch checked={showOnlyActive} onChange={handleToggleChange} />
        </Flex>
      </div>

      <div
        id="scrollableExpenseDiv"
        className="expense-type-list-scrollable-div"
      >
        {searchTerm && (
          <div className="expense-type-list-search-results">
            <span className="expense-type-list-search-label">
            
              {/* <span className="expense-type-list-search-query">
                "{searchTerm}"
              </span> */}
              <Tag color="blue" style={{ fontSize: 14, padding: "2px 8px" }}>
                      Expense = "{searchTerm}"
                    </Tag>
            </span>
           
          </div>
        )}

        {Object.keys(groupedExpenses).length === 0 ? (
          <div className="expense-type-list-no-data">
            <p>No expense types found {searchTerm ? `for "${searchTerm}"` : "for the selected branch"}</p>
          </div>
        ) : (
          Object.entries(groupedExpenses).map(([lineName, expenses], lineGroupIndex) => {
  const allLineNames = Object.keys(groupedExpenses);
  const isLastLineGroup = lineGroupIndex === allLineNames.length - 1;

  // Last expense in this line
  const lastExpense = expenses[expenses.length - 1];

  const isLastExpenseExpanded = lastExpense
    ? expandedExpenses[`${lineName}-${lastExpense.id}`]
    : false;

  // Count expanded expenses in this line
  const expandedCount = expenses.filter(
    (expense) => expandedExpenses[`${lineName}-${expense.id}`]
  ).length;

  // Remaining slots to reach MAX_VISIBLE_ITEMS
  const remainingSlots = Math.max(
    MAX_VISIBLE_ITEMS - expandedCount,
    0
  );

  const shouldAddPadding =
    isLastLineGroup && isLastExpenseExpanded;

  const paddingBottom = shouldAddPadding
    ? remainingSlots * ITEM_HEIGHT
    : 0;


            return (
              <div
                key={lineName}
                className="expense-type-list-line-group"
                 style={{ paddingBottom }}
              >
                {/* LINE HEADER */}
                <div 
                  className="expense-type-list-line-header"
                 
                >
                  <div className="expense-type-list-line-title-container">
                    {/* <Avatar src={lineIcon}>
                      {lineName?.charAt(0)?.toUpperCase()}
                    </Avatar> */}
                    <Image preview={false} src={lineIcon} width={30} height={30} />
                    <span className="expense-type-list-line-title">
                      {lineName}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px'}}>
                    {/* <Badge
                      count={expenses.length}
                      className="expense-type-list-badge"
                    /> */}
                    <div className="expense-type-list-badge">{expenses.length}</div>
                    {/* <CaretDownOutlined 
                      style={{ 
                        transition: 'transform 0.3s',
                        transform: isLineExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
                      }} 
                    /> */}
                  </div>
                </div>

                {/* LINE CONTENT - Only render if expanded */}
                
                  <div
                    id={`scrollable-${lineName}`}
                    className="expense-type-list-list-container"
                  >
                    <InfiniteScroll
                      dataLength={expensesPagination[lineName]?.displayed || EXPENSES_PAGE_SIZE}
                      next={() => loadMoreExpenses(lineName)}
                      hasMore={
                        (expensesPagination[lineName]?.displayed || 0) <
                        (expensesPagination[lineName]?.total || 0)
                      }
                      loader={
                        <div className="expense-type-list-skeleton-container">
                          <Skeleton avatar paragraph={{ rows: 1 }} active />
                        </div>
                      }
                      endMessage={
                        <Divider plain className="expense-type-list-divider-container">
                          <span className="expense-type-list-divider-star">★ </span>
                          <span className="expense-type-list-divider-text">
                            End of{" "}
                            <span className="expense-type-list-divider-line-name">
                              {lineName}
                            </span> line{" "}
                            <span className="expense-type-list-divider-star">★</span>
                          </span>
                        </Divider>
                      }
                      scrollableTarget={`scrollable-${lineName}`}
                    >
                      <List
                        dataSource={
                          expenses.slice(
                            0,
                            expensesPagination[lineName]?.displayed || EXPENSES_PAGE_SIZE
                          )
                        }
                        className="expense-type-list-list"
                        renderItem={(expense, index) => {
                          const isExpanded = expandedExpenses[`${lineName}-${expense.id}`];
                          const lineIndex = index + 1;

                          return (
                            <div
                              key={expense.id}
                              id={`expense-item-${expense.id}`}
                              className="expense-type-list-item-wrapper"
                            >
                              {isMobile ? (
                                <SwipeablePanel
                                  item={{...expense,lineIndex}}
                                  index={expense.id}
                                  titleKey="name"
                                  name="expense"
                                  avatarSrc={expenseIcon}
                                  onSwipeRight={!isExpanded ? () => handleEditExpense(expense) : undefined}
                                  onSwipeLeft={!isExpanded ? () => handleDeleteExpense(expense) : undefined}
                                  isExpanded={isExpanded}
                                  onExpandToggle={() => handleExpenseAction(lineName, expense.id)}
                                  renderContent={() => (
                                    isExpanded ? (
                                      <ExpenseCollapseContent expense={expense} />
                                    ) : null
                                  )}
                                  isSwipeOpen={openSwipeId === expense.id}
                                  onSwipeStateChange={(isOpen) => handleSwipeStateChange(expense.id, isOpen)}
                                />
                              ) : (
                                <>
                                  <List.Item
                                    className={isExpanded ? "expense-type-list-item expense-type-list-item-expanded" : "expense-type-list-item"}
                                  >
                                    <List.Item.Meta
                                      avatar={
                                        <div className="expense-type-list-avatar-container">
                                         
                                          <span className="expense-type-list-index-badge">{lineIndex}</span>
                                        </div>
                                      }
                                      title={
                                        <div
                                          onClick={() => handleExpenseAction(lineName, expense.id)}
                                          className="expense-type-list-item-title-container"
                                        >
                                          <span className="expense-type-list-item-title">
                                            {expense.name}
                                          </span>
                                          <Dropdown
                                            overlay={renderMenu(expense)}
                                            trigger={["click"]}
                                          >
                                            <EllipsisOutlined
                                              className="expense-type-list-ellipsis-icon"
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </Dropdown>
                                        </div>
                                      }
                                    />
                                  </List.Item>

                                  {isExpanded && (
                                    <div className="expense-type-list-collapse-content">
                                      <ExpenseCollapseContent expense={expense} />
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
          })
        )}
      </div>

      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        className="expense-type-list-float-button"
        onClick={() => navigate("/expense/add")}
        tooltip="Add New Expense Type"
      />
    </div>
  );
};

export default ExpenseTypeList;