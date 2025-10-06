-- Create private messages table
CREATE TABLE public.private_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

-- Only sender and recipient can view their messages (100% private)
CREATE POLICY "Users can view their own messages"
ON public.private_messages
FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);

-- Users can send messages (sender_id must match authenticated user)
CREATE POLICY "Users can send messages"
ON public.private_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
);

-- Only recipient can update read status
CREATE POLICY "Recipients can mark messages as read"
ON public.private_messages
FOR UPDATE
TO authenticated
USING (
  auth.uid() = recipient_id
)
WITH CHECK (
  auth.uid() = recipient_id
);

-- Create index for faster queries
CREATE INDEX idx_private_messages_sender ON public.private_messages(sender_id);
CREATE INDEX idx_private_messages_recipient ON public.private_messages(recipient_id);
CREATE INDEX idx_private_messages_created_at ON public.private_messages(created_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_private_messages_updated_at
BEFORE UPDATE ON public.private_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();