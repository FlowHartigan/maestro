import manifest from '../.build/media.json';

export function media(source) {
  if (!manifest[source]) throw new Error(`Missing image: ${source}`);
  return manifest[source].src;
}

export function variants(source) {
  return manifest[source]?.srcSet;
}
