insert into company (id, siren, name)
values ('c0000000-0000-4000-8000-000000000001', '123456789', 'Acme Ltd');

insert into account (id, company_id)
values ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001');

insert into buying_invoice
  (id, company_id, supplier_name, invoice_number, tax_free_total, vat_amount, due_date)
values
  ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Acme', 'INV-1', 100, 20, '2026-02-10'),
  ('b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'Acme', 'INV-2', 100, 20, '2026-02-10');

update buying_invoice
set deleted_at = now()
where id = 'b0000000-0000-4000-8000-000000000002';

insert into transaction
  (id, account_id, amount, label, date, matched_invoice_id, deleted_at)
values
  ('10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', -120, 'ACME INV-1', '2026-01-31', null, null),
  ('10000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 120, 'credit', '2026-01-31', null, null),
  ('10000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', -120, 'deleted', '2026-01-31', null, now()),
  ('10000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', -120, 'already matched', '2026-01-31', 'b0000000-0000-4000-8000-000000000001', null);
