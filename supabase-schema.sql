-- Traffic Violations Table
CREATE TABLE traffic_violations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  media_urls TEXT[], -- Array of media file URLs from storage
  status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, resolved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_traffic_violations_incident_id ON traffic_violations(incident_id);
CREATE INDEX idx_traffic_violations_status ON traffic_violations(status);
CREATE INDEX idx_traffic_violations_created_at ON traffic_violations(created_at);

-- Enable Row Level Security
ALTER TABLE traffic_violations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for form submissions)
CREATE POLICY "Allow public inserts" ON traffic_violations
  FOR INSERT WITH CHECK (true);

-- Create policy to allow public reads (for status checking)
CREATE POLICY "Allow public reads" ON traffic_violations
  FOR SELECT USING (true);
