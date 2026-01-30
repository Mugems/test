import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  CardBody,
  Label,
  CardHeader,
} from "reactstrap";
 import { Link } from "react-router-dom";
//css
import "../../assets/scss/_userprofile.scss"
import withRouter from "components/Common/withRouter";

//Import Breadcrumb
import Breadcrumb from "../../components/Common/Breadcrumb";

import avatar from "../../assets/images/users/avatar-1.jpg";
import { GET } from "../../helpers/api_helper";
import { USER_PROFILE_URL } from "../../helpers/url_helper";

function UserProfile(){

  //meta title
  document.title = "Profile | Micro-Finance";
  const [user, setUser] = useState({});  

  var error = false;

  // const { error, success } = useSelector(state => ({
  //   error: state.Profile.error,
  //   success: state.Profile.success,
  // }));


  // useEffect(() => {
  //   async function fetchData() {
  //     const response = await GET(USER_PROFILE_URL);
  //     console.log(response);
  //     if(response.status == 200){
  //       setUser(response.data);
  //     }
  //     else{
  //       console.log(response)
  //       error = response;
  //       // toast msg
  //     }
  //   }
  //   fetchData();
  // }, [USER_PROFILE_URL, error]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumb */}
          <Breadcrumb title="TMF" breadcrumbItem="Profile" />

          <Row>
            <Col lg="12">
              {error && error ? <Alert color="danger">{error}</Alert> : null}
            
              <div className="d-flex mb-3">
              <Link to="/edit-profile" className="ms-auto">
                <button type="button" className="btn btn-success "><span className="mdi mdi-pencil me-2"></span>Edit profile</button>
                </Link>
              </div>
              <Card>
                <CardBody>
                  <div className="d-flex">
                    <div className="ms-3">
                      <img
                        src={avatar}
                        alt=""
                        className="avatar-md rounded-circle img-thumbnail"
                      />
                    </div>
                    <div className="flex-grow-1 align-self-center">
                      <div className="ms-3">
                        {/* <h5>{name}</h5> */}
                        <h5 className="fw-bold">{user?.full_name}</h5>
                        <p className="mb-1">{user?.email}</p>
                        <p className="mb-0">{user?.profile?.mobile_number}</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          
          <div className="row">
            <div className="col-md-6">
              
                <Card className="usercard">
                  <CardHeader>
                    <h5>Personal Details</h5>
                  </CardHeader>
                  <CardBody>
                  <div className="form-group row align-items-center p-3">
                      <div className="col-md-6">
                          <Label className="form-label userview-label">Education Details</Label>
                      </div>
                      <div className="col-md-6">
                          <p className="userview-info">{user.profile?.educational_details ? user.profile?.educational_details : "----"}</p>
                      </div>
                  </div>
                  <div className="form-group row align-items-center p-3">
                      <div className="col-md-6">
                          <Label className="form-label userview-label">Barcounsil Name</Label>
                      </div>
                      <div className="col-md-6">
                          <p className="userview-info">{user.profile?.bar_council_name ? user.profile?.bar_council_name : "----"}</p>
                      </div>
                  </div>
                  <div className="form-group row align-items-center p-3">
                      <div className="col-md-6">
                          <Label className="form-label userview-label">Barcounsil Enrollment No</Label>
                      </div>
                      <div className="col-md-6">
                          <p className="userview-info">{user.profile?.enrollment_number ? user.profile?.enrollment_number : "----"}</p>
                      </div>
                  </div>
                  <div className="form-group row align-items-center p-3">
                      <div className="col-md-6">
                          <Label className="form-label userview-label">Firm Name</Label>
                      </div>
                      <div className="col-md-6">
                          <p className="userview-info">{user.profile?.firm_name ? user.profile?.firm_name : "----"}</p>
                      </div>
                  </div>
                  <div className="form-groups row align-items-center p-3" >
                        <div className="col-md-6">
                          <Label className="form-label userview-label">Website URL</Label>
                        </div>
                        <div className="col-md-6">
                          <p className="userview-info">{user.profile?.website_url ? user.profile?.website_url : "----"}</p>
                        </div>
                  </div>
                  </CardBody>
                </Card>
              
            </div>
            
            <div className="col-md-6">
              
                <Card className="usercard ">
                  <CardHeader>
                    <h5>Other Details</h5>
                  </CardHeader>
                  <CardBody>

                    <div className="form-group row align-items-center p-3">
                      <div className="col-md-6">
                        <Label className="form-label userview-label">Address</Label>
                      </div>
                      <div className="col-md-6">
                        <p className="userview-info">{user.profile?.address ? user.profile?.address : "----"}</p>
                      </div>
                    </div>

                    {/* <div className="form-groups row align-items-center p-3" >
                        <div className="col-md-6">
                          <Label className="form-label userview-label">Mobile Number</Label>
                        </div>
                        <div className="col-md-6">
                          <p className="userview-info">{user.profile?.mobile_number ? user.profile?.mobile_number : "----"}</p>
                        </div>
                  </div> */}
                  <div className="form-groups row align-items-center p-3" >
                        <div className="col-md-6">
                          <Label className="form-label userview-label">Additional Mobile Number</Label>
                        </div>
                        <div className="col-md-6">
                          <p className="userview-info">{user.profile?.secondary_mobile_number ? user.profile?.secondary_mobile_number : "----"}</p>
                        </div>
                  </div>
                  <div className="form-groups row align-items-center p-3" >
                        <div className="col-md-6">
                          <Label className="form-label userview-label">Phone Number</Label>
                        </div>
                        <div className="col-md-6">
                          <p className="userview-info">{user.profile?.phone_number ? user.profile?.phone_number : "----"}</p>
                        </div>
                  </div>
                  <div className="form-groups row align-items-center p-3" >
                        <div className="col-md-6">
                          <Label className="form-label userview-label">Additional Phone Number</Label>
                        </div>
                        <div className="col-md-6">
                          <p className="userview-info">{user.profile?.secondary_phone_number ? user.profile?.secondary_phone_number : "----"}</p>
                        </div>
                  </div>
                  <div className="form-groups row align-items-center p-3" >
                        <div className="col-md-6">
                          <Label className="form-label userview-label">Fax Number</Label>
                        </div>
                        <div className="col-md-6">
                          <p className="userview-info">{user.profile?.fax ? user.profile?.fax : "----"}</p>
                        </div>
                  </div>
                    

                  </CardBody>
                </Card>
              
            </div>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withRouter(UserProfile);
