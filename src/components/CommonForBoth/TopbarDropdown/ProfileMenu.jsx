import PropTypes from 'prop-types';
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

import { Link, useNavigate } from "react-router-dom";
// Import the user profile icon
import userProfileIcon from "../../../assets/icons/user (3).png"; // Update path as needed
import Avatar from "../../Common/Avatar";
import BranchNameModal from "../../Common/BranchNameModal";
import ChangePasswordModal from "../../Common/ChangePasswordModal";

import "./ProfileMenu.css";

function ProfileMenu(props) {
  // Declare a new state variable, which we'll call "menu"
  const [menu, setMenu] = useState(false);
  const [user, setUser] = useState({});
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [userRole, setUserRole] = useState("");
  const [fontSize, setFontSize] = useState('m');
  

  const navigate = useNavigate();


  const lockscreen = () => {
    localStorage.setItem('previousURL', window.location.pathname);
    navigate('/lock-screen');
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    navigate('/login');
  };

  const handleChangeBranch = () => {
    setMenu(false);
    setBranchModalVisible(true);
  };

  const handleChangePassword = () => {
    setMenu(false);
    setPasswordModalVisible(true);
  };

  const handleBranchSave = (branchName, branchId) => {
    localStorage.setItem("selected_branch_name", branchName);
    if (branchId) {
      localStorage.setItem("selected_branch_id", branchId);
    }
    setSelectedBranch(branchName);
    setBranchModalVisible(false);
    window.location.reload();
  };

  const handleBranchCancel = () => {
    setBranchModalVisible(false);
  };

  const handlePasswordSave = () => {
    setPasswordModalVisible(false);
  };

  const handlePasswordCancel = () => {
    setPasswordModalVisible(false);
  };
 const handleFontSizeChange = (size) => {
  setFontSize(size);
  localStorage.setItem('font_size', size);
  setMenu(false);
  
  // Apply to both body and layout
  const className = size === 'l' ? 'font-size-large' : 
                    size === 'xl' ? 'font-size-xlarge' : '';
  
  // Remove all font size classes first
  document.body.classList.remove('font-size-large', 'font-size-xlarge');
  
  const layoutElement = document.querySelector('.ant-layout');
  if (layoutElement) {
    layoutElement.classList.remove('font-size-large', 'font-size-xlarge');
    
    // Add new class
    if (className) {
      document.body.classList.add(className);
      layoutElement.classList.add(className);
    }
  }
};
  useEffect(() => {
    if (localStorage.getItem("authUser")) {
      const obj = JSON.parse(localStorage.getItem("authUser"));
      setUser(obj);
    }

    const storedBranch = localStorage.getItem("selected_branch_name");
    if (storedBranch) {
      setSelectedBranch(storedBranch);
    }
    const role = localStorage.getItem("user_role");
    if (role) {
      setUserRole(role);
    }
     const savedFontSize = localStorage.getItem('font_size');
    if (savedFontSize) {
      setFontSize(savedFontSize);
      
      // Apply the saved font size class on component mount
      const layoutElement = document.querySelector('.ant-layout');
      if (layoutElement) {
        if (savedFontSize === 'l') {
          layoutElement.classList.add('font-size-large');
        } else if (savedFontSize === 'xl') {
          layoutElement.classList.add('font-size-xlarge');
        }
      }
    }

  }, [props.success]);

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="d-inline-block"
      >
        <DropdownToggle
          className="btn header-item"
          id="page-header-user-dropdown"
          tag="button"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px 12px'
          }}
        >
          <img
            className="header-profile-user"
            src={userProfileIcon}
            alt="User Profile"
           
          />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <div className="d-flex align-items-center p-2">
            <Avatar
              name={user.username || user.name || 'User'}
              size={32}
              style={{ marginRight: '8px' }}
            />
            <div className="d-inline-block text-start" style={{ lineHeight: '1.2' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {user.username}
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '1px' }}>
                {user.orgName ? user.orgName : "TMF"} • {user.employees?.length > 0 ? user.employees[0].branch_name : 'Main Branch'}
              </div>
            </div>
          </div>
         
          <Link to='/view' className="dropdown-item">
            <i className="bx bx-wrench font-size-16 align-middle me-1" />
            Org Settings
          </Link>
          <DropdownItem onClick={handleChangeBranch}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <i className="bx bx-git-branch font-size-16 align-middle me-1" style={{ marginTop: '2px' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div>Change Branch</div>
                {selectedBranch && (
                  <div style={{
                    fontSize: '11px',
                    color: '#1677ff',
                    fontWeight: '500',
                    marginTop: '2px'
                  }}>
                    {selectedBranch}
                  </div>
                )}
              </div>
            </div>
          </DropdownItem>
          {userRole.toLowerCase() === 'owner' && (
            <DropdownItem onClick={handleChangePassword}>
              <i className="bx bx-key font-size-16 align-middle me-1" />
              Change Password
            </DropdownItem>
          )}
          <DropdownItem tag="a" onClick={lockscreen}>
            <i className="bx bx-lock-open font-size-16 align-middle me-1" />
            Lock screen
          </DropdownItem>
          <div className="screen-size-selector">
            <span className="screen-size-label">
              Screen Size
            </span>
            <div className="screen-size-buttons">
              {['m', 'l', 'xl'].map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={`size-button ${fontSize === size ? 'active' : ''}`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <DropdownItem onClick={logout} className="dropdown-item">
            <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
            <span>Logout</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* Branch Name Modal */}
      <BranchNameModal
        visible={branchModalVisible}
        onSave={handleBranchSave}
        onCancel={handleBranchCancel}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={passwordModalVisible}
        onSave={handlePasswordSave}
        onCancel={handlePasswordCancel}
        userId={user.id}
      />
    </React.Fragment>
  );
}

ProfileMenu.propTypes = {
  success: PropTypes.any,
  t: PropTypes.any
};

export default ProfileMenu;