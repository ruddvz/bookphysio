-- Provider search indexes
CREATE INDEX idx_providers_verified_active ON providers (verified, active);
CREATE INDEX idx_providers_specialty_ids ON providers USING GIN (specialty_ids);
CREATE INDEX idx_providers_rating ON providers (rating_avg DESC);

-- Location search (city, geospatial)
CREATE INDEX idx_locations_city ON locations (city);
CREATE INDEX idx_locations_provider ON locations (provider_id);
CREATE INDEX idx_locations_lat_lng ON locations (lat, lng);

-- Availability lookup
CREATE INDEX idx_availabilities_provider_starts ON availabilities (provider_id, starts_at);
CREATE INDEX idx_availabilities_unbooked ON availabilities (provider_id, is_booked, is_blocked, starts_at) WHERE is_booked = false AND is_blocked = false;

-- Appointment queries
CREATE INDEX idx_appointments_patient ON appointments (patient_id, created_at DESC);
CREATE INDEX idx_appointments_provider ON appointments (provider_id, created_at DESC);
CREATE INDEX idx_appointments_status ON appointments (status);

-- Notifications
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, read, created_at DESC);

-- Reviews
CREATE INDEX idx_reviews_provider ON reviews (provider_id, is_published, created_at DESC);
