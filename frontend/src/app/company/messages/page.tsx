'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MessageSquare, 
  Send,
  Search,
  Filter,
  User,
  Clock,
  Mail,
  Phone,
  MoreHorizontal,
  Plus,
  Archive,
  Star,
  Reply,
  Forward,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { Message, MessageThread } from '@/types/company';

export default function CompanyMessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/company/messages/threads');
      const result = await response.json();

      if (result.success) {
        setThreads(result.data);
        if (result.data.length > 0 && !selectedThread) {
          setSelectedThread(result.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const response = await fetch(`/api/company/messages/threads/${threadId}`);
      const result = await response.json();

      if (result.success) {
        setMessages(result.data);
        // Mark thread as read
        markThreadAsRead(threadId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markThreadAsRead = async (threadId: string) => {
    try {
      await fetch(`/api/company/messages/threads/${threadId}/read`, {
        method: 'POST'
      });
      
      // Update local state
      setThreads(prevThreads =>
        prevThreads.map(thread =>
          thread.id === threadId ? { ...thread, unreadCount: 0 } : thread
        )
      );
    } catch (error) {
      console.error('Error marking thread as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || isSending) return;

    try {
      setIsSending(true);
      const response = await fetch('/api/company/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId: selectedThread.id,
          content: newMessage.trim(),
          senderId: 'current-company-user', // In real app, get from auth
          senderType: 'company'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessages(prevMessages => [...prevMessages, result.data]);
        setNewMessage('');
        
        // Update thread's last message
        setThreads(prevThreads =>
          prevThreads.map(thread =>
            thread.id === selectedThread.id
              ? { ...thread, lastMessage: result.data, lastMessageAt: new Date() }
              : thread
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'unread' && thread.unreadCount > 0) ||
                         (statusFilter === 'read' && thread.unreadCount === 0);

    return matchesSearch && matchesStatus;
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // 7 days
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                <p className="text-sm text-gray-600">Communicate with candidates</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/company/dashboard">
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
          {/* Threads List */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Conversations
                  </CardTitle>
                  <Badge variant="outline">
                    {threads.filter(t => t.unreadCount > 0).length} unread
                  </Badge>
                </div>
                
                {/* Search and Filter */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 text-sm"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="all">All Messages</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-0">
                <div className="space-y-1">
                  {filteredThreads.map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        selectedThread?.id === thread.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              thread.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {thread.candidate.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {thread.jobTitle}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-1">
                          <span className="text-xs text-gray-500">
                            {formatTime(thread.lastMessageAt)}
                          </span>
                          {thread.unreadCount > 0 && (
                            <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">
                              {thread.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {thread.lastMessage && (
                        <p className={`text-sm truncate ${
                          thread.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                        }`}>
                          {thread.lastMessage.senderType === 'company' ? 'You: ' : ''}
                          {thread.lastMessage.content}
                        </p>
                      )}
                    </div>
                  ))}
                  
                  {filteredThreads.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No conversations found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message View */}
          <div className="lg:col-span-2">
            {selectedThread ? (
              <Card className="h-full flex flex-col">
                {/* Thread Header */}
                <CardHeader className="pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedThread.candidate.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {selectedThread.candidate.email}
                          </span>
                          {selectedThread.candidate.phone && (
                            <span className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {selectedThread.candidate.phone}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Application for: {selectedThread.jobTitle}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link href={`/company/applications/${selectedThread.applicationId}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Application
                        </Button>
                      </Link>
                      
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderType === 'company' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderType === 'company'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderType === 'company'
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.sentAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex space-x-4">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 resize-none"
                      rows={3}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="self-end"
                    >
                      {isSending ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
