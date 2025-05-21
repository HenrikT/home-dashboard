export function validateLogin(email: string, password: string): boolean {
  if (email === "h@h.h" && password === "secret") {
    return true;
  }
  return false;
}
