import React, { useState, useEffect } from 'react';
import { Platform, Image, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

/**
 * SafeSvgUri
 * Solves react-native-svg's "Unexpected end of input (1:0)" error.
 * - On Web: uses native <Image /> to prevent browser CORS blocks on SVG fetch
 * - On Native: validates SVG text before parsing to prevent parser crash on empty/corrupt response
 */
export default function SafeSvgUri({
  uri,
  width,
  height,
  style,
  onError,
  fallback = null,
}) {
  const [svgContent, setSvgContent] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!uri) {
      setHasError(true);
      return;
    }

    // On Web, native Image handles SVG without CORS or XML parsing errors
    if (Platform.OS === 'web') {
      return;
    }

    fetch(uri)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (!isMounted) return;
        const trimmed = (text || '').trim();
        if (trimmed && (trimmed.startsWith('<svg') || trimmed.includes('<svg'))) {
          setSvgContent(trimmed);
        } else {
          setHasError(true);
          if (onError) onError();
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasError(true);
          if (onError) onError();
        }
      });

    return () => {
      isMounted = false;
    };
  }, [uri]);

  if (!uri || hasError) {
    return fallback;
  }

  if (Platform.OS === 'web') {
    return (
      <Image
        source={{ uri }}
        style={[{ width, height }, style]}
        resizeMode="contain"
        onError={() => {
          setHasError(true);
          if (onError) onError();
        }}
      />
    );
  }

  if (!svgContent) {
    return fallback;
  }

  try {
    return (
      <SvgXml
        xml={svgContent}
        width={width}
        height={height}
        style={style}
        onError={() => {
          setHasError(true);
          if (onError) onError();
        }}
      />
    );
  } catch (err) {
    return fallback;
  }
}

