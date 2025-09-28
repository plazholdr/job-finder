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
          Let&apos;s Get Your Account Set Up!
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

"use client";
<<<<<<< HEAD
import { Typography, Progress } from 'antd';

const { Title, Text } = Typography;

export default function RegisterSidebar({ currentStep, steps, horizontal = false }) {
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  if (horizontal) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: '-25px',
            right: '-25px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 1
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-50px',
            left: '-50px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            zIndex: 1
          }}
        />

        {/* Left side - Title */}
        <div style={{ zIndex: 2 }}>
          <Title level={4} style={{ color: 'white', marginBottom: '4px', margin: 0 }}>
            Create your account
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </div>

        {/* Center - Horizontal Steps */}
        <div style={{ zIndex: 2, display: 'flex', alignItems: 'center', gap: '16px' }}>
          {steps.map((step, index) => (
            <div
              key={step.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: index <= currentStep
                    ? '#fff'
                    : 'rgba(255, 255, 255, 0.3)',
                  color: index <= currentStep
                    ? '#667eea'
                    : 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: index === currentStep
                    ? '2px solid rgba(255, 255, 255, 0.8)'
                    : '2px solid transparent'
                }}
              >
                {index + 1}
              </div>
              <Text
                style={{
                  color: index === currentStep
                    ? '#fff'
                    : 'rgba(255, 255, 255, 0.7)',
                  fontWeight: index === currentStep ? 'bold' : 'normal',
                  fontSize: '12px',
                  whiteSpace: 'nowrap'
                }}
              >
                {step.title}
              </Text>
              {index < steps.length - 1 && (
                <div
                  style={{
                    width: '20px',
                    height: '2px',
                    backgroundColor: index < currentStep
                      ? '#fff'
                      : 'rgba(255, 255, 255, 0.3)',
                    marginLeft: '8px'
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Right side - Progress */}
        <div style={{ zIndex: 2, minWidth: '120px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px' }}>
              {Math.round(progressPercent)}% Complete
            </Text>
          </div>
          <Progress
            percent={progressPercent}
            showInfo={false}
            strokeColor="#fff"
            trailColor="rgba(255, 255, 255, 0.2)"
            strokeWidth={4}
          />
        </div>
      </div>
    );
  }

=======
import { Typography, Steps } from 'antd';

const { Title, Paragraph } = Typography;

export default function RegisterSidebar({ currentStep, steps }) {
>>>>>>> 7fc63675107c481278ba130bfb81ec0ae2d419e9
  return (
    <div
      style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
<<<<<<< HEAD
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 1
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          zIndex: 1
        }}
      />

      {/* Content */}
      <div style={{ zIndex: 2 }}>
        <Title level={2} style={{ color: 'white', marginBottom: '8px' }}>
          Create your account
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
          Student/Intern registration — complete the steps below, then check your email for verification.
        </Text>
      </div>

      {/* Steps */}
      <div style={{ zIndex: 2, flex: 1, marginTop: '40px', marginBottom: '40px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: 'bold' }}>
            REGISTRATION STEPS
          </Text>
        </div>

        {steps.map((step, index) => (
          <div
            key={step.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: index === currentStep
                ? 'rgba(255, 255, 255, 0.2)'
                : 'transparent',
              border: index === currentStep
                ? '1px solid rgba(255, 255, 255, 0.3)'
                : '1px solid transparent',
              transition: 'all 0.3s ease'
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: index <= currentStep
                  ? '#fff'
                  : 'rgba(255, 255, 255, 0.3)',
                color: index <= currentStep
                  ? '#667eea'
                  : 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                marginRight: '12px'
              }}
            >
              {index + 1}
            </div>
            <Text
              style={{
                color: index === currentStep
                  ? '#fff'
                  : 'rgba(255, 255, 255, 0.7)',
                fontWeight: index === currentStep ? 'bold' : 'normal'
              }}
            >
              {step.title}
            </Text>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ zIndex: 2 }}>
        <div style={{ marginBottom: '12px' }}>
          <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
            Progress: {currentStep + 1} of {steps.length}
          </Text>
        </div>
        <Progress
          percent={progressPercent}
          showInfo={false}
          strokeColor="#fff"
          trailColor="rgba(255, 255, 255, 0.2)"
          strokeWidth={6}
        />
=======
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
>>>>>>> 7fc63675107c481278ba130bfb81ec0ae2d419e9
      </div>
    </div>
  );
}
