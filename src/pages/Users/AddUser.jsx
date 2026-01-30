import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Select, Form, Input, Button, Switch, message, Divider, Space ,Spin} from "antd";
import {
  BankOutlined,
  ApartmentOutlined,
  DollarOutlined,
  PlusOutlined,
  MinusOutlined,
  UserOutlined, PhoneOutlined, MailOutlined,
  LockOutlined,
  EnvironmentOutlined
  
} from "@ant-design/icons";

import {
  USERS,
  EXPANSE_AUTOCOMPLETE,
  AREA, 
  EXPENSE_TYPES, // <-- ADDED: Assuming this is the endpoint for fetching all expense types
} from "helpers/url_helper";
import { GET, POST, PUT } from "helpers/api_helper";
import Loader from "components/Common/Loader";
import InputWithAddon from "components/Common/InputWithAddon";
import SelectWithAddon from "components/Common/SelectWithAddon";
// import { debounce } from "lodash";

const { Option } = Select;

const AddUser = () => {
  const [loading, setLoading] = useState(false);
  const [branchLoader, setBranchLoader] = useState(false);
  const [lineLoader, setLineLoader] = useState(false);

  const [branchList, setBranchList] = useState([]);
  const [lineList, setLineList] = useState([]); // All lines
  const [filteredLineList, setFilteredLineList] = useState([]); // Lines filtered by selected branches
  const [baseLineList, setBaseLineList] = useState([]); // Lines filtered by base branch
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({});
  // [MODIFIED] expenseTypes stores the full, active list of expenses
  const [expenseTypes, setExpenseTypes] = useState([]); 
  // const [expenseOptions, setExpenseOptions] = useState([]); // <-- REMOVED: Replaced by expenseTypes
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [expenseMappings, setExpenseMappings] = useState([{ id: Date.now(), lineId: null, expanses: [] }]);
  const [currentUsername, setCurrentUsername] = useState("");
  const [selectedBranches, setSelectedBranches] = useState([]); // Track selected branches (using IDs internally)
  const [selectedBaseBranch, setSelectedBaseBranch] = useState(null); // Track selected base branch
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
const [lineFormDropdownOpen, setLineFormDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const userId = params.id;
  const [form] = Form.useForm();

  // Get logged-in user role and username from localStorage
  useEffect(() => {
    const role = localStorage.getItem("user_role");
    const username = localStorage.getItem("username") || localStorage.getItem("user_name");
    if (role) {
      setUserRole(role);
    }
    if (username) {
      setCurrentUsername(username);
    }
  }, []);

  // [REMOVED] The original debouncedSearch is removed as it conflicts with line-level filtering. 
  // debouncedSearch is not used in the provided context
  

  // [NEW] Function to fetch all active expense types
  const getExpenseTypesList = useCallback(async () => {
    setExpenseLoading(true);
    try {
      // Use the EXPENSE_TYPES endpoint to get the full list
      const response = await GET(EXPENSE_TYPES); 
      if (response?.status === 200) {
        // Filter for active records only
        const allActiveExpenses = response.data.filter(exp => exp.status === 'active');
        setExpenseTypes(allActiveExpenses); 
      } else {
        message.error("Failed to fetch expenses");
        setExpenseTypes([]);
      }
    } catch (error) {
      console.error("Error fetching expense types:", error);
      message.error("Error fetching expense types");
      setExpenseTypes([]);
    } finally {
      setExpenseLoading(false);
    }
  }, []);

  // Fetch area data (which contains branch and line information) AND expense types
 // Fetch branch and line data AND expense types
useEffect(() => {
  const fetchBranchAndLineData = async () => {
    try {
      setBranchLoader(true);
      setLineLoader(true);
      
      // Fetch branches and lines in parallel
      const [branchResponse, lineResponse] = await Promise.all([
        GET("api/branch_dd"),
        GET("api/line_dd")
      ]);

      if (branchResponse?.status === 200) {
        setBranchList(branchResponse.data);
      } else {
        message.error("Failed to fetch branches");
        setBranchList([]);
      }

      if (lineResponse?.status === 200) {
        setLineList(lineResponse.data);
        setFilteredLineList(lineResponse.data);
      } else {
        message.error("Failed to fetch lines");
        setLineList([]);
        setFilteredLineList([]);
      }

    } catch (error) {
      console.error("Error fetching branch and line data:", error);
      message.error("Failed to load branch and line data");
      setBranchList([]);
      setLineList([]);
    } finally {
      setBranchLoader(false);
      setLineLoader(false);
    }
  };

  fetchBranchAndLineData();
  getExpenseTypesList();
}, [getExpenseTypesList]);

  
  // ... (existing handleBranchChange function - no change needed here)
const handleBranchChange = (selectedBranchIds) => {
  setSelectedBranches(selectedBranchIds);
  
  if (!selectedBranchIds || selectedBranchIds.length === 0) {
    setFilteredLineList([]);
    return;
  }

  // Filter lines based on selected branch IDs
  const filteredLines = lineList.filter(line => 
    selectedBranchIds.includes(line.branch_id)
  );

  setFilteredLineList(filteredLines);

  // Clear line selections that are no longer valid
  const currentLineIds = form.getFieldValue('lineId') || [];
  if (currentLineIds.length > 0) {
    const validLineIds = currentLineIds.filter(lineId => 
      filteredLines.some(line => line.line_id === lineId)
    );
    
    if (validLineIds.length !== currentLineIds.length) {
      form.setFieldsValue({ lineId: validLineIds });
    }

    // Update expense mappings to remove invalid lines
    const updatedMappings = expenseMappings.map(mapping => {
      if (mapping.lineId && !filteredLines.some(line => line.line_id === mapping.lineId)) {
        return { ...mapping, lineId: null, expanses: [] };
      }
      return mapping;
    });
    setExpenseMappings(updatedMappings);
  }
};
  
  // ... (existing handleBaseBranchChange function - no change needed here)
  const handleBaseBranchChange = (selectedBranchId) => {
  setSelectedBaseBranch(selectedBranchId);
  
  if (selectedBranchId === null || selectedBranchId === undefined) {
    setBaseLineList([]);
    form.setFieldsValue({ baseLineId: null });
    return;
  }

  // Filter lines based on selected base branch ID
  const filteredLines = lineList.filter(line => 
    line.branch_id === selectedBranchId
  );

  setBaseLineList(filteredLines);

  // Clear base line selection if it's no longer valid
  const currentBaseLineId = form.getFieldValue('baseLineId');
  if (currentBaseLineId && !filteredLines.some(line => line.line_id === currentBaseLineId)) {
    form.setFieldsValue({ baseLineId: null });
  }
};
 useEffect(() => {
  if (userId) {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await GET(`${USERS}${userId}`);
        if (response) {
          const userData = response.data;
          
          // Wait for branch and line data to be loaded
          let currentBranchList = branchList;
          let currentLineList = lineList;
          
          if (currentBranchList.length === 0 || expenseTypes.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
            currentBranchList = branchList;
            currentLineList = lineList;
          }
          
          // Extract branch IDs and line IDs from line_allocations
          const branchIds = userData.line_allocations 
            ? [...new Set(userData.line_allocations.map(allocation => allocation.branch))]
            : [];
          
          const lineIds = userData.line_allocations 
            ? [...new Set(userData.line_allocations.map(allocation => allocation.line))]
            : [];

          // Get base branch ID and base line ID from NAMES
          let baseBranchId = null;
          let baseLineId = null;
          
          if (userData.base_branch) {
            const baseBranch = currentBranchList.find(
              b => b.branch_name === userData.base_branch
            );
            baseBranchId = baseBranch ? baseBranch.id : null;
          }
          
          if (userData.base_line) {
            const baseLine = currentLineList.find(
              l => l.line_name === userData.base_line
            );
            baseLineId = baseLine ? baseLine.line_id : null;
          }

          // Set form values with IDs
          form.setFieldsValue({
            full_name: userData.full_name,
            username: userData.username,
            mobile_number: userData.mobile_number,
            email: userData.email,
            address: userData.address,
            pin_code: userData.pin_code,
            role: userData.role,
            baseBranchId: baseBranchId,
            baseLineId: baseLineId,
            branchId: branchIds,
            lineId: lineIds,
            allowTransaction: userData.allow_old_transaction,
          });
          
          setInitialValues(userData);
          setSelectedRole(userData.role);
          setSelectedBranches(branchIds);
          setSelectedBaseBranch(baseBranchId);
          setIsEditMode(true);

          // Filter lines based on selected branches for edit mode
          if (branchIds.length > 0) {
            handleBranchChange(branchIds);
          }

          // Filter base lines based on selected base branch for edit mode
          if (baseBranchId) {
            handleBaseBranchChange(baseBranchId);
          }

          // Transform user_expenses into expenseMappings format
          if (userData.user_expenses && userData.user_expenses.length > 0) {
            const expensesByLine = new Map();
            
            userData.user_expenses.forEach(exp => {
              const lineId = exp.expense_lineid || null;
              if (!expensesByLine.has(lineId)) {
                expensesByLine.set(lineId, []);
              }
              expensesByLine.get(lineId).push(exp.expense);
            });
            
            const mappings = [];
            expensesByLine.forEach((expenses, lineId) => {
              mappings.push({
                id: Date.now() + Math.random(),
                lineId: lineId,
                expanses: [...new Set(expenses)],
              });
            });
            
            setExpenseMappings(mappings.length > 0 ? mappings : [{ id: Date.now(), lineId: null, expanses: [] }]);
          } else {
            setExpenseMappings([{ id: Date.now(), lineId: null, expanses: [] }]);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        message.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }
}, [userId, form, branchList, lineList, expenseTypes.length]);

  

  const handleBack = useCallback(() => {
    if (form.isFieldsTouched()) {
      navigate("/user/list");
    }
  }, [navigate, form]);

  // Handle role change to show/hide fields
  const handleRoleChange = (value) => {
    setSelectedRole(value);
    if (value === "owner" || value === "manager") {
      // Clear line field when it's hidden for non-agent roles
      form.setFieldsValue({ lineId: undefined });
    }
  };

  // Add new expense mapping
  const addExpenseMapping = () => {
    setExpenseMappings([...expenseMappings, { id: Date.now(), lineId: null, expanses: [] }]);
  };

  // Remove expense mapping
  const removeExpenseMapping = (index) => {
    if (expenseMappings.length > 1) {
      setExpenseMappings(expenseMappings.filter((_, i) => i !== index));
    } else {
      message.warning("At least one expense mapping is required");
    }
  };

  // [MODIFIED] Update expense mapping: Clear expanses if lineId changes.
  const updateExpenseMapping = (id, field, value) => {
   setExpenseMappings(prevMappings => {
   
    return prevMappings.map(mapping => 
      mapping.id === id 
        ? { ...mapping, [field]: value } 
        : mapping
    );
  });
};
  
  const getFilteredExpenseOptions = useCallback((lineId) => {
    // 1. Get all active expenses from the state
    console.log("Line id selected",lineId)
    const activeExpenses = expenseTypes;
    console.log(expenseTypes)

    // 2. If lineId is null or undefined (Global Mapping)
    if (lineId === null || lineId === undefined) {
      // Show only global expenses (where both branch_id and line_id are null)
      return activeExpenses
        .filter(exp => exp.branch_id === null && exp.line_id === null)
        .map(item => ({ value: item.id, label: item.name, name: item.name }));
    }

    // 3. If a specific lineId is selected
    // Show ONLY expenses that match the lineId (removing the global fallback)
    return activeExpenses
      .filter(exp => exp.line_id === lineId) 
      .map(item => ({ value: item.id, label: item.name, name: item.name }));
  }, [expenseTypes]);


const onFinish = async (values) => {
    // Validate expense mappings only if in Edit Mode (where the block is visible)
    if (isEditMode) {
      const hasInvalidMapping = expenseMappings.some(
        mapping => (mapping.lineId !== null && mapping.expanses.length === 0)
      );
      
      if (hasInvalidMapping) {
        message.error("Please ensure all specific line mappings have at least one expense selected.");
        return;
      }
      
      // Additional check for global mapping:
      const hasGlobalMapping = expenseMappings.some(mapping => mapping.lineId === null);
      // Only validate global mapping if it exists AND the user is not an Agent
      if (hasGlobalMapping && (selectedRole === 'owner' || selectedRole === 'manager') && expenseMappings.find(mapping => mapping.lineId === null)?.expanses.length === 0) {
        message.error("Please ensure the Global expense mapping has at least one expense selected.");
        return;
      }
    }

    setLoading(true);

    try {
      const branchIds = Array.isArray(values.branchId) ? values.branchId : [];
      const lineIds = Array.isArray(values.lineId) ? values.lineId : [];

      // BUILD line_allocations array
      const lineAllocations = [];
      
      if (values.role === 'agent' && lineIds.length > 0) {
        // For agents: create line_allocations from selected lines
        lineIds.forEach(lineId => {
          const lineData = lineList.find(l => l.line_id === lineId);
          if (lineData) {
            lineAllocations.push({
              branch: lineData.branch_id,
              line: lineId,
              branch_name: lineData.branch_name,
              line_name: lineData.line_name,
            });
          }
        });
      } else if (values.role === 'owner' || values.role === 'manager') {
        // For owner/manager: create line_allocations from all lines under selected branches
        branchIds.forEach(branchId => {
          const branchData = branchList.find(b => b.id === branchId);
          if (branchData) {
            // Get all lines under this branch
            const branchLines = lineList.filter(line => line.branch_id === branchId);
            
            branchLines.forEach(line => {
              lineAllocations.push({
                branch: branchId,
                line: line.line_id,
                branch_name: line.branch_name,
                line_name: line.line_name,
              });
            });
          }
        });
      }

      // BUILD user_expenses array
      const userExpenses = [];
      
      if (isEditMode) {
        expenseMappings.forEach(mapping => {
          if (mapping.expanses && mapping.expanses.length > 0) {
            mapping.expanses.forEach(expenseId => {
              if (mapping.lineId) {
                // Expense mapped to specific line
                const lineData = lineList.find(l => l.line_id === mapping.lineId);
                
                if (lineData) {
                  userExpenses.push({
                    expense: expenseId,
                    expense_branchid: lineData.branch_id,
                    expense_branch_name: lineData.branch_name,
                    expense_lineid: mapping.lineId,
                    expense_line_name: lineData.line_name,
                  });
                }
              } else {
                // Global expense (no specific line)
                lineAllocations.forEach(allocation => {
                  userExpenses.push({
                    expense: expenseId,
                    expense_branchid: allocation.branch,
                    expense_branch_name: allocation.branch_name,
                    expense_lineid: allocation.line,
                    expense_line_name: allocation.line_name,
                  });
                });
              }
            });
          }
        });
      }

      // Get base branch and line NAMES
      let baseBranchName = null;
      let baseLineName = null;
      
      if (values.baseBranchId) {
        const baseBranch = branchList.find(b => b.id === values.baseBranchId);
        baseBranchName = baseBranch ? baseBranch.branch_name : null;
      }
      
      if (values.baseLineId) {
        const baseLine = lineList.find(l => l.line_id === values.baseLineId);
        baseLineName = baseLine ? baseLine.line_name : null;
      }

      // BUILD the final payload
      const payload = {
        username: values.username,
        full_name: values.full_name,
        mobile_number: values.mobile_number,
        email: values.email || "",
        address: values.address || null,
        pin_code: values.pin_code || null,
        role: values.role,
        allow_old_transaction: values.allowTransaction || false,
        base_branch: baseBranchName,
        base_line: baseLineName,
        line_allocations: lineAllocations,
        user_expenses: isEditMode ? userExpenses : [],
      };

      // Add password only if provided
      if (values.password) {
        payload.password = values.password;
      }

      let response;
      if (isEditMode) {
        response = await PUT(`${USERS}${userId}/`, payload);
        if (response) {
          message.success("User updated successfully");
          navigate("/user/list");
        }
      } else {
        response = await POST(USERS, payload);

        if (response?.status === 200 || response?.status === 201) {
          message.success("User added successfully");
          form.resetFields();
          setExpenseMappings([{ id: Date.now(), lineId: null, expanses: [] }]);
          navigate("/user/list");
        } else if (response?.status === 400) {
          const errorMessage =
            response?.data?.mobile_number ||
            response?.data?.email ||
            "User not created";
          message.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Error adding/updating user:", error);
      message.error(error?.response?.data?.message || "Failed to add/update user");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {loading && <Loader />}
      <div className="add-user-page-content">
        <div className="add-user-container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="add-user-header">
                <h2 className="add-user-title">
                  {isEditMode ? "Edit User" : "Add User"}
                </h2>
              </div>

             <Form
  layout="vertical"
  onFinish={onFinish}
  form={form}
  initialValues={initialValues}
  className="add-user-form"
>
  <div className="container add-user-form-container">
    {/* Full Name and User Name */}
    <div className="row mb-2">
      <div className="col-md-6">
       <Form.Item
    label="Full Name"
    name="full_name"
    rules={[
        {
            required: true,
            message: "Please enter the full name",
        },
        {
            pattern: /^[A-Za-z\s]+$/,
            message: "Full name must contain only alphabets and spaces",
        },
    ]}
>
    <InputWithAddon
        icon={<UserOutlined />}
        placeholder="Enter full name"
        size="large"
        onValueFilter={(value) => value.replace(/[^A-Za-z\s]/g, '')}
    />
</Form.Item>
      </div>
      <div className="col-md-6">
        <Form.Item
    label="User Name"
    name="username"
    rules={[
        {
            required: true,
            message: "Please enter the user name",
        },
        {
            pattern: /^[A-Za-z][A-Za-z0-9]*$/,
            message: "User name must start with an alphabet and can contain only alphabets and numbers",
        },
    ]}
>
    <InputWithAddon
        icon={<UserOutlined />}
        placeholder="Enter user name"
        size="large"
        onValueFilter={(value) => {
            if (!value) return '';
            
            let filtered = '';
            for (let i = 0; i < value.length; i++) {
                if (i === 0) {
                    // First character: only alphabets
                    if (/[A-Za-z]/.test(value[i])) {
                        filtered += value[i];
                    }
                } else {
                    // Rest: alphanumeric only
                    if (/[A-Za-z0-9]/.test(value[i])) {
                        filtered += value[i];
                    }
                }
            }
            return filtered;
        }}
    />
</Form.Item>
      </div>
    </div>
         
    {/* Password and Confirm Password */}
    {!isEditMode && (
      <div className="row mb-2">
        <div className="col-md-6">
          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: !isEditMode,
                message: "Please enter the password",
              },
            ]}
          >
            <InputWithAddon
                  icon={<LockOutlined />}
                  placeholder="New password"
                  type="password"
                />
          </Form.Item>
        </div>
        <div className="col-md-6">
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              {
                required: !isEditMode,
                message: "Please confirm the password",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  return !value ||
                    getFieldValue("password") === value
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("Passwords do not match!")
                      );
                },
              }),
            ]}
          >
             <InputWithAddon
                  icon={<LockOutlined />}
                  placeholder="Confirm new password"
                  type="password"
                />
          </Form.Item>
        </div>
      </div>
    )}

    {/* Mobile Number and Email */}
    <div className="row mb-2">
      <div className="col-md-6">
        <Form.Item
          label="Mobile Number"
          name="mobile_number"
          rules={[
            {
              required: true,
              message: "Please enter the mobile number",
            },
            {
              pattern: /^\d{10}$/,
              message: "Mobile number must be 10 digits!",
            },
          ]}
        >
          <InputWithAddon
            icon={<PhoneOutlined />}
            placeholder="Enter mobile number"
            size="large"
            type="text"
            inputMode="decimal"
            onKeyPress={(e) => {
              // Allow only digits
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            maxLength={10}
          />
        </Form.Item>
      </div>
      <div className="col-md-6">
        <Form.Item
          label="Email ID"
          name="email"
          rules={[
            {
              type: "email",
              message: "Please enter a valid email",
            },
          ]}
        >
          <InputWithAddon
            icon={<MailOutlined />}
            placeholder="Enter email ID"
            size="large"
          />
        </Form.Item>
      </div>
    </div>

    {/* Address and Pincode */}
    <div className="row mb-2">
      <div className="col-md-6">
        <Form.Item label="Address" name="address">
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 6 }}
            placeholder="Enter the address"
            size="large"
            allowClear
          />
        </Form.Item>
      </div>
      <div className="col-md-6">
        <Form.Item
  label="Pincode"
  name="pin_code"
  rules={[
    {
      pattern: /^\d{6}$/,
      message: "Pincode must be 6 digits!",
    },
  ]}
