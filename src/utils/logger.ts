export class Logger {
  private static instance: Logger;

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string, meta: Record<string, unknown> = {}): void {
    const log = {
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...meta,
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(log));
  }
}