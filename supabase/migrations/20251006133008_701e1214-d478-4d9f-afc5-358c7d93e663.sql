-- Allow admins to manage their own verification codes
CREATE POLICY "Admins can insert own codes"
ON admin_verification_codes
FOR INSERT
TO authenticated
WITH CHECK (
  admin_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update own codes"
ON admin_verification_codes
FOR UPDATE
TO authenticated
USING (
  admin_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  admin_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);