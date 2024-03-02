import { HttpErrors } from "@fastify/sensible";
import { Path } from "@kitajs/runtime";
import { sql } from "../../../db";
import { customersCache } from "../../../cache";

type Transaction = { value: number; type: string; description: string; created_at: string };

export async function get(id: Path<number>, errors: HttpErrors) {
  const customer = customersCache.get(id);
  if (!customer) {
    throw errors.notFound();
  }

  const [customerBalance, transactions] = await Promise.all([
    sql<{ balance: number }[]>`SELECT balance FROM customers WHERE id = ${id}`,
    sql<Transaction[]>
      `SELECT value, "type", "description", created_at
      FROM transactions
      WHERE customer_id = ${id}
      ORDER BY created_at DESC
      LIMIT 10`,
  ]);

  return {
    saldo: {
      total: customerBalance[0].balance,
      data_extrato: new Date(),
      limite: customer.limit,
    },
    ultimas_transacoes: transactions.map(({ value, type, description, created_at }) =>
      ({ valor: value, tipo: type, descricao: description, realizada_em: created_at }))
  };
}
