<template>
  <div class="flex min-h-[80vh] flex-col items-center justify-center px-4 md:px-6 py-8 md:py-12 relative">
    <div class="hidden sm:block absolute top-20 left-20 text-4xl hippie-float opacity-10">☮</div>
    <div class="hidden sm:block absolute bottom-20 right-20 text-3xl hippie-float-delayed opacity-10">🌀</div>
    <div class="hidden sm:block absolute top-1/3 right-10 text-2xl hippie-float opacity-10">✨</div>

    <div class="w-full max-w-md flex justify-center">
      <SignIn
        routing="hash"
        sign-up-url="/user/register"
        fallback-redirect-url="/user"
        :appearance="{
          layout: {
            socialButtonsPlacement: 'bottom',
            shimmer: true,
          },
          variables: {
            colorPrimary: '#a78bfa',
            colorBackground: '#0d0020',
            colorInputBackground: 'rgba(255, 255, 255, 0.03)',
            colorInputText: '#fff',
            colorText: '#fff',
            colorTextSecondary: 'rgba(255,255,255,0.5)',
            colorTextOnPrimaryBackground: '#fff',
            borderRadius: '1rem',
          },
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-[#0d0020]/80 backdrop-blur-xl border border-primary-500/20 shadow-[0_0_50px_rgba(139,92,246,0.1)] py-10 px-8',
            headerTitle: 'text-3xl font-black neon-text tracking-tight mb-2',
            headerSubtitle: 'text-white/40 text-sm mb-6',
            socialButtonsBlockButton: 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/30 transition-all duration-300 text-white font-medium h-12',
            socialButtonsBlockButtonText: 'text-white font-semibold',
            dividerRow: 'my-8',
            dividerText: 'text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold bg-[#0d0020] px-4',
            dividerLine: 'bg-white/5',
            formFieldLabel: 'text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2 ml-1',
            formFieldInput: 'bg-white/5 border-white/10 text-white placeholder-white/20 rounded-xl focus:border-primary-400 focus:ring-1 focus:ring-primary-400 h-12 transition-all',
            formButtonPrimary: 'w-full bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 hover:from-primary-500 hover:to-secondary-400 text-white font-bold py-4 rounded-xl shadow-[0_10px_20px_rgba(139,92,246,0.2)] border-none transform transition-all active:scale-95',
            footerActionText: 'text-white/30 text-sm',
            footerActionLink: 'text-primary-400 hover:text-primary-300 transition-colors font-bold',
            identityPreviewText: 'text-white',
            identityPreviewEditButtonIcon: 'text-primary-400',
            formResendCodeLink: 'text-primary-400',
            otpCodeFieldInput: 'bg-white/5 border-white/10 text-white'
          }
        }"
      />
    </div>
  </div>
</template>
