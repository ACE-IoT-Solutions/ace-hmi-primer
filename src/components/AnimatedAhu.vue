<script setup lang="ts">
import { useId } from "vue";
import type { LabSnapshot } from "../lib/lab";
defineProps<{ snapshot: LabSnapshot; paused: boolean }>();
const id = useId().replace(/[^a-zA-Z0-9-]/g, "");
const paint = (name: string) => `url(#${id}-${name})`;
</script>
<template>
  <div class="animated-ahu" :class="{ 'motion-paused': paused }">
    <div class="mimic-caption">
      <span>AHU-01 · EQUIPMENT GRAPHIC</span><span>3D / ANIMATED</span>
    </div>
    <svg
      viewBox="0 0 900 540"
      role="img"
      aria-label="Illustrative three-dimensional AHU cutaway with reflective casing, cooling coil, rotating fan, and animated airflow. Fan rotation and airflow animation follow the fan command, not measured movement or airflow."
    >
      <defs>
        <linearGradient :id="`${id}-case`" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#d6e1e9" />
          <stop offset=".28" stop-color="#7d95a9" />
          <stop offset=".5" stop-color="#bccbd5" />
          <stop offset="1" stop-color="#455a6a" />
        </linearGradient>
        <linearGradient :id="`${id}-top`" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#eef4f7" />
          <stop offset=".5" stop-color="#9dabb7" />
          <stop offset="1" stop-color="#526c81" />
        </linearGradient>
        <linearGradient :id="`${id}-duct`" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#314d6c" />
          <stop offset=".45" stop-color="#a8d2ef" />
          <stop offset=".52" stop-color="#6f98b8" />
          <stop offset="1" stop-color="#1a314a" />
        </linearGradient>
        <linearGradient :id="`${id}-coil`" x1="0" y1="0" x2="1" y2="0">
          <stop stop-color="#0063a2" />
          <stop offset=".35" stop-color="#c7f5ff" />
          <stop offset=".6" stop-color="#2c9cd9" />
          <stop offset="1" stop-color="#034b76" />
        </linearGradient>
        <linearGradient :id="`${id}-blade`" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#f7fcff" />
          <stop offset=".5" stop-color="#90acbf" />
          <stop offset="1" stop-color="#405a74" />
        </linearGradient>
        <radialGradient :id="`${id}-fan`">
          <stop stop-color="#526f83" />
          <stop offset=".75" stop-color="#142332" />
          <stop offset="1" stop-color="#6b8396" />
        </radialGradient>
        <radialGradient :id="`${id}-backdrop`">
          <stop stop-color="#243d51" />
          <stop offset="1" stop-color="#0c1723" />
        </radialGradient>
        <pattern
          :id="`${id}-fins`"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <rect width="8" height="8" fill="#213443" />
          <path d="M1 0V8M4 0V8" stroke="#91afbe" stroke-width="1" />
        </pattern>
      </defs>
      <rect width="900" height="540" :fill="paint('backdrop')" />
      <g opacity=".15" stroke="#91bdd5">
        <path
          v-for="n in 14"
          :key="n"
          :d="`M${n * 85 - 300} 540L${n * 60} 110`"
        />
        <path v-for="n in 7" :key="`h${n}`" :d="`M0 ${160 + n * 50}H900`" />
      </g>
      <ellipse cx="465" cy="415" rx="350" ry="38" fill="#000" opacity=".35" />
      <!-- Metal casing, perspective top and right faces, and internal cutaway. -->
      <path
        d="M140 173L211 119H721L650 173Z"
        :fill="paint('top')"
        stroke="#aebfcb"
        stroke-width="2"
      />
      <path
        d="M650 173L721 119V322L650 385Z"
        fill="#526c80"
        stroke="#91a6b6"
        stroke-width="2"
      />
      <rect
        x="140"
        y="173"
        width="510"
        height="212"
        rx="4"
        :fill="paint('case')"
        stroke="#bdced8"
        stroke-width="3"
      />
      <path
        d="M155 190H636V367H155Z"
        fill="#162635"
        stroke="#4c6476"
        stroke-width="4"
      />
      <path d="M155 190L184 170H657L636 190Z" fill="#e4f1f7" opacity=".2" />
      <path d="M155 346H636V367H155Z" fill="#566d7e" />
      <path d="M270 188V367M456 188V367" stroke="#96aeba" stroke-width="8" />
      <path
        d="M162 385V408H202V385M594 385V408H631V385"
        fill="#516b7d"
        stroke="#8eabb9"
      />
      <path
        d="M33 235H140V337H33Z"
        :fill="paint('duct')"
        stroke="#94b6cb"
        stroke-width="2"
      />
      <path d="M33 235L72 207H140V235Z" fill="#7195b0" />
      <path
        d="M650 236H812V337H650Z"
        :fill="paint('duct')"
        stroke="#94b6cb"
        stroke-width="2"
      />
      <path d="M650 236L688 208H850L812 236Z" fill="#6d94b4" />
      <path d="M812 236L850 208V307L812 337Z" fill="#2d536f" stroke="#779cb7" />
      <path
        d="M75 238V335M105 238V335M730 239V335M768 239V335"
        stroke="#bad8e9"
        stroke-width="3"
        opacity=".55"
      />
      <!-- Stylized airflow is command-driven illustration, not a flow sensor. -->
      <g
        class="air-stream"
        :class="{ 'air-commanded': snapshot.fanCommand }"
        stroke="#65d3ff"
        stroke-width="5"
        fill="none"
        stroke-dasharray="13 18"
        opacity=".75"
      >
        <path d="M42 273H815M42 292H815M42 311H815" />
      </g>
      <!-- Filter bank and chilled-water coil. -->
      <path
        d="M184 217L214 199L244 217V333L214 351L184 333Z"
        :fill="paint('fins')"
        stroke="#c0d2dd"
        stroke-width="2"
      />
      <path
        d="M194 222L211 213L228 224V326L211 335L194 326Z"
        fill="#9babc0"
        opacity=".3"
      />
      <path d="M308 217L343 197H414L383 217Z" fill="#94cde8" />
      <rect
        x="308"
        y="217"
        width="93"
        height="120"
        :fill="paint('fins')"
        stroke="#a3d8ed"
        stroke-width="2"
      />
      <path d="M401 217L414 197V315L401 337Z" fill="#32779b" />
      <path
        d="M327 217V147H391V217M327 337V391H391V337"
        :stroke="paint('coil')"
        stroke-width="13"
        fill="none"
        stroke-linejoin="round"
      />
      <path
        d="M325 265H386M325 292H386"
        :stroke="paint('coil')"
        stroke-width="8"
      />
      <circle
        cx="359"
        cy="147"
        r="14"
        fill="#1f6d9c"
        stroke="#97dfff"
        stroke-width="2"
      />
      <path
        d="M347 134L359 147L371 134M359 147V118"
        stroke="#73d6ff"
        stroke-width="5"
      />
      <!-- Fan housing and blades, intentionally driven by ON command. -->
      <rect
        x="490"
        y="212"
        width="123"
        height="133"
        rx="9"
        fill="#426d84"
        stroke="#b0c7d5"
        stroke-width="3"
      />
      <circle
        cx="551"
        cy="276"
        r="56"
        :fill="paint('fan')"
        stroke="#a5bfcc"
        stroke-width="5"
      />
      <g class="fan-rotor" :class="{ 'fan-commanded': snapshot.fanCommand }">
        <path
          v-for="angle in [0, 120, 240]"
          :key="angle"
          d="M551 276C514 272 506 249 528 239C549 233 559 255 551 276Z"
          :transform="`rotate(${angle} 551 276)`"
          :fill="paint('blade')"
          stroke="#aec7d7"
        />
        <circle
          cx="551"
          cy="276"
          r="12"
          fill="#bacbd6"
          stroke="#4c6a80"
          stroke-width="3"
        />
      </g>
      <circle
        cx="551"
        cy="276"
        r="52"
        fill="none"
        stroke="#b3ccd9"
        opacity=".35"
      />
      <path d="M614 293H648V333H614Z" :fill="paint('case')" stroke="#a8bdca" />
      <g fill="#d7e5ed">
        <circle
          v-for="x in [148, 277, 462, 644]"
          :key="x"
          :cx="x"
          cy="181"
          r="3"
        />
        <circle
          v-for="x in [148, 277, 462, 644]"
          :key="`b${x}`"
          :cx="x"
          cy="376"
          r="3"
        />
      </g>
      <!-- Real values remain readable; ornamental depth does not supply context. -->
      <g class="art-tag">
        <path d="M109 198V120H44" />
        <rect x="20" y="73" width="177" height="54" rx="5" />
        <text x="33" y="94">RETURN AIR</text>
        <text x="33" y="115" class="art-value">23.0 °C</text>
      </g>
      <g class="art-tag">
        <path d="M360 108V70" />
        <rect x="253" y="24" width="207" height="56" rx="5" />
        <text x="268" y="46">COOLING VALVE COMMAND</text>
        <text x="268" y="68" class="art-value">
          {{ snapshot.valveCommand }}%
        </text>
      </g>
      <g class="art-tag">
        <path d="M551 208V112H629" />
        <rect x="541" y="66" width="219" height="58" rx="5" />
        <text x="557" y="88">SUPPLY FAN COMMAND</text>
        <text x="557" y="112" class="art-value">
          {{ snapshot.fanCommand ? "ON" : "OFF" }}
        </text>
      </g>
      <g class="art-tag">
        <path d="M764 345V407" />
        <rect x="674" y="403" width="207" height="65" rx="5" />
        <text x="689" y="426">SUPPLY TEMPERATURE</text>
        <text x="689" y="452" class="art-value">
          {{ snapshot.actual.toFixed(1) }} °C
        </text>
      </g>
      <g class="art-tag">
        <path d="M551 347V420H461" />
        <rect x="319" y="407" width="231" height="59" rx="5" />
        <text x="334" y="430">SUPPLY FAN RUN PROOF</text>
        <text x="334" y="455" class="art-value">
          {{ snapshot.fanProof ? "ON" : "OFF" }}
        </text>
      </g>
    </svg>
    <p class="mimic-trust">
      {{
        snapshot.stale
          ? "SAT quality: STALE · last update 12 min ago · displayed temperature is retained"
          : "SAT quality: good · current teaching snapshot"
      }}
    </p>
    <p class="mimic-animation-basis">
      Animation source: fan ON command. Illustrated air movement is not measured
      airflow.
    </p>
  </div>
