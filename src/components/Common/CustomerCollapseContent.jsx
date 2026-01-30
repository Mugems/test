import React, { useState, useEffect } from "react";
import { Descriptions, Modal, Button, Alert, Spin, Tag } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import pdfIcon from "../../assets/icons/pdf.png";
import imageIcon from "../../assets/icons/image.png";
import excelIcon from "../../assets/icons/excel.png";
import wordIcon from "../../assets/icons/word.png";
import defaultIcon from "../../assets/icons/default.png";
import LocationMapModal from "./LocationMapModal"; 
import location2 from "../../assets/icons/location (1).png"
import linkIcon from "../../assets/icons/link.png"

// ========== SECURITY CONFIGURATION ==========
const ALLOWED_DOMAINS = [
  'storage.googleapis.com',
  'storage.cloud.google.com',
];

const BLOCKED_EXTENSIONS = ['svg', 'xml', 'html', 'htm', 'js', 'exe', 'bat', 'sh', 'scr', 'vbs'];

// ========== SECURITY UTILITIES ==========
const isUrlSafe = (url) => {
  try {
    const urlObj = new URL(url);
    
    if (urlObj.protocol !== 'https:') {
      return { safe: false, reason: 'Only HTTPS URLs are allowed' };
    }
    
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
    
    if (!isAllowed) {
      return { safe: false, reason: 'URL not from trusted domain' };
    }
    
    if (urlObj.hostname.includes('googleapis.com')) {
      const hasRequiredParams = urlObj.searchParams.has('Expires') && 
                                urlObj.searchParams.has('GoogleAccessId') && 
                                urlObj.searchParams.has('Signature');
      if (!hasRequiredParams) {
        return { safe: false, reason: 'Invalid signed URL format' };
      }
      
      const expires = parseInt(urlObj.searchParams.get('Expires'));
      const now = Math.floor(Date.now() / 1000);
      if (expires < now) {
        return { safe: false, reason: 'Signed URL has expired' };
      }
    }
    
    return { safe: true };
  } catch (e) {
    return { safe: false, reason: 'Invalid URL format' };
  }
};

const getFileTypeFromUrl = (url) => {
  if (!url) return "unknown";
  
  const cleanUrl = url.split("?")[0].toLowerCase();
  const pathParts = cleanUrl.split('/');
  const filename = pathParts[pathParts.length - 1];
  const extension = filename.split('.').pop();
  
  if (BLOCKED_EXTENSIONS.includes(extension)) {
    return "blocked";
  }
  
  if (extension === 'pdf') return "pdf";
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)) return "image";
  if (['xls', 'xlsx', 'csv'].includes(extension)) return "excel";
  if (['doc', 'docx'].includes(extension)) return "word";
  if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) return "video";
  
  return "unknown";
};

const verifyContentType = async (url) => {
  try {
    const extension = getFileTypeFromUrl(url);
    
    if (extension === "blocked") {
      return { safe: false, reason: 'Blocked file type for security' };
    }
    
    return { 
      safe: true, 
      type: extension,
      skipVerification: true
    };
    
  } catch (error) {
    console.error('Content-Type verification failed:', error);
    return { safe: true, type: 'unknown', warning: 'Could not verify file type' };
  }
};

// ========== SECURE PREVIEW COMPONENTS ==========
// Updated SecureImagePreview component with description
const SecureImagePreview = ({ url, description }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn("Image load timeout:", url);
        setImageError(true);
        setIsLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [isLoading, url]);

  if (imageError) {
    return (
      <Alert
        message="Failed to load image"
        description={
          <>
            <p>The image could not be displayed.</p>
            <Button 
              type="primary"
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
            >
              Open in New Tab
            </Button>
          </>
        }
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {/* Compact alert with description */}
      {description && (
        <Alert
          message={description || "Image Preview"}
          type="info"
          showIcon
          style={{ marginBottom: 8,marginTop: '30px', padding: '4px 12px' }}
        />
      )}

      {/* Loading spinner */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin tip="Loading image..." />
        </div>
      )}

      {/* Image */}
      <img
        src={url}
        alt={description || "Preview"}
        onError={() => {
          console.error("Image failed:", url);
          setImageError(true);
          setIsLoading(false);
        }}
        onLoad={() => {
          console.log("Image loaded:", url);
          setIsLoading(false);
        }}
        style={{
          display: isLoading ? "none" : "block",
          maxWidth: "100%",
          height: "auto",
          border: '1px solid #d9d9d9',
          borderRadius: 4
        }}
      />
    </div>
  );
};
const SecurePDFPreview = ({ url,description }) => {
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {/* Compact button section */}
      <div style={{ marginBottom: 8, marginTop: '5px', display: 'flex', gap: 8 }}>
        <Button 
          type="primary" 
          size="small"
          onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
          icon={<img src={linkIcon} alt="open" style={{ width: 14, height: 14 }} />}
        />
        
      </div>
      
      {/* Compact alert */}
      <Alert
        message={description || "Document Preview"}
        type="info"
        showIcon
        style={{ marginBottom: 8, padding: '4px 12px' }}
      />

      {/* Full height iframe */}
      <iframe
        src={googleViewerUrl}
        title="PDF Preview"
        width="100%"
        height="600px"
        style={{ 
          border: '1px solid #d9d9d9', 
          borderRadius: 4,
          display: 'block',
          margin: 0
        }}
      />
    </div>
  );
};

