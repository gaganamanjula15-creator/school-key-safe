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
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      console.log('Authentication failed:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      console.log(`Access denied for user: ${user.id}`)
      return new Response(
        JSON.stringify({ error: 'Access denied. Admin privileges required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { verificationCode } = await req.json()

    if (!verificationCode || typeof verificationCode !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid verification code format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate code format (alphanumeric, 6-20 chars)
    if (!/^[A-Z0-9]{6,20}$/.test(verificationCode)) {
      // Log failed attempt
      await supabase.from('admin_verification_attempts').insert({
        admin_id: user.id,
        verification_code: verificationCode,
        success: false
      })

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid code format' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if code exists and is active
    const { data: codeData, error: codeError } = await supabase
      .from('admin_verification_codes')
      .select('*')
      .eq('admin_id', user.id)
      .eq('verification_code', verificationCode)
      .eq('is_active', true)
      .maybeSingle()

    // Log attempt
    await supabase.from('admin_verification_attempts').insert({
      admin_id: user.id,
      verification_code: verificationCode,
      success: !!codeData
    })

    if (codeError || !codeData) {
      console.log(`Invalid code for admin: ${user.id}`)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid verification code' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if code is expired
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Verification code has expired' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update last used timestamp
    await supabase
      .from('admin_verification_codes')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', codeData.id)

    console.log(`Admin verified successfully: ${profile.first_name} ${profile.last_name}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        admin: {
          name: `${profile.first_name} ${profile.last_name}`,
          role: profile.role
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in verify-admin-code:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
