import { createClient } from '@supabase/supabase-js'
import validateEnvVar from '../../_utils/validateEnvVar'

const supabaseUrl = validateEnvVar("SUPABASE_URL", "string");
const supabaseServiceRoleKey = validateEnvVar("SUPABASE_SERVICE_ROLE_KEY", "string");

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey);
