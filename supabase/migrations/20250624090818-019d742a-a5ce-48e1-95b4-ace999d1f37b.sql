
-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Family members can view family transactions" ON public.transactions;
DROP POLICY IF EXISTS "Family members can create family transactions" ON public.transactions;
DROP POLICY IF EXISTS "Family members can update family transactions" ON public.transactions;
DROP POLICY IF EXISTS "Family members can delete family transactions" ON public.transactions;

-- Create completely simple policies for transactions that don't reference other tables
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own transactions" 
  ON public.transactions 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Also simplify family_memberships policies to be completely basic
DROP POLICY IF EXISTS "Users can view their own family memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can create their own family memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can update their own family memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can delete their own family memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Admins can manage all memberships in their families" ON public.family_memberships;

CREATE POLICY "Users can manage their own memberships" 
  ON public.family_memberships 
  FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
