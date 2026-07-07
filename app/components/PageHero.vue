<script setup lang="ts"></script>

<template>
  <section class="hero relative w-full">
    <div class="hero-wrap">
      <NuxtImg
        src="/hero/frog-forest-hero.png"
        alt="Ilustrace kouzelného lesa s žabkami a muchomůrkami — signature artwork Tynky Bordel"
        width="2000"
        height="1140"
        sizes="sm:100vw md:100vw lg:100vw"
        format="webp"
        quality="82"
        loading="eager"
        fetchpriority="high"
        preload
        class="hero-img"
      />
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding-top: 1rem;
  padding-inline: 1rem;
}
@media (min-width: 768px) {
  .hero { padding-top: 1.5rem; padding-inline: 2rem; }
}

.hero-wrap {
  max-width: 1400px;
  margin: 0 auto;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(42, 19, 64, 0.14);
  border: 1px solid rgba(42, 19, 64, 0.08);
  background: #1a0f28;
  aspect-ratio: 24 / 9;
}
@media (max-width: 640px) {
  .hero-wrap { aspect-ratio: 16 / 10; }
}

.hero-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 42%;
}
</style>
