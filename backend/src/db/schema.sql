-- Products table
create table public.products (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    price decimal(10,2) not null,
    description text,
    image_url text,
    source_url text not null,
    source_site text not null,
    affiliate_url text,
    specifications jsonb,
    availability boolean default true,
    rating decimal(3,2),
    review_count integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for product search
create index products_title_idx on public.products using gin (to_tsvector('english', title));
create index products_price_idx on public.products(price);
create index products_source_site_idx on public.products(source_site);

-- Tracking jobs table
create table public.tracking_jobs (
    id uuid default gen_random_uuid() primary key,
    product_url text not null,
    status text not null,
    last_scraped_at timestamp with time zone,
    error text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.products enable row level security;
alter table public.tracking_jobs enable row level security;

-- Allow public read access to products
create policy "Products are viewable by everyone"
    on public.products for select
    using (true);

-- Allow authenticated users to insert/update products
create policy "Authenticated users can insert products"
    on public.products for insert
    with check (auth.role() = 'authenticated');

create policy "Authenticated users can update products"
    on public.products for update
    using (auth.role() = 'authenticated');

-- Tracking jobs policies
create policy "Authenticated users can manage tracking jobs"
    on public.tracking_jobs for all
    using (auth.role() = 'authenticated'); 