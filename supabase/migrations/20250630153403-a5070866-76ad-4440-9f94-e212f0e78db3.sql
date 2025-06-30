
-- First drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON public.family_memberships;

-- Drop family_groups policies if they exist
DROP POLICY IF EXISTS "Users can view their own family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Users can create family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Users can update their own family groups" ON public.family_groups;

-- Now create the clean policies
CREATE POLICY "Users can view own memberships" 
  ON public.family_memberships 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own memberships" 
  ON public.family_memberships 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own memberships" 
  ON public.family_memberships 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own memberships" 
  ON public.family_memberships 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Create family_groups policies
CREATE POLICY "Users can view own family groups" 
  ON public.family_groups 
  FOR SELECT 
  USING (created_by = auth.uid());

CREATE POLICY "Users can create new family groups" 
  ON public.family_groups 
  FOR INSERT 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own family groups" 
  ON public.family_groups 
  FOR UPDATE 
  USING (created_by = auth.uid());

-- Enable RLS on all tables
ALTER TABLE public.family_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;
