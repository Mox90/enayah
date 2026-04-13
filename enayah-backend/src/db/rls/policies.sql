-- 🔥 Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 🔥 MAIN ACCESS POLICY

--CREATE POLICY employee_access_policy
--ON employees
--FOR SELECT
--USING (
--  -- SELF
--  id = current_setting('app.employee_id')::uuid

--  OR

  -- SAME DEPARTMENT
--  is_same_department(id)

--  OR

  -- SUBORDINATE
--  is_subordinate(id)
--);

-- Allow reading users during login/signup
CREATE POLICY users_public_read
ON users
FOR SELECT
USING (true);

-- Allow inserting users during signup
CREATE POLICY users_public_insert
ON users
FOR INSERT
WITH CHECK (true);