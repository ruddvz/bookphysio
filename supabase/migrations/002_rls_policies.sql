-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION auth_role()
RETURNS text AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- users: own row access
CREATE POLICY "users_select_own" ON users FOR SELECT USING (id = auth.uid() OR auth_role() = 'admin');
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid());

-- providers: public read (verified+active), self write
CREATE POLICY "providers_public_read" ON providers FOR SELECT USING (verified = true AND active = true OR id = auth.uid() OR auth_role() = 'admin');
CREATE POLICY "providers_self_insert" ON providers FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "providers_self_update" ON providers FOR UPDATE USING (id = auth.uid() OR auth_role() = 'admin');

-- specialties: public read
CREATE POLICY "specialties_public_read" ON specialties FOR SELECT USING (true);
CREATE POLICY "specialties_admin_write" ON specialties FOR ALL USING (auth_role() = 'admin');

-- insurances: public read
CREATE POLICY "insurances_public_read" ON insurances FOR SELECT USING (true);
CREATE POLICY "insurances_admin_write" ON insurances FOR ALL USING (auth_role() = 'admin');

-- locations: public read for verified providers, self write
CREATE POLICY "locations_public_read" ON locations FOR SELECT USING (
  EXISTS (SELECT 1 FROM providers p WHERE p.id = locations.provider_id AND p.verified = true AND p.active = true)
  OR provider_id = auth.uid() OR auth_role() = 'admin'
);
CREATE POLICY "locations_self_write" ON locations FOR INSERT WITH CHECK (provider_id = auth.uid());
CREATE POLICY "locations_self_update" ON locations FOR UPDATE USING (provider_id = auth.uid() OR auth_role() = 'admin');

-- provider_insurances: public read, self write
CREATE POLICY "provider_insurances_public_read" ON provider_insurances FOR SELECT USING (true);
CREATE POLICY "provider_insurances_self_write" ON provider_insurances FOR INSERT WITH CHECK (provider_id = auth.uid());
CREATE POLICY "provider_insurances_self_delete" ON provider_insurances FOR DELETE USING (provider_id = auth.uid());

-- availabilities: public read (unbooked), provider self write
CREATE POLICY "availabilities_public_read" ON availabilities FOR SELECT USING (
  is_blocked = false OR provider_id = auth.uid() OR auth_role() = 'admin'
);
CREATE POLICY "availabilities_provider_write" ON availabilities FOR INSERT WITH CHECK (provider_id = auth.uid());
CREATE POLICY "availabilities_provider_update" ON availabilities FOR UPDATE USING (provider_id = auth.uid() OR auth_role() = 'admin');

-- appointments: patient owns, provider reads theirs
CREATE POLICY "appointments_patient_read" ON appointments FOR SELECT USING (patient_id = auth.uid() OR provider_id = auth.uid() OR auth_role() = 'admin');
CREATE POLICY "appointments_patient_insert" ON appointments FOR INSERT WITH CHECK (patient_id = auth.uid());
CREATE POLICY "appointments_update" ON appointments FOR UPDATE USING (patient_id = auth.uid() OR provider_id = auth.uid() OR auth_role() = 'admin');

-- payments: patient + provider read own
CREATE POLICY "payments_read" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM appointments a WHERE a.id = payments.appointment_id AND (a.patient_id = auth.uid() OR a.provider_id = auth.uid()))
  OR auth_role() = 'admin'
);

-- subscriptions: provider self
CREATE POLICY "subscriptions_self" ON subscriptions FOR ALL USING (provider_id = auth.uid() OR auth_role() = 'admin');

-- reviews: public read (published), patient write
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (is_published = true OR patient_id = auth.uid() OR provider_id = auth.uid() OR auth_role() = 'admin');
CREATE POLICY "reviews_patient_insert" ON reviews FOR INSERT WITH CHECK (patient_id = auth.uid());
CREATE POLICY "reviews_provider_reply" ON reviews FOR UPDATE USING (provider_id = auth.uid() OR auth_role() = 'admin');

-- documents: provider self, admin read
CREATE POLICY "documents_self" ON documents FOR ALL USING (provider_id = auth.uid() OR auth_role() = 'admin');

-- notifications: own only
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (user_id = auth.uid());
