import { Button, Form, Input, Select, notification, Divider, Space } from "antd";
import Loader from "components/Common/Loader";
import PAYMENT_MODES_OPTIONS from "constants/payment_modes";
import { POST, PUT, GET } from "helpers/api_helper";
import { getDetails } from "helpers/getters";
import { INVESTMENT, USERS } from "helpers/url_helper";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, NOTIFICATION_TITLES } from "helpers/errorMessages";
import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { 
  UserOutlined, 
  BankOutlined, 
  ApartmentOutlined, 
  DollarOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  WalletOutlined
} from '@ant-design/icons';
import InputWithAddon from "components/Common/InputWithAddon";
import SelectWithAddon from "components/Common/SelectWithAddon";
import "./AddInvestment.css";

const { Option } = Select;

const AddInvestment = () => {
  const [form] = Form.useForm();
  
  const navigate = useNavigate();
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [userList, setUserList] = useState(null);
  const [branchList, setBranchList] = useState(null);
  const [lineList, setLineList] = useState(null);
  const [allLines, setAllLines] = useState(null);
  const [investment, setInvestment] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedBranchName, setSelectedBranchName] = useState("");

  // Fetch branch name from branch_dd API
  const getBranchName = async () => {
    try {
      const storedBranchId = localStorage.getItem("selected_branch_id");
      
      if (!storedBranchId) {
        return;
      }

      const response = await GET("api/branch_dd");
      
      if (response?.status === 200 && response?.data) {
        setBranchList(response.data);
        
        // Find the branch that matches the selected_branch_id
        const matchedBranch = response.data.find(
          branch => branch.id === parseInt(storedBranchId)
        );
        
        if (matchedBranch) {
          setSelectedBranchName(matchedBranch.branch_name);
          setSelectedBranchId(parseInt(storedBranchId));
        }
      }
    } catch (error) {
      console.error("Error fetching branch data:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch branch information.",
        duration: 3,
      });
    }
  };

  // Fetch lines from line_dd API
  const getLineList = async () => {
    try {
      const response = await GET("api/line_dd");
      
      if (response?.status === 200 && response?.data) {
        setAllLines(response.data);
        
        // Filter lines based on selectedBranchId if available
        if (selectedBranchId) {
          const filteredLines = response.data.filter(
            line => line.branch_id === selectedBranchId
          );
          setLineList(filteredLines);
        }
      }
    } catch (error) {
      console.error("Error fetching line data:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch line information.",
        duration: 3,
      });
    }
  };

  // Fetch user list
  const getUserList = async () => {
    try {
      const response = await GET(USERS);
      
      if (response?.status === 200 && response?.data) {
        setUserList(response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    getBranchName();
    getUserList();
  }, []);

  // Fetch lines after selectedBranchId is set
  useEffect(() => {
    if (selectedBranchId) {
      getLineList();
    }
  }, [selectedBranchId]);

  useEffect(() => {
    if (params.id) {
      getDetails(INVESTMENT, params.id).then(res => {
        console.log('Investment details:', res);
        setInvestment(res);
      });
    }
  }, [params.id]);

  useEffect(() => {
    if (
      userList != null &&
      branchList != null &&
      allLines != null &&
      (params.id == null || investment != null)
    ) {
      // If editing, set branch and filter lines first
      if (investment && investment.branch) {
        setSelectedBranchId(investment.branch);
        
        const filteredLines = allLines.filter(
          line => line.branch_id === investment.branch
        );
        setLineList(filteredLines);
        
        // Set form values after lines are filtered
        setTimeout(() => {
          form.setFieldsValue(investment);
          setLoading(false);
        }, 100);
      } else {
        // For new investment, filter by selected branch
        if (selectedBranchId && allLines) {
          const filteredLines = allLines.filter(
            line => line.branch_id === selectedBranchId
          );
          setLineList(filteredLines);
        }
        
        // Set default branch for new investment
        if (!params.id && selectedBranchId) {
          form.setFieldsValue({ branch: selectedBranchId });
        }
        
        setLoading(false);
      }
    }
  }, [userList, branchList, allLines, params.id, investment, form, selectedBranchId]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log('Submitting values:', values);
      console.log('Params ID:', params.id);
      
      let response;
      if (params.id) {
        // Edit mode - use PUT API
        console.log('Using PUT for edit');
        response = await PUT(`${INVESTMENT}${params.id}/`, values);
      } else {
        // Create mode - use POST API
        console.log('Using POST for create');
        response = await POST(INVESTMENT, values);
      }
      
      console.log('Response:', response);
      
      if (response?.status === 200 || response?.status === 201) {
        notification.success({
          message: `${values.investment_title.toUpperCase()} ${NOTIFICATION_TITLES.INVESTMENT} ${
            params.id ? "updated" : "added"
          }!`,
          description: params.id 
            ? SUCCESS_MESSAGES.INVESTMENT.UPDATED 
            : SUCCESS_MESSAGES.INVESTMENT.CREATED,
        });
        navigate("/investment");
      } else {
        notification.error({
          message: params.id 
            ? ERROR_MESSAGES.INVESTMENT.UPDATE_FAILED 
            : ERROR_MESSAGES.INVESTMENT.ADD_FAILED,
          description: response?.message || response?.data?.message || 'Please try again',
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      notification.error({
        message: ERROR_MESSAGES.INVESTMENT.OPERATION_ERROR,
        description: error?.message || 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle branch change to filter lines
  const handleBranchChange = (branchId) => {
    setSelectedBranchId(branchId);
    form.setFieldsValue({ line: undefined }); // Reset line selection
    
    if (branchId && allLines) {
      const filteredLines = allLines.filter(
        line => line.branch_id === branchId
      );
      setLineList(filteredLines);
    } else {
      setLineList([]);
    }
  };

  return (
    <Fragment>
      {loading && <Loader />}

      <div className="add-investment-page-content">
        <div className="add-investment-container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="add-investment-header">
                <h2 className="add-investment-title">
                  {params.id ? "Edit Investment" : "Add Investment"}
                </h2>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="add-investment-form"
              >
                <div className="container add-investment-form-container">
                  
                  {/* Investment Title and User */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Item
                        label="Investment Title"
                        name="investment_title"
                        rules={[
                          {
                            required: true,
                            message: 'Please enter investment title',
                          },
                          {
                            pattern: /^[A-Za-z][A-Za-z0-9-_ ]*$/,
                            message: 'Must start with alphabet and contain only alphanumeric, dash, underscore, space',
                          },
                        ]}
                      >
                        <InputWithAddon 
                          icon={<DollarOutlined />}
                          placeholder="Enter Investment Title" 
                          size="large"
                          onValueFilter={(value) => {
                            if (!value) return '';
                            
                            let filtered = '';
                            for (let i = 0; i < value.length; i++) {
                              if (i === 0) {
                                if (/[A-Za-z]/.test(value[i])) {
                                  filtered += value[i];
                                }
                              } else {
                                if (/[A-Za-z0-9\-_ ]/.test(value[i])) {
                                  filtered += value[i];
                                }
                              }
                            }
                            return filtered;
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item
                        label="Full Name | User Name"
                        name="user"
                        rules={[
                          { 
                            required: true, 
                            message: ERROR_MESSAGES.INVESTMENT.USER_REQUIRED 
                          },
                        ]}
                      >
                        <SelectWithAddon
                          icon={<UserOutlined />}
                          placeholder="Select User" 
                          allowClear
                          showSearch
                          size="large"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {userList?.map((user) => (
                            <Option key={user.id} value={user.id}>
                              {user.full_name && `${user.full_name} | `}{user.username}
                            </Option>
                          ))}
                        </SelectWithAddon>
                      </Form.Item>
                    </div>
                  </div>

                  {/* Branch and Line */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Item
                        label="Branch Name"
                        name="branch"
                        rules={[
                          { 
                            required: true, 
                            message: ERROR_MESSAGES.INVESTMENT.BRANCH_REQUIRED 
                          },
                        ]}
                      >
                        <SelectWithAddon
                          icon={<BankOutlined />}
                          placeholder="Select Branch" 
                          disabled={!!params.id}
                          showSearch
                          size="large"
                          onChange={handleBranchChange}
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
                        label="Line Name"
                        name="line"
                        rules={[
                          { 
                            required: true, 
                            message: ERROR_MESSAGES.INVESTMENT.LINE_REQUIRED 
                          },
                        ]}
                      >
                        <SelectWithAddon
                          icon={<ApartmentOutlined />}
                          placeholder={selectedBranchId ? "Select Line" : "First select a branch"} 
                          allowClear
                          showSearch
                          size="large"
                          disabled={!selectedBranchId}
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {lineList?.map((line) => (
                            <Option key={line.line_id} value={line.line_id}>
                              {line.line_name}
                            </Option>
                          ))}
                        </SelectWithAddon>
                      </Form.Item>
                    </div>
                  </div>

                  {/* Investment Amount and Payment Mode */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Item
                        label="Investment Amount"
                        name="investment_amount"
                        rules={[
                          { 
                            required: true, 
                            message: ERROR_MESSAGES.INVESTMENT.AMOUNT_REQUIRED 
                          },
                          {
                            type: "number",
                            min: 1,
                            message: ERROR_MESSAGES.INVESTMENT.AMOUNT_MIN,
                            transform: (value) => Number(value),
                          },
                        ]}
                      >
                        <InputWithAddon
                          icon={<WalletOutlined />}
                          type="text"
                          inputMode="decimal"
                          placeholder="Enter Investment Amount"
                          size="large"
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item
                        label="Payment Mode"
                        name="payment_mode"
                        rules={[
                          {
                            required: true,
                            message: ERROR_MESSAGES.INVESTMENT.PAYMENT_MODE_REQUIRED,
                          },
                        ]}
                      >
                        <SelectWithAddon
                          icon={<CreditCardOutlined />}
                          placeholder="Select Payment Mode" 
                          allowClear
                          size="large"
                        >
                          {PAYMENT_MODES_OPTIONS.map((mode) => (
                            <Option key={mode.value} value={mode.value}>
                              {mode.label}
                            </Option>
                          ))}
                        </SelectWithAddon>
                      </Form.Item>
                    </div>
                  </div>

                  {/* Date and Comment */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Item
                        label="Date of Investment"
                        name="investment_date"
                        rules={[
                          { 
                            required: true, 
                            message: ERROR_MESSAGES.INVESTMENT.DATE_REQUIRED 
                          },
                        ]}
                      >
                        <InputWithAddon
                          icon={<CalendarOutlined />}
                          type="date" 
                          autoComplete="off"
                          onPaste={(e) => e.preventDefault()}
                          onCopy={(e) => e.preventDefault()}
                          onCut={(e) => e.preventDefault()}
                          onContextMenu={(e) => e.preventDefault()}
                          onDrop={(e) => e.preventDefault()}
                          size="large" 
                          allowClear
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item label="Comment" name="comments">
                        <Input.TextArea 
                          placeholder="Enter Comment" 
                          size="large"
                          autoSize={{ minRows: 2, maxRows: 6 }}
                          allowClear
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="text-center mt-4">
                    <Space size="large">
                      <Button type="primary" htmlType="submit" size="large">
                        {params.id ? "Update Investment" : "Add Investment"}
                      </Button>
                      <Button
                        size="large"
                        onClick={() => navigate("/investment")}
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
        <ToastContainer />
      </div>
    </Fragment>
  );
};

export default AddInvestment;