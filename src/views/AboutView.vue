<template>
  <div class="flex min-h-screen">
    <div class="m-auto max-w-3xl p-10 text-neutral-700 space-y-5">
      <h1 class="text-2xl font-semibold text-neutral-900">
        Freelancer Calculator Portugal
      </h1>
      <p>
        This open-source calculator estimates net income, Portuguese IRS and
        Social Security for freelancers using the simplified Category B model
        implemented in the simulator. It supports individual assessment, a joint
        single-income scenario, dependent deductions and saved simulations
        stored in your browser localStorage.
      </p>
      <p>
        The project is maintained by Bruno Ramos de Matos as a derivative of the
        original open-source work by Francisco Macedo:
        <a
          class="underline underline-offset-4 hover:text-neutral-900"
          href="https://github.com/franciscobmacedo/remotefreelancept"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/franciscobmacedo/remotefreelancept </a
        >.
      </p>
      <p>
        The calculations are indicative estimates, not accounting, legal or tax
        advice. They do not cover every Portuguese tax rule, such as shared
        custody, disability deductions, minimum-existence rules, additional
        collection deductions or the solidarity surcharge. Validate your own
        situation with Autoridade Tributaria e Aduaneira or a qualified
        professional.
      </p>
      <div class="flex flex-wrap gap-4">
        <router-link
          to="/"
          class="hover:text-neutral-600 hover:decoration-neutral-600 underline underline-offset-4"
        >
          go to simulator
        </router-link>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/brunoramosdematos/freelancer-calculator-pt"
          class="hover:text-neutral-600 hover:decoration-neutral-600 underline underline-offset-4"
        >
          contribute on GitHub
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
