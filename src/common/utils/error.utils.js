export class ConflictException extends Error {
  constructor(message) {
    super(message, { cause: 409 });
  }
}

export class NotFoundException extends Error {
  constructor(message) {
    super(message, { cause: 404 });
  }
}

export class UnauthorizedException extends Error {
  constructor(message) {
    super(message, { cause: 401 });
  }
}

export class BadReqException extends Error {
  details;
  constructor(message, details = []) {
    super(message, { cause: 400 }); 
    this.details = details;
  }
}
