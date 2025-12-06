import jwt from "jsonwebtoken";

export function verifyAdminToken(req: Request) {
  const header = req.headers.get("Authorization");

  if (!header) return null;

  const token = header.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return { raw: token, decoded };
  } catch (e) {
    return null;
  }
}
