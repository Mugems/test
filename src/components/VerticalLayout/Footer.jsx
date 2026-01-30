import React from "react"
import { Container, Row, Col } from "reactstrap"

const Footer = () => {
  return (
    <React.Fragment>
      <footer className="footer">
        <Container fluid={true}>
          <Row>
            
            <Col md={6}>
              <div className="text-sm-end text-center d-none d-sm-block">
              
                  © {new Date().getFullYear()} Crafted {" "}
                  by THINKTANK
              
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </React.Fragment>
  )
}

export default Footer
