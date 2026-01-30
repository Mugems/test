import PropTypes from 'prop-types';
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Col, Dropdown, DropdownMenu, DropdownToggle, Row } from "reactstrap";

// Import the bell icon image
import bellIcon from "../../../assets/icons/notification.png"; // Update path as needed

const NotificationDropdown = props => {
  // Declare a new state variable, which we'll call "menu"
  const [menu, setMenu] = useState(false);

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="dropdown d-inline-block"
        tag="li"
      >
        <DropdownToggle
          className="btn header-item noti-icon position-relative"
          tag="button"
          id="page-header-notifications-dropdown"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px 12px'
          }}
        >
          <img 
            src={bellIcon} 
            alt="notifications" 
            style={{
              width: '24px',
              height: '24px',
             
            }}
          />
          {/* Badge removed as requested */}
        </DropdownToggle>

        <DropdownMenu className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0">
          <div className="p-3">
            <Row className="align-items-center">
              <Col>
                <h6 className="m-0"> Notifications </h6>
              </Col>
              <div className="col-auto">
                {/* <a href="#" className="small">
                  {" "}
                  View All
                </a> */}
              </div>
            </Row>
          </div>

          {/* Notification content commented out as in original */}
          
          <div className="p-2 border-top d-grid">
            <Link className="btn btn-sm btn-link font-size-14 text-center" to="#">
              <i className="mdi mdi-arrow-right-circle me-1"></i> 
              <span key="t-view-more">View More..</span>
            </Link>
          </div>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};



NotificationDropdown.propTypes = {
  t: PropTypes.any
};
export default NotificationDropdown;