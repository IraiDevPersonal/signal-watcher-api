import { Request } from "express";

function normalizeIP(ip: string): string {
  if (ip.startsWith("::ffff:")) {
    return ip.substring(7);
  }

  if (ip.includes(":") && !ip.includes(".")) {
    return ip.toLowerCase();
  }

  return ip;
}

export function getClientIP(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const firstIP = ips.split(",")[0].trim();
    if (firstIP) return normalizeIP(firstIP);
  }

  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  return normalizeIP(ip);
}
