import React, { useState, useEffect } from "react";
import { Descriptions, Modal, Button, Alert, Spin } from "antd";
import pdfIcon from "../../assets/icons/pdf.png";
import imageIcon from "../../assets/icons/image.png";
import excelIcon from "../../assets/icons/excel.png";
import wordIcon from "../../assets/icons/word.png";
import defaultIcon from "../../assets/icons/default.png";
import "./BranchCollapseContent.css";

// ========== SECURITY CONFIGURATION ==========
// Google Cloud Storage domains
const ALLOWED_DOMAINS = [
  'storage.googleapis.com',
  'storage.cloud.google.com',
];

const BLOCKED_EXTENSIONS = ['svg', 'xml', 'html', 'htm', 'js', 'exe', 'bat', 'sh', 'scr', 'vbs'];
const BLOCKED_MIME_TYPES = [
  'image/svg+xml',
  'text/html',
  'application/javascript',
  'application/x-javascript',
  'text/xml',
  'application/x-msdownload',
  'application/x-sh'
];

// ========== SECURITY UTILITIES ==========
const isUrlSafe = (url) => {
  try {
    const urlObj = new URL(url);
    
    // Only allow HTTPS
    if (urlObj.protocol !== 'https:') {
      return { safe: false, reason: 'Only HTTPS URLs are allowed' };
    }
    
    // Check against allowlist
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
    
    if (!isAllowed) {
      return { safe: false, reason: 'URL not from trusted domain' };
    }
    
    // Check for Google Cloud Storage signed URL signature
    if (urlObj.hostname.includes('googleapis.com')) {
      const hasRequiredParams = urlObj.searchParams.has('Expires') && 
                                urlObj.searchParams.has('GoogleAccessId') && 
                                urlObj.searchParams.has('Signature');
      if (!hasRequiredParams) {
        return { safe: false, reason: 'Invalid signed URL format' };
      }
      
      // Check expiration
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
  
  // For signed URLs, extract the actual filename before query params
  const cleanUrl = url.split("?")[0].toLowerCase();
  const pathParts = cleanUrl.split('/');
  const filename = pathParts[pathParts.length - 1];
  const extension = filename.split('.').pop();
  
  // Block dangerous extensions
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
    // For signed URLs, we'll skip HEAD request due to CORS
    // Instead rely on file extension and let browser handle loading
    const extension = getFileTypeFromUrl(url);
    
    if (extension === "blocked") {
      return { safe: false, reason: 'Blocked file type for security' };
    }
    
    // Return the type based on extension
    return { 
      safe: true, 
      type: extension,
      skipVerification: true // Flag that we skipped server verification
    };
    
  } catch (error) {
    console.error('Content-Type verification failed:', error);
    return { safe: true, type: 'unknown', warning: 'Could not verify file type' };
  }
};

// ========== SECURE PREVIEW COMPONENTS ==========
const SecureImagePreview = ({ url }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Force timeout after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn("Image load timeout:", url);
        setImageError(true);
        setIsLoading(false);
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [isLoading]);

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
    <div className="secure-image-container">
      {isLoading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin tip="Loading image..." />
        </div>
      )}

      <img
        src={url}
        alt="Preview"
        className="image-preview"
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
        }}
      />
    </div>
  );
};


const SecurePDFPreview = ({ url }) => {
  const [pdfError, setPdfError] = useState(false);
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);

  // Google Docs Viewer can sometimes bypass CORS issues
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="secure-pdf-container">
      {/* <Alert
        message="PDF Document"
        description="If the preview doesn't load, click the button below to open in a new tab."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      /> */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Button 
          type="primary" 
          onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
        >
          Open PDF in New Tab
        </Button>
        {pdfError && !useGoogleViewer && (
          <Button 
            onClick={() => setUseGoogleViewer(true)}
          >
            Try Google Viewer
          </Button>
        )}
      </div>
      
      {!pdfError && !useGoogleViewer ? (
        <iframe
          src={url}
          title="PDF Preview"
          width="100%"
          height="500px"
          className="pdf-preview"
          style={{ border: '1px solid #d9d9d9', borderRadius: 4 }}
          onError={() => {
            console.error('PDF iframe failed to load');
            setPdfError(true);
          }}
        />
      ) : useGoogleViewer ? (
        <iframe
          src={googleViewerUrl}
          title="PDF Preview (Google Viewer)"
          width="100%"
          height="500px"
          className="pdf-preview"
          style={{ border: '1px solid #d9d9d9', borderRadius: 4 }}
          onError={() => {
            console.error('Google Viewer also failed');
            setPdfError(true);
            setUseGoogleViewer(false);
          }}
        />
      ) : (
        <Alert
          message="PDF preview unavailable"
          description="The PDF could not be embedded due to CORS restrictions. Please use the button above to open it in a new tab."
          type="warning"
          showIcon
        />
      )}
    </div>
  );
};

