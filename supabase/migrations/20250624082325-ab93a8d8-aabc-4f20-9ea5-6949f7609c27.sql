
-- First, drop all policies that depend on the role column
DROP POLICY IF EXISTS "Users can view invitations for their families" ON public.family_invitations;
DROP POLICY IF EXISTS "Family admins can create invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Users can view invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Users can update invitations" ON public.family_invitations;

-- Drop all existing policies on family_memberships
DROP POLICY IF EXISTS "Users can view their own memberships only" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can insert their own memberships only" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can view family memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can insert family memberships" ON public.family_memberships;

-- Drop all existing policies on family_groups
DROP POLICY IF EXISTS "Users can view groups they created" ON public.family_groups;
DROP POLICY IF EXISTS "Users can update groups they created" ON public.family_groups;
DROP POLICY IF EXISTS "Users can view all family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Users can create family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Creators can update their groups" ON public.family_groups;

-- Now we can safely remove the role column
ALTER TABLE public.family_memberships DROP COLUMN IF EXISTS role;

-- Create simple, non-recursive policies for family_memberships
CREATE POLICY "Users can view family memberships" 
  ON public.family_memberships 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert family memberships" 
  ON public.family_memberships 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memberships" 
  ON public.family_memberships 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Simple policies for family_groups  
CREATE POLICY "Users can view all family groups" 
  ON public.family_groups 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create family groups" 
  ON public.family_groups 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their groups" 
  ON public.family_groups 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Simple policies for family_invitations (no role checking)
CREATE POLICY "Users can view relevant invitations" 
  ON public.family_invitations 
  FOR SELECT 
  USING (
    auth.uid() = invited_by 
    OR EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND email = family_invitations.email
    )
  );

CREATE POLICY "Family creators can send invitations" 
  ON public.family_invitations 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_groups 
      WHERE id = family_group_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update relevant invitations" 
  ON public.family_invitations 
  FOR UPDATE 
  USING (
    auth.uid() = invited_by 
    OR EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND email = family_invitations.email
    )
  );