</template>
<style scoped>
.animated-ahu {
  background: #0c1723;
  color: #e8f1f7;
  overflow: hidden;
}
.mimic-caption {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem 1.2rem;
  font-size: 0.875rem;
  font-weight: 700;
  background: #192a38;
  border-bottom: 1px solid #536d7e;
}
svg {
  display: block;
  width: 100%;
  height: auto;
}
.art-tag path {
  stroke: #a9c7d9;
  stroke-width: 1.5;
  fill: none;
}
.art-tag rect {
  fill: #142b3c;
  stroke: #7ba7bf;
  stroke-width: 1.3;
}
.art-tag text {
  font:
    500 16px "Source Sans 3",
    system-ui;
  fill: #e1eef5;
}
.art-tag .art-value {
  font-size: 24px;
  font-weight: 700;
  fill: #b0edff;
}
.fan-rotor {
  transform-origin: 551px 276px;
}
.fan-commanded {
  animation: fan-rotation 1.4s linear infinite;
}
.air-commanded {
  animation: air-movement 1.1s linear infinite;
}
.motion-paused .fan-commanded,
.motion-paused .air-stream {
  animation-play-state: paused;
}
.mimic-trust,
.mimic-animation-basis {
  padding: 0.7rem 1.2rem;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  background: #192a38;
}
.mimic-animation-basis {
  background: #10212f;
  color: #becfda;
  border-top: 1px solid #3c5264;
}
@keyframes fan-rotation {
  to {
    transform: rotate(360deg);
  }
}
@keyframes air-movement {
  to {
    stroke-dashoffset: -62;
  }
}
@media (prefers-reduced-motion: reduce) {
  .fan-commanded,
  .air-stream {
    animation: none;
  }
}
</style>
