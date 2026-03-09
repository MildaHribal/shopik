<script setup lang="ts">
import { Icon } from "@iconify/vue";

const form = ref({
  name: '',
  email: '',
  message: ''
});

const isSubmitting = ref(false);
const toast = useCosmicToast();

const handleSubmit = async () => {
  isSubmitting.value = true;
  // Simulace odeslání
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  toast.success('Zpráva odeslána!', 'Brzy se vám ozveme zpět na vaši domovskou planetu.');
  
  form.value = {
    name: '',
    email: '',
    message: ''
  };
  isSubmitting.value = false;
};
</script>

<template>
  <div class="glass-card-strong p-6 md:p-10 lg:p-12 relative overflow-hidden group">
    <!-- Background Glow -->
    <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] group-hover:bg-primary-500/20 transition-colors duration-700"></div>
    <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary-500/10 rounded-full blur-[80px] group-hover:bg-secondary-500/20 transition-colors duration-700"></div>

    <div class="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <!-- Left Side: Info -->
      <div class="flex flex-col justify-center">
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
          Napiš nám na <br />
          <span class="neon-text-rainbow">domovskou planetu</span>
        </h2>
        <p class="text-white/50 text-base md:text-lg mb-10 max-w-md leading-relaxed">
          Máš dotaz ohledně objednávky? Hledáš konkrétní krystal? Nebo nám jen chceš poslat dobrou energii? Jsme tu pro tebe.
        </p>

        <div class="space-y-6">
          <div class="flex items-center gap-4 group/item">
            <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover/item:border-primary-500/50 group-hover/item:bg-primary-500/10 transition-all duration-300">
              <Icon icon="mdi:account-outline" height="20" class="text-primary-400" />
            </div>
            <div>
              <p class="text-sm font-bold text-white">Kristýna Egnerová</p>
            </div>
          </div>

          <div class="flex items-center gap-4 group/item">
            <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover/item:border-primary-500/50 group-hover/item:bg-primary-500/10 transition-all duration-300">
              <Icon icon="mdi:map-marker-outline" height="20" class="text-primary-400" />
            </div>
            <div>
              <p class="text-sm font-bold text-white">Kosmická 42, 110 00 Praha</p>
            </div>
          </div>

          <div class="flex items-center gap-4 group/item">
            <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover/item:border-secondary-500/50 group-hover/item:bg-secondary-500/10 transition-all duration-300">
              <Icon icon="mdi:phone-outline" height="20" class="text-secondary-400" />
            </div>
            <div>
              <p class="text-sm font-bold text-white">+420 777 888 999</p>
            </div>
          </div>

          <div class="flex items-center gap-4 group/item">
            <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover/item:border-primary-500/50 group-hover/item:bg-primary-500/10 transition-all duration-300">
              <Icon icon="mdi:email-outline" height="20" class="text-primary-400" />
            </div>
            <div>
              <p class="text-sm font-bold text-white">hello@shopik.space</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side: Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-1">Jméno</label>
            <input 
              v-model="form.name"
              type="text" 
              placeholder="Tvé pozemské jméno" 
              required
              class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all placeholder:text-white/10"
            />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-1">E-mail</label>
            <input 
              v-model="form.email"
              type="email" 
              placeholder="Tvůj e-mail" 
              required
              class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all placeholder:text-white/10"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-1">Zpráva</label>
          <textarea 
            v-model="form.message"
            rows="5" 
            placeholder="Co máš na srdci?..." 
            required
            class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all placeholder:text-white/10 resize-none"
          ></textarea>
        </div>

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full btn-cosmic py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 group/btn"
        >
          <Icon v-if="isSubmitting" icon="lucide:loader-2" height="24" class="animate-spin" />
          <span v-else>Odeslat zprávu</span>
          <Icon v-if="!isSubmitting" icon="mdi:send" height="20" class="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
        </button>
      </form>
    </div>
  </div>
</template>
