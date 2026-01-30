import React from 'react';
import { Modal, Form, Select, Button, Alert, Row, Col, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const LoanDisbursementSetup = ({
  visible,
  onClose,
  onSubmit,
  branchList = [],
  lineList = [],
  areaList = [],
  prefilledData = {},
  title = 'Loan Disbursement Setup',
  submitButtonText = 'Continue to Loan Form',
}) => {
  const [form] = Form.useForm();
  const [selectedBranch, setSelectedBranch] = React.useState(null);
  const [selectedLine, setSelectedLine] = React.useState(null);

  React.useEffect(() => {
    if (visible) {
      if (prefilledData && Object.keys(prefilledData).length > 0) {
        const prefilledValues = {};

        if (prefilledData.branch && branchList.length > 0) {
          const matchingBranch = branchList.find((b) => b.branch_name === prefilledData.branch);
          if (matchingBranch) {
            prefilledValues.loan_dsbrsmnt_brnch_id = matchingBranch.id;
          }
        }

        if (prefilledData.line && lineList.length > 0) {
          const matchingLine = lineList.find(
            (l) => (l.lineName || l.line_name) === prefilledData.line
          );
          if (matchingLine) {
            prefilledValues.loan_dsbrsmnt_line_id = matchingLine.id;
          }
        }

        if (prefilledData.area && areaList.length > 0) {
          const matchingArea = areaList.find((a) => a.areaName === prefilledData.area);
          if (matchingArea) {
            prefilledValues.loan_dsbrsmnt_area_id = [matchingArea.id];
          }
        }

        if (Object.keys(prefilledValues).length > 0) {
          form.setFieldsValue(prefilledValues);
          setSelectedBranch(prefilledValues.loan_dsbrsmnt_brnch_id || null);
          setSelectedLine(prefilledValues.loan_dsbrsmnt_line_id || null);
        }
      } else {
        form.resetFields();
        setSelectedBranch(null);
        setSelectedLine(null);
      }
    }
  }, [visible, prefilledData, branchList, lineList, areaList, form]);

  React.useEffect(() => {
    if (selectedBranch) {
      const availableLines = lineList.filter((line) => {
        const lineBranchId = line?.branch;
        return lineBranchId === selectedBranch;
      });

      const currentLineId = form.getFieldValue('loan_dsbrsmnt_line_id');
      if (
        availableLines.length === 0 ||
        (currentLineId && !availableLines.find((l) => l.id === currentLineId))
      ) {
        form.setFieldsValue({
          loan_dsbrsmnt_line_id: undefined,
          loan_dsbrsmnt_area_id: undefined,
        });
        setSelectedLine(null);
      }
    }
  }, [selectedBranch, lineList, form]);

  React.useEffect(() => {
    if (selectedLine) {
      const availableAreas = areaList.filter((area) => {
        const areaLineId = area?.line_id || area?.line;
        return areaLineId === selectedLine;
      });

      const currentAreaIds = form.getFieldValue('loan_dsbrsmnt_area_id');
      if (
        availableAreas.length === 0 ||
        (currentAreaIds && currentAreaIds.some((id) => !availableAreas.find((a) => a.id === id)))
      ) {
        form.setFieldsValue({ loan_dsbrsmnt_area_id: undefined });
      }
    }
  }, [selectedLine, areaList, form]);

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  const handleValuesChange = (changedValues, allValues) => {
    if (changedValues.loan_dsbrsmnt_brnch_id !== undefined) {
      setSelectedBranch(changedValues.loan_dsbrsmnt_brnch_id);
      setSelectedLine(null);

      setTimeout(() => {
        form.setFieldsValue({
          loan_dsbrsmnt_line_id: undefined,
          loan_dsbrsmnt_area_id: undefined,
        });
      }, 0);
    }

    if (changedValues.loan_dsbrsmnt_line_id !== undefined) {
      setSelectedLine(changedValues.loan_dsbrsmnt_line_id);

      setTimeout(() => {
        form.setFieldsValue({
          loan_dsbrsmnt_area_id: undefined,
        });
      }, 0);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: '600px' }}
      centered
      closable={true}
      maskClosable={false}
    >
      <Alert
        message="Please select the basic information to proceed with loan disbursement"
        description="You need to select Branch, Line, and Area(s) before proceeding with the loan disbursement form."
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="loan_dsbrsmnt_brnch_id"
              label="Branch Name"
              rules={[{ required: true, message: 'Please select a branch' }]}
            >
              <Select placeholder="Select Branch" allowClear showSearch optionFilterProp="children">
                {branchList?.map((branch) => (
                  <Select.Option key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </Select.Option>
                )) || []}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="loan_dsbrsmnt_line_id"
              label="Line Name"
              rules={[{ required: true, message: 'Please select a line' }]}
            >
              <Select
                key={`line-${selectedBranch}`}
                placeholder="Select Line"
                allowClear
                showSearch
                optionFilterProp="children"
                disabled={!selectedBranch}
              >
                {lineList?.map((line) => {
                  const lineBranchId = line?.branch;
                  if (selectedBranch === lineBranchId) {
                    return (
                      <Select.Option key={line.id} value={line.id}>
                        {line.line_name || line.lineName}
                      </Select.Option>
                    );
                  }
                  return null;
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="loan_dsbrsmnt_area_id"
          label="Area Name (Multi-Select)"
          rules={[
            {
              required: true,
              message: 'Please select at least one area',
            },
          ]}
        >
          <Select
            key={`area-${selectedLine}`}
            mode="multiple"
            placeholder="Select Areas"
            allowClear
            showSearch
            optionFilterProp="children"
            disabled={!selectedLine}
          >
            {areaList?.map((area) => {
              const areaLineId = area?.line_id || area?.line;
              if (selectedLine === areaLineId) {
                return (
                  <Select.Option key={area.id} value={area.id}>
                    {area.areaName}
                  </Select.Option>
                );
              }
              return null;
            })}
          </Select>
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button onClick={onClose} style={{ minWidth: '120px' }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" style={{ minWidth: '120px' }}>
            {submitButtonText}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default LoanDisbursementSetup;
