import {
  Form,
  Select,
  Input,
  DatePicker,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Divider,
  Space,
  notification,
  Typography,
  Alert,
  Tag,
} from "antd";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  DISBURSE_LOAN,
  LINE,
  ADD_BRANCH,
  AREA,
  CUSTOMERS,
} from "helpers/url_helper";
import { getDetails, getList } from "helpers/getters";
import { Fragment, useState, useEffect, useCallback } from "react";
import Loader from "components/Common/Loader";
import LoanDisbursementSetup from "components/Common/LoanDisbursementSetup";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { POST, PUT } from "helpers/api_helper";
import moment from "moment";
import { testAPIEndpoints, getCurrentUser } from "../../../utils/apiTest";
import { testCustomerAPI } from "../../../utils/customerTest";
import {
  shouldShowDebugFeatures,
  devLog,
  devWarn,
} from "../../../utils/environment";
import { useOrganizationFilters } from "../../../hooks/useOrganizationFilters";

const { TextArea } = Input;
const { Title } = Typography;

const DisburseLoanForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [lineList, setLineList] = useState(null);
  const [branchList, setBranchList] = useState(null);
  const [areaList, setAreaList] = useState(null);
  const [customerList, setCustomerList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loan, setLoan] = useState(null);
  const [isFormEmpty, setIsFormEmpty] = useState(!params.id);
  const [showInitialModal, setShowInitialModal] = useState(!params.id);
  const isEditMode = !!params.id;
  const [formReady, setFormReady] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [dataLoaded, setDataLoaded] = useState({
    lineList: false,
    branchList: false,
    areaList: false,
  });

  const customerData = location.state?.customerData;

  // Initialize organization filters hook
  const {
    availableBranches,
    availableLines,
    availableAreas,
    handleBranchChange,
    handleLineChange,
    handleAreaChange,
  } = useOrganizationFilters([], branchList, lineList, areaList);

  const loadCustomerData = useCallback(async () => {
    try {
      setCustomerList(null);
      const customers = await getList(CUSTOMERS);
      devLog("Customer list loaded:", customers);
      setCustomerList(customers);
      if (customerData && formReady && customers?.length) {
        const matchingCustomer = customers.find(
          (customer) =>
            customer.id === customerData.customerId ||
            customer.customer_code === customerData.customerId ||
            customer.customer_name === customerData.customerName
        );

        if (matchingCustomer) {
          devLog("Found matching customer in list:", matchingCustomer);
          setTimeout(() => {
            form.setFieldsValue({
              loan_dsbrsmnt_cust_id: matchingCustomer.id,
              loan_dsbrsmnt_cust_cd:
                matchingCustomer.customer_code || matchingCustomer.customer_cd,
              loan_dsbrsmnt_cust_nm:
                matchingCustomer.customer_name || matchingCustomer.customer_nm,
            });
          }, 100);
        }
      }
    } catch (error) {
      console.error("Error loading customer list:", error);
    }
  }, [customerData, formReady, form]);

  useEffect(() => {
    if (params.id) {
      getDetails(DISBURSE_LOAN, params.id)
        .then((res) => {
          devLog("Loan details loaded:", res);
          setLoan(res);
          setFormReady(true);
          form.setFieldsValue({
            loan_dsbrsmnt_brnch_id: res.loan_dsbrsmnt_brnch_id,
            loan_dsbrsmnt_line_id: res.loan_dsbrsmnt_line_id,
            loan_dsbrsmnt_area_id: [res.loan_dsbrsmnt_area_id],
            loan_dsbrsmnt_cust_id: res.loan_dsbrsmnt_cust_id,
            loan_dsbrsmnt_dt: res.loan_dsbrsmnt_dt
              ? moment(res.loan_dsbrsmnt_dt)
              : null,
            loan_dsbrsmnt_repmnt_type: res.loan_dsbrsmnt_repmnt_type,
            loan_dsbrsmnt_amnt: res.loan_dsbrsmnt_amnt,
            loan_dsbrsmnt_intrst_amnt: res.loan_dsbrsmnt_intrst_amnt,
            loan_dsbrsmnt_tot_instlmnt: res.loan_dsbrsmnt_tot_instlmnt,
            loan_dsbrsmnt_prcsng_fee_amnt: res.loan_dsbrsmnt_prcsng_fee_amnt,
            loan_dsbrsmnt_instlmnt_amnt: res.loan_dsbrsmnt_instlmnt_amnt,
            loan_dsbrsmnt_dflt_pay_amnt: res.loan_dsbrsmnt_dflt_pay_amnt,
            loan_dsbrsmnt_bad_loan_days: res.loan_dsbrsmnt_bad_loan_days,
            loan_dsbrsmnt_mode: res.loan_dsbrsmnt_mode,
            loan_dsbrsmnt_comnt: res.loan_dsbrsmnt_comnt,
          });

          loadCustomerData();
        })
        .catch((error) => {
          console.error("Error fetching loan details:", error);
          notification.error({
            message: "Failed to load loan details",
            description: "Please try again later.",
          });
          setFormReady(true);
        });
    }
  }, [params.id, form, loadCustomerData]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const promises = [
          getList(ADD_BRANCH)
            .then((res) => {
              devLog("Branch list loaded:", res);
              setBranchList(res);
              setDataLoaded((prev) => ({ ...prev, branchList: true }));
            })
            .catch((error) => {
              console.error("Error loading branch list:", error);
              setBranchList([]);
              setDataLoaded((prev) => ({ ...prev, branchList: true }));
            }),
          getList(LINE)
            .then((res) => {
              devLog("Line list loaded:", res);
              setLineList(res);
              setDataLoaded((prev) => ({ ...prev, lineList: true }));
            })
            .catch((error) => {
              console.error("Error loading line list:", error);
              setLineList([]);
              setDataLoaded((prev) => ({ ...prev, lineList: true }));
            }),
          getList(AREA)
            .then((res) => {
              devLog("Area list loaded:", res);
              setAreaList(res);
              setDataLoaded((prev) => ({ ...prev, areaList: true }));
            })
            .catch((error) => {
              console.error("Error loading area list:", error);
              setAreaList([]);
              setDataLoaded((prev) => ({ ...prev, areaList: true }));
            }),
        ];

        await Promise.allSettled(promises);
      } catch (error) {
        console.error("Error loading data:", error);
        setApiError(true);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const allDataLoaded = Object.values(dataLoaded).every((loaded) => loaded);
    devLog("Data loaded state:", dataLoaded, "All loaded:", allDataLoaded);

    if (allDataLoaded) {
      devLog("Setting loading to false");
      setLoading(false);

      if (customerData && !params.id) {
        devLog("Prefilling with customer data:", customerData);

        if (!customerData.branch || !customerData.line || !customerData.area) {
          devWarn("Incomplete customer data - showing modal:", customerData);
          notification.warning({
            message: "Incomplete Customer Data",
            description:
              "Some customer context data is missing. Please select the required fields.",
            duration: 3,
          });
          return;
        }

        const selectedBranch = branchList?.find(
          (b) => b.branch_name === customerData.branch
        );
        const selectedLine = lineList?.find(
          (l) => (l.lineName || l.line_name) === customerData.line
        );
        const selectedArea = areaList?.find(
          (a) => a.areaName === customerData.area
        );

        if (selectedBranch && selectedLine && selectedArea) {
          devLog(
            "Found matching data - skipping modal and prefilling main form"
          );

          setShowInitialModal(false);
          setFormReady(true);

          const loanAccountNumber = `LOAN${Date.now()}${Math.floor(Math.random() * 1000)}`;

          form.setFieldsValue({
            loan_dsbrsmnt_brnch_id: selectedBranch.id,
            loan_dsbrsmnt_line_id: selectedLine.id,
            loan_dsbrsmnt_area_id: [selectedArea.id],
            loan_dsbrsmnt_dt: moment(),
            loan_dsbrsmnt_acc_nbr: loanAccountNumber,

            ...(customerData.customerId && {
              loan_dsbrsmnt_cust_id: customerData.customerId,
              loan_dsbrsmnt_cust_cd: customerData.customerId,
              loan_dsbrsmnt_cust_nm: customerData.customerName,
            }),
          });

          loadCustomerData();
        } else {
          devWarn("Could not find matching branch/line/area data:", {
            customerData,
            foundBranch: !!selectedBranch,
            foundLine: !!selectedLine,
            foundArea: !!selectedArea,
          });

          notification.warning({
            message: "Data Mismatch",
            description:
              "Could not find matching branch, line, or area data. Please select manually.",
            duration: 3,
          });
        }
      }
    }
  }, [
    dataLoaded,
    customerData,
    branchList,
    lineList,
    areaList,
    params.id,
    form,
    loadCustomerData,
  ]);

  const handleInitialSubmit = (values) => {
    setShowInitialModal(false);
    setFormReady(true);

    const loanAccountNumber = `LOAN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    form.setFieldsValue({
      loan_dsbrsmnt_brnch_id: values.loan_dsbrsmnt_brnch_id,
      loan_dsbrsmnt_line_id: values.loan_dsbrsmnt_line_id,
      loan_dsbrsmnt_area_id: values.loan_dsbrsmnt_area_id,
      loan_dsbrsmnt_dt: moment(),
      loan_dsbrsmnt_acc_nbr: loanAccountNumber,
    });

    loadCustomerData();
  };

  const calculateAmountPerInstallment = () => {
    const loanAmount = form.getFieldValue("loan_dsbrsmnt_amnt") || 0;
    const interestAmount = form.getFieldValue("loan_dsbrsmnt_intrst_amnt") || 0;
    const processingFee =
      form.getFieldValue("loan_dsbrsmnt_prcsng_fee_amnt") || 0;
    const numberOfInstallments =
      form.getFieldValue("loan_dsbrsmnt_tot_instlmnt") || 1;

    const totalAmount = loanAmount + interestAmount + processingFee;
    const amountPerInstallment = totalAmount / numberOfInstallments;

    form.setFieldsValue({
      loan_dsbrsmnt_instlmnt_amnt: amountPerInstallment.toFixed(2),
    });
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = {
        ...values,
        loan_dsbrsmnt_dt: values.loan_dsbrsmnt_dt?.format("YYYY-MM-DD"),
        loan_dsbrsmnt_area_id: Array.isArray(values.loan_dsbrsmnt_area_id)
          ? values.loan_dsbrsmnt_area_id[0]
          : values.loan_dsbrsmnt_area_id,
        // loan_dsbrsmnt_created_by: localStorage.getItem("auth_user")
        //   ? JSON.parse(localStorage.getItem("auth_user")).id
        //   : null,
        // loan_dsbrsmnt_updtd_by: localStorage.getItem("auth_user")
        //   ? JSON.parse(localStorage.getItem("auth_user")).id
        //   : null,
        loan_dsbrsmnt_created_by: 24,
        loan_dsbrsmnt_updtd_by: 24,
      };

      let response;
      if (params.id) {
        response = await PUT(`${DISBURSE_LOAN}${params.id}/`, formData);
      } else {
        response = await POST(DISBURSE_LOAN, formData);
      }

      if (response?.status === 200 || response?.status === 201) {
        notification.success({
          message: `Loan disbursement ${params.id ? "updated" : "created"} successfully!`,
        });
        navigate("/disburse-loan");
      } else {
        console.error("API response error:", response);
        notification.error({
          message: `Failed to ${params.id ? "update" : "create"} loan disbursement`,
          description:
            response?.data?.message || "Please check your input and try again.",
        });
      }
    } catch (error) {
      console.error(error);
      notification.error({
        message: "An error occurred while saving the loan disbursement",
      });
    } finally {
      setLoading(false);
    }
  };

  const loanRepaymentTypes = [
    { label: "Daily", value: "Daily" },
    { label: "Weekly", value: "Weekly" },
    { label: "Monthly", value: "Monthly" },
  ];

  const paymentModes = [
    { label: "Cash", value: "Cash" },
    { label: "Online", value: "Online" },
    { label: "Cheque", value: "Cheque" },
  ];

  const handleTestAPI = async () => {
    console.log("Current user:", getCurrentUser());
    const results = await testAPIEndpoints();
    console.log("API test results:", results);

    const customerTest = await testCustomerAPI();
    console.log("Customer API test:", customerTest);

    notification.info({
      message: "API Test Complete",
      description: "Check browser console for detailed results",
    });
  };

  const handleRefreshCustomers = async () => {
    try {
      setCustomerList(null);
      const customers = await getList(CUSTOMERS);
      devLog("Refreshed customer list:", customers);
      setCustomerList(customers);
      notification.success({
        message: "Customers refreshed",
        description: `Loaded ${customers?.length || 0} customers`,
      });
    } catch (error) {
      console.error("Error refreshing customers:", error);
      notification.error({
        message: "Failed to refresh customers",
        description: "Please check your connection and try again",
      });
      setCustomerList([]);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="container-fluid p-5">
          <div className="row">
            <div className="col-md-12">
              <Card>
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ minHeight: "400px" }}
                >
                  <div className="text-center">
                    <Loader />
                    <p className="mt-3 text-muted">
                      Loading loan disbursement form...
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="page-content">
        <div className="cursor-pointer back-icon">
          <span onClick={() => navigate("/disburse-loan")}>
            <ArrowLeftOutlined /> Back
          </span>
        </div>
        <div className="container-fluid p-5">
          <div className="row">
            <div className="col-md-12">
              <Card>
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ minHeight: "400px" }}
                >
                  <div className="text-center">
                    <Alert
                      message="Connection Error"
                      description="Unable to load the required data. Please check your internet connection and try again."
                      type="error"
                      showIcon
                      className="mb-4"
                    />
                    <Space>
                      <Button
                        type="primary"
                        onClick={() => window.location.reload()}
                        icon={<ReloadOutlined />}
                      >
                        Retry
                      </Button>
                      <Button onClick={() => navigate("/disburse-loan")}>
                        Go Back
                      </Button>
                    </Space>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="page-content">
        <div className="cursor-pointer back-icon">
          <span onClick={() => navigate("/disburse-loan")}>
            <ArrowLeftOutlined /> Back
          </span>
        </div>

        <div className="container-fluid p-3 p-md-5">
          {/* Initial Selection Modal */}
          <LoanDisbursementSetup
            visible={showInitialModal}
            onClose={() => navigate("/disburse-loan")}
            onSubmit={handleInitialSubmit}
            branchList={branchList}
            lineList={lineList}
            areaList={areaList}
          />

          {/* Main Loan Disbursement Form */}
          {formReady && (
            <>
              {(!branchList || branchList.length === 0) && (
                <Alert
                  message="No Data Available"
                  description="Branch, Line, and Area data is required to proceed. Please ensure the data is properly configured in the system."
                  type="warning"
                  showIcon
                  className="mb-4"
                />
              )}
              <div className="row">
                <div className="col-md-12">
                  <Card className="p-3 p-md-4">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "24px",
                        flexWrap: "wrap",
                        gap: "12px",
                        minHeight: "40px",
                      }}
                    >
                      <Title
                        level={3}
                        className="loan-form-title"
                        style={{
                          margin: 0,
                          fontSize: "20px",
                          fontWeight: "600",
                          lineHeight: "1.3",
                          wordBreak: "normal",
                          whiteSpace: "normal",
                          display: "block",
                        }}
                      >
                        <span
                          className="title-full"
                          style={{ display: "none" }}
                        >
                          {params.id
                            ? "Edit Loan Disbursement"
                            : "New Loan Disbursement"}
                        </span>
                        <span className="title-short">
                          {params.id ? "Edit Loan" : "New Loan"}
                        </span>
                      </Title>
                      <Space wrap>
                        {shouldShowDebugFeatures() && (
                          <>
                            <Button
                              type="dashed"
                              onClick={handleTestAPI}
                              icon={<ReloadOutlined />}
                            >
                              Test API
                            </Button>
                            <Button
                              type="primary"
                              size="small"
                              onClick={handleRefreshCustomers}
                              icon={<ReloadOutlined />}
                            >
                              Refresh Customers
                            </Button>
                          </>
                        )}
                        <Tag
                          color={
                            customerList === null
                              ? "processing"
                              : customerList?.length > 0
                                ? "success"
                                : "error"
                          }
                        >
                          Customers:{" "}
                          {customerList === null
                            ? "Loading"
                            : customerList?.length || 0}
                        </Tag>
                      </Space>
                    </div>

                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={onFinish}
                      onValuesChange={(changedValues, allValues) => {
                        const isEmpty = Object.values(allValues).every(
                          (value) =>
                            value === undefined ||
                            value === null ||
                            value === ""
                        );
                        setIsFormEmpty(isEmpty);

                        if (changedValues.loan_dsbrsmnt_brnch_id) {
                          const branchName = branchList?.find(
                            (b) => b.id === changedValues.loan_dsbrsmnt_brnch_id
                          )?.branch_name;
                          if (branchName) {
                            handleBranchChange(branchName);
                          }
                          form.setFieldsValue({
                            loan_dsbrsmnt_line_id: undefined,
                            loan_dsbrsmnt_area_id: undefined,
                          });
                        }

                        if (changedValues.loan_dsbrsmnt_line_id) {
                          const lineName =
                            lineList?.find(
                              (l) =>
                                l.id === changedValues.loan_dsbrsmnt_line_id
                            )?.line_name ||
                            lineList?.find(
                              (l) =>
                                l.id === changedValues.loan_dsbrsmnt_line_id
                            )?.lineName;
                          if (lineName) {
                            handleLineChange(lineName);
                          }
                          form.setFieldsValue({
                            loan_dsbrsmnt_area_id: undefined,
                          });
                        }

                        if (changedValues.loan_dsbrsmnt_area_id) {
                          const areaName = areaList?.find(
                            (a) => a.id === changedValues.loan_dsbrsmnt_area_id
                          )?.areaName;
                          if (areaName) {
                            handleAreaChange(areaName);
                          }
                        }

                        if (
                          changedValues.loan_dsbrsmnt_amnt ||
                          changedValues.loan_dsbrsmnt_intrst_amnt ||
                          changedValues.loan_dsbrsmnt_prcsng_fee_amnt ||
                          changedValues.loan_dsbrsmnt_tot_instlmnt
                        ) {
                          calculateAmountPerInstallment();
                        }

                        if (changedValues.loan_dsbrsmnt_cust_id) {
                          const selectedCustomer = customerList?.find(
                            (customer) =>
                              customer.id ===
                              changedValues.loan_dsbrsmnt_cust_id
                          );
                          if (selectedCustomer) {
                            devLog("Selected customer:", selectedCustomer);
                            form.setFieldsValue({
                              loan_dsbrsmnt_cust_cd:
                                selectedCustomer.customer_code ||
                                selectedCustomer.customer_cd,
                              loan_dsbrsmnt_cust_nm:
                                selectedCustomer.customer_name ||
                                selectedCustomer.customer_nm,
                            });
                          }
                        }
                      }}
                    >
                      <Divider orientation="left">Basic Information</Divider>
                      {isEditMode && loan && (
                        <Alert
                          message="Branch, Line, and Area are read-only in edit mode"
                          description={
                            <div>
                              <strong>Current Selection:</strong>
                              <br />
                              <span>Branch: {loan.branch_name}</span>
                              <br />
                              <span>Line: {loan.line_name}</span>
                              <br />
                              <span>Area: {loan.area_name}</span>
                            </div>
                          }
                          type="info"
                          showIcon
                          className="mb-4"
                        />
                      )}
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_brnch_id"
                            label={
                              <span>
                                Branch Name
                                {isEditMode && (
                                  <Tag
                                    color="blue"
                                    style={{ marginLeft: 8, fontSize: "10px" }}
                                  >
                                    Read Only
                                  </Tag>
                                )}
                              </span>
                            }
                            rules={[
                              {
                                required: true,
                                message: "Please select a branch",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Select Branch"
                              allowClear
                              disabled={isEditMode}
                              showSearch
                              optionFilterProp="children"
                              title={
                                isEditMode
                                  ? "This field is read-only in edit mode"
                                  : ""
                              }
                            >
                              {availableBranches?.map((branch) => (
                                <Select.Option
                                  key={branch.id}
                                  value={branch.id}
                                >
                                  {branch.branch_name}
                                </Select.Option>
                              )) || []}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_line_id"
                            label={
                              <span>
                                Line Name
                                {isEditMode && (
                                  <Tag
                                    color="blue"
                                    style={{ marginLeft: 8, fontSize: "10px" }}
                                  >
                                    Read Only
                                  </Tag>
                                )}
                              </span>
                            }
                            rules={[
                              {
                                required: true,
                                message: "Please select a line",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Select Line"
                              allowClear
                              disabled={isEditMode}
                              showSearch
                              optionFilterProp="children"
                              title={
                                isEditMode
                                  ? "This field is read-only in edit mode"
                                  : ""
                              }
                            >
                              {availableLines?.map((line) => (
                                <Select.Option key={line.id} value={line.id}>
                                  {line.line_name || line.lineName}
                                </Select.Option>
                              )) || []}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_area_id"
                            label={
                              <span>
                                Area Name (Multi-Select)
                                {isEditMode && (
                                  <Tag
                                    color="blue"
                                    style={{ marginLeft: 8, fontSize: "10px" }}
                                  >
                                    Read Only
                                  </Tag>
                                )}
                              </span>
                            }
                            rules={[
                              {
                                required: true,
                                message: "Please select at least one area",
                              },
                            ]}
                          >
                            <Select
                              mode="multiple"
                              placeholder="Select Areas"
                              allowClear
                              disabled={isEditMode}
                              showSearch
                              optionFilterProp="children"
                              title={
                                isEditMode
                                  ? "This field is read-only in edit mode"
                                  : ""
                              }
                            >
                              {availableAreas?.map((area) => (
                                <Select.Option key={area.id} value={area.id}>
                                  {area.areaName}
                                </Select.Option>
                              )) || []}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_dt"
                            label="Date of Disbursement"
                            rules={[
                              {
                                required: true,
                                message: "Please select a date",
                              },
                            ]}
                          >
                            <DatePicker
                              style={{ width: "100%" }}
                              placeholder="Select Date"
                              format="YYYY-MM-DD"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_cust_id"
                            label="Customer ID"
                            rules={[
                              {
                                required: true,
                                message: "Please select a customer",
                              },
                            ]}
                          >
                            <Select
                              placeholder={
                                customerList === null
                                  ? "Loading customers..."
                                  : customerList?.length === 0
                                    ? "No customers available"
                                    : "Select Customer"
                              }
                              allowClear
                              showSearch
                              optionFilterProp="children"
                              style={{ width: "100%" }}
                              loading={customerList === null}
                              notFoundContent={
                                customerList?.length === 0
                                  ? "No customers found"
                                  : "Loading..."
                              }
                              dropdownRender={(menu) => (
                                <>
                                  {menu}
                                  {customerList?.length === 0 && (
                                    <div
                                      style={{
                                        padding: "8px",
                                        textAlign: "center",
                                        color: "#999",
                                      }}
                                    >
                                      <Button
                                        type="link"
                                        size="small"
                                        onClick={handleRefreshCustomers}
                                      >
                                        Refresh Customers
                                      </Button>
                                    </div>
                                  )}
                                </>
                              )}
                            >
                              {customerList?.map((customer) => (
                                <Select.Option
                                  key={customer.id}
                                  value={customer.id}
                                >
                                  {customer.customer_code ||
                                    customer.customer_cd}{" "}
                                  -{" "}
                                  {customer.customer_name ||
                                    customer.customer_nm}
                                </Select.Option>
                              )) || []}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_cust_cd"
                            label="Customer Code"
                          >
                            <Input
                              placeholder="Auto-filled from customer selection"
                              disabled
                              style={{ backgroundColor: "#f5f5f5" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_cust_nm"
                            label="Customer Name"
                          >
                            <Input
                              placeholder="Auto-filled from customer selection"
                              disabled
                              style={{ backgroundColor: "#f5f5f5" }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_acc_nbr"
                            label="Loan Account Number"
                          >
                            <Input
                              placeholder="Auto-generated"
                              disabled
                              style={{ backgroundColor: "#f5f5f5" }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider orientation="left">Loan Details</Divider>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_repmnt_type"
                            label="Loan Repayment Type"
                            rules={[
                              {
                                required: true,
                                message: "Please select repayment type",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Select Repayment Type"
                              allowClear
                            >
                              {loanRepaymentTypes.map((type) => (
                                <Select.Option
                                  key={type.value}
                                  value={type.value}
                                >
                                  {type.label}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_amnt"
                            label="Loan Amount"
                            rules={[
                              {
                                required: true,
                                message: "Please enter loan amount",
                              },
                            ]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              placeholder="Enter Loan Amount"
                              min={0}
                              precision={2}
                              formatter={(value) =>
                                `₹ ${value}`.replace(
                                  /\B(?=(\d{3})+(?!\d))/g,
                                  ","
                                )
                              }
                              parser={(value) =>
                                value.replace(/₹\s?|(,*)/g, "")
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_intrst_amnt"
                            label="Interest Amount"
                            rules={[
                              {
                                required: true,
                                message: "Please enter interest amount",
                              },
                            ]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              placeholder="Enter Interest Amount"
                              min={0}
                              precision={2}
                              formatter={(value) =>
                                `₹ ${value}`.replace(
                                  /\B(?=(\d{3})+(?!\d))/g,
                                  ","
                                )
                              }
                              parser={(value) =>
                                value.replace(/₹\s?|(,*)/g, "")
                              }
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_tot_instlmnt"
                            label="No. of Installment"
                            rules={[
                              {
                                required: true,
                                message: "Please enter number of installments",
                              },
                            ]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              placeholder="Enter Number of Installments"
                              min={1}
                              precision={0}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_prcsng_fee_amnt"
                            label="Processing Fee"
                            rules={[
                              {
                                required: true,
                                message: "Please enter processing fee",
                              },
                            ]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              placeholder="Enter Processing Fee"
                              min={0}
                              precision={2}
                              formatter={(value) =>
                                `₹ ${value}`.replace(
                                  /\B(?=(\d{3})+(?!\d))/g,
                                  ","
                                )
                              }
                              parser={(value) =>
                                value.replace(/₹\s?|(,*)/g, "")
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_instlmnt_amnt"
                            label="Amount Per Install"
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              placeholder="Auto-calculated"
                              min={0}
                              precision={2}
                              disabled
                              formatter={(value) =>
                                `₹ ${value}`.replace(
                                  /\B(?=(\d{3})+(?!\d))/g,
                                  ","
                                )
                              }
                              parser={(value) =>
                                value.replace(/₹\s?|(,*)/g, "")
                              }
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_dflt_pay_amnt"
                            label="Default Pay Amount"
                            rules={[
                              {
                                required: true,
                                message: "Please enter default pay amount",
                              },
                            ]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              placeholder="Enter Default Pay Amount"
                              min={0}
                              precision={2}
                              formatter={(value) =>
                                `₹ ${value}`.replace(
                                  /\B(?=(\d{3})+(?!\d))/g,
                                  ","
                                )
                              }
                              parser={(value) =>
                                value.replace(/₹\s?|(,*)/g, "")
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_bad_loan_days"
                            label="Bad Loan Days"
                            rules={[
                              {
                                required: true,
                                message: "Please enter bad loan days",
                              },
                            ]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              placeholder="Enter Bad Loan Days"
                              min={0}
                              precision={0}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8}>
                          <Form.Item
                            name="loan_dsbrsmnt_mode"
                            label="Payment Mode"
                            rules={[
                              {
                                required: true,
                                message: "Please select payment mode",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Select Payment Mode"
                              allowClear
                            >
                              {paymentModes.map((mode) => (
                                <Select.Option
                                  key={mode.value}
                                  value={mode.value}
                                >
                                  {mode.label}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={24} lg={24}>
                          <Form.Item
                            name="loan_dsbrsmnt_remarks"
                            label="Comments"
                          >
                            <TextArea
                              placeholder="Enter comments or remarks about the loan disbursement"
                              rows={3}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider />
                      <div className="d-flex justify-content-center">
                        <Space
                          direction="vertical"
                          size="middle"
                          style={{ width: "100%" }}
                          className="d-md-flex justify-content-md-center"
                        >
                          <div className="d-flex flex-column flex-md-row justify-content-center gap-2">
                            <Button
                              type="primary"
                              htmlType="submit"
                              size="large"
                              style={{ minWidth: "200px" }}
                            >
                              {params.id ? "Update" : "Create"}
                            </Button>
                            <Button
                              onClick={() => navigate("/disburse-loan")}
                              size="large"
                              style={{ minWidth: "200px" }}
                            >
                              Cancel
                            </Button>
                          </div>
                          {!isFormEmpty && !params.id && (
                            <Button
                              onClick={() => {
                                form.resetFields();
                                setIsFormEmpty(true);
                              }}
                              size="large"
                              style={{ minWidth: "200px" }}
                            >
                              Reset
                            </Button>
                          )}
                        </Space>
                      </div>
                    </Form>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default DisburseLoanForm;
