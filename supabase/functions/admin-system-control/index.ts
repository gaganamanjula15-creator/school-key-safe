import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const requestData = await req.json()
    const { action, adminName } = requestData

    console.log(`System control request - Action: ${action}, Admin: ${adminName}`)

    // For demo purposes, check if the admin name is Gagana Manjula
    if (adminName !== 'Gagana Manjula') {
      console.log(`Access denied for admin: ${adminName}`)
      return new Response(
        JSON.stringify({ error: 'Access denied. Only system owner can access this function.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`System owner ${adminName} executing action: ${action}`)

    let result;

    switch (action) {
      case 'system_health_check':
        result = await performSystemHealthCheck(supabase)
        break
      
      case 'cleanup_inactive_users':
        result = await cleanupInactiveUsers(supabase)
        break
      
      case 'generate_system_report':
        result = await generateSystemReport(supabase)
        break
      
      case 'reset_all_passwords':
        result = await resetAllUserPasswords(supabase)
        break
      
      case 'backup_system_data':
        result = await backupSystemData(supabase)
        break
      
      case 'purge_old_logs':
        result = await purgeOldLogs(supabase)
        break
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action specified' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in admin-system-control:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function performSystemHealthCheck(supabase: any) {
  console.log('Performing system health check...')
  
  // Check database connectivity
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('count')
    .limit(1)

  // Check active users count
  const { data: activeUsers, error: activeError } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_active', true)

  // Mock system metrics
  const systemHealth = {
    database_status: profilesError ? 'ERROR' : 'HEALTHY',
    active_users_count: activeUsers?.length || 0,
    memory_usage: Math.floor(Math.random() * 30 + 40) + '%',
    cpu_usage: Math.floor(Math.random() * 20 + 10) + '%',
    disk_space: Math.floor(Math.random() * 15 + 75) + '% free',
    last_backup: '2024-09-18 02:00:00',
    uptime: '45 days, 12 hours',
    response_time: Math.floor(Math.random() * 50 + 20) + 'ms'
  }

  return systemHealth
}

async function cleanupInactiveUsers(supabase: any) {
  console.log('Cleaning up inactive users...')
  
  // Find inactive users (not active for 90+ days)
  const { data: inactiveUsers, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, updated_at')
    .eq('is_active', false)

  if (error) {
    console.error('Error finding inactive users:', error)
    // Continue with demo data
  }

  // In a real implementation, you would deactivate or archive these users
  // For demo purposes, we'll just return the count
  return {
    message: `Found ${inactiveUsers?.length || 0} inactive users`,
    inactive_users: inactiveUsers?.length || 0,
    action_taken: 'Identified for review',
    cleanup_date: new Date().toISOString()
  }
}

async function generateSystemReport(supabase: any) {
  console.log('Generating comprehensive system report...')
  
  // Get user statistics
  const { data: allUsers } = await supabase.from('profiles').select('role, is_active')
  const { data: students } = await supabase.from('profiles').select('id').eq('role', 'student')
  const { data: teachers } = await supabase.from('profiles').select('id').eq('role', 'teacher')
  const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin')
  const { data: parents } = await supabase.from('profiles').select('id').eq('role', 'parent')

  const report = {
    generated_at: new Date().toISOString(),
    generated_by: 'Gagana Manjula (System Owner)',
    user_statistics: {
      total_users: allUsers?.length || 0,
      students: students?.length || 0,
      teachers: teachers?.length || 0,
      admins: admins?.length || 0,
      parents: parents?.length || 0,
      active_users: allUsers?.filter(u => u.is_active).length || 0,
      inactive_users: allUsers?.filter(u => !u.is_active).length || 0
    },
    system_metrics: {
      database_tables: 2,
      total_records: allUsers?.length || 0,
      last_user_registration: new Date().toISOString(),
      system_version: '1.0.0',
      deployment_date: '2024-09-18',
      owner: 'Gagana Manjula'
    }
  }

  return report
}

async function resetAllUserPasswords(supabase: any) {
  console.log('Initiating password reset for all users...')
  
  // Get all active users
  const { data: users, error } = await supabase
    .from('profiles')
    .select('email, first_name, last_name')
    .eq('is_active', true)

  if (error) {
    console.error('Error getting users:', error)
    // Continue with demo response
  }

  // In a real implementation, you would send password reset emails
  // For demo purposes, we'll simulate the process
  return {
    message: 'Password reset initiated for all active users',
    users_affected: users?.length || 0,
    initiated_by: 'Gagana Manjula (System Owner)',
    initiated_at: new Date().toISOString(),
    status: 'Reset emails would be sent in production environment'
  }
}

async function backupSystemData(supabase: any) {
  console.log('Creating system backup...')
  
  // Get data counts for backup manifest
  const { data: profiles } = await supabase.from('profiles').select('id')
  
  const backupInfo = {
    backup_id: `backup_${Date.now()}`,
    created_at: new Date().toISOString(),
    created_by: 'Gagana Manjula (System Owner)',
    tables_backed_up: ['profiles'],
    records_count: {
      profiles: profiles?.length || 0
    },
    backup_size: `${Math.floor(Math.random() * 500 + 100)}MB`,
    encryption: 'AES-256',
    status: 'Backup would be created in production environment'
  }

  return backupInfo
}

async function purgeOldLogs(supabase: any) {
  console.log('Purging old system logs...')
  
  // In a real implementation, you would clean up log tables
  // For demo purposes, we'll simulate the process
  const purgeInfo = {
    logs_purged: Math.floor(Math.random() * 10000 + 5000),
    date_range: 'Older than 30 days',
    space_freed: `${Math.floor(Math.random() * 200 + 50)}MB`,
    purged_by: 'Gagana Manjula (System Owner)',
    purged_at: new Date().toISOString(),
    status: 'Log purge would be executed in production environment'
  }

  return purgeInfo
}