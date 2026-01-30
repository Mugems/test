import {
  BankOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FileOutlined,
  HomeOutlined,
  LineChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
  LockOutlined,
  ArrowUpOutlined,
  CopyrightOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Button, Drawer, Layout, Menu, theme, Tag, Modal } from 'antd';
import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import NotificationDropdown from "../CommonForBoth/TopbarDropdown/NotificationDropdown";
import ProfileMenu from "../CommonForBoth/TopbarDropdown/ProfileMenu";

import logoLarge from "../../assets/images/logo-large-tmf.png";
import logoLight from "../../assets/images/logolighttmf.png";
import lineIcon from "../../assets/icons/grow-up.png"
import organizationIcon from "../../assets/icons/government.png"
import branchIcon from "../../assets/icons/bank.png"
import areaIcon from "../../assets/icons/map.png"
import customerIcon from "../../assets/icons/user.png"
import investmentIcon from "../../assets/icons/profits (1).png"
import expenseTransactionIcon from "../../assets/icons/money-currency.png"
import expenseTypeIcon from "../../assets/icons/clipboard-list.png"
import userIcon from "../../assets/icons/user (2).png"
import resetIcon from "../../assets/icons/password (1).png"
import loanIcon from "../../assets/icons/loan-approved.png"
import homeIcon from "../../assets/icons/home.png"
import settingsIcon from "../../assets/icons/settings.png"
import rightIcon from "../../assets/icons/sidebar.png"
import leftIcon from "../../assets/icons/hide.png"
import "./VerticalLayout.css";
import { FloatButton } from 'antd';


const { Header, Sider, Content } = Layout;

