
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  itemId: string;
  recipientId: string;
  claimId: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
}

const ChatInterface = ({ itemId, recipientId, claimId }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Load messages
  useEffect(() => {
    if (!user || !itemId) return;
    
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching messages for item:", itemId, "user:", user.id);
        
        const { data, error } = await supabase
          .from('item_messages')
          .select('*')
          .eq('item_id', itemId)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error("Error fetching messages:", error);
          throw error;
        }
        
        console.log("Messages loaded:", data?.length || 0);
        setMessages(data || []);
        
        // Mark received messages as read
        if (data) {
          const unreadMessageIds = data
            .filter(msg => msg.receiver_id === user.id && !msg.is_read)
            .map(msg => msg.id);
            
          if (unreadMessageIds.length > 0) {
            console.log("Marking messages as read:", unreadMessageIds.length);
            await supabase
              .from('item_messages')
              .update({ is_read: true })
              .in('id', unreadMessageIds);
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        toast.error("Could not load messages");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription
    console.log("Setting up real-time subscription for item_messages");
    const channel = supabase
      .channel('item_messages_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'item_messages',
          filter: `item_id=eq.${itemId}`
        }, 
        (payload) => {
          console.log("Received real-time message:", payload);
          const newMessage = payload.new as Message;
          
          // Check if this message is for the current conversation
          if (
            (newMessage.sender_id === user.id || newMessage.receiver_id === user.id) &&
            newMessage.item_id === itemId
          ) {
            console.log("Adding new message to state");
            setMessages(prev => [...prev, newMessage]);
            
            // If the message is for the current user, mark it as read
            if (newMessage.receiver_id === user.id) {
              console.log("Marking new message as read");
              supabase
                .from('item_messages')
                .update({ is_read: true })
                .eq('id', newMessage.id)
                .then(({ error }) => {
                  if (error) console.error("Error marking message as read:", error);
                });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });
      
    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [user, itemId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const sendMessage = async () => {
    if (!user || !newMessage.trim() || !recipientId) {
      console.log("Cannot send message:", { 
        userExists: !!user,
        messageContent: newMessage.trim(), 
        recipientExists: !!recipientId 
      });
      return;
    }
    
    console.log("Sending message to:", recipientId, "about item:", itemId);
    setIsSending(true);
    try {
      const messageToSend = {
        item_id: itemId,
        sender_id: user.id,
        receiver_id: recipientId,
        content: newMessage.trim(),
        is_read: false
      };
      
      console.log("Message data:", messageToSend);
      
      const { data, error } = await supabase
        .from('item_messages')
        .insert(messageToSend)
        .select()
        .single();
        
      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }
      
      console.log("Message sent successfully:", data);
      setNewMessage('');
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[60vh] max-h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 border rounded-md mb-4">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender_id === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm break-words">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block text-right">
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex flex-col sm:flex-row items-end gap-2">
        <Textarea
          placeholder="Type your message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[80px] resize-none flex-1"
          disabled={isSending}
        />
        <Button 
          size="icon" 
          onClick={sendMessage} 
          disabled={isSending || !newMessage.trim()}
          className="h-10 w-10 sm:mt-0 mt-2"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
