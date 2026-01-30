import withRouter from "components/Common/withRouter";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../../components/Common/Breadcrumb";

//import formik validation
import { useFormik } from "formik";
import * as Yup from "yup";

//import css
import "../../assets/scss/_userprofile.scss"
import "../../assets/scss/_editprofile.scss"

import { Row, Col, CardBody, Card, Alert, Input, Label, Form, FormFeedback } from "reactstrap";

import { useNavigate } from "react-router-dom";
import { GET, PUT } from "../../helpers/api_helper";
import { USER_PROFILE_URL, USER_URL, PINCODE_LIST_URL, PINCODE_URL } from "../../helpers/url_helper";

function Editprofile(props){
    const [user, setData] = useState({});
    const [pincode, setPincode] = useState([]);
    const navigate = useNavigate();
    const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
    const mobileRegExp = /^(\d{10})?$/;
    const urlRegExp = /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/;
    
    useEffect(() => {
        fetchData();
        fetchPincodeList();
    }, [])

    async function fetchData() {
        const response = await GET(USER_PROFILE_URL);
        
        if(response.status == 200){
            setData(response.data);
            // error = false;
        }
        else{
            // toast msg
        }
    }

    async function fetchPincodeList() {
        const response = await GET(PINCODE_LIST_URL);
        if(response.status == 200){
            setPincode(response.data);
            // error = false;
        }
        else{
            // toast msg
        }
    }
    
    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,
    
        initialValues: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          mobile_number: user.profile?.mobile_number,
          firm_name: '',
          educational_details: '',
          enrollment_number: '',
          bar_council_name: '',
          firm_logo: '',
          flat_no: '',
          street: '',
          state: '',
          district: '',
          pincode: '',
          landmark: '',
          secondary_mobile_number: '',
          phone_number: '',
          secondary_phone_number: '',
          fax: '',
          website_url: '',         
        },
        validationSchema: Yup.object({
          email: Yup.string().email('Invalid email format').required("This field is required!"),
          first_name: Yup.string().required("This field is required!"),
          last_name: Yup.string().required("This field is required!"),
          mobile_number: Yup.string().required("This field is required!").matches(mobileRegExp, 'Invalid Mobile number!'),
          educational_details: Yup.string().required("This field is required!"),
          enrollment_number: Yup.string().required("This field is required!"),
          bar_council_name: Yup.string().required("This field is required!"),
          flat_no: Yup.string().required("This field is required!"),
          street: Yup.string().required("This field is required!"),
        //   pincode: Yup.string().required("This field is required!"),
        //   state: Yup.string().required("This field is required!"),
        //   district: Yup.string().required("This field is required!"),
          secondary_mobile_number: Yup.string().matches(mobileRegExp, 'Invalid Mobile number!'),
          phone_number: Yup.string().matches(phoneRegExp, 'Invalid Phone number!'),
          secondary_phone_number: Yup.string().matches(phoneRegExp, 'Invalid Phone number!'),
          fax: Yup.string().matches(phoneRegExp, 'Invalid Fax number!'),
          website_url: Yup.string().matches(urlRegExp, 'Invalid URL!'),
        }),
        onSubmit: async (values) => {
            let obj =  JSON.parse(localStorage.getItem('auth_user'))
            let url = `${USER_URL}${obj.code}/`
            var result = PUT(url, values);
        }
      });

      const handleCancle = () => {
        navigate('/profile');
      }
      
    return (
        <React.Fragment>
            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumb title="TMF" breadcrumbItem="Edit Profile" />
                    <div className="row">
                        <div className="col-md-12">
                            <Card className="usercard">
                                {/* <CardHeader>
                                    <h5>Edit Profile</h5>
                                </CardHeader> */}
                                <CardBody>
                                <Form
                                className="form-horizontal"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    validation.handleSubmit();
                                    
                                    return false;
                                }}
                                            >
                                {/* {error && error ? (
                                    <Alert color="danger">{error}</Alert>
                                ) : null} */}
                                    <div className="row">
                                        <div className="col-md-5">
                                            <div className="mb-3">
                                            <Label className="form-label">First Name<span className="text-danger">*</span></Label>
                                            <Input
                                                id="first_name"
                                                name="first_name"
                                                className="form-control"
                                                placeholder="Enter firstname"
                                                type="text"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.first_name}
                                                invalid={validation.touched.first_name && validation.errors.first_name ? true :false}
                                            />
                                            {validation.touched.first_name && validation.errors.first_name ?(
                                                <FormFeedback type="invalid">{validation.errors.first_name}
                                                </FormFeedback>
                                            ) : null}
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">Last Name<span className="text-danger">*</span></Label>
                                            <Input
                                                id="last_name"
                                                name="last_name"
                                                className="form-control"
                                                placeholder="Enter lastname"
                                                type="text"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.last_name}
                                                invalid={validation.touched.last_name && validation.errors.last_name ? true :false}
                                            />
                                            {validation.touched.last_name && validation.errors.last_name ?(
                                                <FormFeedback type="invalid">{validation.errors.last_name}
                                                </FormFeedback>
                                            ) : null}
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">Email<span className="text-danger">*</span></Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                className="form-control"
                                                placeholder="Enter email"
                                                type="email"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.email || ""}
                                                invalid={validation.touched.email && validation.errors.email ? true : false}
                                            />
                                            {validation.touched.email && validation.errors.email ? (
                                            <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
                                            ) : null}
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">Mobile Number<span className="text-danger">*</span></Label>
                                            <Input
                                                id="mobile_number"
                                                name="mobile_number"
                                                className="form-control"
                                                placeholder="Enter mobile number"
                                                type="text"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.mobile_number || ""}
                                                invalid={validation.touched.mobile_number && validation.errors.mobile_number ? true : false}
                                            />
                                            {validation.touched.mobile_number && validation.errors.mobile_number ? (
                                            <FormFeedback type="invalid">{validation.errors.mobile_number}</FormFeedback>
                                            ) : null}
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">Education<span className="text-danger">*</span></Label>
                                            <Input
                                                id="educational_details"
                                                name="educational_details"
                                                className="form-control"
                                                placeholder="Enter education details"
                                                type="text"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.educational_details || ""}
                                                invalid={validation.touched.educational_details && validation.errors.educational_details ? true : false}
                                            />
                                            {validation.touched.educational_details && validation.errors.educational_details ? (
                                            <FormFeedback type="invalid">{validation.errors.educational_details}</FormFeedback>
                                            ) : null}
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">BarCounsil Name<span className="text-danger">*</span></Label>
                                            <Input
                                                id="bar_council_name"
                                                name="bar_council_name"
                                                className="form-control"
                                                placeholder="Enter barcouncil name"
                                                type="text"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.bar_council_name || ""}
                                                invalid={validation.touched.bar_council_name && validation.errors.bar_council_name ? true : false}
                                            />
                                            {validation.touched.bar_council_name && validation.errors.bar_council_name ? (
                                            <FormFeedback type="invalid">{validation.errors.bar_council_name}</FormFeedback>
                                            ) : null}
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">BarCounsil Enrollment Number<span className="text-danger">*</span></Label>
                                            <Input
                                                id="enrollment_number"
                                                name="enrollment_number"
                                                className="form-control"
                                                placeholder="Enter enrollment number"
                                                type="text"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.enrollment_number || ""}
                                                invalid={validation.touched.enrollment_number && validation.errors.enrollment_number ? true : false}
                                            />
                                            {validation.touched.enrollment_number && validation.errors.enrollment_number ? (
                                            <FormFeedback type="invalid">{validation.errors.enrollment_number}</FormFeedback>
                                            ) : null}
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">Firm Name</Label>
                                            <Input
                                                id="firm_name"
                                                name="firm_name"
                                                className="form-control"
                                                placeholder="Enter firm name"
                                                type="text"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.firm_name || ""}
                                            />
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">Firm Logo</Label>
                                            <Input
                                                id="firm_logo"
                                                name="firm_logo"
                                                className="form-control"
                                                placeholder="Enter firm logo"
                                                type="file"
                                               
                                                onBlur={validation.handleBlur}
                                                value={validation.values.firm_logo || ""}
                                                
                                                />
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">Website Url</Label>
                                            <Input
                                                id="website_url"
                                                name="website_url"
                                                className="form-control"
                                                placeholder="Enter website url"
                                                type="textarea"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.website_url || ""}
                                                invalid={validation.touched.website_url && validation.errors.website_url ? true : false}
                                            />
                                            {validation.errors.website_url ? (
                                            <FormFeedback type="invalid">{validation.errors.website_url}</FormFeedback>
                                            ) : null}
                                            </div>
                                            
                                        </div>
                                        <div className="col-md-2">

                                        </div>
                                        <div className="col-md-5">
                                            <div className="mb-3">
                                            <Label className="form-label">Flat No<span className="text-danger">*</span></Label>
                                            <Input
                                                id="flat_no"
                                                name="flat_no"
                                                className="form-control"
                                                placeholder="Enter flat number"
                                                type="text"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.flat_no || ""}
                                                invalid={validation.touched.flat_no && validation.errors.flat_no ? true : false}
                                            />
                                            {validation.touched.flat_no && validation.errors.flat_no ? (
                                            <FormFeedback type="invalid">{validation.errors.flat_no}</FormFeedback>
                                            ) : null}
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">Street Address<span className="text-danger">*</span></Label>
                                            <Input
                                                id="street"
                                                name="street"
                                                className="form-control"
                                                placeholder="Enter address"
                                                type="textarea"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.street || ""}
                                                invalid={validation.touched.street && validation.errors.street ? true : false}
                                            />
                                            {validation.touched.street && validation.errors.street ? (
                                            <FormFeedback type="invalid">{validation.errors.street}</FormFeedback>
                                            ) : null}
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">Landmark</Label>
                                            <Input
                                                id="landmark"
                                                name="landmark"
                                                className="form-control"
                                                placeholder="Enter address"
                                                type="text"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.landmark || ""}
                                            />
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">Pincode<span className="text-danger">*</span></Label>
                                            <Input
                                                id="pincode"
                                                name="pincode"
                                                className="form-control"
                                                placeholder="Select pincode"
                                                type="select"
                                                onChange={validation.handleChange}
                                                options={pincode}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.pincode || ""}
                                                invalid={validation.touched.pincode && validation.errors.pincode ? true : false}
                                            />
                                            {validation.touched.pincode && validation.errors.pincode ? (
                                            <FormFeedback type="invalid">{validation.errors.pincode}</FormFeedback>
                                            ) : null}
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">State<span className="text-danger">*</span></Label>
                                            <Input
                                                id="state"
                                                name="state"
                                                className="form-control"
                                                placeholder="Enter state"
                                                type="text"
                                                readOnly
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.state || ""}
                                                invalid={validation.touched.state && validation.errors.state ? true : false}
                                            />
                                            {validation.touched.state && validation.errors.state ? (
                                            <FormFeedback type="invalid">{validation.errors.state}</FormFeedback>
                                            ) : null}
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">District<span className="text-danger">*</span></Label>
                                            <Input
                                                id="district"
                                                name="district"
                                                className="form-control"
                                                placeholder="Enter district"
                                                type="text"
                                                readOnly
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.district || ""}
                                                invalid={validation.touched.district && validation.errors.district ? true : false}
                                            />
                                            {validation.touched.district && validation.errors.district ? (
                                            <FormFeedback type="invalid">{validation.errors.district}</FormFeedback>
                                            ) : null}
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">Additional Mobile Number</Label>
                                            <Input
                                                id="secondary_mobile_number"
                                                name="secondary_mobile_number"
                                                className="form-control"
                                                placeholder="Enter mobile number"
                                                type="text"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.secondary_mobile_number || ""}
                                                invalid={validation.errors.secondary_mobile_number ? true : false}
                                            />
                                            {validation.errors.secondary_mobile_number ? (
                                            <FormFeedback type="invalid">{validation.errors.secondary_mobile_number}</FormFeedback>
                                            ) : null}
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">Phone Number</Label>
                                            <Input
                                                id="phone_number"
                                                name="phone_number"
                                                className="form-control"
                                                placeholder="Enter phone number"
                                                type="text"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.phone_number || ""}
                                                invalid={validation.errors.phone_number ? true : false}
                                            />
                                            {validation.errors.phone_number ? (
                                            <FormFeedback type="invalid">{validation.errors.phone_number}</FormFeedback>
                                            ) : null}
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">Additional Phone Number</Label>
                                            <Input
                                                id="secondary_phone_number"
                                                name="secondary_phone_number"
                                                className="form-control"
                                                placeholder="Enter phone number"
                                                type="text"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.secondary_phone_number || ""}
                                                invalid={validation.errors.secondary_phone_number ? true : false}
                                            />
                                            {validation.errors.secondary_phone_number ? (
                                            <FormFeedback type="invalid">{validation.errors.secondary_phone_number}</FormFeedback>
                                            ) : null}
                                            </div>
                                            <div className="mb-3">
                                            <Label className="form-label">Fax Number</Label>
                                            <Input
                                                id="fax"
                                                name="fax"
                                                className="form-control"
                                                placeholder="Enter fax number"
                                                type="text"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.fax || ""}
                                                invalid={validation.errors.fax ? true : false}
                                            />
                                            {validation.errors.fax ? (
                                            <FormFeedback type="invalid">{validation.errors.fax}</FormFeedback>
                                            ) : null}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-center">
                                    <button type="button" className="btn btn-secondary me-2" onClick={handleCancle}>Cancel</button>
                                        <button className="btn btn-primary btn-block " type="submit">
                                        Save Changes
                                        </button>
                                    </div>
                                    </Form>
                                </CardBody>
                                {/* <CardFooter className="text-end">
                                    <button type="submit" className="btn btn-primary">Save Changes</button>

                                </CardFooter> */}
                            </Card>
                        </div>

                    </div>
                    {/* <div className="row">
                        <div className="col-md-12">
                            <Card className="usercard">
                                <CardHeader>
                                    <h5>Edit Profile</h5>
                                </CardHeader>
                                <CardBody>
                                    <div className="row mb-3">
                                        <div className="col-md-6 edit-profile-card">
                                            <div className="mb-3">
                                                <label className="form-label">First Name<span className="text-danger">*</span></label>
                                                <Input
                                                    id="firstname"
                                                    name="firstname"
                                                    className="form-control"
                                                    placeholder="Enter Firstname"
                                                    type="text"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Last Name</label>
                                                <Input
                                                    id="lastname"
                                                    name="lastname"
                                                    className="form-control"
                                                    placeholder="Enter Lastname"
                                                    type="text"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Email<span className="text-danger">*</span></label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    className="form-control"
                                                    placeholder="Enter Email"
                                                    type="email"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Mobile No<span className="text-danger">*</span></label>
                                                <Input
                                                    id="mobile"
                                                    name="mobile"
                                                    className="form-control"
                                                    placeholder="Enter MobileNo"
                                                    type="number"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6 edit-profile-card">
                                            <div className="mb-3">
                                                <label className="form-label">Additional Mobile No<span className="text-danger">*</span></label>
                                                <Input
                                                    id="additional-mobile"
                                                    name="additional-mobile"
                                                    className="form-control"
                                                    placeholder="Enter Additional MobileNo"
                                                    type="number"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Phone No<span className="text-danger">*</span></label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    className="form-control"
                                                    placeholder="Enter phoneNo"
                                                    type="number"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Addtional Phone No<span className="text-danger">*</span></label>
                                                <Input
                                                    id="additional-phone"
                                                    name="additional-phone"
                                                    className="form-control"
                                                    placeholder="Enter Additional PhoneNo"
                                                    type="number"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Mobile No<span className="text-danger">*</span></label>
                                                <Input
                                                    id="mobile"
                                                    name="mobile"
                                                    className="form-control"
                                                    placeholder="Enter MobileNo"
                                                    type="number"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 edit-profile-card">
                                            <div className="mb-3">
                                                <label className="form-label">BarCounsil Name<span className="text-danger">*</span></label>
                                                <Input
                                                    id="barcounsilename"
                                                    name="barcounsilename"
                                                    className="form-control"
                                                    placeholder="Enter Barcounsil Name"
                                                    type="text"
                                                />
                                            </div>
                                            <div className="mb-3 ms-2">
                                                <label className="form-label">BarCounsil Enrollment No<span className="text-danger">*</span></label>
                                                <Input
                                                    id="BarCounsilEnrollmentNo"
                                                    name="BarCounsilEnrollmentNo"
                                                    className="form-control"
                                                    placeholder="Enter Barcounsil Enrollment No"
                                                    type="text"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Firm Name<span className="text-danger">*</span></label>
                                                <Input
                                                    id="Firm Name"
                                                    name="Firmname"
                                                    className="form-control"
                                                    placeholder="Enter Firm"
                                                    type="text"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Firm Logo<span className="text-danger">*</span></label>
                                                <Input
                                                    id="Firm Name"
                                                    name="Firmname"
                                                    className="form-control"
                                                    placeholder="Enter Firm"
                                                    type="file"
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6 edit-profile-card">

                                            <div className="mb-3">
                                                <label className="form-label">Address<span className="text-danger">*</span></label>
                                                <textarea class="form-control" placeholder="Leave a comment here" id="floatingTextarea2" style={{ height: '34px' }}>
                                                </textarea>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Street Name<span className="text-danger">*</span></label>
                                                <Input
                                                    id="street Name"
                                                    name="streetname"
                                                    className="form-control"
                                                    placeholder="Enter Street Name"
                                                    type="text"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">City<span className="text-danger">*</span></label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    className="form-control"
                                                    placeholder="Enter City Name"
                                                    type="text"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">District<span className="text-danger">*</span></label>
                                                <Input
                                                    id="district"
                                                    name="districtname"
                                                    className="form-control"
                                                    placeholder="Enter District Name"
                                                    type="text"
                                                />
                                            </div>

                                        </div>
                                    </div>
                                
                                    
                                </CardBody>
                                <CardFooter className="text-center">
                                    <button type="button" class="btn btn-primary">save Changes</button>
                                </CardFooter>
                            </Card>
                        </div>

                    </div> */}
                </div>

            </div>

        </React.Fragment>
    )

};
export default withRouter(Editprofile);