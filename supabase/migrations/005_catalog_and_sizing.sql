-- Migration 005: Catalog and Sizing Data
-- Adds tables for official Galia Lahav gowns and universal size dimensions.

-- 1. Catalog Gowns Table
CREATE TABLE IF NOT EXISTS public.catalog_gowns (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    collection TEXT,
    description TEXT,
    images TEXT[] DEFAULT '{}',
    retail_price_range TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Universal Sizes Table
CREATE TABLE IF NOT EXISTS public.universal_sizes (
    size_label TEXT PRIMARY KEY,
    bust NUMERIC NOT NULL,
    waist NUMERIC NOT NULL,
    hips NUMERIC NOT NULL,
    height_with_shoes NUMERIC DEFAULT 175, -- Standard height in cm
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS Policies
-- Enable RLS
ALTER TABLE public.catalog_gowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universal_sizes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to both
CREATE POLICY "Allow public read on catalog_gowns" ON public.catalog_gowns FOR SELECT USING (true);
CREATE POLICY "Allow public read on universal_sizes" ON public.universal_sizes FOR SELECT USING (true);

-- Allow staff to manage catalog_gowns
CREATE POLICY "Allow staff to manage catalog_gowns" 
ON public.catalog_gowns 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'moderator')
    )
);

-- Allow staff to manage universal_sizes
CREATE POLICY "Allow staff to manage universal_sizes" 
ON public.universal_sizes 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'moderator')
    )
);

-- 4. Initial Seed Data
INSERT INTO public.universal_sizes (size_label, bust, waist, hips, height_with_shoes) VALUES
('US 0 (EU 32)', 31.5, 24, 34.5, 175),
('US 2 (EU 34)', 32.5, 25, 35.5, 175),
('US 4 (EU 36)', 33.5, 26, 36.5, 175),
('US 6 (EU 38)', 34.5, 27, 37.5, 175),
('US 8 (EU 40)', 35.5, 28, 38.5, 175),
('US 10 (EU 42)', 37, 29.5, 40, 175),
('US 12 (EU 44)', 38.5, 31, 41.5, 175),
('US 14 (EU 46)', 40, 32.5, 43, 175)
ON CONFLICT (size_label) DO NOTHING;

INSERT INTO public.catalog_gowns (name, collection, description) VALUES
('Brooklyn', 'Bridal - Couture', 'An elegant mermaid gown with intricate lace detailing.'),
('Spring', 'Bridal - GALA', 'A romantic A-line gown with floral embroidery.'),
('Helen', 'Bridal - Couture', 'A sophisticated sheath gown with a high slit.'),
('Chelsea', 'Bridal - Couture', 'A classic ball gown with a modern twist.'),
('Astor', 'Bridal - GALA', 'A stylish mermaid gown with a sweetheart neckline.'),
('Bleecker', 'Bridal - Couture', 'A glamorous gown with shimmering sequins.'),
('Seraphina', 'Bridal - Couture', 'A breathtaking gown with a dramatic train.')
ON CONFLICT (name) DO NOTHING;
