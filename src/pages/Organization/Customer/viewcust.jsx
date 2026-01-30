import { useEffect, useState, useCallback } from "react";
import { Form, Input, Button, Select, notification, Divider, Space, InputNumber, Tabs, Modal } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined, IdcardOutlined, EnvironmentOutlined, FileTextOutlined, UserAddOutlined, ReloadOutlined, PlusOutlined, MinusOutlined, ApartmentOutlined,GlobalOutlined, BankFilled, BankOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from "react-router-dom";
import Loader from "components/Common/Loader";
import { GET, POST, PUT, DELETE } from "helpers/api_helper";
import { AREA } from "helpers/url_helper";
import "./AddCustomer.css";
import AddCustomerDocument from "./AddCustomerDocument";
import professionIcon from '../../../assets/icons/businessman.png'
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';
import InputWithAddon from "components/Common/InputWithAddon";
import SelectWithAddon from "components/Common/SelectWithAddon";
import locationIcon1 from "../../../assets/icons/earth-grid.png";
import locationIcon2 from "../../../assets/icons/location (1).png"

const mapContainerStyle = {
    width: '100%',
    height: '400px'
};
const { Option } = Select;
const { TextArea } = Input;

const AddCustomer = () => {
    const [loader, setLoader] = useState(false);
    const [activeTab, setActiveTab] = useState("1");
    const [lineList, setLineList] = useState([]);
    const [areaList, setAreaList] = useState([]);
    const [branchList, setBranchList] = useState([]);
    const [allData, setAllData] = useState([]);
    const [filteredLineList, setFilteredLineList] = useState([]);
    const [filteredAreaList, setFilteredAreaList] = useState([]);
    const [isPersonalInfoSubmitted, setIsPersonalInfoSubmitted] = useState(false);
    const [nextCustomerId, setNextCustomerId] = useState(null);
    const [currentCustomerId, setCurrentCustomerId] = useState(null);
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
    const [selectedLocation, setSelectedLocation] = useState(null);

    // LocalStorage states
    const [savedBranchName, setSavedBranchName] = useState(null);
    const [savedLineName, setSavedLineName] = useState(null);
    const [savedAreaId, setSavedAreaId] = useState(null);
    const [savedAreaName, setSavedAreaName] = useState(null);
    const [isFromLocalStorage, setIsFromLocalStorage] = useState(false);
    const [currentAccuracy, setCurrentAccuracy] = useState(null);
const [isEditMode, setIsEditMode] = useState(false);
    const [form] = Form.useForm();
    const params = useParams();
    const navigate = useNavigate();

    const getAreaList = useCallback(async () => {
        try {
            setLoader(true);
            const response = await GET(AREA);
            console.log(response.data)
            if (response?.status === 200) {
                const data = response.data;
                setAllData(data);

                // Extract unique branches
                const branchMap = new Map();
                data.forEach(item => {
                    if (item.branchid && !branchMap.has(item.branchid)) {
                        branchMap.set(item.branchid, {
                            id: item.branchid,
                            branch_name: item.branch_name
                        });
                    }
                });
                const uniqueBranches = Array.from(branchMap.values());
                console.log("branches",uniqueBranches)

                // Extract unique lines
                const lineMap = new Map();
                data.forEach(item => {
                    if (item.lineid && !lineMap.has(item.lineid)) {
                        lineMap.set(item.lineid, {
                            id: item.lineid,
                            name: item.line_name,
                            branch_id: item.branchid
                        });
                    }
                });
                const uniqueLines = Array.from(lineMap.values());
                console.log("lines",uniqueLines)

                // Extract unique areas
                const areaMap = new Map();
                data.forEach(item => {
                    if (item.id && !areaMap.has(item.id)) {
                        areaMap.set(item.id, {
                            id: item.id,
                            name: item.areaName,
                            branch_id: item.branchid,
                            line_id: item.lineid
                        });
                    }
                });
                const uniqueAreas = Array.from(areaMap.values());
                console.log("areas",uniqueAreas)

                setBranchList(uniqueBranches);
                setLineList(uniqueLines);
                setAreaList(uniqueAreas);
                setFilteredLineList(uniqueLines);
                setFilteredAreaList(uniqueAreas);

                // Check for saved selections in localStorage
                const storedLineName = localStorage.getItem('selected_line_name');
                const storedAreaId = localStorage.getItem('selected_area_id');
                const storedAreaName = localStorage.getItem('selected_area_name');
                const storedBranchName = localStorage.getItem('selected_branch_name');

                if (storedLineName && storedAreaId && storedBranchName && !params.id) {
                    // Set saved values
                    setSavedBranchName(storedBranchName);
                    setSavedLineName(storedLineName);
                    setSavedAreaId(parseInt(storedAreaId));
                    setSavedAreaName(storedAreaName);
                    setIsFromLocalStorage(true);

                    // Find the branch ID from branch name
                    const matchedBranch = uniqueBranches.find(
                        branch => branch.branch_name === storedBranchName
                    );

                    // Find the line ID from line name
                    const matchedLine = uniqueLines.find(
                        line => line.name === storedLineName &&
                            line.branch_id === matchedBranch?.id
                    );
                    console.log(matchedBranch,matchedLine)

                    if (matchedBranch && matchedLine) {
                        // Set form values
                        form.setFieldsValue({
                            branch: matchedBranch.id,
                            line: matchedLine.id,
                            area: parseInt(storedAreaId)
                        });

                        // Filter line and area lists
                        const filteredLines = uniqueLines.filter(
                            line => line.branch_id === matchedBranch.id
                        );
                        setFilteredLineList(filteredLines);

                        const filteredAreas = uniqueAreas.filter(
                            area => area.branch_id === matchedBranch.id &&
                                area.line_id === matchedLine.id
                        );
                        setFilteredAreaList(filteredAreas);
                    }
                }
            }
            setLoader(false);
        } catch (error) {
            setLoader(false);
            notification.error({
                message: 'Error',
                description: 'Failed to fetch area details',
                duration: 3,
            });
            console.error(error);
        }
    }, [params.id, form]);

    const getAllCustomers = useCallback(async () => {
        try {
            const response = await GET('/api/customers/');
            if (response?.status === 200) {
                const customers = response.data;

                if (customers && customers.length > 0) {
                    const maxId = Math.max(...customers.map(customer => customer.customer_order));
                    setNextCustomerId(maxId + 1);
                } else {
                    setNextCustomerId(1);
                }
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            setNextCustomerId(1);
        }
    }, []);

    const handleBranchChange = (branchId) => {
        const filtered = allData.filter(item => item.branch_id === branchId);

        const lineMap = new Map();
        filtered.forEach(item => {
            if (item.line_id && !lineMap.has(item.line_id)) {
                lineMap.set(item.line_id, {
                    id: item.line_id,
                    name: item.line_name,
                    branch_id: item.branch_id
                });
            }
        });
        const filteredLines = Array.from(lineMap.values());
        setFilteredLineList(filteredLines);

        form.setFieldsValue({ line: undefined, area: undefined });
        setFilteredAreaList([]);
    };

    const handleLineChange = (lineId) => {
        const branchId = form.getFieldValue('branch');

        const filtered = allData.filter(item =>
            item.branch_id === branchId && item.line_id === lineId
        );

        const areaMap = new Map();
        filtered.forEach(item => {
            if (item.id && !areaMap.has(item.id)) {
                areaMap.set(item.id, {
                    id: item.id,
                    name: item.areaName,
                    branch_id: item.branch_id,
                    line_id: item.line_id
                });
            }
        });
        const filteredAreas = Array.from(areaMap.values());
        setFilteredAreaList(filteredAreas);

        form.setFieldsValue({ area: undefined });
    };

    // Replace the getCustomerDetails function with this updated version:

    const getCustomerDetails = useCallback(async () => {
        try {
            setLoader(true);
            const response = await GET(`/api/customers/${params.id}/`);
            if (response?.status === 200) {
                const data = response?.data;

                // Find names for display
                const customerBranch = branchList.find(b => b.id === data.branch);
                const customerLine = lineList.find(l => l.id === data.line);
                const customerArea = areaList.find(a => a.id === data.area);

                if (customerBranch) setSavedBranchName(customerBranch.branch_name);
                if (customerLine) setSavedLineName(customerLine.name);
                if (customerArea) setSavedAreaName(customerArea.name);

                // Initialize reference contacts
                if (!data.reference_contacts || data.reference_contacts.length === 0) {
                data.reference_contacts = [{ reference_name: '', reference_number: '', reference_description: '' }];
            }

                // ✅ OPTIMIZED: Load existing coordinates
                if (data?.latitude && data?.longitude) {
                    const lat = parseFloat(data.latitude);
                    const lng = parseFloat(data.longitude);

                    // Validate coordinates
                    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                        setSelectedLocation({
                            lat: lat.toFixed(6),
                            lng: lng.toFixed(6),
                            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
                        });

                        setMapCenter({ lat, lng });
                    }
                }

                form.setFieldsValue(data);
                setIsPersonalInfoSubmitted(true);
                setCurrentCustomerId(data?.id);
                setIsEditMode(true)
            }
            setLoader(false);
        } catch (error) {
            setLoader(false);
            notification.error({
                message: 'Error',
                description: 'Failed to fetch customer details',
                duration: 3,
            });
            console.error(error);
        }
    }, [params.id, form, branchList, lineList, areaList]);


    // ALTERNATIVE SOLUTION: Update the useEffect that initializes the form
    // Replace the existing useEffect with this:

    useEffect(() => {
        getAreaList();

        // Always initialize reference_contacts with at least one field
        if (!params.id) {
            getAllCustomers();
        }

        // Initialize form with one reference contact field (for both add and edit)
        form.setFieldsValue({
            reference_contacts: [{ reference_number: '' }]
        });
    }, [params.id, getAllCustomers, getAreaList, form]);

    useEffect(() => {
        getAreaList();

        if (!params.id) {
            getAllCustomers();
             form.setFieldsValue({
        reference_contacts: [{ reference_name: '', reference_number: '', reference_description: '' }]
    });
        }
    }, [params.id, getAllCustomers, getAreaList, form]);

    // Separate useEffect for getting customer details after area list is loaded
    useEffect(() => {
        if (params.id && branchList.length > 0 && lineList.length > 0 && areaList.length > 0) {
            getCustomerDetails();
        }
    }, [params.id, branchList, lineList, areaList, getCustomerDetails]);

    const openMapModal = () => {
        // FIX: Always set the map center to selected location when opening modal
        if (selectedLocation) {
            const lat = parseFloat(selectedLocation.lat);
            const lng = parseFloat(selectedLocation.lng);
            if (!isNaN(lat) && !isNaN(lng)) {
                setMapCenter({ lat, lng });
            }
        } else {
            // Default to India center if no location selected
            setMapCenter({ lat: 20.5937, lng: 78.9629 });
        }
        setMapModalVisible(true);
    };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
        notification.error({
            message: 'Geolocation Not Supported',
            description: 'Your browser does not support geolocation.',
        });
        return;
    }

    notification.info({
        message: 'Getting GPS Location',
        description: 'Acquiring satellite fix... Please wait outdoors for best results.',
        duration: 5,
    });

    let watchId = null;
    let bestAccuracy = Infinity;
    let timeoutId = null;
    let improvementTimeoutId = null;
    let lastImprovementTime = Date.now();

    // Mobile GPS-optimized options
    const options = {
        enableHighAccuracy: true,
        timeout: 120000,       // 2 minutes for mobile GPS
        maximumAge: 0,         // Always get fresh GPS data
    };

    let bestPosition = null;
    let positionCount = 0;

    const finishWithBestPosition = (reason = '') => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        if (improvementTimeoutId !== null) {
            clearTimeout(improvementTimeoutId);
            improvementTimeoutId = null;
        }

        if (bestPosition) {
            const { latitude, longitude, accuracy } = bestPosition.coords;

            setSelectedLocation({
                lat: latitude.toFixed(6),
                lng: longitude.toFixed(6),
                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            });

            setMapCenter({ lat: latitude, lng: longitude });

            console.log(`Finished: ${reason}, Accuracy: ${accuracy.toFixed(1)}m`);

            if (accuracy <= 2) {
                notification.success({
                    message: "Excellent GPS Lock ✅",
                    description: `Accuracy: ${accuracy.toFixed(1)} meters`,
                    duration: 3,
                });
            } else if (accuracy > 2 && accuracy <= 10) {
                notification.success({
                    message: "Good GPS Lock ✅",
                    description: `Accuracy: ${accuracy.toFixed(1)} meters`,
                    duration: 3,
                });
            } else {
                notification.warning({
                    message: "GPS Lock Acquired",
                    description: `Accuracy: ${accuracy.toFixed(1)} meters. Move outdoors for better signal.`,
                    duration: 4,
                });
            }
        }
    };

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            positionCount++;

            console.log(`Update #${positionCount}: Accuracy=${accuracy.toFixed(1)}m, Lat=${latitude.toFixed(6)}, Lng=${longitude.toFixed(6)}`);

            // Update if this is better accuracy
            if (accuracy < bestAccuracy) {
                const improvement = bestAccuracy - accuracy;
                console.log(`✅ Improved by ${improvement.toFixed(1)}m`);
                
                bestAccuracy = accuracy;
                bestPosition = position;
                lastImprovementTime = Date.now();

                // Update UI immediately with best position
                setSelectedLocation({
                    lat: latitude.toFixed(6),
                    lng: longitude.toFixed(6),
                    address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                });

                setMapCenter({ lat: latitude, lng: longitude });
                
                if (typeof setCurrentAccuracy === 'function') {
                    setCurrentAccuracy(accuracy);
                }

                // Reset the "no improvement" timeout
                if (improvementTimeoutId !== null) {
                    clearTimeout(improvementTimeoutId);
                }
                
                // If no improvement for 10 seconds, lock position
                improvementTimeoutId = setTimeout(() => {
                    if (bestPosition) {
                        finishWithBestPosition('No improvement for 10 seconds');
                    }
                }, 10000);
            }

            // Lock immediately if excellent accuracy achieved
            if (accuracy <= 5) {
                finishWithBestPosition('Excellent accuracy achieved');
            }
            // Lock if very good accuracy after 3+ readings
            else if (accuracy <= 10 && positionCount >= 3) {
                finishWithBestPosition('Very good accuracy achieved');
            }
            // Lock if good accuracy after 5+ readings
            else if (accuracy <= 20 && positionCount >= 5) {
                finishWithBestPosition('Good accuracy achieved');
            }
        },
        (error) => {
            console.error("Geolocation error:", error.code, error.message);
            
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }
            if (improvementTimeoutId !== null) {
                clearTimeout(improvementTimeoutId);
            }

            // If we have a position already, use it
            if (bestPosition) {
                finishWithBestPosition('Error occurred but position available');
                return;
            }

            // Error messages
            let errorMessage = "Unable to get GPS location";
            let description = "";
            
            if (error.code === 1) {
                errorMessage = "Location Permission Denied";
                description = "Please enable location permissions in Firefox settings.";
            } else if (error.code === 2) {
                errorMessage = "GPS Position Unavailable";
                description = "Cannot get GPS signal. Ensure GPS is enabled and you're outdoors.";
            } else if (error.code === 3) {
                errorMessage = "GPS Timeout";
                description = "GPS took too long. Try again outdoors with clear sky view.";
            }

            notification.error({ 
                message: errorMessage, 
                description: description,
                duration: 6,
            });
        },
        options
    );

    // Maximum timeout: 45 seconds, then use best available
    timeoutId = setTimeout(() => {
        if (bestPosition) {
            finishWithBestPosition('Maximum time reached');
        } else {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
            notification.error({
                message: "GPS Timeout",
                description: "Could not acquire GPS signal. Please ensure GPS is enabled and try outdoors.",
                duration: 6,
            });
        }
    }, 45000);
};

    const handleMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        setSelectedLocation({
            lat: lat.toFixed(6),
            lng: lng.toFixed(6),
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });


        setMapCenter({ lat, lng });
    };


    const handleMapModalOk = () => {
        if (selectedLocation) {
            form.setFieldsValue({
                latitude: parseFloat(selectedLocation.lat),
                longitude: parseFloat(selectedLocation.lng)
            });
            setMapModalVisible(false);

            notification.success({
                message: 'Location Set',
                description: `Coordinates: ${selectedLocation.lat}, ${selectedLocation.lng}`,
                duration: 2,
            });
        } else {
            notification.error({
                message: 'No Location Selected',
                description: 'Please select a location on the map or use current location',
                duration: 3,
            });
        }
    };

    // Replace the onFinish function with this updated version:

    const onFinish = async (values) => {
        
        setLoader(true);
        try {
            // Filter out empty reference contacts
            const filteredReferenceContacts = (values.reference_contacts || []).filter(
            contact => contact.reference_name?.trim() || contact.reference_number?.trim() || contact.reference_description?.trim()
        );
        console.log(filteredReferenceContacts)
            const payload = {
                customer_name: values.customer_name,
                mobile_number: values.mobile_number,
                alternate_mobile_number: values.alternate_mobile_number || null,
                email_id: values.email_id,
                aadhaar_id: values.aadhaar_id,
                pan_number: values.pan_number,
                address: values.address,
                profession: values.profession,
                line: values.line,
                area: values.area,
                branch: values.branch,
                latitude: values.latitude ? String(values.latitude) : null,
                longitude: values.longitude ? String(values.longitude) : null,
                customer_order: params.id ? values.customer_order : nextCustomerId,
                reference_contacts: filteredReferenceContacts,
            };

            console.log('Payload being sent:', payload);

            let response;
            if (params.id) {
                response = await PUT(`/api/customers/${params.id}/`, payload);
            } else {
                response = await POST('/api/customers/', payload);
            }

            setLoader(false);

            if (response.status === 400) {
                // Handle validation errors
                const errorMessages = [];

                if (response?.data) {
                    Object.keys(response.data).forEach(key => {
                        if (Array.isArray(response.data[key])) {
                            errorMessages.push(`${key}: ${response.data[key][0]}`);
                        } else {
                            errorMessages.push(`${key}: ${response.data[key]}`);
                        }
                    });
                }

                notification.error({
                    message: 'Validation Error',
                    description: errorMessages.length > 0
                        ? errorMessages.join('\n')
                        : (params.id ? 'Failed to update customer' : 'Failed to create customer'),
                    duration: 5,
                });
                return;
            }

            notification.success({
                message: `${values.customer_name} ${params.id ? 'Updated' : 'Added'}!`,
                description: params.id
                    ? 'Customer details updated successfully. You can now manage documents.'
                    : 'Customer added successfully. You can now upload documents.',
                duration: 3,
            });

            // FIX: In both add and edit mode, go to document upload tab
            if (!params.id) {
                // Add mode
                form.setFieldsValue({ id: response?.data?.id });
                setCurrentCustomerId(response?.data?.id);
                setIsPersonalInfoSubmitted(true);
                setActiveTab("2");
            } else {
                // Edit mode - also go to tab 2 instead of navigating away
                setCurrentCustomerId(params.id);
                setIsPersonalInfoSubmitted(true);
                setActiveTab("2");
            }
        } catch (error) {
            console.error('Submit error:', error);
            notification.error({
                message: 'Error',
                description: error?.response?.data?.detail || 'An error occurred. Please try again.',
                duration: 5,
            });
            setLoader(false);
        }
    };

    const handleReset = () => {
        form.resetFields();
  form.setFieldsValue({
        reference_contacts: [{ reference_name: '', reference_number: '', reference_description: '' }]
    });
        // If values are from localStorage, restore them
        if (isFromLocalStorage && savedBranchName && savedLineName && savedAreaId) {
            const matchedBranch = branchList.find(
                branch => branch.branch_name === savedBranchName
            );
            const matchedLine = lineList.find(
                line => line.name === savedLineName
            );

            if (matchedBranch && matchedLine) {
                form.setFieldsValue({
                    branch: matchedBranch.id,
                    line: matchedLine.id,
                    area: savedAreaId
                });
            }
        } else {
            setFilteredLineList(lineList);
            setFilteredAreaList(areaList);
        }
    };

    const handleDelete = async () => {
        if (!params.id) return;

        try {
            setLoader(true);
            const response = await DELETE(`/api/customers/${params.id}/`);

            if (response.status === 204 || response.status === 200) {
                notification.success({
                    message: 'Customer Deleted',
                    description: 'Customer has been deleted successfully',
                    duration: 0,
                });
                navigate('/customers');
            } else {
                notification.error({
                    message: 'Error',
                    description: 'Failed to delete customer',
                    duration: 0,
                });
            }
            setLoader(false);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to delete customer',
                duration: 0,
            });
            setLoader(false);
            console.error(error);
        }
    };

    const handleTabChange = (key) => {
        if (key === "2") {
            // In add mode: only allow if personal info is submitted
            if (!params.id && !isPersonalInfoSubmitted) {
                notification.warning({
                    message: 'Complete Personal Information',
                    description: 'Please submit the personal information form before uploading documents.',
                    duration: 3,
                });
                return;
            }
        }
        setActiveTab(key);
    };

    const handlePreviousTab = () => {
        setActiveTab("1");
    };

    const handleCancelForm = () => {
        if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            navigate('/view-customer');
        }
    };

    const tabItems = [
        {
            key: "1",
            label: (
                <span>
                    <UserAddOutlined />
                    Personal Info
                </span>
            ),
            children: (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="add-customer-form"
                      onFinishFailed={(errorInfo) => {  // ✅ ADD THIS
        console.log('❌ Form validation failed:', errorInfo);
    }}
                >
                    <div className="container add-customer-form-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                                Personal Information
                            </h3>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleReset}
                                title="Reset to Original"
                            />
                        </div>

                        <div className="row mb-2">
                            <div className="col-md-6">
                                <Form.Item
    label="Customer Name"
    name="customer_name"
    rules={[
        { required: true, message: 'Please enter customer name' },
        { min: 2, message: 'Name must be at least 2 characters' },
        { pattern: /^[A-Za-z\s]+$/, message: 'Must contain only alphabets' }
    ]}
>
    <InputWithAddon
        icon={<UserOutlined />}
        placeholder="Enter customer name"
        onKeyPress={(e) => {
            // Prevent numbers and special characters
            if (!/[A-Za-z\s]/.test(e.key)) {
                e.preventDefault();
            }
        }}
    />
</Form.Item>
                            </div>

                            <div className="col-md-6">
                              
<Form.Item
    label="Mobile Number"
    name="mobile_number"
    rules={[
        { required: true, message: 'Please enter mobile number' },
        { pattern: /^\d{10}$/, message: 'Must be 10 digits' }
    ]}
>
    <InputWithAddon
        icon={<PhoneOutlined />}
        placeholder="10 digit mobile number"
        maxLength={10}
        onKeyPress={(e) => {
            // Allow only digits
            if (!/\d/.test(e.key)) {
                e.preventDefault();
            }
        }}
    />
</Form.Item>
                            </div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-md-6">
                              <Form.Item
    label="Alternate Mobile Number"
    name="alternate_mobile_number"
    rules={[
        { pattern: /^\d{10}$/, message: 'Must be 10 digits' }
    ]}
>
    <InputWithAddon
        icon={<PhoneOutlined />}
        placeholder="10 digit alternate mobile number (optional)"
        maxLength={10}
        onKeyPress={(e) => {
            // Allow only digits
            if (!/\d/.test(e.key)) {
                e.preventDefault();
            }
        }}
    />
</Form.Item>
                            </div>

                            <div className="col-md-6">
                               <Form.Item
    label="Email ID"
    name="email_id"
    rules={[
        { required: true, message: 'Please enter email' },
        { type: 'email', message: 'Please enter valid email' },
        { 
            pattern: /^[a-z][a-z0-9._-]*@[a-z0-9.-]+\.[a-z]{2,}$/, 
            message: 'Enter correct format' 
        }
    ]}
>
    <InputWithAddon
        icon={<MailOutlined />}
        placeholder="example@email.com"
        onKeyPress={(e) => {
            // Prevent uppercase letters
            if (/[A-Z]/.test(e.key)) {
                e.preventDefault();
            }
        }}
        onChange={(e) => {
            // Convert to lowercase
            e.target.value = e.target.value.toLowerCase();
        }}
    />
</Form.Item>
                            </div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-md-6">
                                <Form.Item
    label="Profession"
    name="profession"
    rules={[
        { required: true, message: 'Please enter profession' },
        { pattern: /^[A-Za-z\s]+$/, message: 'Must contain alphabets only' }
    ]}
>
    <InputWithAddon
        icon={
            <img
                src={professionIcon}
                alt="Profession"
                style={{ width: 16, height: 16 }}
            />
        }
        placeholder="Enter profession"
        onKeyPress={(e) => {
            // Prevent numbers and special characters
            if (!/[A-Za-z\s]/.test(e.key)) {
                e.preventDefault();
            }
        }}
    />
</Form.Item>

                            </div>

                            <div className="col-md-6">
                               <Form.Item
    label="Aadhaar ID"
    name="aadhaar_id"
    rules={[
        { required: true, message: 'Please enter Aadhaar ID' },
        { pattern: /^\d{12}$/, message: 'Must be 12 digits' }
    ]}
>
    <InputWithAddon
        icon={<IdcardOutlined />}
        placeholder="12 digit Aadhaar number"
        maxLength={12}
        onKeyPress={(e) => {
            // Allow only digits
            if (!/\d/.test(e.key)) {
                e.preventDefault();
            }
        }}
    />
</Form.Item>
                            </div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-md-6">
                                <Form.Item
    label="PAN Number"
    name="pan_number"
    normalize={(value) => value ? value.toUpperCase() : value}
    rules={[
        { required: true, message: 'Please enter PAN number' },
        { 
            pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 
            message: 'Format:(e.g., ABCDE1234F)' 
        }
    ]}
>
    <InputWithAddon
        icon={<IdcardOutlined />}
        placeholder="ABCDE1234F"
        maxLength={10}
       
        onKeyPress={(e) => {
            const value = e.target.value || '';
            const key = e.key;
            
            // First 5 characters must be letters
            if (value.length < 5) {
                if (!/[A-Za-z]/.test(key)) {
                    e.preventDefault();
                }
            }
            // Next 4 characters (positions 5-8) must be digits
            else if (value.length >= 5 && value.length < 9) {
                if (!/\d/.test(key)) {
                    e.preventDefault();
                }
            }
            // Last character (position 9) must be a letter
            else if (value.length === 9) {
                if (!/[A-Za-z]/.test(key)) {
                    e.preventDefault();
                }
            }
        }}
       
        style={{ textTransform: "uppercase" }}
    />
</Form.Item>
                            </div>

                            <div className="col-md-6">
                                <Form.Item
                                    label="Address"
                                    name="address"
                                    rules={[
                                        { required: true, message: 'Please enter address' },
                                    ]}
                                >
                                    <Input.TextArea
                                        prefix={<IdcardOutlined />}
                                        placeholder="Enter address"
                                        autoSize={{ minRows: 2, maxRows: 6 }}
                                        size="large"

                                        allowClear
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        <Divider className="add-customer-divider" style={{ border: "1px solid #d9d9d9" }} />
                        <Divider orientation="center">Location Details</Divider>
                        {/* <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                            Location Details
                        </h3> */}

                        {/* Display info banner when fields are from localStorage */}
                        {/* {isFromLocalStorage && !params.id && (
                            <div style={{ 
                                marginBottom: '16px', 
                                padding: '12px', 
                                background: '#e6f7ff', 
                                border: '1px solid #91d5ff',
                                borderRadius: '4px'
                            }}>
                                <strong>Note:</strong> Branch, Line, and Area are pre-selected from your last selection and cannot be changed.
                            </div>
                        )} */}

                        {params.id && (
                            <div style={{
                                marginBottom: '16px',
                                padding: '12px',
                                background: '#fff7e6',
                                border: '1px solid #ffd591',
                                borderRadius: '4px'
                            }}>
                                <strong>Note:</strong> Branch, Line, and Area cannot be changed while editing a customer.
                            </div>
                        )}


<div className="row mb-2">
    {/* Branch Column */}
    <div className="col-md-4">
        {(isFromLocalStorage && !params.id) || params.id ? (
            <>
                <Form.Item
                    name="branch"
                    rules={[{ required: true, message: 'Please select branch' }]}
                    style={{ display: 'none' }}
                >
                    <Input type="hidden" />
                </Form.Item>
                <Form.Item label="Branch">
                    <InputWithAddon
                        icon={<BankOutlined />}
                        value={savedBranchName}
                        disabled
                        style={{
                            backgroundColor: '#f5f5f5',
                            color: '#000',
                            cursor: 'not-allowed'
                        }}
                    />
                </Form.Item>
            </>
        ) : (
            <Form.Item
                label="Branch"
                name="branch"
                rules={[{ required: true, message: 'Please select branch' }]}
            >
                <SelectWithAddon
                    icon={<ApartmentOutlined />}
                    placeholder="Select Branch"
                    showSearch
                    allowClear
                    onChange={handleBranchChange}
                    filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {branchList.map((branch) => (
                        <Option key={branch.id} value={branch.id}>
                            {branch.branch_name}
                        </Option>
                    ))}
                </SelectWithAddon>
            </Form.Item>
        )}
    </div>

    {/* Line Column */}
    <div className="col-md-4">
        {(isFromLocalStorage && !params.id) || params.id ? (
            <>
                <Form.Item
                    name="line"
                    rules={[{ required: true, message: 'Please select line' }]}
                    style={{ display: 'none' }}
                >
                    <Input type="hidden" />
                </Form.Item>
                <Form.Item label="Line">
                    <InputWithAddon
                        icon={<ApartmentOutlined />}
                        value={savedLineName}
                        disabled
                        style={{
                            backgroundColor: '#f5f5f5',
                            color: '#000',
                            cursor: 'not-allowed'
                        }}
                    />
                </Form.Item>
            </>
        ) : (
            <Form.Item
                label="Line"
                name="line"
                rules={[{ required: true, message: 'Please select line' }]}
            >
                <SelectWithAddon
                    icon={<ApartmentOutlined />}
                    placeholder="Select Line"
                    showSearch
                    allowClear
                    onChange={handleLineChange}
                    filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {filteredLineList.map((line) => (
                        <Option key={line.id} value={line.id}>
                            {line.name}
                        </Option>
                    ))}
                </SelectWithAddon>
            </Form.Item>
        )}
    </div>

    {/* Area Column */}
    <div className="col-md-4">
        {(isFromLocalStorage && !params.id) || params.id ? (
            <>
                <Form.Item
                    name="area"
                    rules={[{ required: true, message: 'Please select area' }]}
                    style={{ display: 'none' }}
                >
                    <Input type="hidden" />
                </Form.Item>
                <Form.Item label="Area">
                    <InputWithAddon
                        icon={<GlobalOutlined />}
                        value={savedAreaName}
                        disabled
                        style={{
                            backgroundColor: '#f5f5f5',
                            color: '#000',
                            cursor: 'not-allowed'
                        }}
                    />
                </Form.Item>
            </>
        ) : (
            <Form.Item
                label="Area"
                name="area"
                rules={[{ required: true, message: 'Please select area' }]}
            >
                <SelectWithAddon
                    icon={<GlobalOutlined />}
                    placeholder="Select Area"
                    showSearch
                    allowClear
                    filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {filteredAreaList.map((area) => (
                        <Option key={area.id} value={area.id}>
                            {area.name}
                        </Option>
                    ))}
                </SelectWithAddon>
            </Form.Item>
        )}
    </div>
</div>

                        <div className="row mb-2">
                            <div className="col-md-12">
                                <Form.Item
                                    label="Location"
                                    rules={[
                                        { required: true, message: 'Please select location' }
                                    ]}
                                >
                                    <InputWithAddon
                                        icon={<EnvironmentOutlined />}
                                        placeholder="Click map icon to select location"
                                        
                                        value={selectedLocation ? selectedLocation.address : ""}
                                        addonAfter={
                                            <Button
                                                type="text"
                                                icon={  <img
            src={isEditMode? locationIcon2: locationIcon1}
            alt="Location Icon"
            style={{ width: 18, height: 18 }}
        />}
                                                onClick={openMapModal}
                                                style={{ color: "#1890ff" }}
                                            />
                                        }
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        <Form.Item name="latitude" style={{ display: 'none' }}>
                            <Input type="hidden" />
                        </Form.Item>
                        <Form.Item name="longitude" style={{ display: 'none' }}>
                            <Input type="hidden" />
                        </Form.Item>
                        <Form.Item name="customer_order" style={{ display: 'none' }}>
                            <Input type="hidden" />
                        </Form.Item>

                       <Divider style={{ borderTop: "2px solid #d9d9d9" }} />

<Form.List name="reference_contacts">
    {(fields, { add, remove }) => (
        <>
            {fields.map(({ key, name, ...restField }, index) => (
                <div key={key}>
                    <Divider orientation="center">Reference Contact {index + 1}</Divider>
                    
                    <div className="row mb-2">
                        {/* Name Field */}
                        <div className="col-md-6">
                            <Form.Item
                                {...restField}
                                name={[name, 'reference_name']}
                                label="Name"
                                rules={[
                                    { min: 2, message: 'Name must be at least 2 characters' },
                                    { pattern: /^[A-Za-z\s]+$/, message: 'Must contain only alphabets' }
                                ]}
                            >
                                <InputWithAddon
                                    icon={<UserOutlined />}
                                    placeholder="Enter name"
                                    onKeyPress={(e) => {
                                        if (!/[A-Za-z\s]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </Form.Item>
                        </div>

                        {/* Mobile Number Field */}
                        <div className="col-md-6">
                            <Form.Item
                                {...restField}
                                name={[name, 'reference_number']}
                                label="Mobile Number"
                                rules={[
                                    { pattern: /^\d{10}$/, message: 'Must be 10 digits' }
                                ]}
                            >
                                <InputWithAddon
                                    icon={<PhoneOutlined />}
                                    placeholder="10 digit mobile number"
                                    maxLength={10}
                                    onKeyPress={(e) => {
                                        if (!/\d/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Description Field */}
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <Form.Item
                                {...restField}
                                name={[name, 'reference_description']}
                                label="Description"
                            >
                                <Input.TextArea
                                    placeholder="Enter description"
                                    autoSize={{ minRows: 1, maxRows: 6 }}
                                    size="large"
                                    allowClear
                                />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Remove Button */}
                    {fields.length > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                            <Button
                                type="primary"
                                danger
                                shape="circle"
                                icon={<MinusOutlined />}
                                onClick={() => remove(name)}
                                style={{
                                    width: 35,
                                    height: 35,
                                    backgroundColor: 'red',
                                    borderColor: 'red',
                                }}
                            />
                        </div>
                    )}
                </div>
            ))}

            {/* Add Button - Only show if less than 5 reference contacts */}
            {fields.length < 5 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<PlusOutlined />}
                        onClick={() => add()}
                        style={{
                            width: 35,
                            height: 35,
                            backgroundColor: '#28a745',
                            borderColor: '#28a745',
                            color: '#fff',
                        }}
                    />
                </div>
            )}
        </>
    )}
</Form.List>
                       

                        <div className="text-center mt-4">
                            <Space size="middle">
                                <Button
                                    size="large"
                                    onClick={() => navigate("/view-customer")}
                                >
                                    Cancel
                                </Button>

                                <Button type="primary" htmlType="submit" size="large">
                                    {params.id ? "Update Customer" : "Submit & Next"}
                                </Button>


                            </Space>
                            {/* {params.id && (
                                    <Button 
                                        danger
                                        size="large"
                                        onClick={handleDelete}
                                        style={{marginTop: '10px'}}
                                    >
                                        Delete 
                                    </Button>
                                )} */}
                        </div>
                    </div>
                </Form>
            )
        },
        {
            key: "2",
            label: (
                <span>
                    <FileTextOutlined />
                    Upload Doc
                </span>
            ),
            children: <AddCustomerDocument
                customerId={currentCustomerId || params.id}
                onPrevious={handlePreviousTab}
                onCancel={handleCancelForm}
            />,
        }
    ];

    return (
        <>
            {loader && <Loader />}

            <div className="add-customer-page-content">
                <div className="add-customer-container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="add-customer-header">
                                <h2 className="add-customer-title">
                                    {params.id ? "Edit Customer" : "Add New Customer"}
                                </h2>
                            </div>

                            <Tabs
                                activeKey={activeTab}
                                onChange={handleTabChange}
                                items={tabItems}
                                size="large"
                                type="card"
                                className="custom-tabs"
                            />

                            {/* Map Modal */}
                            {/* ... inside your return statement ... */}

                            <Modal
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                        <span>Select Customer Location</span>
                                    </div>
                                }
                                open={mapModalVisible}
                                onOk={handleMapModalOk}
                                onCancel={() => setMapModalVisible(false)}
                                width={900}
                                footer={
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                                        {/* ---- ROW 1: CLEAR + CURRENT LOCATION ---- */}
                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                            <div>
                                                {selectedLocation && (

                                                    <Button
                                                        icon={<ReloadOutlined />}
                                                        onClick={() => setSelectedLocation(null)}

                                                    />
                                                )}
                                            </div>

                                            <Button
                                                type="default"
                                                icon={<EnvironmentOutlined />}
                                                onClick={handleGetCurrentLocation}
                                            >
                                                Use Current Location
                                            </Button>
                                        </div>

                                        {/* ---- ROW 2: CANCEL + CONFIRM ---- */}
                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                            <Button onClick={() => setMapModalVisible(false)}>Cancel</Button>
                                            <Button
                                                type="primary"
                                                onClick={handleMapModalOk}
                                                disabled={!selectedLocation}
                                            >
                                                Confirm Location
                                            </Button>
                                        </div>

                                    </div>
                                }
                            >
                                <div style={{ marginBottom: '12px', padding: '10px', background: '#e6f7ff', borderRadius: '4px' }}>
                                    <span>! Click Anywhere on the map (or) Click "Use Current Location" button</span>
                                </div>

                                <LoadScript googleMapsApiKey="AIzaSyBqZO5W2UKl7m5gPxh0_KIjaRckuJ7VUsE">
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        center={mapCenter}
                                        zoom={15}
                                        onClick={handleMapClick}
                                        options={{
                                            zoomControl: true,
                                            streetViewControl: false,
                                            mapTypeControl: true,
                                            fullscreenControl: true,
                                            gestureHandling: 'greedy',
                                        }}
                                    >
                                        {selectedLocation && (
                                            <Marker
                                                position={{
                                                    lat: parseFloat(selectedLocation.lat),
                                                    lng: parseFloat(selectedLocation.lng)
                                                }}
                                                animation={window.google?.maps?.Animation?.DROP}
                                            />
                                        )}
                                        {selectedLocation && currentAccuracy && (
                                            <Circle
                                                center={{
                                                    lat: parseFloat(selectedLocation.lat),
                                                    lng: parseFloat(selectedLocation.lng),
                                                }}
                                                radius={currentAccuracy}   // radius in meters
                                                options={{
                                                    fillOpacity: 0.15,
                                                    strokeOpacity: 0.4,
                                                }}
                                            />
                                        )}

                                    </GoogleMap>
                                </LoadScript>

                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddCustomer;
