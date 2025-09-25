"use client";
import { useState } from 'react';
import { Button, Space, Typography } from 'antd';
import AuthPromptModal from '../../components/AuthPromptModal';

export default function TestModalPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  const showLikeModal = () => {
    setModalConfig({
      title: "Like Job",
      description: "Please sign in to add this job to your like list. Companies will receive monthly reports about candidates who liked their jobs.",
      actionText: "Sign In to Like"
    });
    setModalOpen(true);
  };

  const showSaveModal = () => {
    setModalConfig({
      title: "Save Job",
      description: "Please sign in to save this job to your list. You'll be able to view all your saved jobs in your profile.",
      actionText: "Sign In to Save"
    });
    setModalOpen(true);
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center', minHeight: '100vh' }}>
      <Typography.Title level={2}>Optimized Auth Modal Demo</Typography.Title>
      <Typography.Paragraph style={{ marginBottom: '24px' }}>
        ✅ Smaller modal size (400px width)<br/>
        ✅ No cancel button - cleaner interface<br/>
        ✅ No page movement when modal opens<br/>
        ✅ Blur backdrop effect<br/>
        ✅ Mobile responsive design
      </Typography.Paragraph>
      <Typography.Paragraph>
        Click the buttons below to test the optimized modals:
      </Typography.Paragraph>

      <Space size="large">
        <Button type="primary" onClick={showLikeModal}>
          Test Like Modal
        </Button>
        <Button onClick={showSaveModal}>
          Test Save Modal
        </Button>
      </Space>

      <AuthPromptModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        description={modalConfig.description}
        actionText={modalConfig.actionText}
      />
    </div>
  );
}
