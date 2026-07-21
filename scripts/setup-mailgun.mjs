/**
 * Mailgun + Cloudflare DNS Setup Script
 *
 * 1. Creates a sending domain in Mailgun (e.g., mg.example.com)
 * 2. Retrieves the required DNS records
 * 3. Adds them to Cloudflare automatically
 *
 * Required environment variables or replace placeholders:
 *   MAILGUN_API_KEY    - Mailgun private API key
 *   MAILGUN_DOMAIN     - Sending domain (e.g., mg.client.co.uk)
 *   CLOUDFLARE_TOKEN   - Cloudflare API token with DNS Edit permission
 *   CLOUDFLARE_ZONE_ID - Zone ID for the parent domain (e.g., client.co.uk)
 *   RECIPIENT_EMAIL    - Where form submissions should be sent
 *
 * Usage: node scripts/setup-mailgun.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load from project config, fall back to env vars
let config = {};
const configPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'project-config.json');
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || '{MAILGUN_API_KEY}';
const MAILGUN_DOMAIN = config.mailgun?.domain || process.env.MAILGUN_DOMAIN || '{MAILGUN_DOMAIN}';
const CLOUDFLARE_TOKEN = process.env.CLOUDFLARE_TOKEN || '{CLOUDFLARE_TOKEN}';
const CLOUDFLARE_ZONE_ID = config.cloudflare?.zoneId || process.env.CLOUDFLARE_ZONE_ID || '{CLOUDFLARE_ZONE_ID}';

const MAILGUN_REGION = process.env.MAILGUN_REGION || 'EU';
const MAILGUN_API = MAILGUN_REGION === 'US' ? 'https://api.mailgun.net/v3' : 'https://api.eu.mailgun.net/v3';
const CF_API = 'https://api.cloudflare.com/client/v4';

// --- Step 1: Create Mailgun domain ---
async function createMailgunDomain() {
  console.log(`Creating Mailgun domain: ${MAILGUN_DOMAIN}...`);

  const form = new URLSearchParams();
  form.append('name', MAILGUN_DOMAIN);
  form.append('smtp_password', 'mg-' + Math.random().toString(36).slice(2, 14));
  form.append('web_scheme', 'https');

  const res = await fetch(`${MAILGUN_API}/domains`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`api:${MAILGUN_API_KEY}`),
    },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    if (text.includes('already exists')) {
      console.log('  Domain already exists, fetching DNS records...');
      return getDomainInfo();
    }
    throw new Error(`Mailgun create failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  console.log('  Domain created!');
  return data;
}

// --- Get domain info (DNS records) ---
async function getDomainInfo() {
  const res = await fetch(`${MAILGUN_API}/domains/${MAILGUN_DOMAIN}`, {
    headers: {
      'Authorization': 'Basic ' + btoa(`api:${MAILGUN_API_KEY}`),
    },
  });

  if (!res.ok) throw new Error(`Mailgun get domain failed: ${await res.text()}`);
  return res.json();
}

// --- Step 2: Add DNS records to Cloudflare ---
async function addCloudflareRecord(record) {
  const body = {
    type: record.record_type,
    name: record.name,
    content: record.value,
    ttl: 3600,
    proxied: false,
  };

  if (record.record_type === 'MX') {
    body.priority = parseInt(record.priority) || 10;
  }

  console.log(`  Adding ${record.record_type} record: ${record.name}...`);

  const res = await fetch(`${CF_API}/zones/${CLOUDFLARE_ZONE_ID}/dns_records`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.success) {
    const errors = data.errors?.map(e => e.message).join(', ');
    if (errors?.includes('already exists')) {
      console.log(`    Already exists, skipping.`);
      return;
    }
    console.error(`    Failed: ${errors}`);
  } else {
    console.log(`    OK`);
  }
}

async function setupDNS(domainData) {
  console.log('\nAdding DNS records from Mailgun...');

  const records = [
    ...(domainData.sending_dns_records || []),
    ...(domainData.receiving_dns_records || []),
  ];

  if (records.length === 0) {
    console.log('  No DNS records found in Mailgun response.');
    console.log('  You may need to fetch them manually from the Mailgun dashboard.');
    return;
  }

  // Add all records from the Mailgun API response.
  // This includes SPF, DKIM, CNAME, and MX records with the correct
  // region-specific values (EU uses mta._domainkey, eu.mailgun.org, etc.)
  for (const record of records) {
    await addCloudflareRecord(record);
  }

  // --- Add DMARC record (not included in Mailgun response) ---
  const parentDomain = MAILGUN_DOMAIN.replace(/^[^.]+\./, '');
  console.log('\nAdding DMARC record...');
  await addCloudflareRecord({
    record_type: 'TXT',
    name: `_dmarc.${parentDomain}`,
    value: 'v=DMARC1; p=none; pct=100; fo=1; ri=3600; rua=mailto:dmarc@' + parentDomain + '; ruf=mailto:dmarc@' + parentDomain + ';',
  });
}

// --- Step 3: Verify domain ---
async function verifyDomain() {
  console.log('\nTriggering Mailgun domain verification...');

  const res = await fetch(`${MAILGUN_API}/domains/${MAILGUN_DOMAIN}/verify`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Basic ' + btoa(`api:${MAILGUN_API_KEY}`),
    },
  });

  if (res.ok) {
    console.log('  Verification triggered. DNS propagation may take a few minutes.');
  } else {
    console.log(`  Verification request returned ${res.status} — check Mailgun dashboard.`);
  }
}

// --- Run ---
async function main() {
  const domainData = await createMailgunDomain();
  await setupDNS(domainData);
  await verifyDomain();

  console.log('\n--- Summary ---');
  console.log(`Mailgun domain: ${MAILGUN_DOMAIN}`);
  console.log(`DNS records added to Cloudflare zone: ${CLOUDFLARE_ZONE_ID}`);
  console.log('\nNext steps:');
  console.log('1. Wait a few minutes for DNS propagation');
  console.log('2. Check verification status at https://app.mailgun.com/mg/sending/domains');
  console.log(`3. Add MAILGUN_API_KEY and MAILGUN_DOMAIN to your Cloudflare Worker env vars`);
  console.log(`4. Add RECIPIENT_EMAIL to your Cloudflare Worker env vars`);
  console.log('\nDone!');
}

main().catch(console.error);
