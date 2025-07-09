
-- Add family_group_id column to investments table
ALTER TABLE public.investments ADD COLUMN family_group_id UUID REFERENCES public.family_groups(id);

-- Update RLS policies for budgets to allow family access
DROP POLICY IF EXISTS "Users can view their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can create their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON public.budgets;

CREATE POLICY "Users can view their own and family budgets" 
  ON public.budgets 
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own and family budgets" 
  ON public.budgets 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND (
      family_group_id IS NULL 
      OR family_group_id IN (
        SELECT family_group_id 
        FROM public.family_memberships 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own and family budgets" 
  ON public.budgets 
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own and family budgets" 
  ON public.budgets 
  FOR DELETE 
  USING (
    auth.uid() = user_id 
    OR family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid()
    )
  );

-- Update RLS policies for goals to allow family access
DROP POLICY IF EXISTS "Users can view their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can create their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.goals;

CREATE POLICY "Users can view their own and family goals" 
  ON public.goals 
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own and family goals" 
  ON public.goals 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND (
      family_group_id IS NULL 
      OR family_group_id IN (
        SELECT family_group_id 
        FROM public.family_memberships 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own and family goals" 
  ON public.goals 
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own and family goals" 
  ON public.goals 
  FOR DELETE 
  USING (
    auth.uid() = user_id 
    OR family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid()
    )
  );

-- Update RLS policies for investments to allow family access
DROP POLICY IF EXISTS "Users can view their own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can create their own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can update their own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can delete their own investments" ON public.investments;

CREATE POLICY "Users can view their own and family investments" 
  ON public.investments 
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own and family investments" 
  ON public.investments 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND (
      family_group_id IS NULL 
      OR family_group_id IN (
        SELECT family_group_id 
        FROM public.family_memberships 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own and family investments" 
  ON public.investments 
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own and family investments" 
  ON public.investments 
  FOR DELETE 
  USING (
    auth.uid() = user_id 
    OR family_group_id IN (
      SELECT family_group_id 
      FROM public.family_memberships 
      WHERE user_id = auth.uid()
    )
  );
