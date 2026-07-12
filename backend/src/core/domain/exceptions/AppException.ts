export class AppException extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppException';
    this.statusCode = statusCode;
    this.code = code;
  }

  static unauthorized(message: string = 'No autorizado'): AppException {
    return new AppException(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Acceso denegado'): AppException {
    return new AppException(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'Recurso no encontrado'): AppException {
    return new AppException(message, 404, 'NOT_FOUND');
  }

  static badRequest(message: string = 'Solicitud invalida'): AppException {
    return new AppException(message, 400, 'BAD_REQUEST');
  }

  static conflict(message: string = 'Conflicto'): AppException {
    return new AppException(message, 409, 'CONFLICT');
  }
}
