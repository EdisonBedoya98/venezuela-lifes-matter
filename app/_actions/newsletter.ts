"use server";

import {
  subscribeToUpdates,
  type UpdatesActionState,
} from "@/app/_lib/data-service";

export async function subscribeToUpdatesAction(
  _previousState: UpdatesActionState,
  formData: FormData,
) {
  return subscribeToUpdates(formData);
}
