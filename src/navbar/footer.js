import React from "react";
import { Col, Row } from "react-bootstrap";

const Footer = () => (
  <Row
    style={{
      position: "fixed",
      bottom: "0",
      padding: "10px",
      width: "110%",
      backgroundColor: "#111827",
      zIndex: "5",
    }}
  >
    <Col xs="12" md="12" lg="6" className="text-center">
      <div style={{ color: "#fff" }}>
        <a
          href="https://twitter.com/wenbread"
          style={{ color: "#fff" }}
        >
          Twitter
        </a>
      </div>
    </Col>

    <Col xs="12" md="12" lg="6" className="text-center">
      <div style={{ color: "#fff" }}>
        <a
          href="https://discord.com/invite/EZ3csTG6vh"
          target={'_blank'}
          style={{ color: "#fff" }} rel="noreferrer"
        >
          Discord
        </a>
      </div>
    </Col>
  </Row>
);

export default Footer;
