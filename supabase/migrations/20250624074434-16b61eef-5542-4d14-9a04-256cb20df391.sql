
-- Create family_groups table
CREATE TABLE public.family_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family_memberships table to track who belongs to which family
CREATE TABLE public.family_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_group_id UUID REFERENCES public.family_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_group_id, user_id)
);

-- Create family_invitations table for pending invitations
CREATE TABLE public.family_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_group_id UUID REFERENCES public.family_groups(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE(family_group_id, email)
);

-- Add family_group_id to transactions table
ALTER TABLE public.transactions ADD COLUMN family_group_id UUID REFERENCES public.family_groups(id);

-- Add family_group_id to budgets table
ALTER TABLE public.budgets ADD COLUMN family_group_id UUID REFERENCES public.family_groups(id);

-- Add family_group_id to goals table
ALTER TABLE public.goals ADD COLUMN family_group_id UUID REFERENCES public.family_groups(id);

-- Enable RLS for family_groups
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;

-- Enable RLS for family_memberships
ALTER TABLE public.family_memberships ENABLE ROW LEVEL SECURITY;

-- Enable RLS for family_invitations
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for family_groups
CREATE POLICY "Users can view family groups they belong to" 
  ON public.family_groups 
  FOR SELECT 
  USING (
    id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create family groups" 
  ON public.family_groups 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Family admins can update their groups" 
  ON public.family_groups 
  FOR UPDATE 
  USING (
    id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for family_memberships
CREATE POLICY "Users can view memberships of their families" 
  ON public.family_memberships 
  FOR SELECT 
  USING (
    family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family admins can manage memberships" 
  ON public.family_memberships 
  FOR ALL 
  USING (
    family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for family_invitations
CREATE POLICY "Users can view invitations for their families" 
  ON public.family_invitations 
  FOR SELECT 
  USING (
    family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Family admins can create invitations" 
  ON public.family_invitations 
  FOR INSERT 
  WITH CHECK (
    family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Update existing RLS policies for transactions to include family access
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

CREATE POLICY "Users can view their own and family transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own and family transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND (
      family_group_id IS NULL 
      OR family_group_id IN (
        SELECT family_group_id 
        FROM public.family_memberships 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own and family transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own and family transactions" 
  ON public.transactions 
  FOR DELETE 
  USING (
    auth.uid() = user_id 
    OR family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid()
    )
  );
