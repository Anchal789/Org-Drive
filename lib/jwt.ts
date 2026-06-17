import { jwtVerify, SignJWT } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function generateAccessToken(
  userId: string,
  telegramId: string,
  firstName: string,
  lastName: string,
  username: string,
  photoUrl: string,
) {
  return await new SignJWT({
    userId,
    telegramId,
    firstName,
    lastName,
    username,
    photoUrl,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5s')
    .sign(secret);
}

export async function generateRefreshToken(
  userId: string,
  telegramId: string,
  firstName: string | null,
  lastName: string | null,
  username: string | null,
  photoUrl: string | null,
) {
  return await new SignJWT({
    userId,
    telegramId,
    firstName,
    lastName,
    username,
    photoUrl,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}
