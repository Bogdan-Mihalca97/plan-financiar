
-- Drop the existing problematic policies
DROP POLICY IF EXISTS "Users can view memberships of their families" ON public.family_memberships;
DROP POLICY IF EXISTS "Family admins can manage memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can view their own and family transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own and family transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own and family transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own and family transactions" ON public.transactions;

-- Create simpler, non-recursive policies for family_memberships
CREATE POLICY "Users can view their own memberships" 
  ON public.family_memberships 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memberships" 
  ON public.family_memberships 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all memberships in their families" 
  ON public.family_memberships 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.family_memberships fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.family_group_id = family_memberships.family_group_id 
      AND fm.role = 'admin'
    )
  );

-- Create simpler policies for transactions that don't cause recursion
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
  ON public.transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add policies for family transactions (separate from personal transactions)
CREATE POLICY "Family members can view family transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (
    family_group_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.family_memberships fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.family_group_id = transactions.family_group_id
    )
  );

CREATE POLICY "Family members can create family transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND (
      family_group_id IS NULL 
      OR EXISTS (
        SELECT 1 FROM public.family_memberships fm 
        WHERE fm.user_id = auth.uid() 
        AND fm.family_group_id = transactions.family_group_id
      )
    )
  );

CREATE POLICY "Family members can update family transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (
    family_group_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.family_memberships fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.family_group_id = transactions.family_group_id
    )
  );

CREATE POLICY "Family members can delete family transactions" 
  ON public.transactions 
  FOR DELETE 
  USING (
    family_group_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.family_memberships fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.family_group_id = transactions.family_group_id
    )
  );
