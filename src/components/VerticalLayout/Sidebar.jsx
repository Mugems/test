import { Layout } from "antd";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { changeSidebarType } from "../../store/actions";

import SidebarContent from "./SidebarContent";

import { Link } from "react-router-dom";

import logoLarge from "../../assets/images/logo-large-tmf.png";
import logoLight from "../../assets/images/logolighttmf.png";

const { Sider } = Layout;
const Sidebar = props => {
  const [collapsed, setCollapsed] = useState(props.type === "condensed");

  // Listen for collapse events from SidebarContent
  useEffect(() => {
    const handleCollapse = () => {
      setCollapsed(true);
      // Dispatch Redux action to update global state
      props.changeSidebarType("condensed", props.isMobile);
    };

    window.addEventListener('sidebarCollapse', handleCollapse);
    return () => window.removeEventListener('sidebarCollapse', handleCollapse);
  }, [props]);

  // Update local state when Redux state changes
  useEffect(() => {
    setCollapsed(props.type === "condensed");
  }, [props.type]);

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      collapsedWidth={80}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
      }}
      theme="dark"
    >
      <div style={{ 
        height: '64px', 
        margin: '16px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Link to="/">
          <img 
            src={collapsed ? logoLight : logoLarge} 
            alt="Logo" 
            style={{ 
              height: collapsed ? '32px' : '40px',
              transition: 'all 0.2s',
            }} 
          />
        </Link>
      </div>
      <SidebarContent collapsed={collapsed} />
    </Sider>
  );
};

Sidebar.propTypes = {
  type: PropTypes.string,
};

const mapStatetoProps = state => {
  return {
    layout: state.Layout,
  };
};

const mapDispatchToProps = {
  changeSidebarType,
};

export default connect(
  mapStatetoProps,
  mapDispatchToProps
)(Sidebar);
