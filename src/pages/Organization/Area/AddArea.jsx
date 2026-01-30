import { useEffect, useState } from "react";
import { Form, Input, Button, Select, notification, Divider, Space, Spin } from "antd";
import { 
  BankOutlined, 
  ApartmentOutlined, 
  EnvironmentOutlined 
} from '@ant-design/icons';
import { ToastContainer } from "react-toastify";
import Loader from "components/Common/Loader";
import { AREA } from "helpers/url_helper";
import { POST, GET,PUT } from "helpers/api_helper";
import { useParams, useNavigate } from "react-router-dom";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, NOTIFICATION_TITLES } from "helpers/errorMessages";
import InputWithAddon from "components/Common/InputWithAddon";
import SelectWithAddon from "components/Common/SelectWithAddon";
import "./AddArea.css";

const { Option } = Select;

const AddArea = () => {
  const [loader, setLoader] = useState(false);
  const [lineList, setLineList] = useState([]);
  const [formData, setFormData] = useState({
    line_id: undefined,
    areaName: "",
    branch_id: "",
  });
  const [branchLoader, setBranchLoader] = useState(false);
  const [lineLoader, setLineLoader] = useState(false);
  const [selectedBranchName, setSelectedBranchName] = useState("");
  const [form] = Form.useForm();
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getBranchName();
  }, []);

  useEffect(() => {
    if (params.id) {
      getAreaDetails();
    }
  }, [params.id]);

  // Fetch lines when branch is selected
  useEffect(() => {
    if (formData?.branch_id) {
      getLineList(formData.branch_id);
    }
  }, [formData?.branch_id]);

  // Fetch branch name from branch_dd API
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
          setSelectedBranchName(matchedBranch.branch_name);
          setFormData((prev) => ({
            ...prev,
            branch_id: parseInt(selectedBranchId),
          }));
          form.setFieldsValue({ branch_id: parseInt(selectedBranchId) });
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

  const getAreaDetails = async () => {
    try {
      setLoader(true);
      const response = await GET(`${AREA}${params.id}`);
      if (response?.status === 200) {
        const updatedData = {
          ...response?.data,
          line_id: response?.data?.lineid,
          branch_id: response?.data?.branchid,
        };
        delete updatedData?.lineid;
        delete updatedData?.branchid;
        
        setFormData(updatedData || []);
        form.setFieldsValue(updatedData);
      } else {
        setFormData([]);
      }
      setLoader(false);
    } catch (error) {
      setFormData([]);
      setLoader(false);
      console.log(error);
    }
  };

  const getLineList = async (branchId = null) => {
    try {
      setLineLoader(true);
      const response = await GET("api/line_dd");
      
      if (response?.status === 200) {
        // Filter lines by branch if branchId is provided
        if (branchId) {
          const filteredLines = response?.data?.filter(
            (line) => line?.branch_id === branchId
          );
          setLineList(filteredLines);
        } else {
          setLineList(response?.data);
        }
      } else {
        setLineList([]);
      }
      setLineLoader(false);
    } catch (error) {
      setLineList([]);
      setLineLoader(false);
    }
  };

   const onFinish = async () => {
    setLoader(true);
    try {
      let response;
      
      if (params.id) {
        // Edit mode - use PUT API
        response = await PUT(`${AREA}${params.id}/`, formData);
      } else {
        // Create mode - use POST API
        response = await POST(AREA, formData);
      }

      setLoader(false);
      
      if (response.status >= 400) {
        notification.error({
          message: NOTIFICATION_TITLES.AREA,
          description: params?.id 
            ? ERROR_MESSAGES.AREA.UPDATE_FAILED 
            : ERROR_MESSAGES.AREA.CREATE_FAILED,
          duration: 0,
        });
        return;
      }
      
      setFormData({
        line_id: "",
        areaName: "",
        branch_id: "",
      });
      form.setFieldsValue({
        line_id: "",
        areaName: "",
        branch_id: "",
      });
      
      notification.success({
        message: `${formData?.areaName?.toUpperCase()} ${NOTIFICATION_TITLES.AREA} ${
          params.id ? "Update" : "Create"
        }!`,
        description: params?.id 
          ? SUCCESS_MESSAGES.AREA.UPDATED 
          : SUCCESS_MESSAGES.AREA.CREATED,
        duration: 0,
      });

      navigate(`/area`);
    } catch (error) {
      notification.error({
        message: NOTIFICATION_TITLES.AREA,
        description: ERROR_MESSAGES.AREA.OPERATION_FAILED,
        duration: 0,
      });
    } finally {
      setLoader(false);
    }
  };
  const onValuesChange = (changedValues, allValues) => {
    if (changedValues?.branch_id) {
      // Clear line selection when branch changes
      setFormData({ ...formData, ...allValues, line_id: "" });
      form.setFieldsValue({
        line_id: "",
      });
      // Fetch lines for the new branch
      getLineList(allValues.branch_id);
      return;
    }
    setFormData({ ...formData, ...allValues });
  };

  return (
    <>
      {loader && <Loader />}

      <div className="add-area-page-content">
        <div className="add-area-container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="add-area-header">
                <h2 className="add-area-title">
                  {params.id ? "Edit Area" : "Add Area"}
                </h2>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={onValuesChange}
                initialValues={formData}
                className="add-area-form"
              >
                <div className="container add-area-form-container">
                  {/* Branch and Line */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Item
                        label="Branch"
                        rules={[
                          {
                            required: true,
                            message: ERROR_MESSAGES.AREA.BRANCH_REQUIRED,
                          },
                        ]}
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
                        label="Line"
                        name="line_id"
                        rules={[
                          {
                            required: true,
                            message: ERROR_MESSAGES.AREA.LINE_REQUIRED,
                          },
                        ]}
                      >
                        <SelectWithAddon
                          icon={<ApartmentOutlined />}
                          placeholder="Select Line"
                          allowClear
                          showSearch
                          size="large"
                          loading={lineLoader}
                          disabled={!!params.id || !formData?.branch_id}
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {lineList?.map((line) => (
                            <Option key={line?.line_id} value={line?.line_id}>
                              {line?.line_name}
                            </Option>
                          ))}
                        </SelectWithAddon>
                      </Form.Item>
                    </div>
                  </div>

                  {/* Area Name */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Item
                        label="Area Name"
                        name="areaName"
                        rules={[
                          {
                            required: true,
                            message: 'Please enter area name',
                          },
                          { 
                            pattern: /^[A-Za-z\s]+$/, 
                            message: 'Area name must contain only alphabets' 
                          }
                        ]}
                      >
                        <InputWithAddon
                          icon={<EnvironmentOutlined />}
                          placeholder="Enter area name"
                          onValueFilter={(value) => value.replace(/[^A-Za-z\s]/g, '')}
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="text-center mt-4">
                    <Space size="large">
                      <Button type="primary" htmlType="submit" size="large">
                        {params.id ? "Update Area" : "Add Area"}
                      </Button>

                      <Button
                        size="large"
                        onClick={() => navigate("/area")}
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

export default AddArea;