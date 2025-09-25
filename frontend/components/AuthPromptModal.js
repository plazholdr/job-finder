"use client";
import { Modal, Result, Button } from 'antd';
import { useRouter } from 'next/navigation';

export default function AuthPromptModal({
  open,
  onClose,
  title = "Sign in required",
  description = "Please sign in to continue with this action.",
  actionText = "Sign In"
}) {
  const router = useRouter();

  const handleSignIn = () => {
    onClose();
    router.push('/login');
  };

  const handleSignUp = () => {
    onClose();
    router.push('/register');
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered={true}
      width={400}
      closable={true}
      maskClosable={true}
      styles={{
        body: {
          padding: '16px 20px 12px',
        },
        mask: {
          backdropFilter: 'blur(4px)',
        }
      }}
    >
      <Result
        status="info"
        title={<span style={{ fontSize: '18px', fontWeight: 600 }}>{title}</span>}
        subTitle={<span style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>{description}</span>}
        extra={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginTop: '16px'
          }}>
            <Button
              key="signin"
              type="primary"
              size="middle"
              onClick={handleSignIn}
              style={{
                width: '130px',
                height: '36px'
              }}
            >
              {actionText}
            </Button>
            <Button
              key="signup"
              size="middle"
              onClick={handleSignUp}
              style={{
                width: '130px',
                height: '36px'
              }}
            >
              Sign Up
            </Button>
          </div>
        }
        style={{
          padding: '8px 0'
        }}
      />
    </Modal>
  );
}