const VerticalLayout = (props) => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = sessionStorage.getItem('sidebarCollapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [drawerWidth, setDrawerWidth] = useState(220);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [copyrightModalVisible, setCopyrightModalVisible] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    let scrollListeners = new Set();
    
    const handleScroll = (event) => {
      const target = event?.target || document;
      let shouldShow = false;
      
      if (target && target.scrollTop > 10) {
        shouldShow = true;
      }
      
      if (!shouldShow) {
        const allScrollableElements = [
          document.querySelector('.app-scroll-content'),
          document.getElementById('scrollableDiv'),
          ...document.querySelectorAll('[id^="scrollableDiv-"]'),
          ...document.querySelectorAll('.infinite-scroll-component'),
          ...document.querySelectorAll('.infinite-scroll-component__outerdiv'),
          ...document.querySelectorAll('[class*="infinite"]'),
          ...document.querySelectorAll('.view-customer-list-container'),
          ...document.querySelectorAll('.expense-list-container'),
          ...document.querySelectorAll('.ant-list'),
          ...document.querySelectorAll('.ant-table-body'),
          ...document.querySelectorAll('.ant-collapse-content-box'),
          ...document.querySelectorAll('[style*="overflow-y: auto"]'),
          ...document.querySelectorAll('[style*="overflow: auto"]'),
          ...document.querySelectorAll('[style*="overflow-y: scroll"]'),
          ...document.querySelectorAll('[style*="overflow: scroll"]'),
        ];
        
        for (const element of allScrollableElements) {
          if (element && element.scrollTop > 10) {
            shouldShow = true;
            break;
          }
        }
      }
      
      if (!shouldShow && window.pageYOffset > 10) {
        shouldShow = true;
      }
      
      setShowBackToTop(shouldShow);
    };

    const attachListeners = () => {
      removeListeners();
      
      const scrollableElements = [
        document.querySelector('.app-scroll-content'),
        document.getElementById('scrollableDiv'),
        ...document.querySelectorAll('[id^="scrollableDiv-"]'),
        ...document.querySelectorAll('.infinite-scroll-component'),
        ...document.querySelectorAll('.infinite-scroll-component__outerdiv'),
        ...document.querySelectorAll('[class*="infinite"]'),
        ...document.querySelectorAll('.view-customer-list-container'),
        ...document.querySelectorAll('.expense-list-container'),
        ...document.querySelectorAll('.ant-list'),
        ...document.querySelectorAll('.ant-table-body'),
        ...document.querySelectorAll('.ant-collapse-content'),
        ...document.querySelectorAll('.ant-collapse-content-box'),
        ...document.querySelectorAll('[style*="overflow-y: auto"]'),
        ...document.querySelectorAll('[style*="overflow: auto"]'),
        ...document.querySelectorAll('[style*="overflow-y: scroll"]'),
        ...document.querySelectorAll('[style*="overflow: scroll"]'),
      ];
      
      scrollableElements.forEach(element => {
        if (element && !scrollListeners.has(element)) {
          element.addEventListener('scroll', handleScroll, { passive: true });
          scrollListeners.add(element);
        }
      });
      
      if (!scrollListeners.has(window)) {
        window.addEventListener('scroll', handleScroll, { passive: true });
        scrollListeners.add(window);
      }
      
      console.log(`✅ Attached scroll listeners to ${scrollListeners.size} elements`);
    };

    const removeListeners = () => {
      scrollListeners.forEach(element => {
        element.removeEventListener('scroll', handleScroll);
      });
      scrollListeners.clear();
    };

    attachListeners();

    const timers = [
      setTimeout(attachListeners, 100),
      setTimeout(attachListeners, 300),
      setTimeout(attachListeners, 500),
      setTimeout(attachListeners, 1000),
      setTimeout(attachListeners, 2000),
    ];

    const observer = new MutationObserver((mutations) => {
      let shouldReattach = false;
      
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              const element = node;
              
              const hasScrollable = 
                element.id?.startsWith('scrollableDiv-') ||
                element.classList?.contains('infinite-scroll-component') ||
                element.classList?.contains('ant-collapse-content') ||
                element.classList?.contains('view-customer-list-container') ||
                element.querySelector('[id^="scrollableDiv-"]') ||
                element.querySelector('.infinite-scroll-component') ||
                element.querySelector('.ant-collapse-content');
              
              if (hasScrollable) {
                shouldReattach = true;
              }
            }
          });
        }
        
        if (mutation.type === 'attributes') {
          const element = mutation.target;
          if (element.classList?.contains('ant-collapse-item') ||
              element.classList?.contains('ant-collapse-content')) {
            shouldReattach = true;
          }
        }
      });
      
      if (shouldReattach) {
        console.log('🔄 DOM changed, reattaching listeners...');
        setTimeout(() => {
          removeListeners();
          attachListeners();
        }, 50);
      }
    });

    const contentElement = document.querySelector('.app-scroll-content');
    const observeTargets = [contentElement, document.body].filter(Boolean);
    
    observeTargets.forEach(target => {
      observer.observe(target, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'id'],
      });
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      observer.disconnect();
      removeListeners();
    };
  }, [location.pathname]);

  const scrollToTop = () => {
    console.log('🔝 Scroll to top initiated');
    
    const allScrollables = [
      document.querySelector('.app-scroll-content'),
      ...document.querySelectorAll('[id^="scrollableDiv-"]'),
      ...document.querySelectorAll('.infinite-scroll-component__outerdiv'),
      ...document.querySelectorAll('.infinite-scroll-component'),
      ...document.querySelectorAll('.view-customer-list-container'),
      ...document.querySelectorAll('.expense-list-container'),
      document.getElementById('scrollableDiv'),
      ...document.querySelectorAll('.ant-list'),
      ...document.querySelectorAll('.ant-collapse-content'),
      ...document.querySelectorAll('.ant-collapse-content-box'),
      ...document.querySelectorAll('[style*="overflow-y: auto"]'),
      ...document.querySelectorAll('[style*="overflow: auto"]'),
    ].filter(Boolean);
    
    let scrolledCount = 0;
    
    allScrollables.forEach((element, index) => {
      if (element && element.scrollTop > 0) {
        console.log(`📜 [${index}] Scrolling element with scrollTop: ${element.scrollTop}`);
        element.scrollTop = 0;
        scrolledCount++;
      }
    });
    
    if (window.pageYOffset > 0) {
      console.log('📜 Scrolling window');
      window.scrollTo({ top: 0, behavior: 'auto' });
      scrolledCount++;
    }
    
    console.log(`✅ Scrolled ${scrolledCount} containers to top`);
    
    if (scrolledCount === 0) {
      const firstItem = document.querySelector('.ant-collapse-item') || 
                        document.querySelector('[class*="list"]');
      if (firstItem) {
        console.log('📜 Using scrollIntoView fallback');
        firstItem.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }
  };

  useEffect(() => {
    console.log('=== VerticalLayout Component Mounted ===');
    
    const selectedBranch = localStorage.getItem('selected_branch_name');
    console.log('localStorage value for selected_branch_name:', selectedBranch);
    
    if (selectedBranch) {
      setBranchName(selectedBranch);
      console.log('✅ Branch name set to:', selectedBranch);
    } else {
      console.log('❌ No branch name found in localStorage');
    }

    const handleBranchChange = (e) => {
      console.log('🔔 branchChanged event received:', e.detail);
      if (e.detail && e.detail.branchName) {
        setBranchName(e.detail.branchName);
        console.log('✅ Branch updated via event to:', e.detail.branchName);
      }
    };

    const handleStorageChange = (e) => {
      console.log('💾 Storage change detected:', e.key, e.newValue);
      if (e.key === 'selected_branch_name' && e.newValue) {
        setBranchName(e.newValue);
        console.log('✅ Branch updated via storage to:', e.newValue);
      }
    };

    window.addEventListener('branchChanged', handleBranchChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('branchChanged', handleBranchChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const updateDrawerWidth = () => {
      const layoutElement = document.querySelector('.ant-layout');
      if (layoutElement) {
        if (layoutElement.classList.contains('font-size-xlarge')) {
          setDrawerWidth(260);
        } else if (layoutElement.classList.contains('font-size-large')) {
          setDrawerWidth(240);
        } else {
          setDrawerWidth(220);
        }
      }
    };

    updateDrawerWidth();

    const observer = new MutationObserver(updateDrawerWidth);
    const layoutElement = document.querySelector('.ant-layout');
    if (layoutElement) {
      observer.observe(layoutElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    return () => observer.disconnect();
  }, []);

  const menuItems = useMemo(() => [
    { key: '/home', icon: <img src={homeIcon} />, label: 'Home' },
    {
      key: 'settings',
      icon: <img src={settingsIcon} style={{ filter: isMobile ? 'none' : 'invert(1)'}}/>,
      label: 'Settings',
      children: [
        { key: '/view', icon: <img src={organizationIcon} style={{ filter: isMobile ? 'none' : 'invert(1)'}}/>, label: 'Organization' },
        { key: '/branch/list', icon: <img src={branchIcon} style={{filter: isMobile ? 'none' : 'invert(1)',}} />, label: 'Branch' },
        { key: '/line', icon: <img src={lineIcon} style={{filter: isMobile ? 'none' : 'invert(1)',}} />, label: 'Line' },
        { key: '/area', icon: <img src={areaIcon} style={{filter: isMobile ? 'none' : 'invert(1)',}} />, label: 'Area' },
        { key: '/expense/list', icon:<img src={expenseTypeIcon} style={{filter: isMobile ? 'none' : 'invert(1)',}} />, label: 'Expense Type' },
        { key: '/investment',icon: <img src={investmentIcon} style={{filter: isMobile ? 'none' : 'invert(1)',}} />, label: 'Investments' },
        { key: '/expense-transaction', icon: <img src={expenseTransactionIcon} style={{filter: isMobile ? 'none' : 'invert(1)',}} />,  label: 'Expense Transactions' },
        { key: '/user/list', icon: <img src={userIcon} style={{filter: isMobile ? 'none' : 'invert(1)',}} />, label: 'Users' },
        {key: '/location-list', icon: <UserOutlined />, label: 'Location' }
      ],
    },
    { key: '/reset-password', icon:<img src={resetIcon} style={{filter: isMobile ? 'none' : 'invert(1)',}} />, label: 'Reset Password' },
    { key: '/view-customer', icon: <img src={customerIcon} style={{filter: isMobile ? 'none' : 'invert(1)',}} />, label: 'Customer' },
  ], [isMobile]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuClick = (e) => {
    if (e.key.startsWith('/')) {
      navigate(e.key);
      
      if (isMobile) {
        setMobileDrawerVisible(false);
      }
    }
  };

  const handleOpenChange = (keys) => {
    if (!collapsed) {
      setOpenKeys(keys);
    }
  };

  useEffect(() => {
    const currentPath = location.pathname;
    setSelectedKeys([currentPath]);
    
    if (!collapsed) {
      const findParentKey = () => {
        for (const item of menuItems) {
          if (item.children) {
            const found = item.children.find(child => child.key === currentPath);
            if (found) return item.key;
          }
        }
        return null;
      };
      
      const parentKey = findParentKey();
      if (parentKey) {
        setOpenKeys([parentKey]);
      }
    }
  }, [location.pathname, collapsed, menuItems]);

  useEffect(() => {
    if (collapsed) {
      setOpenKeys([]);
    }
  }, [collapsed]);

  useEffect(() => {
    const updateSidebarWidth = () => {
      const sider = document.querySelector('.ant-layout-sider');
      if (sider && !collapsed && !isMobile) {
        const siderWidth = sider.offsetWidth;
        document.documentElement.style.setProperty('--sidebar-width', `${siderWidth}px`);
      } else if (collapsed || isMobile) {
        document.documentElement.style.setProperty('--sidebar-width', '80px');
      }
    };

    const timer1 = setTimeout(updateSidebarWidth, 50);
    const timer2 = setTimeout(updateSidebarWidth, 200);
    const timer3 = setTimeout(updateSidebarWidth, 500);
    
    let resizeObserver;
    
    const setupObserver = () => {
      const sider = document.querySelector('.ant-layout-sider');
      if (sider && window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          updateSidebarWidth();
        });
        resizeObserver.observe(sider);
      }
    };
    
    setTimeout(setupObserver, 100);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [collapsed, isMobile, menuItems]);

  const mobileDrawerContent = (
    <div style={{ padding: 0, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ 
        padding: "12px 16px", 
        borderBottom: "1px solid #f0f0f0", 
        marginBottom: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0
      }}>
        <img src={logoLarge} alt="Logo" height="28" style={{ marginLeft: "4px" }} />
        <Button 
          type="text" 
          icon={<img src={leftIcon} width={20} height={20} />} 
          onClick={() => setMobileDrawerVisible(false)}
          style={{ 
            fontSize: "16px",
            padding: "4px",
            minWidth: "32px",
            height: "32px"
          }}
        />
      </div>
      
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        overflowX: "hidden",
        paddingBottom: branchName ? "80px" : "16px"
      }}>
        <div style={{ padding: "0 4px" }}>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            onClick={handleMenuClick}
            items={menuItems}
            style={{ 
              border: "none",
              background: "transparent",
            }}
          />
        </div>
      </div>
      
      {branchName && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 16px',
          background: '#f0f5ff',
          borderTop: '1px solid #d9d9d9',
          textAlign: 'center',
          zIndex: 10,
        }}>
          <div style={{ 
            fontSize: '10px', 
            color: '#666', 
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 600
          }}>
            Current Branch
          </div>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: 600,
            color: '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <BankOutlined style={{ fontSize: '14px' }} />
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '180px'
            }}>
              {branchName}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  console.log('Render - branchName state:', branchName);

  return (
    <Layout style={{ minHeight: '100vh' }}  className={props.fontSize || ''}>
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
          display: isMobile ? 'none' : 'block',
        }}
      >
        <div style={{ 
          width: '32px',
          height: '64px', 
          margin: '16px', 
          alignItems: 'center',
        }}>
          <img 
            src={collapsed ? logoLight : logoLarge} 
            alt="Logo" 
            style={{ 
              height: collapsed ? '32px' : '40px',
              transition: 'all 0.2s',
            }} 
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={collapsed ? () => {} : handleOpenChange}
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            height: 'calc(100vh - 160px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            border: 'none',
          }}
        />
        {branchName && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: collapsed ? '8px 4px' : '12px 16px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            transition: 'all 0.2s',
          }}>
            {!collapsed ? (
              <>
                <div style={{ 
                  fontSize: '10px', 
                  color: 'rgba(255, 255, 255, 0.65)', 
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Current Branch
                </div>
                <div style={{ 
                  fontSize: '13px', 
                  fontWeight: 500,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  <BankOutlined style={{ fontSize: '12px' }} />
                  <span style={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {branchName}
                  </span>
                </div>
              </>
            ) : (
              <div style={{ 
                fontSize: '10px', 
                fontWeight: 500,
                color: '#fff',
                lineHeight: 1.2,
                wordBreak: 'break-word'
              }}>
                <BankOutlined style={{ fontSize: '14px', marginBottom: '2px' }} />
              </div>
            )}
          </div>
        )}
      </Sider>

      <Layout 
        className={`main-layout ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} ${isMobile ? 'mobile-view' : 'desktop-view'}`}
        style={{ 
          marginLeft: isMobile ? 0 : (collapsed ? 80 : 'var(--sidebar-width, 250px)'),
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header
          className={`main-header ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} ${isMobile ? 'mobile-view' : 'desktop-view'}`}
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            position: 'fixed',
            zIndex: 1000,
            width: isMobile ? '100%' : `calc(100% - ${collapsed ? '80px' : 'var(--sidebar-width, 250px)'})`,
            left: isMobile ? 0 : (collapsed ? '80px' : 'var(--sidebar-width, 250px)'),
            top: 0,
            display: 'flex',
            alignItems: 'center',
            transition: 'left 0.3s ease, width 0.3s ease',
            height: '48px',
          }}
        >
          <Button
            type="text"
            icon={
              isMobile ? (
                <img src={rightIcon} width={20} height={20} alt="menu" />
              ) : collapsed ? (
                <img src={rightIcon} width={20} height={20} alt="expand" />
              ) : (
                <img src={leftIcon} width={20} height={20} alt="collapse" />
              )
            }
            onClick={() => {
              if (isMobile) {
                setMobileDrawerVisible(true);
              } else {
                const newCollapsed = !collapsed;
                setCollapsed(newCollapsed);
                sessionStorage.setItem('sidebarCollapsed', JSON.stringify(newCollapsed));
              }
            }}
            style={{
              fontSize: '16px',
              width: 32,
              height: 48,
              marginRight: '10px',
            }}
          />
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginRight: isMobile? '18px ' : '25px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              lineHeight: 1.2
            }}>
              {branchName && (
                <div style={{
                  fontSize: '16px',
                  color: '#666',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '-15px'
                }}>
                  <span style={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: isMobile ? '120px' : '200px'
                  }}>
                    {branchName}
                  </span>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: '-20px'
            }}>
              <NotificationDropdown />
              <ProfileMenu />
            </div>
          </div>
        </Header>

        <Content
          className="app-scroll-content"
          style={{
            margin: '48px 0 0',
            overflow: 'visible',
            height: 'calc(100vh - 48px)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              flex: 1,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              padding: '16px',
              overflow: 'visible',
              minHeight: '100%',
              position: 'relative',
            }}
          >
            {props.children}
          </div>
        </Content>

        {showBackToTop && (
          <FloatButton
            icon={<ArrowUpOutlined />}
            onClick={scrollToTop}
            style={{
              right: 16,
              bottom: 100,
            }}
            type="primary"
            className="custom-float-button"
          />
        )}

        <FloatButton
          icon={<CopyrightOutlined />}
          onClick={() => setCopyrightModalVisible(true)}
          style={{
            left: 16,
            bottom: 20,
            width: 20,
            height: 20
          }}
          type="default"
          // tooltip="Statutory Information"
        />
      </Layout>
      
      <Drawer
        title=""
        placement="left"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        width={drawerWidth}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ display: "none" }}
        style={{ display: isMobile ? 'block' : 'none' }}
      >
        {mobileDrawerContent}
      </Drawer>

      <Modal
        title={
          <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 600 }}>
            Statutory Information
          </div>
        }
        open={copyrightModalVisible}
        onCancel={() => setCopyrightModalVisible(false)}
        footer={null}
        closeIcon={<CloseOutlined />}
        width={400}
        centered
      >
        <div style={{ 
          textAlign: 'center', 
          padding: '20px 0',
          fontSize: '16px',
          fontWeight: 500
        }}>
          Think Tank
        </div>
      </Modal>
    </Layout>
  );
};

export default VerticalLayout;