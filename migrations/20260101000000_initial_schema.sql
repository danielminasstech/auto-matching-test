create table company (
  id uuid primary key,
  siren varchar(9) not null unique,
  name varchar(255)
);

create table account (
  id uuid primary key,
  company_id uuid,
  iban varchar(255)
);

create table transaction (
  id uuid primary key,
  account_id uuid,
  remote_id varchar(255),
  amount real,
  label varchar(255),
  reference varchar(255),
  status varchar(255),
  date date,
  matched_invoice_id uuid,
  deleted_at timestamp
);

create table buying_invoice (
  id uuid primary key,
  company_id uuid,
  supplier_name varchar(255),
  invoice_number varchar(255),
  tax_free_total real,
  vat_amount real,
  due_date varchar(255),
  invoice_status varchar(255),
  deleted_at timestamp
);

alter table account
  add constraint account_company_fk
  foreign key (company_id) references company (id)
  deferrable initially deferred;

alter table transaction
  add constraint transaction_account_fk
  foreign key (account_id) references account (id)
  deferrable initially deferred,
  add constraint transaction_matched_invoice_fk
  foreign key (matched_invoice_id) references buying_invoice (id)
  deferrable initially deferred;

alter table buying_invoice
  add constraint buying_invoice_company_fk
  foreign key (company_id) references company (id)
  deferrable initially deferred;

create index transaction_matched_invoice_id_idx
  on transaction (matched_invoice_id)
  where matched_invoice_id is not null;

create index buying_invoice_company_id_idx on buying_invoice (company_id);

create index transaction_unmatched_outgoing_by_account_idx
  on transaction (account_id)
  where matched_invoice_id is null
    and deleted_at is null
    and amount < 0;

create index buying_invoice_active_by_company_idx
  on buying_invoice (company_id)
  where deleted_at is null;

