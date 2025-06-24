
-- Drop all existing policies completely
DROP POLICY IF EXISTS "Users can view family memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can insert family memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can view all family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Users can create family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Creators can update their groups" ON public.family_groups;
DROP POLICY IF EXISTS "Users can view relevant invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Family creators can send invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Users can update relevant invitations" ON public.family_invitations;

-- Temporarily disable RLS to clean up
ALTER TABLE public.family_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.family_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;

-- Create the simplest possible policies without any subqueries or EXISTS clauses
-- Family memberships: users can only see and modify their own records
CREATE POLICY "Allow own membership access" 
  ON public.family_memberships 
  USING (auth.uid() = user_id);

-- Family groups: allow all authenticated users to view and create
CREATE POLICY "Allow authenticated group access" 
  ON public.family_groups 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (auth.uid() = created_by);

-- Family invitations: allow all authenticated users to view and modify
CREATE POLICY "Allow authenticated invitation access" 
  ON public.family_invitations 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (auth.uid() = invited_by);
