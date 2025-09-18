-- Fix the current user's account - approve and make admin
UPDATE profiles 
SET approved = true, role = 'admin'
WHERE email = 'udayak2285@gmail.com' AND user_id = 'ac5b232d-e4a7-429e-9ef6-c19311bcda4b';