import { useState, useEffect,useCallback } from "react";
import { Button, Form, Input,  notification, Typography, Row, Col } from "antd";
import { GET, UPLOAD } from "../../helpers/api_helper";
import { SETTINGS } from "../../helpers/url_helper";
import TextArea from "antd/es/input/TextArea";
import Loader from "components/Common/Loader";

const OrgSettings = () => {
    const [loader, setLoader] = useState(false);
    const { Title } = Typography;

    const [form] = Form.useForm();
    useEffect(() => {
        getOrgSettings();
    }, [getOrgSettings]);
  const getOrgSettings = useCallback(async () => {
        try {
            const response = await GET(SETTINGS);
            if (response?.status === 200) {
                form.setFieldsValue(response?.data);
               

            }
            else {
                
            }

        } catch (error) {
            
        }
    },[form]);

    const onFinish = async (values) => {
        setLoader(true);
        try {
            const response = await UPLOAD(SETTINGS, values); // Replace with actual API function
            if (response?.status === 200) {
                notification.success({ message: "Settings updated successfully!" });
            } else {
                notification.error({ message: "Failed to update settings", description: response?.message || "Unknown error" });
            }
        } catch (error) {
            notification.error({ message: "Error", description: error.message });
        } finally {
            setLoader(false);
        }
    };
    return (
       
        <>
         {loader && <Loader/>}
            <div className="page-content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box d-flex align-items-center justify-content-between">
                                <h4 className="mb-0 font-size-18">Organization Settings</h4>
                            </div>
                           
                                <Form onFinish={onFinish} form={form} layout="vertical" name="orgSettingsForm" style={{ backgroundColor: "#fff", padding: 16, borderRadius: 8 }}>
                                    <div className="card p-4 shadow-sm">
                                        <Title level={4} className="text-center mb-2">Firm Details</Title>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <Form.Item label="FirmName" name="firmName" rules={[
                                                    {
                                                        required: true,
                                                        message: "This field is required!",
                                                    },
                                                ]}>
                                                    <Input placeholder="Firm Name" />
                                                </Form.Item>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Item label="FirmName" name="firmAddress" rules={[
                                                    {
                                                        required: true,
                                                        message: "This field is required!",
                                                    },
                                                ]}>
                                                    <TextArea placeholder="Firm Address" />
                                                </Form.Item>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Item label="Door No" name="doorNumber" >
                                                    <Input placeholder="Enter DoorNumber" />
                                                </Form.Item>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Item label="Street Name" name="streetName"
                                                >
                                                    <Input placeholder="Enter your Street Name" />
                                                </Form.Item>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Item label="Landmark" name="landmark" >
                                                    <Input placeholder="Enter your landmark" />
                                                </Form.Item>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Item label="Place" name="place" rules={[
                                                    {
                                                        required: true,
                                                        message: "This field is required!",
                                                    }
                                                ]}
                                                >
                                                    <Input placeholder="Enter your place" />
                                                </Form.Item>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Item label="Pincode" name="pincode" >
                                                    <Input placeholder="Enter pincode" />
                                                </Form.Item>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Item label="District" name="district" rules={[
                                                    {
                                                        required: true,
                                                        message: "This field is required!",
                                                    }
                                                ]}
                                                >
                                                    <Input placeholder="Enter your  district" />
                                                </Form.Item>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Item label="State" name="state" rules={[
                                                    {
                                                        required: true,
                                                        message: "This field is required!",
                                                    }
                                                ]} >
                                                    <Input placeholder="Enter your  state" />
                                                </Form.Item>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Item label="Geo Location" name="geoLocation"
                                                >
                                                    <Input placeholder="Enter your geoLocation" />
                                                </Form.Item>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Item label="Landline Number" name="landlineNumber" >
                                                    <Input placeholder="Enter landlineNumber" />
                                                </Form.Item>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Item label="fax Number" name="faxNumber"
                                                >
                                                    <Input placeholder="Enter the Fax Number" />
                                                </Form.Item>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Item label="Firm Email" name="firmEmail" >
                                                    <Input placeholder="Enter FirmEmail" />
                                                </Form.Item>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Item label="Webiste" name="webSite"
                                                >
                                                    <Input placeholder="Enter the webSite link" />
                                                </Form.Item>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Item label="Firm Established Date" name="firmEstablishedDate" rules={[
                                                    {
                                                        required: true,
                                                        message: "This field is required!",
                                                    }
                                                ]}
                                                >
                                                    <Input placeholder="Enter the Firm Established Date" type="date"/>
                                                </Form.Item>
                                            </div>

                                        </div>


                                    </div>
                                    <div className="card p-4 shadow-sm mt-4">
                                        <Title level={4} className="text-center mb-2">Proprietors Info
                                        </Title>
                                        <div className="row">
                                            <Form.List name="proprietorMembers">
                                                {(fields, { add, remove }) => (
                                                    <>
                                                        {fields.map(({ key, name, fieldKey, ...restField }) => (
                                                            <Row key={key} gutter={16}>
                                                                <Col span={12}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        label="Member Name"
                                                                        name={[name, "member_name"]}
                                                                        rules={[{ required: true, message: "Please enter member name!" }]}
                                                                    >
                                                                        <Input placeholder="Member Name" />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={12}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        label="Mobile Number"
                                                                        name={[name, "member_mobile_number"]}
                                                                        rules={[{ required: true, message: "Please enter mobile number!" }]}
                                                                    >
                                                                        <Input placeholder="Mobile Number" />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Row className="ms-auto">
                                                                    <Col span={24}>
                                                                        <Button color="danger" className="mb-1" variant="outlined" onClick={() => remove(name)}>
                                                                            Remove
                                                                        </Button>
                                                                    </Col>
                                                                </Row>
                                                            </Row>


                                                        ))}
                                                        <Form.Item >
                                                            <Col span={2} className="ms-auto">
                                                                <Button type="primary" onClick={() => add()}>
                                                                    Add  Member
                                                                </Button>


                                                            </Col>
                                                        </Form.Item>
                                                    </>
                                                )}
                                            </Form.List>
                                        </div>
                                    </div>
                                    <div className="card p-4 shadow-sm mt-4">
                                        <Title level={4} className="text-center mb-2">General Info</Title>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <Form.Item label="Date Of joining" name="doj" rules={[
                                                    {
                                                        required: true,
                                                        message: "This field is required!",
                                                    }
                                                ]}>
                                                    <Input placeholder="Enter the Date of joining" type="date" />

                                                </Form.Item>
                                            </div>

                                        </div>
                                        <Form.Item className="text-center mt-4">
                                            <Button type="primary" htmlType="submit" loading={loader}>
                                                Update
                                            </Button>
                                        </Form.Item>
                                    </div>
                                </Form>
                           
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default OrgSettings;