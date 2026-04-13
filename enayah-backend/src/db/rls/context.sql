-- Store current user context

CREATE OR REPLACE FUNCTION set_app_context(
  p_user_id UUID,
  p_employee_id UUID
)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.user_id', p_user_id::text, true);
  PERFORM set_config('app.employee_id', p_employee_id::text, true);
END;
$$ LANGUAGE plpgsql;