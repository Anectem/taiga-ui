import {
    computed,
    inject,
    Pipe,
    type PipeTransform,
    signal,
    untracked,
} from '@angular/core';
import {type TuiStringHandler} from '@taiga-ui/cdk/types';
import {TuiTextfieldComponent} from '@taiga-ui/core/components/textfield';
import {TUI_ITEMS_HANDLERS} from '@taiga-ui/core/directives/items-handlers';
import {tuiIsFlat} from '@taiga-ui/kit/utils';

import {
    TUI_FILTER_BY_INPUT_OPTIONS,
    type TuiFilterByInputOptions,
} from './filter-by-input.options';

@Pipe({name: 'tuiFilterByInput', pure: false})
export class TuiFilterByInputPipe implements PipeTransform {
    private readonly options = inject(TUI_FILTER_BY_INPUT_OPTIONS);
    private readonly textfield = inject(TuiTextfieldComponent);
    private readonly handlers = inject(TUI_ITEMS_HANDLERS);
    private readonly filterFlat = signal<TuiFilterByInputOptions['filter']>(
        this.options.filter,
    );

    private readonly items = signal<readonly any[] | null>([]);
    private readonly filtered = computed(
        (items = this.items()) =>
            items &&
            this.filter(
                items,
                this.filterFlat(),
                this.handlers.stringify(),
                this.textfield.value(),
            ),
    );

    public transform<T>(
        items: ReadonlyArray<readonly T[]>,
        filter?: TuiFilterByInputOptions<T>['filter'],
    ): ReadonlyArray<readonly T[]>;
    public transform<T>(
        items: readonly T[],
        filter?: TuiFilterByInputOptions<T>['filter'],
    ): readonly T[];
    public transform<T>(
        items: ReadonlyArray<readonly T[]> | null,
        filter?: TuiFilterByInputOptions<T>['filter'],
    ): ReadonlyArray<readonly T[]> | null;
    public transform<T>(
        items: readonly T[] | null,
        filter?: TuiFilterByInputOptions<T>['filter'],
    ): readonly T[] | null;
    public transform<T>(
        items: ReadonlyArray<readonly T[]> | readonly T[] | null,
        filter: TuiFilterByInputOptions<T>['filter'] = this.options.filter,
    ): ReadonlyArray<readonly T[]> | readonly T[] | null {
        untracked(() => {
            this.items.set(items);
            this.filterFlat.set(filter);
        });

        return this.filtered() as ReadonlyArray<readonly T[]> | readonly T[] | null;
    }

    private filter<T>(
        items: ReadonlyArray<readonly T[]> | readonly T[],
        filterFlat: TuiFilterByInputOptions<T>['filter'],
        stringify: TuiStringHandler<T>,
        query: string,
    ): ReadonlyArray<readonly T[]> | readonly T[] | null {
        return tuiIsFlat(items)
            ? filterFlat(items, query, stringify)
            : items.map((inner) => filterFlat(inner, query, stringify));
    }
}
