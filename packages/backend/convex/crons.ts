import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.hourly(
  'purge expired MCP OAuth records',
  { minuteUTC: 0 },
  internal.mcp.internal.purgeExpired
);

export default crons;
