
-- Re-enable RLS on all family tables
ALTER TABLE public.family_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for family_memberships
CREATE POLICY "Users can view their own memberships" 
  ON public.family_memberships 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memberships" 
  ON public.family_memberships 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memberships" 
  ON public.family_memberships 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Simple policies for family_groups - allow all authenticated users to view and create
CREATE POLICY "Authenticated users can view family groups" 
  ON public.family_groups 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create family groups" 
  ON public.family_groups 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their family groups" 
  ON public.family_groups 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = created_by);

-- Simple policies for family_invitations
CREATE POLICY "Authenticated users can view invitations" 
  ON public.family_invitations 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create invitations" 
  ON public.family_invitations 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "Users can update invitations" 
  ON public.family_invitations 
  FOR UPDATE 
  TO authenticated 
  USING (true);
