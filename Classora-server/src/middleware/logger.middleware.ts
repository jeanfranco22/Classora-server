import { NextFunction, Request, Response } from 'express';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function getMethodColor(method: string): string {
  const map: Record<string, string> = {
    GET: colors.green,
    POST: colors.cyan,
    PUT: colors.yellow,
    PATCH: colors.magenta,
    DELETE: colors.red,
  };
  return map[method] ?? colors.reset;
}

function getStatusColor(status: number): string {
  if (status < 300) return colors.green;
  if (status < 400) return colors.cyan;
  if (status < 500) return colors.yellow;
  return colors.red;
}

export function LoggerGlobal(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  const timeStamp = new Date().toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    dateStyle: 'short',
    timeStyle: 'medium',
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    const methodColor = getMethodColor(req.method);
    const statusColor = getStatusColor(res.statusCode);

    console.log(
      `${colors.bright}[${timeStamp}]${colors.reset} ` +
        `${methodColor}${colors.bright}${req.method}${colors.reset} ` +
        `${req.url} ` +
        `${statusColor}${colors.bright}${res.statusCode}${colors.reset} ` +
        `- ${duration}ms`,
    );
  });

  next();
}
