"use client";
import { useState } from "react";
import Footer from "../../components/Footer";
import { Layout, Row, Col } from "antd";
import RegisterWizard from "../../components/RegisterWizard";
import RegisterSidebar from "../../components/RegisterSidebar";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { key: 'account', title: 'Account' },
    { key: 'profile', title: 'Profile' },
    { key: 'education', title: 'Education' },
    { key: 'certs', title: 'Certifications' },
    { key: 'interests', title: 'Interests' },
    { key: 'work', title: 'Work' },
    { key: 'events', title: 'Events' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Row style={{ minHeight: '100vh' }}>
        {/* Left side - Sidebar with title and steps */}
        <Col xs={0} md={12} lg={12} xl={12}>
          <RegisterSidebar currentStep={currentStep} steps={steps} />
        </Col>

        {/* Right side - Register Form */}
        <Col xs={24} md={12} lg={12} xl={12}>
          <div
            style={{
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              backgroundColor: '#f5f5f5'
            }}
          >
            <div style={{ width: '100%', maxWidth: '500px' }}>
              <RegisterWizard onStepChange={setCurrentStep} />
            </div>
          </div>
        </Col>
      </Row>
    </Layout>
  );
}

