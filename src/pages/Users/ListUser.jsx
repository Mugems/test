import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// MODIFIED: Added CaretDownOutlined
import { Button, notification, Grid, List, Image, Dropdown, Menu, Modal, Tag, Divider, Skeleton, Select, Switch, FloatButton,Popconfirm } from "antd"; 
import Table from "../../components/Common/Table";
import { GET, DELETE, POST } from "helpers/api_helper";

import { USERS, SEARCH, COLUMNCHANGE, SELECTEDCOLUMN } from "helpers/url_helper"; 
import Loader from "components/Common/Loader";

// MODIFIED: Added CaretDownOutlined for expand/collapse indicator
import { EllipsisOutlined, SearchOutlined, ReloadOutlined, PlusOutlined, CaretDownOutlined,DeleteFilled,ExclamationCircleOutlined, SwapOutlined } from "@ant-design/icons"; 
import InfiniteScroll from "react-infinite-scroll-component"; 
import SwipeablePanel from "components/Common/SwipeablePanel"; 
import UserCollapseContent from "../../components/Common/UserCollapseContent"; 
import userIcon from '../../assets/icons/user (2).png'; 


import "./ListUser.css"; 

let header = [
  {
    label: "S.No",
    value: "index",
  },
  {
    label: "Full Name",
    value: "full_name",
    sort: true,
    filter: true,
  },
  {
    label: "Email",
    value: "email",
    sort: true,
    filter: true,
    filterSearch: true,
  },
  {
    label: "Role",
    value: "role",
    sort: true,
    filter: true,
    filterSearch: true,
  },
  { label: "Actions", value: "actions" },
];

