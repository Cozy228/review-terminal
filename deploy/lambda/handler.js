/**
 * AWS Lambda Handler for Review Terminal Auth Server
 *
 * This handler uses Hono's AWS Lambda adapter to run the auth server
 * as a serverless function.
 */

import { handle } from 'hono/aws-lambda';
import { app } from './authApp.js';

/**
 * Lambda handler function
 * Hono's handle() adapter converts Lambda events to Hono requests
 * and Hono responses back to Lambda response format
 */
export const handler = handle(app);
