-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Set up storage for user avatars and business logos
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true);

insert into storage.buckets (id, name, public) 
values ('business-logos', 'business-logos', true);

-- Create enum types
create type lead_status as enum ('NEW', 'RESPONDED', 'CLOSED');
create type lead_source as enum ('YELP', 'MANUAL');
create type sender_type as enum ('BUSINESS', 'CUSTOMER', 'AI');

-- Create businesses table
create table public.businesses (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  business_name text not null,
  phone text,
  logo_url text,
  yelp_api_key text,
  website_url text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create leads table
create table public.leads (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  customer_name text not null,
  email text not null,
  phone text,
  message text not null,
  status lead_status default 'NEW' not null,
  source lead_source not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create conversations table
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  lead_id uuid references public.leads(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  content text not null,
  sender sender_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create templates table
create table public.templates (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  content text not null,
  category text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create metrics table for analytics
create table public.metrics (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  total_leads integer default 0 not null,
  response_rate numeric(5,2) default 0 not null,
  average_response_time interval,
  conversion_rate numeric(5,2) default 0 not null,
  date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(business_id, date)
);

-- Create RLS policies
alter table public.businesses enable row level security;
alter table public.leads enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.templates enable row level security;
alter table public.metrics enable row level security;

-- Businesses policies
create policy "Users can view their own business data"
  on public.businesses for select
  using (auth.uid() = id);

create policy "Users can update their own business data"
  on public.businesses for update
  using (auth.uid() = id);

-- Leads policies
create policy "Businesses can view their own leads"
  on public.leads for select
  using (business_id = auth.uid());

create policy "Businesses can insert leads"
  on public.leads for insert
  with check (business_id = auth.uid());

create policy "Businesses can update their own leads"
  on public.leads for update
  using (business_id = auth.uid());

-- Conversations policies
create policy "Businesses can view their leads' conversations"
  on public.conversations for select
  using (
    exists (
      select 1 from public.leads
      where leads.id = conversations.lead_id
      and leads.business_id = auth.uid()
    )
  );

create policy "Businesses can insert conversations for their leads"
  on public.conversations for insert
  with check (
    exists (
      select 1 from public.leads
      where leads.id = lead_id
      and leads.business_id = auth.uid()
    )
  );

-- Messages policies
create policy "Businesses can view messages from their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      join public.leads on leads.id = conversations.lead_id
      where conversations.id = messages.conversation_id
      and leads.business_id = auth.uid()
    )
  );

create policy "Businesses can insert messages in their conversations"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations
      join public.leads on leads.id = conversations.lead_id
      where conversations.id = conversation_id
      and leads.business_id = auth.uid()
    )
  );

-- Templates policies
create policy "Businesses can view their own templates"
  on public.templates for select
  using (business_id = auth.uid());

create policy "Businesses can insert their own templates"
  on public.templates for insert
  with check (business_id = auth.uid());

create policy "Businesses can update their own templates"
  on public.templates for update
  using (business_id = auth.uid());

create policy "Businesses can delete their own templates"
  on public.templates for delete
  using (business_id = auth.uid());

-- Metrics policies
create policy "Businesses can view their own metrics"
  on public.metrics for select
  using (business_id = auth.uid());

-- Create functions for updating timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updating timestamps
create trigger handle_updated_at
  before update on public.businesses
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.leads
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.conversations
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.templates
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.metrics
  for each row
  execute function public.handle_updated_at();

-- Create function to update lead metrics
create or replace function public.update_metrics()
returns trigger as $$
declare
  v_business_id uuid;
  v_total_leads integer;
  v_responded_leads integer;
  v_converted_leads integer;
  v_avg_response_time interval;
begin
  -- Get business_id from the lead
  v_business_id := new.business_id;

  -- Calculate metrics
  select 
    count(*),
    count(*) filter (where status != 'NEW'),
    count(*) filter (where status = 'CLOSED')
  into
    v_total_leads,
    v_responded_leads,
    v_converted_leads
  from public.leads
  where business_id = v_business_id
  and created_at::date = current_date;

  -- Calculate average response time
  select avg(m.created_at - l.created_at)
  into v_avg_response_time
  from public.leads l
  join public.conversations c on c.lead_id = l.id
  join public.messages m on m.conversation_id = c.id
  where l.business_id = v_business_id
  and l.created_at::date = current_date
  and m.sender = 'BUSINESS'
  and m.id = (
    select id from public.messages
    where conversation_id = c.id
    and sender = 'BUSINESS'
    order by created_at asc
    limit 1
  );

  -- Update metrics
  insert into public.metrics (
    business_id,
    total_leads,
    response_rate,
    average_response_time,
    conversion_rate,
    date
  )
  values (
    v_business_id,
    v_total_leads,
    case when v_total_leads > 0 then (v_responded_leads::numeric / v_total_leads * 100) else 0 end,
    v_avg_response_time,
    case when v_total_leads > 0 then (v_converted_leads::numeric / v_total_leads * 100) else 0 end,
    current_date
  )
  on conflict (business_id, date)
  do update set
    total_leads = excluded.total_leads,
    response_rate = excluded.response_rate,
    average_response_time = excluded.average_response_time,
    conversion_rate = excluded.conversion_rate,
    updated_at = now();

  return new;
end;
$$ language plpgsql;

-- Create trigger for updating metrics
create trigger update_metrics_on_lead_change
  after insert or update on public.leads
  for each row
  execute function public.update_metrics();