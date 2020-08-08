import crypto from 'crypto';

export function makeSalt(): string {
  return `${Math.round(new Date().valueOf() * Math.random())} `;
}

export function hashPassword(password: string, salt: string): string {
  try {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
  } catch (error) {
    return '';
  }
}

export function doPasswordsMatch(
  rawPassword: string,
  hashedPassword: string,
  salt: string,
): boolean {
  return hashPassword(rawPassword, salt) === hashedPassword;
}
