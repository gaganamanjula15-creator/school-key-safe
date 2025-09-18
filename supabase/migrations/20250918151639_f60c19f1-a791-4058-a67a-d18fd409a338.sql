-- Check if signup is working by ensuring signups are enabled in auth settings
-- This migration just ensures the trigger is properly set up

-- Recreate the trigger to make sure it's working correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();