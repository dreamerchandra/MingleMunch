export class HttpError extends Error {
  statusCode: number;
  extra: Record<string, any>;
  constructor(
    statusCode: number,
    message: string,
    extra: Record<string, any> = {}
  ) {
    super(message);
    this.statusCode = statusCode;
    this.extra = extra;
  }
}
