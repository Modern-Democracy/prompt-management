import type {ModalComponent} from "@skeletonlabs/skeleton";
import ContextModal from "$lib/Modals/ContextModal.svelte";
import CostModal from "$lib/Modals/CostModal.svelte";
import SettingsModal from "$lib/Modals/SettingsModal.svelte";
import ShareModal from "$lib/Modals/ShareModal.svelte";
import SuggestTitleModal from "$lib/Modals/SuggestTitleModal.svelte";

export const modalComponentRegistry: Record<string, ModalComponent> = {
    ContextModal: { ref: ContextModal },
    CostModal: { ref: CostModal },
    SettingsModal: { ref: SettingsModal },
    ShareModal: { ref: ShareModal },
    SuggestTitleModal: { ref: SuggestTitleModal },
};
