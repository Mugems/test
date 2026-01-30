import React, { useEffect, useState } from "react";
import { Form, Select, Button, Card, Modal, message, Row, Col, Spin, Input, Image } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone, BankOutlined, ApartmentOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import { GET, POST } from "../../helpers/api_helper";
import { USERS } from "helpers/url_helper";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../helpers/errorMessages";
import passwordIcon from "../../assets/icons/password (1).png";
import SelectWithAddon from "../../components/Common/SelectWithAddon";
import InputWithAddon from "../../components/Common/InputWithAddon";
import "./ResetPassword.css";

const { Option } = Select;

const RESET_PASSWORD_API = "/api/users";
const BRANCH_DD_API = "/api/branch_dd";
const LINE_DD_API = "/api/line_dd";

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  const [lineLoading, setLineLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [lines, setLines] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  // Fetch all branches
  const fetchBranches = async () => {
    try {
      setBranchLoading(true);
      const response = await GET(BRANCH_DD_API);
      
      if (response?.status === 200 && response.data) {
        const branchData = Array.isArray(response.data) ? response.data : [];
        // API returns: [{id: 97, branch_name: "Kumbakonam"}, ...]
        setBranches(branchData);
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      message.error(`Failed to fetch branches: ${error.message || ERROR_MESSAGES.COMMON.UNKNOWN_ERROR}`);
      setBranches([]);
    } finally {
      setBranchLoading(false);
    }
  };

  // Fetch lines based on selected branch
  const fetchLines = async (branchName) => {
    try {
      setLineLoading(true);
      // API returns all lines with branch info, we need to filter by branch_name
      const response = await GET(LINE_DD_API);
      
      if (response?.status === 200 && response.data) {
        const lineData = Array.isArray(response.data) ? response.data : [];
        // API returns: [{line_id: 305, line_name: "sholss__457e480b", branch_id: 33, branch_name: "Sholinganallur new"}, ...]
        // Filter lines for the selected branch
        const filteredLines = lineData.filter(line => line.branch_name === branchName);
        setLines(filteredLines);
      }
    } catch (error) {
      console.error("Failed to fetch lines:", error);
      message.error(`Failed to fetch lines: ${error.message || ERROR_MESSAGES.COMMON.UNKNOWN_ERROR}`);
      setLines([]);
    } finally {
      setLineLoading(false);
    }
  };

  // Fetch users based on selected branch and line
  const fetchUsers = async (branchName, lineName) => {
    try {
      setUserLoading(true);
      // Pass branch and line names as query parameters
      const response = await GET(`${USERS}?branch_name=${encodeURIComponent(branchName)}&line_name=${encodeURIComponent(lineName)}`);
      
      if (response?.status === 200 && response.data) {
        const userData = Array.isArray(response.data) ? response.data : [];
        
        // Filter users based on branch and line
        const filteredUsersList = userData.filter(user => {
          // Check if user's base branch and line match
          const baseMatch = user.base_branch_name === branchName && user.base_line_name === lineName;
          
          // Check line allocations
          const allocationMatch = user.line_allocations && Array.isArray(user.line_allocations) &&
            user.line_allocations.some(allocation => 
              allocation.branch_name === branchName && allocation.line_name === lineName
            );
          
          return baseMatch || allocationMatch;
        });

        // Map to user objects with unique IDs
        const uniqueUsers = Array.from(
          new Map(filteredUsersList.map(user => [user.id, {
            id: user.id,
            name: user.username,
            username: user.username,
            full_name: user.full_name
          }])).values()
        );

        setUsers(uniqueUsers);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      message.error(`Failed to fetch users: ${error.message || ERROR_MESSAGES.COMMON.UNKNOWN_ERROR}`);
      setUsers([]);
    } finally {
      setUserLoading(false);
    }
  };

  // Handle branch selection
  const handleBranchChange = (branchName) => {
    form.setFieldsValue({ line_name: undefined, user_name: undefined });
    setLines([]);
    setUsers([]);
    
    if (branchName) {
      fetchLines(branchName);
    }
  };

  // Handle line selection
  const handleLineChange = (lineName) => {
    form.setFieldsValue({ user_name: undefined });
    setUsers([]);
    
    const branchName = form.getFieldValue('branch_name');
    
    if (branchName && lineName) {
      fetchUsers(branchName, lineName);
    }
  };

  // Validate password strength
  const validatePassword = (password) => {
    const minLength = 4;
    return password.length >= minLength;
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    const selectedUser = users.find(user => user.name === values.user_name);
    
    if (!selectedUser) {
      message.error(ERROR_MESSAGES.RESET_PASSWORD.USER_INVALID);
      return;
    }

    // Validate password strength
    if (!validatePassword(values.new_password)) {
      message.error(ERROR_MESSAGES.RESET_PASSWORD.PASSWORD_MIN_LENGTH);
      return;
    }

    // Check if passwords match
    if (values.new_password !== values.confirm_password) {
      message.error(ERROR_MESSAGES.RESET_PASSWORD.PASSWORDS_NOT_MATCH);
      return;
    }

    Modal.confirm({
      title: "Confirm Password Reset",
      content: (
        <div>
          <p>Are you sure you want to reset the password for:</p>
          <p><strong>Branch:</strong> {values.branch_name}</p>
          <p><strong>Line:</strong> {values.line_name}</p>
          <p><strong>User:</strong> {values.user_name} ({selectedUser.username})</p>
        </div>
      ),
      okText: "Submit",
      cancelText: "Cancel",
      onOk: () => handlePasswordReset(selectedUser.id, values),
    });
  };

  // Call reset password API
  const handlePasswordReset = async (userId, values) => {
    try {
      setLoading(true);
      
      const requestBody = {
        new_password: values.new_password
      };

      const endpoint = `${RESET_PASSWORD_API}/${userId}/reset-password/`;
      
      const response = await POST(endpoint, requestBody);
      
      if (response?.status === 200 || response?.data?.message) {
        message.success(response?.data?.message || SUCCESS_MESSAGES.RESET_PASSWORD.SUCCESS);
        form.resetFields();
        setLines([]);
        setUsers([]);
      } else {
        message.error(ERROR_MESSAGES.RESET_PASSWORD.RESET_FAILED);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      const errorMsg = 
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        ERROR_MESSAGES.COMMON.UNKNOWN_ERROR;
      message.error(`${ERROR_MESSAGES.RESET_PASSWORD.RESET_FAILED}: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    form.resetFields();
    setLines([]);
    setUsers([]);
  };

  return (
    <div style={{ padding: '0 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <Image 
          src={passwordIcon} 
          alt="Lock Icon"
          preview={false}
          width={30}
          height={30}
        />
        <h2 style={{ margin: '6px', fontSize: '20px', fontWeight: 600 }}>Reset User Password</h2>
      </div>

      <Card
        bordered={false}
        style={{margin: 0, padding: 0, boxShadow: 'none'}}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col xs={24} sm={24} md={8}>
              <Form.Item
                label="Branch Name"
                name="branch_name"
                rules={[{ required: true, message: ERROR_MESSAGES.RESET_PASSWORD.BRANCH_REQUIRED }]}
              >
                <SelectWithAddon
                  icon={<BankOutlined />}
                  placeholder="Select Branch"
                  onChange={handleBranchChange}
                  showSearch
                  loading={branchLoading}
                  notFoundContent={branchLoading ? <Spin size="small" /> : null}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {branches.map(branch => (
                    <Option key={branch.id} value={branch.branch_name}>
                      {branch.branch_name}
                    </Option>
                  ))}
                </SelectWithAddon>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={8}>
              <Form.Item
                label="Line Name"
                name="line_name"
                rules={[{ required: true, message: ERROR_MESSAGES.RESET_PASSWORD.LINE_REQUIRED }]}
              >
                <SelectWithAddon
                  icon={<ApartmentOutlined />}
                  placeholder="Select Line"
                  onChange={handleLineChange}
                  disabled={!form.getFieldValue('branch_name')}
                  showSearch
                  loading={lineLoading}
                  notFoundContent={lineLoading ? <Spin size="small" /> : null}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {lines.map(line => (
                    <Option key={line.line_id} value={line.line_name}>
                      {line.line_name}
                    </Option>
                  ))}
                </SelectWithAddon>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={8}>
              <Form.Item
                label="User Name"
                name="user_name"
                rules={[{ required: true, message: ERROR_MESSAGES.RESET_PASSWORD.USER_REQUIRED }]}
              >
                <SelectWithAddon
                  icon={<UserOutlined />}
                  placeholder="Select User"
                  disabled={!form.getFieldValue('line_name')}
                  showSearch
                  loading={userLoading}
                  notFoundContent={userLoading ? <Spin size="small" /> : null}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {users.map(user => (
                    <Option key={user.id} value={user.name}>
                      {user.name}
                    </Option>
                  ))}
                </SelectWithAddon>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="New Password"
                name="new_password"
                rules={[
                  { required: true, message: ERROR_MESSAGES.RESET_PASSWORD.PASSWORD_REQUIRED },
                  {
                    min: 4,
                    message: ERROR_MESSAGES.RESET_PASSWORD.PASSWORD_MIN_LENGTH
                  }
                ]}
              >
                <InputWithAddon
                  icon={<LockOutlined />}
                  placeholder="Enter new password"
                  type="password"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Confirm Password"
                name="confirm_password"
                dependencies={['new_password']}
                rules={[
                  { required: true, message: ERROR_MESSAGES.RESET_PASSWORD.CONFIRM_PASSWORD_REQUIRED },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('new_password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(ERROR_MESSAGES.RESET_PASSWORD.PASSWORDS_NOT_MATCH));
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
            </Col>
          </Row>

          <Form.Item>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button onClick={handleReset}>
                Clear
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Reset Password
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;