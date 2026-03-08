'use client';
/* eslint-disable react-hooks/static-components -- dynamic renderer registry uses stable module-level lazy refs */

import { lazy, Suspense, type ComponentType } from 'react';
import type { AppTools } from '@/lib/ai/tools';

type ToolName = keyof AppTools;

type RendererProps = { data: unknown };

type LazyLoader = () => Promise<{ default: ComponentType<RendererProps> }>;

const rendererLoaders: Partial<Record<ToolName, LazyLoader>> = {
  getWeather: () => import('./weather').then((m) => ({ default: m.WeatherResult as ComponentType<RendererProps> })),
  searchWikipedia: () => import('./wikipedia').then((m) => ({ default: m.WikipediaResult as ComponentType<RendererProps> })),
  defineWord: () => import('./dictionary').then((m) => ({ default: m.DictionaryResult as ComponentType<RendererProps> })),
  getWorldTime: () => import('./world-time').then((m) => ({ default: m.WorldTimeResult as ComponentType<RendererProps> })),
  getCryptoPrice: () => import('./crypto-price').then((m) => ({ default: m.CryptoPriceResult as ComponentType<RendererProps> })),
  getCountryInfo: () => import('./country-info').then((m) => ({ default: m.CountryInfoResult as ComponentType<RendererProps> })),
  getTopHackerNews: () => import('./hacker-news').then((m) => ({ default: m.HackerNewsResult as ComponentType<RendererProps> })),
  convertUnits: () => import('./unit-converter').then((m) => ({ default: m.UnitConverterResult as ComponentType<RendererProps> })),
  generateQRCode: () => import('./qr-code').then((m) => ({ default: m.QRCodeResult as ComponentType<RendererProps> })),
  getExchangeRate: () => import('./exchange-rate').then((m) => ({ default: m.ExchangeRateResult as ComponentType<RendererProps> })),
  getColorInfo: () => import('./color-info').then((m) => ({ default: m.ColorInfoResult as ComponentType<RendererProps> })),
  getGitHubUser: () => import('./github-user').then((m) => ({ default: m.GitHubUserResult as ComponentType<RendererProps> })),
  getJoke: () => import('./joke').then((m) => ({ default: m.JokeResult as ComponentType<RendererProps> })),
  translateText: () => import('./translate').then((m) => ({ default: m.TranslateResult as ComponentType<RendererProps> })),
};

// Pre-create lazy components at module scope so they are stable across renders.
// This satisfies the React Compiler rule against creating components during render.
const renderers = new Map<string, ComponentType<RendererProps>>();
for (const [name, loader] of Object.entries(rendererLoaders)) {
  renderers.set(name, lazy(loader));
}

export function hasToolRenderer(name: string): boolean {
  return renderers.has(name);
}

export function ToolRenderer({ name, output }: { name: string; output: unknown }) {
  const Component = renderers.get(name);
  if (!Component) return null;

  return (
    <Suspense
      fallback={
        <div className="animate-pulse px-3 py-2 text-xs text-neutral-400">
          Loading…
        </div>
      }
    >
      <Component data={output} />
    </Suspense>
  );
}
