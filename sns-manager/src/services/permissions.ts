/**
 * 権限判定サービス
 *
 * role → 許可された操作(Permission) を判定する純粋関数。
 * Phase 2 では Supabase RLS がサーバー側の最終防衛線になるが、
 * UI側でも操作可否を制御して誤操作を防ぐ。
 */
import { ROLE_PERMISSIONS, type Permission } from "@/constants";
import type { UserRole } from "@/types/domain";

export function can(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAny(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p));
}
