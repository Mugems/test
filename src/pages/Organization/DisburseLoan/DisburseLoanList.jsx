import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Flex,
  Form,
  notification,
  Select,
  Space,
  Tag,
  Tooltip,
  Modal,
  Typography,
  Row,
  Col,
  Statistic,
  Tabs,
  Collapse,
} from 'antd';
import Loader from 'components/Common/Loader';
import LoanDisbursementSetup from 'components/Common/LoanDisbursementSetup';
import { useOrganizationFilters } from 'hooks/useOrganizationFilters';
import dayjs from 'dayjs';
import { GET } from 'helpers/api_helper';
import { getList } from 'helpers/getters';
import { DISBURSE_LOAN, ADD_BRANCH, LINE, AREA } from 'helpers/url_helper';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { devLog, devWarn } from '../../../utils/environment';
import { CollectComingSoonSvg, NoCustomersFoundSvg } from 'components/Common/SvgIllustrations';

const { Title } = Typography;

const DisburseLoanList = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState([]);
  const [groupedLoans, setGroupedLoans] = useState([]);
  const [filteredGroupedLoans, setFilteredGroupedLoans] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [lineList, setLineList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [setupModalVisible, setSetupModalVisible] = useState(false);

  const {
    selectedBranch,
    selectedLine,
    selectedArea,
    availableBranches,
    availableLines,
    availableAreas,
    availableCustomers,
    handleBranchChange,
    handleLineChange,
    handleAreaChange,
    resetAll,
  } = useOrganizationFilters(loans, branchList, lineList, areaList);

  const applyFilters = useCallback(
    (values, data = loans) => {
      let filtered = [...data];

      if (selectedBranch) {
        filtered = filtered.filter((item) => item.LOAN_DSBRSMNT_BRNCH_NM === selectedBranch);
      }
      if (selectedLine) {
        filtered = filtered.filter((item) => item.LOAN_DSBRSMNT_LINE_NM === selectedLine);
      }
      if (selectedArea) {
        filtered = filtered.filter((item) => item.LOAN_DSBRSMNT_AREA_NM === selectedArea);
      }

      if (values.customer) {
        filtered = filtered.filter(
          (item) =>
            item.LOAN_DSBRSMNT_CUST_NM?.toLowerCase().includes(values.customer.toLowerCase()) ||
            item.LOAN_DSBRSMNT_CUST_CD?.toString().includes(values.customer.toLowerCase())
        );
      }

      if (values.fromDate) {
        filtered = filtered.filter((item) =>
          dayjs(item.loan_dsbrsmnt_dt).isAfter(dayjs(values.fromDate).subtract(1, 'day'))
        );
      }

      if (values.toDate) {
        filtered = filtered.filter((item) =>
          dayjs(item.loan_dsbrsmnt_dt).isBefore(dayjs(values.toDate).add(1, 'day'))
        );
      }

      const grouped = groupLoansByCustomer(filtered);
      setFilteredGroupedLoans(grouped);
    },
    [loans, selectedBranch, selectedLine, selectedArea]
  );

  useEffect(() => {
    Promise.all([getLoanList(), getList(ADD_BRANCH), getList(LINE), getList(AREA)]).then(
      ([loansRes, branchRes, lineRes, areaRes]) => {
        setLoans(loansRes);
        const grouped = groupLoansByCustomer(loansRes);
        setGroupedLoans(grouped);
        setFilteredGroupedLoans(grouped);
        setBranchList(branchRes);
        setLineList(lineRes);
        setAreaList(areaRes);
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (selectedLine === null) {
      form.setFieldValue('line', null);
    }
  }, [selectedLine, form]);

  useEffect(() => {
    if (selectedArea === null) {
      form.setFieldValue('area', null);
    }
  }, [selectedArea, form]);

  useEffect(() => {
    const values = form.getFieldsValue();
    applyFilters(values);
  }, [selectedBranch, selectedLine, selectedArea, applyFilters, form]);

  const getLoanList = async () => {
    try {
      const response = await getList(DISBURSE_LOAN);
      devLog('Loan list response:', response);

      if (!Array.isArray(response)) {
        devWarn('Loan list response is not an array:', response);
        return [];
      }

      return response || [];
    } catch (error) {
      console.error('Error fetching loan list:', error);
      notification.error({
        message: 'Failed to fetch loan disbursements',
        description: 'An error occurred while loading loan data. Please try again.',
      });
      return [];
    }
  };

  const handleView = async (record) => {
    try {
      const response = await GET(`${DISBURSE_LOAN}${record.id}/`);
      setSelectedLoan(response);
      setViewModalVisible(true);
    } catch (error) {
      console.error('Error in handleView:', error);
      notification.error({
        message: 'Failed to load loan details',
        description: 'An error occurred while fetching loan information',
      });
    }
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    applyFilters(values);
  };

  const handleReset = () => {
    form.resetFields();
    resetAll();
    setFilteredGroupedLoans(groupedLoans);
  };

  const handleNewLoan = (customerGroup) => {
    const customerData = {
      customerId: customerGroup.customerId,
      customerName: customerGroup.customerName,
      branch: customerGroup.branch,
      line: customerGroup.line,
      area: customerGroup.area,
    };

    navigate('/new-loan-disbursement', { state: { customerData } });
  };

  const handleNewLoanWithFilters = () => {
    setSetupModalVisible(true);
  };

  const handleSetupSubmit = (values) => {
    const customerData = {
      branchId: values.loan_dsbrsmnt_brnch_id,
      lineId: values.loan_dsbrsmnt_line_id,
      areaIds: values.loan_dsbrsmnt_area_id,
      branch: branchList.find((b) => b.id === values.loan_dsbrsmnt_brnch_id)?.branch_name,
      line:
        lineList.find((l) => l.id === values.loan_dsbrsmnt_line_id)?.lineName ||
        lineList.find((l) => l.id === values.loan_dsbrsmnt_line_id)?.line_name,
      area: areaList.find((a) => values.loan_dsbrsmnt_area_id.includes(a.id))?.areaName,
    };

    navigate('/new-loan-disbursement', { state: { customerData } });
  };

  const handleSetupClose = () => {
    setSetupModalVisible(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'overdue':
        return 'red';
      default:
        return 'default';
    }
  };

  const totalAmount = filteredGroupedLoans.reduce((sum, customerGroup) => {
    return (
      sum +
      customerGroup.loans.reduce((customerSum, loan) => {
        const amount = parseFloat(loan.loan_dsbrsmnt_amnt || 0);
        return isNaN(amount) ? customerSum : customerSum + amount;
      }, 0)
    );
  }, 0);

  const totalLoans = filteredGroupedLoans.reduce((sum, customerGroup) => {
    return sum + customerGroup.loans.length;
  }, 0);

  const groupLoansByCustomer = (loans) => {
    const grouped = loans.reduce((acc, loan) => {
      const customerId = loan.LOAN_DSBRSMNT_CUST_CD;
      if (!acc[customerId]) {
        acc[customerId] = {
          customerId,
          customerName: loan.LOAN_DSBRSMNT_CUST_NM,
          branch: loan.LOAN_DSBRSMNT_BRNCH_NM,
          line: loan.LOAN_DSBRSMNT_LINE_NM,
          area: loan.LOAN_DSBRSMNT_AREA_NM,
          loans: [],
        };
      }
      acc[customerId].loans.push(loan);
      return acc;
    }, {});

    return Object.values(grouped);
  };
  return (
    <div className="page-content">
      {loading && <Loader />}

      <Flex justify="space-between" align="center" className="mb-4" style={{ padding: '0 8px' }}>
        <Title level={2} style={{ margin: 0, fontSize: '28px', fontWeight: '600' }}>
          Loan Disbursements
        </Title>
      </Flex>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-4" style={{ padding: '0 8px' }}>
        <Col xs={12} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: 'none',
            }}
          >
            <Statistic
              title={
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#666' }}>
                  Total Loans
                </span>
              }
              value={totalLoans}
              valueStyle={{
                color: '#1890ff',
                fontSize: '14px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: 'none',
            }}
          >
            <Statistic
              title={
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#666' }}>
                  Total Amount
                </span>
              }
              value={totalAmount}
              precision={2}
              valueStyle={{
                color: '#52c41a',
                fontSize: '14px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
              }}
              prefix="₹"
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <Statistic
              title={
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#666' }}>
                  Average Loan
                </span>
              }
              value={totalLoans > 0 ? totalAmount / totalLoans : 0}
              precision={2}
              valueStyle={{
                color: '#722ed1',
                fontSize: '14px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
              }}
              prefix="₹"
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: 'none',
            }}
          >
            <Statistic
              title={
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#666' }}>
                  Active Loans
                </span>
              }
              value={filteredGroupedLoans.reduce((sum, customerGroup) => {
                return (
                  sum +
                  customerGroup.loans.filter(
                    (loan) =>
                      loan.loan_dsbrsmnt_status?.toLowerCase() === 'active' ||
                      loan.loan_dsbrsmnt_status?.toLowerCase() === 'Active'
                  ).length
                );
              }, 0)}
              valueStyle={{
                color: '#fa8c16',
                fontSize: '14px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Card
        className="mb-4"
        style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                label={
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                    }}
                  >
                    Branch
                  </span>
                }
                name="branch"
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Select Branch"
                  style={{ borderRadius: '8px' }}
                  value={selectedBranch}
                  onChange={handleBranchChange}
                  options={availableBranches.map((branch) => ({
                    label: branch.branch_name,
                    value: branch.branch_name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                label={
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                    }}
                  >
                    Line
                  </span>
                }
                name="line"
              >
                <Select
                  key={`filter-line-${selectedBranch}-${availableLines.length}-${selectedLine}`}
                  showSearch
                  allowClear
                  placeholder="Select Line"
                  style={{ borderRadius: '8px' }}
                  value={selectedLine}
                  onChange={handleLineChange}
                  disabled={!selectedBranch}
                  options={availableLines.map((line) => ({
                    label: line.lineName,
                    value: line.lineName,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                label={
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                    }}
                  >
                    Area
                  </span>
                }
                name="area"
              >
                <Select
                  key={`filter-area-${selectedLine}-${availableAreas.length}-${selectedArea}`}
                  showSearch
                  allowClear
                  placeholder="Select Area"
                  style={{ borderRadius: '8px' }}
                  value={selectedArea}
                  onChange={handleAreaChange}
                  disabled={!selectedBranch || !selectedLine}
                  options={availableAreas.map((area) => ({
                    label: area.areaName,
                    value: area.areaName,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                label={
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                    }}
                  >
                    Search Customer
                  </span>
                }
                name="customer"
              >
                <Select
                  key={`filter-customer-${selectedArea}`}
                  showSearch
                  allowClear
                  placeholder="Search by customer name or code"
                  style={{ borderRadius: '8px' }}
                  disabled={!selectedBranch || !selectedLine || !selectedArea}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={availableCustomers.map((customer) => ({
                    label: `${customer.name} (${customer.id})`,
                    value: customer.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                label={
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                    }}
                  >
                    From Date
                  </span>
                }
                name="fromDate"
              >
                <DatePicker
                  placeholder="Select From Date"
                  style={{ width: '100%', borderRadius: '8px' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                label={
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                    }}
                  >
                    To Date
                  </span>
                }
                name="toDate"
              >
                <DatePicker
                  placeholder="Select To Date"
                  style={{ width: '100%', borderRadius: '8px' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label=" " style={{ marginBottom: 0 }}>
                <Space size="middle">
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                    size="large"
                    style={{
                      height: '40px',
                      padding: '0 20px',
                      borderRadius: '8px',
                      fontWeight: '500',
                    }}
                  >
                    Search
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    size="large"
                    style={{
                      height: '40px',
                      padding: '0 20px',
                      borderRadius: '8px',
                      fontWeight: '500',
                    }}
                  >
                    Reset
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Tabs */}
      <Tabs>
        <Tabs.TabPane tab="Collect" key="collect">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              padding: '40px 20px',
            }}
          >
            <CollectComingSoonSvg width={320} height={240} />
            <Title
              level={2}
              style={{
                margin: '24px 0 16px 0',
                fontSize: '24px',
                fontWeight: '600',
                textAlign: 'center',
                color: '#1f2937',
              }}
            >
              Collection Management
            </Title>
            <p
              style={{
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '16px',
                maxWidth: '480px',
                lineHeight: '1.6',
                margin: 0,
              }}
            >
              The loan collection and repayment tracking system is under development. This feature
              will allow you to manage customer payments, track outstanding amounts, and monitor
              collection schedules.
            </p>
            <div style={{ marginTop: '24px' }}>
              <Tag color="processing" style={{ fontSize: '14px', padding: '4px 12px' }}>
                Coming Soon
              </Tag>
            </div>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Pay" key="pay">
          {filteredGroupedLoans.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                padding: '40px 20px',
              }}
            >
              <NoCustomersFoundSvg width={280} height={200} />
              <Title
                level={3}
                style={{
                  margin: '24px 0 16px 0',
                  fontSize: '20px',
                  fontWeight: '600',
                  textAlign: 'center',
                  color: '#1f2937',
                }}
              >
                No Loan Disbursements Found
              </Title>
              <p
                style={{
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '16px',
                  maxWidth: '420px',
                  lineHeight: '1.6',
                  margin: '0 0 32px 0',
                }}
              >
                {selectedBranch || selectedLine || selectedArea
                  ? `No customers found with loan disbursements in the selected ${[
                      selectedBranch && 'branch',
                      selectedLine && 'line',
                      selectedArea && 'area',
                    ]
                      .filter(Boolean)
                      .join(', ')}. Create a new loan disbursement to get started.`
                  : 'No loan disbursements found in the system. Start by creating your first loan disbursement or adjust your filters to view existing records.'}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={handleNewLoanWithFilters}
                  style={{
                    borderRadius: '8px',
                    height: '48px',
                    padding: '0 24px',
                    fontSize: '16px',
                    fontWeight: '500',
                    minWidth: '200px',
                    maxWidth: '280px',
                  }}
                >
                  New Loan Disbursement
                </Button>
              </div>
              {(selectedBranch || selectedLine || selectedArea) && (
                <div
                  style={{
                    marginTop: '24px',
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                  }}
                >
                  <Button
                    onClick={handleReset}
                    style={{
                      color: '#6b7280',
                      borderColor: '#d1d5db',
                      borderRadius: '6px',
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Collapse accordion>
              {filteredGroupedLoans.map((customerGroup, index) => (
                <Collapse.Panel
                  key={customerGroup.customerId}
                  header={
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        minHeight: '60px',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                        <div
                          style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={customerGroup.customerName}
                        >
                          {customerGroup.customerName}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Tooltip title="New Loan Disbursement">
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNewLoan(customerGroup);
                              }}
                              style={{
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
                              }}
                              size="large"
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <div style={{ padding: '16px' }}>
                    {/* Customer Details Section */}
                    <div
                      style={{
                        background: '#f8f9fa',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        border: '1px solid #e9ecef',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          marginBottom: '8px',
                          color: '#333',
                        }}
                      >
                        Customer Information
                      </div>
                      <Row gutter={[16, 8]}>
                        <Col xs={24} sm={12} md={6}>
                          <div style={{ fontSize: '12px', color: '#666' }}>Customer ID</div>
                          <div style={{ fontSize: '13px', fontWeight: '500' }}>
                            {customerGroup.customerId}
                          </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <div style={{ fontSize: '12px', color: '#666' }}>Branch</div>
                          <div style={{ fontSize: '13px', fontWeight: '500' }}>
                            {customerGroup.branch}
                          </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <div style={{ fontSize: '12px', color: '#666' }}>Line</div>
                          <div style={{ fontSize: '13px', fontWeight: '500' }}>
                            {customerGroup.line}
                          </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <div style={{ fontSize: '12px', color: '#666' }}>Total Amount</div>
                          <div style={{ fontSize: '13px', fontWeight: '500' }}>
                            ₹
                            {customerGroup.loans
                              .reduce(
                                (sum, loan) => sum + parseFloat(loan.loan_dsbrsmnt_amnt || 0),
                                0
                              )
                              .toLocaleString()}
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {/* Loans Section */}
                    <div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          marginBottom: '12px',
                          color: '#333',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span>Loan Details</span>
                        <span style={{ fontSize: '12px', color: '#666', fontWeight: '400' }}>
                          {customerGroup.loans.length} loan
                          {customerGroup.loans.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {customerGroup.loans.map((loan, index) => (
                          <div
                            key={loan.id}
                            style={{
                              padding: '12px',
                              border: '1px solid #e9ecef',
                              borderRadius: '6px',
                              marginBottom: '8px',
                              background: '#fff',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onClick={() => handleView(loan)}
                          >
                            <Row gutter={[8, 4]} align="middle">
                              <Col xs={16}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '4px',
                                  }}
                                >
                                  <span style={{ fontSize: '12px', color: '#666' }}>
                                    Loan #{index + 1}
                                  </span>
                                  <span style={{ fontSize: '12px', color: '#999' }}>•</span>
                                  <span style={{ fontSize: '12px', color: '#666' }}>
                                    {dayjs(loan.loan_dsbrsmnt_dt).format('DD/MM/YYYY')}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    marginBottom: '4px',
                                  }}
                                >
                                  ₹{parseFloat(loan.loan_dsbrsmnt_amnt || 0).toLocaleString()}
                                </div>
                                <div style={{ fontSize: '11px', color: '#999' }}>
                                  {loan.loan_dsbrsmnt_repmnt_type} •{' '}
                                  {loan.loan_dsbrsmnt_tot_instlmnt} installments
                                </div>
                              </Col>
                              <Col xs={8} style={{ textAlign: 'right' }}>
                                <Tag color={getStatusColor(loan.loan_dsbrsmnt_status)} size="small">
                                  {loan.loan_dsbrsmnt_status || 'Active'}
                                </Tag>
                                <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
                                  Click for details
                                </div>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Collapse.Panel>
              ))}
            </Collapse>
          )}
        </Tabs.TabPane>
      </Tabs>

      {/* View Modal */}
      <Modal
        title="Loan Disbursement Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setViewModalVisible(false);
              navigate(`/new-loan-disbursement/${selectedLoan?.id}`);
            }}
          >
            Edit
          </Button>,
        ]}
        width={800}
      >
        {selectedLoan && (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Title level={5}>Customer Information</Title>
              <p>
                <strong>Name:</strong> {selectedLoan.LOAN_DSBRSMNT_CUST_NM}
              </p>
              <p>
                <strong>Code:</strong> {selectedLoan.LOAN_DSBRSMNT_CUST_CD}
              </p>
              <p>
                <strong>Branch:</strong> {selectedLoan.LOAN_DSBRSMNT_BRNCH_NM}
              </p>
              <p>
                <strong>Line:</strong> {selectedLoan.LOAN_DSBRSMNT_LINE_NM}
              </p>
              <p>
                <strong>Area:</strong> {selectedLoan.LOAN_DSBRSMNT_AREA_NM}
              </p>
            </Col>
            <Col xs={24} md={12}>
              <Title level={5}>Loan Details</Title>
              <p>
                <strong>Amount:</strong> ₹
                {parseFloat(selectedLoan.loan_dsbrsmnt_amnt || 0).toLocaleString()}
              </p>
              <p>
                <strong>Interest:</strong> ₹
                {parseFloat(selectedLoan.loan_dsbrsmnt_intrst_amnt || 0).toLocaleString()}
              </p>
              <p>
                <strong>Processing Fee:</strong> ₹
                {parseFloat(selectedLoan.loan_dsbrsmnt_prcsng_fee_amnt || 0).toLocaleString()}
              </p>
              <p>
                <strong>Repayment Type:</strong> {selectedLoan.loan_dsbrsmnt_repmnt_type}
              </p>
              <p>
                <strong>Payment Mode:</strong> {selectedLoan.loan_dsbrsmnt_mode}
              </p>
            </Col>
            <Col xs={24} md={12}>
              <Title level={5}>Installment Details</Title>
              <p>
                <strong>Number of Installments:</strong> {selectedLoan.loan_dsbrsmnt_tot_instlmnt}
              </p>
              <p>
                <strong>Amount Per Installment:</strong> ₹
                {parseFloat(selectedLoan.loan_dsbrsmnt_instlmnt_amnt || 0).toLocaleString()}
              </p>
              <p>
                <strong>Default Pay Amount:</strong> ₹
                {parseFloat(selectedLoan.loan_dsbrsmnt_dflt_pay_amnt || 0).toLocaleString()}
              </p>
              <p>
                <strong>Bad Loan Days:</strong> {selectedLoan.loan_dsbrsmnt_bad_loan_days}
              </p>
            </Col>
            <Col xs={24} md={12}>
              <Title level={5}>Other Details</Title>
              <p>
                <strong>Date of Disbursement:</strong>{' '}
                {dayjs(selectedLoan.loan_dsbrsmnt_dt).format('DD/MM/YYYY')}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <Tag color={getStatusColor(selectedLoan.loan_dsbrsmnt_status)}>
                  {selectedLoan.loan_dsbrsmnt_status || 'Active'}
                </Tag>
              </p>
              {selectedLoan.loan_dsbrsmnt_comnt && (
                <p>
                  <strong>Comments:</strong> {selectedLoan.loan_dsbrsmnt_comnt}
                </p>
              )}
              <p>
                <strong>Created By:</strong> {selectedLoan.LOAN_DSBRSMNT_CREATED_BY_FULL_NM}
              </p>
              <p>
                <strong>Updated By:</strong> {selectedLoan.LOAN_DSBRSMNT_UPDTD_BY_FULL_NM}
              </p>
            </Col>
          </Row>
        )}
      </Modal>

      {/* Setup Modal */}
      <LoanDisbursementSetup
        visible={setupModalVisible}
        onClose={handleSetupClose}
        onSubmit={handleSetupSubmit}
        branchList={branchList}
        lineList={lineList}
        areaList={areaList}
        prefilledData={{
          branch: selectedBranch,
          line: selectedLine,
          area: selectedArea,
        }}
      />
    </div>
  );
};

export default DisburseLoanList;
