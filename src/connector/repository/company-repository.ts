import type { Pool, QueryResultRow } from "pg";
import type { CompanyRepositoryInterface } from "../../application/interfaces/company-repository-interface";
import { Company } from "../../domain/entities/company";

type CompanyRow = QueryResultRow & {
  id: string;
  name: string;
  siren: string;
};

export class CompanyRepository implements CompanyRepositoryInterface {
  constructor(private readonly pool: Pool) {}

  async findCompanyBySiren(siren: string): Promise<Company | null> {
    const { rows } = await this.pool.query<CompanyRow>(
      "select id, name, siren from company where siren = $1 limit 1",
      [siren],
    );

    return rows[0] ?? null;
  }
}