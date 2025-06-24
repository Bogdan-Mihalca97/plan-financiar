
-- Completely disable RLS on all family tables to test basic functionality
ALTER TABLE public.family_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure clean slate
DROP POLICY IF EXISTS "Users can view own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can insert own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Users can delete own memberships" ON public.family_memberships;
DROP POLICY IF EXISTS "Anyone can view family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Users can create family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Creators can update family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Users can view invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Users can update invitations" ON public.family_invitations;
