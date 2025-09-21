-- Create storage bucket for traffic violation media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('traffic-violations-media', 'traffic-violations-media', true);

-- Create storage policies
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'traffic-violations-media');

CREATE POLICY "Allow public access" ON storage.objects
  FOR SELECT USING (bucket_id = 'traffic-violations-media');

-- Allow public to delete their own uploads (optional)
CREATE POLICY "Allow public deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'traffic-violations-media');
