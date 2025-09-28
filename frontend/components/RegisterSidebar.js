"use client";
import { Typography, Steps } from 'antd';

const { Title, Paragraph } = Typography;

export default function RegisterSidebar({ currentStep, steps }) {
  return (
    <div
      style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '60px 40px',
        color: 'white',
        position: 'relative'
      }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '30%',
          left: '5%',
          width: '60px',
          height: '60px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
        }}
      />

      {/* Main content */}
      <div style={{ zIndex: 2, marginBottom: '48px' }}>
        <Title level={1} style={{ color: 'white', marginBottom: '8px', fontSize: '2.5rem', fontWeight: 'bold' }}>
          Let's Get Your Account Set Up!
        </Title>
        <Title level={2} style={{ color: 'white', marginBottom: '16px', fontSize: '2rem' }}>
          
        </Title>
        <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', marginBottom: '0px', lineHeight: '1.6' }}>
          Student/Intern registration — complete the steps below, then check your email for verification.
        </Paragraph>
      </div>

      {/* Steps */}
      <div style={{ width: '100%', zIndex: 2 }}>
        <Steps
          direction="vertical"
          current={currentStep}
          size="small"
          items={steps.map((step, index) => ({
            ...step,
            icon: (
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: index <= currentStep
                    ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                    : 'rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: index === currentStep ? '2px solid rgba(255, 255, 255, 0.5)' : 'none'
                }}
              >
                {index + 1}
              </div>
            )
          }))}
        />
      </div>

      {/* Progress indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '40px',
          right: '40px',
        }}
      >
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          height: '4px',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '2px',
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              transition: 'width 0.3s ease'
            }}
          />
        </div>
        <Paragraph style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '12px',
          marginTop: '5px',
          marginBottom: 0
        }}>
          Step {currentStep + 1} of {steps.length}
        </Paragraph>
      </div>
    </div>
  );
}
