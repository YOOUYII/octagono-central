const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,     // 🔑 PON TU URL EN .env
  process.env.SUPABASE_SERVICE_KEY  // 🔑 PON TU SERVICE_ROLE KEY EN .env
);

module.exports = supabase;
