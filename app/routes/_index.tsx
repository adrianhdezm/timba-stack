import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [{ title: 'Remix App' }];
};

export default function Index() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <h1 className="text-3xl font-bold underline">Hello Remix!</h1>
    </div>
  );
}
