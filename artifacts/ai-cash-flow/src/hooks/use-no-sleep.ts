/**
 * useNoSleep — keeps the screen on during long operations (uploads, etc.)
 *
 * Strategy:
 *  1. Screen Wake Lock API (Chrome/Edge/Safari 16.4+) — native, battery-friendly
 *  2. Hidden video loop fallback (older iOS) — plays a 1-frame silent MP4 in a loop
 *
 * Call `enable()` inside a user-gesture handler (tap, click).
 * Call `disable()` when the operation is complete.
 */

// Tiny 1-frame silent MP4 (base64) — used as fallback for iOS < 16.4
const SILENT_MP4_B64 =
  "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs5t" +
  "ZGF0AAACrAYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0MiByMjM4OSA5NTZjOGQ4IC0g" +
  "SC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNCAtIGh0dHA6Ly93d3cudmln" +
  "ZW9sYW4ub3JnL3g2NDQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBh" +
  "bmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVk" +
  "X3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFk" +
  "em9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiBzY2VuZWN1dD00MCBpbnRy" +
  "YV9yZWZyZXNoPTAgcmNfbG9va2FoZWFkPTQwIHJjPWNyZiBtYnRyZWU9MSBjcmY9MjMuMCBxY29tcD0w" +
  "LjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40MCBhcT0xOjEuMDAAgAAAAC9o" +
  "ZWF2YzEAAR//hBf8AAAAAAAAAAAAAAAAAAAAAAAAAgAAABRNT1YCAAAB9G1vb3YAAABsbXZoZAAAAAAAAA" +
  "AAAQIDAAADIAAB5OAAAAEBAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAA" +
  "ACAAAAAAAAAAAAAAAAAAAAJAAAAAAAACUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAgA" +
  "AAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAQAAAQAAAQAAAQA" +
  "AAQAAAQAAAQAAAQAAAQAA";

export class NoSleepController {
  private wakeLock: WakeLockSentinel | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private enabled = false;

  async enable(): Promise<void> {
    if (this.enabled) return;
    this.enabled = true;

    // Try Screen Wake Lock API first
    if ("wakeLock" in navigator) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request("screen");
        // Re-acquire on visibility change (lock released on page hide)
        document.addEventListener("visibilitychange", this._onVisibility);
        return;
      } catch {
        // Fall through to video fallback
      }
    }

    // Fallback: hidden looping video (keeps iOS from sleeping)
    this._enableVideo();
  }

  disable(): void {
    if (!this.enabled) return;
    this.enabled = false;
    document.removeEventListener("visibilitychange", this._onVisibility);

    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }

    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.remove();
      this.videoEl = null;
    }
  }

  private _enableVideo(): void {
    if (this.videoEl) return;
    const v = document.createElement("video");
    v.setAttribute("loop", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("muted", "");
    v.style.cssText = "position:fixed;top:-1px;left:-1px;width:1px;height:1px;opacity:0;pointer-events:none";
    v.src = SILENT_MP4_B64;
    document.body.appendChild(v);
    v.play().catch(() => {});
    this.videoEl = v;
  }

  private _onVisibility = async () => {
    if (document.visibilityState === "visible" && this.enabled) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request("screen");
      } catch { /* non-fatal */ }
    }
  };
}
