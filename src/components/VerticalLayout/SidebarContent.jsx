import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Ant Design components
import {
  HomeOutlined,
  SettingOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";

import "../Common/antd-menu-custom.css";

const orgMenuItems = [
  { key: "/view", label: "Organization" },
  { key: "/branch/list", label: "Branch" },
  { key: "/line", label: "Line" },
  { key: "/area", label: "Area" },
  { key: "/expense/list", label: "Expense Type" },
  { key: "/investment", label: "Investments" },
  { key: "/expense-transaction", label: "Expense Transactions" },
  { key: "/user/list", label: "All Users" },
  {key: "location-list",label: "Location"}
];

// const userMenuItems = [
//   { key: "/user/list", label: "All Users" },
// ];

const loanMenuItems = [
  { key: "/disburse-loan", label: "Loan Disbursement" },
];

const SidebarContent = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { collapsed = false } = props;
  
  // State for managing selected menu items and open submenus
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);

  // Handle menu item click (only for actual navigation items)
  const handleMenuClick = (e) => {
    // Only navigate if it's not a parent menu item (settings, users, loan)
    if (e.key !== 'settings' && e.key !== 'users' && e.key !== 'loan') {
      navigate(e.key);
      
      // Trigger sidebar collapse after navigation
      const collapseEvent = new CustomEvent('sidebarCollapse');
      window.dispatchEvent(collapseEvent);
    }
  };

  // Handle submenu open/close
  const handleOpenChange = (keys) => {
    // Only allow submenu changes when not collapsed
    if (!collapsed) {
      setOpenKeys(keys);
    }
  };

  // Update selected menu item based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Clear previous selection and set only current path
    setSelectedKeys([currentPath]);
    
    // Auto-open parent menus based on current route, but only if not collapsed
    if (!collapsed) {
      if (orgMenuItems.some(item => item.key === currentPath)) {
        setOpenKeys(['settings']);
      // } else if (userMenuItems.some(item => item.key === currentPath)) {
      //   setOpenKeys(['users']);
      } else if (loanMenuItems.some(item => item.key === currentPath)) {
        setOpenKeys(['loan']);
      }
    }
  }, [location.pathname, collapsed]);

  // Close all submenus when sidebar collapses
  useEffect(() => {
    if (collapsed) {
      setOpenKeys([]);
    }
  }, [collapsed]);

  // Menu items configuration for Ant Design Menu
  const menuItems = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      children: orgMenuItems.map(item => ({
        key: item.key,
        label: item.label,
      })),
    },
    // {
    //   key: 'users',
    //   icon: <UserOutlined />,
    //   label: 'Users',
    //   children: userMenuItems.map(item => ({
    //     key: item.key,
    //     label: item.label,
    //   })),
    // },
    {
      key: 'loan',
      icon: <UserOutlined />,
      label: 'Loan',
      children: loanMenuItems.map(item => ({
        key: item.key,
        label: item.label,
      })),
    },
    {
      key: '/reset-password',
      icon: <LockOutlined />,
      label: 'Reset Password',
    },
     {
      key: '/view-customer',
      icon: <LockOutlined />,
      label: 'Customer',
    },
  ];

  console.log('Menu Items:', menuItems); // Debug log

  return (
    <React.Fragment>
      <div className="antd-sidebar-menu" style={{ height: '100%', overflowY: 'auto' }}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={collapsed ? [] : openKeys}
          onSelect={handleMenuClick}
          onOpenChange={collapsed ? () => {} : handleOpenChange}
          items={menuItems}
          inlineCollapsed={collapsed}
          style={{
            border: 'none',
            background: 'transparent',
            height: '100%',
            
          }}
        />
      </div>
    </React.Fragment>
  );
};

SidebarContent.propTypes = {
  collapsed: PropTypes.bool,
  location: PropTypes.object,
  t: PropTypes.any,
};

export default SidebarContent;