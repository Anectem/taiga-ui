import {
    ChangeDetectionStrategy,
    Component,
    computed,
    Directive,
    effect,
    inject,
    input,
    ViewEncapsulation,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {
    WA_MUTATION_OBSERVER_INIT,
    WaMutationObserverService,
} from '@ng-web-apis/mutation-observer';
import {WaResizeObserverService} from '@ng-web-apis/resize-observer';
import {tuiInjectElement} from '@taiga-ui/cdk/utils/dom';
import {tuiWithStyles} from '@taiga-ui/cdk/utils/miscellaneous';
import {map} from 'rxjs';

import {TuiTruncateService} from './truncate.service';

@Component({
    template: '',
    styleUrl: './truncate.styles.less',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class Styles {}

@Directive({
    selector: '[tuiTruncate]',
    providers: [
        TuiTruncateService,
        WaResizeObserverService,
        WaMutationObserverService,
        {
            provide: WA_MUTATION_OBSERVER_INIT,
            useValue: {
                attributes: true,
                characterData: true,
                subtree: true,
            },
        },
    ],
    host: {tuiTruncate: ''},
})
export class TuiTruncate {
    private readonly service = inject(TuiTruncateService);
    private readonly el = tuiInjectElement();
    private readonly width = toSignal(
        inject(WaResizeObserverService).pipe(map(([e]) => e?.contentRect.width ?? 0)),
        {initialValue: 0},
    );

    private readonly text = toSignal(
        inject(WaMutationObserverService).pipe(map(() => this.el.innerText.trim())),
        {initialValue: this.el.innerText.trim()},
    );

    protected readonly nothing = tuiWithStyles(Styles);
    protected readonly $ = effect(() => {
        this.el.setAttribute('data-text', this.truncated());
    });

    public readonly lines = input(1, {
        alias: 'tuiTruncate',
        transform: (value: unknown) => Math.max(Number(value) || 1, 1),
    });

    public readonly truncated = computed(() =>
        this.width() ? this.service.truncate(this.text(), this.lines()) : this.text(),
    );
}
