import { Directive, directive } from 'lit/directive.js';
import uniq from 'lodash/uniq';
import reduce from 'lodash/reduce';

function prefixPart(prefix = '') {
  return (part: string) => (prefix ? `${prefix}-${part}` : part);
}

class ExportParts extends Directive {
  render(
    parts: Record<string, string> | Record<string, string>[],
    prefix = '',
  ) {
    const partsList = Array.isArray(parts) ? parts : [parts];
    return uniq(partsList.map((part) => Object.values(part)).flat())
      .map(prefixPart(prefix))
      .join(',');
  }
}

/**
 * Imports and prefixes another component's `cssParts` so they can be re-exported from this
 * component while retaining their prefix for this context.
 *
 * @param sourceMap The `cssParts` static property of the component class you want to import
 * @param prefix The prefix to prepend to the part IDs and names
 * @returns A new object containing prefixed part IDs and names
 */
export function importParts(sourceMap: Record<string, string>, prefix = '') {
  const prefixer = prefixPart(prefix);
  return reduce<Record<string, string>, Record<string, string>>(
    sourceMap,
    (acc, val, key) => {
      acc[prefixer(key)] = prefixer(val);
      return acc;
    },
    {},
  );
}

/**
 * Renders a comma-delimited, deduplicated list of CSS parts with an optional prefix
 */
export const exportParts = directive(ExportParts);
