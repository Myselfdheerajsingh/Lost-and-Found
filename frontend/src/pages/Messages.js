import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getConversations, getMessages, sendMessage } from '../utils/api';
import { connectSocket, getSocket, disconnectSocket } from '../utils/socket';
import { useAuth } from '../context/AuthContext';
import './Messages.css';

export default function Messages() {
  const { convId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(convId || null);
  const [activeItem, setActiveItem] = useState(null);
  const [activeReceiver, setActiveReceiver] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef();

  const myId = user?._id || user?.id;

  useEffect(() => {
    const socket = connectSocket(myId);
    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => disconnectSocket();
  }, [myId]);

  useEffect(() => {
    getConversations()
      .then((res) => setConversations(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    getMessages(activeConv).then((res) => setMessages(res.data.data));
  }, [activeConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConv = (conv) => {
    setActiveConv(conv.conversationId || conv._id);
    setActiveItem(conv.item);
    const other = conv.sender?._id === myId ? conv.receiver : conv.sender;
    setActiveReceiver(other);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeReceiver) return;

    const msg = {
      receiverId: activeReceiver._id,
      itemId: activeItem?._id,
      text,
    };

    const res = await sendMessage(msg);
    setMessages((prev) => [...prev, res.data.data]);

    // Emit via socket for real-time delivery
    getSocket()?.emit('sendMessage', {
      senderId: myId,
      receiverId: activeReceiver._id,
      message: text,
      itemId: activeItem?._id,
    });

    setText('');
  };

  return (
    <div className="page messages-page">
      <div className="messages-layout">
        {/* Sidebar */}
        <div className="conv-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
            {conversations.length > 0 && (
              <span className="conv-count">{conversations.length}</span>
            )}
          </div>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="no-convs">
              <p>No conversations yet.</p>
              <p>Contact someone about a listed item to start chatting.</p>
            </div>
          ) : (
            <div className="conv-list">
              {conversations.map((conv) => {
                const other = conv.sender?._id === myId ? conv.receiver : conv.sender;
                const convKey = conv.conversationId || conv._id;
                return (
                  <div
                    key={convKey}
                    className={`conv-item ${activeConv === convKey ? 'active' : ''}`}
                    onClick={() => openConv({ ...conv, conversationId: convKey })}
                  >
                    <div className="conv-avatar">
                      {other?.avatar
                        ? <img src={other.avatar} alt={other.name} />
                        : other?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="conv-info">
                      <div className="conv-name">{other?.name || 'User'}</div>
                      {conv.item && (
                        <div className="conv-item-name">Re: {conv.item.title}</div>
                      )}
                      <div className="conv-last">{conv.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat pane */}
        <div className="chat-pane">
          {!activeConv ? (
            <div className="chat-empty">
              <span style={{ fontSize: 48 }}>💬</span>
              <h3>Select a conversation</h3>
              <p>Choose from your message threads on the left</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-avatar">
                  {activeReceiver?.avatar
                    ? <img src={activeReceiver.avatar} alt="" />
                    : activeReceiver?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="chat-name">{activeReceiver?.name}</div>
                  {activeItem && (
                    <Link to={`/item/${activeItem._id}`} className="chat-item-link">
                      {activeItem.type === 'lost' ? '🔴' : '🟢'} {activeItem.title}
                    </Link>
                  )}
                </div>
              </div>

              <div className="chat-messages">
                {messages.map((msg, i) => {
                  const isMe = (msg.sender?._id || msg.senderId) === myId;
                  return (
                    <div key={msg._id || i} className={`msg-row ${isMe ? 'me' : 'them'}`}>
                      {!isMe && (
                        <div className="msg-avatar">
                          {msg.sender?.avatar
                            ? <img src={msg.sender.avatar} alt="" />
                            : msg.sender?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="msg-bubble">
                        <div className="msg-text">{msg.text}</div>
                        <div className="msg-time">
                          {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                  className="chat-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit" className="btn btn-primary chat-send-btn" disabled={!text.trim()}>
                  Send ➤
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
