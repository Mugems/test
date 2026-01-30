import React from "react";
import {
  Container
} from "reactstrap";
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const Dashboard = props => {

  //meta title
  document.title = "Home | TMF";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumb */}
          <Breadcrumbs
            title="Home"
            breadcrumbItem="Home"
          />
          </Container>
          </div>
    </React.Fragment>
  );
};


export default Dashboard;
