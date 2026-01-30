import ReloadOutlined from "@ant-design/icons/lib/icons/ReloadOutlined";
import { Button, Form, Input, Select, notification, Spin, Space } from "antd";
import { 
  BankOutlined, 
  ApartmentOutlined, 
  FileTextOutlined,
  CalendarOutlined,
  DollarOutlined,
  CreditCardOutlined,
  CommentOutlined
} from '@ant-design/icons';
import Loader from "components/Common/Loader";
import PAYMENT_MODES_OPTIONS from "constants/payment_modes";
import { POST, PUT, GET } from "helpers/api_helper";
import { getDetails } from "helpers/getters";
import {
  EXPENSE_TRANSACTION,
  EXPENSE_TYPES,
} from "helpers/url_helper";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import InputWithAddon from "components/Common/InputWithAddon";
import SelectWithAddon from "components/Common/SelectWithAddon";
import "./ExpenseTransactionForm.css";

const { Option } = Select;

const ExpenseTransactionForm = () => {
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [allLines, setAllLines] = useState([]);
  const [filteredLines, setFilteredLines] = useState([]);
  const [expenseTypeList, setExpenseTypeList] = useState([]);
  const [expenseTransaction, setExpenseTransaction] = useState(null);
  const [branchLoader, setBranchLoader] = useState(false);
  const [lineLoader, setLineLoader] = useState(false);
  const [expenseTypeLoader, setExpenseTypeLoader] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  // Fetch branches from branch_dd API
  const getBranchList = async () => {
    try {
      setBranchLoader(true);
      const response = await GET("api/branch_dd");
      if (response?.status === 200) {
        setBranchList(response.data || []);
      } else {
        setBranchList([]);
      }
      setBranchLoader(false);
    } catch (error) {
      setBranchList([]);
      setBranchLoader(false);
      console.log(error);
      notification.error({
        message: "Error",
        description: "Failed to fetch branches.",
        duration: 3,
      });
    }
  };

  // Fetch lines from line_dd API
  const getLineList = async () => {
    try {
      setLineLoader(true);
      const response = await GET("api/line_dd");
      if (response?.status === 200) {
        setAllLines(response.data || []);
      } else {
        setAllLines([]);
      }
      setLineLoader(false);
    } catch (error) {
      setAllLines([]);
      setLineLoader(false);
      console.log(error);
      notification.error({
        message: "Error",
        description: "Failed to fetch lines.",
        duration: 3,
      });
    }
  };

  const getExpenseTypeList = async () => {
    try {
      setExpenseTypeLoader(true);
      const response = await GET(EXPENSE_TYPES);
      if (response?.status === 200) {
        setExpenseTypeList(response?.data);
      } else {
        setExpenseTypeList([]);
      }
      setExpenseTypeLoader(false);
    } catch (error) {
      setExpenseTypeList([]);
      setExpenseTypeLoader(false);
      console.log(error);
    }
  };

  const getExpenseTransactionDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDetails(EXPENSE_TRANSACTION, params.id);
      if (response) {
        setExpenseTransaction(response);
        form.setFieldsValue(response);
        
        // Set selected branch and filter lines if editing
        if (response.branch_id) {
          setSelectedBranchId(response.branch_id);
          
          // Filter lines for the selected branch
          const branchLines = allLines.filter(
            line => line.branch_id === response.branch_id
          );
          setFilteredLines(branchLines);
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }, [params.id, form, allLines]);

  useEffect(() => {
    getBranchList();
    getLineList();
    getExpenseTypeList();
  }, []);

  useEffect(() => {
    if (params.id && allLines.length > 0) {
      getExpenseTransactionDetails();
    }
  }, [params.id, allLines, getExpenseTransactionDetails]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let response;
      if (params.id) {
        response = await PUT(`${EXPENSE_TRANSACTION}${params.id}/`, values);
      } else {
        response = await POST(EXPENSE_TRANSACTION, values);
      }
      if (response?.status === 200 || response?.status === 201) {
        const selectedExpenseType = expenseTypeList?.find(
          (type) => type.id === values.EXPNS_TYPE_ID
        );
        notification.success({
          message: `${selectedExpenseType?.name?.toUpperCase()} Expense Transaction ${
            params.id ? "Updated" : "Created"
          }!`,
          description: `Expense transaction has been ${
            params.id ? "updated" : "added"
          } successfully`,
          duration: 0,
        });
        navigate("/expense-transaction");
      } else {
        notification.error({
          message: `Failed to ${params.id ? "update" : "add"} expense transaction`,
          duration: 0,
        });
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: "An error occurred",
        description: "Failed to process expense transaction",
        duration: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const onValuesChange = (changedValues) => {
    if (changedValues.branch_id !== undefined) {
      setSelectedBranchId(changedValues.branch_id);
      
      // Filter lines based on selected branch
      if (changedValues.branch_id && allLines.length > 0) {
        const branchLines = allLines.filter(
          line => line.branch_id === changedValues.branch_id
        );
        setFilteredLines(branchLines);
      } else {
        setFilteredLines([]);
      }
      
      // Reset line selection when branch changes
      form.setFieldsValue({ line_id: undefined });
    }
  };

  return (
    <>
      {loading && <Loader />}

      <div className="expense-transaction-page-content">
        <div className="expense-transaction-container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="expense-transaction-header">
                <h2 className="expense-transaction-title">
                  {params.id ? "Edit Expense Transaction" : "Add Expense Transaction"}
                </h2>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={onValuesChange}
                className="expense-transaction-form"
              >
                <div className="container expense-transaction-form-container">
                  {/* Branch and Line Name */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Item
                        label="Branch Name"
                        name="branch_id"
                        rules={[
                          { required: true, message: "Please select a branch" },
                        ]}
                      >
                        <SelectWithAddon
                          icon={<BankOutlined />}
                          placeholder="Select Branch"
                          allowClear
                          showSearch
                          size="large"
                          loading={branchLoader}
                          notFoundContent={
                            branchLoader ? <Spin size="small" /> : "No branches found"
                          }
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {branchList.map((branch) => (
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
                        name="line_id"
                        rules={[
                          { required: true, message: "Please select a line" },
                        ]}
                      >
                        <SelectWithAddon
                          icon={<ApartmentOutlined />}
                          placeholder={selectedBranchId ? "Select Line" : "First select a branch"}
                          allowClear
                          showSearch
                          size="large"
                          disabled={!selectedBranchId}
                          loading={lineLoader}
                          notFoundContent={
                            lineLoader ? <Spin size="small" /> : "No lines found"
                          }
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {filteredLines.map((line) => (
                            <Option key={line.line_id} value={line.line_id}>
                              {line.line_name}
                            </Option>
                          ))}
                        </SelectWithAddon>
                      </Form.Item>
                    </div>
                  </div>

                  {/* Expense Type and Date */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Item
                        label="Expense Type Name"
                        name="EXPNS_TYPE_ID"
                        rules={[
                          {
                            required: true,
                            message: "Please select an expense type",
                          },
                        ]}
                      >
                        <SelectWithAddon
                          icon={<FileTextOutlined />}
                          placeholder="Select Expense Type"
                          allowClear
                          showSearch
                          size="large"
                          loading={expenseTypeLoader}
                          notFoundContent={
                            expenseTypeLoader ? <Spin size="small" /> : "No expense types found"
                          }
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {expenseTypeList?.map((type) => (
                            <Option key={type.id} value={type.id}>
                              {type.name}
                            </Option>
                          ))}
                        </SelectWithAddon>
                      </Form.Item>
                    </div>

                    <div className="col-md-6">
                      <Form.Item
                        label="Date of Expense Transaction"
                        name="EXPNS_TRNSCTN_DT"
                        rules={[
                          { required: true, message: "Please select a date" },
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
                  </div>

                  {/* Amount and Payment Mode */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Item
                        label="Expense Amount"
                        name="EXPNS_TRNSCTN_AMNT"
                        rules={[
                          { required: true, message: "Please enter an amount" },
                          {
                            pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
                            message: "Enter a valid amount",
                          },
                        ]}
                      >
                        <InputWithAddon
                          icon={<DollarOutlined />}
                          placeholder="Enter Expense Amount"
                          type="text"
                          inputMode="decimal"
                          onValueFilter={(value) => {
                            let filtered = value.replace(/[^0-9.]/g, '');
                            
                            const parts = filtered.split('.');
                            if (parts.length > 2) {
                              filtered = parts[0] + '.' + parts.slice(1).join('');
                            }
                            
                            if (parts.length === 2 && parts[1].length > 2) {
                              filtered = parts[0] + '.' + parts[1].slice(0, 2);
                            }
                            
                            return filtered;
                          }}
                        />
                      </Form.Item>
                    </div>

                    <div className="col-md-6">
                      <Form.Item
                        label="Payment Mode"
                        name="EXPNS_TRNSCTN_MODE"
                        rules={[
                          {
                            required: true,
                            message: "Please select a payment mode",
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

                  {/* Remarks */}
                  <div className="row mb-2">
                    <div className="col-md-12">
                      <Form.Item
                        label="Remarks / Comments"
                        name="EXPNS_TRNSCTN_RMRK"
                      >
                        <Input.TextArea 
                          placeholder="Enter remarks or comments" 
                          autoSize={{ minRows: 2, maxRows: 6 }}
                          size="large"
                          allowClear
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="text-center mt-4">
                    <Space size="large">
                      <Button type="primary" htmlType="submit" size="large">
                        {params.id ? "Update Transaction" : "Add Transaction"}
                      </Button>

                      <Button
                        size="large"
                        onClick={() => navigate("/expense-transaction")}
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
    </>
  );
};

export default ExpenseTransactionForm;