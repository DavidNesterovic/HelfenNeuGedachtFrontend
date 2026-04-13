<template>
    <div class="min-h-screen bg-gray-50 flex">
        <OrganizationMenu />

        <main class="flex-1 ml-64 p-8">
            <header class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold">Veranstaltungen</h1>
                <button @click="showForm = !showForm" class="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    {{ showForm ? 'Abbrechen' : 'Neue Veranstaltung' }}
                </button>
            </header>

            <div v-if="showForm" class="bg-white p-6 rounded-xl border mb-6 shadow-sm">
                <form @submit.prevent="saveEvent" class="grid grid-cols-2 gap-4">
                    <input v-model="newEvent.title" placeholder="Titel" class="border p-2 rounded" />
                    <input v-model="newEvent.location" placeholder="Ort" class="border p-2 rounded" />
                    <input v-model="newEvent.startDate" type="datetime-local" class="border p-2 rounded" />
                    <input v-model="newEvent.endDate" type="datetime-local" class="border p-2 rounded" />
                    <button type="submit"
                        class="col-span-2 bg-green-600 text-white p-2 rounded font-bold">Speichern</button>
                </form>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left">Event</th>
                            <th class="px-6 py-3 text-left">Ort</th>
                            <th class="px-6 py-3 text-center">Aktion</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="event in events" :key="event.id" class="border-t">
                            <td class="px-6 py-4">{{ event.title }}</td>
                            <td class="px-6 py-4">{{ event.location }}</td>
                            <td class="px-6 py-4 text-center">
                                <button class="text-blue-600 font-medium">Details</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
</template>

<script setup>

onMounted(() => {
    // setTimeout(() => {
    //     const authenticated = localStorage.getItem('token')

    //     if (authenticated) {
    //         navigateTo('/dashboard')
    //     } else {
    //         navigateTo('/login')
    //     }
    // }, 500)
})

// Daten holen mit Nuxt useFetch oder useAsyncData (SSR-optimiert)
const config = useRuntimeConfig()
const { data: events, pending, refresh } = await useFetch(`${config.public.apiBase}/events`, {
    headers: { Authorization: `Bearer ${process.client ? localStorage.getItem('token') : ''}` }
});

const showForm = ref(false);
const newEvent = ref({ title: '', location: '', startDate: '', endDate: '' });

const saveEvent = async () => {
    await $fetch(`${config.public.apiBase}/events`, {
        method: 'POST',
        body: newEvent.value
    });
    showForm.value = false;
    refresh();
};
</script>