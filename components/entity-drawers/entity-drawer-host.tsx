'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPopup,
  DrawerPortal,
  DrawerRoot,
  DrawerViewport,
} from '@/components/ui/slide-over';
import { drawerRegistry, useEntityDrawerSubscriptions } from './drawer-registry';
import type { EntityDrawerDefinition, EntityDrawerState } from './types';

type EntityDrawerHostProps = {
  state: EntityDrawerState | null;
  onStateChange: (state: EntityDrawerState | null) => void;
};

function EntityDrawerScreen({
  state,
  onStateChange,
}: {
  state: EntityDrawerState;
  onStateChange: (state: EntityDrawerState | null) => void;
}) {
  useEntityDrawerSubscriptions();

  const definition = drawerRegistry[state.entityType] as unknown as EntityDrawerDefinition<
    any,
    Record<string, unknown>
  >;
  const detail = state.recordId ? definition.load(state.recordId) : undefined;
  const title = definition.getTitle(detail);

  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(definition.schema as any),
    defaultValues: definition.getDefaultValues(detail) as Record<string, unknown>,
  });

  const isMissingRecord = Boolean(state.recordId) && !detail;

  const handleSubmit = form.handleSubmit(async (values) => {
    const result = await definition.save(values, {
      recordId: state.recordId,
    });
    onStateChange({ entityType: state.entityType, recordId: result.id });
  });

  return (
    <DrawerContent>
      <FormProvider {...form}>
        <form className="flex h-full min-h-0 flex-col" onSubmit={handleSubmit}>
          <DrawerHeader title={title} />

          <DrawerBody>
            {isMissingRecord ? (
              <div className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                This record could not be found. It may have been removed.
              </div>
            ) : (
              <definition.Fields detail={detail} />
            )}
          </DrawerBody>

          {!isMissingRecord ? (
            <DrawerFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onStateChange(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Saving...'
                  : state.recordId
                    ? 'Save changes'
                    : `Create ${definition.label}`}
              </Button>
            </DrawerFooter>
          ) : null}
        </form>
      </FormProvider>
    </DrawerContent>
  );
}

export function EntityDrawerHost({
  state,
  onStateChange,
}: EntityDrawerHostProps) {
  return (
    <DrawerRoot
      open={state != null}
      onOpenChange={(open: boolean) => {
        if (!open) onStateChange(null);
      }}
      swipeDirection="right"
    >
      <DrawerPortal>
        <DrawerBackdrop />
        <DrawerViewport>
          <DrawerPopup>
            {state ? (
              <EntityDrawerScreen
                key={`${state.entityType}:${state.recordId ?? 'new'}`}
                state={state}
                onStateChange={onStateChange}
              />
            ) : null}
          </DrawerPopup>
        </DrawerViewport>
      </DrawerPortal>
    </DrawerRoot>
  );
}
