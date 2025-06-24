
-- Drop the function with CASCADE to remove all dependent policies
DROP FUNCTION IF EXISTS public.is_family_admin(uuid, uuid) CASCADE;

-- Drop any remaining policies that might still exist
DROP POLICY IF EXISTS "Users can view their own family memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can insert their own family memberships" ON public.family_memberships;

-- Create completely separate, non-recursive policies
CREATE POLICY "Users can view their own memberships only" 
  ON public.family_memberships 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memberships only" 
  ON public.family_memberships 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- For updates and deletes, only allow on own records
CREATE POLICY "Users can update their own memberships" 
  ON public.family_memberships 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memberships" 
  ON public.family_memberships 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create simple policies for family_groups
CREATE POLICY "Users can view groups they created" 
  ON public.family_groups 
  FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can update groups they created" 
  ON public.family_groups 
  FOR UPDATE 
  USING (auth.uid() = created_by);
