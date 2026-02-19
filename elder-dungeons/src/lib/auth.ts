import jwt from "jsonwebtoken";

import { ADMIN_PASSWORD, ADMIN_USERNAME } from "@/lib/admin-auth";

export type JwtPayload = {
  sub?: string;
  userId?: string | number;
  email?: string;
  iat?: number;
  exp?: number;
};

export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export function verifyJwtToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.verify(token, secret) as JwtPayload;
}

export function extractBasicCredentials(authHeader?: string): { username: string; password: string } | null {
  if (!authHeader) return null;

  const [scheme, value] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "basic" || !value) {
    return null;
  }

  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    const splitIndex = decoded.indexOf(":");

    if (splitIndex === -1) return null;

    return {
      username: decoded.slice(0, splitIndex),
      password: decoded.slice(splitIndex + 1),
    };
  } catch {
    return null;
  }
}

export function isAdminBasicAuth(authHeader?: string): boolean {
  const credentials = extractBasicCredentials(authHeader);

  if (!credentials) return false;

  return (
    credentials.username.trim().toLowerCase() === ADMIN_USERNAME &&
    credentials.password === ADMIN_PASSWORD
  );
}

export function assertAdminOrJwt(authHeader?: string): void {
  if (isAdminBasicAuth(authHeader)) {
    return;
  }

  const token = extractBearerToken(authHeader);
  if (!token) {
    throw new Error("MISSING_AUTH");
  }

  verifyJwtToken(token);
}
