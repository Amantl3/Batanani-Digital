/**
 * src/app.ts
 * Professional BOCRA Help Chat Integration
 */
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { supabase } from './config/supabase'

const { MessagingResponse } = require('twilio').twiml;

// ── Imports ──────────────────────────────────────────────────────────────────
import dashboardRoutes from './modules/dashboard/routes'
import licenceRoutes from './modules/licences/routes'
import complaintRoutes from './modules/complaints/routes'
import authRoutes from './modules/auth/routes'
import chatRoutes from './modules/chat/routes'
import documentRoutes from './modules/documents/routes'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())

// ── WhatsApp Bot Webhook (BOCRA Help Chat) ──────────────────────────────────
app.post('/api/whatsapp', express.urlencoded({ extended: false }), async (req, res) => {
  const incomingMsg = req.body.Body ? req.body.Body.trim() : '';
  const twiml = new MessagingResponse();
  const lowerMsg = incomingMsg.toLowerCase();

  try {
    // 1. OFFICIAL GREETING
    if (['hi', 'hello', 'help', 'start', 'menu', 'bocra'].includes(lowerMsg)) {
      const welcome = 
        `🇧🇼 *BOCRA Help Chat* 🇧🇼\n` +
        `_________________________\n\n` +
        `Welcome to the BOCRA Digital Assistant. How can we help you today?\n\n` +
        `👉 *Search [Name]* - Verify a License\n` +
        `👉 *Status [Ref]* - Track a Complaint\n` +
        `👉 *Apply* - Licensing requirements\n` +
        `👉 *Office* - Contact & Locations\n\n` +
        `_Example: Search Mascom_`;
      twiml.message(welcome);
    }

    // 2. LICENSE SEARCH
    else if (lowerMsg.startsWith('search')) {
      const query = incomingMsg.replace(/search/i, '').trim();
      
      const { data, error } = await supabase
        .from('Licence') 
        .select('*')
        .or(`company_name.ilike.%${query}%,license_number.ilike.%${query}%`)
        .limit(1);

      if (error || !data || data.length === 0) {
        twiml.message(`🔍 *Search Result:*\nNo records found for "${query}". Please verify the company name.`);
      } else {
        const lic = data[0];
        twiml.message(
          `✅ *BOCRA Verified License*\n` +
          `_________________________\n` +
          `🏢 *Entity:* ${lic.company_name}\n` +
          `🔢 *Ref:* ${lic.license_number}\n` +
          `🚦 *Status:* ${lic.status || 'Active'}\n` +
          `📅 *Type:* ${lic.license_type || 'Communications'}`
        );
      }
    }

    // 3. COMPLAINT STATUS
    else if (lowerMsg.startsWith('status')) {
      const ref = incomingMsg.replace(/status/i, '').trim();
      const { data, error } = await supabase
        .from('Complaint')
        .select('*')
        .eq('reference_number', ref)
        .single();

      if (error || !data) {
        twiml.message(`❌ *Status Update*\nWe could not locate a complaint with Reference: *${ref}*`);
      } else {
        twiml.message(
          `📂 *Case Record: ${ref}*\n` +
          `_________________________\n` +
          `🚦 *Current Status:* ${data.status.toUpperCase()}\n` +
          `📅 *Last Updated:* ${new Date(data.updated_at).toLocaleDateString()}`
        );
      }
    }

    // 4. APPLY / FAQ
    else if (lowerMsg === 'apply') {
      twiml.message(
        `📝 *How to Apply*\n\n` +
        `To apply for a license, please visit our online portal or download the relevant forms at:\n` +
        `https://bocra.org.bw/licensing`
      );
    }

    // 5. CONTACT
    else if (lowerMsg === 'office') {
      twiml.message(
        `📍 *BOCRA Headquarters*\n` +
        `Plot 50671, Independence Avenue, Gaborone\n\n` +
        `📞 +267 368 5400\n` +
        `📧 info@bocra.org.bw`
      );
    }

    // DEFAULT
    else {
      twiml.message("I'm sorry, I didn't recognize that command. Type *Menu* for options.");
    }
  } catch (err) {
    console.error(err);
    twiml.message("⚠️ Service temporarily unavailable. Please try again later.");
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

// ── Standard Routes ───────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes)
app.use('/api/complaints',  complaintRoutes)
app.use('/api/licences',    licenceRoutes)
app.use('/api/dashboard',   dashboardRoutes)
app.use('/api/chat',        chatRoutes)
app.use('/api/documents',   documentRoutes)

app.listen(PORT, () => {
  console.log(`BOCRA Help Chat API active on port ${PORT}`)
})

export default app