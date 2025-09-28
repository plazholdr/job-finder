"use client";
import { Button, Tabs, List, Tag, Typography, Space } from 'antd';

export default function NotificationsDropdownContent({
  notifs = [],
  token,
  onMarkAll,
  notifTab,
  setNotifTab,
  onItemClick,
  tokenColors,
}) {
  const directNotifs = notifs.filter(n => (n.channel || n.type || 'direct') !== 'watching');
  const watchingNotifs = notifs.filter(n => (n.channel || n.type) === 'watching');
  const unreadTag = (n) => (!n.read ? <Tag color="blue">Unread</Tag> : null);
  const statusTag = (n) => {
    const s = (n?.status || n?.state || '').toString().toLowerCase();
    const map = {
      'in progress': { text: 'In progress', color: 'blue' },
      'in_progress': { text: 'In progress', color: 'blue' },
      'action needed': { text: 'Action needed', color: 'orange' },
      'action_needed': { text: 'Action needed', color: 'orange' },
      'completed': { text: 'Completed', color: 'green' },
      'rejected': { text: 'Rejected', color: 'red' },
      'pending': { text: 'Pending', color: 'blue' },
      'active': { text: 'Active', color: 'green' },
    };
    const m = map[s];
    return m ? <Tag color={m.color}>{m.text}</Tag> : null;
  };

  return (
    <div style={{ width: 420, background: tokenColors.bg, borderRadius: tokenColors.radius, boxShadow: tokenColors.shadow, boxSizing: 'border-box' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding: '8px 12px', fontWeight: 600, borderBottom: `1px solid ${tokenColors.border}` }}>
        <span>Notifications</span>
        <Button type="link" size="small" onClick={onMarkAll}>Mark all as read</Button>
      </div>
      <Tabs size="small" activeKey={notifTab} onChange={setNotifTab} items={[
        { key: 'direct', label: 'Direct', children: (
          <div style={{ maxHeight: 420, overflowY: 'auto', padding: '8px 8px' }}>
            <List size="small" split={false} dataSource={directNotifs} renderItem={(n) => (
              <List.Item key={n._id} style={{ cursor:'pointer', padding: '8px 8px' }} onClick={() => onItemClick(n)}>
                <div style={{ display:'flex', gap: 8, width:'100%' }}>
                  <span style={{ width:8, height:8, marginTop: 6, flexShrink:0, borderRadius:'50%', backgroundColor: n.read ? tokenColors.border : tokenColors.primary, display:'inline-block' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', gap: 12 }}>
                      <Space size={6} wrap>
                        {unreadTag(n)}
                        <Typography.Text strong>{n.title || n.message || 'Notification'}</Typography.Text>
                        {statusTag(n)}
                      </Space>
                      <Space size={8} wrap>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(n.createdAt || Date.now()).toLocaleString()}
                        </Typography.Text>
                        {!n.read && <Button size="small" type="link" onClick={(e)=>{ e.stopPropagation(); onMarkAll([n._id]); }}>Mark as read</Button>}
                      </Space>
                    </div>
                    {(n.body || n.message) && <Typography.Text type="secondary">{n.body || n.message}</Typography.Text>}
                  </div>
                </div>
              </List.Item>
            )} />
          </div>
        ) },
        { key: 'watching', label: 'Watching', children: (
          <div style={{ maxHeight: 420, overflowY: 'auto', padding: '8px 8px' }}>
            <List size="small" split={false} dataSource={watchingNotifs} renderItem={(n) => (
              <List.Item key={n._id} style={{ cursor:'pointer', padding: '8px 8px' }} onClick={() => onItemClick(n)}>
                <div style={{ display:'flex', gap: 8, width:'100%' }}>
                  <span style={{ width:8, height:8, marginTop: 6, flexShrink:0, borderRadius:'50%', backgroundColor: n.read ? tokenColors.border : tokenColors.primary, display:'inline-block' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', gap: 12 }}>
                      <Space size={6} wrap>
                        {unreadTag(n)}
                        <Typography.Text strong>{n.title || n.message || 'Notification'}</Typography.Text>
                        {statusTag(n)}
                      </Space>
                      <Space size={8} wrap>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(n.createdAt || Date.now()).toLocaleString()}
                        </Typography.Text>
                        {!n.read && <Button size="small" type="link" onClick={(e)=>{ e.stopPropagation(); onMarkAll([n._id]); }}>Mark as read</Button>}
                      </Space>
                    </div>
                    {(n.body || n.message) && <Typography.Text type="secondary">{n.body || n.message}</Typography.Text>}
                  </div>
                </div>
              </List.Item>
            )} />
          </div>
        ) },
      ]} />
      <div style={{ position:'sticky', bottom: 0, background: tokenColors.bg, borderTop: `1px solid ${tokenColors.border}`, padding: 8, textAlign: 'center' }}>
        <a href="/notifications">View all</a>
      </div>
    </div>
  );
}

