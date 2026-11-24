# Findings
### Code logic improvements
1) In matcher.ts it was querying the database for each transaction and fetching the same data since its querying by company.id

2) We are searching through all the invoices everytime we need to match a transaction, this means that an invoice can be matched twice to two different transactions and is also slow. If i was to create a unique index on matched_invoice_id then we wouldn't save already matched invoices but thats just a simple step. 

### DB updates
1) I found no foreign keys between tables which means when we add an invoice with a wrong company_id we would have dangling and invalid data that is never fetched.
2) No indexes used so querying is slow and inefficient.
3) Need unique values where things should be unique, FOR EXAMPLE : company.siren

I added the indexes/foreign keys at the end of the migration file.
I saw that seeding didnt work because there was one transaction with a bad account id
### Assumptions
Company - Siren is 1 to 1
When amount is greater than 0 then it is outgoing
When deleted we should not match it

### Architecture
Assuming we need to run this for many companies and many invoices what i would do is add a kafka and have it run in the background for each company this way multiple companies can run at the same time and it wont hold the api (if this is an api that is being used).

This is part is assuming alot as i dont know the business logic behind this other than what is said in the readme.

