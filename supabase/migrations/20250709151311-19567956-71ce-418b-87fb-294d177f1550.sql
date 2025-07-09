
-- Fix RLS policies for family_groups to allow family members to view the family
DROP POLICY IF EXISTS "Users can view family groups they belong to" ON public.family_groups;

-- Create a new policy that allows family members to view their family groups
CREATE POLICY "Family members can view their family groups" 
  ON public.family_groups 
  FOR SELECT 
  USING (
    id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid()
    )
  );

-- Also ensure family admins can still manage their groups
DROP POLICY IF EXISTS "Family admins can update their groups" ON public.family_groups;

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
