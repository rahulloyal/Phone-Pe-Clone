// SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://wrugmwayfvirdiyalnrn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydWdtd2F5ZnZpcmRpeWFsbnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NzA5ODgsImV4cCI6MjEwNzA0Njk4OH0.AeMU-qo3ZPJt23AvdyywDOZQPP_rlWwuBV9sfoDr5xA';

// Initialize Supabase Client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
