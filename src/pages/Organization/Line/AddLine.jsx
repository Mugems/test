import { useEffect, useState, useCallback } from "react";
import { Form, Input, Button, Select, notification, Spin, Space } from "antd";
import { ToastContainer } from "react-toastify";
import Loader from "components/Common/Loader";
import { LINE } from "helpers/url_helper";
import { POST, GET, PUT } from "helpers/api_helper";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "helpers/errorMessages";
import InputWithAddon from "components/Common/InputWithAddon";
import SelectWithAddon from "components/Common/SelectWithAddon";

import { 
  BankOutlined, 
  ApartmentOutlined, 
  ClockCircleOutlined,
  CalendarOutlined,
  WarningOutlined 
} from '@ant-design/icons';
import "./AddLine.css";

const { Option } = Select;

const AddLine = () => {
  const [loader, setLoader] = useState(false);
  const [formData, setFormData] = useState({
    lineName: "",
    lineType: undefined,
    branch: "",
    installment: null,
    badinstallment: null,
  });
  const [selectedBranchName, setSelectedBranchName] = useState("");
  const [branchLoader, setBranchLoader] = useState(false);
  const [form] = Form.useForm();
  const params = useParams();
  const navigate = useNavigate();

  // Fetch branch dropdown data and match with localStorage
  const getBranchName = async () => {
    try {
      setBranchLoader(true);
      const selectedBranchId = localStorage.getItem("selected_branch_id");
      
      if (!selectedBranchId) {
        setBranchLoader(false);
        return;
      }

      const response = await GET("api/branch_dd");
      
      if (response?.status === 200 && response?.data) {
        // Find the branch that matches the selected_branch_id
        const matchedBranch = response.data.find(
          branch => branch.id === parseInt(selectedBranchId)
        );
        
        if (matchedBranch) {
          setSelectedBranchName(matchedBranch.branch_name || matchedBranch.branchName);
          setFormData((prev) => ({
            ...prev,
            branch: selectedBranchId,
          }));
        } else {
          notification.warning({
            message: "Branch Not Found",
            description: "The selected branch was not found in the system.",
            duration: 3,
          });
        }
      }
      setBranchLoader(false);
    } catch (error) {
      console.error("Error fetching branch data:", error);
      setBranchLoader(false);
      notification.error({
        message: "Error",
        description: "Failed to fetch branch information.",
        duration: 3,
      });
    }
  };

  useEffect(() => {
    getBranchName();
  }, []);

  const getLineDetails = useCallback(async () => {
    try {
      setLoader(true);
      const response = await GET(`${LINE}${params.id}`);
      if (response?.status === 200) {
        setFormData(response?.data || []);
        form.setFieldsValue(response?.data);
      } else {
        setFormData([]);
      }
      setLoader(false);
    } catch (error) {
      setFormData([]);
      setLoader(false);
      console.log(error);
    }
  }, [params.id, form]);

  useEffect(() => {
    if (params.id) {
      getLineDetails();
    }
  }, [params.id, getLineDetails]);

  const onFinish = async () => {
    setLoader(true);
    try {
      const response = params.id 
        ? await PUT(`${LINE}${params.id}/`, formData) 
        : await POST(LINE, formData);
      
      setLoader(false);
      if (response.status === 400) {
        notification.error({
          message: "Line",
          description:
            response?.data?.lineName?.[0] ||
            (params.id ? ERROR_MESSAGES.LINE.UPDATE_FAILED : ERROR_MESSAGES.LINE.CREATE_FAILED),
          duration: 0,
        });
        return;
      }

      setFormData({
        lineName: "",
        lineType: "",
        branch: "",
        installment: null,
        badinstallment: null,
      });
      form.setFieldsValue({
        lineName: "",
        lineType: "",
        installment: null,
        badinstallment: null,
      });
      notification.success({
        message: `${response?.data?.lineName?.toUpperCase()} Line ${
          params.id ? "Update" : "Create"
        }!`,
        description: params.id 
          ? SUCCESS_MESSAGES.LINE.UPDATED 
          : SUCCESS_MESSAGES.LINE.CREATED,
        duration: 0,
      });

      navigate(`/line`);
    } catch (error) {
      notification.error({
        message: "Line",
        description: ERROR_MESSAGES.LINE.OPERATION_FAILED,
        duration: 0,
      });
    } finally {
      setLoader(false);
    }
  };

  const onValuesChange = (changedValues, allValues) => {
    setFormData({ ...formData, ...allValues });
  };

  const options = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
  ];

  return (
    <>
      {loader && <Loader />}

      <div className="add-line-page-content">
        <div className="add-line-container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="add-line-header">
                <h2 className="add-line-title">
                  {params.id ? "Edit Line" : "Add Line"}
                </h2>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={onValuesChange}
                initialValues={formData}
                className="add-line-form"
              >
                <div className="container add-line-form-container">
                  {/* Branch and Line Name */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Item
                        label="Branch"
                        rules={[{ 
                          required: true, 
                          message: ERROR_MESSAGES.LINE.BRANCH_REQUIRED 
                        }]}
                      >
                        {branchLoader ? (
                          <InputWithAddon
                            icon={<Spin size="small" />}
                            value="Loading..."
                            disabled
                            style={{ 
                              backgroundColor: '#f5f5f5',
                              cursor: 'not-allowed',
                              color: '#999'
                            }}
                          />
                        ) : (
                          <InputWithAddon
                            icon={<BankOutlined />}
                            value={selectedBranchName || "No branch selected"}
                            placeholder="No branch selected"
                            disabled
                            style={{ 
                              backgroundColor: '#f5f5f5',
                              cursor: 'not-allowed',
                              color: '#000'
                            }}
                          />
                        )}
                      </Form.Item>
                    </div>

                    <div className="col-md-6">
                      <Form.Item
                        label="Line Name"
                        name="lineName"
                        rules={[
                          { 
                            required: true, 
                            message: ERROR_MESSAGES.LINE.LINE_NAME_REQUIRED 
                          },
                          { 
                            pattern: /^[A-Za-z\s]+$/, 
                            message: 'Line name must contain only alphabets' 
                          }
                        ]}
                      >
                        <InputWithAddon
                          icon={<ApartmentOutlined />}
                          placeholder="Enter line name"
                          onKeyPress={(e) => {
                            if (!/[A-Za-z\s]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Line Type & Installment */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Item
                        label="Line Type"
                        name="lineType"
                        rules={[{ 
                          required: true, 
                          message: ERROR_MESSAGES.LINE.LINE_TYPE_REQUIRED 
                        }]}
                      >
                        <SelectWithAddon
                          icon={<ClockCircleOutlined />}
                          placeholder="Select Line Type"
                          size="large"
                        >
                          {options.map((option) => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </SelectWithAddon>
                      </Form.Item>
                    </div>

                    <div className="col-md-6">
                      <Form.Item
                        label="Installment"
                        name="installment"
                        rules={[
                          { 
                            required: true, 
                            message: ERROR_MESSAGES.LINE.INSTALLMENT_REQUIRED 
                          },
                          {
                            pattern: /^[1-9]\d*$/,
                            message: 'Please enter a valid number (greater than 0)'
                          }
                        ]}
                      >
                        <InputWithAddon
                          icon={<CalendarOutlined />}
                          placeholder="Enter number of installments"
                          type="text"
                          inputMode="decimal"
                          onKeyPress={(e) => {
                            if (!/\d/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Bad Installment */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Item
                        label="No. of Bad Installments"
                        name="badinstallment"
                        rules={[
                          {
                            required: true,
                            message: ERROR_MESSAGES.LINE.BAD_INSTALLMENT_REQUIRED,
                          },
                          {
                            pattern: /^[0-9]\d*$/,
                            message: 'Please enter a valid number'
                          }
                        ]}
                      >
                        <InputWithAddon
                          icon={<WarningOutlined />}
                          placeholder="Enter bad installment count"
                          type="text"
                          inputMode="decimal"
                          onKeyPress={(e) => {
                            if (!/\d/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="text-center mt-4">
                    <Space size="large">
                      <Button type="primary" htmlType="submit" size="large">
                        {params.id ? "Update Line" : "Add Line"}
                      </Button>

                      <Button
                        size="large"
                        onClick={() => navigate("/line")}
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

export default AddLine;