>
  <InputWithAddon
    icon={<EnvironmentOutlined />}
    placeholder="Enter the pincode"
    type="text"
    inputMode="decimal"
    maxLength={6}
    onValueFilter={(value) => value.replace(/\D/g, '').slice(0, 6)}
  />
</Form.Item>
      </div>
    </div>

    <Divider style={{ borderTop: "2px solid #d9d9d9" }} />

    {/* Base Branch and Base Line Section */}
   <Divider 
  orientation="center"
  style={{ 
    borderTopWidth: '3px',
    borderColor: '#d9d9d9'
  }}
>Base Assignment</Divider>
    
    <div className="row mb-2">
      <div className="col-md-6">
        <Form.Item
          label="Base Branch"
          name="baseBranchId"
          rules={[
            { required: true, message: "Please select a base branch" },
          ]}
        >
          <SelectWithAddon
            icon={<BankOutlined />}
            placeholder="Select base branch"
            showSearch
            size="large"
            loading={branchLoader}
            notFoundContent={
      branchLoader ? <Spin size="small" /> : "No branches found"
    }    
            onChange={handleBaseBranchChange}
          >
            {branchList?.map((branch) => (
              <Option key={branch.id} value={branch.id}>
                {branch.branch_name}
              </Option>
            ))}
          </SelectWithAddon>
        </Form.Item>
      </div>
      <div className="col-md-6">
        <Form.Item
          label="Base Line"
          name="baseLineId"
          rules={[
            { required: true, message: "Please select a base line" },
          ]}
        >
          <SelectWithAddon
            icon={<ApartmentOutlined />}
            placeholder={selectedBaseBranch ? "Select base line" : "Select base branch first"}
            showSearch
            size="large"
            loading={lineLoader}
            disabled={selectedBaseBranch === null || selectedBaseBranch === undefined}
          >
            {baseLineList.map((option) => (
  <Option key={option.line_id} value={option.line_id}>
    {option.line_name}
  </Option>
            ))}
          </SelectWithAddon>
        </Form.Item>
      </div>
    </div>

    <Divider style={{ borderTop: "2px solid #d9d9d9" }} />

    {/* User Role & Assignment Section */}
   <Divider 
  orientation="center"
  style={{ 
    borderTopWidth: '3px',
    borderColor: '#d9d9d9'
  }}
