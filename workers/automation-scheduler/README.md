# Fooodis Automation Scheduler Worker

A standalone Cloudflare Worker that runs scheduled tasks for the Fooodis platform.

## Features

- **Scheduled Post Publishing**: Automatically publishes blog posts at their scheduled time
- **AI Content Generation**: Triggers automation paths to generate blog content
- **Cron Support**: Runs on configurable schedules (every 6 hours + daily at 9 AM UTC)
- **Manual Triggers**: HTTP endpoints for manual task execution

## Deployment

```bash
cd workers/automation-scheduler
wrangler deploy
```

## Configuration

The worker uses the same D1 database, KV namespace, and R2 bucket as the main site.

### Environment Variables

Set in Cloudflare Dashboard or wrangler.toml:

- `MAIN_SITE_URL`: URL of the main Fooodis site (default: https://fooodis.com)
- `AUTOMATION_API_KEY`: Optional API key for securing manual trigger endpoints

### Cron Schedule

Default schedule (configurable in wrangler.toml):
- `0 */6 * * *` - Every 6 hours
- `0 9 * * *` - Daily at 9 AM UTC

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/status` | GET | Check worker status and bindings |
| `/trigger/publish` | POST | Manually trigger scheduled post publishing |
| `/trigger/automation` | POST | Manually trigger automation paths |

## Security

Add an `AUTOMATION_API_KEY` to KV for securing the manual trigger endpoints:

```bash
wrangler kv:put --namespace-id=<KV_ID> AUTOMATION_API_KEY "your-secret-key"
```

Then include in requests:
```bash
curl -X POST https://fooodis-automation-scheduler.<your-subdomain>.workers.dev/trigger/publish \
  -H "Authorization: Bearer your-secret-key"
```

## Monitoring

Check worker logs in Cloudflare Dashboard > Workers & Pages > fooodis-automation-scheduler > Logs
