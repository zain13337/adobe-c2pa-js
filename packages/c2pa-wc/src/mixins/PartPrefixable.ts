import { LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';

type Constructor<T> = new (...args: any[]) => T;

export declare class PartPrefixableInterface {
  partPrefix: string;

  localPrefix: string;
  renderPart(partId: string): string;
}

/**
 * Allows an element's exported CSS parts to be prefixed in a particular context.
 *
 * @remarks
 * This is meant to solve an issue where we need to style more than one instance
 * of an element in a DOM structure separate from another. For example, both the L2
 * popover uses the `<cai-popover>` element, as well as the tooltips contained inside the
 * L2 popover. We want to have styling control over each, and therefore need some way
 * to distinguish the popover parts in the tooltip context vs. the root context.
 *
 * This should only need to be used in components that are likely to be nested and shared
 * across multiple contexts, such as `<cai-popover>`, `<cai-thumbnail>`, `<cai-icon>`, and the like.
 *
 * At the time of this writing, this is only used in `<cai-popover>`, so that when used
 * with `<cai-tooltip>`, we can prefix the exported parts with `tooltip-`, and style
 * them like such in this context:
 *
 * @example
 * #### A popover in the tooltip context:
 * ```css
 *  &::part(tooltip-popover-arrow) { ... }
 *  &::part(tooltip-popover-box) { ... }
 *  &::part(tooltip-popover-content) { ... }
 * ```
 * #### A popover _not_ in the tooltip context:
 * ```css
 *  &::part(popover-arrow) { ... }
 *  &::part(popover-box) { ... }
 *  &::part(popover-content) { ... }
 * ```
 *
 * To do this, the tooltip needs to bring in the element like so:
 *
 * @example
 * ```ts
 * import { exportParts, importParts } from '../directives/ExportParts';
 *
 * export class Tooltip extends LitElement {
 *   static readonly popoverPrefix = 'tooltip';
 *
 *   static readonly cssParts = {
 *     ...importParts(Popover.cssParts, Tooltip.popoverPrefix),
 *   };
 *
 *   render() {
 *     return html`
 *       <cai-popover
 *         part-prefix=${Tooltip.popoverPrefix}
 *         exportparts=${exportParts(Popover.cssParts, Tooltip.popoverPrefix)}
 *       >
 *         <div class="content"> ... </div>
 *       </cai-popover>
 *     `;
 *   }
 * }
 * ```
 *
 * Unfortunately, we need to repeat the `part-prefix` in the last argument of `exportParts` unless we
 * bring in the concept of `ref`s, which poses its own set of complexity and challenges.
 *
 * We also need to call `importParts` so that we can export the `tooltip-popover-*` parts if this component's
 * parts are re-exported.
 */
export const PartPrefixable = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class PartPrefixableElement extends superClass {
    @property({ type: String, attribute: 'part-prefix' })
    partPrefix = '';

    renderPart(partId: string) {
      const partName = (this.constructor as any).cssParts[partId];
      return this.partPrefix ? `${this.partPrefix}-${partName}` : partName;
    }
  }

  return PartPrefixableElement as Constructor<PartPrefixableInterface> & T;
};
