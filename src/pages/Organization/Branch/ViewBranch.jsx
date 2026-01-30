import { useEffect, useState, useCallback } from "react";
import { Form, Button, Input, Row, Col, Card, Typography, Divider, Space } from "antd";
import {
  HomeOutlined,
  EnvironmentOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileTextOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import { GET_BRANCHES } from "helpers/api_helper";
import { ADD_BRANCH } from "helpers/url_helper";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "components/Common/Loader";
const { Text, Link } = Typography;

const ViewBranch = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState({});
  const [form] = Form.useForm();
  const handleNavigate = () => {
    navigate(`/branch/edit/${params.id}`)
  }
  const renderCertificate = (certificates = []) =>
    certificates.map((cert, index) => (
      <Card
        key={index}
        style={{
          marginBottom: 16,
          borderRadius: 8,
          transition: "box-shadow 0.3s",
          cursor: "pointer",
        }}
        hoverable
        onClick={() => window.open(cert.signed_url, "_blank")}
      >
        <Space direction="vertical" size="small">
          <Space>
            {cert?.file_name && cert?.file_name.split(".").pop() === "pdf" ? (
              <FilePdfOutlined style={{ fontSize: 18, color: "#1890ff" }} />
            ) : cert.signed_url &&
              cert.signed_url.split(".").pop() === "csv" ? (
              <FileTextOutlined style={{ fontSize: 18, color: "#1890ff" }} />
            ) : (
              <FileImageOutlined style={{ fontSize: 18, color: "#1890ff" }} />
            )}
            <Text
              style={{
                backgroundColor: "#fafafa",
                color: "rgba(0,0,0,0.88)",
                fontSize: "14px",
              }}
            >
              {cert.additional_certifi_description ||
                data?.agreement_description}
            </Text>
          </Space>
          <Link
            onClick={() => window.open(cert.signed_url, "_blank")}
            target="_blank"
            className="fs-6 text-secondary"
            style={{
              backgroundColor: "#fafafa",
              color: "rgba(0,0,0,0.88)",
              fontSize: "14px",
            }}
          >
            {cert.file_name}
          </Link>
        </Space>
      </Card>
    ));

 const getbranchList = useCallback(async () => {
    try {
      setLoader(true);
      const response = await GET_BRANCHES(`${ADD_BRANCH}${params.id}`);
      if (response.status === 200) {
        setData(response?.data);
        form.setFieldsValue(response?.data);
        setLoader(false);
      } else {
        setLoader(false);
      }
    } catch (error) {
      console.error(error);
      setLoader(false);
    }
  },[params.id, form]);

  useEffect(() => {
    if (params.id) {
      getbranchList();
    }
  }, [params.id,getbranchList]);

  return (
    <>
      {loader && <Loader />}
      <div className="page-content">
        <div className="cursor-pointer back-icon">
          <span onClick={() => navigate("/branch/list")}>
            <ArrowLeftOutlined /> Back
          </span>
        </div>
        <div className="container-fluid mt-3">
        <h5 className="mb-3">Branch Info</h5>

          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
            }}
          >
            <Form
              layout="vertical"
              name="branchDetailsForm"
              form={form}
              initialValues={data}
            >
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <span style={{ fontWeight: "600", fontSize: "14px" }}>
                        Branch Name
                      </span>
                    }
                    name="branch_name"
                  >
                    <Input
                      placeholder="Branch Name"
                      disabled
                      prefix={<HomeOutlined style={{ color: "#1890ff" }} />}
                      style={{
                        backgroundColor: "#fafafa",
                        color: "rgba(0,0,0,0.88)",
                        fontSize: "14px",
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <span style={{ fontWeight: "600", fontSize: "14px" }}>
                        Branch Address
                      </span>
                    }
                    name="branch_address"
                  >
                    <Input
                      placeholder="Branch Address"
                      disabled
                      prefix={
                        <EnvironmentOutlined style={{ color: "#1890ff" }} />
                      }
                      style={{
                        backgroundColor: "#fafafa",
                        color: "rgba(0,0,0,0.88)",
                        fontSize: "14px",
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Divider />
             
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                <Text  style={{ fontWeight: "600", fontSize: "14px" }}>
                        Agreement Certificates
                      </Text>
                  <Card
                    
                    bordered={false}
                    style={{
                      borderRadius: 8,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {renderCertificate(data?.agreement_certificate)}
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                <Text  style={{ fontWeight: "600", fontSize: "14px" }}>
                        Additional Certificates
                      </Text>
                  <Card
                   
                    bordered={false}
                    style={{
                      borderRadius: 8,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {renderCertificate(data?.additional_details)}
                  </Card>
                </Col>
              </Row>
            </Form>
            <div className="mt-3 text-center">

              <Button type="primary" onClick={handleNavigate} >Edit branch</Button>

            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ViewBranch;
