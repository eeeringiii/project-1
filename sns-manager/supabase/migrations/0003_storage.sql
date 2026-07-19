-- =============================================================
-- Storage: 素材用バケット "media"
-- 画像/動画をアップロードし、公開URLで参照する。
-- （公開バケット。非公開にする場合は public=false にし、署名URL方式へ変更する）
-- =============================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- 参照は公開（public バケット）
create policy "media public read"
  on storage.objects for select
  using (bucket_id = 'media');

-- アップロード/更新/削除はログインユーザーのうち書き込み権限者に限定
create policy "media authenticated insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and fn_current_role() in ('admin','manager','staff'));

create policy "media authenticated update"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and fn_current_role() in ('admin','manager','staff'));

create policy "media authenticated delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and fn_current_role() in ('admin','manager','staff'));
