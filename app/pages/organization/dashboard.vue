<template>
    <div>
        <OrganizationMenu></OrganizationMenu>

        <main class="main-content">
            <header class="page-header">
                <div class="page-title">
                    <h1 id="welcomeMessage">Willkommen!</h1>
                    <p>Hier ist Ihre aktuelle Übersicht über den Helfer-Bedarf</p>
                </div>
            </header>

            <!-- Statistics Grid -->
            <div class="stats-grid">
                <div class="card">
                    <div class="card-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 28px; height: 28px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                            </path>
                        </svg>
                    </div>
                    <div class="card-title">Aktive Veranstaltungen</div>
                    <div class="card-value" id="eventsCount">-</div>
                </div>

                <div class="card">
                    <div class="card-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 28px; height: 28px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01">
                            </path>
                        </svg>
                    </div>
                    <div class="card-title">Offene Dienste</div>
                    <div class="card-value" id="shiftsCount">-</div>

                </div>
            </div>

            <!-- Content Grid -->
            <div class="content-grid">
                <div class="card">
                    <h3 style="margin-bottom: 16px;">Meine Nächsten Veranstaltungen</h3>
                    <ul class="event-list" id="upcomingEventsList">
                        <li class="event-item">
                            <div>
                                <div class="event-name">Lade Veranstaltungen...</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import OrganizationMenu from '../../components/OrganizationMenu.vue'

onMounted(() => {
    setTimeout(() => {
        const authenticated = localStorage.getItem('token')

        if (authenticated) {
            navigateTo('/dashboard')
        } else {
            navigateTo('/login')
        }
    }, 500)
})
</script>