
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, User, Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatInterfaceProps {
  itemId: string;
  receiverId: string;
  receiverName: string;
}

const ChatInterface = ({ itemId, receiverId, receiverName }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('item_messages')
          .select('*')
          .eq('item_id', itemId)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        setMessages(data || []);
        
        // Mark received messages as read
        if (data && data.length > 0) {
          const unreadMessages = data
            .filter(msg => msg.receiver_id === user.id && !msg.is_read)
            .map(msg => msg.id);
            
          if (unreadMessages.length > 0) {
            await supabase
              .from('item_messages')
              .update({ is_read: true })
              .in('id', unreadMessages);
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('item_messages_channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'item_messages',
        filter: `item_id=eq.${itemId}`
      }, payload => {
        const newMessage = payload.new as ChatMessage;
        setMessages(prev => [...prev, newMessage]);
        
        // Mark as read if we're the receiver
        if (newMessage.receiver_id === user?.id) {
          supabase
            .from('item_messages')
            .update({ is_read: true })
            .eq('id', newMessage.id);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, user, receiverId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;
    
    setIsSending(true);
    try {
      const { error } = await supabase
        .from('item_messages')
        .insert({
          item_id: itemId,
          sender_id: user.id,
          receiver_id: receiverId,
          content: message.trim(),
          is_read: false
        });
        
      if (error) throw error;
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'h:mm a');
  };

  return (
    <div className="flex flex-col h-[500px] border border-border rounded-md overflow-hidden">
      {/* Chat header */}
      <div className="bg-card p-3 border-b border-border flex items-center">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarFallback>{receiverName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-sm font-medium">{receiverName}</h3>
          <p className="text-xs text-muted-foreground">Item conversation</p>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-accent/20">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <User className="h-12 w-12 mb-2 opacity-20" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isCurrentUser = msg.sender_id === user?.id;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[75%] rounded-lg p-3 ${
                      isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-card'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <div className={`flex items-center justify-end mt-1 text-xs ${
                      isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      <span>{formatMessageTime(msg.created_at)}</span>
                      {isCurrentUser && (
                        <span className="ml-1">
                          {msg.is_read ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Message input */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Type your message..."
            className="min-h-[60px] resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!message.trim() || isSending}
            className="h-10 px-3"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
