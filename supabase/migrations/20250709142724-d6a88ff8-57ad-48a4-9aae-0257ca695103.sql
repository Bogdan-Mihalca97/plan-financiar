
-- Adăugăm înapoi coloana role care a fost ștearsă din greșeală
ALTER TABLE public.family_memberships ADD COLUMN role TEXT NOT NULL DEFAULT 'member';

-- Adăugăm constraint pentru validarea rolurilor
ALTER TABLE public.family_memberships ADD CONSTRAINT family_memberships_role_check CHECK (role IN ('admin', 'member'));

-- Ștergem politicile existente care sunt prea restrictive
DROP POLICY IF EXISTS "Users can view family memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can insert family memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON public.family_memberships;

DROP POLICY IF EXISTS "Allow creators to view their family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Allow users to create family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Allow creators to update their family groups" ON public.family_groups;

DROP POLICY IF EXISTS "Allow admins to manage invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Allow users to view invitations sent to their email" ON public.family_invitations;
DROP POLICY IF EXISTS "Allow users to update invitations sent to their email" ON public.family_invitations;

-- Creăm politici noi mai permisive pentru family_memberships
CREATE POLICY "Users can view memberships in their families" 
  ON public.family_memberships 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.family_memberships fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.family_group_id = family_memberships.family_group_id
    )
  );

CREATE POLICY "Users can create memberships" 
  ON public.family_memberships 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete memberships in their families" 
  ON public.family_memberships 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.family_memberships fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.family_group_id = family_memberships.family_group_id 
      AND fm.role = 'admin'
    )
  );

-- Politici pentru family_groups
CREATE POLICY "Users can view groups they belong to" 
  ON public.family_groups 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.family_memberships fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.family_group_id = family_groups.id
    )
  );

CREATE POLICY "Authenticated users can create family groups" 
  ON public.family_groups 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Family admins can update their groups" 
  ON public.family_groups 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.family_memberships fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.family_group_id = family_groups.id 
      AND fm.role = 'admin'
    )
  );

-- Politici pentru family_invitations
CREATE POLICY "Family admins can manage invitations" 
  ON public.family_invitations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.family_memberships fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.family_group_id = family_invitations.family_group_id 
      AND fm.role = 'admin'
    )
  );

CREATE POLICY "Users can view invitations sent to their email" 
  ON public.family_invitations 
  FOR SELECT 
  USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update invitations sent to their email" 
  ON public.family_invitations 
  FOR UPDATE 
  USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );
