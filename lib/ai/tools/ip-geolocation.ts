import { tool } from 'ai';
import { z } from 'zod';

export const ipGeolocationTool = tool({
  description:
    'Get geolocation information for an IP address, including country, city, ISP, and timezone.',
  strict: true,
  inputSchema: z.object({
    ip: z.string().describe('The IP address to look up, e.g. "8.8.8.8"'),
  }),
  execute: async ({ ip }) => {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,query`);
    const data = await res.json();

    if (data.status === 'fail') {
      return { ip, error: data.message ?? 'Lookup failed' };
    }

    return {
      ip: data.query,
      country: data.country,
      region: data.regionName,
      city: data.city,
      zip: data.zip,
      latitude: data.lat,
      longitude: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      organization: data.org,
    };
  },
});
