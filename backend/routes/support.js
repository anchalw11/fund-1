import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.get('/tickets/all', async (req, res) => {
  try {
    const { status } = req.query;

    const { data, error } = await supabase.rpc('get_all_support_tickets', {
      p_status: status && status !== 'all' ? status : null
    });

    if (error) {
      throw error;
    }

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tickets', async (req, res) => {
  try {
    const { user_id, status } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    let query = supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Backend uses SERVICE_ROLE key - direct query is fine
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (ticketError) throw ticketError;

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    const { data: messages, error: messagesError } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    res.json({ success: true, data: { ...ticket, messages: messages || [] } });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tickets', async (req, res) => {
  try {
    const { user_id, email, name, subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Subject and message are required'
      });
    }

    // Map subject to category (subject contains category like "general", "technical", etc.)
    const category = subject || 'general';

    // Create a descriptive subject line
    const subjectLine = `${category.charAt(0).toUpperCase() + category.slice(1)} - ${name || 'User'}`;

    const { data, error } = await supabase.rpc('create_support_ticket', {
      p_subject: subjectLine,
      p_description: message,
      p_category: category,
      p_priority: 'normal',
      p_user_id: user_id || null,
      p_user_email: email || null,
      p_user_name: name || null
    });

    if (error) {
      console.error('Error from RPC:', error);
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


router.post('/tickets/:id/admin-reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id, message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: id,
        admin_id,
        message,
        is_admin: true
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('support_tickets')
      .update({
        updated_at: new Date().toISOString(),
        status: 'pending'
      })
      .eq('id', id);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error adding admin reply:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/tickets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateData = { updated_at: new Date().toISOString() };

    if (status) {
      updateData.status = status;
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send-reply-email', async (req, res) => {
  try {
    const { email, name, ticketId, subject, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ success: false, error: 'Email and message are required' });
    }

    const emailService = (await import('../services/emailService.js')).default;

    await emailService.sendSupportReply({
      email,
      name: name || 'User',
      ticketId: ticketId || 'N/A',
      subject: subject || 'Support Ticket',
      message
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending support reply email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get messages for a ticket
router.get('/tickets/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;

    // Use database function (bypasses PostgREST column cache)
    const { data, error } = await supabase.rpc('get_ticket_messages', {
      p_ticket_id: id
    });

    if (error) {
      console.error('Function error:', error);
      throw new Error(`Failed to fetch messages: ${error.message}. PostgREST cache may still be refreshing. Please wait 5-10 minutes.`);
    }

    // Function returns JSON array, parse if needed
    const messages = Array.isArray(data) ? data : (data ? JSON.parse(data) : []);
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tickets/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, is_admin, user_id } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Use database function (bypasses PostgREST column cache)
    // Function was created in migration and works in SQL
    const { data, error } = await supabase.rpc('insert_ticket_message', {
      p_ticket_id: id,
      p_message: message,
      p_is_admin: is_admin || false,
      p_user_id: user_id || null
    });

    if (error) {
      console.error('Function error:', error);
      throw new Error(`Failed to insert message: ${error.message}. PostgREST cache may still be refreshing. Please wait 5-10 minutes.`);
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error inserting message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
