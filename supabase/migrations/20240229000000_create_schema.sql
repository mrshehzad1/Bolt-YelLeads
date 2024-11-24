-- First, drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS handle_businesses_updated_at ON public.businesses;
DROP TRIGGER IF EXISTS handle_leads_updated_at ON public.leads;
DROP TRIGGER IF EXISTS handle_templates_updated_at ON public.templates;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Drop all existing tables and types
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;
DROP TYPE IF EXISTS public.lead_status CASCADE;
DROP TYPE IF EXISTS public.lead_source CASCADE;
DROP TYPE IF EXISTS public.sender_type CASCADE;

-- Create custom types
CREATE TYPE public.lead_status AS ENUM ('NEW', 'RESPONDED', 'CLOSED');
CREATE TYPE public.lead_source AS ENUM ('YELP', 'MANUAL');
CREATE TYPE public.sender_type AS ENUM ('BUSINESS', 'CUSTOMER', 'AI');

-- Create businesses table (connected to auth.users)
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    business_name TEXT,
    phone TEXT,
    website_url TEXT,
    address TEXT,
    yelp_api_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leads table
CREATE TABLE public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status lead_status DEFAULT 'NEW',
    source lead_source NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create templates table
CREATE TABLE public.templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender sender_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for businesses
CREATE POLICY "Users can view own business data" ON public.businesses
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own business data" ON public.businesses
    FOR UPDATE USING (auth.uid() = id);

-- Create RLS Policies for leads
CREATE POLICY "Users can view own leads" ON public.leads
    FOR SELECT USING (business_id = auth.uid());

CREATE POLICY "Users can create leads" ON public.leads
    FOR INSERT WITH CHECK (business_id = auth.uid());

CREATE POLICY "Users can update own leads" ON public.leads
    FOR UPDATE USING (business_id = auth.uid());

-- Create RLS Policies for templates
CREATE POLICY "Users can view own templates" ON public.templates
    FOR SELECT USING (business_id = auth.uid());

CREATE POLICY "Users can create templates" ON public.templates
    FOR INSERT WITH CHECK (business_id = auth.uid());

CREATE POLICY "Users can update own templates" ON public.templates
    FOR UPDATE USING (business_id = auth.uid());

CREATE POLICY "Users can delete own templates" ON public.templates
    FOR DELETE USING (business_id = auth.uid());

-- Create RLS Policies for messages
CREATE POLICY "Users can view messages for their leads" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.leads
            WHERE leads.id = messages.lead_id
            AND leads.business_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages for their leads" ON public.messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.leads
            WHERE leads.id = lead_id
            AND leads.business_id = auth.uid()
        )
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
CREATE TRIGGER handle_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_templates_updated_at
    BEFORE UPDATE ON public.templates
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.businesses (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();