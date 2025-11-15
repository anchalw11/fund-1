import { supabase } from './backend/config/supabase.js';

const fixDatabase = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    const { error } = await supabase.functions.invoke('fix-user-profiles', {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (error) {
      console.error('Error invoking function:', error);
    } else {
      console.log('Function invoked successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

fixDatabase();
