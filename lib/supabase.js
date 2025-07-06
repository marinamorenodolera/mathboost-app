// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pckclcdufhcuspitkebl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBja2NsY2R1ZmhjdXNwaXRrZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MjYzOTYsImV4cCI6MjA2NzQwMjM5Nn0.n_XgkMtWX8o33y8BIIFS_CaTAVWz5UwNCTmTP1I-x2I'

export const supabase = createClient(supabaseUrl, supabaseKey)

