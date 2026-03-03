import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import {tuiInjectElement} from '@taiga-ui/cdk/utils/dom';

const DOT = '…';
const SAMPLE = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

@Injectable()
export class TuiTruncateService {
    private readonly el = tuiInjectElement();
    private readonly ctx = isPlatformBrowser(inject(PLATFORM_ID))
        ? inject(DOCUMENT).createElement('canvas').getContext('2d')
        : null;

    /**
     * Caretaker note:
     * Text truncation algorithm based on CanvasRenderingContext2D text metrics.
     * Inspired by techniques discussed in:
     * - https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/measureText
     * - https://html.spec.whatwg.org/multipage/canvas.html#textmetrics
     * - https://stackoverflow.com/questions/2936112/text-wrap-in-a-canvas-element?utm_source=chatgpt.com
     *
     * The approach uses `canvas.measureText()` to compute text width in pixels
     * and performs a binary-style reduction to fit text into the available width.
     * Center truncation logic adapted for filenames and multi-line layouts.
     */
    public truncate(text: string, lines: number): string {
        if (!this.ctx) {
            return text;
        }

        const style = getComputedStyle(this.el);
        const fontFamily = style.fontFamily || 'sans-serif';
        const fontSize = style.fontSize || '14px';
        const fontWeight = style.fontWeight || '400';
        const lineHeight = parseFloat(style.lineHeight) || parseFloat(fontSize) * 1.2;
        const paddingLeft = parseFloat(style.paddingLeft) || 0;
        const paddingRight = parseFloat(style.paddingRight) || 0;
        const availableWidth = this.el.clientWidth - paddingLeft - paddingRight;
        const maxHeight = lineHeight * lines;
        const heightLimit = Math.min(maxHeight, maxHeight);

        this.ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;

        if (this.ctx.measureText(text).width <= availableWidth) {
            return text;
        }

        const avgCharWidth = this.ctx.measureText(SAMPLE).width / SAMPLE.length;
        const maxCharsPerLine = Math.floor(availableWidth / avgCharWidth);
        const maxChars = Math.max(
            4,
            Math.floor(maxCharsPerLine * (heightLimit / lineHeight)),
        );

        if (text.length <= maxChars) {
            return text;
        }

        const keepLength = maxChars - DOT.length;
        const left = Math.ceil(keepLength / 2);
        let right = Math.floor(keepLength / 2);
        let truncated = truncate(text, left, right);

        while (right < text.length) {
            const best = truncate(text, left, right + 1);
            const width = this.ctx.measureText(best).width;

            if (width < availableWidth) {
                right++;

                truncated = best;
            } else {
                break;
            }
        }

        return truncated;
    }
}

function truncate(text: string, left: number, right: number): string {
    return `${text.slice(0, left)}${DOT}${text.slice(-right)}`;
}
