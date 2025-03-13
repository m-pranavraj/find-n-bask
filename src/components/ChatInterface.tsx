import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  item_id: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    full_name?: string;
    avatar_url?: string;
  };
  receiver?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface Contact {
  id: string;
  full_name: string;
  avatar_url: string | null;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface ChatInterfaceProps {
  itemId?: string;
  itemName?: string;
  receiverId?: string;
  receiverName?: string;
  recipientId?: string; // Added for backward compatibility
  claimId?: string; // Added for use in ClaimVerification
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  itemId,
  itemName,
  receiverId,
  receiverName,
  recipientId, // Support for legacy prop
}) => {
  const effectiveReceiverId = receiverId || recipientId; // Use receiverId with fallback to recipientId
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(effectiveReceiverId || null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;
    
    // Create subscription for real-time updates
    const subscription = supabase
      .channel('messages-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'item_messages',
        filter: `sender_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.new) {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'item_messages',
        filter: `receiver_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.new) {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
          // Update message read status if from current contact
          if (selectedContact === newMsg.sender_id) {
            markMessagesAsRead(newMsg.sender_id);
          }
        }
      })
      .subscribe();
    
    // Clean up subscription
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, selectedContact]);

  // Load contacts on mount or when user changes
  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  // Load messages for the selected contact
  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact);
      // If initial receiverId was provided, mark messages as read
      if (effectiveReceiverId === selectedContact) {
        markMessagesAsRead(selectedContact);
      }
    }
  }, [selectedContact, effectiveReceiverId]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Get unique contacts from sent and received messages
      const { data: sentMessages, error: sentError } = await supabase
        .from('item_messages')
        .select('receiver_id, content, created_at')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });
        
      const { data: receivedMessages, error: receivedError } = await supabase
        .from('item_messages')
        .select('sender_id, content, created_at, is_read')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });
        
      if (sentError || receivedError) throw sentError || receivedError;
      
      // Combine contacts and count unread messages
      const contactMap = new Map<string, Contact>();
      
      // Process sent messages
      if (sentMessages) {
        for (const msg of sentMessages) {
          if (!contactMap.has(msg.receiver_id)) {
            // Get profile info for this contact
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', msg.receiver_id)
              .single();
              
            if (profile) {
              contactMap.set(msg.receiver_id, {
                id: profile.id,
                full_name: profile.full_name || 'Unknown User',
                avatar_url: profile.avatar_url,
                lastMessage: msg.content,
                lastMessageTime: msg.created_at,
                unreadCount: 0
              });
            }
          }
        }
      }
      
      // Process received messages
      if (receivedMessages) {
        for (const msg of receivedMessages) {
          // Count unread messages
          if (!msg.is_read) {
            const current = contactMap.get(msg.sender_id);
            if (current) {
              current.unreadCount = (current.unreadCount || 0) + 1;
              contactMap.set(msg.sender_id, current);
            } else {
              // Get profile info for this new contact
              const { data: profile } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .eq('id', msg.sender_id)
                .single();
                
              if (profile) {
                contactMap.set(msg.sender_id, {
                  id: profile.id,
                  full_name: profile.full_name || 'Unknown User',
                  avatar_url: profile.avatar_url,
                  lastMessage: msg.content,
                  lastMessageTime: msg.created_at,
                  unreadCount: 1
                });
              }
            }
          } else if (!contactMap.has(msg.sender_id)) {
            // Get profile info for this contact
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', msg.sender_id)
              .single();
              
            if (profile) {
              contactMap.set(msg.sender_id, {
                id: profile.id,
                full_name: profile.full_name || 'Unknown User',
                avatar_url: profile.avatar_url,
                lastMessage: msg.content,
                lastMessageTime: msg.created_at,
                unreadCount: 0
              });
            }
          }
        }
      }
      
      // If receiverId is provided but not in contacts, add it
      if (effectiveReceiverId && !contactMap.has(effectiveReceiverId) && receiverName) {
        contactMap.set(effectiveReceiverId, {
          id: effectiveReceiverId,
          full_name: receiverName,
          avatar_url: null,
          unreadCount: 0
        });
      }
      
      // Convert map to array and sort by last message time
      setContacts(Array.from(contactMap.values()).sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      }));
      
      // Select first contact if none selected
      if (!selectedContact && contactMap.size > 0) {
        setSelectedContact(Array.from(contactMap.keys())[0]);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First, fetch the messages without joins to avoid relationship errors
      const { data, error } = await supabase
        .from('item_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        // For each message, fetch the sender and receiver profile data separately
        const messagesWithProfiles = await Promise.all(data.map(async (message) => {
          // Fetch sender profile
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', message.sender_id)
            .single();
          
          // Fetch receiver profile
          const { data: receiverData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', message.receiver_id)
            .single();
          
          return {
            ...message,
            sender: senderData || { full_name: 'Unknown', avatar_url: '' },
            receiver: receiverData || { full_name: 'Unknown', avatar_url: '' }
          };
        }));
        
        setMessages(messagesWithProfiles);
      }
      
      // Mark messages as read
      markMessagesAsRead(contactId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (senderId: string) => {
    if (!user) return;
    
    try {
      // Update all unread messages from this sender
      const { error } = await supabase
        .from('item_messages')
        .update({ is_read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
        
      if (error) throw error;
      
      // Update unread count in contacts
      setContacts(contacts.map(contact => 
        contact.id === senderId ? { ...contact, unreadCount: 0 } : contact
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedContact || !newMessage.trim()) return;
    
    try {
      const messageData = {
        content: newMessage,
        sender_id: user.id,
        receiver_id: selectedContact,
        item_id: itemId || null,
        is_read: false
      };
      
      const { error } = await supabase
        .from('item_messages')
        .insert(messageData);
        
      if (error) throw error;
      
      setNewMessage('');
      
      // Optimistic update (will be overwritten by the subscription)
      const newMsg: Message = {
        ...messageData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        sender: {
          full_name: user.full_name || 'You',
          avatar_url: user.avatar_url || ''
        }
      };
      
      setMessages(prev => [...prev, newMsg]);
      
      // Update contact's last message
      setContacts(contacts.map(contact => 
        contact.id === selectedContact 
          ? { 
              ...contact, 
              lastMessage: newMessage,
              lastMessageTime: new Date().toISOString()
            } 
          : contact
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleContactSelect = (contactId: string) => {
    setSelectedContact(contactId);
    markMessagesAsRead(contactId);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <Card className="w-full h-[calc(100vh-12rem)] max-h-[800px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 overflow-hidden p-0">
        {/* Contact List */}
        <div className="w-full sm:w-1/3 border-r overflow-y-auto p-2 max-h-full hidden sm:block">
          {contacts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground p-4">
              <p>No conversations yet</p>
            </div>
          ) : (
            contacts.map(contact => (
              <div 
                key={contact.id}
                onClick={() => handleContactSelect(contact.id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 relative ${
                  selectedContact === contact.id 
                    ? 'bg-primary/10' 
                    : 'hover:bg-muted'
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={contact.avatar_url || ''} alt={contact.full_name} />
                  <AvatarFallback>{contact.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium">{contact.full_name}</div>
                  {contact.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {contact.lastMessage}
                    </p>
                  )}
                </div>
                {contact.unreadCount ? (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                    {contact.unreadCount}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
        
        {/* Message Area */}
        <div className="flex-1 flex flex-col max-h-full overflow-hidden">
          {/* Selected Contact Header for Mobile */}
          {selectedContact && (
            <div className="p-3 border-b sm:hidden">
              {contacts.find(c => c.id === selectedContact)?.full_name}
            </div>
          )}
          
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4">
            {!selectedContact ? (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>Select a conversation to start messaging</p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>{receiverName ? `Start a conversation with ${receiverName}` : 'No messages yet'}</p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date} className="mb-6">
                  <div className="flex justify-center mb-4">
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                      {date}
                    </span>
                  </div>
                  {dateMessages.map((message) => {
                    const isCurrentUser = message.sender_id === user?.id;
                    return (
                      <div 
                        key={message.id} 
                        className={`flex mb-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-end gap-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                          {!isCurrentUser && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.sender?.avatar_url || ''} alt={message.sender?.full_name} />
                              <AvatarFallback>
                                {message.sender?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div 
                            className={`px-3 py-2 rounded-lg ${
                              isCurrentUser 
                                ? 'bg-primary text-primary-foreground rounded-br-none' 
                                : 'bg-muted rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          {selectedContact && (
            <div className="p-3 border-t">
              <form 
                className="flex gap-2" 
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
              >
                <Input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
