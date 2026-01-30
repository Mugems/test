import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  notification,
  Grid,
  List,
  Avatar,
  Image,
  Dropdown,
  Menu,
  Modal,
  Divider,
  Skeleton,
  Select,
  Switch,
  Input,
  Popconfirm,
  Tag,
  Spin
} from "antd";
import { GET, DELETE, POST } from "helpers/api_helper";
import { AREA,CUSTOMERS } from "helpers/url_helper";
import Loader from "components/Common/Loader";
import SwipeablePanel from "components/Common/SwipeablePanel";
import Table from "components/Common/Table";
import {
  EllipsisOutlined,
  ReloadOutlined,
  PlusOutlined,
  SearchOutlined,
  DeleteFilled,ExclamationCircleOutlined,
  SwapOutlined
} from "@ant-design/icons";
import { FloatButton } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import customerIcon from "../../../assets/icons/user.png";
import "./ViewCustomer.css";
import CustomerCollapseContent from "components/Common/CustomerCollapseContent";

const ViewCustomer = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [originalCustomers, setOriginalCustomers] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [tableLoader, setTableLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [expandedAreas, setExpandedAreas] = useState({});
  const [openSwipeId, setOpenSwipeId] = useState(null);
  const [customersPagination, setCustomersPagination] = useState({});

  // Document states
  const [customerDocuments, setCustomerDocuments] = useState({});
  const [loadingDocuments, setLoadingDocuments] = useState({});

  // Filter states
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [lines, setLines] = useState([]);
  const [areas, setAreas] = useState([]);
  const [allAreas, setAllAreas] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [areaIdToNameMap, setAreaIdToNameMap] = useState({});

  // Modal states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [tempLine, setTempLine] = useState(null);
  const [tempArea, setTempArea] = useState(null);

  // Reorder states
  const [reOrder, setReorder] = useState(false);
  const [rowReorderred, setRowReorderred] = useState(false);
  const [order, setOrder] = useState({});
  const [reorderLoader, setReorderLoader] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false);
  const [reorderAreaName, setReorderAreaName] = useState(null);

  // Search states (NEW - based on ViewArea.jsx)
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [lineLoading, setLineLoading] = useState(false);
const [areaLoading, setAreaLoading] = useState(false);

  
  const CUSTOMERS_PAGE_SIZE = 10;

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    // Get branch from localStorage
     localStorage.removeItem('selected_line_name');
    localStorage.removeItem('selected_area_id');
    localStorage.removeItem('selected_area_name');
    const branchData = localStorage.getItem('selected_branch_name');
    if (branchData) {
      try {
        const branch = JSON.parse(branchData);
        setSelectedBranch(branch.branch_name || branch.name || branch);
      } catch (e) {
        setSelectedBranch(branchData);
      }
    }

    if (!branchData) {
      notification.warning({
        message: "Branch Not Selected",
        description: "Please select a branch first.",
      });
      return;
    }

    fetchAreaData();
    fetchCustomerData();

    // Check if line and area are already selected in localStorage
    const savedLine = localStorage.getItem('selected_line_name');
    const savedAreaId = localStorage.getItem('selected_area_id');
     const savedArea = localStorage.getItem('selected_area_name');


    if (savedLine && savedAreaId) {
      // If both are saved, set them and skip the modal
      setTempLine(savedLine);
      setTempArea(parseInt(savedAreaId));
      setSelectedLine(savedLine);
      setSelectedArea(parseInt(savedAreaId));
      
      // Don't show the filter modal since we have saved selections
      setFilterModalVisible(false);
    } else {
      // Show the filter modal if no saved selections
      setFilterModalVisible(true);
    }
  }, []);

  // Auto-apply filter when data is loaded and we have saved selections
  useEffect(() => {
    if (selectedLine && selectedArea && originalCustomers.length > 0 && Object.keys(areaIdToNameMap).length > 0) {
      const filtered = originalCustomers.filter(
        (customer) => customer.area === selectedArea
      );

      if (filtered.length > 0) {
        setCustomers(filtered);
        const grouped = groupCustomersByArea(filtered);
        setGroupedData(grouped);

        Object.keys(grouped).forEach((areaName) => {
          initializeAreaPagination(areaName, grouped[areaName].length);
        });
      }
    }
  }, [originalCustomers, areaIdToNameMap, selectedLine, selectedArea]);

  const fetchAreaData = async () => {
    setLineLoading(true)
    try {
      const response = await GET(AREA);
      if (response?.status === 200) {
        const branchData = localStorage.getItem('selected_branch_name');
        let currentBranch = selectedBranch;
        
        if (branchData && !currentBranch) {
          try {
            const branch = JSON.parse(branchData);
            currentBranch = branch.branch_name || branch.name || branch;
          } catch (e) {
            currentBranch = branchData;
          }
        }

        // Create area ID to name mapping
        const areaMap = {};
        response.data.forEach((area) => {
          areaMap[area.id] = area.areaName;
        });
        setAreaIdToNameMap(areaMap);

        // Filter areas by selected branch
        const branchAreas = response.data.filter(
          (area) => area.branch_name === currentBranch
        );

        setAllAreas(branchAreas);

        // Extract unique lines for the selected branch
        const uniqueLines = [...new Set(branchAreas.map((a) => a.line_name))].filter(Boolean);

        setLines(
          uniqueLines.sort().map((name) => ({ label: name, value: name }))
        );
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to fetch area data",
      });
     
      }
       finally{
        setLineLoading(false);
    }
  };

  const fetchCustomerData = async () => {
    try {
      setTableLoader(true);
      const response = await GET("/api/customers/");
      if (response?.status === 200) {
        setOriginalCustomers(response.data);
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to fetch customer data",
      });
    } finally {
      setTableLoader(false);
    }
  };

  // Fetch documents for a specific customer
  const fetchCustomerDocuments = async (customerId) => {
    if (customerDocuments[customerId]) {
      return customerDocuments[customerId];
    }

    setLoadingDocuments((prev) => ({ ...prev, [customerId]: true }));
    
    try {
      const response = await GET(`/api/customer-documents/customer/${customerId}/documents/`);
      
      let documents = [];
      
      if (response && response.error) {
        documents = [];
      } else if (response && Array.isArray(response.data)) {
        documents = response.data;
      } else if (response && Array.isArray(response)) {
        documents = response;
      } else {
        documents = [];
      }

      setCustomerDocuments((prev) => ({
        ...prev,
        [customerId]: documents,
      }));

      return documents;
      
    } catch (error) {
      setCustomerDocuments((prev) => ({
        ...prev,
        [customerId]: [],
      }));
      
      if (!error.message?.includes('Customer not found')) {
        notification.error({
          message: 'Error',
          description: 'Failed to fetch customer documents',
          duration: 3,
        });
      }
      
      return [];
    } finally {
      setLoadingDocuments((prev) => ({ ...prev, [customerId]: false }));
    }
  };

  const groupCustomersByArea = (data) => {
    const grouped = {};
    data.forEach((customer) => {
      const areaName = areaIdToNameMap[customer.area] || `Area ${customer.area}` || "Uncategorized";
      if (!grouped[areaName]) {
        grouped[areaName] = [];
      }
      grouped[areaName].push(customer);
    });
    return grouped;
  };

  const initializeAreaPagination = (areaName, totalCustomers) => {
    setCustomersPagination((prev) => ({
      ...prev,
      [areaName]: {
        displayed: Math.min(CUSTOMERS_PAGE_SIZE, totalCustomers),
        total: totalCustomers,
      },
    }));
  };

  const loadMoreCustomers = (areaName) => {
    setCustomersPagination((prev) => {
      const current = prev[areaName] || { displayed: 0, total: 0 };
      return {
        ...prev,
        [areaName]: {
          ...current,
          displayed: Math.min(
            current.displayed + CUSTOMERS_PAGE_SIZE,
            current.total
          ),
        },
      };
    });
  };

  // Update areas dropdown when line is selected
  const handleLineChange = (lineName) => {
    setTempLine(lineName);
    setTempArea(null);
     setAreaLoading(true);
    
    const lineAreas = allAreas.filter(
      (area) => area.line_name === lineName
    );
    
    const areaOptions = lineAreas.map((area) => ({
      label: area.areaName,
      value: area.id,
    }));
    
    setAreas(areaOptions);
     setAreaLoading(false);
  };

  const handleApplyFilter = () => {
    if (!tempLine || !tempArea) {
      notification.warning({
        message: "Incomplete Selection",
        description: "Please select both Line and Area to proceed.",
      });
      return;
    }

    setSelectedLine(tempLine);
    setSelectedArea(tempArea);

    // Store selected line and area in localStorage
    localStorage.setItem('selected_line_name', tempLine);
    localStorage.setItem('selected_area_id', tempArea);
    localStorage.setItem('selected_area_name', areaIdToNameMap[tempArea] || tempArea);

    const filtered = originalCustomers.filter(
      (customer) => customer.area === tempArea
    );

    setCustomers(filtered);
    const grouped = groupCustomersByArea(filtered);
    setGroupedData(grouped);

    Object.keys(grouped).forEach((areaName) => {
      initializeAreaPagination(areaName, grouped[areaName].length);
    });

    setFilterModalVisible(false);

    if (filtered.length === 0) {
      notification.warning({
        message: "No Customers Found",
        description: `No customers found for the selected Line and Area.`,
      });
    }
    // } else {
    //   notification.success({
    //     message: "Filter Applied",
    //     description: `${filtered.length} customer(s) found.`,
    //   });
    // }
  };

 const handleReset = () => {
  setSelectedLine(null);
  setSelectedArea(null);
  setTempLine(null);
  setTempArea(null);
  setCustomers([]);
  setGroupedData({});
  setCustomerDocuments({});
  setAreas([]);
  setReorder(false);
  setReorderAreaName(null);
  setOrder({});
  setRowReorderred(false);
  setIsDragMode(false);
  
  // Reset search states
  setSearchText("");
  setShowReset(false);
  
  setFilterModalVisible(true);

  // Clear localStorage
  localStorage.removeItem('selected_line_name');
  localStorage.removeItem('selected_area_id');
  localStorage.removeItem('selected_area_name');

  
};

  // --- NEW SEARCH LOGIC (based on ViewArea.jsx) ---

  const handleSearchReset = () => {
    if (!selectedArea) return;

    // Restore the data filtered by selected Area
    const filtered = originalCustomers.filter(
      (customer) => customer.area === selectedArea
    );
    
    setCustomers(filtered); // Customers should already be this, but ensure it.
    const grouped = groupCustomersByArea(filtered);
    setGroupedData(grouped);
    
    Object.keys(grouped).forEach((areaName) => {
      initializeAreaPagination(areaName, grouped[areaName].length);
    });
    
    setShowReset(false);
    setSearchText("");
    
   
  };

  const handleSearch = () => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      // Just close the modal if search is empty
      setSearchModalVisible(false);
      return;
    }
    
    // The search in ViewCustomer should search customers for the *current area* only, 
    // which are already in the 'customers' state.
    const filtered = customers.filter((customer) => {
      return (
        customer.customer_name?.toLowerCase().includes(query)
        // customer.customer_id?.toLowerCase().includes(query) ||
        // customer.mobile_number?.includes(query) ||
        // customer.email_id?.toLowerCase().includes(query) ||
        // customer.aadhaar_id?.includes(query) ||
        // customer.pan_number?.toLowerCase().includes(query) ||
        // customer.address?.toLowerCase().includes(query) ||
        // customer.profession?.toLowerCase().includes(query)
      );
    });

    // Update grouped data with search results
    const grouped = groupCustomersByArea(filtered);
    setGroupedData(grouped);

    // Re-initialize pagination for search results
    Object.keys(grouped).forEach((areaName) => {
      initializeAreaPagination(areaName, grouped[areaName].length);
    });

    setSearchModalVisible(false);
    setShowReset(true);

    if (filtered.length === 0) {
      notification.warning({
        message: "No Results",
        description: `No matches found for "${searchText}".`,
      });
    } 
  };
  // --- END NEW SEARCH LOGIC ---

  // Reorder functions
  const clickReorder = () => {
    if (!selectedArea) {
      notification.warning({
        message: "No Area Selected",
        description: "Please select an area first.",
      });
      return;
    }

    const areaName = areaIdToNameMap[selectedArea];
    setReorderAreaName(areaName);
    setReorder(true);
    setIsDragMode(false);
    setOrder({});
    setRowReorderred(false);
    setShowReset(false); // Reset search state when entering reorder
  };

  const handleReOrder = (event, row) => {
    event.preventDefault();
    setRowReorderred(true);
    setOrder((prev) => ({ ...prev, [row.id]: event.target.value }));
  };

  const handleDragEnd = (data) => {
    setCustomers(data);
    setRowReorderred(true);
  };

  const sortData = (order) => {
    if (Object.keys(order).length > 0) {
      const reorderedData = [...customers];
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
    return customers;
  };

  const submitReorder = async () => {
    try {
      setReorderLoader(true);

      const reorderedData = Object.keys(order)?.length > 0 ? sortData(order) : customers;
      
      const apiPayload = reorderedData.map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      const response = await POST(`${CUSTOMERS}reorder/`, apiPayload);
      
      if (response?.status === 200) {
        setCustomers(reorderedData);
        const grouped = groupCustomersByArea(reorderedData);
        setGroupedData(grouped);

        Object.keys(grouped).forEach((areaName) => {
          initializeAreaPagination(areaName, grouped[areaName].length);
        });

        setReorder(false);
        setReorderAreaName(null);
        setOrder({});
        setRowReorderred(false);
        setIsDragMode(false);

        notification.success({
          message: "Re-Ordered",
          description: `The customer order has been updated successfully.`,
          duration: 3,
        });
      } else {
        notification.error({
          message: "Re-Order Failed",
          description: "Failed to update the order",
          duration: 3,
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

  const handleCancelReorder = () => {
    setReorder(false);
    setReorderAreaName(null);
    setOrder({});
    setRowReorderred(false);
    setIsDragMode(false);

    // Restore original data
    const filtered = originalCustomers.filter(
      (customer) => customer.area === selectedArea
    );
    setCustomers(filtered);
    const grouped = groupCustomersByArea(filtered);
    setGroupedData(grouped);

    Object.keys(grouped).forEach((areaName) => {
      initializeAreaPagination(areaName, grouped[areaName].length);
    });
  };

  const handleCustomerAction = async (areaName, customerId) => {
    const key = `${areaName}-${customerId}`;
    const wasExpanded = expandedAreas[key];
    
    setOpenSwipeId(null);
    setExpandedAreas((prev) => {
      const newState = {
        [key]: !prev[key],
      };

      if (newState[key] && !wasExpanded) {
        fetchCustomerDocuments(customerId);
        
        setTimeout(() => {
          const element = document.getElementById(`customer-item-${customerId}`);
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }, 100);
      }

      return newState;
    });
  };

  const handleSwipeStateChange = (customerId, isOpen) => {
    if (isOpen) {
      setOpenSwipeId(customerId);
    } else if (openSwipeId === customerId) {
      setOpenSwipeId(null);
    }
  };

  const handleEditCustomer = (customer) =>
    navigate(`/customer/edit/${customer.id}`);

  const onDelete = async (record) => {
    try {
      setDeleteLoader(true);
      const response = await DELETE(`/api/customers/${record.id}/`);
      if (response?.status === 200) {
        const updatedData = customers.filter((item) => item.id !== record.id);
        setCustomers(updatedData);
        setGroupedData(groupCustomersByArea(updatedData));
        
        setCustomerDocuments((prev) => {
          const updated = { ...prev };
          delete updated[record.id];
          return updated;
        });
        
        notification.success({
          message: `Customer ${record?.customer_id} Deleted!`,
          description: "The customer has been deleted successfully",
          duration: 3,
        });
      } else {
        notification.error({
          message: "Customer Delete",
          description: "The customer was not deleted",
          duration: 3,
        });
      }
      setDeleteLoader(false);
    } catch (error) {
      setDeleteLoader(false);
      notification.error({
        message: "Customer Delete",
        description: "The customer was not deleted",
        duration: 3,
      });
    }
  };


  const filterModal = (
    <Modal
      title={
        <div style={{ textAlign: "center" }}>Select Line & Area</div>
      }
      open={filterModalVisible}
      onCancel={() => {
        if (selectedLine && selectedArea) {
          setFilterModalVisible(false);
        } else {
          notification.warning({
            message: "Selection Required",
            description: "Please select both Line and Area to view customers.",
          });
        }
      }}
      footer={[
        <Button
          key="reset"
          onClick={() => {
            setTempLine(null);
            setTempArea(null);
            setAreas([]);
          }}
        >
          Clear
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!tempLine || !tempArea}
          onClick={handleApplyFilter}
        >
          Apply
        </Button>,
      ]}
      closable={selectedLine && selectedArea}
    >
      {selectedBranch && (
        <div style={{ marginBottom: "15px", padding: "10px", background: "#f0f5ff", borderRadius: "4px" }}>
          <strong>Selected Branch:</strong> {selectedBranch}
        </div>
      )}

      <div style={{ marginBottom: "15px" }}>
        <label
          htmlFor="line-select"
          style={{ fontWeight: "400", display: "block", marginBottom: "5px" }}
        >
          Select Line Name
        </label>
        <Select
          id="line-select"
          placeholder="Select a line"
          style={{ width: "100%" }}
          onChange={handleLineChange}
          value={tempLine}
          options={lines}
           notFoundContent={lineLoading ? <Spin size="small" /> : "No data"}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label
          htmlFor="area-select"
          style={{ fontWeight: "400", display: "block", marginBottom: "5px" }}
        >
          Select Area Name
        </label>
        <Select
          id="area-select"
          placeholder="Select an area"
          style={{ width: "100%" }}
          onChange={setTempArea}
          value={tempArea}
          options={areas}
          disabled={!tempLine}
          loading={areaLoading}
        />
      </div>
    </Modal>
  );

  // --- NEW SEARCH MODAL JSX ---
  const searchModal = (
    <Modal
      title={
        <div style={{ textAlign: "center" }}>Search Customer</div>
      }
      open={searchModalVisible}
      onOk={handleSearch}
      onCancel={() => setSearchModalVisible(false)}
      okText="Search"
    >
      <div style={{ marginBottom: "15px" }}>
        <label
          htmlFor="search-input"
          style={{ fontWeight: "400", display: "block", marginBottom: "5px" }}
        >
         Enter Customer Name
        </label>
        <Input
          id="search-input"
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Enter customer details to search"
          size="large"
          style={{ width: '100%' }}
        />
      </div>
    </Modal>
  );
  // --- END NEW SEARCH MODAL JSX ---

  return (
    <div className="view-customer-page-content">
      <div className="view-customer-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
  <div className="view-customer-header-left">
    {reOrder ? (
      <div>
        <h2 className="view-customer-title">Reorder Customers</h2>
        <div style={{ marginTop: '8px' }}>
          <span style={{ marginRight: '8px', color: '#666' }}>Selected Area:</span>
          <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
            {reorderAreaName}
          </Tag>
        </div>
      </div>
    ) : (
      <h2 className="view-customer-title">Customer List</h2>
    )}
  </div>

  <div className="view-customer-actions">
    {reOrder ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px',marginTop: '5px' }}>
        <span className="view-customer-switch-label">Slide</span>
        <Switch
          checked={isDragMode}
          onChange={(checked) => setIsDragMode(checked)}
        />
      </div>
    ) : (
      <>
        <Button
          icon={<SwapOutlined rotate={90}/>}
          onClick={clickReorder}
          disabled={reOrder || tableLoader || !selectedArea || showReset}
          className="view-customer-reorder-button"
          title="Reorder Customers"
        >
          {!isMobile && "Reorder"}
        </Button>
        <Button
          icon={<SearchOutlined />}
          onClick={() => setSearchModalVisible(true)}
          type="default"
          disabled={!selectedArea || tableLoader}
        >
          {!isMobile && "Search Customer"}
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleReset}
          title="Change Area"
          disabled={reOrder || tableLoader}
        >
          {!isMobile && "Change Area"}
        </Button>
      </>
    )}
  </div>

      </div>

      {filterModal}
      {searchModal} {/* Render the new search modal */}

      {tableLoader && <Loader />}

      {reOrder ? (
        <div>
          <Table
            data={customers}
            reOrder={isDragMode}
            Header={
              isDragMode
                ? [
                    { label: "S.No", value: "index" },
                    { label: "Customer Name", value: "customer_name" },
                   
                    { label: "Move", value: "move" },
                  ]
                : [
                    { label: "S.No", value: "index" },
                    { label: "Reorder", value: "order" },
                    { label: "Customer Name", value: "customer_name" },
                   
                  ]
            }
            handleDragEnd={isDragMode ? handleDragEnd : undefined}
            handleReOrder={!isDragMode ? handleReOrder : undefined}
            deleteLoader={deleteLoader}
            name="customer"
          />

          <div className="view-customer-table-actions">
            <Button
              type="primary"
              onClick={submitReorder}
              loading={reorderLoader}
              disabled={reorderLoader || !rowReorderred}
            >
              Submit
            </Button>
            <Button onClick={handleCancelReorder}>Cancel</Button>
          </div>
        </div>
      ) : (
       <div id="scrollableDiv" className="view-customer-scrollable-div">
  {/* Display filter info - Always show when filters are selected */}
  {selectedBranch && selectedLine && selectedArea && (
    <>
     <Divider style={{ margin: '5px 0'}} />
    <div className="view-customer-filter-info">
        
      <Tag className="view-customer-filter-label" color="blue">
        Line: {selectedLine}
      </Tag>
      
      {/* Show search pattern if in search mode */}
      {showReset && searchText && (
        <>
          <Tag className="view-customer-filter-label" color="purple">
            Name = "{searchText}"
          </Tag>
          <Button 
            type="link" 
            size="small"
            onClick={handleSearchReset} 
            style={{padding: '0 8px', height: 'auto', fontSize: '12px'}}
          >
            ✕ 
          </Button>
           
        </>
      )}
    
    </div>
     <Divider style={{ margin: '5px 0'}} />
    
    </>
  )}

          {Object.keys(groupedData).map((areaName) => {
            return (
              <div key={areaName} className="view-customer-area-group">
                <div className="view-customer-area-header">
                  <div className="view-customer-area-title-container">
                    {/* <Avatar src={areaIcon}>
                      {areaName?.charAt(0)?.toUpperCase()}
                    </Avatar> */}
                     <Image preview={false}  src={customerIcon} width={30} height={30} />
                    <span className="view-customer-area-title">{areaName}</span>
                  </div>
                  {/* <Badge
                    count={groupedData[areaName].length}
                    className="view-customer-badge"
                  /> */}
                  <div className={"view-customer-badge"}>
    {groupedData[areaName].length}
  </div>
                </div>

                <div
                  id={"scrollableDiv-" + areaName}
                  className="view-customer-list-container"
                >
                  <InfiniteScroll
                    dataLength={
                      customersPagination[areaName]?.displayed ||
                      CUSTOMERS_PAGE_SIZE
                    }
                    next={() => loadMoreCustomers(areaName)}
                    hasMore={
                      (customersPagination[areaName]?.displayed || 0) <
                      (customersPagination[areaName]?.total || 0)
                    }
                    loader={
                      <div className="view-customer-skeleton-container">
                        <Skeleton avatar paragraph={{ rows: 1 }} active />
                      </div>
                    }
                    endMessage={
                      <Divider plain className="view-customer-divider-container">
                        <span className="view-customer-divider-star">★ </span>
                        <span className="view-customer-divider-text">
                          End of{" "}
                          <span className="view-customer-divider-area-name">
                            {areaName}
                          </span>{" "}
                          customers{" "}
                          <span className="view-customer-divider-star">★</span>
                        </span>
                      </Divider>
                    }
                    scrollableTarget={"scrollableDiv-" + areaName}
                  >
                    <List
                      dataSource={groupedData[areaName].slice(
                        0,
                        customersPagination[areaName]?.displayed ||
                          CUSTOMERS_PAGE_SIZE
                      )}
                      className="view-customer-list"
                      renderItem={(customer, index) => {
                        const isExpanded =
                          expandedAreas[areaName + "-" + customer.id];
                        const lineIndex = index + 1;
                        const documents = customerDocuments[customer.id] || [];
                        const isLoadingDocs = loadingDocuments[customer.id] || false;

                        return (
                          <div
                            key={customer.id}
                            id={"customer-item-" + customer.id}
                            className="view-customer-list-item-wrapper"
                          >
                            {isMobile ? (
                              <SwipeablePanel
                                item={{ ...customer, lineIndex }}
                                index={customer.id}
                                titleKey="customer_name"
                                subtitleKey="customer_id"
                                name="customer"
                                avatarSrc={customerIcon}
                                onSwipeRight={
                                  !isExpanded
                                    ? () => handleEditCustomer(customer)
                                    : undefined
                                }
                                onSwipeLeft={
                                  !isExpanded
                                    ? () => onDelete(customer)
                                    : undefined
                                }
                                isExpanded={isExpanded}
                                onExpandToggle={() =>
                                  handleCustomerAction(areaName, customer.id)
                                }
                                renderContent={() =>
                                  isExpanded ? (
                                    <CustomerCollapseContent 
                                      customer={customer} 
                                      areaIdToNameMap={areaIdToNameMap}
                                      documents={documents}
                                      isLoadingDocuments={isLoadingDocs}
                                    />
                                  ) : null
                                }
                                isSwipeOpen={openSwipeId === customer.id}
                                onSwipeStateChange={(isOpen) =>
                                  handleSwipeStateChange(customer.id, isOpen)
                                }
                              />
                            ) : (
                              <>
                                <List.Item
                                  className={
                                    isExpanded
                                      ? "view-customer-list-item view-customer-list-item-expanded"
                                      : "view-customer-list-item"
                                  }
                                >
                                  <List.Item.Meta
                                    avatar={
                                      <div className="view-customer-avatar-container">
                                       
                                        <span className="view-customer-index-badge">{lineIndex}</span>
                                      </div>
                                    }
                                    title={
                                      <div
                                        onClick={() =>
                                          handleCustomerAction(
                                            areaName,
                                            customer.id
                                          )
                                        }
                                        className="view-customer-item-title-container"
                                      >
                                        <div>
                                          <div className="view-customer-item-title">
                                            {customer.customer_name}
                                          </div>
                                          <div className="view-customer-item-subtitle">
                                            ID: {customer.customer_id}
                                          </div>
                                        </div>
                                        <Dropdown
                                          overlay={
                                            <Menu>
                                              <Menu.Item
                                                key="edit"
                                                onClick={(e) => {
                                                  e.domEvent.stopPropagation();
                                                  handleEditCustomer(customer);
                                                }}
                                              >
                                                <div className="d-flex align-items-center gap-1">
          <span className="mdi mdi-pencil text-secondary mb-0"></span>
          <span>Edit</span>
        </div>
                                              </Menu.Item>
                                            <Menu.Item key="delete">
  <Popconfirm
    // **Customize the title for the Customer context**
    title={`Delete customer ${customer.name || customer.customer_name || 'this customer'}?`} 
    description="Are you sure you want to delete this customer permanently?"
    icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
    onConfirm={(e) => {
      e.stopPropagation();
      onDelete(customer); // Calls onDelete only after user confirms
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
                                            className="view-customer-ellipsis-icon"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </Dropdown>
                                      </div>
                                    }
                                  />
                                </List.Item>

                                {isExpanded && (
                                  <div className="view-customer-collapse-content">
                                    <CustomerCollapseContent 
                                      customer={customer} 
                                      areaIdToNameMap={areaIdToNameMap}
                                      documents={documents}
                                      isLoadingDocuments={isLoadingDocs}
                                    />
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

          {Object.keys(groupedData).length === 0 &&
            !tableLoader &&
            selectedLine &&
            selectedArea && (
              <div className="view-customer-no-data">
                <p>No customers found {showReset && searchText ? `matching "${searchText}" in` : 'for'} the selected area</p>
              </div>
            )}
        </div>
      )}

      {!reOrder && (
        <FloatButton
          icon={<PlusOutlined />}
          type="primary"
          tooltip={<div>Add New Customer</div>}
          onClick={() => navigate("/add-customer")}
          className="view-customer-float-button"
        />
      )}
    </div>
  );
};

export default ViewCustomer;