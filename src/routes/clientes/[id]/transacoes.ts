import { HttpErrors } from "@fastify/sensible";
import { Body, Path } from "@kitajs/runtime";
import { sql } from "../../../db";
import { customersCache } from "../../../cache";

type Balance = { balance: number };

export async function post(
  id: Path<number>,
  body: Body<{ valor: number; tipo: string; descricao: string; }>,
  errors: HttpErrors
) {
  const customer = customersCache.get(id);
  if (!customer) {
    throw errors.notFound();
  }

  const { valor: value, descricao: description, tipo: type } = body;

  const validationSuccess =
    /^\d+$/.test(value.toString()) // TODO: find a better way to check if a number is an integer
    && value > 0
    && ["c", "d"].includes(type)
    && description.length > 0
    && description.length < 11;
  if (!validationSuccess) {
    throw errors.unprocessableEntity();
  }

  // TODO: find a way to pass the value 'debit'/'credit' as a string parameter.
  const trxResult = type === "c"
    ? await sql<Balance[]>`SELECT credit as balance FROM credit(${id}, ${value}, ${description});`
    : await sql<Balance[]>`SELECT debit as balance FROM debit(${id}, ${value}, ${description});`;
  if (!trxResult.length) {
    throw errors.unprocessableEntity();
  }

  return { limite: customer.limit, saldo: trxResult[0].balance };
}
