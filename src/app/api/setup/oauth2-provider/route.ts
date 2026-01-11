import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

async function executeSQL(sql: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const psql = spawn('docker', [
      'exec', 
      'authentik-postgresql-1',
      'psql',
      '-U', 'authentik',
      '-d', 'authentik',
      '-t', '-c',
      sql
    ]);

    let output = '';
    let error = '';

    psql.stdout.on('data', (data) => {
      output += data.toString();
    });

    psql.stderr.on('data', (data) => {
      error += data.toString();
    });

    psql.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`SQL execution failed: ${error}`));
      } else {
        resolve(output.trim());
      }
    });

    psql.stdin.write(sql);
    psql.stdin.end();
  });
}

export async function POST(request: Request) {
  try {
    // Generate client_id and client_secret
    const crypto = require('crypto');
    const client_id = crypto.randomBytes(20).toString('base64').replace(/[=+/]/g, '');
    const client_secret = crypto.randomBytes(32).toString('base64').replace(/[=+/]/g, '');

    // Get the authorization flow UUID
    const flowResult = await executeSQL(
      "SELECT flow_uuid FROM authentik_flows_flow WHERE slug='default-provider-authorization-explicit-consent' LIMIT 1;"
    );
    
    const flow_uuid = flowResult.trim();
    
    if (!flow_uuid) {
      throw new Error('Could not find authorization flow');
    }

    // Create provider in database
    const createProviderSQL = `
INSERT INTO authentik_core_provider (name, authorization_flow_id)
VALUES ('qBittorrent', '${flow_uuid}'::uuid);
    `;

    await executeSQL(createProviderSQL);

    // Create OAuth2 provider
    const createOAuth2SQL = `
INSERT INTO authentik_providers_oauth2_oauth2provider (
  provider_ptr_id,
  client_type,
  client_id,
  client_secret,
  include_claims_in_id_token,
  refresh_token_validity,
  sub_mode,
  issuer_mode,
  access_code_validity,
  access_token_validity,
  _redirect_uris
) SELECT
  id,
  'confidential',
  '${client_id}',
  '${client_secret}',
  true,
  '24:00:00',
  'user_id',
  'per_provider',
  '1 minutes',
  '1 minutes',
  '["http://192.168.50.234:8181/oauth2/callback"]'::jsonb
FROM authentik_core_provider WHERE name='qBittorrent' AND id NOT IN (SELECT provider_ptr_id FROM authentik_providers_oauth2_oauth2provider);
    `;

    await executeSQL(createOAuth2SQL);

    // Create application
    const createAppSQL = `
INSERT INTO authentik_core_application (name, slug, policybindingmodel_ptr_id, provider_id)
SELECT 'qBittorrent', 'qbittorrent', gen_random_uuid(), id FROM authentik_core_provider WHERE name='qBittorrent' AND id NOT IN (SELECT provider_id FROM authentik_core_application WHERE slug='qbittorrent');
    `;

    await executeSQL(createAppSQL);

    return NextResponse.json({
      success: true,
      credentials: {
        client_id,
        client_secret,
        flow_uuid,
        redirect_uri: 'http://192.168.50.234:8181/oauth2/callback'
      }
    });
  } catch (error) {
    console.error('Error creating OAuth2 provider:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create OAuth2 provider' },
      { status: 500 }
    );
  }
}
