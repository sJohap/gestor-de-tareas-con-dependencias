<template>
  <div class="ambient" aria-hidden="true">
    <video
      class="video"
      src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261005_182346_a590ff3b-72e5-41ce-8f69-a8c823eaecaa.mp4"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
    ></video>
    <div class="shade shade-x"></div>
    <div class="shade shade-y"></div>
    <div class="shade shade-corner"></div>
  </div>
</template>

<style scoped>
.ambient {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #03080b;
  pointer-events: none;
}

.video,
.shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.video {
  object-fit: cover;
  object-position: 50% 40%;
}

.shade-x {
  background: linear-gradient(
    90deg,
    rgb(3 8 11 / 68.3%) 0%,
    rgb(3 8 11 / 59.5%) 20%,
    rgb(3 8 11 / 45.8%) 40%,
    rgb(3 8 11 / 22.1%) 60%,
    rgb(3 8 11 / 3.9%) 80%,
    rgb(3 8 11 / 5.4%) 100%
  );
}

.shade-y {
  background: linear-gradient(
    180deg,
    rgb(3 8 11 / 6%) 0%,
    rgb(3 8 11 / 2.3%) 20%,
    rgb(3 8 11 / 15.2%) 40%,
    rgb(3 8 11 / 30%) 60%,
    rgb(3 8 11 / 39.4%) 80%,
    rgb(3 8 11 / 63.2%) 100%
  );
}

.shade-corner {
  background: radial-gradient(ellipse 93.8% 41.3% at 0% 100%, #03080b, transparent);
}

@media (min-aspect-ratio: 16/9) {
  .video {
    object-position: 50% 24%;
  }
}

@media (max-width: 649.98px), (max-height: 500px) {
  .video {
    object-position: 63% 50%;
  }

  .shade-x {
    background: linear-gradient(90deg, rgb(3 8 11 / 42%) 0%, rgb(3 8 11 / 8%) 70%, transparent 100%);
  }

  .shade-y {
    background: linear-gradient(180deg, rgb(3 8 11 / 8%) 0%, rgb(3 8 11 / 18%) 45%, rgb(3 8 11 / 72%) 100%);
  }

  .shade-corner {
    display: none;
  }
}

@media (max-height: 500px) and (min-aspect-ratio: 1/1) and (min-width: 650px) {
  .video {
    object-position: 50% 30%;
  }
}
</style>
