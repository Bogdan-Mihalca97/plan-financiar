
-- Drop all existing policies completely
DROP POLICY IF EXISTS "Allow own membership access" ON public.family_memberships;
DROP POLICY IF EXISTS "Allow authenticated group access" ON public.family_groups;
DROP POLICY IF EXISTS "Allow authenticated invitation access" ON public.family_invitations;

-- Temporarily disable RLS to clean up completely
ALTER TABLE public.family_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.family_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;

-- Create the most basic policies possible - no joins, no subqueries, no EXISTS clauses
-- Family memberships: only allow users to see their own membership records
CREATE POLICY "Users can view own memberships" 
  ON public.family_memberships 
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memberships" 
  ON public.family_memberships 
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memberships" 
  ON public.family_memberships 
  FOR DELETE
  USING (auth.uid() = user_id);

-- Family groups: allow authenticated users to view all groups, but only create their own
CREATE POLICY "Anyone can view family groups" 
  ON public.family_groups 
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create family groups" 
  ON public.family_groups 
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update family groups" 
  ON public.family_groups 
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Family invitations: simple policies without complex logic
CREATE POLICY "Users can view invitations" 
  ON public.family_invitations 
  FOR SELECT
  TO authenticated
  USING (auth.uid() = invited_by OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = family_invitations.email));

CREATE POLICY "Users can create invitations" 
  ON public.family_invitations 
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "Users can update invitations" 
  ON public.family_invitations 
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = invited_by OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = family_invitations.email));
