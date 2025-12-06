import jwt from "jsonwebtoken";
import { getPermissionsForRole } from "./permissions";

export async function authoriseAdmin(req: Request, permission: string) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No Authorization header provided");

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new Error("No auth_token cookie found");
    }
    const admin = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!admin.is_admin) {
      throw new Error("Not an admin user");
    }

    const permissions = await getPermissionsForRole(admin.role_id, token);

    if (!permissions.has(permission)) {
      throw new Error("Insufficient permissions");
    }

    return admin;
  } catch (error: any) {
    throw new Error(`Authorization error: ${error.message || error}`);
  }
}
