import type { Pool, QueryResultRow } from "pg";
import type { CompanyRepositoryInterface } from "../../application/interfaces/company-repository-interface";

type CompanyRow = QueryResultRow & { id: string };

export class CompanyRepository implements CompanyRepositoryInterface {
  constructor(private readonly pool: Pool) {}

  async findIdBySiren(siren: string): Promise<string | null> {
    const { rows } = await this.pool.query<CompanyRow>(
      "select id from company where siren = $1 limit 1",
      [siren],
    );

    return rows[0]?.id ?? null;
  }
}