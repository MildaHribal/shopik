<script setup lang="ts">
const RINGS = 30;
const rings = Array.from({ length: RINGS }, (_, i) => i + 1);
</script>

<template>
  <div class="ring-ornament" aria-hidden="true">
    <div v-for="n in rings" :key="n" :class="['ring', 'el-' + n]"></div>
  </div>
</template>

<style scoped>
.ring-ornament {
  position: absolute;
  width: 320px;
  height: 320px;
  pointer-events: none;
  opacity: 0.28;
  mix-blend-mode: screen;
}

.ring {
  position: absolute;
  margin: 0 auto;
  border: 2px solid transparent;
  box-sizing: border-box;
}

/* Generated 30 ring sizes + per-ring keyframes via SCSS-equivalent CSS.
   $box-size: 320px, $rings: 30, $duration: 2.5s, $lagdelay: 1.25 */
</style>

<style scoped>
/* Each ring: size = 320 * ((30 - i) / 30), centered, animation delay = 1.25 * 2.5s * perc */

/* Loop expansion (i=1..30). Generated to avoid SCSS at runtime. */
/* prettier-ignore */
.ring.el-1  { width: 309.33px; height: 309.33px; left:   5.33px; top:   5.33px; border-radius: 108.27px; animation: el-anim-1  2.5s linear infinite; animation-delay: 3.021s; }
.ring.el-2  { width: 298.67px; height: 298.67px; left:  10.67px; top:  10.67px; border-radius: 104.53px; animation: el-anim-2  2.5s linear infinite; animation-delay: 2.917s; }
.ring.el-3  { width: 288.00px; height: 288.00px; left:  16.00px; top:  16.00px; border-radius: 100.80px; animation: el-anim-3  2.5s linear infinite; animation-delay: 2.813s; }
.ring.el-4  { width: 277.33px; height: 277.33px; left:  21.33px; top:  21.33px; border-radius:  97.07px; animation: el-anim-4  2.5s linear infinite; animation-delay: 2.708s; }
.ring.el-5  { width: 266.67px; height: 266.67px; left:  26.67px; top:  26.67px; border-radius:  93.33px; animation: el-anim-5  2.5s linear infinite; animation-delay: 2.604s; }
.ring.el-6  { width: 256.00px; height: 256.00px; left:  32.00px; top:  32.00px; border-radius:  89.60px; animation: el-anim-6  2.5s linear infinite; animation-delay: 2.500s; }
.ring.el-7  { width: 245.33px; height: 245.33px; left:  37.33px; top:  37.33px; border-radius:  85.87px; animation: el-anim-7  2.5s linear infinite; animation-delay: 2.396s; }
.ring.el-8  { width: 234.67px; height: 234.67px; left:  42.67px; top:  42.67px; border-radius:  82.13px; animation: el-anim-8  2.5s linear infinite; animation-delay: 2.292s; }
.ring.el-9  { width: 224.00px; height: 224.00px; left:  48.00px; top:  48.00px; border-radius:  78.40px; animation: el-anim-9  2.5s linear infinite; animation-delay: 2.188s; }
.ring.el-10 { width: 213.33px; height: 213.33px; left:  53.33px; top:  53.33px; border-radius:  74.67px; animation: el-anim-10 2.5s linear infinite; animation-delay: 2.083s; }
.ring.el-11 { width: 202.67px; height: 202.67px; left:  58.67px; top:  58.67px; border-radius:  70.93px; animation: el-anim-11 2.5s linear infinite; animation-delay: 1.979s; }
.ring.el-12 { width: 192.00px; height: 192.00px; left:  64.00px; top:  64.00px; border-radius:  67.20px; animation: el-anim-12 2.5s linear infinite; animation-delay: 1.875s; }
.ring.el-13 { width: 181.33px; height: 181.33px; left:  69.33px; top:  69.33px; border-radius:  63.47px; animation: el-anim-13 2.5s linear infinite; animation-delay: 1.771s; }
.ring.el-14 { width: 170.67px; height: 170.67px; left:  74.67px; top:  74.67px; border-radius:  59.73px; animation: el-anim-14 2.5s linear infinite; animation-delay: 1.667s; }
.ring.el-15 { width: 160.00px; height: 160.00px; left:  80.00px; top:  80.00px; border-radius:  56.00px; animation: el-anim-15 2.5s linear infinite; animation-delay: 1.563s; }
.ring.el-16 { width: 149.33px; height: 149.33px; left:  85.33px; top:  85.33px; border-radius:  52.27px; animation: el-anim-16 2.5s linear infinite; animation-delay: 1.458s; }
.ring.el-17 { width: 138.67px; height: 138.67px; left:  90.67px; top:  90.67px; border-radius:  48.53px; animation: el-anim-17 2.5s linear infinite; animation-delay: 1.354s; }
.ring.el-18 { width: 128.00px; height: 128.00px; left:  96.00px; top:  96.00px; border-radius:  44.80px; animation: el-anim-18 2.5s linear infinite; animation-delay: 1.250s; }
.ring.el-19 { width: 117.33px; height: 117.33px; left: 101.33px; top: 101.33px; border-radius:  41.07px; animation: el-anim-19 2.5s linear infinite; animation-delay: 1.146s; }
.ring.el-20 { width: 106.67px; height: 106.67px; left: 106.67px; top: 106.67px; border-radius:  37.33px; animation: el-anim-20 2.5s linear infinite; animation-delay: 1.042s; }
.ring.el-21 { width:  96.00px; height:  96.00px; left: 112.00px; top: 112.00px; border-radius:  33.60px; animation: el-anim-21 2.5s linear infinite; animation-delay: 0.938s; }
.ring.el-22 { width:  85.33px; height:  85.33px; left: 117.33px; top: 117.33px; border-radius:  29.87px; animation: el-anim-22 2.5s linear infinite; animation-delay: 0.833s; }
.ring.el-23 { width:  74.67px; height:  74.67px; left: 122.67px; top: 122.67px; border-radius:  26.13px; animation: el-anim-23 2.5s linear infinite; animation-delay: 0.729s; }
.ring.el-24 { width:  64.00px; height:  64.00px; left: 128.00px; top: 128.00px; border-radius:  22.40px; animation: el-anim-24 2.5s linear infinite; animation-delay: 0.625s; }
.ring.el-25 { width:  53.33px; height:  53.33px; left: 133.33px; top: 133.33px; border-radius:  18.67px; animation: el-anim-25 2.5s linear infinite; animation-delay: 0.521s; }
.ring.el-26 { width:  42.67px; height:  42.67px; left: 138.67px; top: 138.67px; border-radius:  14.93px; animation: el-anim-26 2.5s linear infinite; animation-delay: 0.417s; }
.ring.el-27 { width:  32.00px; height:  32.00px; left: 144.00px; top: 144.00px; border-radius:  11.20px; animation: el-anim-27 2.5s linear infinite; animation-delay: 0.313s; }
.ring.el-28 { width:  21.33px; height:  21.33px; left: 149.33px; top: 149.33px; border-radius:   7.47px; animation: el-anim-28 2.5s linear infinite; animation-delay: 0.208s; }
.ring.el-29 { width:  10.67px; height:  10.67px; left: 154.67px; top: 154.67px; border-radius:   3.73px; animation: el-anim-29 2.5s linear infinite; animation-delay: 0.104s; }
.ring.el-30 { width:   0.00px; height:   0.00px; left: 160.00px; top: 160.00px; border-radius:   0.00px; animation: el-anim-30 2.5s linear infinite; animation-delay: 0.000s; }

