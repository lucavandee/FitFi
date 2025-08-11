import React from 'react';

export function lazyComponent<T extends React.ComponentType<any>>(
  importer: () => Promise<any>,
  prefer: string = 'default' // you can pass 'NovaChat' if needed
) {
  return React.lazy(async () => {
    const mod = await importer();
    const Comp = mod?.[prefer] ?? mod?.default ?? mod?.NovaChat;

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[lazyComponent] module keys:', Object.keys(mod || {}));
    }

    if (!Comp || (typeof Comp !== 'function' && typeof Comp !== 'object')) {
      // Throwing here gives a clear, actionable error instead of React's generic one
      throw new Error(
        `[lazyComponent] Imported module does not export a valid React component (tried "${prefer}", "default", "NovaChat").`
      );
    }

    return { default: Comp as T };
  });
}