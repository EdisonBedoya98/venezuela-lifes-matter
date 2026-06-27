"use server";

import {
  subscribeToUpdates,
  type UpdatesActionState,
} from "@/app/_lib/supabase-data";

export async function subscribeToUpdatesAction(
  _previousState: UpdatesActionState,
  formData: FormData,
) {
  return subscribeToUpdates(formData);
}
