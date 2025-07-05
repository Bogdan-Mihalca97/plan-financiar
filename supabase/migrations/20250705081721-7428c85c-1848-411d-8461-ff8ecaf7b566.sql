
-- Drop all existing problematic policies that cause recursion
DROP POLICY IF EXISTS "Users can view own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can create own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can update own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can delete own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can view memberships in families they belong to" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can manage their own memberships" ON public.family_memberships;

-- Create clean, simple policies for family_memberships
CREATE POLICY "Allow users to view their own memberships" 
  ON public.family_memberships 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Allow users to create their own memberships" 
  ON public.family_memberships 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to update their own memberships" 
  ON public.family_memberships 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Allow users to delete their own memberships" 
  ON public.family_memberships 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Clean up family_groups policies to remove duplicates
DROP POLICY IF EXISTS "Users can view own family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Users can create new family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Users can update own family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Users can view their family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Authenticated users can view family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Creators can update their family groups" ON public.family_groups;

-- Create clean policies for family_groups
CREATE POLICY "Allow creators to view their family groups" 
  ON public.family_groups 
  FOR SELECT 
  USING (created_by = auth.uid());

CREATE POLICY "Allow users to create family groups" 
  ON public.family_groups 
  FOR INSERT 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Allow creators to update their family groups" 
  ON public.family_groups 
  FOR UPDATE 
  USING (created_by = auth.uid());

-- Clean up family_invitations policies to remove duplicates
DROP POLICY IF EXISTS "Family admins can create invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Family admins can view their invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to them" ON public.family_invitations;
DROP POLICY IF EXISTS "Users can update invitations sent to them" ON public.family_invitations;
DROP POLICY IF EXISTS "Authenticated users can view invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Users can update invitations" ON public.family_invitations;

-- Create simple policies for family_invitations
CREATE POLICY "Allow admins to manage invitations" 
  ON public.family_invitations 
  FOR ALL
  USING (invited_by = auth.uid());

CREATE POLICY "Allow users to view invitations sent to their email" 
  ON public.family_invitations 
  FOR SELECT 
  USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Allow users to update invitations sent to their email" 
  ON public.family_invitations 
  FOR UPDATE 
  USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()));
