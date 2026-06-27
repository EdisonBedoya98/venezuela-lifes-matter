-- Initial catalog for real submissions.
-- Centers are intentionally not seeded. Public map and admin queues should
-- only show records created through Supabase forms or admin workflows.

insert into public.aid_categories (id, label, short_label, accent, surface, sort_order)
values
  ('food', 'Alimentacion', 'Comida', '#F7C948', '#FFF3BF', 10),
  ('health', 'Salud', 'Salud', '#24A7A1', '#D7F8F2', 20),
  ('shelter', 'Refugio', 'Refugio', '#EF6F61', '#FFE2DD', 30),
  ('documents', 'Documentos', 'Docs', '#4E7BD9', '#DFEAFF', 40),
  ('supplies', 'Ropa e insumos', 'Insumos', '#9B6ADB', '#EFE4FF', 50),
  ('transport', 'Transporte', 'Ruta', '#F29E4C', '#FFE8CC', 60),
  ('donations', 'Donaciones', 'Donar', '#5CB85C', '#DFF4DD', 70),
  ('volunteers', 'Voluntariado', 'Voluntarios', '#DB4E7A', '#FFE0EA', 80)
on conflict (id) do update
  set label = excluded.label,
      short_label = excluded.short_label,
      accent = excluded.accent,
      surface = excluded.surface,
      sort_order = excluded.sort_order,
      is_active = true,
      updated_at = now();

insert into public.aid_cities (id, name, department, map_center_lat, map_center_lng, map_zoom)
values
  ('medellin', 'Medellin', 'Antioquia', 6.2442000, -75.5812000, 12),
  ('cartagena', 'Cartagena', 'Bolivar', 10.3910000, -75.4794000, 12),
  ('barranquilla', 'Barranquilla', 'Atlantico', 10.9639000, -74.7964000, 12),
  ('santa-marta', 'Santa Marta', 'Magdalena', 11.2408000, -74.1990000, 12),
  ('bogota', 'Bogota', 'Bogota D.C.', 4.7110000, -74.0721000, 11)
on conflict (id) do update
  set name = excluded.name,
      department = excluded.department,
      map_center_lat = excluded.map_center_lat,
      map_center_lng = excluded.map_center_lng,
      map_zoom = excluded.map_zoom,
      is_active = true,
      updated_at = now();
