
-- First, let's drop all the problematic policies that cause recursion
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Admins can manage all memberships in their families" ON public.family_memberships;

-- Create a security definer function to safely check admin status
CREATE OR REPLACE FUNCTION public.is_family_admin(family_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_memberships 
    WHERE family_group_id = family_id 
    AND user_id = is_family_admin.user_id 
    AND role = 'admin'
  );
$$;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own family memberships" 
  ON public.family_memberships 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own family memberships" 
  ON public.family_memberships 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view memberships in families they belong to" 
  ON public.family_memberships 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.family_memberships fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.family_group_id = family_memberships.family_group_id
    )
  );

-- Allow family admins to manage memberships using the security definer function
CREATE POLICY "Family admins can manage memberships" 
  ON public.family_memberships 
  FOR ALL 
  USING (public.is_family_admin(family_group_id, auth.uid()));

-- Also fix the family_groups policies to be simpler
DROP POLICY IF EXISTS "Users can view family groups they belong to" ON public.family_groups;
DROP POLICY IF EXISTS "Users can create family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Family admins can update their groups" ON public.family_groups;

CREATE POLICY "Users can view their family groups" 
  ON public.family_groups 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.family_memberships fm 
      WHERE fm.family_group_id = family_groups.id 
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create family groups" 
  ON public.family_groups 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Family admins can update their groups" 
  ON public.family_groups 
  FOR UPDATE 
  USING (public.is_family_admin(id, auth.uid()));
