/**
 * src/app.ts
 * BOCRA Help Chat - Integrated Search & Complaint Tracking
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
    // 1. AUTO-GREETING ON JOIN (Hackathon optimization)
    // This catches the 'join word' message and immediately shows the menu
    if (lowerMsg.includes('join') || ['hi', 'hello', 'help', 'menu', 'bocra'].includes(lowerMsg)) {
      const welcome = 
        `🇧🇼 *BOCRA Help Chat* 🇧🇼\n` +
        `_________________________\n\n` +
        `Welcome to the BOCRA Digital Assistant. We are now connected!\n\n` +
        `👉 *Search [Name]* - Verify a License\n` +
        `👉 *Status [Ref]* - Track a Complaint\n` +
        `👉 *Apply* - Licensing requirements\n` +
        `👉 *Office* - Contact & Locations\n\n` +
        `_Example: Search Mascom_`;
      twiml.message(welcome);
    }

    // 2. LICENSE SEARCH (Using your Licence table)
    else if (lowerMsg.startsWith('search')) {
      const query = incomingMsg.replace(/search/i, '').trim();
      const { data, error } = await supabase
        .from('Licence') 
        .select('*')
        .or(`company_name.ilike.%${query}%,license_number.ilike.%${query}%`)
        .limit(1);

      if (error || !data || data.length === 0) {
        twiml.message(`🔍 *Search Result:*\nNo records found for "${query}".`);
      } else {
        const lic = data[0];
        twiml.message(
          `✅ *BOCRA Verified License*\n` +
          `🏢 *Entity:* ${lic.company_name}\n` +
          `🔢 *Ref:* ${lic.license_number}\n` +
          `🚦 *Status:* ${lic.status || 'Active'}`
        );
      }
    }

    // 3. COMPLAINT STATUS (Using your Complaint table)
    else if (lowerMsg.startsWith('status')) {
      const ref = incomingMsg.replace(/status/i, '').trim();
      const { data, error } = await supabase
        .from('Complaint')
        .select('*')
        .eq('reference_number', ref)
        .single();

      if (error || !data) {
        twiml.message(`❌ *No Record*\nCould not find a complaint with Reference: *${ref}*`);
      } else {
        twiml.message(
          `📂 *Complaint Record: ${ref}*\n` +
          `🚦 *Status:* ${data.status.toUpperCase()}\n` +
          `📅 *Update:* ${new Date(data.updated_at).toLocaleDateString()}`
        );
      }
    }

    // 4. OTHER FAQS
    else if (lowerMsg === 'apply') {
      twiml.message(`📝 *Apply:* Visit https://bocra.org.bw/licensing for forms.`);
    } else if (lowerMsg === 'office') {
      twiml.message(`📍 *Office:* Independence Avenue, Gaborone. Tel: +267 368 5400`);
    }

    // DEFAULT
    else {
      twiml.message("I didn't recognize that. Type *Menu* to see options.");
    }
  } catch (err) {
    twiml.message("⚠️ Service temporarily unavailable.");
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

// ── Standard API Routes ──────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes)
app.use('/api/complaints',  complaintRoutes)
app.use('/api/licences',    licenceRoutes)
app.use('/api/dashboard',   dashboardRoutes)
app.use('/api/chat',        chatRoutes)
app.use('/api/documents',   documentRoutes)

app.listen(PORT, () => console.log(`BOCRA Backend running on ${PORT}`))

export default app