>User Role & Assignment</Divider>
    
    <div className="row mb-2">
      <div className="col-md-6">
        <Form.Item
          label="Role"
          name="role"
          rules={[
            { required: true, message: "Please select a role" },
          ]}
        >
          <SelectWithAddon
            icon={<UserOutlined />}
            placeholder="Choose User Role"
            showSearch
            size="large"
            onChange={handleRoleChange}
          >
            <Option value="owner">Owner</Option>
            <Option value="manager">Manager</Option>
            <Option value="agent">Agent</Option>
          </SelectWithAddon>
        </Form.Item>
      </div>
      <div className="col-md-6">
  <Form.Item
    label="Branch"
    name="branchId"
    rules={[
      { required: true, message: "Please select a branch" },
    ]}
  >
    <SelectWithAddon
      icon={<BankOutlined />}
      placeholder="Select branch"
      showSearch
      size="large"
      loading={branchLoader}
      notFoundContent={
        branchLoader ? <Spin size="small" /> : "No branches found"
      }    
      mode="multiple"
      allowClear
      onChange={handleBranchChange}
      open={branchDropdownOpen}
      onDropdownVisibleChange={(open) => setBranchDropdownOpen(open)}
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
              style={{ background: "#28a745", color: "white" }} 
              // type="primary"
              size="small"
              onClick={() => setBranchDropdownOpen(false)}
            >
              Select Done ✓
            </Button>
          </div>
        </>
      )}
    >
      {branchList?.map((branch) => (
        <Option key={branch.id} value={branch.id}>
          {branch.branch_name}
        </Option>
      ))}
    </SelectWithAddon>
  </Form.Item>
