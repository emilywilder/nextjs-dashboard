'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  // reduce likelihood of float point errors
  const amountInCents = amount * 100;
  // create date with format 'YYYY-MM-DD'
  const date = new Date().toISOString().split('T')[0];
  // another method:
  // const rawFormData = Object.fromEntries(formData.entries())

  console.log(
    `customerId: ${customerId}, amount: ${amountInCents}, status: ${status}, date: ${date}`,
  );
  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
}
