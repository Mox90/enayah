-- 🔥 Check if same department

CREATE OR REPLACE FUNCTION is_same_department(target_employee_id UUID)
RETURNS boolean AS $$
DECLARE
  current_dept UUID;
  target_dept UUID;
BEGIN
  SELECT department_id INTO current_dept
  FROM job_assignments
  WHERE employee_id = current_setting('app.employee_id')::uuid
  AND end_date IS NULL
  LIMIT 1;

  SELECT department_id INTO target_dept
  FROM job_assignments
  WHERE employee_id = target_employee_id
  AND end_date IS NULL
  LIMIT 1;

  RETURN current_dept = target_dept;
END;
$$ LANGUAGE plpgsql;

-- 🔥 Check subordinate hierarchy

CREATE OR REPLACE FUNCTION is_subordinate(target_employee_id UUID)
RETURNS boolean AS $$
DECLARE
  current_id UUID := target_employee_id;
BEGIN
  LOOP
    SELECT manager_id INTO current_id
    FROM employees
    WHERE id = current_id;

    EXIT WHEN current_id IS NULL;

    IF current_id = current_setting('app.employee_id')::uuid THEN
      RETURN TRUE;
    END IF;
  END LOOP;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;