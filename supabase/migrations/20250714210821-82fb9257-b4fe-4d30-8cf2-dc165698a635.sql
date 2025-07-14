
-- Update transactions policies to allow family members to view each other's transactions
DROP POLICY IF EXISTS "Family members can view family transactions" ON public.transactions;

CREATE POLICY "Family members can view all family and member transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR (
      family_group_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.family_memberships fm 
        WHERE fm.user_id = auth.uid() 
        AND fm.family_group_id = transactions.family_group_id
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.family_memberships fm1
      JOIN public.family_memberships fm2 ON fm1.family_group_id = fm2.family_group_id
      WHERE fm1.user_id = auth.uid() 
      AND fm2.user_id = transactions.user_id
    )
  );

-- Update goals policies to allow family members to view each other's goals
DROP POLICY IF EXISTS "Users can view their own and family goals" ON public.goals;

CREATE POLICY "Users can view their own, family, and family member goals" 
  ON public.goals 
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR (
      family_group_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.family_memberships fm 
        WHERE fm.user_id = auth.uid() 
        AND fm.family_group_id = goals.family_group_id
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.family_memberships fm1
      JOIN public.family_memberships fm2 ON fm1.family_group_id = fm2.family_group_id
      WHERE fm1.user_id = auth.uid() 
      AND fm2.user_id = goals.user_id
    )
  );

-- Update budgets policies to allow family members to view each other's budgets
DROP POLICY IF EXISTS "Users can view their own and family budgets" ON public.budgets;

CREATE POLICY "Users can view their own, family, and family member budgets" 
  ON public.budgets 
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR (
      family_group_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.family_memberships fm 
        WHERE fm.user_id = auth.uid() 
        AND fm.family_group_id = budgets.family_group_id
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.family_memberships fm1
      JOIN public.family_memberships fm2 ON fm1.family_group_id = fm2.family_group_id
      WHERE fm1.user_id = auth.uid() 
      AND fm2.user_id = budgets.user_id
    )
  );

-- Update investments policies to allow family members to view each other's investments
DROP POLICY IF EXISTS "Users can view their own and family investments" ON public.investments;

CREATE POLICY "Users can view their own, family, and family member investments" 
  ON public.investments 
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR (
      family_group_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.family_memberships fm 
        WHERE fm.user_id = auth.uid() 
        AND fm.family_group_id = investments.family_group_id
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.family_memberships fm1
      JOIN public.family_memberships fm2 ON fm1.family_group_id = fm2.family_group_id
      WHERE fm1.user_id = auth.uid() 
      AND fm2.user_id = investments.user_id
    )
  );
