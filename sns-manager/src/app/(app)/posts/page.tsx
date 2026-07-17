import { Suspense } from "react";
import { PostListView } from "@/features/posts/PostListView";
import { Spinner } from "@/components/ui/primitives";

export default function PostsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PostListView />
    </Suspense>
  );
}
