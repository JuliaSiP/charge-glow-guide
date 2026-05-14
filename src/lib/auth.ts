import { authenticateUser, getUserById, type UserRole } from "./database";

export const DRIVER_TOKEN = "flui-driver-demo-token";
export const ADMIN_TOKEN = "flui-admin-demo-token";

const TOKEN_TO_USER_ID: Record<string, string> = {
  [DRIVER_TOKEN]: "usr-driver-001",
  [ADMIN_TOKEN]: "usr-admin-001",
};

export function loginWithPassword(email: string, password: string) {
  const user = authenticateUser(email, password);
  if (!user) return undefined;

  return {
    user,
    token: user.role === "ADMIN" ? ADMIN_TOKEN : DRIVER_TOKEN,
  };
}

export function getUserFromRequest(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  const userId = TOKEN_TO_USER_ID[token];
  return userId ? getUserById(userId) : undefined;
}

export function hasRole(request: Request, roles: UserRole[]) {
  const user = getUserFromRequest(request);
  return user && roles.includes(user.role) ? user : undefined;
}