</div>
    </div>

    {selectedRole && selectedRole === "agent" && (
      <div className="row mb-2">
       <div className="col-md-6">
  <Form.Item
    label="Line"
    name="lineId"
    rules={[
      { required: true, message: "Please select a line" },
    ]}
  >
    <SelectWithAddon
      icon={<ApartmentOutlined />}
      placeholder={selectedBranches.length > 0 ? "Select Line" : "Select branches first"}
      showSearch
      size="large"
      loading={lineLoader}
      mode="multiple"
      disabled={!selectedBranches || selectedBranches.length === 0}
      allowClear
      open={lineFormDropdownOpen}
      onDropdownVisibleChange={(open) => setLineFormDropdownOpen(open)}
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
              style={{ background: "#28a745", color: "white" }} 
              size="small"
              onClick={() => setLineFormDropdownOpen(false)}
            >
              Select Done ✓
            </Button>
          </div>
        </>
      )}
    >
      {filteredLineList.map((option) => (
        <Option key={option.line_id} value={option.line_id}>
          {option.line_name}
        </Option>
      ))}
    </SelectWithAddon>
  </Form.Item>
</div>
        <div className="col-md-6">
          <Form.Item
            label="Allow to see old Transaction?"
            name="allowTransaction"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Yes"
              unCheckedChildren="No"
              defaultChecked
            />
          </Form.Item>
        </div>
      </div>
    )}

    {selectedRole && (selectedRole === "owner" || selectedRole === "manager") && (
      <div className="row mb-2">
        <div className="col-md-6">
          <Form.Item
            label="Allow to see old Transaction?"
            name="allowTransaction"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Yes"
              unCheckedChildren="No"
              defaultChecked
            />
          </Form.Item>
        </div>
      </div>
    )}
  
  

    {/* User Expense Mapping Section */}
    {isEditMode && (
      <>
        <Divider style={{ borderTop: "2px solid #d9d9d9" }} />
       <Divider 
  orientation="center"
  style={{ 
    borderTopWidth: '3px',
    borderColor: '#d9d9d9'
  }}
>User Expense Mapping</Divider>
        
        {expenseMappings.map((mapping, index) => (
          <div key={mapping.id} className="row mb-4">
            {expenseMappings.length > 1 && (
             <Divider 
  orientation="center"
  style={{ 
    borderTopWidth: '3px',
    borderColor: '#d9d9d9'
  }}
>
                {`Expense Mapping ${index + 1}`}
              </Divider>
            )}
            
            {/* Line Name field */}
            <div className="col-md-6">
              <Form.Item
                label="Line Name"
                rules={
                  (selectedRole === 'agent' || mapping.lineId !== null)
                  ? [{ required: true, message: "Please select a line" }]
                  : []
                }
              > 
                <SelectWithAddon
                  icon={<ApartmentOutlined />}
                  placeholder={
                    (selectedBranches.length > 0)
                      ? "Select Line (Filtered by Branch)"
                      : "Select branches first"
                  }
                  showSearch
                  size="large"
                  loading={lineLoader}
                  value={mapping.lineId}
                  onChange={(value) => updateExpenseMapping(mapping.id, 'lineId', value)}
                  disabled={!selectedBranches || selectedBranches.length === 0}
                >
                  {/* Option for global mapping (only for Owner/Manager) */}
                  {(selectedRole === "owner" || selectedRole === "manager") && (
                    <Option key="global" value={null}>
                      Global (Applies to all assigned lines)
                    </Option>
                  )}
                  
                  {/* Show lines filtered by selected branches for ALL roles */}
                 {filteredLineList.map((option) => (
  <Option key={option.line_id} value={option.line_id}>
    {option.line_name}
  </Option>
))}
                </SelectWithAddon>
              </Form.Item>
            </div>
            
            {/* User Expense Type field */}
            <div className="col-md-6">
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <Form.Item
                  label="User Expense Type"
                  required
                  style={{ flexGrow: 1 }}
                >
                  <SelectWithAddon
                    icon={<DollarOutlined />}
                    mode="multiple"
                    placeholder="Search and select expenses"
                    value={mapping.expanses}
                    onChange={(value) => {
                      console.log("Selected value:", value);
                      console.log("Current mapping.expanses:", mapping.expanses);
                      updateExpenseMapping(mapping.id, 'expanses', value);
                    }}
                    filterOption={(input, option) => {
                      if (!input) return true;
                      const searchText = option.name || (typeof option.children === 'string' ? option.children : '');
                      return searchText.toLowerCase().includes(input.toLowerCase());
                    }}
                    loading={expenseLoading}
                    showSearch
                    allowClear
                    size="large"
                    notFoundContent={
                      expenseLoading ? "Loading..." : "No expenses found"
                    }
                  >
                    {getFilteredExpenseOptions(mapping.lineId).map((option) => (
                      <Option key={option.value} value={option.value} name={option.name}>
                        {option.label}
                      </Option>
                    ))}
                  </SelectWithAddon>
                </Form.Item>

                {/* Minus Button */}
                {expenseMappings.length > 1 && (
                  <Button
                    type="primary"
                    danger
                    shape="circle"
                    icon={<MinusOutlined />}
                    onClick={() => removeExpenseMapping(index)}
                    style={{
                      width: 33,
                      height: 33,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#ff4d4f",
                      borderColor: "#ff4d4f",
                      color: "#fff",
                      marginTop: "30px",
                      flexShrink: 0
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
       
        {/* Add button at the bottom */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-15px" }}>
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={addExpenseMapping}
            style={{
              width: 35,
              height: 35,
              backgroundColor: "#28a745",
              borderColor: "#28a745",
              color: "#fff",
            }}
          />
        </div>

       
      </>
    )}

    {/* Form Actions */}
    <div className="text-center mt-4">
      <Space size="large">
        <Button type="primary" htmlType="submit" loading={loading} size="large">
          {isEditMode ? "Update User" : "Add User"}
        </Button>
        <Button
          size="large"
          onClick={handleBack}
        >
          Cancel
        </Button>
      </Space>
    </div>
  </div>
</Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUser;