
CREATE TABLE public.todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.todos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.todos TO authenticated;
GRANT ALL ON public.todos TO service_role;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view todos" ON public.todos FOR SELECT USING (true);
CREATE POLICY "Anyone can insert todos" ON public.todos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update todos" ON public.todos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete todos" ON public.todos FOR DELETE USING (true);
