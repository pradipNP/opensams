-- SAMS Nepal — Seed 006: Asset Statuses

INSERT INTO asset_statuses (id, name, slug, color_code, description, sort_order) VALUES
('66666666-6666-4666-8666-666666666601', 'Active', 'active', '#16A34A', 'Asset is in working condition', 1),
('66666666-6666-4666-8666-666666666602', 'Damaged', 'damaged', '#DC2626', 'Asset is damaged and needs attention', 2),
('66666666-6666-4666-8666-666666666603', 'Under Maintenance', 'under_maintenance', '#D97706', 'Asset is currently under maintenance', 3),
('66666666-6666-4666-8666-666666666604', 'Disposed', 'disposed', '#64748B', 'Asset has been disposed', 4),
('66666666-6666-4666-8666-666666666605', 'Lost', 'lost', '#7C3AED', 'Asset is lost or unaccounted for', 5);
