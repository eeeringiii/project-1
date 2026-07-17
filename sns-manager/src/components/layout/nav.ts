/**
 * サイドバーのナビゲーション定義
 */
import {
  Calendar,
  FileText,
  Image,
  LayoutDashboard,
  PlusCircle,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/content/new", label: "コンテンツ作成", icon: PlusCircle },
  { href: "/posts", label: "投稿一覧", icon: FileText },
  { href: "/calendar", label: "カレンダー", icon: Calendar },
  { href: "/media", label: "素材管理", icon: Image },
  { href: "/brand", label: "ブランドルール", icon: Settings },
];
