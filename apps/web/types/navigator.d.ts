// iOS Safari exposes a non-standard `navigator.standalone` to detect when the
// PWA is launched from the home screen. Augment the type so we don't need casts.
interface Navigator {
  standalone?: boolean;
}