const ListUser = () => {
  const navigate = useNavigate();
  const [reOrder, setReorder] = useState(false);
  const [rowReorderred, setRowReorderred] = useState(false);
  const [tableData, setTableData] = useState([]); 
  const [originalData, setOriginalData] = useState([]); 
  const [groupedData, setGroupedData] = useState({}); 
  const [order, setOrder] = useState({});
  const [tableHeader, setTableHeader] = useState(header);
  const [api, contextHolder] = notification.useNotification();
  const [tableLoader, setTableLoader] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [reorderLoader, setReorderLoader] = useState(false);
  const [filterOption, setFilterOption] = useState({});
  const [selectedColumn, setSelectedColumn] = useState([]);

  // New States for ViewArea-like UI/Functionality
  const [selectedBranchFromStorage, setSelectedBranchFromStorage] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState({}); 
  // STATE: For Line Group expansion/collapse
  const [expandedLines, setExpandedLines] = useState({}); 
  const [openSwipeId, setOpenSwipeId] = useState(null); 
  const [usersPagination, setUsersPagination] = useState({}); 
  const [selectedLine, setSelectedLine] = useState(null); 
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false); 
  const [lineSelectionModalVisible, setLineSelectionModalVisible] = useState(false); 
  const [tempSelectedLine, setTempSelectedLine] = useState(null); 

  const USERS_PAGE_SIZE = 10;

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  
  // Helper function to initialize line expansion state (true for expanded, false for collapsed)
  const initializeLineExpansionState = (groupedData, expanded = false) => {
      const initialExpandedState = {};
      Object.keys(groupedData).forEach(lineName => {
          initialExpandedState[lineName] = true;
      });
      setExpandedLines(initialExpandedState);
  };
  
  // HANDLER: To toggle the expansion state of a line group (Accordion Logic)
  const toggleLineExpansion = (clickedLineName) => {
  
  return;
  };

  const uniqueLines = useMemo(() => {
    const storedBranchName = localStorage.getItem("selected_branch_name");
    const lines = new Set();
    
    originalData.forEach(user => {
      if (user.line_allocations) {
        user.line_allocations.forEach(allocation => {
          // Filter by branch name
          if (allocation.branch_name === storedBranchName) {
            const lineName = allocation.line_name || `Line ID: ${allocation.line}`;
            lines.add(lineName);
          }
        });
      }
    });
    
    return Array.from(lines).sort().map(lineName => ({
        label: lineName,
        value: lineName
    }));
  }, [originalData]);

  useEffect(() => {
    const storedBranchName = localStorage.getItem("selected_branch_name");
    setSelectedBranchFromStorage(storedBranchName);

    // getSelectedColumn(); 
    getUserDetails(); 
  }, []);
  
  const groupUsersByLine = (data) => {
    const grouped = {};
    const storedBranchName = localStorage.getItem("selected_branch_name");

    data.forEach((user) => {
      let isCategorized = false;
      if (user.line_allocations && user.line_allocations.length > 0) {
        user.line_allocations.forEach((allocation) => {
          // IMPORTANT: Only group by lines that belong to the current selected branch
          if (allocation.branch_name === storedBranchName) { 
            isCategorized = true;
            const lineName = allocation.line_name || `Line ID: ${allocation.line}`;
            
            if (!grouped[lineName]) {
              grouped[lineName] = [];
            }
            // Add user to this line group only if they aren't already there (safety check)
            if (!grouped[lineName].some(u => u.id === user.id)) {
                grouped[lineName].push(user);
            }
          }
        });
      }
      // Handle users with no line allocation (Uncategorized)
      if (!isCategorized && !storedBranchName) {
         // Only categorize as Uncategorized if no branch is selected OR if the user truly has no allocations
        const lineName = "Uncategorized";
        if (!grouped[lineName]) {
          grouped[lineName] = [];
        }
        if (!grouped[lineName].some(u => u.id === user.id)) {
            grouped[lineName].push(user);
        }
      }
    });
    return grouped;
  };
  
  const initializeLinePagination = (lineName, totalUsers) => {
    setUsersPagination(prev => ({
      ...prev,
      [lineName]: {
        displayed: Math.min(USERS_PAGE_SIZE, totalUsers),
        total: totalUsers
      }
    }));
  };

  const loadMoreUsers = (lineName) => {
    setUsersPagination(prev => {
      const current = prev[lineName] || { displayed: 0, total: 0 };
      return {
        ...prev,
        [lineName]: {
          ...current,
          displayed: Math.min(current.displayed + USERS_PAGE_SIZE, current.total)
        }
      };
    });
  };

  const getUserDetails = async () => {
    try {
      setTableLoader(true);
      const response = await GET(USERS);
      if (response?.status === 200) {
        const storedBranchName = localStorage.getItem("selected_branch_name");

        setOriginalData(response.data); 
        
        // FIX: Filter users who have at least ONE line allocation in the stored branch
        let displayData = response.data;
        if (storedBranchName) {
            displayData = response.data.filter(
                (item) => item.line_allocations?.some(allocation => allocation.branch_name === storedBranchName)
            );
        }
          
        setTableData(displayData);
        const grouped = groupUsersByLine(displayData);
        setGroupedData(grouped);
        
        // Set all lines to collapsed on load (expanded=false)
        initializeLineExpansionState(grouped, true);

        // Initialize infinite scroll pagination
        Object.keys(grouped).forEach(lineName => {
          initializeLinePagination(lineName, grouped[lineName].length);
        });

        // Setup filter options (e.g., for table view)
        const filterCol = ["full_name", "email", "role"];
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

      } else {
        setTableData([]);
        setOriginalData([]);
        setGroupedData({});
      }
    } catch (error) {
      setTableLoader(false);
      setTableData([]);
      setOriginalData([]);
      setGroupedData({});
    } finally {
      setTableLoader(false);
    }
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
      
      const storedBranchName = localStorage.getItem("selected_branch_name");
      const lineOriginalUsers = originalData.filter(item => 
        item.line_allocations?.some(
          allocation => allocation.line_name === selectedLine && allocation.branch_name === storedBranchName
        )
      );
      const lineOriginalUserIds = new Set(lineOriginalUsers.map(item => item.id));
      const reorderedLineUsers = reorderedData.filter(item => lineOriginalUserIds.has(item.id));
      
      const apiPayload = reorderedLineUsers.map((item, index) => ({
        ...item,
        order: index + 1, 
      }));

      const response = await POST(`${USERS}reorder/`, apiPayload);
      
      if (response?.status === 200) {
        
        const updatedOriginalData = originalData.filter(item => 
            !item.line_allocations?.some(allocation => allocation.line_name === selectedLine)
        );
        const finalOriginalData = [...updatedOriginalData, ...reorderedLineUsers];
        
        let finalData = finalOriginalData;
        if (storedBranchName) {
            finalData = finalOriginalData.filter(
                (item) => item.line_allocations?.some(allocation => allocation.branch_name === storedBranchName)
            ); 
        }

        setOriginalData(finalOriginalData);
        setTableData(finalData);
        const grouped = groupUsersByLine(finalData);
        setGroupedData(grouped);

        const newPagination = {};
        Object.keys(grouped).forEach(lineName => {
          newPagination[lineName] = {
            displayed: Math.min(USERS_PAGE_SIZE, grouped[lineName].length),
            total: grouped[lineName].length
          };
        });
        setUsersPagination(newPagination);
        
        handleCancel(finalData, grouped); 
        // Set to collapsed after reorder
        initializeLineExpansionState(grouped, false); 
        
        notification.success({
          message: "Re-Ordered",
          description: `The order for line "${selectedLine}" has been updated successfully.`,
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

  const handleLineSelectionForReorder = (lineName) => {
    
    const storedBranchName = localStorage.getItem("selected_branch_name");
    
    const filteredData = originalData.filter(item => 
        item.line_allocations?.some(
            allocation => allocation.line_name === lineName && allocation.branch_name === storedBranchName
        )
    );

    if (filteredData.length === 0) {
      notification.warning({
        message: "No Users Found",
        description: `No users available for line "${lineName}".`,
      });
      setSelectedLine(null);
      setLineSelectionModalVisible(false);
      setTempSelectedLine(null);
      return;
    }
    
    setSelectedLine(lineName);
    setTableData(filteredData);

    setTableHeader((prev) => {
      const baseHeaders = header.filter(item => !["move", "order"].includes(item.value));
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

  const handleReOrder = (event, row) => {
    event.preventDefault();
    setRowReorderred(true);
    setOrder((prev) => ({ ...prev, [row.id]: event.target.value }));
  };

  const handleDragEnd = (data) => {
    setTableData(data);
    setRowReorderred(true);
  };

  const handleCancel = (data = originalData, grouped = null) => {
    const filtered = header.filter(
      (item) => !["move", "order"].includes(item.value)
    );
    setIsDragMode(false);
    setTableHeader(filtered);
    setReorder(false);
    setSelectedLine(null);
    setTempSelectedLine(null);
    setRowReorderred(false); 

    const storedBranchName = localStorage.getItem("selected_branch_name");
    
    let filteredData = data;
    if (storedBranchName) {
      filteredData = data.filter(
        (item) => item.line_allocations?.some(allocation => allocation.branch_name === storedBranchName)
      );
    }
    
    setTableData(filteredData);
    const finalGrouped = grouped || groupUsersByLine(filteredData);
    setGroupedData(finalGrouped);
    
    // Set all lines to collapsed after canceling
    initializeLineExpansionState(finalGrouped, false);

    // Re-initialize pagination
    Object.keys(finalGrouped).forEach(lineName => {
      initializeLinePagination(lineName, finalGrouped[lineName].length);
    });

    setSearchText("");
    setShowReset(false);
  };

  const onDelete = async (record) => {
    try {
      setDeleteLoader(true);
      const response = await DELETE(`${USERS}${record.id}/`);
      if (response?.status === 200) {
        const updatedOriginal = originalData.filter((item) => item.id !== record.id);
        setOriginalData(updatedOriginal);
        
        const storedBranchName = localStorage.getItem("selected_branch_name");
        let updatedData = updatedOriginal;
        if (storedBranchName) {
            updatedData = updatedOriginal.filter(
                (item) => item.line_allocations?.some(allocation => allocation.branch_name === storedBranchName)
            );
        }
        
        setTableData(updatedData);
        const grouped = groupUsersByLine(updatedData);
        setGroupedData(grouped);
        
        // Ensure the expanded state is updated for remaining lines
        setExpandedLines(prev => {
            const newExpanded = {};
            Object.keys(grouped).forEach(lineName => {
                // If the line existed before, keep its state. Otherwise, default to collapsed (false).
                newExpanded[lineName] = true;
            });
            return newExpanded;
        });

        api.success({
          message: `${record?.full_name.toUpperCase()} User Deleted!`,
          description: "The user has been deleted successfully.",
          duration: 0,
        });
      } else {
        api.error({
          message: "User Delete",
          description: "The user is not deleted.",
          duration: 0,
        });
      }
      setDeleteLoader(false);
      setShowConfirm(false);
    } catch (error) {
      setDeleteLoader(false);
      setShowConfirm(false);
      api.error({
        message: "User Delete",
        description: "The user is not deleted.",
        duration: 0,
      });
    }
  };

  const handleColumnChange = async (value) => {
    try {
      const res = await POST(COLUMNCHANGE, {
        entity: "user",
        columns: value,
      });
      setSelectedColumn(value);
      if (res.status === 200) {
        getUserDetails();
      }
    } catch (error) {
      throw error;
    }
  };

  // const getSelectedColumn = async () => {
  //   try {
  //     const res = await GET(SELECTEDCOLUMN);
  //     if (res.status === 200) {
  //       setSelectedColumn(res?.data?.user || []);
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // };
  
  // Updated scroll logic to use block: 'start' for better visibility of expanded content
  const handleUserAction = (lineName, userId) => {
    const key = `${lineName}-${userId}`;
    setOpenSwipeId(null);
    setExpandedUsers((prev) => {
      const newState = {
        [key]: !prev[key]
      };

      // Scroll logic for expansion
      if (newState[key]) {
        setTimeout(() => {
          const element = document.getElementById(`user-item-${userId}`);
          if (element) {
             // Scroll the item to the start of the visible area. 
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

  const handleSwipeStateChange = (userId, isOpen) => {
    if (isOpen) {
      setOpenSwipeId(userId);
    } else if (openSwipeId === userId) {
      setOpenSwipeId(null);
    }
  };
  
  const handleEditUser = (user) => navigate(`/user/edit/${user.id}`);


  const handleReset = () => {
    const storedBranchName = localStorage.getItem("selected_branch_name");
    let filteredData = originalData;
    if (storedBranchName) {
      filteredData = originalData.filter(
        (item) => item.line_allocations?.some(allocation => allocation.branch_name === storedBranchName)
      );
    }
    
    const grouped = groupUsersByLine(filteredData);

    const newPagination = {};
    Object.keys(grouped).forEach(lineName => {
      newPagination[lineName] = {
        displayed: Math.min(USERS_PAGE_SIZE, grouped[lineName].length),
        total: grouped[lineName].length
      };
    });

    setTableData(filteredData);
    setGroupedData(grouped);
    setUsersPagination(newPagination);
    
    // Set all lines to collapsed after resetting
    initializeLineExpansionState(grouped, false);

    setShowReset(false);
    setSelectedLine(null);
    setSearchText("");

    notification.success({
      message: "Data Reset",
      description: "Restored to the original view successfully.",
    });
  };

  const handleSearch = () => {
    const query = searchText.trim().toLowerCase();
    const storedBranchName = localStorage.getItem("selected_branch_name");
    
    let searchSource = originalData;
    if (storedBranchName) {
        searchSource = originalData.filter(
            (item) => item.line_allocations?.some(allocation => allocation.branch_name === storedBranchName)
        );
    }

    if (!query) {
      handleReset();
      setSearchModalVisible(false);
      return;
    }

    const filtered = searchSource.filter((item) => {
      const fullName = (item.full_name || "").toLowerCase();
      return fullName.includes(query)
    });

    setTableData(filtered);
    const grouped = groupUsersByLine(filtered);
    setGroupedData(grouped);
    
    // UPDATED: Set all lines to EXPANDED after search so the results are visible
    initializeLineExpansionState(grouped, true);

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
      title={<div className="list-user-search-modal-title">Search User</div>}
      open={searchModalVisible}
      onOk={handleSearch}
      onCancel={() => setSearchModalVisible(false)}
      okText="Search"
    >
      <p className="list-user-search-modal-label">Enter User Name:</p>
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Enter user name to search"
        className="list-user-search-input"
      />
    </Modal>
  );

  const lineSelectionModal = (
      <Modal
          title={
              <div style={{ textAlign: 'center' }}>
                  Select Line to Reorder
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
        <div style={{ marginBottom: '15x' }}>
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
            />
        </div>
      </Modal>
  );


  return (
    <div className="list-user-page-content">
      {contextHolder}
      <div className="list-user-header-container">
        {reOrder ? (
          <div>
            <h2 className="list-user-title">
              Reorder User
            </h2>
            <div className="list-user-reorder-info">
              Selected Line: <span className="list-user-line-name">{selectedLine}</span>
            </div>
          </div>
        ) : (
          <h2 className="list-user-title">User List</h2>
        )}

        <div className="list-user-actions">
          {reOrder ? (
            <>
              <span className="list-user-switch-label">Slide</span>
              <Switch
                checked={isDragMode}
                onChange={(checked) => setIsDragMode(checked)}
              />
            </>
          ) : (
            <>
              <Button
                icon = {<SwapOutlined rotate={90}/>}
                onClick={clickReorder}
                disabled={reOrder || tableLoader}
                className="list-user-reorder-button"
              >
               {!isMobile&&"Reorder"}
              </Button>
             
              <Button
                icon={<SearchOutlined />}
                onClick={() => setSearchModalVisible(true)}
                type="default"
              >
                {!isMobile && "Search User"}
              </Button>
               {showReset && (
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  title="Reset to Original"
                />
              )}
            </>
          )}
        </div>
      </div>
      {searchModal}
      {lineSelectionModal}

      {tableLoader && <Loader />}

      {/* --- Reorder Mode --- */}
      {reOrder ? (
        <div>
          <Table
            data={tableData}
            reOrder={reOrder} 
            Header={
              isDragMode
                ? [
                    { label: "S.No", value: "index" },
                    { label: "Full Name", value: "full_name" },
                    { label: "Move", value: "move" },
                  ]
                : [
                    { label: "S.No", value: "index" },
                    { label: "Reorder", value: "order" },
                    { label: "Full Name", value: "full_name" },
                  ]
            }
            filterOption={filterOption}
            handleDragEnd={isDragMode ? handleDragEnd : undefined}
            handleReOrder={!isDragMode ? handleReOrder : undefined}
            deleteLoader={deleteLoader}
            setShowConfirm={setShowConfirm}
            showConfirm={showConfirm}
            name="user"
          />

          <div className="list-user-table-actions">
            <Button
              type="primary"
              onClick={SumbitReorder}
              loading={reorderLoader}
              disabled={reorderLoader || !rowReorderred} 
            >
              Submit
            </Button>
            <Button onClick={() => handleCancel()}>Cancel</Button>
          </div>
        </div>
      ) : (
        /* --- Normal View Mode (Grouped List) --- */
        <div
          id="scrollableDiv"
          className="list-user-scrollable-div"
        >
          {showReset && searchText && (
            <div className="list-user-search-results">
              <span className="list-user-search-label">
               
                 <Tag color="blue" style={{ fontSize: 14, padding: "2px 8px" }}>
        Full Name = "{searchText}"
      </Tag>
              </span>
            </div>
          )}

          {Object.keys(groupedData).map((lineName) => {
            const lineDataSource = groupedData[lineName];
            const isLineExpanded = expandedLines[lineName]; 
            
            return (
              <div
                key={lineName}
                className="list-user-line-group"
              >
                {/* LINE HEADER: Added onClick handler for expand/collapse (Accordion) */}
                <div 
                    className="list-user-line-header"
                  
                >
                  <div className="list-user-line-title-container">
                   
                    <Image src={userIcon} height={30} width={30} preview={false}  />
                    <span className="list-user-line-title">
                      {lineName}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px'}}>
                    {/* <Badge
                        count={lineDataSource.length}
                        className={showReset ? "list-user-badge list-user-badge-search" : "list-user-badge"}
                    /> */}
                     <div className={showReset ? "investment-list-badge investment-list-badge-search" : "investment-list-badge"}>
    {groupedData[lineName].length}
  </div>

                    {/* EXPAND/COLLAPSE ICON: Rotate based on state
                    <CaretDownOutlined 
                        style={{ 
                            transition: 'transform 0.3s',
                            transform: isLineExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
                        }} 
                    /> */}
                  </div>
                </div>

                {/* CONDITIONAL RENDERING: Only render the list if the line is expanded */}
                {isLineExpanded && (
                    <div
                        id={'scrollableDiv-' + lineName}
                        className="list-user-list-container"
                    >
                      <InfiniteScroll
                        dataLength={usersPagination[lineName]?.displayed || USERS_PAGE_SIZE}
                        next={() => loadMoreUsers(lineName)}
                        hasMore={
                          (usersPagination[lineName]?.displayed || 0) <
                          (usersPagination[lineName]?.total || 0)
                        }
                        loader={
                          <div className="list-user-skeleton-container">
                            <Skeleton avatar paragraph={{ rows: 1 }} active />
                          </div>
                        }
                        endMessage={
                          <Divider plain className="list-user-divider-container">
                            <span className="list-user-divider-star">★ </span>
                            <span className="list-user-divider-text">
                              End of{" "}
                              <span className="list-user-divider-line-name">
                                {lineName}
                              </span> line{" "}
                              <span className="list-user-divider-star">★</span>
                            </span>
                          </Divider>
                        }
                        scrollableTarget={'scrollableDiv-' + lineName}
                      >
                        <List
                          dataSource={
                            lineDataSource.slice(
                              0,
                              usersPagination[lineName]?.displayed || USERS_PAGE_SIZE
                            )
                          }
                          className="list-user-list"
                          renderItem={(user, index) => {
                            const isExpanded = expandedUsers[lineName + '-' + user.id];
                            const lineIndex = index + 1;

                            return (
                              <div
                                key={user.id}
                                id={'user-item-' + user.id}
                                className="list-user-list-item-wrapper"
                              >
                                {isMobile ? (
                                  <SwipeablePanel
                                    item={{...user, lineIndex, title: user.full_name}} 
                                    index={user.id}
                                    titleKey="full_name"
                                    name="user"
                                    avatarSrc={userIcon}
                                    onSwipeRight={!isExpanded ? () => handleEditUser(user) : undefined}
                                    onSwipeLeft={!isExpanded ? () => onDelete(user) : undefined}
                                    isExpanded={isExpanded}
                                    onExpandToggle={() => handleUserAction(lineName, user.id)}
                                    renderContent={() => (
                                      isExpanded ? (
                                        <UserCollapseContent user={user} />
                                      ) : null
                                    )}
                                    isSwipeOpen={openSwipeId === user.id}
                                    onSwipeStateChange={(isOpen) => handleSwipeStateChange(user.id, isOpen)}
                                  />
                                ) : (
                                  <>
                                    <List.Item
                                      className={isExpanded ? "list-user-list-item list-user-list-item-expanded" : "list-user-list-item"}
                                    >
                                      <List.Item.Meta
                                        avatar={
                                          <div className="list-user-avatar-container">
                                            
                                            {/* <img
                                              src={userIcon}
                                              alt="user-icon"
                                              className="list-user-avatar-icon"
                                            /> */}
                                            {/* <Avatar src={lineIcon}/> */}
                                            <span className="list-user-index-badge">{lineIndex}</span>
                                          </div>
                                        }
                                        title={
                                          <div
                                            onClick={() => handleUserAction(lineName, user.id)}
                                            className="list-user-item-title-container"
                                          >
                                            <span className="list-user-item-title">
                                              {user.full_name}
                                            </span>
                                            <Dropdown
                                              overlay={
                                                <Menu>
                                                  <Menu.Item
                                                    key="edit"
                                                    onClick={(e) => {
                                                      e.domEvent.stopPropagation();
                                                      handleEditUser(user);
                                                    }}
                                                  >
                                                     <div className="d-flex align-items-center gap-1">
          <span className="mdi mdi-pencil text-secondary mb-0"></span>
          <span>Edit</span>
        </div>
                                                  </Menu.Item>
                                                  <Menu.Item key="delete" >
  <Popconfirm
    // **Customize the title for the User context**
    title={`Delete user ${user.name || user.userName || 'this user'}?`} 
    description="Are you sure you want to delete this user permanently?"
    icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
    onConfirm={(e) => {
      e.stopPropagation();
      onDelete(user); // Calls onDelete only after user confirms
    }}
    okText="Delete"
    cancelText="Cancel"
    okButtonProps={{ danger: true, type: "primary" }}
    cancelButtonProps={{ type: "default" }}
    onClick={(e) => e.stopPropagation()} // Prevents the dropdown from closing early
  >
    <div className="d-flex align-items-center gap-1" style={{ color: "red" }}>
      {/* Assuming you have the DeleteFilled icon imported */}
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
                                                className="list-user-ellipsis-icon"
                                                onClick={(e) => e.stopPropagation()}
                                              />
                                            </Dropdown>
                                          </div>
                                        }
                                        description={<span style={{color: '#8c8c8c'}}>{user.email} | {user.role}</span>}
                                      />
                                    </List.Item>

                                    {isExpanded && (
                                      <div className="list-user-collapse-content">
                                        <UserCollapseContent user={user} />
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
                )}
              </div>
            );
          })}

          {Object.keys(groupedData).length === 0 && !tableLoader && (
            <div className="list-user-no-data">
              <p>No users found {showReset && searchText ? 'for "' + searchText + '"' : "for the selected branch"}</p>
            </div>
          )}
        </div>
      )}

      {!reOrder && (
        <FloatButton
          icon={<PlusOutlined />}
          type="primary"
          tooltip={<div>Add New User</div>}
          onClick={() => navigate("/user/add")}
          className="list-user-float-button"
        />
      )}
    </div>
  );
};

export default ListUser;