// ========== MAIN COMPONENT ==========
const BranchCollapseContent = ({ branch, details }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const [verificationWarning, setVerificationWarning] = useState(null);

  if (!branch || !details) {
    return (
      <div className="branch-loading-container">
        <Spin tip="Loading branch details..." />
      </div>
    );
  }

  const agreementCerts = Array.isArray(details?.agreement_certificate)
    ? details.agreement_certificate
    : [];
  const additionalCerts = Array.isArray(details?.additional_details)
    ? details.additional_details
    : [];

  const truncateText = (text, maxLength = 13) =>
    !text
      ? "No description available"
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

  const handleOpenFile = async (url) => {
    console.log('Opening file:', url);
    setIsVerifying(true);
    setVerificationError(null);
    setVerificationWarning(null);

    try {
      // Step 1: URL safety check
      const urlCheck = isUrlSafe(url);
      if (!urlCheck.safe) {
        setVerificationError(urlCheck.reason);
        setIsVerifying(false);
        return;
      }

      // Step 2: Extension check
      const extensionType = getFileTypeFromUrl(url);
      if (extensionType === "blocked") {
        setVerificationError('This file type is blocked for security reasons');
        setIsVerifying(false);
        return;
      }

      // Step 3: Content-Type verification (simplified for CORS)
      const contentCheck = await verifyContentType(url);
      if (!contentCheck.safe) {
        setVerificationError(contentCheck.reason);
        setIsVerifying(false);
        return;
      }

      // All checks passed
      setSelectedFile(url);
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

  const renderPreview = () => {
    if (!selectedFile) return <p>No file selected</p>;

    switch (fileType) {
      case "pdf":
        return <SecurePDFPreview url={selectedFile} />;
      
      case "image":
        return <SecureImagePreview url={selectedFile} />;
      
      case "excel":
      case "word":
        return (
          <div className="unsupported-file-container" style={{ textAlign: 'center', padding: 40 }}>
            <Alert
              message={`${fileType === "excel" ? "Excel" : "Word"} File`}
              description="Preview not supported for this file type. Click below to download or open in a new tab."
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
              // crossOrigin="anonymous"
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
              description="This file type cannot be previewed in the browser."
              type="warning"
              showIcon
            />
            <Button 
              type="primary" 
              size="large"
              style={{ marginTop: 16 }}
              onClick={() => window.open(selectedFile, '_blank', 'noopener,noreferrer')}
            >
              Download or Open in New Tab
            </Button>
          </div>
        );
    }
  };

  return (
    <>
      <div className="branch-content-container">
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 2, md: 3 }}
          labelStyle={{
            
            fontWeight: 600,
            backgroundColor: "#e5e4e4",
            width: "140px",
            minWidth: "100px",
            padding: '5px'
          }}
          contentStyle={{
            backgroundColor: "#ffffff",
           
            width: "200px",
            minWidth: "130px",
            overflow: "hidden",
            textOverflow: "ellipsis",
           padding: '5px'
          }}
        >
          <Descriptions.Item label="Code" span={1}>
            {details.branch_code}
          </Descriptions.Item>

          <Descriptions.Item label="Name" span={1}>
            {branch.branch_name}
          </Descriptions.Item>

          <Descriptions.Item label="Address" span={3}>
            {branch.branch_address}
          </Descriptions.Item>

          {(agreementCerts.length > 0 || additionalCerts.length > 0) && (
            <>
              {agreementCerts.map((cert, index) => {
                const iconUrl = getFileIcon(cert.signed_url);
                return (
                  <Descriptions.Item
                    key={`agreement-${index}`}
                    label="Agreement"
                    span={1}
                  >
                    <div className="file-item-container">
                      <img src={iconUrl} alt="File Icon" width={20} height={20} />
                      <span
                        onClick={() => handleOpenFile(cert.signed_url)}
                        className="file-link"
                        title={details.agreement_description}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOpenFile(cert.signed_url);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {truncateText(details.agreement_description)}
                      </span>
                    </div>
                  </Descriptions.Item>
                );
              })}

              {additionalCerts.map((file, index) => {
                const iconUrl = getFileIcon(file.signed_url);
                return (
                  <Descriptions.Item
                    key={`additional-${index}`}
                    label={`Certificate ${index + 1}`}
                    span={1}
                  >
                    <div className="file-item-container">
                      <img src={iconUrl} alt="File Icon" width={20} height={20} />
                      <span
                        onClick={() => handleOpenFile(file.signed_url)}
                        className="file-link"
                        title={file.additional_certifi_description}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOpenFile(file.signed_url);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {truncateText(file.additional_certifi_description)}
                      </span>
                    </div>
                  </Descriptions.Item>
                );
              })}
            </>
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

      <Modal
        title="Document Preview"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Close
          </Button>,
        ]}
        width={800}
        centered
        destroyOnClose
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
                style={{ marginBottom: 16 }}
              />
            )}
            {renderPreview()}
          </>     
        )}
      </Modal>
    </>
  );
};

export default BranchCollapseContent;