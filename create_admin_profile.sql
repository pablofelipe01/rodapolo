-- Temporarily make created_by nullable in posts table for development
ALTER TABLE public.posts ALTER COLUMN created_by DROP NOT NULL;

-- Alternative: Create the admin profile properly would require auth.users entry first
-- For now, we'll just make the field nullable so posts can be created without a profile reference