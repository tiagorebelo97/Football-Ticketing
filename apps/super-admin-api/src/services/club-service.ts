import axios from 'axios';
import Stripe from 'stripe';
import pool from '../db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function createClub(data: {
  name: string;
  slug: string;
  keycloakRealmId: string;
  stripeAccountId: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  const result = await pool.query(
    `INSERT INTO clubs (name, slug, keycloak_realm_id, stripe_account_id, logo_url, primary_color, secondary_color)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [data.name, data.slug, data.keycloakRealmId, data.stripeAccountId, data.logoUrl, data.primaryColor, data.secondaryColor]
  );
  
  return result.rows[0];
}

export async function provisionKeycloakRealm(slug: string): Promise<string> {
  try {
    const keycloakUrl = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
    const adminUser = process.env.KEYCLOAK_ADMIN || 'admin';
    const adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';
    
    // Get admin token
    const tokenResponse = await axios.post(
      `${keycloakUrl}/realms/master/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: 'admin-cli',
        username: adminUser,
        password: adminPassword,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    const token = tokenResponse.data.access_token;
    
    // Create realm
    const realmName = `club-${slug}`;
    await axios.post(
      `${keycloakUrl}/admin/realms`,
      {
        realm: realmName,
        enabled: true,
        displayName: slug,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return realmName;
  } catch (error: any) {
    console.error('Error provisioning Keycloak realm:', error.response?.data || error.message);
    throw new Error('Failed to provision Keycloak realm');
  }
}

export async function provisionStripeAccount(name: string, slug: string): Promise<string> {
  try {
    const account = await stripe.accounts.create({
      type: 'standard',
      country: 'US',
      email: `${slug}@example.com`,
      business_profile: {
        name: name,
      },
    });
    
    return account.id;
  } catch (error: any) {
    console.error('Error provisioning Stripe account:', error.message);
    throw new Error('Failed to provision Stripe account');
  }
}