// ========== MAIN COMPONENT ==========
const CustomerCollapseContent = ({ customer, areaIdToNameMap, documents = [] }) => {
  console.log(customer)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const [verificationWarning, setVerificationWarning] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
 
const [selectedFileDescription, setSelectedFileDescription] = useState(""); // New state


  if (!customer) return null;

  const areaName = areaIdToNameMap?.[customer.area] || `Area ${customer.area}` || "N/A";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text, maxLength = 13) =>
    !text
      ? "No description"
      : text.length > maxLength
        ? `${text.slice(0, maxLength)}...`
        : text;

  const getFileIcon = (url) => {
    const type = getFileTypeFromUrl(url);
    switch (type) {
      case "pdf": return pdfIcon;
      case "image": return imageIcon;
      case "word": return wordIcon;
      case "excel": return excelIcon;
      default: return defaultIcon;
    }
  };

  // Helper to get document label based on type
  const getDocumentLabel = (doc) => {
    const typeLabels = {
      'aadhaar': 'Aadhaar Card:',
      'pan': 'PAN Card:',
      'voter_id': 'Voter ID:',
      'driving_license': 'Driving License:',
      'passport': 'Passport:',
      'bank_statement': 'Bank Statement:',
      'address_proof': 'Address Proof:',
      'location_photo': 'Loc_Photo:',
      'other': 'Document:'
    };
    return typeLabels[doc.document_type?.toLowerCase()] || `Document:`;
  };

  const handleOpenFile = async (url,description) => {
    console.log('Opening file:', url);
    setIsVerifying(true);
    setVerificationError(null);
    setVerificationWarning(null);

    try {
      const urlCheck = isUrlSafe(url);
      if (!urlCheck.safe) {
        setVerificationError(urlCheck.reason);
        setIsVerifying(false);
        return;
      }

      const extensionType = getFileTypeFromUrl(url);
      if (extensionType === "blocked") {
        setVerificationError('This file type is blocked for security reasons');
        setIsVerifying(false);
        return;
      }

      const contentCheck = await verifyContentType(url);
      if (!contentCheck.safe) {
        setVerificationError(contentCheck.reason);
        setIsVerifying(false);
        return;
      }

      setSelectedFile(url);
      setSelectedFileDescription(description);
      setFileType(contentCheck.type || extensionType);
      setIsModalOpen(true);
      
    } catch (error) {
      console.error('Error opening file:', error);
      setVerificationError('An error occurred while opening the file');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setFileType("");
    setVerificationError(null);
    setVerificationWarning(null);
  };

  const handleViewLocation = () => {
    setShowLocationModal(true);
  };

  const renderPreview = () => {
    if (!selectedFile) return <p>No file selected</p>;

    switch (fileType) {
      case "pdf":
        return <SecurePDFPreview url={selectedFile} description={selectedFileDescription} />;
      
      case "image":
        return <SecureImagePreview url={selectedFile}  description={selectedFileDescription} />;
      
      case "excel":
      case "word":
        return (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Alert
              message={`${fileType === "excel" ? "Excel" : "Word"} File`}
              description="Preview not supported for this file type."
              type="info"
              showIcon
            />
            <Button 
              type="primary" 
              size="large"
              style={{ marginTop: 16 }}
              onClick={() => window.open(selectedFile, '_blank', 'noopener,noreferrer')}
            >
              Open {fileType === "excel" ? "Excel" : "Word"} File
            </Button>
          </div>
        );

      case "video":
        return (
          <div style={{ textAlign: 'center' }}>
            <video 
              controls 
              style={{ maxWidth: '100%', maxHeight: '500px' }}
              controlsList="nodownload"
            >
              <source src={selectedFile} />
              Your browser does not support video playback.
            </video>
          </div>
        );

      default:
        return (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Alert
              message="Preview not available"
              description="This file type cannot be previewed."
              type="warning"
              showIcon
            />
            <Button 
              type="primary" 
              size="large"
              style={{ marginTop: 16 }}
              onClick={() => window.open(selectedFile, '_blank', 'noopener,noreferrer')}
            >
              Open in New Tab
            </Button>
          </div>
        );
    }
  };

  return (
    <>
      <div style={{ background: "#fff", padding: "0px 0px" }}>
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 2, md: 3 }}
          labelStyle={{
            fontSize: '18px',
            fontWeight: 600,
            background: "#e5e4e4ff",
            width: "140px",
          }}
          contentStyle={{
            fontSize: '18px',
            fontWeight: 600
          }}
        >
          {/* Basic Information */}
          <Descriptions.Item label="Customer ID:">
            {customer.customer_id || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Customer Code:">
            {customer.customer_code || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Customer Order:">
            {customer.customer_order || "N/A"}
          </Descriptions.Item>
          
          <Descriptions.Item label="Name:">
            {customer.customer_name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Profession:">
            {customer.profession || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Email:">
            {customer.email_id || "N/A"}
          </Descriptions.Item>

          {/* Contact Information */}
          <Descriptions.Item label="Mobile:">
            {customer.mobile_number || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Alternate Mobile:">
            {customer.alternate_mobile_number || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Aadhaar ID:">
            {customer.aadhaar_id || "N/A"}
          </Descriptions.Item>

          {/* Document Information */}
          <Descriptions.Item label="PAN Number:">
            {customer.pan_number || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Guarantor:">
            {customer.guarantor || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Branch ID:">
            {customer.branch || "N/A"}
          </Descriptions.Item>

          {/* Location Information */}
          <Descriptions.Item label="Line ID:">
            {customer.line || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Area:">
            {areaName}
          </Descriptions.Item>
          <Descriptions.Item label="Geolocation">
            {customer.location_latitude && customer.location_longitude ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* <span>{`${parseFloat(customer.latitude).toFixed(6)}, ${parseFloat(customer.longitude).toFixed(6)}`}</span> */}
                <Button
                  type="link"
                  size="small"
                   icon={<img src={location2} alt="location" style={{ width: 18, height: 18 }} />}
                  onClick={handleViewLocation}
                  style={{ padding: 0,fontSize: '18px' }}
                >
                  Saved Location
                </Button>
              </div>
            ) : (
              "N/A"
            )}
          </Descriptions.Item>

          {/* Address - Full Width */}
          {customer.address && (
            <Descriptions.Item label="Address:" span={{ xs: 1, sm: 2, md: 3 }}>
              {customer.address}
            </Descriptions.Item>
          )}
          {/* Reference Contacts Section */}
{customer.reference_contactdetails && customer.reference_contactdetails.length > 0 ? (
  customer.reference_contactdetails.map((ref, index) => (
    <Descriptions.Item 
      key={`ref-${index}`} 
      label={`Reference ${index + 1}:`}
      span={{ xs: 1, sm: 2, md: 3 }} 
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <Tag color="blue" style={{ fontSize: '18px', fontWeight: 500 }}>
          Name : {ref.name || "N/A"}
        </Tag>
        <Tag color="gold" style={{ fontSize: '18px', fontWeight: 500 }}>
          Mobile : {ref.phone || "N/A"}
        </Tag>
        <Tag color="magenta" style={{ fontSize: '18px', fontWeight: 500 }}>
          Desc: {ref.description || "N/A"}
        </Tag>
      </div>
    </Descriptions.Item>
  ))
) : null}

          {/* Document Attachments */}
          {documents && documents.length > 0 && documents.map((doc, index) => {
            // Handle different URL field names
            const fileUrl = doc.file_url || doc.signed_url || doc.url;
            const description = doc.document_description || doc.description || doc.name || 'Document';
            const label = doc.label || getDocumentLabel(doc);
            
            if (!fileUrl) return null;
            
            const iconUrl = getFileIcon(fileUrl);
            
            return (
              <Descriptions.Item
                key={`doc-${doc.id || index}`}
                label={label}
                span={1}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={iconUrl} alt="File Icon" width={20} height={20} />
                  <span
                    onClick={() => handleOpenFile(fileUrl,description)}
                    style={{
                      color: '#1890ff',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                    title={description}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenFile(fileUrl);
                      }
                    }}
                  >
                    <Tag color="green"  style={{ fontSize: "18px" }}>{truncateText(description)}</Tag>
                  </span>
                </div>
              </Descriptions.Item>
            );
          })}

          {/* Remarks - Full Width */}
          {customer.other_remarks && (
            <Descriptions.Item label="Remarks:" span={{ xs: 1, sm: 2, md: 3 }}>
              {customer.other_remarks}
            </Descriptions.Item>
          )}
          
        </Descriptions>

        {verificationError && (
          <Alert
            message="Security Warning"
            description={verificationError}
            type="error"
            showIcon
            closable
            onClose={() => setVerificationError(null)}
            style={{ marginTop: 16 }}
          />
        )}
      </div>

      {/* Document Preview Modal */}
      <Modal
        // title="Document Preview"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Close
          </Button>,
        ]}
        width={900}
        centered
        destroyOnClose
       
        style={{ top: "10px" }}
      >
        {isVerifying ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin tip="Verifying file security..." />
          </div>
        ) : (
          <>
            {verificationWarning && (
              <Alert
                message={verificationWarning}
                type="warning"
                showIcon
                closable
                style={{ marginBottom: 12, padding: '4px 12px' }}
              />
            )}
            {renderPreview()}
          </>
        )}
      </Modal>

      {/* Location Map Modal */}
      {customer.location_latitude && customer.location_longitude && (
        <LocationMapModal
          visible={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          initialLocation={{
            lat: parseFloat(customer.location_latitude).toFixed(6),
            lng: parseFloat(customer.location_longitude).toFixed(6),
            address: `${parseFloat(customer.location_latitude).toFixed(6)}, ${parseFloat(customer.location_longitude).toFixed(6)}`
          }}
          editable={false}
          showCurrentLocation={false}
          title="Customer Location"
        />
      )}
    </>
  );
};

export default CustomerCollapseContent;