import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { nothing } from 'lit-html';
import { defaultStyles } from '../../styles';
import { exportParts, importParts } from '../../directives/ExportParts';
import { Tooltip } from '../Tooltip';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'cai-panel-section': any;
    }
  }
}

@customElement('cai-panel-section')
export class PanelSection extends LitElement {
  @property({ type: String })
  header = '';

  @property({ type: String })
  helpText: string | null = null;

  static readonly cssParts = {
    ...importParts(Tooltip.cssParts),
    layout: 'section-layout',
    heading: 'section-heading',
    headingText: 'section-heading-text',
  };

  static get styles() {
    return [
      defaultStyles,
      css`
        :host {
          display: block;
        }
        div.layout {
          display: grid;
          grid-template-columns: auto;
          grid-template-rows: auto;
          gap: 0.5rem;
        }
        div.layout.table {
          grid-template-columns: 120px auto;
        }
        div.heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        div.heading-text {
          font-weight: bold;
        }
      `,
    ];
  }

  render() {
    return html`
      <div part=${PanelSection.cssParts.layout} class="layout">
        <div part=${PanelSection.cssParts.heading} class="heading">
          <div part=${PanelSection.cssParts.headingText} class="heading-text">
            ${this.header}
          </div>
          <slot name="help">
            ${this.helpText
              ? html`<cai-tooltip exportparts=${exportParts(Tooltip.cssParts)}>
                  <div slot="content">${this.helpText}</div>
                </cai-tooltip>`
              : nothing}
          </slot>
        </div>
        <slot></slot>
      </div>
    `;
  }
}
