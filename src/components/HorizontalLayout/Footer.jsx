import React from "react"

const Footer = () => {
  return (
    <React.Fragment>
      <footer 
        style={{
          position: 'relative',
          width: '100%',
          marginTop: 'auto',
          padding: '20px 0',
          backgroundColor: '#f8f9fa'
        }}
      >
        <div style={{ 
          padding: '0 15px', 
          width: '100%',
          maxWidth: '100%'
        }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            marginLeft: '-15px',
            marginRight: '-15px'
          }}>
            <div style={{ 
              flex: '0 0 auto',
              width: '100%',
              paddingLeft: '15px',
              paddingRight: '15px'
            }}>
              <div style={{ 
                textAlign: window.innerWidth >= 576 ? 'right' : 'center'
              }}>
                © {new Date().getFullYear()} - THINKTANK
              </div>
            </div>
          </div>
        </div>
      </footer>
    </React.Fragment>
  )
}

export default Footer