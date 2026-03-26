import {
  useFieldArray,
  useFormContext,
  type ArrayPath,
  type FieldValues,
} from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DrawerSection } from './section';

type ItemizedValues = FieldValues & {
  items: Array<{ description: string; amount: number }>;
};

type LineItemListProps<TValues extends ItemizedValues> = {
  title?: string;
};

export function LineItemList<TValues extends ItemizedValues>({
  title = 'Line items',
}: LineItemListProps<TValues>) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<TValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items' as ArrayPath<TValues>,
  });

  const itemErrors = (errors.items as Array<
    | {
        description?: { message?: string };
        amount?: { message?: string };
      }
    | undefined
  >) ?? [];

  return (
    <DrawerSection
      title={title}
      description="Capture the items and amounts for this record."
      contentClassName="space-y-3"
    >
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="space-y-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px]">
            <div>
              <p className="mb-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Description
              </p>
              <Input
                {...register(`items.${index}.description` as never)}
                placeholder="Describe the work or product"
              />
              {itemErrors[index]?.description?.message ? (
                <p className="mt-1 text-xs text-red-500">
                  {itemErrors[index]?.description?.message}
                </p>
              ) : null}
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Amount
              </p>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register(`items.${index}.amount` as never, {
                  valueAsNumber: true,
                })}
                placeholder="0.00"
              />
              {itemErrors[index]?.amount?.message ? (
                <p className="mt-1 text-xs text-red-500">
                  {itemErrors[index]?.amount?.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              Remove item
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ description: '', amount: 0 } as never)}
      >
        Add item
      </Button>

      {typeof errors.items?.message === 'string' ? (
        <p className="text-xs text-red-500">{errors.items.message}</p>
      ) : null}
    </DrawerSection>
  );
}