/* Generated keyframes — for each ring perc = (30 - i) / 30,
   colors interpolate between palette stops + rotation 0deg → 180deg */
@keyframes el-anim-1  { 0%{border-color:rgb(247,247,247);transform:rotate(0deg)} 25%{border-color:rgb(8,121,8);transform:rotate(45deg)} 75%{border-color:rgb(121,8,247);transform:rotate(135deg)} 100%{border-color:rgb(247,247,247);transform:rotate(180deg)} }
@keyframes el-anim-2  { 0%{border-color:rgb(238,238,238);transform:rotate(0deg)} 25%{border-color:rgb(17,117,17);transform:rotate(45deg)} 75%{border-color:rgb(117,17,238);transform:rotate(135deg)} 100%{border-color:rgb(238,238,238);transform:rotate(180deg)} }
@keyframes el-anim-3  { 0%{border-color:rgb(229,229,229);transform:rotate(0deg)} 25%{border-color:rgb(26,113,26);transform:rotate(45deg)} 75%{border-color:rgb(113,26,229);transform:rotate(135deg)} 100%{border-color:rgb(229,229,229);transform:rotate(180deg)} }
@keyframes el-anim-4  { 0%{border-color:rgb(221,221,221);transform:rotate(0deg)} 25%{border-color:rgb(34,108,34);transform:rotate(45deg)} 75%{border-color:rgb(108,34,221);transform:rotate(135deg)} 100%{border-color:rgb(221,221,221);transform:rotate(180deg)} }
@keyframes el-anim-5  { 0%{border-color:rgb(212,212,212);transform:rotate(0deg)} 25%{border-color:rgb(43,104,43);transform:rotate(45deg)} 75%{border-color:rgb(104,43,212);transform:rotate(135deg)} 100%{border-color:rgb(212,212,212);transform:rotate(180deg)} }
@keyframes el-anim-6  { 0%{border-color:rgb(204,204,204);transform:rotate(0deg)} 25%{border-color:rgb(51,100,51);transform:rotate(45deg)} 75%{border-color:rgb(100,51,204);transform:rotate(135deg)} 100%{border-color:rgb(204,204,204);transform:rotate(180deg)} }
@keyframes el-anim-7  { 0%{border-color:rgb(195,195,195);transform:rotate(0deg)} 25%{border-color:rgb(60,96,60);transform:rotate(45deg)} 75%{border-color:rgb(96,60,195);transform:rotate(135deg)} 100%{border-color:rgb(195,195,195);transform:rotate(180deg)} }
@keyframes el-anim-8  { 0%{border-color:rgb(187,187,187);transform:rotate(0deg)} 25%{border-color:rgb(68,92,68);transform:rotate(45deg)} 75%{border-color:rgb(92,68,187);transform:rotate(135deg)} 100%{border-color:rgb(187,187,187);transform:rotate(180deg)} }
@keyframes el-anim-9  { 0%{border-color:rgb(178,178,178);transform:rotate(0deg)} 25%{border-color:rgb(77,87,77);transform:rotate(45deg)} 75%{border-color:rgb(87,77,178);transform:rotate(135deg)} 100%{border-color:rgb(178,178,178);transform:rotate(180deg)} }
@keyframes el-anim-10 { 0%{border-color:rgb(170,170,170);transform:rotate(0deg)} 25%{border-color:rgb(85,83,85);transform:rotate(45deg)} 75%{border-color:rgb(83,85,170);transform:rotate(135deg)} 100%{border-color:rgb(170,170,170);transform:rotate(180deg)} }
@keyframes el-anim-11 { 0%{border-color:rgb(161,161,161);transform:rotate(0deg)} 25%{border-color:rgb(94,79,94);transform:rotate(45deg)} 75%{border-color:rgb(79,94,161);transform:rotate(135deg)} 100%{border-color:rgb(161,161,161);transform:rotate(180deg)} }
@keyframes el-anim-12 { 0%{border-color:rgb(153,153,153);transform:rotate(0deg)} 25%{border-color:rgb(102,75,102);transform:rotate(45deg)} 75%{border-color:rgb(75,102,153);transform:rotate(135deg)} 100%{border-color:rgb(153,153,153);transform:rotate(180deg)} }
@keyframes el-anim-13 { 0%{border-color:rgb(144,144,144);transform:rotate(0deg)} 25%{border-color:rgb(111,71,111);transform:rotate(45deg)} 75%{border-color:rgb(71,111,144);transform:rotate(135deg)} 100%{border-color:rgb(144,144,144);transform:rotate(180deg)} }
@keyframes el-anim-14 { 0%{border-color:rgb(136,136,136);transform:rotate(0deg)} 25%{border-color:rgb(119,67,119);transform:rotate(45deg)} 75%{border-color:rgb(67,119,136);transform:rotate(135deg)} 100%{border-color:rgb(136,136,136);transform:rotate(180deg)} }
@keyframes el-anim-15 { 0%{border-color:rgb(127,127,127);transform:rotate(0deg)} 25%{border-color:rgb(128,63,128);transform:rotate(45deg)} 75%{border-color:rgb(63,128,127);transform:rotate(135deg)} 100%{border-color:rgb(127,127,127);transform:rotate(180deg)} }
@keyframes el-anim-16 { 0%{border-color:rgb(119,119,119);transform:rotate(0deg)} 25%{border-color:rgb(136,58,136);transform:rotate(45deg)} 75%{border-color:rgb(58,136,119);transform:rotate(135deg)} 100%{border-color:rgb(119,119,119);transform:rotate(180deg)} }
@keyframes el-anim-17 { 0%{border-color:rgb(110,110,110);transform:rotate(0deg)} 25%{border-color:rgb(145,54,145);transform:rotate(45deg)} 75%{border-color:rgb(54,145,110);transform:rotate(135deg)} 100%{border-color:rgb(110,110,110);transform:rotate(180deg)} }
@keyframes el-anim-18 { 0%{border-color:rgb(102,102,102);transform:rotate(0deg)} 25%{border-color:rgb(153,50,153);transform:rotate(45deg)} 75%{border-color:rgb(50,153,102);transform:rotate(135deg)} 100%{border-color:rgb(102,102,102);transform:rotate(180deg)} }
@keyframes el-anim-19 { 0%{border-color:rgb(93,93,93);transform:rotate(0deg)} 25%{border-color:rgb(162,46,162);transform:rotate(45deg)} 75%{border-color:rgb(46,162,93);transform:rotate(135deg)} 100%{border-color:rgb(93,93,93);transform:rotate(180deg)} }
@keyframes el-anim-20 { 0%{border-color:rgb(85,85,85);transform:rotate(0deg)} 25%{border-color:rgb(170,42,170);transform:rotate(45deg)} 75%{border-color:rgb(42,170,85);transform:rotate(135deg)} 100%{border-color:rgb(85,85,85);transform:rotate(180deg)} }
@keyframes el-anim-21 { 0%{border-color:rgb(76,76,76);transform:rotate(0deg)} 25%{border-color:rgb(179,38,179);transform:rotate(45deg)} 75%{border-color:rgb(38,179,76);transform:rotate(135deg)} 100%{border-color:rgb(76,76,76);transform:rotate(180deg)} }
@keyframes el-anim-22 { 0%{border-color:rgb(68,68,68);transform:rotate(0deg)} 25%{border-color:rgb(187,33,187);transform:rotate(45deg)} 75%{border-color:rgb(33,187,68);transform:rotate(135deg)} 100%{border-color:rgb(68,68,68);transform:rotate(180deg)} }
@keyframes el-anim-23 { 0%{border-color:rgb(59,59,59);transform:rotate(0deg)} 25%{border-color:rgb(196,29,196);transform:rotate(45deg)} 75%{border-color:rgb(29,196,59);transform:rotate(135deg)} 100%{border-color:rgb(59,59,59);transform:rotate(180deg)} }
@keyframes el-anim-24 { 0%{border-color:rgb(51,51,51);transform:rotate(0deg)} 25%{border-color:rgb(204,25,204);transform:rotate(45deg)} 75%{border-color:rgb(25,204,51);transform:rotate(135deg)} 100%{border-color:rgb(51,51,51);transform:rotate(180deg)} }
@keyframes el-anim-25 { 0%{border-color:rgb(42,42,42);transform:rotate(0deg)} 25%{border-color:rgb(213,21,213);transform:rotate(45deg)} 75%{border-color:rgb(21,213,42);transform:rotate(135deg)} 100%{border-color:rgb(42,42,42);transform:rotate(180deg)} }
@keyframes el-anim-26 { 0%{border-color:rgb(34,34,34);transform:rotate(0deg)} 25%{border-color:rgb(221,17,221);transform:rotate(45deg)} 75%{border-color:rgb(17,221,34);transform:rotate(135deg)} 100%{border-color:rgb(34,34,34);transform:rotate(180deg)} }
@keyframes el-anim-27 { 0%{border-color:rgb(25,25,25);transform:rotate(0deg)} 25%{border-color:rgb(230,13,230);transform:rotate(45deg)} 75%{border-color:rgb(13,230,25);transform:rotate(135deg)} 100%{border-color:rgb(25,25,25);transform:rotate(180deg)} }
@keyframes el-anim-28 { 0%{border-color:rgb(17,17,17);transform:rotate(0deg)} 25%{border-color:rgb(238,8,238);transform:rotate(45deg)} 75%{border-color:rgb(8,238,17);transform:rotate(135deg)} 100%{border-color:rgb(17,17,17);transform:rotate(180deg)} }
@keyframes el-anim-29 { 0%{border-color:rgb(8,8,8);transform:rotate(0deg)} 25%{border-color:rgb(247,4,247);transform:rotate(45deg)} 75%{border-color:rgb(4,247,8);transform:rotate(135deg)} 100%{border-color:rgb(8,8,8);transform:rotate(180deg)} }
@keyframes el-anim-30 { 0%{border-color:rgb(0,0,0);transform:rotate(0deg)} 25%{border-color:rgb(255,0,255);transform:rotate(45deg)} 75%{border-color:rgb(0,255,0);transform:rotate(135deg)} 100%{border-color:rgb(0,0,0);transform:rotate(180deg)} }

@media (max-width: 768px) {
  .ring-ornament { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ring { animation: none !important; }
}
</style>
