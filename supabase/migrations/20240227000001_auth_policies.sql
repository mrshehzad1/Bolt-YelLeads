-- Enable row level security
alter table auth.users enable row level security;

-- Create policy to allow users to update their own user data
create policy "Users can update own user data"
  on auth.users
  for update
  using (auth.uid() = id);

-- Create policy to allow insertion into businesses table during signup
create policy "Enable insert for authenticated users only"
  on public.businesses
  for insert
  with check (auth.uid() = id);

-- Add trigger to automatically create business profile after user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.businesses (id, email, business_name)
  values (
    new.id,
    new.email,
    (new.raw_user_meta_data->>'business_name')::text
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();