import { type LoaderFunctionArgs, type MetaFunction, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { sql } from 'drizzle-orm';

export const meta: MetaFunction = () => {
  return [{ title: 'Remix App' }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const { db } = context;
  const response = await db.execute(sql`SELECT NOW();`);
  return json({ time: response.rows[0]?.now as string });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const time = new Date(data.time.replace(' ', 'T').slice(0, 26) + 'Z');

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <h1 className="text-3xl font-bold underline">Hello Remix!</h1>
      <p className="text-xl font-bold">{time.toISOString()}</p>
    </div>
  );
}
