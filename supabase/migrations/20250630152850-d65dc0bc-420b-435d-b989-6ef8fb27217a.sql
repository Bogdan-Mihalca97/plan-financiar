
-- Fix family_memberships table by adding missing role column
ALTER TABLE public.family_memberships ADD COLUMN role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member'));

-- Update existing memberships to set creators as admins
UPDATE public.family_memberships 
SET role = 'admin' 
WHERE user_id IN (
  SELECT created_by 
  FROM public.family_groups 
  WHERE id = family_memberships.family_group_id
);

-- Create proper RLS policies for family_invitations
CREATE POLICY "Family admins can create invitations" 
  ON public.family_invitations 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_memberships fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.family_group_id = family_invitations.family_group_id 
      AND fm.role = 'admin'
    )
  );

CREATE POLICY "Family admins can view their invitations" 
  ON public.family_invitations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.family_memberships fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.family_group_id = family_invitations.family_group_id 
      AND fm.role = 'admin'
    )
  );

CREATE POLICY "Users can view invitations sent to them" 
  ON public.family_invitations 
  FOR SELECT 
  USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update invitations sent to them" 
  ON public.family_invitations 
  FOR UPDATE 
  USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );
