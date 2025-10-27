-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create gemeinden (municipalities) table
CREATE TABLE public.gemeinden (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bfs_nummer TEXT,
  kanton TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on gemeinden
ALTER TABLE public.gemeinden ENABLE ROW LEVEL SECURITY;

-- Create gemeinde_admins junction table for multi-admin support
CREATE TABLE public.gemeinde_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gemeinde_id UUID REFERENCES public.gemeinden(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (gemeinde_id, user_id)
);

-- Enable RLS on gemeinde_admins
ALTER TABLE public.gemeinde_admins ENABLE ROW LEVEL SECURITY;

-- Create einwohner (residents) table
CREATE TABLE public.einwohner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gemeinde_id UUID REFERENCES public.gemeinden(id) ON DELETE CASCADE NOT NULL,
  vorname TEXT NOT NULL,
  nachname TEXT NOT NULL,
  geburtsdatum DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on einwohner
ALTER TABLE public.einwohner ENABLE ROW LEVEL SECURITY;

-- Create volksbegehren (initiatives) table
CREATE TABLE public.volksbegehren (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_de TEXT NOT NULL,
  title_fr TEXT,
  title_it TEXT,
  title_rm TEXT,
  title_en TEXT,
  description_de TEXT,
  description_fr TEXT,
  description_it TEXT,
  description_rm TEXT,
  description_en TEXT,
  type TEXT NOT NULL,
  level TEXT NOT NULL,
  comitee TEXT,
  sign_date TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on volksbegehren
ALTER TABLE public.volksbegehren ENABLE ROW LEVEL SECURITY;

-- Create credentials table to track issued credentials
CREATE TABLE public.credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  einwohner_id UUID REFERENCES public.einwohner(id) ON DELETE CASCADE NOT NULL,
  volksbegehren_id UUID REFERENCES public.volksbegehren(id) ON DELETE CASCADE NOT NULL,
  management_id TEXT,
  offer_deeplink TEXT,
  credential_id TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  issued_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (einwohner_id, volksbegehren_id)
);

-- Enable RLS on credentials
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for gemeinden
CREATE POLICY "Admins can view gemeinden they manage"
  ON public.gemeinden FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') AND
    EXISTS (
      SELECT 1 FROM public.gemeinde_admins
      WHERE gemeinde_id = gemeinden.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create gemeinden"
  ON public.gemeinden FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = created_by);

CREATE POLICY "Admins can update their gemeinden"
  ON public.gemeinden FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') AND
    EXISTS (
      SELECT 1 FROM public.gemeinde_admins
      WHERE gemeinde_id = gemeinden.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete their gemeinden"
  ON public.gemeinden FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') AND
    EXISTS (
      SELECT 1 FROM public.gemeinde_admins
      WHERE gemeinde_id = gemeinden.id AND user_id = auth.uid()
    )
  );

-- RLS Policies for gemeinde_admins
CREATE POLICY "Admins can view gemeinde_admins for their gemeinden"
  ON public.gemeinde_admins FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') AND
    (user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.gemeinde_admins ga
      WHERE ga.gemeinde_id = gemeinde_admins.gemeinde_id AND ga.user_id = auth.uid()
    ))
  );

CREATE POLICY "Admins can add other admins to their gemeinden"
  ON public.gemeinde_admins FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') AND
    EXISTS (
      SELECT 1 FROM public.gemeinde_admins
      WHERE gemeinde_id = gemeinde_admins.gemeinde_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can remove admins from their gemeinden"
  ON public.gemeinde_admins FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') AND
    EXISTS (
      SELECT 1 FROM public.gemeinde_admins
      WHERE gemeinde_id = gemeinde_admins.gemeinde_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for einwohner
CREATE POLICY "Admins can view einwohner in their gemeinden"
  ON public.einwohner FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') AND
    EXISTS (
      SELECT 1 FROM public.gemeinde_admins
      WHERE gemeinde_id = einwohner.gemeinde_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create einwohner in their gemeinden"
  ON public.einwohner FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') AND
    EXISTS (
      SELECT 1 FROM public.gemeinde_admins
      WHERE gemeinde_id = einwohner.gemeinde_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update einwohner in their gemeinden"
  ON public.einwohner FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') AND
    EXISTS (
      SELECT 1 FROM public.gemeinde_admins
      WHERE gemeinde_id = einwohner.gemeinde_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete einwohner in their gemeinden"
  ON public.einwohner FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') AND
    EXISTS (
      SELECT 1 FROM public.gemeinde_admins
      WHERE gemeinde_id = einwohner.gemeinde_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for volksbegehren (public read, admin write)
CREATE POLICY "Anyone can view volksbegehren"
  ON public.volksbegehren FOR SELECT
  USING (true);

CREATE POLICY "Admins can create volksbegehren"
  ON public.volksbegehren FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update volksbegehren"
  ON public.volksbegehren FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete volksbegehren"
  ON public.volksbegehren FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for credentials
CREATE POLICY "Admins can view credentials for their gemeinden"
  ON public.credentials FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') AND
    EXISTS (
      SELECT 1 FROM public.einwohner e
      JOIN public.gemeinde_admins ga ON e.gemeinde_id = ga.gemeinde_id
      WHERE e.id = credentials.einwohner_id AND ga.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create credentials for their gemeinden"
  ON public.credentials FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') AND
    EXISTS (
      SELECT 1 FROM public.einwohner e
      JOIN public.gemeinde_admins ga ON e.gemeinde_id = ga.gemeinde_id
      WHERE e.id = credentials.einwohner_id AND ga.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update credentials for their gemeinden"
  ON public.credentials FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') AND
    EXISTS (
      SELECT 1 FROM public.einwohner e
      JOIN public.gemeinde_admins ga ON e.gemeinde_id = ga.gemeinde_id
      WHERE e.id = credentials.einwohner_id AND ga.user_id = auth.uid()
    )
  );

-- Trigger function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_gemeinden_updated_at
  BEFORE UPDATE ON public.gemeinden
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_einwohner_updated_at
  BEFORE UPDATE ON public.einwohner
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_volksbegehren_updated_at
  BEFORE UPDATE ON public.volksbegehren
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to automatically add admin to gemeinde_admins when creating gemeinde
CREATE OR REPLACE FUNCTION public.add_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.gemeinde_admins (gemeinde_id, user_id, invited_by)
  VALUES (NEW.id, NEW.created_by, NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER add_gemeinde_creator_as_admin
  AFTER INSERT ON public.gemeinden
  FOR EACH ROW EXECUTE FUNCTION public.add_creator_as_admin();