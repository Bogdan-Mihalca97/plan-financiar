
-- First, drop the existing problematic policies on family_memberships
DROP POLICY IF EXISTS "Users can view their own family memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can create their own family memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can update their own family memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can delete their own family memberships" ON public.family_memberships;

-- Enable RLS on family_memberships if not already enabled
ALTER TABLE public.family_memberships ENABLE ROW LEVEL SECURITY;

-- Create simpler, non-recursive policies for family_memberships
CREATE POLICY "Users can view their own family memberships" 
  ON public.family_memberships 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own family memberships" 
  ON public.family_memberships 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own family memberships" 
  ON public.family_memberships 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own family memberships" 
  ON public.family_memberships 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Also fix the transactions table policies to handle family groups properly
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

-- Create better policies for transactions that handle both personal and family transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    (family_group_id IS NOT NULL AND family_group_id IN (
      SELECT family_group_id FROM public.family_memberships WHERE user_id = auth.uid()
    ))
  );

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
