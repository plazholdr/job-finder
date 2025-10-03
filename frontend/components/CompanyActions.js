"use client";
import { useState, useEffect } from "react";
import { Button, Space, message } from "antd";
import { LikeOutlined, LikeFilled } from "@ant-design/icons";
import { apiAuth, getToken } from "../lib/api";
import { API_BASE_URL } from "../config";

export default function CompanyActions({ companyId }) {
  const [liked, setLiked] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfLiked();
  }, [companyId]);

  async function checkIfLiked() {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/favorites?companyId=${companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const favs = Array.isArray(data) ? data : data.data || [];
        if (favs.length > 0) {
          setLiked(true);
          setFavoriteId(favs[0]._id);
        }
      }
    } catch (err) {
      // Silently fail - user just won't see liked state
    }
  }

  async function toggleLike() {
    const token = getToken();
    if (!token) {
      message.info('Please sign in to like companies');
      return;
    }

    setLoading(true);
    try {
      if (!liked) {
        // Like the company
        const created = await apiAuth('/favorites', { method: 'POST', body: { companyId } });
        setLiked(true);
        setFavoriteId(created?._id || created?.id || null);
        message.success('Added to favorites');
      } else {
        // Unlike the company
        if (favoriteId) {
          await apiAuth(`/favorites/${favoriteId}`, { method: 'DELETE' });
        }
        setLiked(false);
        setFavoriteId(null);
        message.success('Removed from favorites');
      }
    } catch (err) {
      if (/Not signed/.test(err.message)) {
        message.info('Please sign in');
      } else {
        message.error('Action failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Space>
      <Button
        onClick={toggleLike}
        loading={loading}
        type={liked ? "primary" : "default"}
        icon={liked ? <LikeFilled /> : <LikeOutlined />}
        style={{
          borderRadius: 4,
          fontWeight: 500,
          ...(liked ? {} : {
            backgroundColor: 'white',
            borderColor: '#d9d9d9',
            color: 'rgba(0, 0, 0, 0.88)'
          })
        }}
      >
        {liked ? 'Liked' : 'Like'}
      </Button>
    </Space>
  );
}

