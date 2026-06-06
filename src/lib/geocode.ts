export type GeocodeResult = {
  label: string;
  lat: number;
  lng: number;
};

type GsiFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    title?: string;
  };
};

export async function searchDestination(query: string): Promise<GeocodeResult> {
  const trimmed = query.trim();

  if (!trimmed) {
    throw new Error("住所または地名を入力してください。");
  }

  const response = await fetch(
    `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(trimmed)}`
  );

  if (!response.ok) {
    throw new Error("検索に失敗しました。");
  }

  const features = (await response.json()) as GsiFeature[];
  const first = features[0];
  const coordinates = first?.geometry?.coordinates;

  if (!coordinates) {
    throw new Error("目的地が見つかりませんでした。");
  }

  return {
    label: first.properties?.title ?? trimmed,
    lng: coordinates[0],
    lat: coordinates[1]
  };
}
