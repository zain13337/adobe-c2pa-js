import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import merge from 'lodash/merge';
import intersection from 'lodash/intersection';
import tippy, {
  Instance as TippyInstance,
  Props as TippyProps,
  Placement,
} from 'tippy.js';
import { PartPrefixable } from '../mixins/PartPrefixable';
import { defaultStyles } from '../styles';
import '../../assets/svg/monochrome/help.svg';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'cai-popover': any;
    }
  }
}

/**
 * These properties are handled by the property/attribute values and cannot be overridden in the `options` map
 */
type AttributeTippyProps = 'placement' | 'interactive' | 'trigger';
/**
 * These properties are not overridable since it would interfere with proper component functioning
 */
type ImmutableTippyProps =
  | AttributeTippyProps
  | 'allowHTML'
  | 'appendTo'
  | 'content'
  | 'onMount';
/**
 * This contains all properties that are overridable via the `options` attribute
 */
type AllowedTippyProps = Partial<Omit<TippyProps, ImmutableTippyProps>>;

@customElement('cai-popover')
export class Popover extends PartPrefixable(LitElement) {
  private _tippyInstance: TippyInstance | null = null;

  static readonly cssParts: Record<string, string> = {
    arrow: 'popover-arrow',
    box: 'popover-box',
    content: 'popover-content',
  };

  @property({ type: String })
  placement: Placement = 'auto-start';

  @property({ type: Boolean })
  interactive = true;

  /**
   * Allows you to override default Tippy.js options specified in the `AllowedTippyProps` type
   */
  @property({ type: Object })
  options: AllowedTippyProps = {};

  @property({ type: String })
  trigger: string = 'mouseenter focus';

  @query('#arrow')
  arrowElement: HTMLElement | undefined;

  @query('#content')
  contentElement: HTMLElement | undefined;

  @query('#trigger')
  triggerElement: HTMLElement | undefined;

  static get styles() {
    return [
      defaultStyles,
      // Imported from tippy.css
      css`
        .tippy-box[data-animation='fade'][data-state='hidden'] {
          opacity: 0;
        }
        [data-tippy-root] {
          max-width: calc(100vw - 10px);
        }
        .tippy-box {
          position: relative;
          background-color: var(--cai-popover-bg-color, #fff);
          color: var(--cai-popover-color, #222222);
          transition-property: transform, visibility, opacity;
        }
        .tippy-content {
          transition-property: none;
        }
        .tippy-box[data-placement^='top'] > .tippy-arrow {
          bottom: 0;
        }
        .tippy-box[data-placement^='top'] > .tippy-arrow:before {
          bottom: -7px;
          left: 0;
          border-width: 8px 8px 0;
          border-top-color: initial;
          transform-origin: center top;
        }
        .tippy-box[data-placement^='bottom'] > .tippy-arrow {
          top: 0;
        }
        .tippy-box[data-placement^='bottom'] > .tippy-arrow:before {
          top: -7px;
          left: 0;
          border-width: 0 8px 8px;
          border-bottom-color: initial;
          transform-origin: center bottom;
        }
        .tippy-box[data-placement^='left'] > .tippy-arrow {
          right: 0;
        }
        .tippy-box[data-placement^='left'] > .tippy-arrow:before {
          border-width: 8px 0 8px 8px;
          border-left-color: initial;
          right: -7px;
          transform-origin: center left;
        }
        .tippy-box[data-placement^='right'] > .tippy-arrow {
          left: 0;
        }
        .tippy-box[data-placement^='right'] > .tippy-arrow:before {
          left: -7px;
          border-width: 8px 8px 8px 0;
          border-right-color: initial;
          transform-origin: center right;
        }
        .tippy-box[data-inertia][data-state='visible'] {
          transition-timing-function: cubic-bezier(0.54, 1.5, 0.38, 1.11);
        }
        .tippy-arrow {
          width: 16px;
          height: 16px;
          color: var(--cai-popover-bg-color, #fff);
        }
        .tippy-arrow:before {
          content: '';
          position: absolute;
          border-color: transparent;
          border-style: solid;
        }
      `,
    ];
  }

  /**
   * Gets the backing Tippy.js instance
   * @see {@link https://atomiks.github.io/tippyjs/v6/methods/}
   */
  get tippyInstance() {
    return this._tippyInstance;
  }

  private _decorateTippyDom(instance: TippyInstance) {
    const root = instance.popper;
    ['arrow', 'box', 'content'].forEach((part) => {
      root
        .querySelector(`.tippy-${part}`)
        ?.setAttribute('part', this.renderPart(part));
    });
    instance.popperInstance?.update();
  }

  private _getTippyProps() {
    const overridableDefaults: Partial<TippyProps> = {
      animation: 'fade',
      hideOnClick: false,
    };
    const immutableProps: Pick<TippyProps, ImmutableTippyProps> = {
      allowHTML: true, // We always want this to be based on a content element
      appendTo: 'parent',
      content: this.contentElement!,
      placement: this.placement,
      interactive: this.interactive,
      trigger: this.trigger,
      onMount: this._decorateTippyDom.bind(this),
    };

    return merge(
      overridableDefaults,
      this.options,
      // Options where attributes take precedence or can't be changed
      immutableProps,
    );
  }

  firstUpdated(): void {
    this._tippyInstance = tippy(this.triggerElement!, this._getTippyProps());
  }

  disconnectedCallback(): void {
    this._tippyInstance?.destroy();
    super.disconnectedCallback();
  }

  /**
   * Make sure we update Tippy.js whenever any related attributes change
   */
  updated(changedProperties: any) {
    const changedKeys = Object.keys(changedProperties);
    const hadRelatedChange =
      intersection(changedKeys, Popover.observedAttributes).length > 0;
    if (hadRelatedChange) {
      this._tippyInstance?.setProps(this._getTippyProps());
    }
  }

  render() {
    return html`<div id="element">
      <div id="content">
        <slot name="content"></slot>
      </div>
      <div id="trigger">
        <slot id="trigger" name="trigger"></slot>
      </div>
    </div>`;
  }
}
