#!/usr/bin/env node
/**
 * Push shared slice models and custom types to Prismic.
 * Reads credentials from docs/project-config.json.
 * Inserts first; on 409 (already exists) falls back to update.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(join(root, 'docs/project-config.json'), 'utf8'));
const { repositoryName, writeToken } = config.prismic;

const headers = {
  Authorization: `Bearer ${writeToken}`,
  repository: repositoryName,
  'Content-Type': 'application/json',
};

const API = 'https://customtypes.prismic.io';

async function push(kind, body) {
  const id = body.id;
  let res = await fetch(`${API}/${kind}/insert`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (res.status === 409) {
    res = await fetch(`${API}/${kind}/update`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    console.log(`${kind}/${id}: updated (${res.status})`);
  } else {
    console.log(`${kind}/${id}: inserted (${res.status})`);
  }
  if (!res.ok) {
    console.error(`  FAILED: ${await res.text()}`);
    process.exitCode = 1;
  }
}

// Slices
const slicesDir = join(root, 'src/slices');
for (const name of readdirSync(slicesDir)) {
  let model;
  try {
    model = JSON.parse(readFileSync(join(slicesDir, name, 'model.json'), 'utf8'));
  } catch {
    continue;
  }
  await push('slices', model);
}

// Custom types
const ctDir = join(root, 'customtypes');
for (const name of readdirSync(ctDir)) {
  let ct;
  try {
    ct = JSON.parse(readFileSync(join(ctDir, name, 'index.json'), 'utf8'));
  } catch {
    continue;
  }
  await push('customtypes', ct);
}

// Verify
const slicesRes = await fetch(`${API}/slices`, { headers });
const ctRes = await fetch(`${API}/customtypes`, { headers });
const sliceIds = (await slicesRes.json()).map((s) => s.id).sort();
const ctIds = (await ctRes.json()).map((c) => c.id).sort();
console.log('\nVerified slices in repo:', sliceIds.join(', '));
console.log('Verified custom types in repo:', ctIds.join(', '));
